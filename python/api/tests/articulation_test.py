from python.api.classes.articulation import Articulation

def test_default_articulation():
    a = Articulation()
    assert isinstance(a, Articulation)
    assert a.name == 'pluck'
    assert a.stroke is None
    assert a.hindi is None
    assert a.ipa is None
    assert a.eng_trans is None


def test_articulation_from_json():
    obj = {
        'name': 'pluck',
        'stroke': 'd',
        'hindi': '\u0926',
        'ipa': 'd̪',
        'engTrans': 'da',
        'strokeNickname': 'da'
    }
    a = Articulation.from_json(obj)
    assert a.stroke == 'd'
    assert a.stroke_nickname == 'da'


def test_stroke_nickname_defaults_da():
    a = Articulation({'stroke': 'd'})
    assert a.stroke_nickname == 'da'
    assert a.name == 'pluck'
    assert a.stroke == 'd'
    assert a.hindi is None
    assert a.ipa is None
    assert a.eng_trans is None


def test_stroke_nickname_defaults_da_duplicate():
    a = Articulation({'stroke': 'd'})
    assert a.stroke_nickname == 'da'
    assert a.name == 'pluck'
    assert a.stroke == 'd'
    assert a.hindi is None
    assert a.ipa is None
    assert a.eng_trans is None


def test_stroke_r_sets_stroke_nickname():
    a = Articulation({'stroke': 'r'})
    assert a.stroke_nickname == 'ra'


def test_stroke_r_from_json_sets_stroke_nickname():
    obj = {'name': 'pluck', 'stroke': 'r'}
    a = Articulation.from_json(obj)
    assert a.stroke_nickname == 'ra'
