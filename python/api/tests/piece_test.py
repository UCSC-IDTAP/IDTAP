import os
import sys
sys.path.insert(0, os.path.abspath("."))

import json
from pathlib import Path

import pytest

from python.api.classes.piece import (
    Piece,
    init_sec_categorization,
    durations_of_fixed_pitches,
)
from python.api.classes.phrase import Phrase
from python.api.classes.trajectory import Trajectory
from python.api.classes.pitch import Pitch
from python.api.classes.raga import Raga
from python.api.classes.articulation import Articulation
from python.api.classes.group import Group
from python.api.classes.chikari import Chikari
from python.api.classes.meter import Meter
from python.api.enums import Instrument


# Helper builders

def build_simple_piece():
    raga = Raga()
    t1 = Trajectory({'id': 0, 'pitches': [Pitch()], 'dur_tot': 1})
    t2 = Trajectory({'id': 12, 'pitches': [Pitch()], 'dur_tot': 1})
    p1 = Phrase({'trajectories': [t1], 'dur_tot': 1, 'raga': raga})
    p2 = Phrase({'trajectories': [t2], 'dur_tot': 1, 'raga': raga})
    m1 = Meter([1], start_time=0, tempo=60)
    m2 = Meter([1], start_time=1, tempo=60)
    return Piece({'phrases': [p1, p2], 'raga': raga, 'meters': [m1, m2], 'instrumentation': [Instrument.Sitar]})


def build_simple_piece_full():
    raga = Raga({'fundamental': 240})
    art = {'0.00': Articulation({'stroke_nickname': 'da'})}
    t1 = Trajectory({'num': 0, 'pitches': [Pitch()], 'dur_tot': 0.5, 'articulations': art})
    t2 = Trajectory({'num': 1, 'pitches': [Pitch({'swara': 'r', 'raised': False})], 'dur_tot': 0.5, 'articulations': art})
    group = Group({'trajectories': [t1, t2]})
    p1 = Phrase({'trajectories': [t1, t2], 'raga': raga})
    p1.groups_grid[0].append(group)
    t3 = Trajectory({'num': 0, 'pitches': [Pitch()], 'dur_tot': 1})
    p2 = Phrase({'trajectories': [t3], 'raga': raga})
    piece = Piece({'phrases': [p1, p2], 'raga': raga, 'instrumentation': [Instrument.Sitar]})
    meter = Meter(start_time=0, tempo=60)
    return piece, p1, p2, t1, t2, t3, group, meter


# ---------------------------- tests ----------------------------

def test_realign_and_set_dur_tot():
    piece = build_simple_piece()
    piece.phrases[0].trajectories[0].pitches[0].ratios = [1]
    piece.realign_pitches()
    assert piece.phrases[0].trajectories[0].pitches[0].ratios[0] == piece.raga.stratified_ratios[0]

    piece.set_dur_tot(3)
    assert piece.durTot == 3
    assert pytest.approx(piece.durArrayGrid[0][0], rel=1e-6) == 1 / 3
    assert piece.phrases[1].trajectories[0].dur_tot == 2
    assert pytest.approx(piece.phrases[1].start_time, rel=1e-6) == 1


def test_dur_calculations_and_cleanup():
    piece = build_simple_piece()
    piece.phrases[0].trajectories[0].dur_tot = 2
    piece.phrases[0].dur_tot_from_trajectories()
    piece.dur_tot_from_phrases()
    assert piece.durTot == 3
    piece.dur_array_from_phrases()
    assert piece.durArrayGrid[0] == pytest.approx([2/3, 1/3])
    piece.phrases[0].dur_tot = None  # type: ignore
    with pytest.raises(Exception):
        piece.dur_array_from_phrases()

    c = init_sec_categorization()
    del c['Improvisation']
    del c['Other']
    del c['Top Level']
    c['Composition Type']['Bandish'] = True
    piece.clean_up_section_categorization(c)
    assert 'Improvisation' in c
    assert 'Other' in c
    assert c['Top Level'] == 'Composition'


def test_piece_serialization_round_trip(tmp_path: Path):
    fixture = Path('python/api/tests/fixtures/serialization_test.json')
    data = json.loads(fixture.read_text())
    piece = Piece.from_json(data)
    json_obj = piece.to_json()
    copy = Piece.from_json(json_obj)
    assert copy.to_json() == json_obj


def test_durations_and_proportions_each_type():
    raga = Raga()
    t1 = Trajectory({'id': 0, 'pitches': [Pitch({'swara': 0})], 'dur_tot': 1})
    t2 = Trajectory({'id': 0, 'pitches': [Pitch({'swara': 1})], 'dur_tot': 2})
    phrase = Phrase({'trajectories': [t1, t2], 'raga': raga})
    piece = Piece({'phrases': [phrase], 'raga': raga, 'instrumentation': [Instrument.Sitar]})

    np1 = t1.pitches[0].numbered_pitch
    np2 = t2.pitches[0].numbered_pitch

    durPN = piece.durations_of_fixed_pitches()
    assert durPN == {np1: 1, np2: 2}

    propPN = piece.proportions_of_fixed_pitches()
    assert pytest.approx(propPN[np1]) == 1/3
    assert pytest.approx(propPN[np2]) == 2/3

    c1 = Pitch.pitch_number_to_chroma(np1)
    c2 = Pitch.pitch_number_to_chroma(np2)
    assert piece.durations_of_fixed_pitches(output_type='chroma') == {c1: 1, c2: 2}
    assert piece.proportions_of_fixed_pitches(output_type='chroma') == {c1: pytest.approx(1/3), c2: pytest.approx(2/3)}

    sd1 = Pitch.chroma_to_scale_degree(c1)[0]
    sd2 = Pitch.chroma_to_scale_degree(c2)[0]
    assert piece.durations_of_fixed_pitches(output_type='scaleDegree') == {sd1: 1, sd2: 2}
    assert piece.proportions_of_fixed_pitches(output_type='scaleDegree') == {sd1: pytest.approx(1/3), sd2: pytest.approx(2/3)}

    sarg1 = Pitch.from_pitch_number(np1).sargam_letter
    sarg2 = Pitch.from_pitch_number(np2).sargam_letter
    assert piece.durations_of_fixed_pitches(output_type='sargamLetter') == {sarg1: 1, sarg2: 2}
    assert piece.proportions_of_fixed_pitches(output_type='sargamLetter') == {sarg1: pytest.approx(1/3), sarg2: pytest.approx(2/3)}


def test_helper_durations_invalid_and_proportional():
    bad_traj = type('T', (), {'durations_of_fixed_pitches': lambda self, *_: 5})()
    with pytest.raises(SyntaxError):
        durations_of_fixed_pitches([bad_traj])

    t1 = Trajectory({'id':0,'pitches':[Pitch({'swara':0})],'dur_tot':1})
    t2 = Trajectory({'id':0,'pitches':[Pitch({'swara':1})],'dur_tot':2})
    np1 = t1.pitches[0].numbered_pitch
    np2 = t2.pitches[0].numbered_pitch
    result = durations_of_fixed_pitches([t1,t2], count_type='proportional')
    assert pytest.approx(result[np1]) == 1/3
    assert pytest.approx(result[np2]) == 2/3
    total = sum(result.values())
    assert pytest.approx(total) == 1
