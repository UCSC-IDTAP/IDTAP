import os
import sys
import pytest

sys.path.insert(0, os.path.abspath('.'))

from python.api.classes.group import Group
from python.api.classes.trajectory import Trajectory
from python.api.classes.pitch import Pitch

# Tests mirror src/ts/tests/group.test.ts


def test_group_basics():
    t1 = Trajectory({'num': 0, 'phrase_idx': 0, 'pitches': [Pitch()]})
    t2 = Trajectory({'num': 1, 'phrase_idx': 0, 'pitches': [Pitch({'swara': 'r'})]})
    g = Group({'trajectories': [t1, t2]})
    assert g.test_for_adjacency() is True
    assert t1.group_id == g.id
    assert isinstance(g.min_freq, (int, float))
    t3 = Trajectory({'num': 2, 'phrase_idx': 0, 'pitches': [Pitch({'swara': 'g'})]})
    g.add_traj(t3)
    assert len(g.trajectories) == 3
    json_obj = g.to_json()
    copy = Group.from_json(json_obj)
    assert len(copy.trajectories) == 3


def test_constructor_throws_on_non_adjacent():
    t1 = Trajectory({'num': 0, 'phrase_idx': 0, 'pitches': [Pitch()]})
    t2 = Trajectory({'num': 2, 'phrase_idx': 0, 'pitches': [Pitch({'swara': 'r'})]})
    with pytest.raises(ValueError, match='Trajectories are not adjacent'):
        Group({'trajectories': [t1, t2]})


def test_add_traj_enforces_adjacency():
    t1 = Trajectory({'num': 0, 'phrase_idx': 0, 'pitches': [Pitch()]})
    t2 = Trajectory({'num': 1, 'phrase_idx': 0, 'pitches': [Pitch({'swara': 'r'})]})
    g = Group({'trajectories': [t1, t2]})
    t3 = Trajectory({'num': 3, 'phrase_idx': 0, 'pitches': [Pitch({'swara': 'g'})]})
    with pytest.raises(ValueError, match='Trajectories are not adjacent'):
        g.add_traj(t3)


def test_min_and_max_freq_use_ranges():
    low = Trajectory({'num': 0, 'phrase_idx': 0, 'pitches': [Pitch({'fundamental': 200})]})
    high = Trajectory({'num': 1, 'phrase_idx': 0, 'pitches': [Pitch({'fundamental': 400})]})
    g = Group({'trajectories': [low, high]})
    assert pytest.approx(low.min_freq) == g.min_freq
    assert pytest.approx(high.max_freq) == g.max_freq


def test_min_and_max_freq_multiple_trajs():
    t1 = Trajectory({'num': 0, 'phrase_idx': 0, 'pitches': [Pitch({'fundamental': 200})]})
    t2 = Trajectory({'num': 1, 'phrase_idx': 0, 'pitches': [Pitch({'fundamental': 250})]})
    t3 = Trajectory({'num': 2, 'phrase_idx': 0, 'pitches': [Pitch({'fundamental': 400})]})
    g = Group({'trajectories': [t1, t2, t3]})
    assert pytest.approx(t1.min_freq) == g.min_freq
    assert pytest.approx(t3.max_freq) == g.max_freq


def test_all_pitches_no_repetition():
    p1 = Pitch({'swara': 'sa'})
    t1 = Trajectory({'num': 0, 'phrase_idx': 0, 'pitches': [p1]})
    t2 = Trajectory({'num': 1, 'phrase_idx': 0, 'pitches': [Pitch({'swara': 'sa'})]})
    g = Group({'trajectories': [t1, t2]})
    assert g.all_pitches(False) == [p1]


def test_constructor_rejects_different_phrases():
    t1 = Trajectory({'num': 0, 'phrase_idx': 0, 'pitches': [Pitch()]})
    t2 = Trajectory({'num': 1, 'phrase_idx': 1, 'pitches': [Pitch({'swara': 'r'})]})
    t1.phrase_idx = 0
    t2.phrase_idx = 1
    with pytest.raises(ValueError, match='Trajectories are not adjacent'):
        Group({'trajectories': [t1, t2]})


def test_all_pitches_with_repetition():
    p1 = Pitch({'swara': 'sa'})
    p2 = Pitch({'swara': 'sa'})
    t1 = Trajectory({'num': 0, 'phrase_idx': 0, 'pitches': [p1]})
    t2 = Trajectory({'num': 1, 'phrase_idx': 0, 'pitches': [p2]})
    g = Group({'trajectories': [t1, t2]})
    assert g.all_pitches(True) == [p1, p2]


def test_test_for_adjacency_false_when_phrase_changes():
    t1 = Trajectory({'num': 0, 'phrase_idx': 0, 'pitches': [Pitch()]})
    t2 = Trajectory({'num': 1, 'phrase_idx': 0, 'pitches': [Pitch({'swara': 'r'})]})
    g = Group({'trajectories': [t1, t2]})
    t2.phrase_idx = 1
    assert g.test_for_adjacency() is False


def test_add_traj_updates_group_id_and_keeps_adjacency():
    t1 = Trajectory({'num': 0, 'phrase_idx': 0, 'pitches': [Pitch()]})
    t2 = Trajectory({'num': 1, 'phrase_idx': 0, 'pitches': [Pitch({'swara': 'r'})]})
    g = Group({'trajectories': [t1, t2]})
    t3 = Trajectory({'num': 2, 'phrase_idx': 0, 'pitches': [Pitch({'swara': 'g'})]})
    g.add_traj(t3)
    assert t3.group_id == g.id
    assert g.test_for_adjacency() is True


def test_all_pitches_collapse_sequential_duplicates():
    p1 = Pitch({'swara': 'sa'})
    p2 = Pitch({'swara': 'sa'})
    p3 = Pitch({'swara': 're'})
    p4 = Pitch({'swara': 'sa'})
    t1 = Trajectory({'num': 0, 'phrase_idx': 0, 'pitches': [p1]})
    t2 = Trajectory({'num': 1, 'phrase_idx': 0, 'pitches': [p2]})
    t3 = Trajectory({'num': 2, 'phrase_idx': 0, 'pitches': [p3]})
    t4 = Trajectory({'num': 3, 'phrase_idx': 0, 'pitches': [p4]})
    g = Group({'trajectories': [t1, t2, t3, t4]})
    assert g.all_pitches(False) == [p1, p3, p4]


def test_test_for_adjacency_returns_false_when_phrase_idx_differs():
    t1 = Trajectory({'num': 0, 'phrase_idx': 0, 'pitches': [Pitch()]})
    t2 = Trajectory({'num': 1, 'phrase_idx': 0, 'pitches': [Pitch()]})
    g = Group({'trajectories': [t1, t2]})
    t3 = Trajectory({'num': 2, 'phrase_idx': 1, 'pitches': [Pitch()]})
    t3.phrase_idx = 1
    g.trajectories.append(t3)
    assert g.test_for_adjacency() is False


def test_add_traj_updates_group_id_and_maintains_sorted():
    t1 = Trajectory({'num': 1, 'phrase_idx': 0, 'pitches': [Pitch()]})
    t2 = Trajectory({'num': 2, 'phrase_idx': 0, 'pitches': [Pitch({'swara': 'r'})]})
    g = Group({'trajectories': [t1, t2]})
    t0 = Trajectory({'num': 0, 'phrase_idx': 0, 'pitches': [Pitch({'swara': 'g'})]})
    g.add_traj(t0)
    assert t0.group_id == g.id
    assert [tr.num for tr in g.trajectories] == [0, 1, 2]
    assert g.test_for_adjacency() is True


def test_constructor_throws_when_traj_lacks_num():
    good = Trajectory({'num': 0, 'phrase_idx': 0, 'pitches': [Pitch()]})
    bad = Trajectory({'phrase_idx': 0, 'pitches': [Pitch()]})
    with pytest.raises(ValueError, match='Trajectory must have a num'):
        Group({'trajectories': [good, bad]})


def test_add_traj_throws_when_traj_lacks_num():
    t1 = Trajectory({'num': 0, 'phrase_idx': 0, 'pitches': [Pitch()]})
    t2 = Trajectory({'num': 1, 'phrase_idx': 0, 'pitches': [Pitch()]})
    g = Group({'trajectories': [t1, t2]})
    bad = Trajectory({'phrase_idx': 0, 'pitches': [Pitch()]})
    with pytest.raises(ValueError, match='Trajectory must have a num'):
        g.add_traj(bad)


def test_test_for_adjacency_throws_when_num_undefined():
    t1 = Trajectory({'num': 0, 'phrase_idx': 0, 'pitches': [Pitch()]})
    t2 = Trajectory({'num': 1, 'phrase_idx': 0, 'pitches': [Pitch()]})
    g = Group({'trajectories': [t1, t2]})
    bad = Trajectory({'phrase_idx': 0, 'pitches': [Pitch()]})
    g.trajectories.append(bad)
    with pytest.raises(ValueError, match='Trajectory must have a num'):
        g.test_for_adjacency()


def test_constructor_uses_provided_id():
    custom = 'my-group-id'
    t1 = Trajectory({'num': 0, 'phrase_idx': 0, 'pitches': [Pitch()]})
    t2 = Trajectory({'num': 1, 'phrase_idx': 0, 'pitches': [Pitch()]})
    g = Group({'trajectories': [t1, t2], 'id': custom})
    assert g.id == custom
    assert t1.group_id == custom


def test_all_pitches_ignores_id_12():
    p1 = Pitch({'swara': 'sa'})
    p2 = Pitch({'swara': 're'})
    p3 = Pitch({'swara': 'ga'})
    t1 = Trajectory({'id': 0, 'num': 0, 'phrase_idx': 0, 'pitches': [p1]})
    t2 = Trajectory({'id': 12, 'num': 1, 'phrase_idx': 0, 'pitches': [p2]})
    t3 = Trajectory({'id': 1, 'num': 2, 'phrase_idx': 0, 'pitches': [p3]})
    g = Group({'trajectories': [t1, t2, t3]})
    assert g.all_pitches() == [p1, p3]


def test_constructor_requires_two_trajectories():
    only = Trajectory({'num': 0, 'phrase_idx': 0, 'pitches': [Pitch()]})
    with pytest.raises(ValueError, match='Group must have at least 2 trajectories'):
        Group({'trajectories': [only]})


def test_test_for_adjacency_checks_num_after_sort():
    t1 = Trajectory({'num': 0, 'phrase_idx': 0, 'pitches': [Pitch()]})
    t2 = Trajectory({'num': 1, 'phrase_idx': 0, 'pitches': [Pitch()]})
    g = Group({'trajectories': [t1, t2]})
    t1.num = None
    g.trajectories = [t1]
    with pytest.raises(ValueError, match='Trajectory must have a num'):
        g.test_for_adjacency()
