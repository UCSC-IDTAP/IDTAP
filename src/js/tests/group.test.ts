import { expect, test } from 'vitest';
import { Group, Trajectory, Pitch } from '@model';

test('Group basics', () => {
  const t1 = new Trajectory({ num: 0, phraseIdx: 0, pitches: [new Pitch()] });
  const t2 = new Trajectory({ num: 1, phraseIdx: 0, pitches: [new Pitch({swara:'r'})] });
  const g = new Group({ trajectories: [t1, t2] });
  expect(g.testForAdjacency()).toBe(true);
  expect(t1.groupId).toBe(g.id);
  expect(typeof g.minFreq).toBe('number');
  const t3 = new Trajectory({ num: 2, phraseIdx: 0, pitches: [new Pitch({swara:'g'})] });
  g.addTraj(t3);
  expect(g.trajectories.length).toBe(3);
  const json = g.toJSON();
  const copy = Group.fromJSON(json);
  expect(copy.trajectories.length).toBe(3);
});
