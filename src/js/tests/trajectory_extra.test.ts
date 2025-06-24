import { expect, test } from 'vitest';
import { Trajectory, Pitch } from '../classes';

test('updateFundamental and fixed pitch durations', () => {
  const p = new Pitch();
  const t = new Trajectory({ id: 1, pitches: [p, p] });
  t.updateFundamental(440);
  expect(t.pitches[0].fundamental).toBe(440);
  expect(t.durationsOfFixedPitches()).toEqual({ [p.numberedPitch]: 1 });
});
