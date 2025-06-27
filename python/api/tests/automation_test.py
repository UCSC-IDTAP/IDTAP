import os
import sys
import json
import random
import pytest

sys.path.insert(0, os.path.abspath('.'))

from python.api.classes.automation import Automation

# Tests mirror src/ts/tests/automation.test.ts

def test_automation_basic():
    a = Automation()
    assert isinstance(a, Automation)
    assert a.values[0]['norm_time'] == 0
    assert a.values[0]['value'] == 1
    val_curve = a.generate_value_curve(0.1, 1)
    assert len(val_curve) == 11
    assert val_curve[0] == pytest.approx(1)

    with pytest.raises(SyntaxError):
        a.add_value(1.5, 0.5)
    with pytest.raises(SyntaxError):
        a.add_value(-0.5, 0.5)
    with pytest.raises(SyntaxError):
        a.add_value(0.5, -0.5)
    with pytest.raises(SyntaxError):
        a.add_value(0.5, 1.5)

    a.add_value(1, 0)
    assert len(a.values) == 2
    val_curve2 = a.generate_value_curve(0.1, 1)
    for i in range(11):
        assert val_curve2[i] == pytest.approx(1 - i / 10)

    a.add_value(0.5, 0.2)
    assert len(a.values) == 3
    val_curve3 = a.generate_value_curve(0.1, 1)
    expected_vals = [
        1, 0.84, 0.68, 0.52, 0.36, 0.2,
        0.16, 0.12, 0.08, 0.04, 0
    ]
    for i in range(11):
        assert val_curve3[i] == pytest.approx(expected_vals[i])


def test_partition_and_compress():
    orig = Automation()
    orig.add_value(1, 0)
    dur_array = [0.4, 0.6]
    children = orig.partition(dur_array)
    assert len(children) == 2
    c1, c2 = children
    assert len(c1.values) == 2
    assert len(c2.values) == 2
    assert c1.values[0]['norm_time'] == 0
    assert c1.values[0]['value'] == 1
    assert c1.values[1]['norm_time'] == 1
    assert c1.values[1]['value'] == pytest.approx(0.6)
    assert c2.values[0]['norm_time'] == 0
    assert c2.values[0]['value'] == pytest.approx(0.6)
    assert c2.values[1]['norm_time'] == 1
    assert c2.values[1]['value'] == 0
    assert c1.value_at_x(0.5) == pytest.approx(0.8)
    assert c2.value_at_x(0.5) == pytest.approx(0.3)

    compressed = Automation.compress(children, dur_array)
    assert len(compressed.values) == 2
    assert compressed.values[0]['norm_time'] == 0
    assert compressed.values[0]['value'] == 1
    assert compressed.values[1]['norm_time'] == 1
    assert compressed.values[1]['value'] == 0

    orig2 = Automation()
    times = [0.13, 0.38, 0.44, 0.6, 0.77777, 0.912345]
    vals = [random.random() for _ in times]
    for t, v in zip(times, vals):
        orig2.add_value(t, v)
    dur_array2 = [0.25, 0.3, 0.45]
    children2 = orig2.partition(dur_array2)
    assert len(children2) == 3
    compressed2 = Automation.compress(children2, dur_array2)
    assert len(compressed2.values) == 8
    returned_times = [v['norm_time'] for v in compressed2.values]
    suplemented_times = [0] + times + [1]
    for r, s in zip(returned_times, suplemented_times):
        assert r == pytest.approx(s)

    a1 = Automation()
    a2 = Automation()
    dur_array3 = [0.4, 0.6]
    new_auto = Automation.compress([a1, a2], dur_array3)
    assert len(new_auto.values) == 2


def test_from_json_round_trip():
    orig = Automation()
    orig.add_value(0.3, 0.7)
    orig.add_value(0.8, 0.4)
    json_obj = json.loads(json.dumps({'values': orig.values}))
    clone = Automation.from_json(json_obj)
    assert isinstance(clone, Automation)
    assert clone.values == orig.values


def test_remove_value_bounds():
    a = Automation()
    a.add_value(0.5, 0.5)
    length = len(a.values)
    with pytest.raises(SyntaxError):
        a.remove_value(-1)
    with pytest.raises(SyntaxError):
        a.remove_value(length)
    with pytest.raises(SyntaxError):
        a.remove_value(0)
    with pytest.raises(SyntaxError):
        a.remove_value(length - 1)
    a.remove_value(1)
    assert len(a.values) == length - 1


def test_value_at_x_bounds():
    a = Automation()
    with pytest.raises(SyntaxError):
        a.value_at_x(-0.1)
    with pytest.raises(SyntaxError):
        a.value_at_x(1.1)


def test_partition_with_zero_length_segment():
    orig = Automation()
    orig.add_value(1, 0)
    dur_array = [0.4, 0, 0.6]
    parts = orig.partition(dur_array)
    assert len(parts) == 3

    env1 = parts[0].generate_value_curve(0.1, 1)
    env2 = parts[1].generate_value_curve(0.1, 1)
    env3 = parts[2].generate_value_curve(0.1, 1)

    expected1 = [
        1, 0.96, 0.92, 0.88, 0.84,
        0.8, 0.76, 0.72, 0.68,
        0.64, 0.6
    ]
    for i in range(len(env1)):
        assert env1[i] == pytest.approx(expected1[i])

    for val in env2:
        assert val == pytest.approx(0.6)

    expected3 = [0.6, 0.54, 0.48, 0.42, 0.36, 0.3, 0.24, 0.18, 0.12, 0.06, 0]
    for i in range(len(env3)):
        assert env3[i] == pytest.approx(expected3[i])


def test_value_at_x_before_first_value():
    auto = Automation({
        'values': [
            {'norm_time': 0.2, 'value': 0.5},
            {'norm_time': 1, 'value': 1}
        ]
    })
    with pytest.raises(SyntaxError):
        auto.value_at_x(0.1)

