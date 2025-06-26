import { expect, test } from 'vitest';
import { Automation } from '../model';


test('Automation', () => {
  const a = new Automation();
  expect(a).toBeInstanceOf(Automation);
  expect(a.values[0].normTime).toBe(0);
  expect(a.values[0].value).toBe(1);
  const valCurve = a.generateValueCurve(0.1, 1)
  expect(valCurve.length).toBe(11);
  expect(valCurve[0]).toBe(1);

  // setting values
  try {
    a.addValue(1.5, 0.5);
  } catch (e) {
    expect(e).toBeInstanceOf(SyntaxError);
  }
  try {
    a.addValue(-0.5, 0.5);
  } catch (e) {
    expect(e).toBeInstanceOf(SyntaxError);
  }
  try {
    a.addValue(0.5, -0.5);
  } catch (e) {
    expect(e).toBeInstanceOf(SyntaxError);
  }
  try {
    a.addValue(0.5, 1.5);
  } catch (e) {
    expect(e).toBeInstanceOf(SyntaxError);
  }

  a.addValue(1, 0);
  expect(a.values.length).toBe(2);
  const valCurve2 = a.generateValueCurve(0.1, 1)
  for (let i = 0; i < 11; i++) {
    expect(valCurve2[i]).toBeCloseTo(1 - (i / 10));
  }

  a.addValue(0.5, 0.2)
  expect(a.values.length).toBe(3);
  const valCurve3 = a.generateValueCurve(0.1, 1)
  const expectedVals = [
    1, 0.84, 0.68, 0.52, 0.36, 0.2, 
    0.16, 0.12, 0.08, 0.04, 0];
  for (let i = 0; i < 11; i++) {
    expect(valCurve3[i]).toBeCloseTo(expectedVals[i]);
  }
})

test('partition', () => {
  const orig = new Automation();
  orig.addValue(1, 0);
  const durArray = [0.4, 0.6];
  const children = orig.partition(durArray);
  expect(children.length).toBe(2);
  const c1 = children[0];
  const c2 = children[1];
  expect(c1.values.length).toBe(2);
  expect(c2.values.length).toBe(2);
  expect(c1.values[0].normTime).toBe(0);
  expect(c1.values[0].value).toBe(1);
  expect(c1.values[1].normTime).toBe(1);
  expect(c1.values[1].value).toBe(0.6);
  expect(c2.values[0].normTime).toBe(0);
  expect(c2.values[0].value).toBe(0.6);
  expect(c2.values[1].normTime).toBe(1);
  expect(c2.values[1].value).toBe(0);
  expect(c1.valueAtX(0.5)).toBe(0.8);
  expect(c2.valueAtX(0.5)).toBe(0.3);

  // compress
  const compressed = Automation.compress(children, durArray)
  expect(compressed.values.length).toBe(2);
  expect(compressed.values[0].normTime).toBe(0);
  expect(compressed.values[0].value).toBe(1);
  expect(compressed.values[1].normTime).toBe(1);
  expect(compressed.values[1].value).toBe(0);

  // partition and compress with harder math
  const orig2 = new Automation();
  const times = [0.13, 0.38, 0.44, 0.6, 0.77777, 0.912345];
  const vals = times.map(t => Math.random());
  times.forEach((t, i) => orig2.addValue(t, vals[i]));
  const durArray2 = [0.25, 0.3, 0.45];
  const children2 = orig2.partition(durArray2);
  expect(children2.length).toBe(3);
  const compressed2 = Automation.compress(children2, durArray2);
  expect(compressed2.values.length).toBe(8);
  const returnedTimes = compressed2.values.map(v => v.normTime);
  const suplementedTimes = ([0]).concat(times).concat([1]);
  for (let i = 0; i < returnedTimes.length; i++) {
    expect(returnedTimes[i]).toBeCloseTo(suplementedTimes[i]);
  }

  // simple compression of two blank automations
  const a1 = new Automation();
  const a2 = new Automation();
  const durArray3 = [0.4, 0.6];
  const newAuto = Automation.compress([a1, a2], durArray3);
  expect(newAuto.values.length).toBe(2);


})

test('fromJSON round-trip', () => {
  const orig = new Automation();
  orig.addValue(0.3, 0.7);
  orig.addValue(0.8, 0.4);
  const json = JSON.parse(JSON.stringify(orig));
  const clone = Automation.fromJSON(json);
  expect(clone).toBeInstanceOf(Automation);
  expect(clone.values).toEqual(orig.values);
});
