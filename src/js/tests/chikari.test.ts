import { expect, test } from 'vitest';
import { Chikari, Pitch } from '../classes';

test('default chikari', () => {
  const c = new Chikari();
  expect(c.pitches.length).toBe(4);
  c.pitches.forEach(p => {
    expect(p).toBeInstanceOf(Pitch);
    expect(p.fundamental).toBeCloseTo(c.fundamental);
  });
});

test('toJSON mirrors fields', () => {
  const c = new Chikari();
  const j = c.toJSON();
  expect(j.fundamental).toBeCloseTo(c.fundamental);
  expect(j.pitches.length).toBe(4);
  expect(j.uniqueId).toBe(c.uniqueId);
});
