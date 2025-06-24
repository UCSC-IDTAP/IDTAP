import { expect, test } from 'vitest';
import { Section, Phrase, Trajectory, Pitch } from '../classes';

test('default section', () => {
  const s = new Section({});
  expect(s.phrases).toEqual([]);
  expect(Array.isArray(s.categorization)).toBe(false); // object with nested fields
  expect(s.adHocCategorization).toEqual([]);
});

test('allPitches and trajectories', () => {
  const t = new Trajectory({ num: 0 });
  const p = new Phrase({ trajectories: [t], startTime: 0 });
  const s = new Section({ phrases: [p] });
  expect(s.trajectories.length).toBe(1);
  expect(s.allPitches().length).toBe(1);
  expect(s.allPitches(false).length).toBe(1);
});
