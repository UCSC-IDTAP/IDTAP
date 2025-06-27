import { expect, test } from 'vitest';
import { NoteViewPhrase, Pitch, Raga } from '@model';

test('NoteViewPhrase basic', () => {
  const r = new Raga();
  const nv = new NoteViewPhrase({ pitches: [new Pitch()], durTot: 1, raga: r, startTime: 0 });
  expect(nv.pitches.length).toBe(1);
  expect(nv.durTot).toBe(1);
  expect(nv.raga).toBeInstanceOf(Raga);
  expect(nv.startTime).toBe(0);
});
