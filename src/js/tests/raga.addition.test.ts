import { expect, test } from 'vitest';
import { Raga, Pitch } from '@model';

const ruleSet = {
  sa: true,
  re: { lowered: true, raised: false },
  ga: { lowered: false, raised: true },
  ma: { lowered: true, raised: true },
  pa: true,
  dha: { lowered: false, raised: true },
  ni: { lowered: true, raised: false },
};

const fundamental = 200;

const et = (n: number) => 2 ** (n / 12);

const expectedRatios = [
  et(0), // sa
  et(1), // re lowered
  et(4), // ga raised
  et(5), // ma lowered
  et(6), // ma raised
  et(7), // pa
  et(9), // dha raised
  et(10), // ni lowered
];

const expectedStratified = [
  et(0),
  [et(1), et(2)],
  [et(3), et(4)],
  [et(5), et(6)],
  et(7),
  [et(8), et(9)],
  [et(10), et(11)],
];

test('setRatios and stratifiedRatios with custom rules', () => {
  const r = new Raga({ ruleSet, fundamental });
  expect(r.setRatios(ruleSet)).toEqual(expectedRatios);
  expect(r.ratios.length).toBe(expectedRatios.length);
  expectedRatios.forEach((ratio, idx) => {
    expect(r.ratios[idx]).toBeCloseTo(ratio);
  });
  expect(r.stratifiedRatios.length).toBe(expectedStratified.length);
  expectedStratified.forEach((ratio, idx) => {
    if (Array.isArray(ratio)) {
      expect(r.stratifiedRatios[idx]).toEqual(ratio);
    } else {
      expect(r.stratifiedRatios[idx]).toBeCloseTo(ratio as number);
    }
  });
});

function computeFreqs(r: Raga, low = 100, high = 800) {
  const freqs: number[] = [];
  expectedRatios.forEach((ratio) => {
    const base = ratio * r.fundamental;
    const lowExp = Math.ceil(Math.log2(low / base));
    const highExp = Math.floor(Math.log2(high / base));
    for (let i = lowExp; i <= highExp; i++) {
      freqs.push(base * 2 ** i);
    }
  });
  freqs.sort((a, b) => a - b);
  return freqs;
}

const mapping: Array<[string, string | undefined]> = [
  ['sa', undefined],
  ['re', 'lowered'],
  ['ga', 'raised'],
  ['ma', 'lowered'],
  ['ma', 'raised'],
  ['pa', undefined],
  ['dha', 'raised'],
  ['ni', 'lowered'],
];

test('fromJSON, frequencies and helper mappings', () => {
  const r = new Raga({ ruleSet, fundamental });
  const json = r.toJSON();
  const copy = Raga.fromJSON({ ...json, ruleSet });
  expect(copy.toJSON()).toEqual(json);

  const freqs = r.getFrequencies();
  const expectedFreqs = computeFreqs(r);
  expect(freqs.length).toBe(expectedFreqs.length);
  freqs.forEach((f, idx) => {
    expect(f).toBeCloseTo(expectedFreqs[idx]);
  });

  const chosen = freqs[4];
  const p = r.pitchFromLogFreq(Math.log2(chosen));
  expect(p).toBeInstanceOf(Pitch);
  expect(p.frequency).toBeCloseTo(chosen);

  mapping.forEach((tuple, idx) => {
    expect(r.ratioIdxToTuningTuple(idx)).toEqual(tuple);
  });
});

test('pitchNumberToScaleNumber edge cases', () => {
  const r = new Raga({ ruleSet, fundamental });
  const allowed = r.getPitchNumbers(0, 11);
  allowed.forEach((pn, idx) => {
    expect(r.pitchNumberToScaleNumber(pn)).toBe(idx);
  });
  const disallowed = [2, 3, 8, 11];
  disallowed.forEach((pn) => {
    expect(() => r.pitchNumberToScaleNumber(pn)).toThrow();
  });
});

test('raga conversion helpers', () => {
  const r = new Raga({ ruleSet, fundamental });
  const pitchNumbers = [0, 1, 4, 5, 6, 7, 9, 10];
  const letters = ['S', 'r', 'G', 'm', 'M', 'P', 'D', 'n'];

  pitchNumbers.forEach((pn, idx) => {
    expect(r.pitchNumberToSargamLetter(pn)).toBe(letters[idx]);
    expect(r.pitchNumberToScaleNumber(pn)).toBe(idx);
    expect(r.scaleNumberToPitchNumber(idx)).toBe(pn);
    expect(r.scaleNumberToSargamLetter(idx)).toBe(letters[idx]);
  });

  const len = pitchNumbers.length;
  expect(r.scaleNumberToPitchNumber(len)).toBe(pitchNumbers[0] + 12);
  expect(r.scaleNumberToPitchNumber(len + 1)).toBe(pitchNumbers[1] + 12);

  const invalidPNs = [2, 3, 8, 11];
  invalidPNs.forEach(pn => {
    expect(r.pitchNumberToSargamLetter(pn)).toBeUndefined();
    expect(() => r.pitchNumberToScaleNumber(pn)).toThrow();
  });
});
