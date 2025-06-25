import { expect, test } from 'vitest';
import { readFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import { Piece } from '@model';

const __dirname = dirname(fileURLToPath(import.meta.url));
const pieceData = JSON.parse(readFileSync(join(__dirname, 'fixtures/serialization_test.json'), 'utf-8'));

test('Piece serialization from fixture', () => {
  const piece = Piece.fromJSON(pieceData);
  const json = piece.toJSON();
  const copy = Piece.fromJSON(json);
  expect(copy.toJSON()).toEqual(json);
});
