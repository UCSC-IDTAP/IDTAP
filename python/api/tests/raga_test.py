import os
import sys
sys.path.insert(0, os.path.abspath('.'))
from python.api.classes.raga import Raga
from python.api.classes.pitch import Pitch
import pytest, math

yaman_rule_set = {
	'sa': True,
	're': {
		'lowered': False,
		'raised': True
	},
	'ga': {
		'lowered': False,
		'raised': True
	},
	'ma': {
		'lowered': False,
		'raised': True
	},
	'pa': True,
	'dha': {
		'lowered': False,
		'raised': True
	},
	'ni': {
		'lowered': False,
		'raised': True
	}
}

base_tuning = {
	'sa': 2 ** (0 / 12),
	're': {
		'lowered': 2 ** (1 / 12),
		'raised': 2 ** (2 / 12)
	},
	'ga': {
		'lowered': 2 ** (3 / 12),
		'raised': 2 ** (4 / 12)
	},
	'ma': {
		'lowered': 2 ** (5 / 12),
		'raised': 2 ** (6 / 12)
	},
	'pa': 2 ** (7 / 12),
	'dha': {
		'lowered': 2 ** (8 / 12),
		'raised': 2 ** (9 / 12)
	},
	'ni': {
		'lowered': 2 ** (10 / 12),
		'raised': 2 ** (11 / 12)
	}
}

base_ratios = [
	base_tuning['sa'],
	base_tuning['re']['raised'],
	base_tuning['ga']['raised'],
	base_tuning['ma']['raised'],
	base_tuning['pa'],
	base_tuning['dha']['raised'],
	base_tuning['ni']['raised']
]

def test_default_raga():
	r = Raga()
	assert isinstance(r, Raga)
	assert r.name == 'Yaman'
	assert r.fundamental == 261.63
	assert r.rule_set == yaman_rule_set
	assert r.tuning == base_tuning
	assert r.ratios == base_ratios
	assert r.sargam_letters == ['S', 'R', 'G', 'M', 'P', 'D', 'N']
	assert r.rule_set_num_pitches == 7
	pitch_nums = list(range(12))
	sargam_letters = [
		'S',
		None,
		'R',
		None,
		'G',
		None,
		'M',
		'P',
		None,
		'D',
		None,
		'N'
		]
	for pn in pitch_nums:
		assert r.pitch_number_to_sargam_letters(pn) == sargam_letters[pn]
	single_oct_pns = [0, 2, 4, 6, 7, 9, 11, 12]
	assert r.get_pitch_numbers(0, 12) == single_oct_pns
	pns = [
		-12, -10, -8, -6, -5, -3, -1, 
		0, 2, 4, 6, 7, 9, 11, 
		12, 14, 16, 18, 19, 21, 23, 24
	]
	assert r.get_pitch_numbers(-12, 24) == pns
	sns = [
		-7, -6, -5, -4, -3, -2, -1,
		0, 1, 2, 3, 4, 5, 6,
		7, 8, 9, 10, 11, 12, 13, 14
	]
	throw_pns = [
		-11, -9, -7, -4, -2, 
		1, 3, 5, 8, 10,
		13, 15, 17, 20, 22 
	]

	for idx, pn in enumerate(pns):
		assert r.pitch_number_to_scale_number(pn) == sns[idx]

	for idx, pn in enumerate(throw_pns):
		with pytest.raises(ValueError):
			r.pitch_number_to_scale_number(pn)
	for idx, sn in enumerate(sns):
		assert r.scale_number_to_pitch_number(sn) == pns[idx]

	s_letters = ['S', 'R', 'G', 'M', 'P', 'D', 'N']
	s_letters = s_letters + s_letters + s_letters
	s_letters = s_letters + ['S']
	for idx, sn in enumerate(sns):
		assert r.scale_number_to_sargam_letter(sn) == s_letters[idx]
	p_swaras = [
		5, 6, 
		0, 1, 2, 3, 4, 5, 6,
		0, 1, 2, 3, 4, 5, 6,
		0, 1, 2, 3, 4
	]
	p_octs = [
		-2, -2,
		-1, -1, -1, -1, -1, -1, -1,
		0, 0, 0, 0, 0, 0, 0,
		1, 1, 1, 1, 1
	]
	pitches = [Pitch({ 'swara': s, 'oct': p_octs[idx] }) for idx, s in enumerate(p_swaras)]
	rp = r.get_pitches()
	print(len(rp), len(pitches))
	assert r.get_pitches() == pitches
	s_ratios = [
		2 ** 0,
		[2 ** (1 / 12), 2 ** (2 / 12)],
		[2 ** (3 / 12), 2 ** (4 / 12)],
		[2 ** (5 / 12), 2 ** (6 / 12)],
		2 ** (7 / 12),
		[2 ** (8 / 12), 2 ** (9 / 12)],
		[2 ** (10 / 12), 2 ** (11 / 12)]
	]
	assert r.stratified_ratios == s_ratios
	assert r.chikari_pitches == [
		Pitch({ 'swara': 0, 'oct': 2, 'fundamental': 261.63 }),
		Pitch({ 'swara': 0, 'oct': 1, 'fundamental': 261.63 }),
	]
	hard_coded_freqs = [
		110.00186456141468, 123.47291821345574,
				130.815, 146.83487284959062,
		164.81657214199782, 185.00034716183643,
		196.0010402616231, 220.00372912282936,
		246.94583642691148,             261.63,
		293.66974569918125, 329.63314428399565,
		370.00069432367286,  392.0020805232462,
		440.0074582456587, 493.89167285382297,
					523.26,  587.3394913983625,
		659.2662885679913,  740.0013886473457,
		784.0041610464924
	]
	for idx, freq in enumerate(r.get_frequencies()):
		assert math.isclose(pitches[idx].frequency, freq, abs_tol=0.000001)
		assert math.isclose(hard_coded_freqs[idx], freq, abs_tol=0.000001)
	s_names = ['Sa', 'Re', 'Ga', 'Ma', 'Pa', 'Dha', 'Ni']
	assert r.sargam_names == s_names
	json_obj = {
		'name': 'Yaman',
		'fundamental': 261.63,
		'ratios': base_ratios
	}
	assert r.to_json() == json_obj


