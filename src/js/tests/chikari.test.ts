import { expect, test } from 'vitest';
import { Chikari, Pitch } from '@model';

test('Chikari serialization', () => {
  const pitches = [new Pitch({ swara: 's', oct: 1 }), new Pitch({ swara: 'p' })];
  const c = new Chikari({ pitches, fundamental: 440 });
  expect(typeof c.uniqueId).toBe('string');
  const json = c.toJSON();
  const copy = Chikari.fromJSON(json);
  expect(copy.toJSON()).toEqual(json);
});
