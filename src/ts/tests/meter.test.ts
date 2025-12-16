import { expect, test, describe } from 'vitest';
import { Meter } from '@/js/meter';
import { Piece, Phrase, Trajectory, Pitch, Raga } from '@model';
import { Instrument, TalaName } from '@shared/enums';

describe('Segment boundary detection for tala meters', () => {
  test('getSegmentBoundaryIndices returns correct indices for Tintal', () => {
    const meter = Meter.fromTala(TalaName.Tintal, 0, 60, 1);
    // Tintal [[4,4,4,4], 4] should have vibhag boundaries at 0, 4, 8, 12
    const boundaries = meter.getSegmentBoundaryIndices();
    expect(boundaries).toEqual([0, 4, 8, 12]);
  });

  test('getSegmentBoundaryIndices returns correct indices for Jhoomra (asymmetric)', () => {
    const meter = Meter.fromTala(TalaName.Jhoomra, 0, 60, 1);
    // Jhoomra [[3,4,3,4], 4] should have vibhag boundaries at 0, 3, 7, 10
    const boundaries = meter.getSegmentBoundaryIndices();
    expect(boundaries).toEqual([0, 3, 7, 10]);
  });

  test('getSegmentBoundaryIndices handles multiple cycles', () => {
    const meter = Meter.fromTala(TalaName.Tintal, 0, 60, 2);
    // 2 cycles of Tintal: boundaries at 0,4,8,12 and 16,20,24,28
    const boundaries = meter.getSegmentBoundaryIndices();
    expect(boundaries).toEqual([0, 4, 8, 12, 16, 20, 24, 28]);
  });

  test('getSegmentBoundaryIndices returns empty for simple hierarchy', () => {
    const meter = new Meter({
      hierarchy: [4, 4],
      tempo: 60,
      startTime: 0,
      repetitions: 1,
    });
    // Simple hierarchy [4, 4] has no compound layer, so no segment boundaries
    const boundaries = meter.getSegmentBoundaryIndices();
    expect(boundaries).toEqual([]);
  });

  test('getMatraPulses returns correct number of pulses', () => {
    const meter = Meter.fromTala(TalaName.Tintal, 0, 60, 1);
    // Tintal has 16 matras per cycle
    const matraPulses = meter.getMatraPulses();
    expect(matraPulses.length).toBe(16);
  });

  test('isSegmentBoundary correctly identifies boundary pulses', () => {
    const meter = Meter.fromTala(TalaName.Tintal, 0, 60, 1);
    const matraPulses = meter.getMatraPulses();

    // Pulses at indices 0, 4, 8, 12 should be boundaries
    expect(meter.isSegmentBoundary(matraPulses[0])).toBe(true);
    expect(meter.isSegmentBoundary(matraPulses[4])).toBe(true);
    expect(meter.isSegmentBoundary(matraPulses[8])).toBe(true);
    expect(meter.isSegmentBoundary(matraPulses[12])).toBe(true);

    // Other pulses should not be boundaries
    expect(meter.isSegmentBoundary(matraPulses[1])).toBe(false);
    expect(meter.isSegmentBoundary(matraPulses[5])).toBe(false);
    expect(meter.isSegmentBoundary(matraPulses[15])).toBe(false);
  });

  test('getSegmentForMatraIndex returns correct segment ranges for Tintal', () => {
    const meter = Meter.fromTala(TalaName.Tintal, 0, 60, 1);

    // Index 0-3 should be in first segment
    expect(meter.getSegmentForMatraIndex(0)).toEqual({ start: 0, end: 4 });
    expect(meter.getSegmentForMatraIndex(3)).toEqual({ start: 0, end: 4 });

    // Index 4-7 should be in second segment
    expect(meter.getSegmentForMatraIndex(4)).toEqual({ start: 4, end: 8 });
    expect(meter.getSegmentForMatraIndex(7)).toEqual({ start: 4, end: 8 });

    // Index 12-15 should be in fourth segment
    expect(meter.getSegmentForMatraIndex(12)).toEqual({ start: 12, end: 16 });
    expect(meter.getSegmentForMatraIndex(15)).toEqual({ start: 12, end: 16 });
  });

  test('getSegmentForMatraIndex returns correct ranges for asymmetric Jhoomra', () => {
    const meter = Meter.fromTala(TalaName.Jhoomra, 0, 60, 1);

    // First segment: 0-2 (3 matras)
    expect(meter.getSegmentForMatraIndex(0)).toEqual({ start: 0, end: 3 });
    expect(meter.getSegmentForMatraIndex(2)).toEqual({ start: 0, end: 3 });

    // Second segment: 3-6 (4 matras)
    expect(meter.getSegmentForMatraIndex(3)).toEqual({ start: 3, end: 7 });
    expect(meter.getSegmentForMatraIndex(6)).toEqual({ start: 3, end: 7 });

    // Third segment: 7-9 (3 matras)
    expect(meter.getSegmentForMatraIndex(7)).toEqual({ start: 7, end: 10 });

    // Fourth segment: 10-13 (4 matras)
    expect(meter.getSegmentForMatraIndex(10)).toEqual({ start: 10, end: 14 });
  });
});

describe('Segment-aware pulse offset for tala meters', () => {
  test('offsetSegmentBoundary resets and evenly spaces BOTH segments', () => {
    const meter = Meter.fromTala(TalaName.Tintal, 0, 60, 1);
    const matraPulses = meter.getMatraPulses();

    // Tintal: vibhag boundaries at 0, 4, 8, 12
    // When nudging matra 4:
    // - PREVIOUS segment (matras 0-3) expands and resets to even spacing
    // - NEXT segment (matras 5-7) compresses and resets to even spacing
    // Initial times: [0, 1, 2, 3, 4, 5, 6, 7, 8, ...]
    const nextBoundaryTime = matraPulses[8].realTime; // This should NOT move

    // Offset the second vibhag boundary (matra 4) by +0.5 seconds
    const result = meter.offsetSegmentBoundary(matraPulses[4], 0.5);
    expect(result).toBe(true);

    const newTimesPrev = matraPulses.slice(0, 4).map(p => p.realTime);
    const newTimesNext = matraPulses.slice(5, 8).map(p => p.realTime);
    const newBoundaryTime = matraPulses[4].realTime;

    // The boundary pulse should have moved by +0.5s (from 4 to 4.5)
    expect(newBoundaryTime).toBeCloseTo(4.5, 3);

    // The NEXT vibhag boundary (matra 8) should NOT have moved
    expect(matraPulses[8].realTime).toBeCloseTo(nextBoundaryTime, 3);

    // Matra 0 (the previous boundary) should NOT have moved
    expect(newTimesPrev[0]).toBeCloseTo(0, 3);

    // PREVIOUS segment: 4s -> 4.5s (expands)
    // Matras 1, 2, 3 should be EVENLY SPACED in the new 4.5s segment
    // 4 pulses in segment, so spacing is 4.5/4 = 1.125s
    expect(newTimesPrev[1]).toBeCloseTo(1.125, 3);
    expect(newTimesPrev[2]).toBeCloseTo(2.25, 3);
    expect(newTimesPrev[3]).toBeCloseTo(3.375, 3);

    // NEXT segment: 4s -> 3.5s (compresses)
    // Matras 5, 6, 7 should be EVENLY SPACED in the new 3.5s segment
    // 4 pulses in segment (including boundary at start), so spacing is 3.5/4 = 0.875s
    expect(newTimesNext[0]).toBeCloseTo(4.5 + 0.875, 3);      // matra 5 at 5.375
    expect(newTimesNext[1]).toBeCloseTo(4.5 + 0.875 * 2, 3);  // matra 6 at 6.25
    expect(newTimesNext[2]).toBeCloseTo(4.5 + 0.875 * 3, 3);  // matra 7 at 7.125
  });

  test('offsetSegmentBoundary resets any previous manual adjustments', () => {
    const meter = Meter.fromTala(TalaName.Tintal, 0, 60, 1);
    const matraPulses = meter.getMatraPulses();

    // First, manually offset matra 5 (an internal pulse)
    meter._offsetPulseDirect(matraPulses[5], 0.3);
    expect(matraPulses[5].realTime).toBeCloseTo(5.3, 3);

    // Now nudge the vibhag boundary at matra 4
    meter.offsetSegmentBoundary(matraPulses[4], 0.5);

    // Matra 5 should be reset to evenly-spaced position, NOT 5.3 + some offset
    // New segment is 3.5s (from 4.5 to 8), with 4 pulses, spacing = 0.875s
    expect(matraPulses[5].realTime).toBeCloseTo(4.5 + 0.875, 3); // 5.375
  });

  test('offsetSegmentBoundary returns false for first boundary (matra 0)', () => {
    const meter = Meter.fromTala(TalaName.Tintal, 0, 60, 1);
    const matraPulses = meter.getMatraPulses();

    // Matra 0 is the first boundary - there's no previous segment to adjust
    const result = meter.offsetSegmentBoundary(matraPulses[0], 0.5);
    expect(result).toBe(false);
  });

  test('offsetSegmentBoundary returns false for non-boundary pulse', () => {
    const meter = Meter.fromTala(TalaName.Tintal, 0, 60, 1);
    const matraPulses = meter.getMatraPulses();

    // Matra 5 is not a boundary
    const result = meter.offsetSegmentBoundary(matraPulses[5], 0.5);
    expect(result).toBe(false);
  });

  test('offsetSegmentBoundary returns false for simple hierarchy meter', () => {
    const meter = new Meter({
      hierarchy: [4, 4],
      tempo: 60,
      startTime: 0,
      repetitions: 1,
    });
    const matraPulses = meter.getMatraPulses();

    // No segment boundaries in simple hierarchy
    const result = meter.offsetSegmentBoundary(matraPulses[0], 0.5);
    expect(result).toBe(false);
  });

  test('offsetSegmentBoundary works with asymmetric Jhoomra', () => {
    const meter = Meter.fromTala(TalaName.Jhoomra, 0, 60, 1);
    const matraPulses = meter.getMatraPulses();

    // Jhoomra: [[3,4,3,4], 4] - vibhag boundaries at 0, 3, 7, 10
    // Initial times: [0, 1, 2, 3, 4, 5, 6, 7, ...]
    // Nudging matra 3:
    // - PREVIOUS segment (matras 0-2, 3 matras) expands and resets
    // - NEXT segment (matras 4-6, 4 matras) compresses and resets
    const nextBoundaryTime = matraPulses[7].realTime;

    // Offset the second vibhag boundary (matra 3) by +0.25 seconds
    const result = meter.offsetSegmentBoundary(matraPulses[3], 0.25);
    expect(result).toBe(true);

    const newTimesPrev = matraPulses.slice(0, 3).map(p => p.realTime);
    const newTimesNext = matraPulses.slice(4, 7).map(p => p.realTime);
    const newBoundaryTime = matraPulses[3].realTime;

    // Boundary should have moved by +0.25s (from 3 to 3.25)
    expect(newBoundaryTime).toBeCloseTo(3.25, 3);

    // Next boundary (matra 7) should NOT have moved
    expect(matraPulses[7].realTime).toBeCloseTo(nextBoundaryTime, 3);

    // Matra 0 should NOT have moved
    expect(newTimesPrev[0]).toBeCloseTo(0, 3);

    // PREVIOUS segment: 3s -> 3.25s (expands)
    // 3 pulses in segment, so spacing is 3.25/3 ≈ 1.0833s
    const prevSpacing = 3.25 / 3;
    expect(newTimesPrev[1]).toBeCloseTo(prevSpacing, 3);
    expect(newTimesPrev[2]).toBeCloseTo(prevSpacing * 2, 3);

    // NEXT segment: 4s -> 3.75s (compresses)
    // 4 pulses in segment (including boundary), so spacing is 3.75/4 = 0.9375s
    const nextSpacing = 3.75 / 4;
    expect(newTimesNext[0]).toBeCloseTo(3.25 + nextSpacing, 3);      // matra 4
    expect(newTimesNext[1]).toBeCloseTo(3.25 + nextSpacing * 2, 3);  // matra 5
    expect(newTimesNext[2]).toBeCloseTo(3.25 + nextSpacing * 3, 3);  // matra 6
  });

  test('segment offset preserves through serialization', () => {
    const meter = Meter.fromTala(TalaName.Tintal, 0, 60, 1);
    const matraPulses = meter.getMatraPulses();

    // Offset a segment boundary
    meter.offsetSegmentBoundary(matraPulses[4], 0.3);
    const originalTimes = meter.getMatraPulses().map(p => p.realTime);

    // Serialize and deserialize
    const serialized = meter.toJSON();
    const deserialized = new Meter(serialized);
    const deserializedTimes = deserialized.getMatraPulses().map(p => p.realTime);

    // Times should be preserved
    originalTimes.forEach((time, i) => {
      expect(deserializedTimes[i]).toBeCloseTo(time, 5);
    });
  });
});

describe('Meter pulse structure serialization', () => {
  test('pulse offsets are preserved after serialization/deserialization', () => {
    // Create a simple meter with 4 pulses
    const meter = new Meter({
      hierarchy: [4],
      tempo: 60,
      startTime: 0,
      repetitions: 1,
    });

    // Verify initial pulse times: [0, 1, 2, 3]
    const initialRealTimes = meter.realTimes;
    expect(initialRealTimes).toEqual([0, 1, 2, 3]);

    // Offset pulse 2 (index 2) by -0.25 seconds
    const pulseToOffset = meter.allPulses[2];
    meter.offsetPulse(pulseToOffset, -0.25);

    // Verify adjusted pulse times
    const adjustedRealTimes = meter.realTimes;
    console.log('After offsetPulse, realTimes:', adjustedRealTimes);

    // Pulse 2 should now be at 1.75 instead of 2
    expect(adjustedRealTimes[2]).toBeCloseTo(1.75, 5);

    // Serialize and deserialize
    const serialized = meter.toJSON();
    console.log('Serialized meter:', JSON.stringify(serialized, null, 2));

    const deserialized = new Meter(serialized);

    // Check if deserialized pulse times match
    const deserializedRealTimes = deserialized.realTimes;
    console.log('Deserialized realTimes:', deserializedRealTimes);

    // This is the test that should fail if serialization is broken
    expect(deserializedRealTimes[2]).toBeCloseTo(1.75, 5);

    // Check all pulse times match
    adjustedRealTimes.forEach((time, i) => {
      expect(deserializedRealTimes[i]).toBeCloseTo(time, 5);
    });
  });

  test('pulse offsets preserved with 2-layer hierarchy', () => {
    // Create meter with 2-layer hierarchy [4, 2] = 4 beats subdivided into 2
    const meter = new Meter({
      hierarchy: [4, 2],
      tempo: 60,
      startTime: 0,
      repetitions: 1,
    });

    // Get initial state
    const initialRealTimes = meter.realTimes;
    console.log('Initial 2-layer realTimes:', initialRealTimes);

    // Offset a pulse in the lowest layer
    const pulseToOffset = meter.allPulses[4]; // 5th pulse
    const originalTime = pulseToOffset.realTime;
    meter.offsetPulse(pulseToOffset, 0.1);

    const adjustedRealTimes = meter.realTimes;
    console.log('Adjusted 2-layer realTimes:', adjustedRealTimes);

    // Serialize and deserialize
    const serialized = meter.toJSON();
    const deserialized = new Meter(serialized);

    const deserializedRealTimes = deserialized.realTimes;
    console.log('Deserialized 2-layer realTimes:', deserializedRealTimes);

    // Check all pulse times match
    adjustedRealTimes.forEach((time, i) => {
      expect(deserializedRealTimes[i]).toBeCloseTo(time, 5);
    });
  });

  test('multiple pulse offsets preserved', () => {
    const meter = new Meter({
      hierarchy: [4],
      tempo: 60,
      startTime: 0,
      repetitions: 1,
    });

    // Offset multiple pulses
    meter.offsetPulse(meter.allPulses[1], 0.1);
    meter.offsetPulse(meter.allPulses[2], -0.15);
    meter.offsetPulse(meter.allPulses[3], 0.05);

    const adjustedRealTimes = meter.realTimes;
    console.log('Multiple offsets realTimes:', adjustedRealTimes);

    // Serialize and deserialize
    const serialized = meter.toJSON();
    const deserialized = new Meter(serialized);

    const deserializedRealTimes = deserialized.realTimes;
    console.log('Deserialized multiple offsets realTimes:', deserializedRealTimes);

    // Check all pulse times match
    adjustedRealTimes.forEach((time, i) => {
      expect(deserializedRealTimes[i]).toBeCloseTo(time, 5);
    });
  });
});

describe('Meter serialization through Piece', () => {
  test('pulse offsets preserved through exact app save/load flow', () => {
    // This test simulates the exact flow in the app:
    // 1. savePiece() does JSON.stringify(piece)
    // 2. Server stores and returns the JSON
    // 3. Piece.fromJSON() reconstructs

    const raga = new Raga();
    const t1 = new Trajectory({ id: 0, pitches: [new Pitch()], durTot: 4 });
    const p1 = new Phrase({ trajectories: [t1], durTot: 4, raga });

    const meter = new Meter({
      hierarchy: [4],
      tempo: 60,
      startTime: 0,
      repetitions: 1,
    });

    const piece = new Piece({
      phrases: [p1],
      raga,
      meters: [meter],
      instrumentation: [Instrument.Sitar],
    });

    // Offset a pulse
    meter.offsetPulse(meter.allPulses[2], -0.25);
    const originalRealTimes = [...meter.realTimes];
    console.log('App flow test - Original realTimes:', originalRealTimes);
    expect(originalRealTimes[2]).toBeCloseTo(1.75, 5);

    // Simulate savePiece: JSON.stringify(piece) - this is what gets sent to server
    const savedJson = JSON.stringify(piece);
    console.log('App flow test - Saved JSON meters[0].pulseStructures[0][0].offsets:',
      JSON.parse(savedJson).meters[0].pulseStructures[0][0].offsets);

    // Simulate server returning and client loading: Piece.fromJSON(parsed)
    const loaded = Piece.fromJSON(JSON.parse(savedJson));
    const loadedRealTimes = loaded.meters[0].realTimes;
    console.log('App flow test - Loaded realTimes:', loadedRealTimes);

    // Verify offsets preserved
    originalRealTimes.forEach((time, i) => {
      expect(loadedRealTimes[i]).toBeCloseTo(time, 5);
    });
  });

  test('pulse offsets preserved through Piece.toJSON/fromJSON', () => {
    // Create a simple piece with a meter
    const raga = new Raga();
    const t1 = new Trajectory({ id: 0, pitches: [new Pitch()], durTot: 4 });
    const p1 = new Phrase({ trajectories: [t1], durTot: 4, raga });

    const meter = new Meter({
      hierarchy: [4],
      tempo: 60,
      startTime: 0,
      repetitions: 1,
    });

    const piece = new Piece({
      phrases: [p1],
      raga,
      meters: [meter],
      instrumentation: [Instrument.Sitar],
    });

    // Offset a pulse
    const pulseToOffset = meter.allPulses[2];
    meter.offsetPulse(pulseToOffset, -0.25);

    const adjustedRealTimes = meter.realTimes;
    console.log('Piece test - After offsetPulse, realTimes:', adjustedRealTimes);
    expect(adjustedRealTimes[2]).toBeCloseTo(1.75, 5);

    // Serialize and deserialize through Piece
    const serialized = piece.toJSON();
    console.log('Piece test - Serialized meters:', JSON.stringify(serialized.meters, null, 2));

    // Check what the raw meter data looks like after JSON round-trip
    const stringified = JSON.stringify(serialized);
    const parsed = JSON.parse(stringified);
    console.log('Piece test - After JSON round-trip, first meter pulseStructures[0][0]:',
      JSON.stringify(parsed.meters[0].pulseStructures[0][0], null, 2));

    // Check: is serialized.meters an array of Meter objects or plain objects?
    console.log('Piece test - Is serialized.meters[0] a Meter instance?', serialized.meters[0] instanceof Meter);
    console.log('Piece test - serialized.meters[0].pulseStructures type:', typeof serialized.meters[0].pulseStructures);

    // The actual real-world scenario: data goes through JSON.stringify/parse
    const deserialized = Piece.fromJSON(parsed);
    const deserializedMeter = deserialized.meters[0];
    const deserializedRealTimes = deserializedMeter.realTimes;
    console.log('Piece test - Deserialized realTimes:', deserializedRealTimes);

    // This test verifies the full round-trip through Piece
    expect(deserializedRealTimes[2]).toBeCloseTo(1.75, 5);

    adjustedRealTimes.forEach((time, i) => {
      expect(deserializedRealTimes[i]).toBeCloseTo(time, 5);
    });
  });

  test('pulse offsets preserved after multiple save/load cycles', () => {
    const raga = new Raga();
    const t1 = new Trajectory({ id: 0, pitches: [new Pitch()], durTot: 4 });
    const p1 = new Phrase({ trajectories: [t1], durTot: 4, raga });

    const meter = new Meter({
      hierarchy: [4],
      tempo: 60,
      startTime: 0,
      repetitions: 1,
    });

    let piece = new Piece({
      phrases: [p1],
      raga,
      meters: [meter],
      instrumentation: [Instrument.Sitar],
    });

    // Offset a pulse
    meter.offsetPulse(meter.allPulses[2], -0.25);
    const originalRealTimes = [...meter.realTimes];
    console.log('Multiple cycles - Original realTimes:', originalRealTimes);

    // Simulate multiple save/load cycles (with JSON round-trip like real save/load)
    for (let i = 0; i < 3; i++) {
      const serialized = piece.toJSON();
      const parsed = JSON.parse(JSON.stringify(serialized));
      piece = Piece.fromJSON(parsed);
      console.log(`Multiple cycles - After cycle ${i + 1}:`, piece.meters[0].realTimes);
    }

    const finalRealTimes = piece.meters[0].realTimes;
    console.log('Multiple cycles - Final realTimes:', finalRealTimes);

    // Check that pulse times are still correct after multiple cycles
    originalRealTimes.forEach((time, i) => {
      expect(finalRealTimes[i]).toBeCloseTo(time, 5);
    });
  });
});

describe('addTimePoints functionality', () => {
  test('addTimePoints works with multi-cycle input', () => {
    // Create a 1-cycle Tintal meter
    const meter = Meter.fromTala(TalaName.Tintal, 0, 60, 1);
    const initialPulseCount = meter.getMatraPulses().length;
    expect(initialPulseCount).toBe(16); // 1 cycle = 16 matras

    // Add 2 more cycles worth of time points (32 matras + end marker = 33 points)
    // Starting at the end of the first cycle (time 16)
    const newTimePoints: number[] = [];
    for (let i = 0; i <= 32; i++) {
      newTimePoints.push(16 + i); // Times 16, 17, 18, ..., 48
    }

    meter.addTimePoints(newTimePoints, 0);

    // Should now have 3 cycles = 48 matras
    const finalPulseCount = meter.getMatraPulses().length;
    expect(finalPulseCount).toBe(48);
  });

  test('addTimePoints redistributes last segment matras based on first new time point', () => {
    // Create a 1-cycle Tintal meter at 60 BPM
    const meter = Meter.fromTala(TalaName.Tintal, 0, 60, 1);
    const matraPulses = meter.getMatraPulses();

    // Initial state: matras at 0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15
    // Last vibhag boundary is at index 12 (time 12)
    // Matras 13, 14, 15 are in the last segment
    expect(matraPulses[12].realTime).toBeCloseTo(12, 3);
    expect(matraPulses[13].realTime).toBeCloseTo(13, 3);
    expect(matraPulses[14].realTime).toBeCloseTo(14, 3);
    expect(matraPulses[15].realTime).toBeCloseTo(15, 3);

    // Add a new time point at 17 (instead of 16)
    // This means the last segment is now 5 seconds (12 to 17) instead of 4
    // Matras 13, 14, 15 should be redistributed to fit evenly: 12 + 1.25, 12 + 2.5, 12 + 3.75
    meter.addTimePoints([17], 0);

    const updatedPulses = meter.getMatraPulses();
    // Matra 12 (boundary) stays at 12
    expect(updatedPulses[12].realTime).toBeCloseTo(12, 3);
    // Matras 13, 14, 15 are redistributed in 5s segment with 4 divisions
    // Positions: 12 + 5/4*1 = 13.25, 12 + 5/4*2 = 14.5, 12 + 5/4*3 = 15.75
    expect(updatedPulses[13].realTime).toBeCloseTo(13.25, 3);
    expect(updatedPulses[14].realTime).toBeCloseTo(14.5, 3);
    expect(updatedPulses[15].realTime).toBeCloseTo(15.75, 3);
  });

  test('addTimePoints with multiple new time points redistributes last segment', () => {
    // Create a 1-cycle Tintal meter at 60 BPM
    const meter = Meter.fromTala(TalaName.Tintal, 0, 60, 1);

    // Add time points for another cycle, but with first at 17.5 (slower than default 16)
    // Last segment (matra 12 to first new point) is 5.5 seconds instead of 4
    const newTimePoints = [17.5, 18.5, 19.5, 20.5, 21.5];
    meter.addTimePoints(newTimePoints, 0);

    const updatedPulses = meter.getMatraPulses();
    // Matras 13, 14, 15 redistributed in 5.5s segment with 4 divisions
    // Positions: 12 + 5.5/4*1 = 13.375, 12 + 5.5/4*2 = 14.75, 12 + 5.5/4*3 = 16.125
    expect(updatedPulses[13].realTime).toBeCloseTo(13.375, 2);
    expect(updatedPulses[14].realTime).toBeCloseTo(14.75, 2);
    expect(updatedPulses[15].realTime).toBeCloseTo(16.125, 2);
  });
});
