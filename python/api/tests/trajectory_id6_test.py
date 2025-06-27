from python.api.classes.trajectory import Trajectory
from python.api.classes.pitch import Pitch
import pytest


def test_id6_default_durarray_and_error_logging(capfd):
    p0 = Pitch()
    p1 = Pitch({'swara': 1})
    p2 = Pitch({'swara': 2})
    pitches = [p0, p1, p2]

    traj = Trajectory({'id': 6, 'pitches': pitches, 'durArray': None})

    expected = [1 / (len(pitches) - 1)] * (len(pitches) - 1)
    assert traj.dur_array == expected

    freq = traj.id6(0.5)
    assert isinstance(freq, float)
    assert freq > 0

    with pytest.raises(ValueError):
        traj.id6(-0.1)
    out, _ = capfd.readouterr()
    assert 'invalid x' in out
