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
  const desc = a.descriptor;
  const a2 = Assemblage.fromDescriptor(desc, [p1, p2]);
  expect(a2.descriptor).toEqual(desc);
});
