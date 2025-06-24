import { expect, test } from 'vitest';
import { Group, Trajectory, Pitch } from '../classes';

test('construct group and access pitches', () => {
  const t0 = new Trajectory({ num: 0 });
  const t1 = new Trajectory({ num: 1 });
  const g = new Group({ trajectories: [t0, t1] });
  expect(g.trajectories.length).toBe(2);
  expect(g.trajectories[0].num).toBe(0);
  expect(g.allPitches().length).toBe(2);
  expect(g.allPitches(false).length).toBe(1);
  expect(g.minFreq).toBeCloseTo(t0.minFreq);
  expect(g.maxFreq).toBeCloseTo(t1.maxFreq);
});

test('addTraj maintains adjacency', () => {
  const t0 = new Trajectory({ num: 0 });
  const t1 = new Trajectory({ num: 1 });
  const g = new Group({ trajectories: [t0, t1] });
  const t2 = new Trajectory({ num: 2 });
  g.addTraj(t2);
  expect(g.trajectories.length).toBe(3);
  expect(g.trajectories[2]).toBe(t2);
});
