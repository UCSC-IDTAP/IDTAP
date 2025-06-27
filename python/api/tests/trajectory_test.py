from python.api.classes.trajectory import Trajectory


def test_trajectory_names_matches_instance():
    static_names = Trajectory.names()
    instance = Trajectory()
    assert static_names == instance.names
