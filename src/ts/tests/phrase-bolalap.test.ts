import { expect, test } from 'vitest';
import { Phrase, initPhraseCategorization } from '../model';

// Ensure missing "Bol Alap" property gets initialized to false

test('constructor fills missing Bol Alap categorization', () => {
  const custom = initPhraseCategorization();
  // Remove the property so constructor must add it
  delete custom.Elaboration['Bol Alap'];

  const phrase = new Phrase({ categorizationGrid: [custom] });

  expect(phrase.categorizationGrid[0].Elaboration['Bol Alap']).toBe(false);
});

