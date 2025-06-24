import { expect, test } from 'vitest';
import { Automation } from '../classes';

test('default automation', () => {
  const a = new Automation();
  expect(a.values).toEqual([
    { normTime: 0, value: 1 },
    { normTime: 1, value: 1 }
  ]);
});

test('add and remove values', () => {
  const a = new Automation();
  a.addValue(0.5, 0.5);
  expect(a.values).toEqual([
    { normTime: 0, value: 1 },
    { normTime: 0.5, value: 0.5 },
    { normTime: 1, value: 1 }
  ]);
  a.removeValue(1);
  expect(a.values).toEqual([
    { normTime: 0, value: 1 },
    { normTime: 1, value: 1 }
  ]);
});

test('interpolated value', () => {
  const a = new Automation();
  a.addValue(0.5, 0);
  expect(a.valueAtX(0.25)).toBeCloseTo(0.5);
  expect(a.valueAtX(0.75)).toBeCloseTo(0.5);
});
