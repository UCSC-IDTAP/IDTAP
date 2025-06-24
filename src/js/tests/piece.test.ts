import { expect, test } from 'vitest';
import { Piece, Raga, Phrase, Trajectory } from '../classes';
import { Instrument } from '@shared/enums';

test('default piece', () => {
  const piece = new Piece({});
  expect(piece.raga).toBeInstanceOf(Raga);
  expect(piece.durTot).toBe(1);
  expect(piece.phrases).toEqual([]);
  expect(piece.instrumentation).toEqual([Instrument.Sitar]);
});

test('update fundamental propagates', () => {
  const traj = new Trajectory({ num: 0 });
  const phrase = new Phrase({ trajectories: [traj] });
  const piece = new Piece({ phrases: [phrase] });
  piece.updateFundamental(440);
  expect(piece.raga.fundamental).toBe(440);
  expect(phrase.trajectories[0].pitches[0].frequency).toBeCloseTo(440);
});

test('time lookups and pitch summaries', () => {
  const t0 = new Trajectory({ num: 0 });
  const t1 = new Trajectory({ num: 1 });
  const p0 = new Phrase({ trajectories: [t0, t1] });
  const t2 = new Trajectory({ num: 2 });
  const p1 = new Phrase({ trajectories: [t2] });
  const piece = new Piece({ phrases: [p0, p1] });
  expect(piece.durStarts()).toEqual([0, 2]);
  expect(piece.trajStartTimes()).toEqual([0, 1, 2]);
  expect(piece.trajFromTime(0.5, 0)).toBe(t0);
  expect(piece.trajFromTime(1.5, 0)).toBe(t1);
  expect(piece.trajFromTime(2.1, 0)).toBe(t2);
  expect(piece.phraseFromTime(2.2, 0)).toBe(p1);
  expect(piece.phraseIdxFromTime(2.2, 0)).toBe(1);
  expect(piece.allTrajectories().length).toBe(3);
  expect(piece.chikariFreqs(0)).toEqual([piece.raga.fundamental * 2, piece.raga.fundamental * 4]);
  expect(piece.durationsOfFixedPitches()).toEqual({ 0: 3 });
  expect(piece.proportionsOfFixedPitches()).toEqual({ 0: 1 });
  expect(piece.highestPitchNumber).toBe(0);
  expect(piece.lowestPitchNumber).toBe(0);
  const json = piece.toJSON();
  expect(json.durTot).toBe(piece.durTot);
  expect(json.phraseGrid[0].length).toBe(2);
});
