import { expect, test, describe } from 'vitest';
import { Meter } from '@/js/meter';
import { Piece, Phrase, Trajectory, Pitch, Raga } from '@model';
import { Instrument } from '@shared/enums';

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
