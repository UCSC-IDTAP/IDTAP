import { expect, test, describe } from 'vitest';
import { Raga, Pitch } from '../model';
import { Raga as ModelRaga, Pitch as ModelPitch } from '@model';

const yamanRuleSet = {
  sa: true,
  re: {
    lowered: false,
    raised: true,
  },
  ga: {
    lowered: false,
    raised: true,
  },
  ma: {
    lowered: false,
    raised: true,
  },
  pa: true,
  dha: {
    lowered: false,
    raised: true,
  },
  ni: {
    lowered: false,
    raised: true,
  },
}

const baseTuning = {
  sa: 2 ** (0 / 12),
  re: {
    lowered: 2 ** (1 / 12),
    raised: 2 ** (2 / 12),
  },
  ga: {
    lowered: 2 ** (3 / 12),
    raised: 2 ** (4 / 12),
  },
  ma: {
    lowered: 2 ** (5 / 12),
    raised: 2 ** (6 / 12),
  },
  pa: 2 ** (7 / 12),
  dha: {
    lowered: 2 ** (8 / 12),
    raised: 2 ** (9 / 12),
  },
  ni: {
    lowered: 2 ** (10 / 12),
    raised: 2 ** (11 / 12),
  },
}

const baseRatios = [
  baseTuning.sa,
  baseTuning.re.raised,
  baseTuning.ga.raised,
  baseTuning.ma.raised,
  baseTuning.pa,
  baseTuning.dha.raised,
  baseTuning.ni.raised,
]

const customRuleSet = {
  sa: true,
  re: { lowered: true, raised: false },
  ga: { lowered: false, raised: true },
  ma: { lowered: true, raised: true },
  pa: true,
  dha: { lowered: true, raised: false },
  ni: { lowered: false, raised: true },
}

const ratioMapping = [
  ['sa', true],
  ['re', false],
  ['ga', true],
  ['ma', false],
  ['ma', true],
  ['pa', true],
  ['dha', false],
  ['ni', true],
] as const

function computeExpectedPitches(r: Raga, low = 100, high = 800) {
  const pitches: Pitch[] = []
  ratioMapping.forEach(([swara, raised]) => {
    const ratio = (r.tuning[swara] as any)[raised ? 'raised' : 'lowered'] ?? r.tuning[swara]
    const freq = ratio * r.fundamental
    const lowExp = Math.ceil(Math.log2(low / freq))
    const highExp = Math.floor(Math.log2(high / freq))
    for (let i = lowExp; i <= highExp; i++) {
      pitches.push(
        new Pitch({ swara, oct: i, raised, fundamental: r.fundamental, ratios: r.stratifiedRatios })
      )
    }
  })
  pitches.sort((a, b) => a.frequency - b.frequency)
  return pitches.filter(p => p.frequency >= low && p.frequency <= high)
}

test('defaultRaga', () => {
  const r = new Raga();
  expect(r).toBeInstanceOf(Raga);
  expect(r.name).toEqual('Yaman')
  expect(r.fundamental).toEqual(261.63);
  expect(r.ruleSet).toEqual(yamanRuleSet);
  expect(r.tuning).toEqual(baseTuning);
  expect(r.ratios).toEqual(baseRatios);
  expect(r.sargamLetters).toEqual(['S', 'R', 'G', 'M', 'P', 'D', 'N'])
  expect(r.ruleSetNumPitches).toEqual(7);
  const pitchNums = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11];
  const sargamLetters = [
    'S', 
    undefined, 
    'R', 
    undefined,
    'G',
    undefined,
    'M',
    'P',
    undefined,
    'D',
    undefined,
    'N'
  ]
  pitchNums.forEach(pn => {
    expect(r.pitchNumberToSargamLetter(pn)).toEqual(sargamLetters[pn]);
  })
  const singleOctPNs = [0, 2, 4, 6, 7, 9, 11, 12];
  expect(r.getPitchNumbers(0, 12)).toEqual(singleOctPNs);
  
  const pns = [
    -12, -10, -8, -6, -5, -3, -1,
    0, 2, 4, 6, 7, 9, 11,
    12, 14, 16, 18, 19, 21, 23, 24
  ]
  expect(r.getPitchNumbers(-12, 24)).toEqual(pns);
  
  const sns = [
    -7, -6, -5, -4, -3, -2, -1,
    0, 1, 2, 3, 4, 5, 6,
    7, 8, 9, 10, 11, 12, 13, 14
  ]
  const throwPns = [
    -11, -9, -7, -4, -2, 
    1, 3, 5, 8, 10,
    13, 15, 17, 20, 22
  ]
  pns.forEach((pn, idx) => {
    expect(r.pitchNumberToScaleNumber(pn)).toEqual(sns[idx]);
  })
  throwPns.forEach(pn => {
    expect(() => r.pitchNumberToScaleNumber(pn)).toThrow()
  })
  sns.forEach((sn, idx) => {
    expect(r.scaleNumberToPitchNumber(sn)).toEqual(pns[idx]);
  })
  let sLetters = ['S', 'R', 'G', 'M', 'P', 'D', 'N'];
  sLetters = sLetters.concat(sLetters, sLetters)
  sLetters = sLetters.concat(['S'])
  sns.forEach((sn, idx) => {
    expect(r.scaleNumberToSargamLetter(sn)).toEqual(sLetters[idx]);
  })
  const pSwaras = [
    5, 6, 
    0, 1, 2, 3, 4, 5, 6,
    0, 1, 2, 3, 4, 5, 6,
    0, 1, 2, 3, 4
  ];
  const pOcts = [
    -2, -2,
    -1, -1, -1, -1, -1, -1, -1,
    0, 0, 0, 0, 0, 0, 0,
    1, 1, 1, 1, 1
  ];
  const pitches = pSwaras.map((s, idx) => {
    return new Pitch({swara: s, oct: pOcts[idx]})
  });
  expect(r.getPitches()).toEqual(pitches);
  const sRatios = [
    2 ** 0,
    [2 ** (1 / 12), 2 ** (2 / 12)],
    [2 ** (3 / 12), 2 ** (4 / 12)],
    [2 ** (5 / 12), 2 ** (6 / 12)],
    2 ** (7 / 12),
    [2 ** (8 / 12), 2 ** (9 / 12)],
    [2 ** (10 / 12), 2 ** (11 / 12)]
  ];
  expect(r.stratifiedRatios).toEqual(sRatios);
  expect(r.chikariPitches).toEqual([
    new Pitch({ swara: 0, oct: 2, fundamental: 261.63 }),
    new Pitch({ swara: 0, oct: 1, fundamental: 261.63 }),
  ])
  const hardCodedFreqs = [
    110.00186456141468, 123.47291821345574,
               130.815, 146.83487284959062,
    164.81657214199782, 185.00034716183643,
     196.0010402616231, 220.00372912282936,
    246.94583642691148,             261.63,
    293.66974569918125, 329.63314428399565,
    370.00069432367286,  392.0020805232462,
     440.0074582456587, 493.89167285382297,
                523.26,  587.3394913983625,
     659.2662885679913,  740.0013886473457,
     784.0041610464924
  ];
  r.getFrequencies().forEach((freq, idx) => {
    expect(freq).toBeCloseTo(pitches[idx].frequency),
    expect(freq).toBeCloseTo(hardCodedFreqs[idx])
  });
  const sNames = ['Sa', 'Re', 'Ga', 'Ma', 'Pa', 'Dha', 'Ni'];
  expect(r.sargamNames).toEqual(sNames);
  const json_obj = {
    name: 'Yaman',
    fundamental: 261.63,
    ratios: baseRatios,
    tuning: baseTuning,
  };
  expect(r.toJSON()).toEqual(json_obj);
})

test('pitchFromLogFreq', () => {
  const r = new Raga();
  const offset = 0.03;
  const baseLog = Math.log2(r.fundamental * 2);
  const p = r.pitchFromLogFreq(baseLog + offset);
  expect(p).toBeInstanceOf(Pitch);
  expect(p.frequency).toBeCloseTo(2 ** (baseLog + offset));
})

test('pitch string getters', () => {
  const r = new Raga();
  const pl = r.getPitches({ low: r.fundamental, high: r.fundamental * 1.999 });
  const solfege = pl.map(p => p.solfegeLetter);
  const pcs = pl.map(p => p.chroma.toString());
  const western = pl.map(p => p.westernPitch);
  expect(r.solfegeStrings).toEqual(solfege);
  expect(r.pcStrings).toEqual(pcs);
  expect(r.westernPitchStrings).toEqual(western);
})

test('swaraObjects', () => {
  const r = new Raga();
  const objs = [
    { swara: 0, raised: true },
    { swara: 1, raised: true },
    { swara: 2, raised: true },
    { swara: 3, raised: true },
    { swara: 4, raised: true },
    { swara: 5, raised: true },
    { swara: 6, raised: true },
  ];
  expect(r.swaraObjects).toEqual(objs);
})

test('ratioIdxToTuningTuple', () => {
  const r = new Raga();
  const mapping: Array<[string, string | undefined]> = [
    ['sa', undefined],
    ['re', 'raised'],
    ['ga', 'raised'],
    ['ma', 'raised'],
    ['pa', undefined],
    ['dha', 'raised'],
    ['ni', 'raised'],
  ];
  mapping.forEach((tuple, idx) => {
    expect(r.ratioIdxToTuningTuple(idx)).toEqual(tuple);
  });
})

test('custom rule set pitch numbers and invalid conversions', () => {
  const r = new Raga({ ruleSet: customRuleSet, fundamental: 200 });
  const expected = [0, 1, 4, 5, 6, 7, 8, 11];
  expect(r.ruleSetNumPitches).toBe(expected.length);
  expect(r.getPitchNumbers(0, 11)).toEqual(expected);
  expected.forEach((pn, idx) => {
    expect(r.pitchNumberToScaleNumber(pn)).toBe(idx);
  });
  const disallowed = [2, 3, 9, 10];
  disallowed.forEach(pn => {
    expect(() => r.pitchNumberToScaleNumber(pn)).toThrow();
  });
})

test('getPitches with lowered and raised notes', () => {
  const r = new Raga({ ruleSet: customRuleSet, fundamental: 200 });
  const expected = computeExpectedPitches(r);
  const result = r.getPitches();
  expect(result.length).toBe(expected.length);
  result.forEach((p, idx) => {
    expect(p.frequency).toBeCloseTo(expected[idx].frequency);
    expect(p.swara).toEqual(expected[idx].swara);
    expect(p.oct).toBe(expected[idx].oct);
    expect(p.raised).toBe(expected[idx].raised);
  });
})

test('pitchFromLogFreq octave rounding', () => {
  const r = new Raga();
  const base = Math.log2(r.fundamental);
  const near = base + 1 - 5e-7;
  const p1 = r.pitchFromLogFreq(near);
  expect(p1.sargamLetter).toBe('S');
  expect(p1.oct).toBe(1);
  const p2 = r.pitchFromLogFreq(base + 1 + 5e-7);
  expect(p2.sargamLetter).toBe('S');
  expect(p2.oct).toBe(1);
})

test('pitchFromLogFreq near exact octave offset', () => {
  const fundamental = 128.5 - 1e-12;
  const r = new Raga({ fundamental });
  const logFreq = Math.log2(fundamental * 2);
  const p = r.pitchFromLogFreq(logFreq);
  expect(p.sargamLetter).toBe('S');
  expect(p.oct).toBe(1);
})

test('ratioIdxToTuningTuple mixed rule set', () => {
  const r = new Raga({ ruleSet: customRuleSet });
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
})

test('JSON round trip with custom tuning', () => {
  const tuning = {
    sa: 1.01,
    re: { lowered: 1.02, raised: 1.035 },
    ga: { lowered: 1.04, raised: 1.05 },
    ma: { lowered: 1.06, raised: 1.07 },
    pa: 1.08,
    dha: { lowered: 1.09, raised: 1.1 },
    ni: { lowered: 1.11, raised: 1.12 },
  };
  const ratios = [
    tuning.sa,
    tuning.re.lowered,
    tuning.ga.raised,
    tuning.ma.lowered,
    tuning.ma.raised,
    tuning.pa,
    tuning.dha.lowered,
    tuning.ni.raised,
  ];
  const r = new ModelRaga({ name: 'Custom', fundamental: 300, ruleSet: customRuleSet, tuning, ratios });
  const json = r.toJSON();
  const round = ModelRaga.fromJSON({ ...json, ruleSet: customRuleSet });
  expect(round.toJSON()).toEqual(json);
})

// Consolidated tests from raga.addition.test.ts
describe('additional raga utilities', () => {
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
    et(0),
    et(1),
    et(4),
    et(5),
    et(6),
    et(7),
    et(9),
    et(10),
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

  function computeFreqs(r: ModelRaga, low = 100, high = 800) {
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

  test('setRatios and stratifiedRatios with custom rules', () => {
    const r = new ModelRaga({ ruleSet, fundamental });
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

  test('fromJSON, frequencies and helper mappings', () => {
    const r = new ModelRaga({ ruleSet, fundamental });
    const json = r.toJSON();
    const copy = ModelRaga.fromJSON({ ...json, ruleSet });
    expect(copy.toJSON()).toEqual(json);

    const freqs = r.getFrequencies();
    const expectedFreqs = computeFreqs(r);
    expect(freqs.length).toBe(expectedFreqs.length);
    freqs.forEach((f, idx) => {
      expect(f).toBeCloseTo(expectedFreqs[idx]);
    });

    const chosen = freqs[4];
    const p = r.pitchFromLogFreq(Math.log2(chosen));
    expect(p).toBeInstanceOf(ModelPitch);
    expect(p.frequency).toBeCloseTo(chosen);

    mapping.forEach((tuple, idx) => {
      expect(r.ratioIdxToTuningTuple(idx)).toEqual(tuple);
    });
  });

  test('pitchNumberToScaleNumber edge cases', () => {
    const r = new ModelRaga({ ruleSet, fundamental });
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
    const r = new ModelRaga({ ruleSet, fundamental });
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
});

// Consolidated tests from raga.custom.test.ts
describe('custom rule set utilities', () => {
  const localRuleSet = {
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
    2 ** (0 / 12),
    2 ** (1 / 12),
    2 ** (4 / 12),
    2 ** (5 / 12),
    2 ** (6 / 12),
    2 ** (7 / 12),
    2 ** (8 / 12),
    2 ** (11 / 12),
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

  test('custom rule set basic functions', () => {
    const r = new Raga({ ruleSet: localRuleSet, fundamental });
    expect(r.ruleSetNumPitches).toBe(8);
    pitchNumbersSingleOct.forEach((pn, idx) => {
      expect(r.getPitchNumbers(0, 11)[idx]).toBe(pn);
    });
    expectedRatios.forEach((ratio, idx) => {
      expect(r.ratios[idx]).toBeCloseTo(ratio);
    });
    const fromSetRatios = r.setRatios(localRuleSet);
    fromSetRatios.forEach((ratio, idx) => {
      expect(r.ratios[idx]).toBeCloseTo(ratio);
    });
  });

  test('getPitches frequencies and flags', () => {
    const r = new Raga({ ruleSet: localRuleSet, fundamental });
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

  test('frequency helpers with custom rule set', () => {
    const r = new Raga({ ruleSet: localRuleSet, fundamental });
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
});

// Consolidated test from raga.model.strings.test.ts
test('model raga string getters', () => {
  const r = new ModelRaga();
  const pl = r.getPitches({ low: r.fundamental, high: r.fundamental * 1.999 });
  const solfege = pl.map(p => p.solfegeLetter);
  const pcs = pl.map(p => p.chroma.toString());
  const western = pl.map(p => p.westernPitch);
  expect(r.solfegeStrings).toEqual(solfege);
  expect(r.pcStrings).toEqual(pcs);
  expect(r.westernPitchStrings).toEqual(western);
});



// Verify that providing a custom ratios array without a tuning object
// causes the constructor to update internal tuning values accordingly.

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

// Ensure that when custom tuning is provided without ratios,

function buildExpectedPitches(r: Raga) {
  const swaras = [
    5, 6,
    0, 1, 2, 3, 4, 5, 6,
    0, 1, 2, 3, 4, 5, 6,
    0, 1, 2, 3, 4,
  ];
  const octs = [
    -2, -2,
    -1, -1, -1, -1, -1, -1, -1,
    0, 0, 0, 0, 0, 0, 0,
    1, 1, 1, 1, 1,
  ];
  return swaras.map((s, idx) => new Pitch({ swara: s, oct: octs[idx] }));
}

test('model raga core utilities', () => {
  const r = new Raga();

  const expectedPitches = buildExpectedPitches(r);
  expect(r.getPitches()).toEqual(expectedPitches);

  const expectedRatios = [
    2 ** 0,
    [2 ** (1 / 12), 2 ** (2 / 12)],
    [2 ** (3 / 12), 2 ** (4 / 12)],
    [2 ** (5 / 12), 2 ** (6 / 12)],
    2 ** (7 / 12),
    [2 ** (8 / 12), 2 ** (9 / 12)],
    [2 ** (10 / 12), 2 ** (11 / 12)],
  ];
  expect(r.stratifiedRatios).toEqual(expectedRatios);

  expect(r.chikariPitches).toEqual([
    new Pitch({ swara: 's', oct: 2, fundamental: r.fundamental }),
    new Pitch({ swara: 's', oct: 1, fundamental: r.fundamental }),
  ]);

  const hardCodedFreqs = [
    110.00186456141468, 123.47291821345574,
               130.815, 146.83487284959062,
    164.81657214199782, 185.00034716183643,
     196.0010402616231, 220.00372912282936,
    246.94583642691148,             261.63,
    293.66974569918125, 329.63314428399565,
    370.00069432367286,  392.0020805232462,
     440.0074582456587, 493.89167285382297,
                523.26,  587.3394913983625,
     659.2662885679913,  740.0013886473457,
     784.0041610464924,
  ];

  r.getFrequencies().forEach((freq, idx) => {
    expect(freq).toBeCloseTo(expectedPitches[idx].frequency);
    expect(freq).toBeCloseTo(hardCodedFreqs[idx]);
  });

  expect(r.sargamNames).toEqual(['Sa', 'Re', 'Ga', 'Ma', 'Pa', 'Dha', 'Ni']);

  const objs = [
    { swara: 0, raised: true },
    { swara: 1, raised: true },
    { swara: 2, raised: true },
    { swara: 3, raised: true },
    { swara: 4, raised: true },
    { swara: 5, raised: true },
    { swara: 6, raised: true },
  ];
  expect(r.swaraObjects).toEqual(objs);
});

test('pitchNumberToSargamLetter handles negative numbers', () => {
  const r = new Raga();

  // -1 corresponds to Ni in the previous octave
  expect(r.pitchNumberToSargamLetter(-1)).toBe('N');

  // -13 is two octaves below Ni and should also map to Ni
  expect(r.pitchNumberToSargamLetter(-13)).toBe('N');

  // -12 should resolve to Sa one octave below
  expect(r.pitchNumberToSargamLetter(-12)).toBe('S');
});


test('ratioIdxToTuningTuple out of range', () => {
  const r = new Raga();
  const invalidIdx = r.ruleSetNumPitches; // index larger than highest valid
  expect(r.ratioIdxToTuningTuple(invalidIdx)).toBeUndefined();
});
// the constructor computes ratios via setRatios and overwrites
// the provided tuning values with those ratios.
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
