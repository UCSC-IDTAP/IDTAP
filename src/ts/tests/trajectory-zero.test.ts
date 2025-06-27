import { expect, test } from 'vitest';
import { Trajectory, Pitch } from '../model';

// Ensure zero-duration segments are removed during construction

test('constructor removes zero-duration segments', () => {
  const p0 = new Pitch();
  const p1 = new Pitch({ swara: 1 });
  const p2 = new Pitch({ swara: 2 });

  const traj = new Trajectory({
    id: 7,
    pitches: [p0, p1, p2],
    durArray: [0.3, 0, 0.7]
  });

  expect(traj.durArray).toEqual([0.3, 0.7]);
  expect(traj.pitches.length).toBe(2);
  expect(traj.pitches[0]).toBe(p0);
  // pitch following the zero-duration segment should be removed
  expect(traj.pitches[1]).toBe(p1);
  expect(traj.freqs.length).toBe(2);
  expect(traj.logFreqs.length).toBe(2);
});
