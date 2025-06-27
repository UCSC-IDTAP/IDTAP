import { expect, test } from 'vitest';
import { Raga, Pitch } from '../model';

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
