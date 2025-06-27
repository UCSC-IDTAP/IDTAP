import { expect, test } from 'vitest';
import { Assemblage, Phrase } from '../model';
import { Instrument } from '@shared/enums';


test('Assemblage descriptor serialization', () => {
  const p1 = new Phrase({ startTime: 0 });
  const p2 = new Phrase({ startTime: 1 });

  const assemblage = new Assemblage(Instrument.Sitar, 'Test');
  assemblage.addStrand('first');
  const s1 = assemblage.strands[0];

  assemblage.addPhrase(p1, s1.id);
  assemblage.addPhrase(p2);

  const desc = assemblage.descriptor;
  expect(desc.instrument).toBe(Instrument.Sitar);
  expect(desc.name).toBe('Test');
  expect(desc.id).toBe(assemblage.id);
  expect(desc.strands.length).toBe(1);
  expect(desc.strands[0]).toEqual({ label: 'first', phraseIDs: [p1.uniqueId], id: s1.id });
  expect(desc.loosePhraseIDs).toEqual([p2.uniqueId]);

  const roundTrip = Assemblage.fromDescriptor(desc, [p1, p2]);
  expect(roundTrip.descriptor).toEqual(desc);

  roundTrip.addStrand('second');
  const s2 = roundTrip.strands[1];
  roundTrip.movePhraseToStrand(p2, s2.id);

  const desc2 = roundTrip.descriptor;
  expect(desc2.strands[1]).toEqual({ label: 'second', phraseIDs: [p2.uniqueId], id: s2.id });
  expect(desc2.loosePhraseIDs).toEqual([]);

  const roundTrip2 = Assemblage.fromDescriptor(desc2, [p1, p2]);
  expect(roundTrip2.descriptor).toEqual(desc2);
});

import { expect, test } from 'vitest';
import { Assemblage, Phrase, Trajectory } from '@model';
import { Instrument } from '@shared/enums';

test('Assemblage operations', () => {
  const p1 = new Phrase({ trajectories: [new Trajectory()] });
  const p2 = new Phrase({ trajectories: [new Trajectory()] });
  const a = new Assemblage(Instrument.Sitar, 'test');
  a.addStrand('first');
  a.addStrand('second');
  a.addPhrase(p1, a.strands[0].id);
  a.addPhrase(p2); // loose phrase
  expect(a.strands[0].phrases.length).toBe(1);
  expect(a.loosePhrases.length).toBe(1);
  a.movePhraseToStrand(p2, a.strands[1].id);
  expect(a.loosePhrases.length).toBe(0);
  expect(a.strands[1].phrases[0]).toBe(p2);
  a.removePhrase(p1);
  expect(a.phrases.includes(p1)).toBe(false);
  a.removeStrand(a.strands[0].id);
  expect(a.strands.length).toBe(1);
  const desc = a.descriptor;
  const a2 = Assemblage.fromDescriptor(desc, [p1, p2]);
  expect(a2.descriptor).toEqual(desc);
});

import { expect, test } from 'vitest';
import { Assemblage, Phrase, Strand } from '../model';
import { Instrument } from '@shared/enums';

// Strand error cases

test('Strand.addPhrase and removePhrase error handling', () => {
  const a = new Assemblage(Instrument.Sitar, 'A');
  a.addStrand('s');
  const strand = a.strands[0];
  const p = new Phrase();
  a.addPhrase(p); // register phrase in assemblage
  strand.addPhrase(p);
  expect(() => strand.addPhrase(p)).toThrow(Error);
  strand.removePhrase(p);
  expect(() => strand.removePhrase(p)).toThrow(Error);
});

// Assemblage.addStrand / addPhrase

test('Assemblage.addStrand and addPhrase duplicate and missing strand', () => {
  const a = new Assemblage(Instrument.Sitar, 'A');
  a.addStrand('dup');
  expect(() => a.addStrand('dup')).toThrow(Error);

  const p = new Phrase();
  a.addPhrase(p);
  expect(() => a.addPhrase(p)).toThrow(Error);
  expect(() => a.addPhrase(new Phrase(), 'missing')).toThrow(Error);
});

// Assemblage.removeStrand / removePhrase

test('Assemblage.removeStrand and removePhrase errors', () => {
  const a = new Assemblage(Instrument.Sitar, 'A');
  expect(() => a.removeStrand('bad')).toThrow(Error);
  const p = new Phrase();
  expect(() => a.removePhrase(p)).toThrow(Error);
});

// Assemblage.movePhraseToStrand branches

test('movePhraseToStrand removes from source when target missing', () => {
  const a = new Assemblage(Instrument.Sitar, 'A');
  a.addStrand('s1');
  const s1 = a.strands[0];
  const p = new Phrase();
  a.addPhrase(p, s1.id);
  a.movePhraseToStrand(p, 'none');
  expect(s1.phraseIDs).toEqual([]);
});

test('movePhraseToStrand errors if phrase not in assemblage', () => {
  const a = new Assemblage(Instrument.Sitar, 'A');
  a.addStrand('s1');
  const s1 = a.strands[0];
  const p = new Phrase();
  expect(() => a.movePhraseToStrand(p, s1.id)).toThrow(Error);
});

test('movePhraseToStrand moves phrase between strands', () => {
  const a = new Assemblage(Instrument.Sitar, 'A');
  a.addStrand('s1');
  a.addStrand('s2');
  const [s1, s2] = a.strands;
  const p = new Phrase();
  a.addPhrase(p, s1.id);
  a.movePhraseToStrand(p, s2.id);
  expect(s1.phraseIDs.includes(p.uniqueId)).toBe(false);
  expect(s2.phraseIDs).toEqual([p.uniqueId]);
});

// Assemblage.fromDescriptor validations

test('fromDescriptor throws on unknown phrase IDs', () => {
  const desc = {
    instrument: Instrument.Sitar,
    strands: [{ label: 's', phraseIDs: ['bad'], id: 'sid' }],
    name: 'A',
    id: 'id',
    loosePhraseIDs: []
  };
  expect(() => Assemblage.fromDescriptor(desc, [])).toThrow(Error);
});

test('fromDescriptor throws on unknown loose phrase IDs', () => {
  const desc = {
    instrument: Instrument.Sitar,
    strands: [],
    name: 'A',
    id: 'id',
    loosePhraseIDs: ['bad']
  };
  expect(() => Assemblage.fromDescriptor(desc, [])).toThrow(Error);
});
