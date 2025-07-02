import os
import sys
sys.path.insert(0, os.path.abspath('.'))

from python.idtap_api.classes.chikari import Chikari
from python.idtap_api.classes.pitch import Pitch

# Test mirrors src/js/tests/chikari.test.ts

def test_chikari_serialization():
    pitches = [Pitch({'swara': 's', 'oct': 1}), Pitch({'swara': 'p'})]
    c = Chikari({'pitches': pitches, 'fundamental': 440})
    assert isinstance(c.unique_id, str)
    json_obj = c.to_json()
    copy = Chikari.from_json(json_obj)
    assert copy.to_json() == json_obj
