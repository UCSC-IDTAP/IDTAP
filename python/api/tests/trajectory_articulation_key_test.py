from python.api.classes import Trajectory, Articulation


def test_numeric_articulation_keys_are_normalized():
    art = Articulation({"name": "pluck", "stroke": "d"})
    traj = Trajectory({"articulations": {0: art}})

    assert isinstance(traj.articulations.get("0.00"), Articulation)
    assert "0" not in traj.articulations
