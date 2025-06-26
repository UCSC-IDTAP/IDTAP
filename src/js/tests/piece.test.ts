import { expect, test } from 'vitest';
import { Piece, Phrase, Trajectory, Pitch, Raga, initSecCategorization } from '../classes';
import { Meter } from '../meter';
import { Instrument } from '@shared/enums';

function buildSimplePiece(): Piece {
  const raga = new Raga();
  const t1 = new Trajectory({ id: 0, pitches: [new Pitch()], durTot: 1 });
  const t2 = new Trajectory({ id: 12, pitches: [new Pitch()], durTot: 1 });
  const p1 = new Phrase({ trajectories: [t1], durTot: 1, raga });
  const p2 = new Phrase({ trajectories: [t2], durTot: 1, raga });
  const m1 = new Meter({ hierarchy: [1], tempo: 60, startTime: 0 });
  const m2 = new Meter({ hierarchy: [1], tempo: 60, startTime: 1 });
  const piece = new Piece({
    phrases: [p1, p2],
    raga,
    meters: [m1, m2],
    instrumentation: [Instrument.Sitar],
  });
  return piece;
}

// realignPitches, setDurTot, updateStartTimes

test('realignPitches and setDurTot', () => {
  const piece = buildSimplePiece();
  // mangle pitch ratios
  piece.phrases[0].trajectories[0].pitches[0].ratios = [1];
  piece.realignPitches();
  expect(piece.phrases[0].trajectories[0].pitches[0].ratios[0]).toBe(
    piece.raga.stratifiedRatios[0]
  );

  // extend piece duration using silent trajectory
  piece.setDurTot(3);
  expect(piece.durTot).toBe(3);
  expect(piece.durArrayGrid[0][0]).toBeCloseTo(1 / 3);
  expect(piece.phrases[1].trajectories[0].durTot).toBe(2);
  expect(piece.phrases[1].startTime).toBeCloseTo(1);
});

// durTotFromPhrases, durArrayFromPhrases, cleanUpSectionCategorization

test('dur calculations and cleanUpSectionCategorization', () => {
  const piece = buildSimplePiece();

  // change first phrase duration
  piece.phrases[0].trajectories[0].durTot = 2;
  piece.phrases[0].durTotFromTrajectories();
  piece.durTotFromPhrases();
  expect(piece.durTot).toBe(3);

  piece.durArrayFromPhrases();
  expect(piece.durArrayGrid[0]).toEqual([2 / 3, 1 / 3]);

  // error when durTot undefined
  piece.phrases[0].durTot = undefined as unknown as number;
  expect(() => piece.durArrayFromPhrases()).toThrow();

  // cleanUpSectionCategorization
  const c = initSecCategorization();
  // remove fields to force defaults
  // @ts-ignore
  delete c['Improvisation'];
  // @ts-ignore
  delete c['Other'];
  // @ts-ignore
  delete c['Top Level'];
  c['Composition Type']['Bandish'] = true;
  piece.cleanUpSectionCategorization(c);
  expect(c['Improvisation']).toBeDefined();
  expect(c['Other']).toBeDefined();
  expect(c['Top Level']).toBe('Composition');
});

// phrase divs, display sargam, and meters

test('display helpers and meters', () => {
  const piece = buildSimplePiece();
  const divs = piece.allPhraseDivs();
  expect(divs.length).toBe(1);
  expect(divs[0].time).toBeCloseTo(1);
  const divChunks = piece.chunkedPhraseDivs(0, 1);
  expect(divChunks.length).toBe(2);
  expect(divChunks[0].length).toBe(0);
  expect(divChunks[1].length).toBe(1);

  const sargam = piece.allDisplaySargam();
  expect(sargam[0].sargam).toBeDefined();
  const sargamChunks = piece.chunkedDisplaySargam(0, 1);
  expect(sargamChunks.length).toBe(2);
  expect(sargamChunks.map(c => c.length).reduce((a,b) => a+b, 0)).toBe(sargam.length);

  const meterChunks = piece.chunkedMeters(1);
  expect(meterChunks.length).toBe(2);
  expect(meterChunks[0][0].startTime).toBe(0);
  expect(meterChunks[1][0].startTime).toBe(1);

  const badMeter = new Meter({ hierarchy: [1], tempo: 60, startTime: 0.5 });
  expect(() => piece.addMeter(badMeter)).toThrow();
});
