import { expect, test } from 'vitest';
import { readFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import { Piece, Phrase, Trajectory, Pitch, Raga, Group, Articulation, Chikari } from '@model';
import { Meter } from '@/js/meter';
import { Instrument } from '@shared/enums';

const __dirname = dirname(fileURLToPath(import.meta.url));
const pieceData = JSON.parse(readFileSync(join(__dirname, 'fixtures/serialization_test.json'), 'utf-8'));

function buildSimplePiece() {
  const raga = new Raga({ fundamental: 240 });
  const art = { '0.00': new Articulation({ strokeNickname: 'da' }) };
  const t1 = new Trajectory({ num: 0, pitches: [new Pitch()], durTot: 0.5, articulations: art });
  const t2 = new Trajectory({ num: 1, pitches: [new Pitch({ swara: 'r', raised: false })], durTot: 0.5, articulations: art });
  const group = new Group({ trajectories: [t1, t2] });
  const p1 = new Phrase({ trajectories: [t1, t2], raga });
  p1.groupsGrid[0].push(group);
  const t3 = new Trajectory({ num: 0, pitches: [new Pitch()], durTot: 1 });
  const p2 = new Phrase({ trajectories: [t3], raga });
  const piece = new Piece({ phrases: [p1, p2], raga, instrumentation: [Instrument.Sitar] });
  const meter = new Meter({ startTime: 0, tempo: 60 });
  return { piece, p1, p2, t1, t2, t3, group, meter };
}

function buildVocalPiece() {
  const raga = new Raga({ fundamental: 240 });
  const art = { '0.00': new Articulation({ strokeNickname: 'da' }) };
  const t1 = new Trajectory({ num: 0, pitches: [new Pitch()], durTot: 0.5, articulations: art });
  t1.addConsonant('ka');
  t1.updateVowel('a');
  t1.addConsonant('ga', false);
  const t2 = new Trajectory({ num: 1, pitches: [new Pitch({ swara: 'r', raised: false })], durTot: 0.5, articulations: art });
  t2.updateVowel('i');
  const p1 = new Phrase({ trajectories: [t1, t2], raga });
  p1.chikaris['0.25'] = new Chikari({});
  const p2 = new Phrase({ trajectories: [new Trajectory({ num: 0, pitches: [new Pitch()], durTot: 1 })], raga });
  const piece = new Piece({
    phrases: [p1, p2],
    raga,
    instrumentation: [Instrument.Vocal_M],
    sectionStarts: [0, 1],
  });
  const meter = new Meter({ startTime: 0, tempo: 60 });
  piece.addMeter(meter);
  return { piece, meter };
}

test('Piece serialization from fixture', () => {
  const piece = Piece.fromJSON(pieceData);
  const json = piece.toJSON();
  const copy = Piece.fromJSON(json);
  expect(copy.toJSON()).toEqual(json);
});

test('Piece method coverage', () => {
  const { piece, p1, p2, t1, t2, t3, group, meter } = buildSimplePiece();

  expect(piece.phrases.length).toBe(2);
  expect(piece.durArray).toEqual([0.5, 0.5]);
  expect(piece.sectionStarts).toEqual([0]);
  expect(piece.trajIdxs.length).toBeGreaterThan(0);
  expect(piece.trajIdxsGrid[0]).toEqual(piece.trajIdxs);

  expect(piece.chikariFreqs(0)).toEqual([piece.raga.fundamental * 2, piece.raga.fundamental * 4]);
  piece.updateFundamental(300);
  expect(piece.raga.fundamental).toBe(300);
  expect(p1.trajectories[0].pitches[0].fundamental).toBe(300);
  piece.putRagaInPhrase();
  expect(p1.raga).toBe(piece.raga);

  piece.addMeter(meter);
  expect(piece.meters.length).toBe(1);
  piece.removeMeter(meter);
  expect(piece.meters.length).toBe(0);

  expect(piece.durStarts()).toEqual([0, 1]);
  expect(piece.trajStartTimes()).toEqual([0, 0.5, 1]);
  expect(piece.trackFromTraj(t2)).toBe(0);
  expect(piece.trackFromTrajUId(t2.uniqueId!)).toBe(0);
  expect(piece.phraseFromUId(p1.uniqueId)).toBe(p1);
  expect(piece.trackFromPhraseUId(p2.uniqueId)).toBe(0);

  expect(piece.allGroups().length).toBe(1);
  expect(piece.pIdxFromGroup(group)).toBe(0);

  const allPitches = piece.allPitches();
  expect(allPitches.length).toBe(3);
  const allNums = piece.allPitches({ pitchNumber: true }) as number[];
  expect(allNums.length).toBe(3);
  expect(piece.highestPitchNumber).toBe(Math.max(...allNums));
  expect(piece.lowestPitchNumber).toBe(Math.min(...allNums));

  expect(piece.allTrajectories().length).toBe(3);
  expect(piece.trajFromTime(0.25, 0)).toBe(t1);
  expect(piece.trajFromTime(0.75, 0)).toBe(t2);
  expect(piece.trajFromTime(1.2, 0)).toBe(t3);
  expect(piece.trajFromUId(t1.uniqueId!, 0)).toBe(t1);
  expect(piece.phraseFromTime(1.1, 0)).toBe(p2);
  expect(piece.phraseIdxFromTime(1.1, 0)).toBe(1);

  const chunks = piece.chunkedTrajs(0, 1);
  expect(chunks[0].length).toBe(2);
  expect(chunks[1].length).toBe(1);

  const bols = piece.allDisplayBols();
  expect(bols.length).toBeGreaterThan(0);
  expect(piece.chunkedDisplayBols(0, 1)[0].length).toBe(bols.filter(b => b.time < 1).length);

  const dur = piece.durationsOfFixedPitches();
  expect(Object.keys(dur).length).toBeGreaterThan(0);
  const prop = piece.proportionsOfFixedPitches();
  expect(Object.keys(prop)).toEqual(Object.keys(dur));

  expect(piece.mostRecentTraj(0.6, 0)).toBeInstanceOf(Trajectory);
  expect(piece.sIdxFromPIdx(1)).toBe(0);
});

test('Piece display and sections', () => {
  const { piece, meter } = buildVocalPiece();
  expect(piece.sections.length).toBe(2);
  expect(piece.sectionsGrid[0].length).toBe(2);

  const vowels = piece.allDisplayVowels();
  expect(vowels.length).toBeGreaterThan(0);
  expect(piece.chunkedDisplayVowels(0, 1)[0].length).toBe(vowels.filter(v => v.time < 1).length);

  const cons = piece.allDisplayEndingConsonants();
  expect(cons.length).toBeGreaterThan(0);
  expect(piece.chunkedDisplayConsonants(0, 1)[0].length).toBe(cons.filter(c => c.time < 1).length);

  const chiks = piece.allDisplayChikaris();
  expect(chiks.length).toBeGreaterThan(0);
  expect(piece.chunkedDisplayChikaris(0, 1)[0].length).toBe(chiks.filter(c => c.time < 1).length);

  const pid = meter.allPulses[0].uniqueId;
  expect(piece.pulseFromId(pid)).toBe(meter.allPulses[0]);
});
