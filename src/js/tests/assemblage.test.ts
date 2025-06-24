import { expect, test } from 'vitest';
import { Assemblage, Phrase, Trajectory } from '@model';
import { Instrument } from '@shared/enums';

test('add strand and phrase', () => {
  const a = new Assemblage(Instrument.Sitar, 'asm');
  a.addStrand('main');
  const sid = a.strands[0].id;
  const phrase = new Phrase({ trajectories: [new Trajectory({ num: 0 })] });
  a.addPhrase(phrase, sid);
  expect(a.strands[0].phraseIDs).toEqual([phrase.uniqueId]);
  a.movePhraseToStrand(phrase);
  expect(a.strands[0].phraseIDs).toEqual([]);
  expect(a.loosePhrases).toEqual([phrase]);
  const desc = a.descriptor;
  const a2 = Assemblage.fromDescriptor(desc, [phrase]);
  expect(a2.descriptor).toEqual(desc);
});
