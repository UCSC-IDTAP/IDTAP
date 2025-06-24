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
