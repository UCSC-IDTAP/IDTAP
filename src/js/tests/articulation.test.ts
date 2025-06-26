import { expect, test } from 'vitest';
import { Articulation } from '@model';

test('defaultArticulation', () => {
  const a = new Articulation();
  expect(a).toBeInstanceOf(Articulation);
  expect(a.name).toEqual('pluck');
  expect(a.stroke).toEqual(undefined);
  expect(a.hindi).toEqual(undefined);
  expect(a.ipa).toEqual(undefined);
  expect(a.engTrans).toEqual(undefined);
});

test('Articulation fromJSON', () => {
  const obj = { name: 'pluck', stroke: 'd', hindi: 'द', ipa: 'd̪', engTrans: 'da', strokeNickname: 'da' };
  const a = Articulation.fromJSON(obj);
  expect(a.stroke).toBe('d');
  expect(a.strokeNickname).toBe('da');
});
