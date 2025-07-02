import os
import sys
import pytest

sys.path.insert(0, os.path.abspath('.'))

from python.idtap_api.classes.assemblage import Assemblage
from python.idtap_api.classes.phrase import Phrase
from python.idtap_api.classes.trajectory import Trajectory
from python.idtap_api.enums import Instrument


def test_assemblage_descriptor_serialization():
    p1 = Phrase({'start_time': 0})
    p2 = Phrase({'start_time': 1})
    assemblage = Assemblage(Instrument.Sitar, 'Test')
    assemblage.add_strand('first')
    s1 = assemblage.strands[0]
    assemblage.add_phrase(p1, s1.id)
    assemblage.add_phrase(p2)

    desc = assemblage.descriptor
    assert desc['instrument'] == Instrument.Sitar
    assert desc['name'] == 'Test'
    assert desc['id'] == assemblage.id
    assert len(desc['strands']) == 1
    assert desc['strands'][0] == {'label': 'first', 'phraseIDs': [p1.unique_id], 'id': s1.id}
    assert desc['loosePhraseIDs'] == [p2.unique_id]

    round_trip = Assemblage.from_descriptor(desc, [p1, p2])
    assert round_trip.descriptor == desc

    round_trip.add_strand('second')
    s2 = round_trip.strands[1]
    round_trip.move_phrase_to_strand(p2, s2.id)

    desc2 = round_trip.descriptor
    assert desc2['strands'][1] == {'label': 'second', 'phraseIDs': [p2.unique_id], 'id': s2.id}
    assert desc2['loosePhraseIDs'] == []

    round_trip2 = Assemblage.from_descriptor(desc2, [p1, p2])
    assert round_trip2.descriptor == desc2


def test_assemblage_operations():
    p1 = Phrase({'trajectories': [Trajectory()]})
    p2 = Phrase({'trajectories': [Trajectory()]})
    a = Assemblage(Instrument.Sitar, 'test')
    a.add_strand('first')
    a.add_strand('second')
    a.add_phrase(p1, a.strands[0].id)
    a.add_phrase(p2)
    assert len(a.strands[0].phrases) == 1
    assert len(a.loose_phrases) == 1
    a.move_phrase_to_strand(p2, a.strands[1].id)
    assert len(a.loose_phrases) == 0
    assert a.strands[1].phrases[0] is p2
    a.remove_phrase(p1)
    assert p1 not in a.phrases
    a.remove_strand(a.strands[0].id)
    assert len(a.strands) == 1
    desc = a.descriptor
    a2 = Assemblage.from_descriptor(desc, [p1, p2])
    assert a2.descriptor == desc


def test_strand_add_phrase_and_remove_phrase_errors():
    a = Assemblage(Instrument.Sitar, 'A')
    a.add_strand('s')
    strand = a.strands[0]
    p = Phrase()
    a.add_phrase(p)
    strand.add_phrase(p)
    with pytest.raises(Exception):
        strand.add_phrase(p)
    strand.remove_phrase(p)
    with pytest.raises(Exception):
        strand.remove_phrase(p)


def test_add_strand_and_add_phrase_duplicate_and_missing():
    a = Assemblage(Instrument.Sitar, 'A')
    a.add_strand('dup')
    with pytest.raises(Exception):
        a.add_strand('dup')

    p = Phrase()
    a.add_phrase(p)
    with pytest.raises(Exception):
        a.add_phrase(p)
    with pytest.raises(Exception):
        a.add_phrase(Phrase(), 'missing')


def test_remove_strand_and_remove_phrase_errors():
    a = Assemblage(Instrument.Sitar, 'A')
    with pytest.raises(Exception):
        a.remove_strand('bad')
    p = Phrase()
    with pytest.raises(Exception):
        a.remove_phrase(p)


def test_move_phrase_to_strand_removes_from_source_when_target_missing():
    a = Assemblage(Instrument.Sitar, 'A')
    a.add_strand('s1')
    s1 = a.strands[0]
    p = Phrase()
    a.add_phrase(p, s1.id)
    a.move_phrase_to_strand(p, 'none')
    assert s1.phrase_ids == []


def test_move_phrase_to_strand_errors_if_phrase_not_in_assemblage():
    a = Assemblage(Instrument.Sitar, 'A')
    a.add_strand('s1')
    s1 = a.strands[0]
    p = Phrase()
    with pytest.raises(Exception):
        a.move_phrase_to_strand(p, s1.id)


def test_move_phrase_to_strand_moves_phrase_between_strands():
    a = Assemblage(Instrument.Sitar, 'A')
    a.add_strand('s1')
    a.add_strand('s2')
    s1, s2 = a.strands
    p = Phrase()
    a.add_phrase(p, s1.id)
    a.move_phrase_to_strand(p, s2.id)
    assert p.unique_id not in s1.phrase_ids
    assert s2.phrase_ids == [p.unique_id]


def test_from_descriptor_throws_unknown_phrase_ids():
    desc = {
        'instrument': Instrument.Sitar,
        'strands': [{'label': 's', 'phraseIDs': ['bad'], 'id': 'sid'}],
        'name': 'A',
        'id': 'id',
        'loosePhraseIDs': []
    }
    with pytest.raises(Exception):
        Assemblage.from_descriptor(desc, [])


def test_from_descriptor_throws_unknown_loose_phrase_ids():
    desc = {
        'instrument': Instrument.Sitar,
        'strands': [],
        'name': 'A',
        'id': 'id',
        'loosePhraseIDs': ['bad']
    }
    with pytest.raises(Exception):
        Assemblage.from_descriptor(desc, [])
