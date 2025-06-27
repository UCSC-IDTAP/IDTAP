import { expect, test, vi } from 'vitest';
import { Trajectory, Pitch } from '../model';

/**
 * Ensure that a trajectory with id 6 generates a default durArray
 * and that id6() computes frequencies correctly.
 */
test('id6 default durArray and console log path', () => {
  const p0 = new Pitch();
  const p1 = new Pitch({ swara: 1 });
  const p2 = new Pitch({ swara: 2 });
  const pitches = [p0, p1, p2];

  const traj = new Trajectory({ id: 6, pitches, durArray: undefined });

  const expectedDur = Array(pitches.length - 1).fill(1 / (pitches.length - 1));
  expect(traj.durArray).toEqual(expectedDur);

  const freq = traj.id6(0.5);
  expect(typeof freq).toBe('number');
  expect(freq).toBeGreaterThan(0);

  const spy = vi.spyOn(console, 'log').mockImplementation(() => {});
  expect(() => traj.id6(-0.1)).toThrow();
  expect(spy).toHaveBeenCalled();
  spy.mockRestore();
});
