import { expect, test } from 'vitest';
import { Pitch } from '../model';

test('Pitch model serialization', () => {
  const p = new Pitch({ swara: 'ga', raised: false, oct: 1, logOffset: 0.2 });
  const json = p.toJSON();
  const copy = Pitch.fromJSON(json);
  expect(copy.toJSON()).toEqual(json);
});
