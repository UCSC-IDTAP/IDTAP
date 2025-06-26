import { expect, test } from 'vitest';
import { Raga, Pitch } from '../classes';

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