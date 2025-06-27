import { expect, test } from 'vitest';
import { Raga, Pitch } from '../classes';

const customRuleSet = {
  sa: true,
  re: { lowered: true, raised: false },
  ga: { lowered: false, raised: true },
  ma: { lowered: true, raised: true },
  pa: true,
  dha: { lowered: true, raised: false },
  ni: { lowered: false, raised: true },
};

const fundamental = 200;
const expectedRatios = [
  2 ** (0 / 12), // sa
  2 ** (1 / 12), // re lowered
  2 ** (4 / 12), // ga raised
  2 ** (5 / 12), // ma lowered
  2 ** (6 / 12), // ma raised
  2 ** (7 / 12), // pa
  2 ** (8 / 12), // dha lowered
  2 ** (11 / 12), // ni raised
];

const ratioMapping = [
  ['sa', true, expectedRatios[0]],
  ['re', false, expectedRatios[1]],
  ['ga', true, expectedRatios[2]],
  ['ma', false, expectedRatios[3]],
  ['ma', true, expectedRatios[4]],
  ['pa', true, expectedRatios[5]],
  ['dha', false, expectedRatios[6]],
  ['ni', true, expectedRatios[7]],
] as const;

function computeExpectedPitches(r: Raga, low = 100, high = 800) {
  const pitches: Pitch[] = [];
  ratioMapping.forEach(([swara, raised, ratio]) => {
    const freq = ratio * r.fundamental;
    const lowExp = Math.ceil(Math.log2(low / freq));
    const highExp = Math.floor(Math.log2(high / freq));
    for (let i = lowExp; i <= highExp; i++) {
      pitches.push(
        new Pitch({
          swara,
          oct: i,
          raised,
          fundamental: r.fundamental,
          ratios: r.stratifiedRatios,
        })
      );
    }
  });
  pitches.sort((a, b) => a.frequency - b.frequency);
  return pitches.filter((p) => p.frequency >= low && p.frequency <= high);
}

function computeExpectedFreqs(r: Raga, low = 100, high = 800) {
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

const pitchNumbersSingleOct = [0, 1, 4, 5, 6, 7, 8, 11];

// Test setRatios, getPitchNumbers, ruleSetNumPitches
test('custom rule set basic functions', () => {
  const r = new Raga({ ruleSet: customRuleSet, fundamental });
  expect(r.ruleSetNumPitches).toBe(8);
  pitchNumbersSingleOct.forEach((pn, idx) => {
    expect(r.getPitchNumbers(0, 11)[idx]).toBe(pn);
  });
  expectedRatios.forEach((ratio, idx) => {
    expect(r.ratios[idx]).toBeCloseTo(ratio);
  });
  const fromSetRatios = r.setRatios(customRuleSet);
  fromSetRatios.forEach((ratio, idx) => {
    expect(r.ratios[idx]).toBeCloseTo(ratio);
  });
});

// Test getPitches with raised and lowered notes
test('getPitches frequencies and flags', () => {
  const r = new Raga({ ruleSet: customRuleSet, fundamental });
  const expected = computeExpectedPitches(r);
  const result = r.getPitches();
  expect(result.length).toBe(expected.length);
  result.forEach((p, idx) => {
    expect(p.frequency).toBeCloseTo(expected[idx].frequency);
    expect(p.swara).toEqual(expected[idx].swara);
    expect(p.oct).toBe(expected[idx].oct);
    expect(p.raised).toBe(expected[idx].raised);
  });
});

// Test getFrequencies, pitchFromLogFreq, and ratioIdxToTuningTuple
test('frequency helpers with custom rule set', () => {
  const r = new Raga({ ruleSet: customRuleSet, fundamental });
  const expectedFreqs = computeExpectedFreqs(r);
  const freqs = r.getFrequencies();
  expect(freqs.length).toBe(expectedFreqs.length);
  freqs.forEach((f, idx) => {
    expect(f).toBeCloseTo(expectedFreqs[idx]);
  });

  const pickFreq = freqs[3];
  const p = r.pitchFromLogFreq(Math.log2(pickFreq));
  expect(p.frequency).toBeCloseTo(pickFreq);

  const mapping: Array<[string, string | undefined]> = [
    ['sa', undefined],
    ['re', 'lowered'],
    ['ga', 'raised'],
    ['ma', 'lowered'],
    ['ma', 'raised'],
    ['pa', undefined],
    ['dha', 'lowered'],
    ['ni', 'raised'],
  ];
  mapping.forEach((tuple, idx) => {
    expect(r.ratioIdxToTuningTuple(idx)).toEqual(tuple);
  });
});
