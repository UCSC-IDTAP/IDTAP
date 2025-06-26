import { expect, test } from 'vitest';
import { Phrase, Trajectory, Pitch, Group } from '../classes';

// helper to build simple phrase with given trajectories
const makePhrase = (trajectories: Trajectory[], startTime?: number) => {
  return new Phrase({ trajectories, startTime });
};

// getGroups and getGroupFromId
test('groups retrieval', () => {
  const t1 = new Trajectory();
  const t2 = new Trajectory();
  const phrase = makePhrase([t1, t2]);
  phrase.pieceIdx = 0;
  phrase.assignPhraseIdx();
  const g = new Group({ trajectories: [phrase.trajectories[0], phrase.trajectories[1]] });
  phrase.getGroups(0).push(g);
  expect(phrase.getGroups(0)).toEqual([g]);
  expect(phrase.getGroupFromId(g.id)).toEqual(g);
  expect(phrase.getGroupFromId('missing')).toEqual(undefined);
  expect(() => phrase.getGroups(1)).toThrow('No groups for this index');
});

// assignPhraseIdx
test('assignPhraseIdx sets trajectory indices', () => {
  const ts = [new Trajectory(), new Trajectory()];
  const phrase = makePhrase(ts);
  phrase.pieceIdx = 3;
  phrase.assignPhraseIdx();
  ts.forEach(t => expect(t.phraseIdx).toEqual(3));
  phrase.pieceIdx = undefined;
  phrase.assignPhraseIdx();
  ts.forEach(t => expect(t.phraseIdx).toEqual(undefined));
});

// assignTrajNums
test('assignTrajNums assigns sequential numbers', () => {
  const ts = [new Trajectory(), new Trajectory(), new Trajectory()];
  const phrase = makePhrase(ts);
  ts.forEach(t => (t.num = 99));
  phrase.assignTrajNums();
  ts.forEach((t, i) => expect(t.num).toEqual(i));
  const emptyPhrase = new Phrase();
  expect(() => emptyPhrase.assignTrajNums()).not.toThrow();
});

// assignStartTimes
test('assignStartTimes computes times and handles errors', () => {
  const ts = [new Trajectory(), new Trajectory(), new Trajectory()];
  const phrase = makePhrase(ts);
  phrase.assignStartTimes();
  const expected = [0, 1, 2];
  ts.forEach((t, i) => expect(t.startTime).toBeCloseTo(expected[i]));

  const p2 = new Phrase();
  // remove durArray
  // @ts-ignore
  p2.durArray = undefined;
  expect(() => p2.assignStartTimes()).toThrow('durArray is undefined');
  const p3 = new Phrase();
  p3.durTot = undefined as any;
  p3.durArray = [0.5, 0.5];
  expect(() => p3.assignStartTimes()).toThrow('durTot is undefined');
});

// updateFundamental
test('updateFundamental propagates to trajectories', () => {
  const t1 = new Trajectory({ pitches: [new Pitch()] });
  const t2 = new Trajectory({ pitches: [new Pitch()] });
  const phrase = makePhrase([t1, t2]);
  phrase.updateFundamental(440);
  t1.pitches.concat(t2.pitches).forEach(p => {
    expect(p.fundamental).toBeCloseTo(440);
  });
});

// allPitches
test('allPitches handles repetition and silence', () => {
  const p1 = new Pitch({ swara: 'sa' });
  const p2 = new Pitch({ swara: 're' });
  const t1 = new Trajectory({ pitches: [p1] });
  const t2 = new Trajectory({ pitches: [p2] });
  const t3 = new Trajectory({ pitches: [new Pitch({ swara: 're' })] });
  const silent = new Trajectory({ id: 12, pitches: [new Pitch()] });
  const phrase = makePhrase([t1, t2, t3, silent]);
  expect(phrase.allPitches()).toEqual([p1, p2, t3.pitches[0]]);
  expect(phrase.allPitches(false)).toEqual([p1, p2]);
});

// swara
test('swara returns pitch/time pairs and handles errors', () => {
  const ts = [new Trajectory(), new Trajectory(), new Trajectory()];
  const phrase = makePhrase(ts, 10);
  const times = phrase.swara.map(o => (o as any).time);
  expect(times).toEqual([10, 11, 12]);

  const p2 = new Phrase({ trajectories: [new Trajectory()] });
  expect(() => p2.swara).toThrow('startTime is undefined');

  const p3 = makePhrase([new Trajectory()], 0);
  p3.trajectories[0].startTime = undefined;
  expect(() => p3.swara).toThrow('traj.startTime is undefined');

  const p4 = makePhrase([new Trajectory()], 0);
  p4.trajectories[0].durArray = undefined as any;
  expect(() => p4.swara).toThrow('traj.durArray is undefined');
});
