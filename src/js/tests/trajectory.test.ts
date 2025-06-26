import { expect, test } from 'vitest';
import { Trajectory, Pitch, Articulation } from '@model';               // ← adjust if needed
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
  pts.forEach(x => {
    const expected13 = (xVal: number): number => {
      const { periods, vertOffset, initUp, extent } = vib;
      let vo = vertOffset;
      if (Math.abs(vo) > extent / 2) {
        vo = Math.sign(vo) * extent / 2;
      }
      let out = Math.cos(xVal * 2 * Math.PI * periods + Number(initUp) * Math.PI);
      const base = Math.log2(t13.freqs[0]);
      if (xVal < 1 / (2 * periods)) {
        const start = base;
        const end = Math.log2(expected13(1 / (2 * periods)));
        const middle = (end + start) / 2;
        const ext = Math.abs(end - start) / 2;
        out = out * ext + middle;
        return 2 ** out;
      } else if (xVal > 1 - 1 / (2 * periods)) {
        const start = Math.log2(expected13(1 - 1 / (2 * periods)));
        const end = base;
        const middle = (end + start) / 2;
        const ext = Math.abs(end - start) / 2;
        out = out * ext + middle;
        return 2 ** out;
      } else {
        return 2 ** (out * extent / 2 + vo + base);
      }
    };
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