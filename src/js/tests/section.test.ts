import { expect, test } from 'vitest';
import { Section, Phrase, Trajectory, Pitch } from '@model';

test('Section aggregates', () => {
  const p1 = new Phrase({ trajectories: [new Trajectory()] });
  const p2 = new Phrase({ trajectories: [new Trajectory()] });
  const sec = new Section({ phrases: [p1, p2] });
  expect(sec.trajectories.length).toBe(2);
  expect(sec.allPitches().length).toBe(2);
});

test('Section allPitches and trajectories getters', () => {
  const sa1 = new Trajectory({ pitches: [new Pitch({ swara: 'sa' })] });
  const sa2 = new Trajectory({ pitches: [new Pitch({ swara: 'sa' })] });
  const re = new Trajectory({ pitches: [new Pitch({ swara: 're' })] });

  const p1 = new Phrase({ trajectories: [sa1, sa2] });
  const p2 = new Phrase({ trajectories: [re] });
  const sec = new Section({ phrases: [p1, p2] });

  expect(sec.allPitches(false).length).toBe(2);
  expect(sec.trajectories).toEqual([sa1, sa2, re]);
});
