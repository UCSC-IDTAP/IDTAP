import { expect, test } from 'vitest';
import { Chikari, Pitch } from '@model';

test('Chikari serialization omits pitches', () => {
  const pitches = [new Pitch({ swara: 's', oct: 1 }), new Pitch({ swara: 'p' })];
  const c = new Chikari({ pitches, fundamental: 440 });
  expect(typeof c.uniqueId).toBe('string');
  const json = c.toJSON();
  expect(json).toEqual({ fundamental: 440, uniqueId: c.uniqueId });
  expect(json).not.toHaveProperty('pitches');
  const copy = Chikari.fromJSON(json);
  expect(copy.toJSON()).toEqual(json);
});

test('Chikari fromJSON handles legacy data with pitches', () => {
  const legacyData = {
    fundamental: 261.63,
    uniqueId: 'test-id',
    pitches: [
      { swara: 0, raised: true, oct: 2, ratios: [1, [1.06, 1.12], [1.19, 1.26], [1.33, 1.41], 1.5, [1.59, 1.68], [1.78, 1.89]], fundamental: 261.63, logOffset: 0 },
      { swara: 0, raised: true, oct: 1, ratios: [1, [1.06, 1.12], [1.19, 1.26], [1.33, 1.41], 1.5, [1.59, 1.68], [1.78, 1.89]], fundamental: 261.63, logOffset: 0 },
    ],
  };
  const c = Chikari.fromJSON(legacyData);
  expect(c.uniqueId).toBe('test-id');
  expect(c.fundamental).toBe(261.63);
  expect(c.pitches.length).toBe(2);
});
