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

test('getMusicalTime - basic functionality', () => {
  // Test Case 1: Regular meter with default level (finest level)
  const meter = new Meter({ hierarchy: [4, 4], tempo: 240, startTime: 0, repetitions: 3 });
  
  // Test basic boundary validation
  expect(meter.getMusicalTime(-1)).toBe(false); // Before start
  expect(meter.getMusicalTime(100)).toBe(false); // After end
  
  // Test valid time - halfway between subdivision 2 and 3 in 3rd cycle
  const result = meter.getMusicalTime(2.40625);
  expect(result).not.toBe(false);
  expect(result.cycleNumber).toBe(2); // Third cycle (0-indexed)
  expect(result.hierarchicalPosition).toEqual([1, 2]); // Beat 2, Subdivision 3
  expect(result.fractionalBeat).toBeCloseTo(0.5, 2); // Halfway between subdivisions
})

test('getMusicalTime - reference level functionality', () => {
  // Test Case 2: Reference level at beat level
  const meter = new Meter({ hierarchy: [4, 4], tempo: 240, startTime: 0, repetitions: 2 });
  
  // 1.375s = 2nd cycle, beat 1, subdivision 2 (exactly on pulse)
  const result = meter.getMusicalTime(1.375, 0); // reference_level=0 (beat level only)
  
  expect(result).not.toBe(false);
  expect(result.cycleNumber).toBe(1); // Second cycle
  expect(result.hierarchicalPosition).toEqual([1]); // Only beat level (beat 2) due to reference_level=0
  expect(result.fractionalBeat).toBeCloseTo(0.5, 2); // Halfway through beat
})

test('getMusicalTime - pulse-based cycle boundaries', () => {
  // Test that cycle boundaries are determined by actual pulse positions
  const meter = new Meter({ hierarchy: [4], tempo: 60, startTime: 0, repetitions: 2 });
  
  // Offset the last pulse of first cycle to create timing variation (rubato)
  const firstCycleLastPulse = meter.allPulses[3]; // 4th pulse (index 3)
  meter.offsetPulse(firstCycleLastPulse, 0.5); // Add 0.5 second delay
  
  // Test time right at the boundary - should use actual pulse timing
  const boundaryTime = firstCycleLastPulse.realTime + 0.1; // Just after the delayed pulse
  const result = meter.getMusicalTime(boundaryTime);
  
  expect(result).not.toBe(false);
  // Should still be in first cycle because the next cycle hasn't started yet
  expect(result.cycleNumber).toBe(0);
})

test('getMusicalTime - fractional beat calculation with rubato', () => {
  // Test that fractional beats use actual pulse-to-pulse durations
  const meter = new Meter({ hierarchy: [4], tempo: 60, startTime: 0, repetitions: 1 });
  
  // Offset second pulse to create uneven spacing
  const secondPulse = meter.allPulses[1];
  meter.offsetPulse(secondPulse, 0.3); // Move 0.3 seconds later
  
  // Test time between first and (delayed) second pulse
  const testTime = 0.5; // Halfway through the extended interval
  const result = meter.getMusicalTime(testTime);
  
  expect(result).not.toBe(false);
  expect(result.cycleNumber).toBe(0);
  expect(result.hierarchicalPosition).toEqual([0]); // Still on first beat
  
  // Fractional beat should be based on actual duration, not theoretical
  const actualDuration = meter.allPulses[1].realTime - meter.allPulses[0].realTime;
  const expectedFractional = (testTime - meter.allPulses[0].realTime) / actualDuration;
  expect(result.fractionalBeat).toBeCloseTo(expectedFractional, 3);
})

test('getMusicalTime - hierarchical position calculation', () => {
  // Test complex hierarchy position calculation
  const meter = new Meter({ hierarchy: [4, 3], tempo: 180, startTime: 0, repetitions: 1 });
  
  // Test various positions within the meter - use exact pulse times to avoid floating point precision issues
  const pulseTime1 = meter.realTimes[1]; // Beat 0, subdivision 1
  const pulseTime3 = meter.realTimes[3]; // Beat 1, subdivision 0 
  const pulseTime6 = meter.realTimes[6]; // Beat 2, subdivision 0
  const pulseTime9 = meter.realTimes[9]; // Beat 3, subdivision 0
  
  const positions = [
    { time: 0.0, expected: [0, 0] },          // Start of first beat, first subdivision
    { time: pulseTime1, expected: [0, 1] },   // First beat, second subdivision
    { time: pulseTime3, expected: [1, 0] },   // Second beat, first subdivision  
    { time: pulseTime6, expected: [2, 0] },   // Third beat, first subdivision
    { time: pulseTime9, expected: [3, 0] },   // Fourth beat, first subdivision
  ];
  
  positions.forEach(({ time, expected }) => {
    const result = meter.getMusicalTime(time);
    expect(result).not.toBe(false);
    expect(result.hierarchicalPosition).toEqual(expected);
  });
})

test('getMusicalTime - error handling', () => {
  const meter = new Meter({ hierarchy: [4, 4], tempo: 60, startTime: 0, repetitions: 1 });
  
  // Test invalid reference levels
  expect(() => meter.getMusicalTime(0.5, -1)).toThrow('reference_level must be non-negative');
  expect(() => meter.getMusicalTime(0.5, 2)).toThrow('reference_level 2 exceeds hierarchy depth 2');
  expect(() => meter.getMusicalTime(0.5, 1.5)).toThrow('reference_level must be an integer');
})

test('getMusicalTime - edge cases', () => {
  const meter = new Meter({ hierarchy: [4], tempo: 60, startTime: 1.0, repetitions: 2 });
  
  // Test exactly at start time
  const startResult = meter.getMusicalTime(1.0);
  expect(startResult).not.toBe(false);
  expect(startResult.cycleNumber).toBe(0);
  expect(startResult.hierarchicalPosition).toEqual([0]);
  expect(startResult.fractionalBeat).toBe(0.0);
  
  // Test exactly at end time (should return false)
  const endTime = meter.startTime + meter.repetitions * meter.cycleDur;
  expect(meter.getMusicalTime(endTime)).toBe(false);
  
  // Test just before end time (should be valid)
  const justBeforeEnd = endTime - 0.001;
  const endResult = meter.getMusicalTime(justBeforeEnd);
  expect(endResult).not.toBe(false);
  expect(endResult.cycleNumber).toBe(1); // Second cycle
})

test('getMusicalTime - final cycle boundary inclusion', () => {
  // Test that the final cycle includes its exact end time
  const meter = new Meter({ hierarchy: [2], tempo: 60, startTime: 0, repetitions: 2 });
  
  // The final pulse should be at time 3.0
  const finalPulseTime = meter.allPulses[meter.allPulses.length - 1].realTime;
  
  // Test exactly at final pulse time - should be valid
  const result = meter.getMusicalTime(finalPulseTime);
  expect(result).not.toBe(false);
  expect(result.cycleNumber).toBe(1); // Second cycle (final cycle)
})

test('getMusicalTime - consistency with getPulsesPerCycle', () => {
  // Test that getPulsesPerCycle helper works correctly for various hierarchies
  const testCases = [
    { hierarchy: [4], expected: 4 },
    { hierarchy: [4, 2], expected: 8 },
    { hierarchy: [4, 3], expected: 12 },
    { hierarchy: [[2, 2]], expected: 4 },
    { hierarchy: [[3, 2, 1]], expected: 6 },
    { hierarchy: [4, 2, 2], expected: 16 },
  ];
  
  testCases.forEach(({ hierarchy, expected }) => {
    const meter = new Meter({ hierarchy, tempo: 60, startTime: 0, repetitions: 1 });
    expect(meter.getPulsesPerCycle()).toBe(expected);
    expect(meter.allPulses.length).toBe(expected);
  });
})