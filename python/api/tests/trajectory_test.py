import math

from python.api.classes.pitch import Pitch
from python.api.classes.trajectory import Trajectory
from python.api.classes.articulation import Articulation
from python.api.classes.phrase import Phrase
from python.api.classes.automation import Automation
from python.api.classes.piece import Piece
from python.api.classes.raga import Raga
from python.api.classes.helpers import durations_of_fixed_pitches
from python.api.classes.enums import Instrument


def lin_space(start: float, stop: float, num: int):
    if num == 1:
        return [start]
    step = (stop - start) / (num - 1)
    return [start + step * i for i in range(num)]


def test_default_trajectory():
    t = Trajectory()
    assert isinstance(t, Trajectory)
    assert t.id == 0
    assert t.pitches == [Pitch()]
    assert t.dur_tot == 1
    assert t.dur_array == [1]
    assert t.slope == 2
    art = Articulation({'stroke': 'd'})
    assert t.articulations == {'0.00': art}
    assert t.num is None
    assert t.name == 'Fixed'
    assert t.fund_id12 is None
    def_vib = {'periods': 8, 'vert_offset': 0, 'init_up': True, 'extent': 0.05}
    assert t.vib_obj == def_vib
    assert t.instrumentation == Instrument.Sitar
    assert t.freqs == [261.63]
    assert t.log_freqs == [math.log2(261.63)]
    assert t.min_freq == 261.63
    assert t.max_freq == 261.63
    assert t.end_time is None
    assert t.start_time is None

    pts = lin_space(0, 1, 10)
    for x in pts:
        assert math.isclose(t.compute(x), t.id0(x))


def test_compute_id7_to_id13():
    pts = lin_space(0, 1, 10)
    log_freqs = [
        math.log2(261.63), math.log2(523.25),
        math.log2(392.0), math.log2(261.63),
        math.log2(523.25), math.log2(392.0),
    ]
    t = Trajectory({'id': 0})
    vals = [t.id7(x, log_freqs[:2], [0.3, 0.7]) for x in pts]
    for v, x in zip(vals, pts):
        exp = 261.63 if x < 0.3 else 523.25
        assert math.isclose(v, exp)

    t12 = Trajectory({'id': 12, 'fund_id12': 220})
    assert math.isclose(t12.id12(0.5), 220)

    vib = {'periods': 2, 'vert_offset': 0, 'init_up': True, 'extent': 0.1}
    t13 = Trajectory({'id': 13, 'vib_obj': vib})

    def expected13(x_val: float) -> float:
        periods = vib['periods']
        vert_offset = vib['vert_offset']
        init_up = vib['init_up']
        extent = vib['extent']
        vo = vert_offset
        if abs(vo) > extent / 2:
            vo = math.copysign(extent / 2, vo)
        out = math.cos(x_val * 2 * math.pi * periods + int(init_up) * math.pi)
        base = math.log2(t13.freqs[0])
        if x_val < 1 / (2 * periods):
            start = base
            end = math.log2(expected13(1 / (2 * periods)))
            out = out * (abs(end - start) / 2) + (start + end) / 2
            return 2 ** out
        elif x_val > 1 - 1 / (2 * periods):
            start = math.log2(expected13(1 - 1 / (2 * periods)))
            end = base
            out = out * (abs(end - start) / 2) + (start + end) / 2
            return 2 ** out
        else:
            return 2 ** (out * extent / 2 + vo + base)

    for x in pts:
        assert math.isclose(t13.id13(x), expected13(x))


def test_consonant_vowel_helpers():
    t = Trajectory({'pitches': [Pitch()], 'dur_tot': 1})
    t.add_consonant('ka')
    assert t.start_consonant == 'ka'
    t.add_consonant('ga', False)
    assert t.end_consonant == 'ga'
    t.change_consonant('kha')
    assert t.start_consonant == 'kha'
    t.update_vowel('a')
    assert t.vowel_hindi == 'अ'
    dur = t.durations_of_fixed_pitches()
    assert math.isclose(dur[t.pitches[0].numbered_pitch], 1)
    json_obj = t.to_json()
    copy = Trajectory.from_json(json_obj)
    assert copy.start_consonant == 'kha'


def test_remove_consonant_functions():
    t = Trajectory({'pitches': [Pitch()], 'dur_tot': 1})
    t.add_consonant('ka')
    t.add_consonant('ga', False)
    t.remove_consonant(True)
    assert t.start_consonant is None
    assert t.start_consonant_hindi is None
    assert t.start_consonant_ipa is None
    assert t.start_consonant_eng_trans is None
    assert t.articulations.get('0.00') is None
    assert t.end_consonant == 'ga'
    assert '1.00' in t.articulations

    t = Trajectory({'pitches': [Pitch()], 'dur_tot': 1})
    t.add_consonant('ka')
    t.add_consonant('ga', False)
    t.remove_consonant(False)
    assert t.end_consonant is None
    assert t.end_consonant_hindi is None
    assert t.end_consonant_ipa is None
    assert t.end_consonant_eng_trans is None
    assert t.articulations.get('1.00') is None
    assert t.start_consonant == 'ka'
    assert '0.00' in t.articulations


def test_durations_helpers_and_round_trip():
    t1 = Trajectory({'id': 0, 'pitches': [Pitch({'swara': 0})], 'dur_tot': 1})
    t2 = Trajectory({'id': 0, 'pitches': [Pitch({'swara': 1})], 'dur_tot': 2})
    trajs = [t1, t2]
    np1 = t1.pitches[0].numbered_pitch
    np2 = t2.pitches[0].numbered_pitch

    dur = durations_of_fixed_pitches(trajs)
    assert dur == {np1: 1, np2: 2}

    prop = durations_of_fixed_pitches(trajs, {'count_type': 'proportional'})
    assert math.isclose(prop[np1], 1/3)
    assert math.isclose(prop[np2], 2/3)

    c1 = Pitch.pitch_number_to_chroma(np1)
    c2 = Pitch.pitch_number_to_chroma(np2)
    assert durations_of_fixed_pitches(trajs, {'output_type': 'chroma'}) == {c1: 1, c2: 2}
    assert durations_of_fixed_pitches(trajs, {'output_type': 'chroma', 'count_type': 'proportional'}) == {c1: 1/3, c2: 2/3}

    sd1 = Pitch.chroma_to_scale_degree(c1)[0]
    sd2 = Pitch.chroma_to_scale_degree(c2)[0]
    assert durations_of_fixed_pitches(trajs, {'output_type': 'scale_degree'}) == {sd1: 1, sd2: 2}
    assert durations_of_fixed_pitches(trajs, {'output_type': 'scale_degree', 'count_type': 'proportional'}) == {sd1: 1/3, sd2: 2/3}

    s1 = Pitch.from_pitch_number(np1).sargam_letter
    s2 = Pitch.from_pitch_number(np2).sargam_letter
    assert durations_of_fixed_pitches(trajs, {'output_type': 'sargam_letter'}) == {s1: 1, s2: 2}
    assert durations_of_fixed_pitches(trajs, {'output_type': 'sargam_letter', 'count_type': 'proportional'}) == {s1: 1/3, s2: 2/3}

    auto = Automation()
    auto.add_value(0.5, 0.5)
    arts = {'0.00': Articulation({'name': 'consonant', 'stroke': 'ka'})}
    traj = Trajectory({'id': 7, 'pitches': [Pitch(), Pitch({'swara': 1})], 'dur_array': [0.5, 0.5], 'articulations': arts, 'automation': auto})
    json_round = Trajectory.from_json(traj.to_json())
    assert json_round.to_json() == traj.to_json()
    assert json_round.automation.values == auto.values
    assert json_round.articulations['0.00'].stroke == 'ka'
