import { expect, test } from 'vitest';
import { NoteViewPhrase, Pitch, Raga } from '@model';

test('default note view phrase', () => {
  const nv = new NoteViewPhrase({});
  expect(nv.pitches).toEqual([]);
  expect(nv.durTot).toBeUndefined();
  expect(nv.raga).toBeUndefined();
  expect(nv.startTime).toBeUndefined();
});

test('constructor assigns fields', () => {
  const p = new Pitch();
  const r = new Raga();
  const nv = new NoteViewPhrase({ pitches: [p], durTot: 1, raga: r, startTime: 2 });
  expect(nv.pitches).toEqual([p]);
  expect(nv.durTot).toBe(1);
  expect(nv.raga).toBe(r);
  expect(nv.startTime).toBe(2);
});
