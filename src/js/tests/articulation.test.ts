import { expect, test } from 'vitest';
import { Articulation } from '../classes';

test('defaultArticulation', () => {
  const a = new Articulation();
  expect(a).toBeInstanceOf(Articulation);
  expect(a.name).toEqual('pluck');
  expect(a.stroke).toEqual(undefined);
  expect(a.hindi).toEqual(undefined);
  expect(a.ipa).toEqual(undefined);
  expect(a.engTrans).toEqual(undefined);
});
