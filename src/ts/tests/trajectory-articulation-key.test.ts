import { expect, test } from 'vitest';
import { Trajectory, Articulation } from '../model';

test('numeric articulation keys are normalized to decimals', () => {
  const art = new Articulation({ name: 'pluck', stroke: 'd' });
  const traj = new Trajectory({ articulations: { 0: art } });

  expect(traj.articulations['0.00']).toBeInstanceOf(Articulation);
  expect(traj.articulations['0']).toBeUndefined();
});
