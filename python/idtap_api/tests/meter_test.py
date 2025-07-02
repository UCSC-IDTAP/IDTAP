import os
import sys
import math
import pytest

sys.path.insert(0, os.path.abspath('.'))

from python.idtap_api.classes.meter import Meter, Pulse, PulseStructure, find_closest_idxs

# Tests mirror src/ts/tests/meter.test.js (simplified implementation)

def test_meter_reset_tempo_and_grow_cycle():
    m = Meter()
    assert isinstance(m, Meter)
    assert m.real_times == [
        0, 0.25, 0.5, 0.75,
        1, 1.25, 1.5, 1.75,
        2, 2.25, 2.5, 2.75,
        3, 3.25, 3.5, 3.75
    ]

    a = Meter(hierarchy=[4])
    assert a.real_times == [0, 1, 2, 3]
    last_pulse = a.all_pulses[-1]
    a.offset_pulse(last_pulse, -0.5)
    assert a.real_times == [0, 1, 2, 2.5]
    a.reset_tempo()
    assert a.real_times == [0, 1, 2, 2.5]
    a.grow_cycle()
    times = [0, 1, 2, 2.5, 10/3, 25/6, 30/6, 35/6]
    for rt, exp in zip(a.real_times, times):
        assert pytest.approx(rt, rel=1e-8) == exp

    b = Meter(hierarchy=[[2, 2]])
    assert b.real_times == [0, 1, 2, 3]
    b_last = b.all_pulses[-1]
    b.offset_pulse(b_last, -0.5)
    assert b.real_times == [0, 1, 2, 2.5]
    b.reset_tempo()
    assert b.real_times == [0, 1, 2, 2.5]
    b.grow_cycle()
    for rt, exp in zip(b.real_times, times):
        assert pytest.approx(rt, rel=1e-8) == exp

    c = Meter(hierarchy=[2, 2], tempo=30)
    assert c.real_times == [0, 1, 2, 3]
    c_last = c.all_pulses[-1]
    c.offset_pulse(c_last, -0.5)
    assert c.real_times == [0, 1, 2, 2.5]
    c.reset_tempo()
    assert c.real_times == [0, 1, 2, 2.5]
    c.grow_cycle()
    for rt, exp in zip(c.real_times, times):
        assert pytest.approx(rt, rel=1e-8) == exp

    d = Meter(hierarchy=[2, 2, 2], tempo=30)
    assert d.real_times == [0, 0.5, 1, 1.5, 2, 2.5, 3, 3.5]
    d_last = d.all_pulses[-1]
    d.offset_pulse(d_last, -0.25)
    assert d.real_times == [0, 0.5, 1, 1.5, 2, 2.5, 3, 3.25]
    d.reset_tempo()
    assert d.real_times == [0, 0.5, 1, 1.5, 2, 2.5, 3, 3.25]
    d.grow_cycle()
    end1 = 3.25 * 8 / 7
    bit = end1 / 8
    next_times = [end1 + bit * i for i in range(8)]
    all_times = [0, 0.5, 1, 1.5, 2, 2.5, 3, 3.25] + next_times
    for rt, exp in zip(d.real_times, all_times):
        assert pytest.approx(rt, rel=1e-8) == exp

    e = Meter(hierarchy=[2, 2, 2, 2], tempo=15)
    assert e.real_times == [
        0, 0.5, 1, 1.5, 2, 2.5, 3, 3.5,
        4, 4.5, 5, 5.5, 6, 6.5, 7, 7.5
    ]
    e_last = e.all_pulses[-1]
    e.offset_pulse(e_last, -0.25)
    target_times = [
        0, 0.5, 1, 1.5, 2, 2.5, 3, 3.5,
        4, 4.5, 5, 5.5, 6, 6.5, 7, 7.25
    ]
    assert e.real_times == target_times
    e.reset_tempo()
    for rt, exp in zip(e.real_times, target_times):
        assert pytest.approx(rt, rel=1e-8) == exp
    e.grow_cycle()
    end2 = 7.25 * 16 / 15
    bit2 = end2 / 16
    next_times2 = [end2 + bit2 * i for i in range(16)]
    all_times2 = target_times + next_times2
    for rt, exp in zip(e.real_times, all_times2):
        assert pytest.approx(rt, rel=1e-8) == exp


def test_more_complicated_single_layer():
    a = Meter(hierarchy=[7])
    b = Meter(hierarchy=[[2, 2, 3]])
    assert a.real_times == b.real_times
    a_last = a.all_pulses[-1]
    b_last = b.all_pulses[-1]
    a_third = a.all_pulses[2]
    b_third = b.all_pulses[2]
    a.offset_pulse(a_third, 0.1)
    b.offset_pulse(b_third, 0.1)
    a.offset_pulse(a_last, -0.5)
    b.offset_pulse(b_last, -0.5)
    assert a.real_times == b.real_times
    a.reset_tempo()
    b.reset_tempo()
    for rt, exp in zip(a.real_times, b.real_times):
        assert pytest.approx(rt, rel=1e-8) == exp
    a.grow_cycle()
    b.grow_cycle()
    for rt, exp in zip(a.real_times, b.real_times):
        assert pytest.approx(rt, rel=1e-8) == exp


def test_regeneration():
    pulse = Pulse()
    frozen = pulse.to_json()
    new_pulse = Pulse.from_json(frozen)
    assert new_pulse == pulse

    ps = PulseStructure()
    frozen2 = ps.to_json()
    new_ps = PulseStructure.from_json(frozen2)
    assert new_ps == ps
    assert isinstance(new_ps.pulses[0], Pulse)

    m = Meter()
    frozen3 = m.to_json()
    new_m = Meter.from_json(frozen3)
    assert new_m == m


def test_find_closest_idxs():
    trials = [1.1, 1.9, 4.4]
    items = [0, 1, 2, 3, 4, 5, 6, 7]
    expected = [1, 2, 4]
    assert find_closest_idxs(trials, items) == expected


def includes_with_tolerance(array, target, tolerance):
    return any(abs(item - target) <= tolerance for item in array)


def test_add_time_points():
    m = Meter()
    assert isinstance(m, Meter)
    assert m.real_times == [
        0, 0.25, 0.5, 0.75,
        1, 1.25, 1.5, 1.75,
        2, 2.25, 2.5, 2.75,
        3, 3.25, 3.5, 3.75
    ]
    new_times = [4.6, 5.1, 5.7]
    m.add_time_points(new_times, 1)
    for nt in new_times:
        assert includes_with_tolerance(m.real_times, nt, 1e-8)
