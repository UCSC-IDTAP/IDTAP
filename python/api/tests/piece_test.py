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
from python.api.classes.assemblage import Assemblage
from python.api.enums import Instrument
from datetime import datetime


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


# -------------------------------------------------------
#  New tests mirroring additional Piece features
# -------------------------------------------------------

def build_multi_track_piece():
    raga = Raga({'fundamental': 200})
    tA1 = Trajectory({'num': 0, 'pitches': [Pitch()], 'dur_tot': 0.5})
    tA2 = Trajectory({'num': 1, 'pitches': [Pitch()], 'dur_tot': 0.5})
    group = Group({'trajectories': [tA1, tA2]})
    pA = Phrase({'trajectories': [tA1, tA2], 'raga': raga})
    pA.groups_grid[0].append(group)

    tB1 = Trajectory({'num': 0, 'pitches': [Pitch()], 'dur_tot': 1})
    pB = Phrase({'trajectories': [tB1], 'raga': raga})

    piece = Piece({
        'phraseGrid': [[pA], [pB]],
        'instrumentation': [Instrument.Sitar, Instrument.Vocal_M],
        'raga': raga,
    })

    return piece


def test_optional_fields_round_trip():
    opts = {
        'title': 'my title',
        'dateCreated': datetime(2020, 1, 1),
        'dateModified': datetime(2020, 1, 2),
        'location': 'home',
        '_id': 'id1',
        'audioID': 'a1',
        'audio_DB_ID': 'db1',
        'userID': 'u1',
        'name': 'name',
        'family_name': 'fam',
        'given_name': 'giv',
        'permissions': 'perm',
        'explicitPermissions': {'edit': ['e'], 'view': ['v'], 'publicView': False},
        'soloist': 'solo',
        'soloInstrument': 'sitar',
        'instrumentation': [Instrument.Sitar],
        'phrases': [],
        'raga': Raga(),
    }
    piece = Piece(opts)
    copy = Piece.from_json(piece.to_json())
    assert copy.title == opts['title']
    assert copy.dateCreated.isoformat() == opts['dateCreated'].isoformat()
    assert copy.dateModified.isoformat() == opts['dateModified'].isoformat()
    assert copy.location == opts['location']
    assert copy._id == opts['_id']
    assert copy.audioID == opts['audioID']
    assert copy.userID == opts['userID']
    assert copy.name == opts['name']
    assert copy.family_name == opts['family_name']
    assert copy.given_name == opts['given_name']
    assert copy.permissions == opts['permissions']
    assert copy.explicitPermissions == opts['explicitPermissions']
    assert copy.soloist == opts['soloist']
    assert copy.soloInstrument == opts['soloInstrument']


def test_getters_and_setters_modify_grids():
    raga = Raga()
    t1 = Trajectory({'num': 0, 'pitches': [Pitch()], 'dur_tot': 1})
    p1 = Phrase({'trajectories': [t1], 'raga': raga})
    piece = Piece({'phrases': [p1], 'raga': raga, 'instrumentation': [Instrument.Sitar]})

    t2 = Trajectory({'num': 0, 'pitches': [Pitch()], 'dur_tot': 1})
    p2 = Phrase({'trajectories': [t2], 'raga': raga})
    piece.phrases = [p2]
    assert piece.phraseGrid[0][0] is p2

    piece.durArray = [1]
    assert piece.durArrayGrid[0] == [1]

    piece.sectionStarts = [0]
    assert piece.sectionStartsGrid[0] == [0]

    sc = [init_sec_categorization()]
    piece.sectionCategorization = sc
    assert piece.sectionCatGrid[0] is sc


def test_assemblages_getter():
    raga = Raga()
    traj = Trajectory({'num': 0, 'pitches': [Pitch()], 'dur_tot': 1})
    phrase = Phrase({'trajectories': [traj], 'raga': raga})
    asm = Assemblage(Instrument.Sitar, 'a')
    asm.add_phrase(phrase)
    piece = Piece({'phrases': [phrase], 'raga': raga, 'instrumentation': [Instrument.Sitar]})
    piece.assemblageDescriptors = [asm.descriptor]
    aggs = piece.assemblages
    assert len(aggs) == 1
    assert isinstance(aggs[0], Assemblage)
    assert aggs[0].phrases[0] is phrase


def test_update_start_times_recalc():
    raga = Raga()
    p1 = Phrase({'trajectories': [Trajectory({'dur_tot': 1})], 'raga': raga})
    p2 = Phrase({'trajectories': [Trajectory({'dur_tot': 1})], 'raga': raga})
    piece = Piece({'phrases': [p1, p2], 'raga': raga, 'instrumentation': [Instrument.Sitar]})
    piece.durArrayGrid[0] = [0.25, 0.75]
    piece.durTot = 2
    piece.update_start_times()
    assert pytest.approx(p2.start_time, rel=1e-6) == piece.dur_starts()[1]
    assert p2.piece_idx == 1


def test_track_specific_helpers():
    piece = build_multi_track_piece()
    assert piece.dur_starts(1) == [0]
    assert piece.traj_start_times(1) == [0]
    assert len(piece.all_pitches(track=1)) == 1
    traj = piece.phraseGrid[1][0].trajectories[0]
    assert piece.most_recent_traj(1.2, 1) is traj


def test_ad_hoc_grid_expansion():
    raga = Raga()
    traj = Trajectory({'dur_tot': 1})
    phrase = Phrase({'trajectories': [traj], 'raga': raga})
    piece = Piece({
        'phraseGrid': [[phrase]],
        'instrumentation': [Instrument.Sitar, Instrument.Vocal_M],
        'raga': raga,
        'adHocSectionCatGrid': [[]],
    })
    assert len(piece.adHocSectionCatGrid) == 2


def test_section_cat_grid_expansion():
    raga = Raga()
    phrase = Phrase({'trajectories': [Trajectory({'dur_tot': 1})], 'raga': raga})
    piece = Piece({
        'phrases': [phrase],
        'raga': raga,
        'instrumentation': [Instrument.Sitar],
        'sectionStarts': [0, 1],
        'sectionCatGrid': [[init_sec_categorization()]],
    })
    assert len(piece.sectionCatGrid[0]) == 2
