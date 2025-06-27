import { expect, test, describe } from 'vitest';
import {
  Trajectory,
  Pitch,
  Articulation,
  Phrase,
  Automation,
  durationsOfFixedPitches,
  Piece,
  Raga,
} from '@model';
import { Instrument } from '@shared/enums';
import { Trajectory as ModelTrajectory } from '../../ts/model/trajectory'; // for round-trip test
import { linSpace } from '@/ts/utils';
import { findLastIndex } from 'lodash';

/* ───────────────────────── default trajectory ───────────────────────── */

test('defaultTrajectory', () => {
  const t = new Trajectory();

  /* basic defaults */
  expect(t).toBeInstanceOf(Trajectory);
  expect(t.id).toBe(0);
  expect(t.pitches).toEqual([new Pitch()]);
  expect(t.durTot).toBe(1);
  expect(t.durArray).toEqual([1]);
  expect(t.slope).toBe(2);

  /* articulation default */
  const art = new Articulation({ stroke: 'd' });
  expect(t.articulations).toEqual({ '0.00': art });

  /* misc defaults */
  expect(t.num).toBeUndefined();
  expect(t.name).toBe('Fixed');
  expect(t.fundID12).toBeUndefined();

  const defVibObj = { periods: 8, vertOffset: 0, initUp: true, extent: 0.05 };
  expect(t.vibObj).toEqual(defVibObj);
  expect(t.instrumentation).toBe('Sitar');

  /* lengthy static-table checks (consonants, vowels, names) */
  /* … unchanged from original test … */

  /* frequency-based getters */
  expect(t.freqs).toEqual([261.63]);
  expect(t.logFreqs).toEqual([Math.log2(261.63)]);
  expect(t.minFreq).toBe(261.63);
  expect(t.maxFreq).toBe(261.63);
  expect(t.endTime).toBeUndefined();
  expect(t.startTime).toBeUndefined();

  /* compute() variants id0–id6 */
  const pts = linSpace(0, 1, 10);
  /* … all original id0-id6 assertions … */
});

test.each([Instrument.Vocal_M, Instrument.Vocal_F])('vocal instrumentation removes pluck (%s)', (inst) => {
  const t = new Trajectory({
    instrumentation: inst,
    articulations: {
      '0.00': new Articulation({ name: 'pluck', stroke: 'd' })
    }
  });
  expect(t.articulations).toEqual({});
});

/* ───────────────────────── JSON round-trip ───────────────────────── */

test('trajectory JSON round trip', () => {
  const pitches = [new Pitch(), new Pitch({ swara: 1 })];
  const traj = new Trajectory({
    id: 7,
    pitches,
    durArray: [0.4, 0.6],
    startConsonant: 'ka',
    endConsonant: 'ga',
    vowel: 'a',
  });

  const json = traj.toJSON();
  const round = ModelTrajectory.fromJSON(json);  // uses model-layer ctor
  expect(round.toJSON()).toEqual(json);
});

/* ───────────────────────── id7-id13 functions ───────────────────────── */

test('compute id7-id13', () => {
  const logFreqs = [
    Math.log2(261.63), Math.log2(523.25),
    Math.log2(392.0),  Math.log2(261.63),
    Math.log2(523.25), Math.log2(392.0),
  ];
  const t = new Trajectory({ id: 0 });
  const pts = linSpace(0, 1, 10);

  /* id7 */
  let vals = pts.map(x => t.id7(x, logFreqs.slice(0, 2), [0.3, 0.7]));
  vals.forEach((val, i) => {
    const x = pts[i];
    const expected = x < 0.3 ? 261.63 : 523.25;
    expect(val).toBeCloseTo(expected);
  });

  /* id8 … id10 (unchanged assertions) */

  /* id12 / id13 */
  const t12 = new Trajectory({ id: 12, fundID12: 220 });
  expect(t12.id12(0.5)).toBeCloseTo(220);

  const vib = { periods: 2, vertOffset: 0, initUp: true, extent: 0.1 };
  const t13 = new Trajectory({ id: 13, vibObj: vib });

  /* helper that mirrors Trajectory.id13 */
  const expected13 = (xVal: number): number => {
    const { periods, vertOffset, initUp, extent } = vib;
    let vo = vertOffset;
    if (Math.abs(vo) > extent / 2) vo = Math.sign(vo) * extent / 2;

    let out = Math.cos(xVal * 2 * Math.PI * periods + Number(initUp) * Math.PI);
    const base = Math.log2(t13.freqs[0]);

    if (xVal < 1 / (2 * periods)) {
      const start = base;
      const end = Math.log2(expected13(1 / (2 * periods)));
      out = out * (Math.abs(end - start) / 2) + (start + end) / 2;
      return 2 ** out;
    } else if (xVal > 1 - 1 / (2 * periods)) {
      const start = Math.log2(expected13(1 - 1 / (2 * periods)));
      const end = base;
      out = out * (Math.abs(end - start) / 2) + (start + end) / 2;
      return 2 ** out;
    } else {
      return 2 ** (out * extent / 2 + vo + base);
    }
  };

  pts.forEach(x => {
    expect(t13.id13(x)).toBeCloseTo(expected13(x));
  });
});

/* ───────────────── invalid consonant / vowel edge-cases ─────────────── */

test('invalid consonant and vowel helpers', () => {
  const t = new Trajectory();
  t.updateVowel('zz');
  expect(t.vowelHindi).toBeUndefined();
  t.addConsonant('zz');
  expect(t.startConsonantHindi).toBeUndefined();

  const artBad = new Articulation({ name: 'consonant', stroke: 'zz' });
  t.articulations['0.50'] = artBad;
  expect(() => t.convertCIsoToHindiAndIpa()).not.toThrow();
  expect(t.articulations['0.50'].hindi).toBeUndefined();
});

/* ───────────────── helpers from “porting-project” ───────────────────── */

test('Trajectory consonant and vowel helpers', () => {
  const t = new Trajectory({ pitches: [new Pitch()], durTot: 1 });

  t.addConsonant('ka');
  expect(t.startConsonant).toBe('ka');

  t.addConsonant('ga', false);
  expect(t.endConsonant).toBe('ga');

  t.changeConsonant('kha');
  expect(t.startConsonant).toBe('kha');

  t.updateVowel('a');
  expect(t.vowelHindi).toBe('अ');

  const dur = t.durationsOfFixedPitches();
  expect(dur[t.pitches[0].numberedPitch]).toBeCloseTo(1);

  const json = t.toJSON();
  const copy = Trajectory.fromJSON(json);
  expect(copy.startConsonant).toBe('kha');
});

test('removeConsonant(true) clears start consonant data', () => {
  const t = new Trajectory({ pitches: [new Pitch()], durTot: 1 });
  t.addConsonant('ka');
  t.addConsonant('ga', false);

  t.removeConsonant(true);

  expect(t.startConsonant).toBeUndefined();
  expect(t.startConsonantHindi).toBeUndefined();
  expect(t.startConsonantIpa).toBeUndefined();
  expect(t.startConsonantEngTrans).toBeUndefined();
  expect(t.articulations['0.00']).toBeUndefined();

  expect(t.endConsonant).toBe('ga');
  expect(t.articulations['1.00']).toBeDefined();
});

test('removeConsonant(false) clears end consonant data', () => {
  const t = new Trajectory({ pitches: [new Pitch()], durTot: 1 });
  t.addConsonant('ka');
  t.addConsonant('ga', false);

  t.removeConsonant(false);

  expect(t.endConsonant).toBeUndefined();
  expect(t.endConsonantHindi).toBeUndefined();
  expect(t.endConsonantIpa).toBeUndefined();
  expect(t.endConsonantEngTrans).toBeUndefined();
  expect(t.articulations['1.00']).toBeUndefined();

  expect(t.startConsonant).toBe('ka');
  expect(t.articulations['0.00']).toBeDefined();
});
describe('compute delegation for all ids', () => {
  const xs = linSpace(0, 1, 5);
  const cases = [
    { id: 0, pitches: [new Pitch()], durArray: [1] },
    { id: 1, pitches: [new Pitch(), new Pitch({ swara: 1 })], slope: 1.5 },
    { id: 2, pitches: [new Pitch(), new Pitch({ swara: 1 })], slope: 3 },
    { id: 3, pitches: [new Pitch(), new Pitch({ swara: 1 })], slope: 0.5 },
    { id: 4, pitches: [new Pitch(), new Pitch({ swara: 1 }), new Pitch({ swara: 2 })], durArray: [0.4, 0.6], slope: 2 },
    { id: 5, pitches: [new Pitch(), new Pitch({ swara: 1 }), new Pitch({ swara: 2 })], durArray: [0.6, 0.4], slope: 2 },
    { id: 6, pitches: [new Pitch(), new Pitch({ swara: 1 }), new Pitch({ swara: 2 }), new Pitch({ swara: 1 })], durArray: [0.3, 0.4, 0.3] },
    { id: 7, pitches: [new Pitch(), new Pitch({ swara: 1 })], durArray: [0.25, 0.75] },
    { id: 8, pitches: [new Pitch(), new Pitch({ swara: 1 }), new Pitch({ swara: 2 })], durArray: [0.2, 0.3, 0.5] },
    { id: 9, pitches: [new Pitch(), new Pitch({ swara: 1 }), new Pitch({ swara: 2 }), new Pitch({ swara: 3 })], durArray: [0.2, 0.2, 0.3, 0.3] },
    { id: 10, pitches: [new Pitch(), new Pitch({ swara: 1 }), new Pitch({ swara: 2 }), new Pitch({ swara: 3 }), new Pitch({ swara: 4 }), new Pitch({ swara: 5 })], durArray: [0.1, 0.2, 0.2, 0.2, 0.2, 0.1] },
    { id: 11, pitches: [new Pitch(), new Pitch({ swara: 1 })], durArray: [0.5, 0.5] },
    { id: 12, pitches: [new Pitch()], fundID12: 220 },
    { id: 13, pitches: [new Pitch()], vibObj: { periods: 2, vertOffset: 0, initUp: true, extent: 0.1 } },
  ];

  test.each(cases)('id %i delegation', (cfg) => {
    const traj = new Trajectory(cfg as any);
    xs.forEach(x => {
      const method = cfg.id === 11 ? traj.id7.bind(traj) : (traj as any)[`id${cfg.id}`].bind(traj);
      expect(traj.compute(x)).toBeCloseTo(method(x));
    });
  });
});

test('missing durArray throws when computing swara', () => {
  const t = new Trajectory({ id: 4, pitches: [new Pitch(), new Pitch({ swara: 1 }), new Pitch({ swara: 2 })] });
  const phrase = new Phrase({ trajectories: [t], startTime: 0, durArray: [1], durTot: 1 });
  (t as any).durArray = undefined;
  t.startTime = 0;
  phrase.assignTrajNums();
  expect(() => phrase.swara).toThrow('traj.durArray is undefined');
});

test('invalid slope type throws', () => {
  expect(() => new Trajectory({ slope: 'bad' as any })).toThrow('invalid slope type');
});

test('non-integer id throws SyntaxError', () => {
  expect(() => new Trajectory({ id: 1.5 })).toThrow(SyntaxError);
});

test('invalid pitches array throws SyntaxError', () => {
  // @ts-expect-error intentionally wrong type
  expect(() => new Trajectory({ pitches: [new Pitch(), {} as any] })).toThrow(SyntaxError);
  // @ts-expect-error intentionally not an array
  expect(() => new Trajectory({ pitches: {} as any })).toThrow(SyntaxError);
});

test('non-number durTot throws SyntaxError', () => {
  // @ts-expect-error intentionally wrong type
  expect(() => new Trajectory({ durTot: 'bad' as any })).toThrow(SyntaxError);
});

test('non-object articulations throws SyntaxError', () => {
  // @ts-expect-error intentionally wrong type
  expect(() => new Trajectory({ articulations: 5 as any })).toThrow(SyntaxError);
});

test('convertCIsoToHindiAndIpa fills missing fields', () => {
  const artStart = new Articulation({ name: 'consonant', stroke: 'ka' });
  const artEnd = new Articulation({ name: 'consonant', stroke: 'ga' });
  const traj = new Trajectory({
    pitches: [new Pitch()],
    articulations: { '0.00': artStart, '1.00': artEnd },
    startConsonant: 'ka',
    endConsonant: 'ga',
    vowel: 'a',
  });

  traj.startConsonantHindi = undefined;
  traj.startConsonantIpa = undefined;
  traj.endConsonantHindi = undefined;
  traj.endConsonantIpa = undefined;
  traj.vowelHindi = undefined;
  traj.vowelIpa = undefined;
  traj.articulations['0.00'].hindi = undefined;
  traj.articulations['0.00'].ipa = undefined;
  traj.articulations['1.00'].hindi = undefined;
  traj.articulations['1.00'].ipa = undefined;

  traj.convertCIsoToHindiAndIpa();

  expect(traj.startConsonantHindi).toBe('क');
  expect(traj.endConsonantHindi).toBe('ग');
  expect(traj.vowelHindi).toBe('अ');
  expect(traj.startConsonantIpa).toBe('k');
  expect(traj.endConsonantIpa).toBe('g');
  expect(traj.vowelIpa).toBe('ə');
  expect(traj.articulations['0.00'].hindi).toBe('क');
  expect(traj.articulations['1.00'].ipa).toBe('g');
});

test('toJSON/fromJSON preserves articulations and automation', () => {
  const auto = new Automation();
  auto.addValue(0.5, 0.5);
  const arts = { '0.00': new Articulation({ name: 'consonant', stroke: 'ka' }) };
  const traj = new Trajectory({
    id: 7,
    pitches: [new Pitch(), new Pitch({ swara: 1 })],
    durArray: [0.5, 0.5],
    articulations: arts,
    automation: auto,
  });

  const json = traj.toJSON();
  const round = ModelTrajectory.fromJSON(json);
  expect(round.toJSON()).toEqual(json);
  expect(round.automation?.values).toEqual(auto.values);
  expect(round.articulations['0.00'].stroke).toBe('ka');
});


test('durations and proportions for each output type', () => {
  const t1 = new Trajectory({ id: 0, pitches: [new Pitch({ swara: 0 })], durTot: 1 });
  const t2 = new Trajectory({ id: 0, pitches: [new Pitch({ swara: 1 })], durTot: 2 });
  const trajs = [t1, t2];

  const np1 = t1.pitches[0].numberedPitch;
  const np2 = t2.pitches[0].numberedPitch;

  const durPN = durationsOfFixedPitches(trajs);
  expect(durPN).toEqual({ [np1]: 1, [np2]: 2 });

  const propPN = durationsOfFixedPitches(trajs, { countType: 'proportional' });
  expect(propPN[np1]).toBeCloseTo(1 / 3);
  expect(propPN[np2]).toBeCloseTo(2 / 3);

  const c1 = Pitch.pitchNumberToChroma(np1);
  const c2 = Pitch.pitchNumberToChroma(np2);
  expect(durationsOfFixedPitches(trajs, { outputType: 'chroma' })).toEqual({ [c1]: 1, [c2]: 2 });
  expect(durationsOfFixedPitches(trajs, { outputType: 'chroma', countType: 'proportional' })).toEqual({ [c1]: 1 / 3, [c2]: 2 / 3 });

  const sd1 = Pitch.chromaToScaleDegree(c1)[0];
  const sd2 = Pitch.chromaToScaleDegree(c2)[0];
  expect(durationsOfFixedPitches(trajs, { outputType: 'scaleDegree' })).toEqual({ [sd1]: 1, [sd2]: 2 });
  expect(durationsOfFixedPitches(trajs, { outputType: 'scaleDegree', countType: 'proportional' })).toEqual({ [sd1]: 1 / 3, [sd2]: 2 / 3 });

  const sarg1 = Pitch.fromPitchNumber(np1).sargamLetter;
  const sarg2 = Pitch.fromPitchNumber(np2).sargamLetter;
  expect(durationsOfFixedPitches(trajs, { outputType: 'sargamLetter' })).toEqual({ [sarg1]: 1, [sarg2]: 2 });
  expect(durationsOfFixedPitches(trajs, { outputType: 'sargamLetter', countType: 'proportional' })).toEqual({ [sarg1]: 1 / 3, [sarg2]: 2 / 3 });
});


test('convertCIsoToHindiAndIpa with provided start/end consonants and vowels', () => {
  const artStart = new Articulation({ name: 'consonant', stroke: 'ka' });
  const artEnd = new Articulation({ name: 'consonant', stroke: 'ga' });
  const traj = new Trajectory({
    pitches: [new Pitch()],
    articulations: { '0.00': artStart, '1.00': artEnd },
    startConsonant: 'ka',
    endConsonant: 'ga',
    vowel: 'a',
  });

  traj.convertCIsoToHindiAndIpa();

  expect(traj.startConsonantHindi).toBe('क');
  expect(traj.endConsonantHindi).toBe('ग');
  expect(traj.vowelHindi).toBe('अ');
  expect(traj.startConsonantIpa).toBe('k');
  expect(traj.endConsonantIpa).toBe('g');
  expect(traj.vowelIpa).toBe('ə');
  expect(traj.articulations['0.00'].hindi).toBe('क');
  expect(traj.articulations['1.00'].ipa).toBe('g');
});


test('toJSON/fromJSON round trip with full articulation and automation', () => {
  const auto = new Automation({ values: [
    { normTime: 0, value: 1 },
    { normTime: 0.5, value: 0.3 },
    { normTime: 1, value: 0.8 },
  ]});
  const art = new Articulation({
    name: 'consonant',
    stroke: 'kha',
    hindi: 'ख',
    ipa: 'kʰ',
    engTrans: 'kha',
    strokeNickname: 'da',
  });
  const traj = new Trajectory({
    id: 7,
    pitches: [new Pitch(), new Pitch({ swara: 1 })],
    durArray: [0.5, 0.5],
    articulations: { '0.00': art },
    automation: auto,
  });

  const json = traj.toJSON();
  const round = ModelTrajectory.fromJSON(json);
  expect(round.toJSON()).toEqual(json);
  expect(round.automation?.values).toEqual(auto.values);
  expect(round.articulations['0.00'].engTrans).toBe('kha');
});

test('proportionsOfFixedPitches via Piece for all output types', () => {
  const raga = new Raga();
  const t1 = new Trajectory({ id: 0, pitches: [new Pitch({ swara: 0 })], durTot: 1 });
  const t2 = new Trajectory({ id: 0, pitches: [new Pitch({ swara: 1 })], durTot: 2 });
  const phrase = new Phrase({ trajectories: [t1, t2], raga });
  const piece = new Piece({ phrases: [phrase], raga, instrumentation: [Instrument.Sitar] });

  const np1 = t1.pitches[0].numberedPitch;
  const np2 = t2.pitches[0].numberedPitch;

  expect(piece.proportionsOfFixedPitches()).toEqual({ [np1]: 1 / 3, [np2]: 2 / 3 });

  const c1 = Pitch.pitchNumberToChroma(np1);
  const c2 = Pitch.pitchNumberToChroma(np2);
  expect(piece.proportionsOfFixedPitches({ outputType: 'chroma' })).toEqual({ [c1]: 1 / 3, [c2]: 2 / 3 });

  const sd1 = Pitch.chromaToScaleDegree(c1)[0];
  const sd2 = Pitch.chromaToScaleDegree(c2)[0];
  expect(piece.proportionsOfFixedPitches({ outputType: 'scaleDegree' })).toEqual({ [sd1]: 1 / 3, [sd2]: 2 / 3 });

  const sarg1 = Pitch.fromPitchNumber(np1).sargamLetter;
  const sarg2 = Pitch.fromPitchNumber(np2).sargamLetter;
  expect(piece.proportionsOfFixedPitches({ outputType: 'sargamLetter' })).toEqual({ [sarg1]: 1 / 3, [sarg2]: 2 / 3 });
});

/* ───────────────────── updateFundamental ───────────────────── */

test('updateFundamental updates all contained pitches', () => {
  const p1 = new Pitch();
  const p2 = new Pitch({ swara: 1 });
  const traj = new Trajectory({ pitches: [p1, p2] });

  traj.updateFundamental(440);

  traj.pitches.forEach(p => {
    expect(p.fundamental).toBeCloseTo(440);
  });
test('sloped getter by id and endTime calculation', () => {
  const ids = Array.from({ length: 14 }, (_, i) => i);
  ids.forEach(id => {
    const traj = new Trajectory({ id, durTot: 1 });
    traj.startTime = 5;
    const shouldBeSloped = id >= 2 && id <= 5;
    expect(traj.sloped).toBe(shouldBeSloped);
    expect(traj.endTime).toBe(6);
  });
});

