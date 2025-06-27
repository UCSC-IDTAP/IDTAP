import pytest

from python.api.classes.assemblage import Assemblage, Phrase, Instrument

# Strand error cases

def test_strand_add_remove_errors():
    a = Assemblage(Instrument.SITAR, 'A')
    a.add_strand('s')
    strand = a.strands[0]
    p = Phrase()
    a.add_phrase(p)  # register phrase in assemblage
    strand.add_phrase(p)
    with pytest.raises(ValueError):
        strand.add_phrase(p)
    strand.remove_phrase(p)
    with pytest.raises(ValueError):
        strand.remove_phrase(p)

# Assemblage.addStrand / addPhrase

def test_assemblage_add_duplicate_and_missing_strand():
    a = Assemblage(Instrument.SITAR, 'A')
    a.add_strand('dup')
    with pytest.raises(ValueError):
        a.add_strand('dup')

    p = Phrase()
    a.add_phrase(p)
    with pytest.raises(ValueError):
        a.add_phrase(p)
    with pytest.raises(ValueError):
        a.add_phrase(Phrase(), 'missing')

# Assemblage.removeStrand / removePhrase

def test_assemblage_remove_errors():
    a = Assemblage(Instrument.SITAR, 'A')
    with pytest.raises(ValueError):
        a.remove_strand('bad')
    p = Phrase()
    with pytest.raises(ValueError):
        a.remove_phrase(p)

# Assemblage.movePhraseToStrand branches

def test_move_phrase_to_strand_removes_from_source_when_target_missing():
    a = Assemblage(Instrument.SITAR, 'A')
    a.add_strand('s1')
    s1 = a.strands[0]
    p = Phrase()
    a.add_phrase(p, s1.id)
    a.move_phrase_to_strand(p, 'none')
    assert s1.phrase_ids == []


def test_move_phrase_to_strand_errors_if_phrase_not_in_assemblage():
    a = Assemblage(Instrument.SITAR, 'A')
    a.add_strand('s1')
    s1 = a.strands[0]
    p = Phrase()
    with pytest.raises(ValueError):
        a.move_phrase_to_strand(p, s1.id)


def test_move_phrase_to_strand_moves_phrase_between_strands():
    a = Assemblage(Instrument.SITAR, 'A')
    a.add_strand('s1')
    a.add_strand('s2')
    s1, s2 = a.strands
    p = Phrase()
    a.add_phrase(p, s1.id)
    a.move_phrase_to_strand(p, s2.id)
    assert p.unique_id not in s1.phrase_ids
    assert s2.phrase_ids == [p.unique_id]

# Assemblage.from_descriptor validations

def test_from_descriptor_throws_on_unknown_phrase_ids():
    desc = {
        'instrument': 'Sitar',
        'strands': [{'label': 's', 'phraseIDs': ['bad'], 'id': 'sid'}],
        'name': 'A',
        'id': 'id',
        'loosePhraseIDs': []
    }
    with pytest.raises(ValueError):
        Assemblage.from_descriptor(desc, [])


def test_from_descriptor_throws_on_unknown_loose_phrase_ids():
    desc = {
        'instrument': 'Sitar',
        'strands': [],
        'name': 'A',
        'id': 'id',
        'loosePhraseIDs': ['bad']
    }
    with pytest.raises(ValueError):
        Assemblage.from_descriptor(desc, [])
