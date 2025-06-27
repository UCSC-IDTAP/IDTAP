import os
import sys
import math
import pytest

sys.path.insert(0, os.path.abspath('.'))

from python.api.classes.trajectory import Trajectory
from python.api.classes.pitch import Pitch
from python.api.classes.articulation import Articulation
from python.api.classes.automation import Automation
from python.api.classes.raga import Raga
from python.api.classes.phrase import Phrase
from python.api.classes.piece import Piece, durations_of_fixed_pitches
from python.api.enums import Instrument


def lin_space(start_val: float, stop_val: float, cardinality: int):
    step = (stop_val - start_val) / (cardinality - 1)
    return [start_val + step * i for i in range(cardinality)]


def test_default_trajectory():
    t = Trajectory()
    assert isinstance(t, Trajectory)
    assert t.id == 0
    assert t.pitches == [Pitch()]
    assert t.dur_tot == 1
    assert t.dur_array == [1]
    assert t.slope == 2

    art = Articulation({'stroke': 'd'})
    assert t.articulations == {'0.00': art}

    assert t.num is None
    assert t.name == 'Fixed'
    assert t.fund_id12 is None

    def_vib = {'periods': 8, 'vert_offset': 0, 'init_up': True, 'extent': 0.05}
    assert t.vib_obj == def_vib
    assert t.instrumentation == Instrument.Sitar

    assert t.freqs == [pytest.approx(261.63)]
    assert t.log_freqs == [pytest.approx(math.log2(261.63))]
    assert t.min_freq == pytest.approx(261.63)
    assert t.max_freq == pytest.approx(261.63)
    assert t.end_time is None
    assert t.start_time is None


def test_vocal_instrumentation_removes_pluck():
    for inst in [Instrument.Vocal_M, Instrument.Vocal_F]:
        t = Trajectory({'instrumentation': inst, 'articulations': {'0.00': Articulation({'name':'pluck','stroke':'d'})}})
        assert t.articulations == {}


def test_vocal_instrumentation_default_empty():
    traj = Trajectory({'instrumentation': Instrument.Vocal_M})
    assert traj.articulations == {}


def test_trajectory_json_round_trip():
    pitches = [Pitch(), Pitch({'swara':1})]
    traj = Trajectory({'id':7,'pitches':pitches,'dur_array':[0.4,0.6],'start_consonant':'ka','end_consonant':'ga','vowel':'a'})
    json_obj = traj.to_json()
    round_trip = Trajectory.from_json(json_obj)
    assert round_trip.to_json() == json_obj


def test_compute_id7_id13():
    log_freqs = [math.log2(261.63), math.log2(523.25), math.log2(392.0), math.log2(261.63), math.log2(523.25), math.log2(392.0)]
    t = Trajectory({'id':0})
    pts = lin_space(0,1,10)
    vals = [t.id7(x, log_freqs[:2], [0.3,0.7]) for x in pts]
    for val,x in zip(vals,pts):
        expected = 261.63 if x < 0.3 else 523.25
        assert val == pytest.approx(expected)
    t12 = Trajectory({'id':12,'fund_id12':220})
    assert t12.id12(0.5) == pytest.approx(220)
    vib = {'periods':2,'vert_offset':0,'init_up':True,'extent':0.1}
    t13 = Trajectory({'id':13,'vib_obj':vib})

    def expected13(xval: float) -> float:
        periods = vib['periods']; vo = vib['vert_offset']; init_up=vib['init_up']; extent=vib['extent']
        if abs(vo) > extent/2:
            vo = math.copysign(extent/2, vo)
        out = math.cos(xval*2*math.pi*periods + int(init_up)*math.pi)
        base = math.log2(t13.freqs[0])
        if xval < 1/(2*periods):
            start = base
            end = math.log2(expected13(1/(2*periods)))
            out = out*(abs(end-start)/2)+(start+end)/2
            return 2**out
        elif xval > 1-1/(2*periods):
            start = math.log2(expected13(1-1/(2*periods)))
            end = base
            out = out*(abs(end-start)/2)+(start+end)/2
            return 2**out
        else:
            return 2**(out*extent/2 + vo + base)

    for x in pts:
        assert t13.id13(x) == pytest.approx(expected13(x))


def test_invalid_consonant_and_vowel_helpers():
    t = Trajectory()
    t.update_vowel('zz')
    assert t.vowel_hindi is None
    t.add_consonant('zz')
    assert t.start_consonant_hindi is None
    art_bad = Articulation({'name':'consonant','stroke':'zz'})
    t.articulations['0.50'] = art_bad
    t.convert_c_iso_to_hindi_and_ipa()
    assert t.articulations['0.50'].hindi is None


def test_consonant_vowel_helpers():
    t = Trajectory({'pitches':[Pitch()], 'dur_tot':1})
    t.add_consonant('ka')
    assert t.start_consonant == 'ka'
    t.add_consonant('ga', False)
    assert t.end_consonant == 'ga'
    t.change_consonant('kha')
    assert t.start_consonant == 'kha'
    t.update_vowel('a')
    assert t.vowel_hindi == 'अ'
    dur = t.durations_of_fixed_pitches()
    assert dur[t.pitches[0].numbered_pitch] == pytest.approx(1)
    json_obj = t.to_json()
    copy = Trajectory.from_json(json_obj)
    assert copy.start_consonant == 'kha'


def test_remove_consonant_start():
    t = Trajectory({'pitches':[Pitch()], 'dur_tot':1})
    t.add_consonant('ka')
    t.add_consonant('ga', False)
    t.remove_consonant(True)
    assert t.start_consonant is None
    assert t.start_consonant_hindi is None
    assert t.start_consonant_ipa is None
    assert t.start_consonant_eng_trans is None
    assert '0.00' not in t.articulations
    assert t.end_consonant == 'ga'
    assert '1.00' in t.articulations


def test_remove_consonant_end():
    t = Trajectory({'pitches':[Pitch()], 'dur_tot':1})
    t.add_consonant('ka')
    t.add_consonant('ga', False)
    t.remove_consonant(False)
    assert t.end_consonant is None
    assert t.end_consonant_hindi is None
    assert t.end_consonant_ipa is None
    assert t.end_consonant_eng_trans is None
    assert '1.00' not in t.articulations
    assert t.start_consonant == 'ka'
    assert '0.00' in t.articulations


def test_compute_delegation_all_ids():
    xs = lin_space(0,1,5)
    cases = [
        {'id':0,'pitches':[Pitch()], 'dur_array':[1]},
        {'id':1,'pitches':[Pitch(), Pitch({'swara':1})],'slope':1.5},
        {'id':2,'pitches':[Pitch(), Pitch({'swara':1})],'slope':3},
        {'id':3,'pitches':[Pitch(), Pitch({'swara':1})],'slope':0.5},
        {'id':4,'pitches':[Pitch(),Pitch({'swara':1}),Pitch({'swara':2})],'dur_array':[0.4,0.6],'slope':2},
        {'id':5,'pitches':[Pitch(),Pitch({'swara':1}),Pitch({'swara':2})],'dur_array':[0.6,0.4],'slope':2},
        {'id':6,'pitches':[Pitch(),Pitch({'swara':1}),Pitch({'swara':2}),Pitch({'swara':1})],'dur_array':[0.3,0.4,0.3]},
        {'id':7,'pitches':[Pitch(),Pitch({'swara':1})],'dur_array':[0.25,0.75]},
        {'id':8,'pitches':[Pitch(),Pitch({'swara':1}),Pitch({'swara':2})],'dur_array':[0.2,0.3,0.5]},
        {'id':9,'pitches':[Pitch(),Pitch({'swara':1}),Pitch({'swara':2}),Pitch({'swara':3})],'dur_array':[0.2,0.2,0.3,0.3]},
        {'id':10,'pitches':[Pitch(),Pitch({'swara':1}),Pitch({'swara':2}),Pitch({'swara':3}),Pitch({'swara':4}),Pitch({'swara':5})],'dur_array':[0.1,0.2,0.2,0.2,0.2,0.1]},
        {'id':11,'pitches':[Pitch(),Pitch({'swara':1})],'dur_array':[0.5,0.5]},
        {'id':12,'pitches':[Pitch()], 'fund_id12':220},
        {'id':13,'pitches':[Pitch()], 'vib_obj':{'periods':2,'vert_offset':0,'init_up':True,'extent':0.1}},
    ]
    for cfg in cases:
        traj = Trajectory(cfg)
        for x in xs:
            method = traj.id7 if cfg['id']==11 else getattr(traj, f'id{cfg["id"]}')
            assert traj.compute(x) == pytest.approx(method(x))


def test_missing_durarray_raises():
    t = Trajectory({'id':4,'pitches':[Pitch(),Pitch({'swara':1}),Pitch({'swara':2})]})
    phrase = Phrase({'trajectories':[t],'start_time':0,'dur_array':[1],'dur_tot':1})
    t.dur_array = None
    t.start_time = 0
    phrase.assign_traj_nums()
    with pytest.raises(Exception):
        _ = phrase.swara


def test_invalid_inputs_constructor():
    with pytest.raises(SyntaxError):
        Trajectory({'slope':'bad'})
    art = Articulation({'name':'consonant','stroke':{}})
    traj = Trajectory({'pitches':[Pitch()]})
    traj.articulations['0.00'] = art
    with pytest.raises(Exception):
        traj.convert_c_iso_to_hindi_and_ipa()
    with pytest.raises(SyntaxError):
        Trajectory({'id':1.5})
    with pytest.raises(SyntaxError):
        Trajectory({'pitches':[Pitch(), {}]})
    with pytest.raises(SyntaxError):
        Trajectory({'pitches':{}})
    with pytest.raises(SyntaxError):
        Trajectory({'dur_tot':'bad'})
    with pytest.raises(SyntaxError):
        Trajectory({'articulations':5})


def test_convert_ciso_fills_missing():
    art_start = Articulation({'name':'consonant','stroke':'ka'})
    art_end = Articulation({'name':'consonant','stroke':'ga'})
    traj = Trajectory({'pitches':[Pitch()], 'articulations':{'0.00':art_start,'1.00':art_end}, 'start_consonant':'ka','end_consonant':'ga','vowel':'a'})
    traj.start_consonant_hindi = None
    traj.start_consonant_ipa = None
    traj.end_consonant_hindi = None
    traj.end_consonant_ipa = None
    traj.vowel_hindi = None
    traj.vowel_ipa = None
    traj.articulations['0.00'].hindi = None
    traj.articulations['0.00'].ipa = None
    traj.articulations['1.00'].hindi = None
    traj.articulations['1.00'].ipa = None
    traj.convert_c_iso_to_hindi_and_ipa()
    assert traj.start_consonant_hindi == 'क'
    assert traj.end_consonant_hindi == 'ग'
    assert traj.vowel_hindi == 'अ'
    assert traj.start_consonant_ipa == 'k'
    assert traj.end_consonant_ipa == 'g'
    assert traj.vowel_ipa == 'ə'
    assert traj.articulations['0.00'].hindi == 'क'
    assert traj.articulations['1.00'].ipa == 'g'


def test_tojson_fromjson_preserves():
    auto = Automation()
    auto.add_value(0.5,0.5)
    arts = {'0.00': Articulation({'name':'consonant','stroke':'ka'})}
    traj = Trajectory({'id':7,'pitches':[Pitch(),Pitch({'swara':1})],'dur_array':[0.5,0.5],'articulations':arts,'automation':auto})
    json_obj = traj.to_json()
    round_trip = Trajectory.from_json(json_obj)
    assert round_trip.to_json() == json_obj
    assert round_trip.automation.values == auto.values
    assert round_trip.articulations['0.00'].stroke == 'ka'


def test_durations_and_proportions_output_types():
    t1 = Trajectory({'id':0,'pitches':[Pitch({'swara':0})],'dur_tot':1})
    t2 = Trajectory({'id':0,'pitches':[Pitch({'swara':1})],'dur_tot':2})
    trajs = [t1,t2]
    np1 = t1.pitches[0].numbered_pitch
    np2 = t2.pitches[0].numbered_pitch
    durPN = durations_of_fixed_pitches(trajs)
    assert durPN == {np1:1, np2:2}
    propPN = durations_of_fixed_pitches(trajs, count_type='proportional')
    assert propPN[np1] == pytest.approx(1/3)
    assert propPN[np2] == pytest.approx(2/3)
    c1 = Pitch.pitch_number_to_chroma(np1)
    c2 = Pitch.pitch_number_to_chroma(np2)
    assert durations_of_fixed_pitches(trajs, output_type='chroma') == {c1:1, c2:2}
    assert durations_of_fixed_pitches(trajs, output_type='chroma', count_type='proportional') == {c1:1/3, c2:2/3}
    sd1 = Pitch.chroma_to_scale_degree(c1)[0]
    sd2 = Pitch.chroma_to_scale_degree(c2)[0]
    assert durations_of_fixed_pitches(trajs, output_type='scaleDegree') == {sd1:1, sd2:2}
    assert durations_of_fixed_pitches(trajs, output_type='scaleDegree', count_type='proportional') == {sd1:1/3, sd2:2/3}
    sarg1 = Pitch.from_pitch_number(np1).sargam_letter
    sarg2 = Pitch.from_pitch_number(np2).sargam_letter
    assert durations_of_fixed_pitches(trajs, output_type='sargamLetter') == {sarg1:1, sarg2:2}
    assert durations_of_fixed_pitches(trajs, output_type='sargamLetter', count_type='proportional') == {sarg1:1/3, sarg2:2/3}


def test_convert_ciso_with_provided():
    art_start = Articulation({'name':'consonant','stroke':'ka'})
    art_end = Articulation({'name':'consonant','stroke':'ga'})
    traj = Trajectory({'pitches':[Pitch()], 'articulations':{'0.00':art_start,'1.00':art_end}, 'start_consonant':'ka','end_consonant':'ga','vowel':'a'})
    traj.convert_c_iso_to_hindi_and_ipa()
    assert traj.start_consonant_hindi == 'क'
    assert traj.end_consonant_hindi == 'ग'
    assert traj.vowel_hindi == 'अ'
    assert traj.start_consonant_ipa == 'k'
    assert traj.end_consonant_ipa == 'g'
    assert traj.vowel_ipa == 'ə'
    assert traj.articulations['0.00'].hindi == 'क'
    assert traj.articulations['1.00'].ipa == 'g'


def test_tojson_fromjson_round_trip_full():
    auto = Automation({'values':[{'norm_time':0,'value':1},{'norm_time':0.5,'value':0.3},{'norm_time':1,'value':0.8}]})
    art = Articulation({'name':'consonant','stroke':'kha','hindi':'ख','ipa':'kʰ','eng_trans':'kha','stroke_nickname':'da'})
    traj = Trajectory({'id':7,'pitches':[Pitch(),Pitch({'swara':1})],'dur_array':[0.5,0.5],'articulations':{'0.00':art},'automation':auto})
    json_obj = traj.to_json()
    round_trip = Trajectory.from_json(json_obj)
    assert round_trip.to_json() == json_obj
    assert round_trip.automation.values == auto.values
    assert round_trip.articulations['0.00'].eng_trans == 'kha'


def test_proportions_via_piece():
    raga = Raga()
    t1 = Trajectory({'id':0,'pitches':[Pitch({'swara':0})],'dur_tot':1})
    t2 = Trajectory({'id':0,'pitches':[Pitch({'swara':1})],'dur_tot':2})
    phrase = Phrase({'trajectories':[t1,t2],'raga':raga})
    piece = Piece({'phrases':[phrase],'raga':raga,'instrumentation':[Instrument.Sitar]})
    np1 = t1.pitches[0].numbered_pitch
    np2 = t2.pitches[0].numbered_pitch
    assert piece.proportions_of_fixed_pitches() == {np1:1/3,np2:2/3}
    c1 = Pitch.pitch_number_to_chroma(np1)
    c2 = Pitch.pitch_number_to_chroma(np2)
    assert piece.proportions_of_fixed_pitches(output_type='chroma') == {c1:1/3,c2:2/3}
    sd1 = Pitch.chroma_to_scale_degree(c1)[0]
    sd2 = Pitch.chroma_to_scale_degree(c2)[0]
    assert piece.proportions_of_fixed_pitches(output_type='scaleDegree') == {sd1:1/3,sd2:2/3}
    sarg1 = Pitch.from_pitch_number(np1).sargam_letter
    sarg2 = Pitch.from_pitch_number(np2).sargam_letter
    assert piece.proportions_of_fixed_pitches(output_type='sargamLetter') == {sarg1:1/3,sarg2:2/3}


def test_update_fundamental():
    p1 = Pitch()
    p2 = Pitch({'swara':1})
    traj = Trajectory({'pitches':[p1,p2]})
    traj.update_fundamental(440)
    for p in traj.pitches:
        assert p.fundamental == pytest.approx(440)


def test_sloped_and_end_time():
    for idv in range(14):
        traj = Trajectory({'id':idv,'dur_tot':1})
        traj.start_time = 5
        should_sloped = idv>=2 and idv<=5
        assert traj.sloped == should_sloped
        assert traj.end_time == pytest.approx(6)


def test_durations_of_fixed_pitches_switch():
    p0 = Pitch({'swara':0}); p1 = Pitch({'swara':1}); p2 = Pitch({'swara':2}); p3 = Pitch({'swara':3})
    np0 = p0.numbered_pitch; np1 = p1.numbered_pitch; np2 = p2.numbered_pitch; np3 = p3.numbered_pitch
    cases = [
        {'id':1,'pitches':[p0,p0],'expected':{np0:1}},
        {'id':2,'pitches':[p0,p0],'expected':{np0:1}},
        {'id':3,'pitches':[p0,p0],'expected':{np0:1}},
        {'id':4,'pitches':[p0,p0,p1],'dur_array':[0.6,0.4],'expected':{np0:0.6}},
        {'id':5,'pitches':[p0,p1,p1],'dur_array':[0.4,0.6],'expected':{np1:0.6}},
        {'id':6,'pitches':[p0,p1,p1,p2,p2],'dur_array':[0.2,0.2,0.3,0.3],'expected':{np1:0.2,np2:0.3}},
        {'id':7,'pitches':[p0,p1],'dur_array':[0.7,0.3],'expected':{np0:0.7,np1:0.3}},
        {'id':8,'pitches':[p0,p1,p2],'dur_array':[0.2,0.3,0.5],'expected':{np0:0.2,np1:0.3,np2:0.5}},
        {'id':9,'pitches':[p0,p1,p2,p3],'dur_array':[0.25,0.25,0.25,0.25],'expected':{np0:0.25,np1:0.25,np2:0.25,np3:0.25}},
        {'id':10,'pitches':[p0,p1,p2,p3,p0,p1],'dur_array':[0.1,0.2,0.2,0.2,0.2,0.1],'expected':{np0:0.1+0.2,np1:0.2+0.1,np2:0.2,np3:0.2}},
        {'id':11,'pitches':[p0,p1],'dur_array':[0.5,0.5],'expected':{np0:0.5,np1:0.5}},
    ]
    for cfg in cases:
        traj = Trajectory({'id':cfg['id'],'pitches':cfg['pitches'],'dur_array':cfg.get('dur_array'),'dur_tot':1})
        assert traj.durations_of_fixed_pitches() == cfg['expected']
    traj = Trajectory({'id':7,'pitches':[p0,p1],'dur_array':[0.7,0.3],'dur_tot':1})
    base = {np0:0.7,np1:0.3}
    assert traj.durations_of_fixed_pitches() == base
    c0 = Pitch.pitch_number_to_chroma(np0)
    c1 = Pitch.pitch_number_to_chroma(np1)
    assert traj.durations_of_fixed_pitches({'output_type':'chroma'}) == {c0:0.7,c1:0.3}
    sd0 = Pitch.chroma_to_scale_degree(c0)[0]
    sd1 = Pitch.chroma_to_scale_degree(c1)[0]
    assert traj.durations_of_fixed_pitches({'output_type':'scaleDegree'}) == {sd0:0.7,sd1:0.3}
    s0 = Pitch.from_pitch_number(np0).sargam_letter
    s1 = Pitch.from_pitch_number(np1).sargam_letter
    assert traj.durations_of_fixed_pitches({'output_type':'sargamLetter'}) == {s0:0.7,s1:0.3}
    with pytest.raises(Exception):
        traj.durations_of_fixed_pitches({'output_type':'bad'})


def test_numeric_articulation_keys_normalized():
    art = Articulation({'name':'pluck','stroke':'d'})
    traj = Trajectory({'articulations':{0: art}})
    assert isinstance(traj.articulations['0.00'], Articulation)
    assert '0' not in traj.articulations


def test_id6_default_durarray_and_console(monkeypatch):
    p0 = Pitch(); p1 = Pitch({'swara':1}); p2 = Pitch({'swara':2})
    pitches = [p0,p1,p2]
    traj = Trajectory({'id':6,'pitches':pitches,'dur_array':None})
    expected_dur = [1/(len(pitches)-1)]*(len(pitches)-1)
    assert traj.dur_array == expected_dur
    called = []
    def fake_print(*args, **kwargs):
        called.append(True)
    monkeypatch.setattr('builtins.print', fake_print)
    with pytest.raises(Exception):
        traj.id6(-0.1)
    assert called


def test_min_max_log_freq():
    c4 = Pitch.from_pitch_number(0)
    g4 = Pitch.from_pitch_number(7)
    traj = Trajectory({'pitches':[c4,g4]})
    minf = min(c4.frequency, g4.frequency)
    maxf = max(c4.frequency, g4.frequency)
    assert traj.min_log_freq == pytest.approx(math.log2(minf))
    assert traj.max_log_freq == pytest.approx(math.log2(maxf))


def test_static_names():
    static_names = Trajectory.names()
    instance = Trajectory()
    assert static_names == instance.names


def test_constructor_removes_zero():
    p0 = Pitch(); p1 = Pitch({'swara':1}); p2 = Pitch({'swara':2})
    traj = Trajectory({'id':7,'pitches':[p0,p1,p2],'dur_array':[0.3,0,0.7]})
    assert traj.dur_array == [0.3,0.7]
    assert len(traj.pitches) == 2
    assert traj.pitches[0] is p0
    assert traj.pitches[1] is p1
    assert len(traj.freqs) == 2
    assert len(traj.log_freqs) == 2
