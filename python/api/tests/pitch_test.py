import os
import sys
sys.path.insert(0, os.path.abspath('.'))
from python.api.classes.pitch import Pitch
import math
import pytest

# All tests mirror src/js/tests/pitch.test.ts

def test_default_pitch():
    p = Pitch()
    assert isinstance(p, Pitch)
    assert p.swara == 0
    assert p.oct == 0
    assert p.raised is True
    assert p.fundamental == 261.63
    ratios = [
        1,
        [2 ** (1 / 12), 2 ** (2 / 12)],
        [2 ** (3 / 12), 2 ** (4 / 12)],
        [2 ** (5 / 12), 2 ** (6 / 12)],
        2 ** (7 / 12),
        [2 ** (8 / 12), 2 ** (9 / 12)],
        [2 ** (10 / 12), 2 ** (11 / 12)]
    ]
    assert p.ratios == ratios
    assert p.log_offset == 0
    assert p.frequency == pytest.approx(261.63)
    assert p.non_offset_frequency == pytest.approx(261.63)
    log_freq = math.log2(261.63)
    assert p.non_offset_log_freq == pytest.approx(log_freq)
    assert p.log_freq == pytest.approx(log_freq)
    assert p.sargam_letter == 'S'
    assert p.octaved_sargam_letter == 'S'
    assert p.numbered_pitch == 0
    assert p.chroma == 0
    assert p.to_JSON() == {
        'swara': 0,
        'raised': True,
        'oct': 0,
        'ratios': ratios,
        'fundamental': 261.63,
        'logOffset': 0,
    }


def test_swara_input():
    def sa_test(p: Pitch):
        sa_freq = 261.63
        sa_log_freq = math.log2(sa_freq)
        assert p.swara == 0
        assert math.isclose(p.frequency, sa_freq, abs_tol=0.01)
        assert math.isclose(p.log_freq, sa_log_freq, abs_tol=0.01)
        assert p.sargam_letter == 'S'
        assert p.raised is True
        assert p.chroma == 0

    def re_lowered_test(p: Pitch):
        re_freq = 277.19
        re_log_freq = math.log2(re_freq)
        assert p.swara == 1
        assert math.isclose(p.frequency, re_freq, abs_tol=0.01)
        assert math.isclose(p.log_freq, re_log_freq, abs_tol=0.01)
        assert p.sargam_letter == 'r'
        assert p.raised is False
        assert p.chroma == 1

    def re_raised_test(p: Pitch):
        re_freq = 293.67
        re_log_freq = math.log2(re_freq)
        assert p.swara == 1
        assert math.isclose(p.frequency, re_freq, abs_tol=0.01)
        assert math.isclose(p.log_freq, re_log_freq, abs_tol=0.01)
        assert p.sargam_letter == 'R'
        assert p.raised is True
        assert p.chroma == 2

    def ga_lowered_test(p: Pitch):
        ga_freq = 311.13
        ga_log_freq = math.log2(ga_freq)
        assert p.swara == 2
        assert math.isclose(p.frequency, ga_freq, abs_tol=0.01)
        assert math.isclose(p.log_freq, ga_log_freq, abs_tol=0.01)
        assert p.sargam_letter == 'g'
        assert p.raised is False
        assert p.chroma == 3

    def ga_raised_test(p: Pitch):
        ga_freq = 329.63
        ga_log_freq = math.log2(ga_freq)
        assert p.swara == 2
        assert math.isclose(p.frequency, ga_freq, abs_tol=0.01)
        assert math.isclose(p.log_freq, ga_log_freq, abs_tol=0.01)
        assert p.sargam_letter == 'G'
        assert p.raised is True
        assert p.chroma == 4

    def ma_lowered_test(p: Pitch):
        ma_freq = 349.23
        ma_log_freq = math.log2(ma_freq)
        assert p.swara == 3
        assert math.isclose(p.frequency, ma_freq, abs_tol=0.01)
        assert math.isclose(p.log_freq, ma_log_freq, abs_tol=0.01)
        assert p.sargam_letter == 'm'
        assert p.raised is False
        assert p.chroma == 5

    def ma_raised_test(p: Pitch):
        ma_freq = 370
        ma_log_freq = math.log2(ma_freq)
        assert p.swara == 3
        assert math.isclose(p.frequency, ma_freq, abs_tol=0.01)
        assert math.isclose(p.log_freq, ma_log_freq, abs_tol=0.01)
        assert p.sargam_letter == 'M'
        assert p.raised is True
        assert p.chroma == 6

    def pa_test(p: Pitch):
        pa_freq = 392
        pa_log_freq = math.log2(pa_freq)
        assert p.swara == 4
        assert math.isclose(p.frequency, pa_freq, abs_tol=0.01)
        assert math.isclose(p.log_freq, pa_log_freq, abs_tol=0.01)
        assert p.sargam_letter == 'P'
        assert p.raised is True
        assert p.chroma == 7

    def dha_lowered_test(p: Pitch):
        dha_freq = 415.31
        dha_log_freq = math.log2(dha_freq)
        assert p.swara == 5
        assert math.isclose(p.frequency, dha_freq, abs_tol=0.01)
        assert math.isclose(p.log_freq, dha_log_freq, abs_tol=0.01)
        assert p.sargam_letter == 'd'
        assert p.raised is False
        assert p.chroma == 8

    def dha_raised_test(p: Pitch):
        dha_freq = 440.01
        dha_log_freq = math.log2(dha_freq)
        assert p.swara == 5
        assert math.isclose(p.frequency, dha_freq, abs_tol=0.01)
        assert math.isclose(p.log_freq, dha_log_freq, abs_tol=0.01)
        assert p.sargam_letter == 'D'
        assert p.raised is True
        assert p.chroma == 9

    def ni_lowered_test(p: Pitch):
        ni_freq = 466.17
        ni_log_freq = math.log2(ni_freq)
        assert p.swara == 6
        assert math.isclose(p.frequency, ni_freq, abs_tol=0.01)
        assert math.isclose(p.log_freq, ni_log_freq, abs_tol=0.01)
        assert p.sargam_letter == 'n'
        assert p.raised is False
        assert p.chroma == 10

    def ni_raised_test(p: Pitch):
        ni_freq = 493.89
        ni_log_freq = math.log2(ni_freq)
        assert p.swara == 6
        assert math.isclose(p.frequency, ni_freq, abs_tol=0.01)
        assert math.isclose(p.log_freq, ni_log_freq, abs_tol=0.01)
        assert p.sargam_letter == 'N'
        assert p.raised is True
        assert p.chroma == 11

    sa_vars = ['Sa', 'sa', 'S', 's', 0]
    for sa in sa_vars:
        p = Pitch({'swara': sa})
        sa_test(p)
        p = Pitch({'swara': sa, 'raised': False})
        sa_test(p)

    re_vars = ['Re', 're', 'R', 'r', 1]
    for re in re_vars:
        p = Pitch({'swara': re})
        re_raised_test(p)
        p = Pitch({'swara': re, 'raised': False})
        re_lowered_test(p)

    ga_vars = ['Ga', 'ga', 'G', 'g', 2]
    for ga in ga_vars:
        p = Pitch({'swara': ga})
        ga_raised_test(p)
        p = Pitch({'swara': ga, 'raised': False})
        ga_lowered_test(p)

    ma_vars = ['Ma', 'ma', 'M', 'm', 3]
    for ma in ma_vars:
        p = Pitch({'swara': ma})
        ma_raised_test(p)
        p = Pitch({'swara': ma, 'raised': False})
        ma_lowered_test(p)

    pa_vars = ['Pa', 'pa', 'P', 'p', 4]
    for pa in pa_vars:
        p = Pitch({'swara': pa})
        pa_test(p)
        p = Pitch({'swara': pa, 'raised': False})
        pa_test(p)

    dha_vars = ['Dha', 'dha', 'D', 'd', 5]
    for dha in dha_vars:
        p = Pitch({'swara': dha})
        dha_raised_test(p)
        p = Pitch({'swara': dha, 'raised': False})
        dha_lowered_test(p)

    ni_vars = ['Ni', 'ni', 'N', 'n', 6]
    for ni in ni_vars:
        p = Pitch({'swara': ni})
        ni_raised_test(p)
        p = Pitch({'swara': ni, 'raised': False})
        ni_lowered_test(p)


def test_octave_input():
    p = Pitch({'swara': 'sa', 'oct': -2})
    sa_down2 = 'S' + '\u0324'
    sa_down1 = 'S' + '\u0323'
    sa_plus1 = 'S' + '\u0307'
    sa_plus2 = 'S' + '\u0308'
    assert p.oct == -2
    assert p.octaved_sargam_letter == sa_down2
    p.set_oct(-1)
    assert p.oct == -1
    assert p.octaved_sargam_letter == sa_down1
    p.set_oct(0)
    assert p.oct == 0
    assert p.octaved_sargam_letter == 'S'
    p.set_oct(1)
    assert p.oct == 1
    assert p.octaved_sargam_letter == sa_plus1
    p.set_oct(2)
    assert p.oct == 2
    assert p.octaved_sargam_letter == sa_plus2


def test_log_offset():
    offset = 0.1
    p = Pitch({'log_offset': offset})
    assert p.log_offset == offset
    sa_freq = 261.63
    sa_log_freq = math.log2(sa_freq)
    offset_sa_log_freq = sa_log_freq + offset
    offset_sa_freq = 2 ** offset_sa_log_freq
    assert math.isclose(p.frequency, offset_sa_freq, abs_tol=0.01)
    assert math.isclose(p.log_freq, offset_sa_log_freq, abs_tol=0.01)
    assert math.isclose(p.non_offset_frequency, sa_freq, abs_tol=0.01)


def test_numbered_pitch():
    p = Pitch({'swara': 5, 'oct': -2})
    assert p.numbered_pitch == -15
    p = Pitch({'swara': 2, 'oct': 0})
    assert p.numbered_pitch == 4
    p = Pitch({'swara': 3, 'raised': False, 'oct': 1})
    assert p.numbered_pitch == 17


def test_same_as():
    p1 = Pitch({'swara': 're', 'raised': False, 'oct': 1})
    p2 = Pitch({'swara': 1, 'raised': False, 'oct': 1})
    p3 = Pitch({'swara': 1, 'raised': True, 'oct': 1})
    assert p1.same_as(p2)
    assert not p1.same_as(p3)


def test_from_pitch_number_and_helpers():
    p = Pitch.from_pitch_number(4)
    assert p.swara == 2
    assert p.raised is True
    assert p.oct == 0

    p = Pitch.from_pitch_number(-1)
    assert p.swara == 6
    assert p.raised is True
    assert p.oct == -1

    assert Pitch.pitch_number_to_chroma(14) == 2
    assert Pitch.pitch_number_to_chroma(-1) == 11

    sd, raised = Pitch.chroma_to_scale_degree(3)
    assert sd == 2
    assert raised is False
    sd, raised = Pitch.chroma_to_scale_degree(11)
    assert sd == 6
    assert raised is True


def test_display_properties():
    p_down = Pitch({'swara': 'g', 'raised': False, 'oct': -1})
    assert p_down.solfege_letter == 'Me'
    assert p_down.octaved_scale_degree == '3\u0323'
    assert p_down.octaved_solfege_letter == 'Me\u0323'
    assert p_down.octaved_solfege_letter_with_cents == 'Me\u0323 (+0\u00A2)'
    assert p_down.octaved_chroma == '3\u0323'
    assert p_down.octaved_chroma_with_cents == '3\u0323 (+0\u00A2)'
    assert p_down.cents_string == '+0\u00A2'
    assert p_down.a440_cents_deviation == 'D#3 (+0\u00A2)'
    assert p_down.movable_c_cents_deviation == 'D# (+0\u00A2)'

    p_up = Pitch({'swara': 'Sa', 'oct': 2})
    assert p_up.solfege_letter == 'Do'
    assert p_up.octaved_scale_degree == '1\u0308'
    assert p_up.octaved_solfege_letter == 'Do\u0308'
    assert p_up.octaved_solfege_letter_with_cents == 'Do\u0308 (+0\u00A2)'
    assert p_up.octaved_chroma == '0\u0308'
    assert p_up.octaved_chroma_with_cents == '0\u0308 (+0\u00A2)'
    assert p_up.cents_string == '+0\u00A2'
    assert p_up.a440_cents_deviation == 'C6 (+0\u00A2)'
    assert p_up.movable_c_cents_deviation == 'C (+0\u00A2)'


def test_frequency_and_set_oct_error_handling():
    p1 = Pitch()
    p1.swara = 0
    p1.ratios[0] = 'bad'
    with pytest.raises(SyntaxError):
        _ = p1.frequency
    with pytest.raises(SyntaxError):
        p1.set_oct(1)

    p2 = Pitch()
    p2.swara = 're'  # type: ignore
    with pytest.raises(SyntaxError):
        _ = p2.frequency
    with pytest.raises(SyntaxError):
        p2.set_oct(0)

    p3 = Pitch()
    p3.swara = 1
    p3.ratios[1] = 0
    with pytest.raises(SyntaxError):
        _ = p3.frequency


def test_formatted_string_getters_across_octaves():
    expected = {
        -2: 'C2 (+0\u00A2)',
        -1: 'C3 (+0\u00A2)',
        0: 'C4 (+0\u00A2)',
        1: 'C5 (+0\u00A2)',
        2: 'C6 (+0\u00A2)'
    }
    for i in range(-2, 3):
        p = Pitch({'swara': 'Sa', 'oct': i})
        assert p.a440_cents_deviation == expected[i]
        assert p.movable_c_cents_deviation == 'C (+0\u00A2)'


def test_chroma_to_scale_degree_all_mappings():
    expected = [
        (0, True),
        (1, False),
        (1, True),
        (2, False),
        (2, True),
        (3, False),
        (3, True),
        (4, True),
        (5, False),
        (5, True),
        (6, False),
        (6, True),
    ]
    for c in range(12):
        sd, raised = Pitch.chroma_to_scale_degree(c)
        assert sd == expected[c][0]
        assert raised == expected[c][1]


def test_numbered_pitch_edge_cases():
    low = Pitch({'swara': 'Sa', 'oct': -3})
    assert low.numbered_pitch == -36
    high = Pitch({'swara': 'ni', 'raised': True, 'oct': 3})
    assert high.numbered_pitch == 47
    bad = Pitch()
    bad.swara = 7
    with pytest.raises(SyntaxError):
        _ = bad.numbered_pitch


def test_constructor_error_conditions():
    with pytest.raises(SyntaxError):
        Pitch({'raised': 1})
    with pytest.raises(SyntaxError):
        Pitch({'swara': []})
    with pytest.raises(SyntaxError):
        Pitch({'swara': 'foo'})
    with pytest.raises(SyntaxError):
        Pitch({'oct': 0.5})
    with pytest.raises(SyntaxError):
        Pitch({'oct': '1'})
    with pytest.raises(SyntaxError):
        Pitch({'fundamental': 'A4'})
    with pytest.raises(SyntaxError):
        Pitch({'swara': 'x'})
    with pytest.raises(SyntaxError):
        Pitch({'swara': -1})
    with pytest.raises(SyntaxError):
        Pitch({'swara': 7})


def test_set_oct_invalid_inputs():
    bad_sa = Pitch()
    bad_sa.swara = 0
    bad_sa.ratios[0] = 'bad'
    with pytest.raises(SyntaxError):
        bad_sa.set_oct(1)

    bad_pa = Pitch({'swara': 'pa'})
    bad_pa.ratios[4] = None  # type: ignore
    with pytest.raises(SyntaxError):
        bad_pa.set_oct(0)

    bad_nested = Pitch({'swara': 're'})
    bad_nested.swara = 1
    bad_nested.ratios[1] = 0
    with pytest.raises(SyntaxError):
        bad_nested.set_oct(2)

    wrong_swara_type = Pitch()
    wrong_swara_type.swara = 're'  # type: ignore
    with pytest.raises(SyntaxError):
        wrong_swara_type.set_oct(0)


def test_non_offset_frequency_and_formatted_getters():
    sa = Pitch({'swara': 'Sa', 'log_offset': 0.1})
    assert sa.non_offset_frequency == pytest.approx(261.63)
    assert sa.non_offset_log_freq == pytest.approx(math.log2(261.63))
    assert sa.cents_string == '+120\u00A2'
    assert sa.a440_cents_deviation == 'C#4 (+20\u00A2)'
    assert sa.movable_c_cents_deviation == 'C (+120\u00A2)'
    assert sa.octaved_sargam_letter_with_cents == 'S (+120\u00A2)'

    ga = Pitch({'swara': 'ga', 'raised': False, 'log_offset': -0.05})
    ga_base = 261.63 * (2 ** (3/12))
    assert ga.non_offset_frequency == pytest.approx(ga_base)
    assert ga.non_offset_log_freq == pytest.approx(math.log2(ga_base))
    assert ga.cents_string == '-60\u00A2'
    assert ga.a440_cents_deviation == 'D4 (+40\u00A2)'
    assert ga.movable_c_cents_deviation == 'D# (-60\u00A2)'
    assert ga.octaved_sargam_letter_with_cents == 'g (-60\u00A2)'


def test_serialization_round_trip():
    p = Pitch({'swara': 'ga', 'raised': False, 'oct': 1, 'log_offset': 0.2})
    json_obj = p.to_JSON()
    copy = Pitch.from_json(json_obj)
    assert copy.to_JSON() == json_obj


def test_a440_cents_deviation_edge_octaves():
    expected = {
        -3: 'C1 (+0\u00A2)',
        -2: 'C2 (+0\u00A2)',
        -1: 'C3 (+0\u00A2)',
        0: 'C4 (+0\u00A2)',
        1: 'C5 (+0\u00A2)',
        2: 'C6 (+0\u00A2)',
        3: 'C7 (+0\u00A2)'
    }
    for i in range(-3, 4):
        p = Pitch({'swara': 'Sa', 'oct': i})
        assert p.a440_cents_deviation == expected[i]
        assert p.movable_c_cents_deviation == 'C (+0\u00A2)'


def test_octaved_display_strings_extreme_octaves():
    low = Pitch({'swara': 'Sa', 'oct': -3})
    high = Pitch({'swara': 'Sa', 'oct': 3})
    assert low.octaved_sargam_letter == 'S\u20E8'
    assert high.octaved_sargam_letter == 'S\u20DB'
    assert low.octaved_solfege_letter == 'Do\u20E8'
    assert high.octaved_solfege_letter == 'Do\u20DB'
    assert low.octaved_chroma == '0\u20E8'
    assert high.octaved_chroma == '0\u20DB'


def test_numbered_pitch_invalid_swara_values():
    p = Pitch()
    p.swara = -1
    with pytest.raises(SyntaxError):
        _ = p.numbered_pitch
    p.swara = 7
    with pytest.raises(SyntaxError):
        _ = p.numbered_pitch
    p.swara = 'ni'  # type: ignore
    with pytest.raises(SyntaxError):
        _ = p.numbered_pitch


def test_to_json_from_json_preserves_log_offset():
    orig = Pitch({'swara': 'ni', 'raised': False, 'oct': 2, 'log_offset': -0.3})
    round_trip = Pitch.from_json(orig.to_JSON())
    assert round_trip.to_JSON() == orig.to_JSON()
    assert math.isclose(round_trip.frequency, orig.frequency, abs_tol=0.0001)


def test_invalid_ratio_values_trigger_errors():
    bad_re = Pitch({'swara': 're'})
    bad_re.swara = 1
    bad_re.ratios[1] = 'bad'
    with pytest.raises(SyntaxError):
        _ = bad_re.frequency
    with pytest.raises(SyntaxError):
        bad_re.set_oct(1)

    bad_ga = Pitch({'swara': 'ga'})
    bad_ga.swara = 2
    bad_ga.ratios[2] = 5
    with pytest.raises(SyntaxError):
        _ = bad_ga.frequency
    with pytest.raises(SyntaxError):
        bad_ga.set_oct(0)


def test_western_pitch():
    p = Pitch({'swara': 're', 'raised': True})
    assert p.western_pitch == 'D'


def test_a440_cents_deviation_over_50():
    re = Pitch({'swara': 're', 'raised': True, 'log_offset': 0.05})
    assert re.a440_cents_deviation == 'E4 (-40\u00A2)'

    ni = Pitch({'swara': 'ni', 'raised': True, 'log_offset': 0.05})
    assert ni.a440_cents_deviation == 'C#4 (-40\u00A2)'


def test_constructor_rejects_undefined_ratios():
    base_ratios = [
        1,
        [2 ** (1 / 12), 2 ** (2 / 12)],
        [2 ** (3 / 12), 2 ** (4 / 12)],
        [2 ** (5 / 12), 2 ** (6 / 12)],
        2 ** (7 / 12),
        [2 ** (8 / 12), 2 ** (9 / 12)],
        [2 ** (10 / 12), 2 ** (11 / 12)]
    ]

    ratios1 = base_ratios.copy()
    ratios1[0] = None
    with pytest.raises(SyntaxError):
        Pitch({'ratios': ratios1})

    ratios2 = base_ratios.copy()
    ratios2[1] = [2 ** (1 / 12), None]
    with pytest.raises(SyntaxError):
        Pitch({'ratios': ratios2})

