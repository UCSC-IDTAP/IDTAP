import { expect, test } from 'vitest';
import { Piece, Phrase, Trajectory, Raga } from '../model';
import { Instrument } from '@shared/enums';

// Helper to build a piece with two tracks, second empty
function buildPieceWithEmptyTrack() {
  const raga = new Raga();
  const t1 = new Trajectory({ durTot: 1 });
  const p1 = new Phrase({ trajectories: [t1], raga });
  return new Piece({
    phraseGrid: [[p1], []],
    instrumentation: [Instrument.Sitar, Instrument.Sitar],
    raga,
  });
}

test('durTotFromPhrases creates silent phrase for empty track', () => {
  const piece = buildPieceWithEmptyTrack();
  piece.durTotFromPhrases();
  expect(piece.phraseGrid[1].length).toBe(1);
  const silentTraj = piece.phraseGrid[1][0].trajectories[0];
  expect(silentTraj.id).toBe(12);
  expect(silentTraj.durTot).toBeCloseTo(1);
});

// Helper for NaN trajectory cleanup
function buildPieceWithNaNTraj() {
  const raga = new Raga();
  const piece = new Piece({ raga, instrumentation: [Instrument.Sitar] });
  const good = new Trajectory({ durTot: 1 });
  const bad = new Trajectory({ durTot: NaN });
  const phrase = new Phrase({ trajectories: [good, bad], raga });
  // force NaN durTot before cleaning
  phrase.durTotFromTrajectories();
  piece.phraseGrid[0].push(phrase);
  return { piece, phrase };
}

test('durArrayFromPhrases removes NaN trajectories', () => {
  const { piece, phrase } = buildPieceWithNaNTraj();
  expect(phrase.durTot).toBeNaN();
  piece.durArrayFromPhrases();
  expect(phrase.trajectories.length).toBe(1);
  expect(phrase.durTot).toBeCloseTo(1);
});
