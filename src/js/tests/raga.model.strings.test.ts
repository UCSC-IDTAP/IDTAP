import { expect, test } from 'vitest';
import { Raga } from '@model';

// Ensure solfegeStrings, pcStrings, and westernPitchStrings
// match the values computed from getPitches()

test('model raga string getters', () => {
  const r = new Raga();
  const pl = r.getPitches({ low: r.fundamental, high: r.fundamental * 1.999 });
  const solfege = pl.map(p => p.solfegeLetter);
  const pcs = pl.map(p => p.chroma.toString());
  const western = pl.map(p => p.westernPitch);
  expect(r.solfegeStrings).toEqual(solfege);
  expect(r.pcStrings).toEqual(pcs);
  expect(r.westernPitchStrings).toEqual(western);
});
