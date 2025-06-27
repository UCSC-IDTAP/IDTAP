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
