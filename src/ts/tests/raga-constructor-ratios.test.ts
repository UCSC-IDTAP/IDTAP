import { expect, test } from 'vitest';
import { Raga, Pitch } from '../model';

// Verify that providing a custom ratios array without a tuning object
// causes the constructor to update internal tuning values accordingly.
test('constructor applies custom ratios to tuning', () => {
  const ratios = [1, 1.07, 1.2, 1.33, 1.5, 1.67, 1.9];
  const fundamental = 100;

  const raga = new Raga({ fundamental, ratios });

  // ratios property should match provided array
  expect(raga.ratios).toEqual(ratios);

  // tuning entries should be overridden by the ratios
  expect(raga.tuning.sa).toBe(ratios[0]);
  expect((raga.tuning.re as any).raised).toBe(ratios[1]);
  expect((raga.tuning.ga as any).raised).toBe(ratios[2]);
  expect((raga.tuning.ma as any).raised).toBe(ratios[3]);
  expect(raga.tuning.pa).toBe(ratios[4]);
  expect((raga.tuning.dha as any).raised).toBe(ratios[5]);
  expect((raga.tuning.ni as any).raised).toBe(ratios[6]);

  // build a couple of pitches and ensure the frequencies reflect
  // the supplied ratios times the fundamental
  const sa = new Pitch({ swara: 'sa', fundamental, ratios: raga.stratifiedRatios });
  const re = new Pitch({ swara: 're', raised: true, fundamental, ratios: raga.stratifiedRatios });

  expect(sa.frequency).toBeCloseTo(ratios[0] * fundamental);
  expect(re.frequency).toBeCloseTo(ratios[1] * fundamental);
});
