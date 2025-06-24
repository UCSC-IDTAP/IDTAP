import { expect, test } from 'vitest';
import { Phrase, Trajectory, Raga } from '../classes';

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
