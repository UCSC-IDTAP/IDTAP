import { expect, test } from 'vitest';
import { Meter, Pulse, PulseStructure, findClosestIdxs } from '@/js/meter';

test('meter reset tempo for hierarchy.length === 1 (and 2)', () => {
  const m = new Meter();
  expect(m).toBeInstanceOf(Meter);
  expect(m.realTimes).toEqual([
    0, 0.25, 0.5, 0.75, 
    1, 1.25, 1.5, 1.75,
    2, 2.25, 2.5, 2.75, 
    3, 3.25, 3.5, 3.75]);
  const a = new Meter({ hierarchy: [4] });
  expect(a.realTimes).toEqual([0, 1, 2, 3])
  const lastPulse = a.allPulses[a.allPulses.length - 1];
  a.offsetPulse(lastPulse, -0.5)
  expect(a.realTimes).toEqual([0, 1, 2, 2.5])
  a.resetTempo();
  expect(a.realTimes).toEqual([0, 1, 2, 2.5])
  a.growCycle();
  const times = [0, 1, 2, 2.5, 10/3, 25/6, 30/6, 35/6 ];
  a.realTimes.forEach((rt, i) => {
    expect(rt).toBeCloseTo(times[i], 8)
  })

  const b = new Meter({ hierarchy: [[2, 2]] });
  expect(b.realTimes).toEqual([0, 1, 2, 3]);
  const bLastPulse = b.allPulses[b.allPulses.length - 1];
  b.offsetPulse(bLastPulse, -0.5)
  expect(b.realTimes).toEqual([0, 1, 2, 2.5]);
  b.resetTempo();
  expect(b.realTimes).toEqual([0, 1, 2, 2.5]);
  b.growCycle();
  b.realTimes.forEach((rt, i) => {
    expect(rt).toBeCloseTo(times[i], 8)
  })

  const c = new Meter({ hierarchy: [2, 2], tempo: 30 });
  expect(c.realTimes).toEqual([0, 1, 2, 3]);
  const cLastPulse = c.allPulses[c.allPulses.length - 1];
  c.offsetPulse(cLastPulse, -0.5)
  expect(c.realTimes).toEqual([0, 1, 2, 2.5]);
  c.resetTempo();
  expect(c.realTimes).toEqual([0, 1, 2, 2.5]);
  c.growCycle();
  c.realTimes.forEach((rt, i) => {
    expect(rt).toBeCloseTo(times[i], 8)
  })

  const d = new Meter({ hierarchy: [2, 2, 2], tempo: 30 });
  expect(d.realTimes).toEqual([0, 0.5, 1, 1.5, 2, 2.5, 3, 3.5]);
  const dLastPulse = d.allPulses[d.allPulses.length - 1];
  d.offsetPulse(dLastPulse, -0.25)
  expect(d.realTimes).toEqual([0, 0.5, 1, 1.5, 2, 2.5, 3, 3.25]);
  d.resetTempo();
  expect(d.realTimes).toEqual([0, 0.5, 1, 1.5, 2, 2.5, 3, 3.25]);
  d.growCycle();
  const end1 = 3.25 * 8 / 7;
  const bit = end1 / 8;
  const nextTimes = Array(8).fill(0).map((_, i) => end1 + bit * i);
  const allTimes = [0, 0.5, 1, 1.5, 2, 2.5, 3, 3.25, ...nextTimes];
  d.realTimes.forEach((rt, i) => {
    expect(rt).toBeCloseTo(allTimes[i], 8)
  })

  const e = new Meter({ hierarchy: [2, 2, 2, 2], tempo: 15 });
  expect(e.realTimes).toEqual([
    0, 0.5, 1, 1.5, 2, 2.5, 3, 3.5,
    4, 4.5, 5, 5.5, 6, 6.5, 7, 7.5
  ]);
  const eLastPulse = e.allPulses[e.allPulses.length - 1];
  e.offsetPulse(eLastPulse, -0.25)
  const targetTimes = [
    0, 0.5, 1, 1.5, 2, 2.5, 3, 3.5,
    4, 4.5, 5, 5.5, 6, 6.5, 7, 7.25
  ];
  expect(e.realTimes).toEqual(targetTimes);
  e.resetTempo();
  
  e.realTimes.forEach((rt, i) => {
    expect(rt).toBeCloseTo(targetTimes[i], 8)
  })
  e.growCycle();
  const end2 = 7.25 * 16 / 15;
  const bit2 = end2 / 16;
  const nextTimes2 = Array(16).fill(0).map((_, i) => end2 + bit2 * i);
  const allTimes2 = [
    0, 0.5, 1, 1.5, 2, 2.5, 3, 3.5,
    4, 4.5, 5, 5.5, 6, 6.5, 7, 7.25, ...nextTimes2
  ];
  e.realTimes.forEach((rt, i) => {
    expect(rt).toBeCloseTo(allTimes2[i], 8)
  })
})

test('meter reset tempo for more compplicated single layer hierarchy', () => {
  const a = new Meter({ hierarchy: [7] });
  const b = new Meter({ hierarchy: [[2, 2, 3]] });
  expect(a.realTimes).toEqual(b.realTimes);
  const aLastPulse = a.allPulses[a.allPulses.length - 1];
  const bLastPulse = b.allPulses[b.allPulses.length - 1];
  const aThirdPulse = a.allPulses[2];
  const bThirdPulse = b.allPulses[2];
  a.offsetPulse(aThirdPulse, 0.1)
  b.offsetPulse(bThirdPulse, 0.1)
  a.offsetPulse(aLastPulse, -0.5)
  b.offsetPulse(bLastPulse, -0.5)
  expect(a.realTimes).toEqual(b.realTimes);
  a.resetTempo();
  b.resetTempo();
  a.realTimes.forEach((rt, i) => {
    expect(rt).toBeCloseTo(b.realTimes[i], 8)
  })
  a.growCycle();
  b.growCycle();
  a.realTimes.forEach((rt, i) => {
    expect(rt).toBeCloseTo(b.realTimes[i], 8)
  })
})

test('regenerating each class', () => {
  const pulse = new Pulse();
  expect(pulse).toBeInstanceOf(Pulse);
  const frozen = JSON.stringify(pulse);
  const newPulse = new Pulse(JSON.parse(frozen));
  expect(newPulse).toBeInstanceOf(Pulse);
  expect(newPulse).toEqual(pulse);

  const ps = new PulseStructure();
  expect(ps).toBeInstanceOf(PulseStructure);
  const frozen2 = JSON.stringify(ps);
  const newPS = new PulseStructure(JSON.parse(frozen2));
  expect(newPS).toBeInstanceOf(PulseStructure);
  expect(newPS).toEqual(ps);
  expect(newPS.pulses[0]).toBeInstanceOf(Pulse);

  const m = new Meter();
  expect(m).toBeInstanceOf(Meter);
  const frozen3 = JSON.stringify(m);
  const newM = new Meter(JSON.parse(frozen3));
  expect(newM).toBeInstanceOf(Meter);
  expect(newM).toEqual(m);


})

test('find closest idxs', () => {
  const trials = [1.1, 1.9, 4.4];
  const items = [0, 1, 2, 3, 4, 5, 6, 7];
  const expected = [1, 2, 4];
  expect(findClosestIdxs(trials, items)).toEqual(expected);
})

const includesWithTolerance = (array, target, tolerance) => {
  return array.some(item => Math.abs(item - target) <= tolerance);
}

test('adding pulses', () => {
  const m = new Meter();
  expect(m).toBeInstanceOf(Meter);
  expect(m.realTimes).toEqual([
    0, 0.25, 0.5, 0.75,
    1, 1.25, 1.5, 1.75,
    2, 2.25, 2.5, 2.75,
    3, 3.25, 3.5, 3.75
  ]);
  const newTimes = [4.6, 5.1, 5.7];
  m.addTimePoints(newTimes, 1);
  newTimes.forEach(nt => {
    expect(includesWithTolerance(m.realTimes, nt, 0.00000001)).toBe(true);
  })
  

})