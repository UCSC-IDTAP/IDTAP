from python.api.classes.pitch import Pitch
import math

# since its python, everything should be in snake_case

def test_default_pitch():
    p = Pitch()
    assert p.swara == 0
    assert p.oct == 0
    assert p.raised == True
    assert p.fundamental == 261.63
    ratios = [
        1,
        [2 ** (1 / 12), 2 ** (2 / 12)],
        [2 ** (3 / 12), 2 ** (4 / 12)],
        [2 ** (5 / 12), 2 ** (6 / 12)],
        2 ** (7 / 12),
        [2 ** (8 / 12), 2 ** (9 / 12)],
        [2 ** (10 / 12), 2 ** (11 / 12)]
    ]
    assert p.ratios == ratios
    assert p.log_offset == 0.0
    assert p.frequency == 261.63
    assert p.non_offset_frequency == 261.63
    logFreq = math.log2(p.frequency)
    assert p.non_offset_log_freq == logFreq
    assert p.log_freq == logFreq
    assert p.sargam_letter == 'S'
    assert p.octaved_sargam_letter == 'S'
    assert p.numbered_pitch == 0
    assert p.chroma == 0
    assert p.to_JSON() == { # this should still be camelCase
      "swara": 0,
      "raised": True,
      "oct": 0,
      "ratios": ratios,
      "fundamental": 261.63,
      "logOffset": 0,
    }  

     # everything above here has been implemented

def test_swara_input():
    def sa_test(p: Pitch):
        sa_freq = 261.63
        sa_log_freq = math.log2(sa_freq)
        assert p.swara == 0
        assert math.isclose(p.frequency, sa_freq, abs_tol=0.01)
        assert math.isclose(p.log_freq, sa_log_freq, abs_tol=0.01)
        assert p.sargam_letter == 'S'
        assert p.raised == True
        assert p.chroma == 0



    def re_lowered_test(p: Pitch):
        re_freq = 277.19
        re_log_freq = math.log2(re_freq)
        assert p.swara == 1
        assert math.isclose(p.frequency, re_freq, abs_tol=0.01)
        assert math.isclose(p.log_freq, re_log_freq, abs_tol=0.01)
        assert p.sargam_letter == 'r'
        assert p.raised == False
        assert p.chroma == 1
    
    def re_raised_test(p: Pitch):
        re_freq = 293.67
        re_log_freq = math.log2(re_freq)
        assert p.swara == 1
        assert math.isclose(p.frequency, re_freq, abs_tol=0.01)
        assert math.isclose(p.log_freq, re_log_freq, abs_tol=0.01)
        assert p.sargam_letter == 'R'
        assert p.raised == True
        assert p.chroma == 2
    
    def ga_lowered_test(p: Pitch):
        ga_freq = 311.13
        ga_log_freq = math.log2(ga_freq)
        assert p.swara == 2
        assert math.isclose(p.frequency, ga_freq, abs_tol=0.01)
        assert math.isclose(p.log_freq, ga_log_freq, abs_tol=0.01)
        assert p.sargam_letter == 'g'
        assert p.raised == False
        assert p.chroma == 3

    def ga_raised_test(p: Pitch):
        ga_freq = 329.63
        ga_log_freq = math.log2(ga_freq)
        assert p.swara == 2
        assert math.isclose(p.frequency, ga_freq, abs_tol=0.01)
        assert math.isclose(p.log_freq, ga_log_freq, abs_tol=0.01)
        assert p.sargam_letter == 'G'
        assert p.raised == True
        assert p.chroma == 4
    
    def ma_lowered_test(p: Pitch):
        ma_freq = 349.23
        ma_log_freq = math.log2(ma_freq)
        assert p.swara == 3
        assert math.isclose(p.frequency, ma_freq, abs_tol=0.01)
        assert math.isclose(p.log_freq, ma_log_freq, abs_tol=0.01)
        assert p.sargam_letter == 'm'
        assert p.raised == False
        assert p.chroma == 5
    
    def ma_raised_test(p: Pitch):
        ma_freq = 370
        ma_log_freq = math.log2(ma_freq)
        assert p.swara == 3
        assert math.isclose(p.frequency, ma_freq, abs_tol=0.01)
        assert math.isclose(p.log_freq, ma_log_freq, abs_tol=0.01)
        assert p.sargam_letter == 'M'
        assert p.raised == True
        assert p.chroma == 6
    
    def pa_test(p: Pitch):
        pa_freq = 392
        pa_log_freq = math.log2(pa_freq)
        assert p.swara == 4
        assert math.isclose(p.frequency, pa_freq, abs_tol=0.01)
        assert math.isclose(p.log_freq, pa_log_freq, abs_tol=0.01)
        assert p.sargam_letter == 'P'
        assert p.raised == True
        assert p.chroma == 7
    
    def dha_lowered_test(p: Pitch):
        dha_freq = 415.31
        dha_log_freq = math.log2(dha_freq)
        assert p.swara == 5
        assert math.isclose(p.frequency, dha_freq, abs_tol=0.01)
        assert math.isclose(p.log_freq, dha_log_freq, abs_tol=0.01)
        assert p.sargam_letter == 'd'
        assert p.raised == False
        assert p.chroma == 8
    
    def dha_raised_test(p: Pitch):
        dha_freq = 440.01
        dha_log_freq = math.log2(dha_freq)
        assert p.swara == 5
        assert math.isclose(p.frequency, dha_freq, abs_tol=0.01)
        assert math.isclose(p.log_freq, dha_log_freq, abs_tol=0.01)
        assert p.sargam_letter == 'D'
        assert p.raised == True
        assert p.chroma == 9
    
    def ni_lowered_test(p: Pitch):
        ni_freq = 466.17
        ni_log_freq = math.log2(ni_freq)
        assert p.swara == 6
        assert math.isclose(p.frequency, ni_freq, abs_tol=0.01)
        assert math.isclose(p.log_freq, ni_log_freq, abs_tol=0.01)
        assert p.sargam_letter == 'n'
        assert p.raised == False
        assert p.chroma == 10
    
    def ni_raised_test(p: Pitch):
        ni_freq = 493.89
        ni_log_freq = math.log2(ni_freq)
        assert p.swara == 6
        assert math.isclose(p.frequency, ni_freq, abs_tol=0.01)
        assert math.isclose(p.log_freq, ni_log_freq, abs_tol=0.01)
        assert p.sargam_letter == 'N'
        assert p.raised == True
        assert p.chroma == 11

    sa_vars = ['Sa', 'sa', 'S', 's', 0]
    for sa in sa_vars:
        p = Pitch({ 'swara': sa })
        sa_test(p)
        p = Pitch({ 'swara': sa, 'raised': False })
        # // shouldn't matter if you pass it raised = false, will revert to
        # raised == true 
        sa_test(p) 
    
    re_vars = ['Re', 're', 'R', 'r', 1]
    for re in re_vars:
        p = Pitch({ 'swara': re, 'raised': False })
        re_lowered_test(p)
        p = Pitch({ 'swara': re })
        re_raised_test(p)
    
    ga_vars = ['Ga', 'ga', 'G', 'g', 2]
    for ga in ga_vars:
        p = Pitch({ 'swara': ga, 'raised': False })
        ga_lowered_test(p)
        p = Pitch({ 'swara': ga })
        ga_raised_test(p)
    
    ma_vars = ['Ma', 'ma', 'M', 'm', 3]
    for ma in ma_vars:
        p = Pitch({ 'swara': ma, 'raised': False })
        ma_lowered_test(p)
        p = Pitch({ 'swara': ma })
        ma_raised_test(p)
    
    pa_vars = ['Pa', 'pa', 'P', 'p', 4]
    for pa in pa_vars:
        p = Pitch({ 'swara': pa })
        pa_test(p)
        p = Pitch({ 'swara': pa, 'raised': False })
        # // shouldn't matter if you pass it raised = false, will revert to
        # raised == true
        pa_test(p)
    
    dha_vars = ['Dha', 'dha', 'D', 'd', 5]
    for dha in dha_vars:
        p = Pitch({ 'swara': dha, 'raised': False })
        dha_lowered_test(p)
        p = Pitch({ 'swara': dha })
        dha_raised_test(p)
    
    ni_vars = ['Ni', 'ni', 'N', 'n', 6]
    for ni in ni_vars:
        p = Pitch({ 'swara': ni, 'raised': False })
        ni_lowered_test(p)
        p = Pitch({ 'swara': ni })
        ni_raised_test(p)

def test_octave_input():
    p = Pitch({ 'swara': 'sa', 'oct': -2 })
    saDown2 = 'S' + '\u0324'
    saDown1 = 'S' + '\u0323'
    saPlus1 = 'S' + '\u0307'
    saPlus2 = 'S' + '\u0308'
    assert p.oct == -2
    assert p.octaved_sargam_letter == saDown2
    p.set_oct(-1)
    assert p.oct == -1
    assert p.octaved_sargam_letter == saDown1
    p.set_oct(0)
    assert p.oct == 0
    assert p.octaved_sargam_letter == 'S'
    p.set_oct(1)
    assert p.oct == 1
    assert p.octaved_sargam_letter == saPlus1
    p.set_oct(2)
    assert p.oct == 2
    assert p.octaved_sargam_letter == saPlus2

def test_log_offset():
    offset = 0.1
    p = Pitch({ 'log_offset': offset })
    assert p.log_offset == offset
    sa_freq = 261.63
    sa_log_freq = math.log2(sa_freq)
    offset_sa_log_freq = sa_log_freq + offset
    offset_sa_freq = 2 ** offset_sa_log_freq
    assert math.isclose(p.frequency, offset_sa_freq, abs_tol=0.01)
    assert math.isclose(p.log_freq, offset_sa_log_freq, abs_tol=0.01)
    assert math.isclose(p.non_offset_frequency, sa_freq, abs_tol=0.01)

def test_numbered_pitch():
    p = Pitch({ 'swara': 5, 'oct': -2 })
    assert p.numbered_pitch == -15
    p = Pitch({ 'swara': 2, 'oct': 0 })
    assert p.numbered_pitch == 4
    p = Pitch({ 'swara': 3, 'raised': False, 'oct': 1 })
    assert p.numbered_pitch == 17


def test_serialization_round_trip():
    p = Pitch({'swara': 'ga', 'raised': False, 'oct': 1, 'logOffset': 0.2})
    json_obj = p.to_JSON()
    copy = Pitch(json_obj)
    assert copy.to_JSON() == json_obj
