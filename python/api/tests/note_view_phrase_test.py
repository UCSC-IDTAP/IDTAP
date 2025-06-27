from python.api.classes.note_view_phrase import NoteViewPhrase
from python.api.classes.pitch import Pitch
from python.api.classes.raga import Raga


def test_note_view_phrase_basic():
    r = Raga()
    nv = NoteViewPhrase({'pitches': [Pitch()], 'dur_tot': 1, 'raga': r, 'start_time': 0})
    assert len(nv.pitches) == 1
    assert nv.dur_tot == 1
    assert isinstance(nv.raga, Raga)
    assert nv.start_time == 0
