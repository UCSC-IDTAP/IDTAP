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

test('Group constructor throws on non adjacent trajectories', () => {
  const t1 = new Trajectory({ num: 0, phraseIdx: 0, pitches: [new Pitch()] });
  const t2 = new Trajectory({ num: 2, phraseIdx: 0, pitches: [new Pitch({ swara: 'r' })] });
  expect(() => new Group({ trajectories: [t1, t2] })).toThrow('Trajectories are not adjacent');
});

test('addTraj enforces adjacency', () => {
  const t1 = new Trajectory({ num: 0, phraseIdx: 0, pitches: [new Pitch()] });
  const t2 = new Trajectory({ num: 1, phraseIdx: 0, pitches: [new Pitch({ swara: 'r' })] });
  const g = new Group({ trajectories: [t1, t2] });
  const t3 = new Trajectory({ num: 3, phraseIdx: 0, pitches: [new Pitch({ swara: 'g' })] });
  expect(() => g.addTraj(t3)).toThrow('Trajectories are not adjacent');
});

test('Group minFreq and maxFreq use trajectory ranges', () => {
  const low = new Trajectory({ num: 0, phraseIdx: 0, pitches: [new Pitch({ fundamental: 200 })] });
  const high = new Trajectory({ num: 1, phraseIdx: 0, pitches: [new Pitch({ fundamental: 400 })] });
  const g = new Group({ trajectories: [low, high] });
  expect(g.minFreq).toBeCloseTo(low.minFreq);
  expect(g.maxFreq).toBeCloseTo(high.maxFreq);
});
