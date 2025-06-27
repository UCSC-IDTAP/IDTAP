from python.api.classes.pitch import Pitch
from python.api.classes.trajectory import Trajectory


def test_constructor_removes_zero_duration_segments():
    p0 = Pitch()
    p1 = Pitch({"swara": 1})
    p2 = Pitch({"swara": 2})

    traj = Trajectory({
        "id": 7,
        "pitches": [p0, p1, p2],
        "dur_array": [0.3, 0, 0.7],
    })

    assert traj.dur_array == [0.3, 0.7]
    assert len(traj.pitches) == 2
    assert traj.pitches[0] == p0
    # pitch following the zero-duration segment should be removed
    assert traj.pitches[1] == p1
    assert len(traj.freqs) == 2
    assert len(traj.log_freqs) == 2
