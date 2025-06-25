import { expect, test } from 'vitest';
import { Section, Phrase, Trajectory } from '@model';

test('Section aggregates', () => {
  const p1 = new Phrase({ trajectories: [new Trajectory()] });
  const p2 = new Phrase({ trajectories: [new Trajectory()] });
  const sec = new Section({ phrases: [p1, p2] });
  expect(sec.trajectories.length).toBe(2);
  expect(sec.allPitches().length).toBe(2);
});
