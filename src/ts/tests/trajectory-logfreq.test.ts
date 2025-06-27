import { expect, test } from 'vitest';
import { Trajectory, Pitch } from '../model';

// minLogFreq and maxLogFreq should reflect the range of log frequencies

test('minLogFreq and maxLogFreq compute from pitches', () => {
  const c4 = Pitch.fromPitchNumber(0); // C4 ~261.63 Hz
  const g4 = Pitch.fromPitchNumber(7); // G4 ~392 Hz
  const traj = new Trajectory({ pitches: [c4, g4] });

  const minFreq = Math.min(c4.frequency, g4.frequency);
  const maxFreq = Math.max(c4.frequency, g4.frequency);
  expect(traj.minLogFreq).toBeCloseTo(Math.log2(minFreq));
  expect(traj.maxLogFreq).toBeCloseTo(Math.log2(maxFreq));
});
