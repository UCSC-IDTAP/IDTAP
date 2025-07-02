import os
import sys
import pytest
from unittest.mock import patch

sys.path.insert(0, os.path.abspath('.'))

from python.idtap_api.classes.phrase import Phrase, init_phrase_categorization
from python.idtap_api.classes.trajectory import Trajectory
from python.idtap_api.classes.pitch import Pitch
from python.idtap_api.classes.articulation import Articulation
from python.idtap_api.classes.group import Group
from python.idtap_api.classes.raga import Raga
from python.idtap_api.classes.chikari import Chikari


def make_phrase(trajectories, start_time=None):
    return Phrase({'trajectories': trajectories, 'start_time': start_time})

# ------------------------------------------------------------------
# Tests from branch "codex/create-tests-for-getgroups-and-others"
# ------------------------------------------------------------------

def test_groups_retrieval():
    t1 = Trajectory()
    t2 = Trajectory()
    phrase = make_phrase([t1, t2])
    phrase.piece_idx = 0
    phrase.assign_phrase_idx()
    g = Group({'trajectories': [phrase.trajectories[0], phrase.trajectories[1]]})
    phrase.get_groups(0).append(g)
    assert phrase.get_groups(0) == [g]
    assert phrase.get_group_from_id(g.id) == g
    assert phrase.get_group_from_id('missing') is None
    with pytest.raises(Exception):
        phrase.get_groups(1)


def test_assign_phrase_idx_sets_indices():
    ts = [Trajectory(), Trajectory()]
    phrase = make_phrase(ts)
    phrase.piece_idx = 3
    phrase.assign_phrase_idx()
    for t in ts:
        assert t.phrase_idx == 3
    phrase.piece_idx = None
    phrase.assign_phrase_idx()
    for t in ts:
        assert t.phrase_idx is None


def test_assign_traj_nums():
    ts = [Trajectory(), Trajectory(), Trajectory()]
    phrase = make_phrase(ts)
    for t in ts:
        t.num = 99
    phrase.assign_traj_nums()
    for i, t in enumerate(ts):
        assert t.num == i
    empty = Phrase()
    empty.assign_traj_nums()  # should not raise


def test_assign_start_times():
    ts = [Trajectory(), Trajectory(), Trajectory()]
    phrase = make_phrase(ts)
    phrase.assign_start_times()
    expected = [0, 1, 2]
    for t, e in zip(ts, expected):
        assert pytest.approx(t.start_time, rel=1e-6) == e

    p2 = Phrase()
    p2.dur_array = None
    with pytest.raises(Exception):
        p2.assign_start_times()
    p3 = Phrase()
    p3.dur_tot = None
    p3.dur_array = [0.5, 0.5]
    with pytest.raises(Exception):
        p3.assign_start_times()


def test_update_fundamental():
    t1 = Trajectory({'pitches': [Pitch()]})
    t2 = Trajectory({'pitches': [Pitch()]})
    phrase = make_phrase([t1, t2])
    phrase.update_fundamental(440)
    for p in t1.pitches + t2.pitches:
        assert pytest.approx(p.fundamental, rel=1e-6) == 440


def test_all_pitches():
    p1 = Pitch({'swara': 'sa'})
    p2 = Pitch({'swara': 're'})
    t1 = Trajectory({'pitches': [p1]})
    t2 = Trajectory({'pitches': [p2]})
    t3 = Trajectory({'pitches': [Pitch({'swara': 're'})]})
    silent = Trajectory({'id': 12, 'pitches': [Pitch()]})
    phrase = make_phrase([t1, t2, t3, silent])
    assert phrase.all_pitches() == [p1, p2, t3.pitches[0]]
    assert phrase.all_pitches(False) == [p1, p2]


def test_swara_property():
    ts = [Trajectory(), Trajectory(), Trajectory()]
    phrase = make_phrase(ts, 10)
    times = [o['time'] for o in phrase.swara]
    assert times == [10, 11, 12]

    p2 = Phrase({'trajectories': [Trajectory()]})
    with pytest.raises(Exception):
        _ = p2.swara

    p3 = make_phrase([Trajectory()], 0)
    p3.trajectories[0].start_time = None
    with pytest.raises(Exception):
        _ = p3.swara

    p4 = make_phrase([Trajectory()], 0)
    p4.trajectories[0].dur_array = None
    with pytest.raises(Exception):
        _ = p4.swara

# ------------------------------------------------------------------
# Tests from branch "porting-project"
# ------------------------------------------------------------------

def test_phrase_methods_and_serialization():
    t1 = Trajectory({'num': 0, 'dur_tot': 0.5, 'pitches': [Pitch()]})
    t2 = Trajectory({'num': 1, 'dur_tot': 0.5, 'pitches': [Pitch({'swara': 'r'})]})
    p = Phrase({'trajectories': [t1, t2], 'raga': Raga()})
    assert pytest.approx(p.dur_tot, rel=1e-6) == 1
    assert pytest.approx(p.compute(0.25), rel=1e-6) == t1.compute(0.5)
    assert p.get_range()['min']['numberedPitch'] == t1.pitches[0].numbered_pitch
    nv = p.to_note_view_phrase()
    assert len(nv.pitches) == 2
    json_obj = p.to_json()
    copy = Phrase.from_json(json_obj)
    assert pytest.approx(copy.dur_tot, rel=1e-6) == 1
    assert len(copy.trajectories) == 2


def test_phrase_utility_functions():
    r = Raga()
    t1 = Trajectory({'num': 0, 'dur_tot': 0.5, 'pitches': [Pitch()]})
    t1.add_consonant('ka')
    t1.update_vowel('a')
    silent1 = Trajectory({'num': 1, 'id': 12, 'dur_tot': 0.25, 'pitches': [Pitch()]})
    silent2 = Trajectory({'num': 2, 'id': 12, 'dur_tot': 0.25, 'pitches': [Pitch()]})
    t2 = Trajectory({'num': 3, 'dur_tot': 0.5, 'pitches': [Pitch({'swara': 'r'})]})
    t2.update_vowel('i')
    p = Phrase({'trajectories': [t1, silent1, silent2, t2], 'raga': r, 'start_time': 0})
    p.reset()
    p.chikaris['0.3'] = Chikari({})

    idxs = p.first_traj_idxs()
    assert 0 in idxs
    assert 3 in idxs
    assert p.traj_idx_from_time(0.1) == 0

    chiks = p.chikaris_during_traj(t1, 0)
    assert len(chiks) == 1
    p.consolidate_silent_trajs()
    assert len(p.trajectories) == 3


def test_to_note_view_phrase_id0():
    pitch = Pitch({'swara': 'ga'})
    traj = Trajectory({'id': 0, 'pitches': [pitch], 'articulations': {'0.00': Articulation({'name': 'pluck'})}})
    phrase = Phrase({'trajectories': [traj]})
    nv = phrase.to_note_view_phrase()
    assert len(nv.pitches) == 1
    assert nv.pitches[0] == pitch


def test_to_note_view_phrase_nonzero():
    pitch = Pitch({'swara': 'ma'})
    traj = Trajectory({'id': 2, 'pitches': [pitch], 'articulations': {}})
    phrase = Phrase({'trajectories': [traj]})
    nv = phrase.to_note_view_phrase()
    assert pitch in nv.pitches


def test_from_json_reconstructs_grids():
    t1 = Trajectory({'num': 0, 'pitches': [Pitch()]})
    t2 = Trajectory({'num': 1, 'pitches': [Pitch({'swara': 'r'})]})
    c1 = Chikari({})
    obj = {
        'trajectoryGrid': [[t1.to_json(), t2.to_json()]],
        'chikariGrid': [{'0.5': c1.to_json()}],
        'instrumentation': ['Sitar', 'Violin'],
        'startTime': 0,
    }
    phrase = Phrase.from_json(obj)
    assert isinstance(phrase.trajectory_grid[0][0], Trajectory)
    assert isinstance(phrase.trajectory_grid[0][1], Trajectory)
    assert len(phrase.trajectory_grid) == 2
    assert isinstance(phrase.trajectory_grid[1], list)
    assert len(phrase.trajectory_grid[1]) == 0
    assert isinstance(phrase.chikari_grid[0]['0.5'], Chikari)
    assert len(phrase.chikari_grid) == 2
    assert len(phrase.chikari_grid[1].keys()) == 0


def test_traj_idx_from_time_error():
    t1 = Trajectory({'num': 0, 'dur_tot': 0.5, 'pitches': [Pitch()]})
    t2 = Trajectory({'num': 1, 'dur_tot': 0.5, 'pitches': [Pitch()]})
    phrase = Phrase({'trajectories': [t1, t2], 'start_time': 0})
    with pytest.raises(Exception):
        phrase.traj_idx_from_time(1.1)


def test_swara_edge_cases_shorter_durarray():
    t = Trajectory({'id': 1, 'pitches': [Pitch(), Pitch({'swara': 1})], 'dur_array': [1], 'dur_tot': 1})
    phrase = make_phrase([t], 0)
    sw = phrase.swara
    assert len(sw) == 1
    assert sw[0]['pitch'] == t.pitches[0]
    assert pytest.approx(sw[0]['time'], rel=1e-6) == 0


def test_swara_edge_cases_equal():
    t = Trajectory({'id': 7, 'pitches': [Pitch(), Pitch({'swara': 1})], 'dur_array': [0.4, 0.6], 'dur_tot': 1})
    phrase = make_phrase([t], 0)
    sw = phrase.swara
    assert len(sw) == 2
    assert pytest.approx(sw[0]['time'], rel=1e-6) == 0
    assert pytest.approx(sw[1]['time'], rel=1e-6) == 0.4


def test_consolidate_silent_trajs():
    t1 = Trajectory({'num': 0, 'dur_tot': 0.5, 'pitches': [Pitch()]})
    s1 = Trajectory({'num': 1, 'id': 12, 'dur_tot': 0.1, 'pitches': [Pitch()]})
    s2 = Trajectory({'num': 2, 'id': 12, 'dur_tot': 0.2, 'pitches': [Pitch()]})
    t2 = Trajectory({'num': 3, 'dur_tot': 0.5, 'pitches': [Pitch({'swara': 'r'})]})
    s3 = Trajectory({'num': 4, 'id': 12, 'dur_tot': 0.1, 'pitches': [Pitch()]})
    s4 = Trajectory({'num': 5, 'id': 12, 'dur_tot': 0.2, 'pitches': [Pitch()]})
    t3 = Trajectory({'num': 6, 'dur_tot': 0.5, 'pitches': [Pitch({'swara': 'g'})]})
    s5 = Trajectory({'num': 7, 'id': 12, 'dur_tot': 0.1, 'pitches': [Pitch()]})
    s6 = Trajectory({'num': 8, 'id': 12, 'dur_tot': 0.2, 'pitches': [Pitch()]})

    p = Phrase({'trajectories': [t1, s1, s2, t2, s3, s4, t3, s5, s6], 'raga': Raga(), 'start_time': 0})
    p.consolidate_silent_trajs()
    assert len(p.trajectories) == 6
    assert pytest.approx(p.trajectories[1].dur_tot, rel=1e-6) == 0.3
    assert pytest.approx(p.trajectories[3].dur_tot, rel=1e-6) == 0.3
    assert pytest.approx(p.trajectories[5].dur_tot, rel=1e-6) == 0.3


def test_consolidate_silent_trajs_missing_num():
    good = Trajectory({'num': 0, 'dur_tot': 0.5, 'pitches': [Pitch()]})
    bad = Trajectory({'id': 12, 'dur_tot': 0.5, 'pitches': [Pitch()]})
    p = Phrase({'trajectories': [good, bad], 'raga': Raga()})
    p.trajectories[1].num = None
    with pytest.raises(Exception):
        p.consolidate_silent_trajs()


def test_realign_pitches():
    t1 = Trajectory({'pitches': [Pitch(), Pitch({'swara': 'r'})]})
    t2 = Trajectory({'pitches': [Pitch({'swara': 'g'})]})
    r = Raga()
    phrase = Phrase({'trajectories': [t1, t2], 'raga': r})
    originals = [t.pitches[:] for t in phrase.trajectories]
    phrase.realign_pitches()
    for ti, traj in enumerate(phrase.trajectories):
        for pi, p in enumerate(traj.pitches):
            assert p is not originals[ti][pi]
            assert p.ratios == r.stratified_ratios


def test_compute_errors_and_null():
    p = Phrase()
    p.dur_array = None
    with pytest.raises(Exception):
        p.compute(0.5)

    p2 = Phrase()
    assert p2.dur_array == []
    assert p2.compute(0.5) is None


def test_durtot_and_durarray_preserved_with_empty_trajs():
    with patch.object(Phrase, 'dur_array_from_trajectories') as spy:
        p = Phrase({'dur_tot': 2, 'dur_array': [1]})
        assert p.dur_tot == 2
        assert p.dur_array == [1]
        assert not spy.called


def test_constructor_pads_grids():
    t1 = Trajectory()
    trajectory_grid = [[t1]]
    chikari_grid = [{}]
    instrumentation = ['Sitar', 'Violin']
    phrase = Phrase({'trajectory_grid': trajectory_grid, 'chikari_grid': chikari_grid, 'instrumentation': instrumentation})
    assert phrase.trajectory_grid is trajectory_grid
    assert phrase.chikari_grid is chikari_grid
    assert len(phrase.trajectory_grid) == len(instrumentation)
    assert len(phrase.chikari_grid) == len(instrumentation)
    assert phrase.trajectory_grid[1] == []
    assert phrase.chikari_grid[1] == {}


def test_from_json_fallback_grids():
    obj = {'trajectories': [], 'instrumentation': ['Sitar', 'Violin'], 'startTime': 0}
    phrase = Phrase.from_json(obj)
    assert len(phrase.trajectory_grid) == len(obj['instrumentation'])
    assert len(phrase.chikari_grid) == len(obj['instrumentation'])
    for row in phrase.trajectory_grid:
        assert row == []
    for col in phrase.chikari_grid:
        assert col == {}


def test_chikaris_setter():
    phrase = Phrase()
    c = Chikari({})
    phrase.chikaris = {'0.1': c}
    assert phrase.chikari_grid[0]['0.1'] is c


def test_constructor_scales_trajectories():
    t1 = Trajectory({'dur_tot': 1, 'pitches': [Pitch()]})
    t2 = Trajectory({'dur_tot': 1, 'pitches': [Pitch({'swara': 'r'})]})
    dur_array = [0.2, 0.8]
    phrase = Phrase({'trajectories': [t1, t2], 'dur_tot': 4, 'dur_array': dur_array})
    assert pytest.approx(phrase.dur_tot, rel=1e-6) == 4
    assert phrase.dur_array == dur_array
    assert pytest.approx(t1.dur_tot, rel=1e-6) == 0.8
    assert pytest.approx(t2.dur_tot, rel=1e-6) == 3.2


def test_constructor_fills_missing_grids():
    traj = Trajectory()
    instrumentation = ['Sitar', 'Violin', 'Sarod']
    phrase = Phrase({'trajectories': [traj], 'instrumentation': instrumentation})
    assert len(phrase.trajectory_grid) == len(instrumentation)
    assert len(phrase.chikari_grid) == len(instrumentation)
    assert phrase.trajectory_grid[0] == [traj]
    assert phrase.chikari_grid[0] == {}
    assert phrase.trajectory_grid[1] == []
    assert phrase.trajectory_grid[2] == []
    assert phrase.chikari_grid[1] == {}
    assert phrase.chikari_grid[2] == {}


def test_missing_bol_alap_initialized():
    custom = init_phrase_categorization()
    del custom['Elaboration']['Bol Alap']
    phrase = Phrase({'categorization_grid': [custom]})
    assert phrase.categorization_grid[0]['Elaboration']['Bol Alap'] is False
