import { expect, test } from 'vitest';
import { Trajectory, Pitch, Articulation, linSpace } from '../classes';
import { Trajectory as ModelTrajectory } from '../../ts/model/trajectory';
import { findLastIndex } from 'lodash';

test('defaultTrajectory', () => {
  const t = new Trajectory();
  expect(t).toBeInstanceOf(Trajectory);
  expect(t.id).toEqual(0);
  expect(t.pitches).toEqual([new Pitch()]);
  expect(t.durTot).toEqual(1.0);
  expect(t.durArray).toEqual([1.0]);
  expect(t.slope).toEqual(2.0)
  const art = new Articulation({ stroke: "d"});
  expect(t.articulations).toEqual({ "0.00": art });
  expect(t.num).toEqual(undefined);
  expect(t.name).toEqual('Fixed');
  expect(t.fundID12).toEqual(undefined);
  const defVibObj = {
    periods: 8,
    vertOffset: 0,
    initUp: true,
    extent: 0.05
  }
  expect(t.vibObj).toEqual(defVibObj);
  expect(t.instrumentation).toEqual('Sitar');
  expect(t.vowel).toEqual(undefined);
  expect(t.vowelIpa).toEqual(undefined);
  expect(t.vowelHindi).toEqual(undefined);
  expect(t.vowelEngTrans).toEqual(undefined);
  expect(t.startConsonant).toEqual(undefined);
  expect(t.startConsonantHindi).toEqual(undefined);
  expect(t.startConsonantIpa).toEqual(undefined);
  expect(t.startConsonantEngTrans).toEqual(undefined);
  expect(t.endConsonant).toEqual(undefined);
  expect(t.endConsonantHindi).toEqual(undefined);
  expect(t.endConsonantIpa).toEqual(undefined);
  expect(t.endConsonantEngTrans).toEqual(undefined);
  expect(t.groupId).toEqual(undefined);
  const names = [
    'Fixed',
    'Bend: Simple',
    'Bend: Sloped Start',
    'Bend: Sloped End',
    'Bend: Ladle',
    'Bend: Reverse Ladle',
    'Bend: Simple Multiple',
    'Krintin',
    'Krintin Slide',
    'Krintin Slide Hammer',
    'Dense Krintin Slide Hammer',
    'Slide',
    'Silent',
    'Vibrato'
  ];
  expect(t.names).toEqual(names);
  // ids
  const structuredNames = {
    fixed: 0,
    bend: {
      simple: 1,
      'sloped start': 2,
      'sloped end': 3,
      ladle: 4,
      'reverse ladle': 5,
      yoyo: 6,
    },
    krintin: {
      'krintin': 7,
      'krintin slide': 8,
      'krintin slide hammer': 9,
      'spiffy krintin slide hammer': 10
    },
    slide: 11,
    silent: 12,
    vibrato: 13
  };
  expect(t.structuredNames).toEqual(structuredNames);
  const cIpas = ['k', 'kʰ', 'g', 'gʱ', 'ŋ', 'c', 'cʰ', 'ɟ', 'ɟʱ', 'ɲ', 'ʈ', 
  'ʈʰ', 'ɖ', 'ɖʱ', 'n', 't', 'tʰ', 'd', 'dʱ', 'n̪', 'p', 'pʰ', 'b', 'bʱ', 
  'm', 'j', 'r', 'l', 'v', 'ʃ', 'ʂ', 's', 'h'];
  const cIsos = ['ka', 'kha', 'ga', 'gha', 'ṅa', 'ca', 'cha', 'ja', 'jha', 
  'ña', 'ṭa', 'ṭha', 'ḍa', 'ḍha', 'na', 'ta', 'tha', 'da', 'dha', 'na', 
  'pa', 'pha', 'ba', 'bha', 'ma', 'ya', 'ra', 'la', 'va', 'śa', 'ṣa', 'sa', 
  'ha'];
  const cHindis = ['क', 'ख', 'ग', 'घ', 'ङ', 'च', 'छ', 'ज', 'झ', 'ञ', 'ट', 
  'ठ', 'ड', 'ढ', 'न', 'त', 'थ', 'द', 'ध', 'न', 'प', 'फ़', 'ब', 'भ', 'म', 'य', 
  'र', 'ल', 'व', 'श', 'ष', 'स', 'ह'];
  const cEngTrans = ['k', 'kh', 'g', 'gh', 'ṅ', 'c', 'ch', 'j', 'jh', 'ñ', 'ṭ', 
  'ṭh', 'ḍ', 'ḍh', 'n', 't', 'th', 'd', 'dh', 'n', 'p', 'ph', 'b', 'bh', 
  'm', 'y', 'r', 'l', 'v', 'ś', 'ṣ', 's', 'h'];
  const vIpas = ['ə', 'aː', 'ɪ', 'iː', 'ʊ', 'uː', 'eː', 'ɛː', 'oː', 'ɔː', '_'];
  const vIsos = ['a', 'ā', 'i', 'ī', 'u', 'ū', 'ē', 'ai', 'ō', 'au', '_'];
  const vHindis = ['अ', 'आ', 'इ', 'ई', 'उ', 'ऊ', 'ए', 'ऐ', 'ओ', 'औ', '_'];
  const vEngTrans = ['a', 'ā', 'i', 'ī', 'u', 'ū', 'ē', 'ai', 'ō', 'au', '_'];
  expect(t.cIpas).toEqual(cIpas);
  expect(t.cIsos).toEqual(cIsos);
  expect(t.cHindis).toEqual(cHindis);
  expect(t.cEngTrans).toEqual(cEngTrans);
  expect(t.vIpas).toEqual(vIpas);
  expect(t.vIsos).toEqual(vIsos);
  expect(t.vHindis).toEqual(vHindis);
  expect(t.vEngTrans).toEqual(vEngTrans);

  // getters
  expect(t.freqs).toEqual([261.63]);
  expect(t.logFreqs).toEqual([Math.log2(261.63)]);
  expect(t.minFreq).toEqual(261.63);
  expect(t.maxFreq).toEqual(261.63);
  expect(t.endTime).toEqual(undefined)

  // set externally, or not at all
  expect(t.startTime).toEqual(undefined);
  
  // funcs
  expect(t.compute(0.5)).toBeCloseTo(261.63);
  expect(t.compute(0.5, true)).toBeCloseTo(Math.log2(261.63));

  const testPts = linSpace(0, 1, 10);
  let testVals = testPts.map(x => t.compute(x));
  testVals.forEach(val => {
    expect(val).toBeCloseTo(261.63);
  })
  testVals = testPts.map(x => t.compute(x, true)); // log2 version
  testVals.forEach(val => {
    expect(val).toBeCloseTo(Math.log2(261.63));
  })

  // id0 will be same as default, but for redundancy
  testVals = testPts.map(x => t.id0(x))
  testVals.forEach(val => {
    expect(val).toBeCloseTo(261.63);
  })

  // id1
  let logFreqs = [Math.log2(261.63), Math.log2(523.25)];
  testVals = testPts.map(x => t.id1(x, logFreqs));
  testVals.forEach((val, idx) => {
    const x = testPts[idx];
    const piX = (Math.cos(Math.PI * (x + 1)) / 2) + 0.5;
    const diff = logFreqs[1] - logFreqs[0];
    const expected = 2 ** (piX * diff + logFreqs[0]);
    expect(val).toBeCloseTo(expected);
  })

  // id2, same logFreqs
  testVals = testPts.map(x => t.id2(x, logFreqs));
  testVals.forEach((val, idx) => {
    const x = testPts[idx];
    const sl = t.slope;
    const a = logFreqs[0];
    const b = logFreqs[1];
    const logOut = (a - b) * ((1 - x) ** sl) + b;
    const expected = 2 ** logOut;
    expect(val).toBeCloseTo(expected);
  })

  // id3, same logFreqs
  testVals = testPts.map(x => t.id3(x, logFreqs));
  testVals.forEach((val, idx) => {
    const x = testPts[idx];
    const sl = t.slope;
    const a = logFreqs[0];
    const b = logFreqs[1];
    const logOut = (b - a) * (x ** sl) + a;
    const expected = 2 ** logOut;
    expect(val).toBeCloseTo(expected);
  })

  // id4, 3 points
  logFreqs.push(Math.log2(261.63));
  let durArray = [0.4, 0.6];
  testVals = testPts.map(x => t.id4(x, logFreqs, t.slope, durArray));
  testVals.forEach((val, idx) => {
    const x = testPts[idx];
    const sl = t.slope;
    const bend0 = (x: number) => t.id2(x, logFreqs.slice(0, 2), sl);
    const bend1 = (x: number) => t.id1(x, logFreqs.slice(1, 3));
    const out0 = (x: number) => bend0(x / durArray[0]);
    const out1 = (x: number) => bend1((x - durArray[0]) / durArray[1]);
    const expected = x < durArray[0] ? out0(x) : out1(x);
    expect(val).toBeCloseTo(expected);
  })

  // id5, same logFreqs
  testVals = testPts.map(x => t.id5(x, logFreqs, t.slope, durArray));
  testVals.forEach((val, idx) => {
    const x = testPts[idx];
    const sl = t.slope;
    const bend0 = (x: number) => t.id1(x, logFreqs.slice(0, 2));
    const bend1 = (x: number) => t.id3(x, logFreqs.slice(1, 3), sl);
    const out0 = (x: number) => bend0(x / durArray[0]);
    const out1 = (x: number) => bend1((x - durArray[0]) / durArray[1]);
    const expected = x < durArray[0] ? out0(x) : out1(x);
    expect(val).toBeCloseTo(expected);
  })

  // id6, 4 points
  logFreqs.push(Math.log2(523.25));
  durArray = [0.2, 0.3, 0.5];
  testVals = testPts.map(x => t.id6(x, logFreqs, durArray));
  const bends = durArray.map((_, idx) => {
    return (x: number) => t.id1(x, logFreqs.slice(idx, idx + 2));
  })
  const outs = durArray.map((dur, idx) => {
    const durSum = idx === 0 ? 
      0: 
      durArray.slice(0, idx).reduce((a, b) => a + b, 0);
    return (x: number) => bends[idx]((x - durSum) / dur);
  })
  testVals.forEach((val, idx) => {
    const x = testPts[idx];
    const starts = [0];
    for (let i = 0; i < durArray.length - 1; i++) {
      starts.push(starts[i] + durArray[i]);
    }
    const outIdx = findLastIndex(starts, (start) => x >= start);
    const expected = outs[outIdx](x);
    expect(val).toBeCloseTo(expected);
  })





})

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
  const round = ModelTrajectory.fromJSON(json);
  expect(round.toJSON()).toEqual(json);
});


test('compute id7-id13', () => {
  const logFreqs = [Math.log2(261.63), Math.log2(523.25), Math.log2(392.0), Math.log2(261.63), Math.log2(523.25), Math.log2(392.0)];
  const durArray = [0.2, 0.2, 0.2, 0.2, 0.2];
  const t = new Trajectory({ id: 0 });
  const pts = linSpace(0, 1, 10);
  // id7
  let vals = pts.map(x => t.id7(x, logFreqs.slice(0,2), [0.3,0.7]));
  vals.forEach((val, i) => {
    const x = pts[i];
    const expected = x < 0.3 ? 261.63 : 523.25;
    expect(val).toBeCloseTo(expected);
  });
  // id8
  vals = pts.map(x => t.id8(x, logFreqs.slice(0,3), [0.2,0.3,0.5]));
  vals.forEach((val, i) => {
    const x = pts[i];
    const starts = [0,0.2,0.5];
    const idx = findLastIndex(starts, s => x >= s);
    const expected = 2 ** logFreqs.slice(0,3)[idx];
    expect(val).toBeCloseTo(expected);
  });
  // id9
  vals = pts.map(x => t.id9(x, logFreqs.slice(0,4), [0.25,0.25,0.25,0.25]));
  vals.forEach((val, i) => {
    const x = pts[i];
    const starts = [0,0.25,0.5,0.75];
    const idx = findLastIndex(starts, s => x >= s);
    const expected = 2 ** logFreqs.slice(0,4)[idx];
    expect(val).toBeCloseTo(expected);
  });
  // id10
  vals = pts.map(x => t.id10(x, logFreqs, [1/6,1/6,1/6,1/6,1/6,1/6]));
  vals.forEach((val, i) => {
    const x = pts[i];
    const starts = [0,1/6,2/6,3/6,4/6,5/6];
    const idx = findLastIndex(starts, s => x >= s);
    const expected = 2 ** logFreqs[idx];
    expect(val).toBeCloseTo(expected);
  });
  // id12
  const t12 = new Trajectory({ id: 12, fundID12: 220 });
  expect(t12.id12(0.5)).toBeCloseTo(220);
  // id13
  const vib = { periods: 2, vertOffset: 0, initUp: true, extent: 0.1 };
  const t13 = new Trajectory({ id: 13, vibObj: vib });
  const expected13 = (x: number) => {
    const periods = vib.periods;
    let vertOffset = vib.vertOffset;
    const initUp = vib.initUp;
    const extent = vib.extent;
    if (Math.abs(vertOffset) > extent / 2) {
      vertOffset = Math.sign(vertOffset) * extent / 2;
    }
    let out = Math.cos(x * 2 * Math.PI * periods + Number(initUp) * Math.PI);
    if (x < 1 / (2 * periods)) {
      const start = Math.log2(t13.freqs[0]);
      const end = Math.log2(t13.id13(1 / (2 * periods)));
      const middle = (end + start) / 2;
      const ext = Math.abs(end - start) / 2;
      out = out * ext + middle;
      return 2 ** out;
    } else if (x > 1 - 1 / (2 * periods)) {
      const start = Math.log2(t13.id13(1 - 1 / (2 * periods)));
      const end = Math.log2(t13.freqs[0]);
      const middle = (end + start) / 2;
      const ext = Math.abs(end - start) / 2;
      out = out * ext + middle;
      return 2 ** out;
    } else {
      return 2 ** (out * extent / 2 + vertOffset + Math.log2(t13.freqs[0]));
    }
  };
  pts.forEach((x, i) => {
    expect(t13.id13(x)).toBeCloseTo(expected13(x));
  });
});


test('invalid consonant and vowel helpers', () => {
  const t = new Trajectory();
  t.updateVowel('zz');
  expect(t.vowelHindi).toBeUndefined();
  expect(t.vowelIpa).toBeUndefined();
  t.addConsonant('zz');
  expect(t.startConsonantHindi).toBeUndefined();
  expect(t.startConsonantIpa).toBeUndefined();
  const art = new Articulation({ name: 'consonant', stroke: 'zz' });
  t.articulations['0.50'] = art;
  expect(() => t.convertCIsoToHindiAndIpa()).not.toThrow();
  expect(t.articulations['0.50'].hindi).toBeUndefined();
});

