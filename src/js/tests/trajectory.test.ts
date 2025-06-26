import { expect, test } from 'vitest';
import { Trajectory, Pitch, Articulation, linSpace } from '../classes';
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