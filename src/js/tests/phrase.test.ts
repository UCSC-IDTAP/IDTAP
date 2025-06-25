import { expect, test } from 'vitest';
import { Phrase, Trajectory, Pitch, Raga } from '@model';

test('Phrase methods and serialization', () => {
  const t1 = new Trajectory({ num: 0, durTot: 0.5, pitches: [new Pitch()] });
  const t2 = new Trajectory({ num: 1, durTot: 0.5, pitches: [new Pitch({ swara: 'r' })] });
  const p = new Phrase({ trajectories: [t1, t2], raga: new Raga() });
  expect(p.durTot).toBeCloseTo(1);
  expect(p.compute(0.25)).toBeCloseTo(t1.compute(0.5));
  expect(p.getRange().min.numberedPitch).toBe(t1.pitches[0].numberedPitch);
  const nv = p.toNoteViewPhrase();
  expect(nv.pitches.length).toBe(2);
  const json = p.toJSON();
  const copy = Phrase.fromJSON(json);
  expect(copy.durTot).toBeCloseTo(1);
  expect(copy.trajectories.length).toBe(2);
});
