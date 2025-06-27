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
