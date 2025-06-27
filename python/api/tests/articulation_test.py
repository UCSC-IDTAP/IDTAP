import os
import sys
import pytest

sys.path.insert(0, os.path.abspath('.'))

from python.api.classes.articulation import Articulation

# Tests mirror src/js/tests/articulation.test.ts

def test_default_articulation():
    a = Articulation()
    assert isinstance(a, Articulation)
    assert a.name == 'pluck'
    assert getattr(a, 'stroke', None) is None
    assert getattr(a, 'hindi', None) is None
    assert getattr(a, 'ipa', None) is None
    assert getattr(a, 'eng_trans', None) is None


def test_articulation_from_json():
    obj = {
        'name': 'pluck',
        'stroke': 'd',
        'hindi': '\u0926',
        'ipa': 'd\u032a',
        'engTrans': 'da',
        'strokeNickname': 'da'
    }
    a = Articulation.from_json(obj)
    assert a.stroke == 'd'
    assert a.stroke_nickname == 'da'


def test_stroke_nickname_defaults_da_for_d():
    a = Articulation({'stroke': 'd'})
    assert a.stroke_nickname == 'da'
    assert a.name == 'pluck'
    assert a.stroke == 'd'
    assert not hasattr(a, 'hindi')
    assert not hasattr(a, 'ipa')
    assert not hasattr(a, 'eng_trans')


def test_stroke_nickname_defaults_da_for_d_duplicate():
    a = Articulation({'stroke': 'd'})
    assert a.stroke_nickname == 'da'
    assert a.name == 'pluck'
    assert a.stroke == 'd'
    assert not hasattr(a, 'hindi')
    assert not hasattr(a, 'ipa')
    assert not hasattr(a, 'eng_trans')


def test_stroke_r_sets_nickname():
    a = Articulation({'stroke': 'r'})
    assert a.stroke_nickname == 'ra'


def test_stroke_r_from_json_sets_nickname():
    obj = {'name': 'pluck', 'stroke': 'r'}
    a = Articulation.from_json(obj)
    assert a.stroke_nickname == 'ra'

