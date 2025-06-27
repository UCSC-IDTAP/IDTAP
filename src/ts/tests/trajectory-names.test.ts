import { expect, test } from 'vitest';
import { Trajectory } from '../model';

test('Trajectory.names matches instance names', () => {
  const staticNames = Trajectory.names();
  const instance = new Trajectory();
  expect(staticNames).toEqual(instance.names);
});
