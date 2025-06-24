import { expect, test } from 'vitest';
import { Phrase, Trajectory, Raga, Chikari } from '../classes';

test('default phrase', () => {
  const p = new Phrase({});
  expect(p.durTot).toBe(1);
  expect(p.durArray).toEqual([]);
  expect(p.trajectories).toEqual([]);
});

test('phrase with trajectories', () => {
  const t0 = new Trajectory({ num: 0 });
  const t1 = new Trajectory({ num: 1 });
  const r = new Raga();
  const p = new Phrase({ trajectories: [t0, t1], raga: r, startTime: 0 });
  expect(p.durTot).toBeCloseTo(2);
  expect(p.durArray).toEqual([0.5, 0.5]);
  expect(t0.startTime).toBe(0);
  expect(t1.startTime).toBe(1);
  const val = p.compute(0.25);
  expect(val).toBeCloseTo(t0.compute(0.5));
});

test('consolidate silent trajectories and chikari lookup', () => {
  const s1 = new Trajectory({ id: 12, durTot: 1 });
  const s2 = new Trajectory({ id: 12, durTot: 1 });
  const t = new Trajectory({ num: 0 });
  const p = new Phrase({ trajectories: [s1, s2, t], startTime: 0 });
  p.consolidateSilentTrajs();
  expect(p.trajectories.length).toBe(2);
  expect(p.trajectories[0].durTot).toBeCloseTo(2);
  p.chikaris = { '2.5': new Chikari() };
  const cds = p.chikarisDuringTraj(p.trajectories[1], 0);
  expect(cds.length).toBe(1);
  expect(cds[0].time).toBeCloseTo(2.5);
});

test('toNoteViewPhrase and reset', () => {
  const t0 = new Trajectory({ num: 0 });
  const p = new Phrase({ trajectories: [t0] });
  p.durArray = [0.5, 0.5] as any;
  p.reset();
  expect(p.durArray).toEqual([1]);
  const nv = p.toNoteViewPhrase();
  expect(nv.pitches.length).toBe(1);
  const json = p.toJSON();
  expect(json.durTot).toBe(1);
});
