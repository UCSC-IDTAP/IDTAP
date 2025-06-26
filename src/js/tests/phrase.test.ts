import { expect, test } from 'vitest';
import { Phrase, Trajectory, Pitch, Raga, Chikari } from '@model';

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

test('Phrase utility functions', () => {
  const r = new Raga();
  const t1 = new Trajectory({ num: 0, durTot: 0.5, pitches: [new Pitch()] });
  t1.addConsonant('ka');
  t1.updateVowel('a');
  const silent1 = new Trajectory({ num: 1, id: 12, durTot: 0.25, pitches: [new Pitch()] });
  const silent2 = new Trajectory({ num: 2, id: 12, durTot: 0.25, pitches: [new Pitch()] });
  const t2 = new Trajectory({ num: 3, durTot: 0.5, pitches: [new Pitch({ swara: 'r' })] });
  t2.updateVowel('i');
  const p = new Phrase({ trajectories: [t1, silent1, silent2, t2], raga: r, startTime: 0 });
  p.reset();
  p.chikaris['0.3'] = new Chikari({});

  const idxs = p.firstTrajIdxs();
  expect(idxs).toContain(0);
  expect(idxs).toContain(3);
  expect(p.trajIdxFromTime(0.1)).toBe(0);

  const chiks = p.chikarisDuringTraj(t1, 0);
  expect(chiks.length).toBe(1);
  p.consolidateSilentTrajs();
  expect(p.trajectories.length).toBe(3);
});
