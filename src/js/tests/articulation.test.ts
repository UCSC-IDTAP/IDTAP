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

test('strokeNickname defaults to da for d stroke', () => {
  const a = new Articulation({ stroke: 'd' });
  expect(a.strokeNickname).toBe('da');
  expect(a.name).toBe('pluck');
  expect(a.stroke).toBe('d');
  expect(a.hindi).toBeUndefined();
  expect(a.ipa).toBeUndefined();
  expect(a.engTrans).toBeUndefined();
});

test('strokeNickname defaults to da for d stroke', () => {
  const a = new Articulation({ stroke: 'd' });
  expect(a.strokeNickname).toBe('da');
  expect(a.name).toBe('pluck');
  expect(a.stroke).toBe('d');
  expect(a.hindi).toBeUndefined();
  expect(a.ipa).toBeUndefined();
  expect(a.engTrans).toBeUndefined();
});

test('stroke r sets strokeNickname', () => {
  const a = new Articulation({ stroke: 'r' });
  expect(a.strokeNickname).toBe('ra');
});
  
test('stroke r via fromJSON sets strokeNickname', () => {
  const obj = { name: 'pluck', stroke: 'r' };
  const a = Articulation.fromJSON(obj);
  expect(a.strokeNickname).toBe('ra');
});
