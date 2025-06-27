import { expect, test } from 'vitest';
import { Raga } from '../model';

// Ensure that when custom tuning is provided without ratios,
// the constructor computes ratios via setRatios and overwrites
// the provided tuning values with those ratios.

test('constructor overwrites provided tuning when ratios are undefined', () => {
  const customTuning = {
    sa: 0,
    re: { lowered: 0, raised: 0 },
    ga: { lowered: 0, raised: 0 },
    ma: { lowered: 0, raised: 0 },
    pa: 0,
    dha: { lowered: 0, raised: 0 },
    ni: { lowered: 0, raised: 0 },
  } as any;

  const raga = new Raga({ tuning: customTuning });

  const expectedRatios = [
    2 ** 0,
    2 ** (2 / 12),
    2 ** (4 / 12),
    2 ** (6 / 12),
    2 ** (7 / 12),
    2 ** (9 / 12),
    2 ** (11 / 12),
  ];

  expect(raga.ratios).toEqual(expectedRatios);

  // customTuning object should have been overwritten by constructor
  expect(customTuning.sa).toBeCloseTo(expectedRatios[0]);
  expect(customTuning.re.raised).toBeCloseTo(expectedRatios[1]);
  expect(customTuning.ga.raised).toBeCloseTo(expectedRatios[2]);
  expect(customTuning.ma.raised).toBeCloseTo(expectedRatios[3]);
  expect(customTuning.pa).toBeCloseTo(expectedRatios[4]);
  expect(customTuning.dha.raised).toBeCloseTo(expectedRatios[5]);
  expect(customTuning.ni.raised).toBeCloseTo(expectedRatios[6]);

  // raga.tuning should reference the same object instance
  expect(raga.tuning).toBe(customTuning);
});
