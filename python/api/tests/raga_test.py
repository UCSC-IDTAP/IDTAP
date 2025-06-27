import os
import sys
import math
import pytest

sys.path.insert(0, os.path.abspath('.'))

from python.api.classes.raga import Raga, yaman_rule_set, et_tuning
from python.api.classes.pitch import Pitch

base_tuning = et_tuning

base_ratios = [
    base_tuning['sa'],
    base_tuning['re']['raised'],
    base_tuning['ga']['raised'],
    base_tuning['ma']['raised'],
    base_tuning['pa'],
    base_tuning['dha']['raised'],
    base_tuning['ni']['raised'],
]

custom_rule_set = {
    'sa': True,
    're': {'lowered': True, 'raised': False},
    'ga': {'lowered': False, 'raised': True},
    'ma': {'lowered': True, 'raised': True},
    'pa': True,
    'dha': {'lowered': True, 'raised': False},
    'ni': {'lowered': False, 'raised': True},
}

ratio_mapping = [
    ('sa', True),
    ('re', False),
    ('ga', True),
    ('ma', False),
    ('ma', True),
    ('pa', True),
    ('dha', False),
    ('ni', True),
]

def compute_expected_pitches(r: Raga, low=100, high=800):
    pitches: list[Pitch] = []
    for swara, raised in ratio_mapping:
        ratio = (r.tuning[swara]['raised' if raised else 'lowered']
                 if isinstance(r.tuning[swara], dict)
                 else r.tuning[swara])
        freq = ratio * r.fundamental
        low_exp = math.ceil(math.log2(low / freq))
        high_exp = math.floor(math.log2(high / freq))
        for i in range(low_exp, high_exp + 1):
            pitches.append(Pitch({'swara': swara, 'oct': i, 'raised': raised,
                                  'fundamental': r.fundamental, 'ratios': r.stratified_ratios}))
    pitches.sort(key=lambda p: p.frequency)
    return [p for p in pitches if low <= p.frequency <= high]


def test_default_raga():
    r = Raga()
    assert isinstance(r, Raga)
    assert r.name == 'Yaman'
    assert r.fundamental == 261.63
    assert r.rule_set == yaman_rule_set
    assert r.tuning == base_tuning
    assert r.ratios == base_ratios
    assert r.sargam_letters == ['S', 'R', 'G', 'M', 'P', 'D', 'N']
    assert r.rule_set_num_pitches == 7

    pitch_nums = list(range(12))
    sargam_letters = ['S', None, 'R', None, 'G', None, 'M', 'P', None, 'D', None, 'N']
    for pn in pitch_nums:
        assert r.pitch_number_to_sargam_letter(pn) == sargam_letters[pn]

    single_oct_pns = [0, 2, 4, 6, 7, 9, 11, 12]
    assert r.get_pitch_numbers(0, 12) == single_oct_pns

    pns = [
        -12, -10, -8, -6, -5, -3, -1,
        0, 2, 4, 6, 7, 9, 11,
        12, 14, 16, 18, 19, 21, 23, 24,
    ]
    assert r.get_pitch_numbers(-12, 24) == pns

    sns = [
        -7, -6, -5, -4, -3, -2, -1,
        0, 1, 2, 3, 4, 5, 6,
        7, 8, 9, 10, 11, 12, 13, 14,
    ]
    throw_pns = [
        -11, -9, -7, -4, -2,
        1, 3, 5, 8, 10,
        13, 15, 17, 20, 22,
    ]

    for idx, pn in enumerate(pns):
        assert r.pitch_number_to_scale_number(pn) == sns[idx]

    for pn in throw_pns:
        with pytest.raises(ValueError):
            r.pitch_number_to_scale_number(pn)

    for idx, sn in enumerate(sns):
        assert r.scale_number_to_pitch_number(sn) == pns[idx]

    s_letters = ['S', 'R', 'G', 'M', 'P', 'D', 'N'] * 3 + ['S']
    for idx, sn in enumerate(sns):
        assert r.scale_number_to_sargam_letter(sn) == s_letters[idx]

    p_swaras = [
        5, 6,
        0, 1, 2, 3, 4, 5, 6,
        0, 1, 2, 3, 4, 5, 6,
        0, 1, 2, 3, 4,
    ]
    p_octs = [
        -2, -2,
        -1, -1, -1, -1, -1, -1, -1,
        0, 0, 0, 0, 0, 0, 0,
        1, 1, 1, 1, 1,
    ]
    pitches = [Pitch({'swara': s, 'oct': p_octs[idx]}) for idx, s in enumerate(p_swaras)]
    assert r.get_pitches() == pitches

    s_ratios = [
        2 ** 0,
        [2 ** (1 / 12), 2 ** (2 / 12)],
        [2 ** (3 / 12), 2 ** (4 / 12)],
        [2 ** (5 / 12), 2 ** (6 / 12)],
        2 ** (7 / 12),
        [2 ** (8 / 12), 2 ** (9 / 12)],
        [2 ** (10 / 12), 2 ** (11 / 12)],
    ]
    assert r.stratified_ratios == s_ratios
    assert r.chikari_pitches == [
        Pitch({'swara': 0, 'oct': 2, 'fundamental': 261.63}),
        Pitch({'swara': 0, 'oct': 1, 'fundamental': 261.63}),
    ]

    hard_coded_freqs = [
        110.00186456141468, 123.47291821345574,
        130.815, 146.83487284959062,
        164.81657214199782, 185.00034716183643,
        196.0010402616231, 220.00372912282936,
        246.94583642691148, 261.63,
        293.66974569918125, 329.63314428399565,
        370.00069432367286, 392.0020805232462,
        440.0074582456587, 493.89167285382297,
        523.26, 587.3394913983625,
        659.2662885679913, 740.0013886473457,
        784.0041610464924,
    ]
    for idx, freq in enumerate(r.get_frequencies()):
        assert math.isclose(pitches[idx].frequency, freq, abs_tol=1e-6)
        assert math.isclose(hard_coded_freqs[idx], freq, abs_tol=1e-6)

    s_names = ['Sa', 'Re', 'Ga', 'Ma', 'Pa', 'Dha', 'Ni']
    assert r.sargam_names == s_names

    json_obj = {
        'name': 'Yaman',
        'fundamental': 261.63,
        'ratios': base_ratios,
        'tuning': base_tuning,
    }
    assert r.to_json() == json_obj


def test_pitch_from_log_freq():
    r = Raga()
    offset = 0.03
    base_log = math.log2(r.fundamental * 2)
    p = r.pitch_from_log_freq(base_log + offset)
    assert isinstance(p, Pitch)
    assert math.isclose(p.frequency, 2 ** (base_log + offset), abs_tol=1e-6)


def test_pitch_string_getters():
    r = Raga()
    pl = r.get_pitches(low=r.fundamental, high=r.fundamental * 1.999)
    solfege = [p.solfege_letter for p in pl]
    pcs = [str(p.chroma) for p in pl]
    western = [p.western_pitch for p in pl]
    assert r.solfege_strings == solfege
    assert r.pc_strings == pcs
    assert r.western_pitch_strings == western


def test_swara_objects():
    r = Raga()
    objs = [
        {'swara': 0, 'raised': True},
        {'swara': 1, 'raised': True},
        {'swara': 2, 'raised': True},
        {'swara': 3, 'raised': True},
        {'swara': 4, 'raised': True},
        {'swara': 5, 'raised': True},
        {'swara': 6, 'raised': True},
    ]
    assert r.swara_objects == objs


def test_ratio_idx_to_tuning_tuple():
    r = Raga()
    mapping = [
        ('sa', None),
        ('re', 'raised'),
        ('ga', 'raised'),
        ('ma', 'raised'),
        ('pa', None),
        ('dha', 'raised'),
        ('ni', 'raised'),
    ]
    for idx, tup in enumerate(mapping):
        assert r.ratio_idx_to_tuning_tuple(idx) == tup


def test_custom_rule_set_pitch_numbers_and_invalid_conversions():
    r = Raga({'rule_set': custom_rule_set, 'fundamental': 200})
    expected = [0, 1, 4, 5, 6, 7, 8, 11]
    assert r.rule_set_num_pitches == len(expected)
    assert r.get_pitch_numbers(0, 11) == expected
    for idx, pn in enumerate(expected):
        assert r.pitch_number_to_scale_number(pn) == idx
    disallowed = [2, 3, 9, 10]
    for pn in disallowed:
        with pytest.raises(ValueError):
            r.pitch_number_to_scale_number(pn)


def test_get_pitches_with_lowered_and_raised_notes():
    r = Raga({'rule_set': custom_rule_set, 'fundamental': 200})
    expected = compute_expected_pitches(r)
    result = r.get_pitches()
    assert len(result) == len(expected)
    for idx, p in enumerate(result):
        assert math.isclose(p.frequency, expected[idx].frequency, abs_tol=1e-6)
        assert p.swara == expected[idx].swara
        assert p.oct == expected[idx].oct
        assert p.raised == expected[idx].raised


def test_pitch_from_log_freq_octave_rounding():
    r = Raga()
    base = math.log2(r.fundamental)
    near = base + 1 - 5e-7
    p1 = r.pitch_from_log_freq(near)
    assert p1.sargam_letter == 'S'
    assert p1.oct == 1
    p2 = r.pitch_from_log_freq(base + 1 + 5e-7)
    assert p2.sargam_letter == 'S'
    assert p2.oct == 1


def test_pitch_from_log_freq_near_exact_octave_offset():
    fundamental = 128.5 - 1e-12
    r = Raga({'fundamental': fundamental})
    log_freq = math.log2(fundamental * 2)
    p = r.pitch_from_log_freq(log_freq)
    assert p.sargam_letter == 'S'
    assert p.oct == 1


def test_ratio_idx_to_tuning_tuple_mixed_rule_set():
    r = Raga({'rule_set': custom_rule_set})
    mapping = [
        ('sa', None),
        ('re', 'lowered'),
        ('ga', 'raised'),
        ('ma', 'lowered'),
        ('ma', 'raised'),
        ('pa', None),
        ('dha', 'lowered'),
        ('ni', 'raised'),
    ]
    for idx, tup in enumerate(mapping):
        assert r.ratio_idx_to_tuning_tuple(idx) == tup


def test_json_round_trip_with_custom_tuning():
    tuning = {
        'sa': 1.01,
        're': {'lowered': 1.02, 'raised': 1.035},
        'ga': {'lowered': 1.04, 'raised': 1.05},
        'ma': {'lowered': 1.06, 'raised': 1.07},
        'pa': 1.08,
        'dha': {'lowered': 1.09, 'raised': 1.1},
        'ni': {'lowered': 1.11, 'raised': 1.12},
    }
    ratios = [
        tuning['sa'],
        tuning['re']['lowered'],
        tuning['ga']['raised'],
        tuning['ma']['lowered'],
        tuning['ma']['raised'],
        tuning['pa'],
        tuning['dha']['lowered'],
        tuning['ni']['raised'],
    ]
    r = Raga({'name': 'Custom', 'fundamental': 300, 'rule_set': custom_rule_set, 'tuning': tuning, 'ratios': ratios})
    json_obj = r.to_json()
    round_trip = Raga.from_json({**json_obj, 'rule_set': custom_rule_set})
    assert round_trip.to_json() == json_obj

# Additional raga utilities
additional_rule_set = {
    'sa': True,
    're': {'lowered': True, 'raised': False},
    'ga': {'lowered': False, 'raised': True},
    'ma': {'lowered': True, 'raised': True},
    'pa': True,
    'dha': {'lowered': False, 'raised': True},
    'ni': {'lowered': True, 'raised': False},
}

fundamental = 200

def et(n: int):
    return 2 ** (n / 12)

expected_ratios = [
    et(0),
    et(1),
    et(4),
    et(5),
    et(6),
    et(7),
    et(9),
    et(10),
]

expected_stratified = [
    et(0),
    [et(1), et(2)],
    [et(3), et(4)],
    [et(5), et(6)],
    et(7),
    [et(8), et(9)],
    [et(10), et(11)],
]

def compute_freqs(r: Raga, low=100, high=800):
    freqs: list[float] = []
    for ratio in expected_ratios:
        base = ratio * r.fundamental
        low_exp = math.ceil(math.log2(low / base))
        high_exp = math.floor(math.log2(high / base))
        for i in range(low_exp, high_exp + 1):
            freqs.append(base * 2 ** i)
    freqs.sort()
    return freqs

mapping_additional = [
    ('sa', None),
    ('re', 'lowered'),
    ('ga', 'raised'),
    ('ma', 'lowered'),
    ('ma', 'raised'),
    ('pa', None),
    ('dha', 'raised'),
    ('ni', 'lowered'),
]

def test_set_ratios_and_stratified_ratios_with_custom_rules():
    r = Raga({'rule_set': additional_rule_set, 'fundamental': fundamental})
    assert r.set_ratios(additional_rule_set) == expected_ratios
    assert len(r.ratios) == len(expected_ratios)
    for idx, ratio in enumerate(expected_ratios):
        assert math.isclose(r.ratios[idx], ratio, abs_tol=1e-6)
    assert len(r.stratified_ratios) == len(expected_stratified)
    for idx, ratio in enumerate(expected_stratified):
        if isinstance(ratio, list):
            assert r.stratified_ratios[idx] == ratio
        else:
            assert math.isclose(r.stratified_ratios[idx], ratio, abs_tol=1e-6)


def test_from_json_frequencies_and_helper_mappings():
    r = Raga({'rule_set': additional_rule_set, 'fundamental': fundamental})
    json_obj = r.to_json()
    copy = Raga.from_json({**json_obj, 'rule_set': additional_rule_set})
    assert copy.to_json() == json_obj

    freqs = r.get_frequencies()
    expected_freqs = compute_freqs(r)
    assert len(freqs) == len(expected_freqs)
    for idx, f in enumerate(freqs):
        assert math.isclose(f, expected_freqs[idx], abs_tol=1e-6)

    chosen = freqs[4]
    p = r.pitch_from_log_freq(math.log2(chosen))
    assert isinstance(p, Pitch)
    assert math.isclose(p.frequency, chosen, abs_tol=1e-6)

    for idx, tup in enumerate(mapping_additional):
        assert r.ratio_idx_to_tuning_tuple(idx) == tup


def test_pitch_number_to_scale_number_edge_cases():
    r = Raga({'rule_set': additional_rule_set, 'fundamental': fundamental})
    allowed = r.get_pitch_numbers(0, 11)
    for idx, pn in enumerate(allowed):
        assert r.pitch_number_to_scale_number(pn) == idx
    disallowed = [2, 3, 8, 11]
    for pn in disallowed:
        with pytest.raises(ValueError):
            r.pitch_number_to_scale_number(pn)


def test_raga_conversion_helpers():
    r = Raga({'rule_set': additional_rule_set, 'fundamental': fundamental})
    pitch_numbers = [0, 1, 4, 5, 6, 7, 9, 10]
    letters = ['S', 'r', 'G', 'm', 'M', 'P', 'D', 'n']
    for idx, pn in enumerate(pitch_numbers):
        assert r.pitch_number_to_sargam_letter(pn) == letters[idx]
        assert r.pitch_number_to_scale_number(pn) == idx
        assert r.scale_number_to_pitch_number(idx) == pn
        assert r.scale_number_to_sargam_letter(idx) == letters[idx]
    length = len(pitch_numbers)
    assert r.scale_number_to_pitch_number(length) == pitch_numbers[0] + 12
    assert r.scale_number_to_pitch_number(length + 1) == pitch_numbers[1] + 12
    invalid_pns = [2, 3, 8, 11]
    for pn in invalid_pns:
        assert r.pitch_number_to_sargam_letter(pn) is None
        with pytest.raises(ValueError):
            r.pitch_number_to_scale_number(pn)

# Custom rule set utilities
custom_local_rule_set = {
    'sa': True,
    're': {'lowered': True, 'raised': False},
    'ga': {'lowered': False, 'raised': True},
    'ma': {'lowered': True, 'raised': True},
    'pa': True,
    'dha': {'lowered': True, 'raised': False},
    'ni': {'lowered': False, 'raised': True},
}

expected_ratios_local = [
    2 ** (0 / 12),
    2 ** (1 / 12),
    2 ** (4 / 12),
    2 ** (5 / 12),
    2 ** (6 / 12),
    2 ** (7 / 12),
    2 ** (8 / 12),
    2 ** (11 / 12),
]

ratio_mapping_local = [
    ('sa', True, expected_ratios_local[0]),
    ('re', False, expected_ratios_local[1]),
    ('ga', True, expected_ratios_local[2]),
    ('ma', False, expected_ratios_local[3]),
    ('ma', True, expected_ratios_local[4]),
    ('pa', True, expected_ratios_local[5]),
    ('dha', False, expected_ratios_local[6]),
    ('ni', True, expected_ratios_local[7]),
]

def compute_expected_pitches_local(r: Raga, low=100, high=800):
    pitches: list[Pitch] = []
    for swara, raised, ratio in ratio_mapping_local:
        freq = ratio * r.fundamental
        low_exp = math.ceil(math.log2(low / freq))
        high_exp = math.floor(math.log2(high / freq))
        for i in range(low_exp, high_exp + 1):
            pitches.append(Pitch({'swara': swara, 'oct': i, 'raised': raised,
                                  'fundamental': r.fundamental, 'ratios': r.stratified_ratios}))
    pitches.sort(key=lambda p: p.frequency)
    return [p for p in pitches if low <= p.frequency <= high]

def compute_expected_freqs_local(r: Raga, low=100, high=800):
    freqs: list[float] = []
    for ratio in expected_ratios_local:
        base = ratio * r.fundamental
        low_exp = math.ceil(math.log2(low / base))
        high_exp = math.floor(math.log2(high / base))
        for i in range(low_exp, high_exp + 1):
            freqs.append(base * 2 ** i)
    freqs.sort()
    return freqs

pitch_numbers_single_oct = [0, 1, 4, 5, 6, 7, 8, 11]

def test_custom_rule_set_basic_functions():
    r = Raga({'rule_set': custom_local_rule_set, 'fundamental': fundamental})
    assert r.rule_set_num_pitches == 8
    for idx, pn in enumerate(pitch_numbers_single_oct):
        assert r.get_pitch_numbers(0, 11)[idx] == pn
    for idx, ratio in enumerate(expected_ratios_local):
        assert math.isclose(r.ratios[idx], ratio, abs_tol=1e-6)
    from_set = r.set_ratios(custom_local_rule_set)
    for idx, ratio in enumerate(from_set):
        assert math.isclose(r.ratios[idx], ratio, abs_tol=1e-6)


def test_get_pitches_frequencies_and_flags():
    r = Raga({'rule_set': custom_local_rule_set, 'fundamental': fundamental})
    expected = compute_expected_pitches_local(r)
    result = r.get_pitches()
    assert len(result) == len(expected)
    for idx, p in enumerate(result):
        assert math.isclose(p.frequency, expected[idx].frequency, abs_tol=1e-6)
        assert p.swara == expected[idx].swara
        assert p.oct == expected[idx].oct
        assert p.raised == expected[idx].raised


def test_frequency_helpers_with_custom_rule_set():
    r = Raga({'rule_set': custom_local_rule_set, 'fundamental': fundamental})
    expected_freqs = compute_expected_freqs_local(r)
    freqs = r.get_frequencies()
    assert len(freqs) == len(expected_freqs)
    for idx, f in enumerate(freqs):
        assert math.isclose(f, expected_freqs[idx], abs_tol=1e-6)

    pick_freq = freqs[3]
    p = r.pitch_from_log_freq(math.log2(pick_freq))
    assert math.isclose(p.frequency, pick_freq, abs_tol=1e-6)

    mapping = [
        ('sa', None),
        ('re', 'lowered'),
        ('ga', 'raised'),
        ('ma', 'lowered'),
        ('ma', 'raised'),
        ('pa', None),
        ('dha', 'lowered'),
        ('ni', 'raised'),
    ]
    for idx, tup in enumerate(mapping):
        assert r.ratio_idx_to_tuning_tuple(idx) == tup


def test_model_raga_string_getters():
    r = Raga()
    pl = r.get_pitches(low=r.fundamental, high=r.fundamental * 1.999)
    solfege = [p.solfege_letter for p in pl]
    pcs = [str(p.chroma) for p in pl]
    western = [p.western_pitch for p in pl]
    assert r.solfege_strings == solfege
    assert r.pc_strings == pcs
    assert r.western_pitch_strings == western
