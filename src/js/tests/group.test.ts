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

test('Group minFreq and maxFreq handle multiple trajectories', () => {
  const t1 = new Trajectory({ num: 0, phraseIdx: 0, pitches: [new Pitch({ fundamental: 200 })] });
  const t2 = new Trajectory({ num: 1, phraseIdx: 0, pitches: [new Pitch({ fundamental: 250 })] });
  const t3 = new Trajectory({ num: 2, phraseIdx: 0, pitches: [new Pitch({ fundamental: 400 })] });
  const g = new Group({ trajectories: [t1, t2, t3] });
  expect(g.minFreq).toBeCloseTo(t1.minFreq);
  expect(g.maxFreq).toBeCloseTo(t3.maxFreq);
});

test('Group allPitches removes repeated notes when repetition=false', () => {
  const p1 = new Pitch({ swara: 'sa' });
  const t1 = new Trajectory({ num: 0, phraseIdx: 0, pitches: [p1] });
  const t2 = new Trajectory({ num: 1, phraseIdx: 0, pitches: [new Pitch({ swara: 'sa' })] });
  const g = new Group({ trajectories: [t1, t2] });
  expect(g.allPitches(false)).toEqual([p1]);
});

test('Group constructor rejects trajectories from different phrases', () => {
  const t1 = new Trajectory({ num: 0, phraseIdx: 0, pitches: [new Pitch()] });
  const t2 = new Trajectory({ num: 1, phraseIdx: 1, pitches: [new Pitch({ swara: 'r' })] });
  // phraseIdx is not set via constructor, so assign explicitly
  t1.phraseIdx = 0;
  t2.phraseIdx = 1;
  expect(() => new Group({ trajectories: [t1, t2] })).toThrow('Trajectories are not adjacent');
});

test('Group allPitches preserves repeats when repetition=true', () => {
  const p1 = new Pitch({ swara: 'sa' });
  const p2 = new Pitch({ swara: 'sa' });
  const t1 = new Trajectory({ num: 0, phraseIdx: 0, pitches: [p1] });
  const t2 = new Trajectory({ num: 1, phraseIdx: 0, pitches: [p2] });
  const g = new Group({ trajectories: [t1, t2] });
  expect(g.allPitches(true)).toEqual([p1, p2]);
});

test('testForAdjacency false for trajectories from different phrases', () => {
  const t1 = new Trajectory({ num: 0, phraseIdx: 0, pitches: [new Pitch()] });
  const t2 = new Trajectory({ num: 1, phraseIdx: 0, pitches: [new Pitch({ swara: 'r' })] });
  const g = new Group({ trajectories: [t1, t2] });
  t2.phraseIdx = 1;
  expect(g.testForAdjacency()).toBe(false);
});

test('addTraj updates groupId and keeps adjacency', () => {
  const t1 = new Trajectory({ num: 0, phraseIdx: 0, pitches: [new Pitch()] });
  const t2 = new Trajectory({ num: 1, phraseIdx: 0, pitches: [new Pitch({ swara: 'r' })] });
  const g = new Group({ trajectories: [t1, t2] });
  const t3 = new Trajectory({ num: 2, phraseIdx: 0, pitches: [new Pitch({ swara: 'g' })] });
  g.addTraj(t3);
  expect(t3.groupId).toBe(g.id);
  expect(g.testForAdjacency()).toBe(true);
});

test('allPitches(false) collapses only sequential duplicates', () => {
  const p1 = new Pitch({ swara: 'sa' });
  const p2 = new Pitch({ swara: 'sa' });
  const p3 = new Pitch({ swara: 're' });
  const p4 = new Pitch({ swara: 'sa' });
  const t1 = new Trajectory({ num: 0, phraseIdx: 0, pitches: [p1] });
  const t2 = new Trajectory({ num: 1, phraseIdx: 0, pitches: [p2] });
  const t3 = new Trajectory({ num: 2, phraseIdx: 0, pitches: [p3] });
  const t4 = new Trajectory({ num: 3, phraseIdx: 0, pitches: [p4] });
  const g = new Group({ trajectories: [t1, t2, t3, t4] });
  expect(g.allPitches(false)).toEqual([p1, p3, p4]);
});

test('testForAdjacency returns false when a trajectory phraseIdx differs', () => {
  const t1 = new Trajectory({ num: 0, phraseIdx: 0, pitches: [new Pitch()] });
  const t2 = new Trajectory({ num: 1, phraseIdx: 0, pitches: [new Pitch()] });
  const g = new Group({ trajectories: [t1, t2] });
  const t3 = new Trajectory({ num: 2, phraseIdx: 1, pitches: [new Pitch()] });
  t3.phraseIdx = 1;
  g.trajectories.push(t3); // bypass addTraj
  expect(g.testForAdjacency()).toBe(false);
});

test('addTraj updates groupId and maintains sorted adjacency', () => {
  const t1 = new Trajectory({ num: 1, phraseIdx: 0, pitches: [new Pitch()] });
  const t2 = new Trajectory({ num: 2, phraseIdx: 0, pitches: [new Pitch({ swara: 'r' })] });
  const g = new Group({ trajectories: [t1, t2] });
  const t0 = new Trajectory({ num: 0, phraseIdx: 0, pitches: [new Pitch({ swara: 'g' })] });
  g.addTraj(t0);
  expect(t0.groupId).toBe(g.id);
  expect(g.trajectories.map(tr => tr.num)).toEqual([0, 1, 2]);
  expect(g.testForAdjacency()).toBe(true);
});

test('constructor throws when a trajectory lacks num', () => {
  const good = new Trajectory({ num: 0, phraseIdx: 0, pitches: [new Pitch()] });
  const bad = new Trajectory({ phraseIdx: 0, pitches: [new Pitch()] });
  expect(() => new Group({ trajectories: [good, bad] })).toThrow('Trajectory must have a num');
});

test('addTraj throws when trajectory lacks num', () => {
  const t1 = new Trajectory({ num: 0, phraseIdx: 0, pitches: [new Pitch()] });
  const t2 = new Trajectory({ num: 1, phraseIdx: 0, pitches: [new Pitch()] });
  const g = new Group({ trajectories: [t1, t2] });
  const bad = new Trajectory({ phraseIdx: 0, pitches: [new Pitch()] });
  expect(() => g.addTraj(bad)).toThrow('Trajectory must have a num');
});

test('testForAdjacency throws when a trajectory num is undefined', () => {
  const t1 = new Trajectory({ num: 0, phraseIdx: 0, pitches: [new Pitch()] });
  const t2 = new Trajectory({ num: 1, phraseIdx: 0, pitches: [new Pitch()] });
  const g = new Group({ trajectories: [t1, t2] });
  const bad = new Trajectory({ phraseIdx: 0, pitches: [new Pitch()] });
  g.trajectories.push(bad); // bypass checks
  expect(() => g.testForAdjacency()).toThrow('Trajectory must have a num');
});

test('constructor uses provided id', () => {
  const custom = 'my-group-id';
  const t1 = new Trajectory({ num: 0, phraseIdx: 0, pitches: [new Pitch()] });
  const t2 = new Trajectory({ num: 1, phraseIdx: 0, pitches: [new Pitch()] });
  const g = new Group({ trajectories: [t1, t2], id: custom });
  expect(g.id).toBe(custom);
  expect(t1.groupId).toBe(custom);
});

test('allPitches ignores trajectories with id 12', () => {
  const p1 = new Pitch({ swara: 'sa' });
  const p2 = new Pitch({ swara: 're' });
  const p3 = new Pitch({ swara: 'ga' });
  const t1 = new Trajectory({ id: 0, num: 0, phraseIdx: 0, pitches: [p1] });
  const t2 = new Trajectory({ id: 12, num: 1, phraseIdx: 0, pitches: [p2] });
  const t3 = new Trajectory({ id: 1, num: 2, phraseIdx: 0, pitches: [p3] });
  const g = new Group({ trajectories: [t1, t2, t3] });
  expect(g.allPitches()).toEqual([p1, p3]);
});

test('constructor requires at least two trajectories', () => {
  const only = new Trajectory({ num: 0, phraseIdx: 0, pitches: [new Pitch()] });
  expect(() => new Group({ trajectories: [only] })).toThrow('Group must have at least 2 trajectories');
});

test('testForAdjacency checks num after sort', () => {
  const t1 = new Trajectory({ num: 0, phraseIdx: 0, pitches: [new Pitch()] });
  const t2 = new Trajectory({ num: 1, phraseIdx: 0, pitches: [new Pitch()] });
  const g = new Group({ trajectories: [t1, t2] });
  // remove num after construction to skip comparator
  (t1 as any).num = undefined;
  g.trajectories = [t1];
  expect(() => g.testForAdjacency()).toThrow('Trajectory must have a num');
});
