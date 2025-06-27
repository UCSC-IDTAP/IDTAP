from __future__ import annotations
from typing import Optional, TypedDict, Dict, List, Tuple, Union
import math
import copy
try:
    import humps
    decamelize = humps.decamelize  # type: ignore
except Exception:
    import re

    def decamelize(obj):
        if isinstance(obj, dict):
            out = {}
            for k, v in obj.items():
                s = re.sub(r'(?<!^)(?=[A-Z])', '_', k).lower()
                out[s] = decamelize(v) if isinstance(v, dict) else v
            return out
        return obj

from .pitch import Pitch

BoolObj = Dict[str, bool]
RuleSetType = Dict[str, Union[bool, BoolObj]]
NumObj = Dict[str, float]
TuningType = Dict[str, Union[float, NumObj]]

# Default Yaman rule set
yaman_rule_set: RuleSetType = {
    'sa': True,
    're': {'lowered': False, 'raised': True},
    'ga': {'lowered': False, 'raised': True},
    'ma': {'lowered': False, 'raised': True},
    'pa': True,
    'dha': {'lowered': False, 'raised': True},
    'ni': {'lowered': False, 'raised': True},
}

# 12-TET tuning ratios
et_tuning: TuningType = {
    'sa': 2 ** (0 / 12),
    're': {'lowered': 2 ** (1 / 12), 'raised': 2 ** (2 / 12)},
    'ga': {'lowered': 2 ** (3 / 12), 'raised': 2 ** (4 / 12)},
    'ma': {'lowered': 2 ** (5 / 12), 'raised': 2 ** (6 / 12)},
    'pa': 2 ** (7 / 12),
    'dha': {'lowered': 2 ** (8 / 12), 'raised': 2 ** (9 / 12)},
    'ni': {'lowered': 2 ** (10 / 12), 'raised': 2 ** (11 / 12)},
}

class RagaOptionsType(TypedDict, total=False):
    name: str
    fundamental: float
    rule_set: RuleSetType
    tuning: TuningType
    ratios: List[float]

class Raga:
    def __init__(self, options: Optional[RagaOptionsType] = None) -> None:
        opts = decamelize(options or {})
        self.name: str = opts.get('name', 'Yaman')
        self.fundamental: float = opts.get('fundamental', 261.63)
        self.rule_set: RuleSetType = opts.get('rule_set', yaman_rule_set)
        self.tuning: TuningType = copy.deepcopy(opts.get('tuning', et_tuning))

        ratios_opt = opts.get('ratios')
        if ratios_opt is None or len(ratios_opt) != self.rule_set_num_pitches:
            self.ratios: List[float] = self.set_ratios(self.rule_set)
        else:
            self.ratios = list(ratios_opt)

        # update tuning values from ratios
        for idx, ratio in enumerate(self.ratios):
            swara, variant = self.ratio_idx_to_tuning_tuple(idx)
            if swara in ('sa', 'pa'):
                self.tuning[swara] = ratio
            else:
                if not isinstance(self.tuning[swara], dict):
                    self.tuning[swara] = {'lowered': 0.0, 'raised': 0.0}
                self.tuning[swara][variant] = ratio

    # ------------------------------------------------------------------
    @property
    def sargam_letters(self) -> List[str]:
        init = ['sa', 're', 'ga', 'ma', 'pa', 'dha', 'ni']
        out: List[str] = []
        for s in init:
            val = self.rule_set[s]
            if isinstance(val, dict):
                if val.get('lowered'):
                    out.append(s[0])
                if val.get('raised'):
                    out.append(s[0].upper())
            elif val:
                out.append(s[0].upper())
        return out

    @property
    def solfege_strings(self) -> List[str]:
        pl = self.get_pitches(low=self.fundamental, high=self.fundamental * 1.999)
        return [p.solfege_letter for p in pl]

    @property
    def pc_strings(self) -> List[str]:
        pl = self.get_pitches(low=self.fundamental, high=self.fundamental * 1.999)
        return [str(p.chroma) for p in pl]

    @property
    def western_pitch_strings(self) -> List[str]:
        pl = self.get_pitches(low=self.fundamental, high=self.fundamental * 1.999)
        return [p.western_pitch for p in pl]

    @property
    def rule_set_num_pitches(self) -> int:
        count = 0
        for key, val in self.rule_set.items():
            if isinstance(val, bool):
                if val:
                    count += 1
            else:
                if val.get('lowered'):
                    count += 1
                if val.get('raised'):
                    count += 1
        return count

    # ------------------------------------------------------------------
    def pitch_number_to_sargam_letter(self, pitch_number: int) -> Optional[str]:
        chroma = pitch_number % 12
        while chroma < 0:
            chroma += 12
        scale_degree, raised = Pitch.chroma_to_scale_degree(chroma)
        swara = ['sa', 're', 'ga', 'ma', 'pa', 'dha', 'ni'][scale_degree]
        val = self.rule_set[swara]
        if isinstance(val, bool):
            if val:
                return swara[0].upper()
            return None
        else:
            if val['raised' if raised else 'lowered']:
                return swara[0].upper() if raised else swara[0]
            return None

    def get_pitch_numbers(self, low: int, high: int) -> List[int]:
        pns: List[int] = []
        for i in range(low, high + 1):
            chroma = i % 12
            while chroma < 0:
                chroma += 12
            scale_degree, raised = Pitch.chroma_to_scale_degree(chroma)
            swara = ['sa', 're', 'ga', 'ma', 'pa', 'dha', 'ni'][scale_degree]
            val = self.rule_set[swara]
            if isinstance(val, bool):
                if val:
                    pns.append(i)
            else:
                if val['raised' if raised else 'lowered']:
                    pns.append(i)
        return pns

    def pitch_number_to_scale_number(self, pitch_number: int) -> int:
        octv = pitch_number // 12
        chroma = pitch_number % 12
        while chroma < 0:
            chroma += 12
        main_oct = self.get_pitch_numbers(0, 11)
        if chroma not in main_oct:
            raise ValueError('pitchNumberToScaleNumber: pitchNumber not in raga')
        idx = main_oct.index(chroma)
        return idx + octv * len(main_oct)

    def scale_number_to_pitch_number(self, scale_number: int) -> int:
        main_oct = self.get_pitch_numbers(0, 11)
        octv = scale_number // len(main_oct)
        while scale_number < 0:
            scale_number += len(main_oct)
        chroma = main_oct[scale_number % len(main_oct)]
        return chroma + octv * 12

    def scale_number_to_sargam_letter(self, scale_number: int) -> Optional[str]:
        pn = self.scale_number_to_pitch_number(scale_number)
        return self.pitch_number_to_sargam_letter(pn)

    # ------------------------------------------------------------------
    def set_ratios(self, rule_set: RuleSetType) -> List[float]:
        ratios: List[float] = []
        for s in rule_set.keys():
            val = rule_set[s]
            base = et_tuning[s]
            if isinstance(val, bool):
                if val:
                    ratios.append(base)  # type: ignore
            else:
                if val.get('lowered'):
                    ratios.append(base['lowered'])  # type: ignore
                if val.get('raised'):
                    ratios.append(base['raised'])  # type: ignore
        return ratios

    # ------------------------------------------------------------------
    def get_pitches(self, low: float = 100, high: float = 800) -> List[Pitch]:
        pitches: List[Pitch] = []
        for s, val in self.rule_set.items():
            if isinstance(val, bool):
                if val:
                    freq = float(self.tuning[s]) * self.fundamental  # type: ignore
                    low_exp = math.ceil(math.log2(low / freq))
                    high_exp = math.floor(math.log2(high / freq))
                    for i in range(low_exp, high_exp + 1):
                        pitches.append(Pitch({'swara': s, 'oct': i, 'fundamental': self.fundamental, 'ratios': self.stratified_ratios}))
            else:
                if val.get('lowered'):
                    freq = self.tuning[s]['lowered'] * self.fundamental  # type: ignore
                    low_exp = math.ceil(math.log2(low / freq))
                    high_exp = math.floor(math.log2(high / freq))
                    for i in range(low_exp, high_exp + 1):
                        pitches.append(Pitch({'swara': s, 'oct': i, 'raised': False, 'fundamental': self.fundamental, 'ratios': self.stratified_ratios}))
                if val.get('raised'):
                    freq = self.tuning[s]['raised'] * self.fundamental  # type: ignore
                    low_exp = math.ceil(math.log2(low / freq))
                    high_exp = math.floor(math.log2(high / freq))
                    for i in range(low_exp, high_exp + 1):
                        pitches.append(Pitch({'swara': s, 'oct': i, 'raised': True, 'fundamental': self.fundamental, 'ratios': self.stratified_ratios}))
        pitches.sort(key=lambda p: p.frequency)
        return [p for p in pitches if low <= p.frequency <= high]

    @property
    def stratified_ratios(self) -> List[Union[float, List[float]]]:
        ratios: List[Union[float, List[float]]] = []
        ct = 0
        for s in ['sa', 're', 'ga', 'ma', 'pa', 'dha', 'ni']:
            val = self.rule_set[s]
            base = self.tuning[s]
            if isinstance(val, bool):
                if val:
                    ratios.append(self.ratios[ct])
                    ct += 1
                else:
                    ratios.append(base)  # type: ignore
            else:
                pair: List[float] = []
                if val.get('lowered'):
                    pair.append(self.ratios[ct]); ct += 1
                else:
                    pair.append(base['lowered'])  # type: ignore
                if val.get('raised'):
                    pair.append(self.ratios[ct]); ct += 1
                else:
                    pair.append(base['raised'])  # type: ignore
                ratios.append(pair)
        return ratios

    @property
    def chikari_pitches(self) -> List[Pitch]:
        return [
            Pitch({'swara': 's', 'oct': 2, 'fundamental': self.fundamental}),
            Pitch({'swara': 's', 'oct': 1, 'fundamental': self.fundamental}),
        ]

    def get_frequencies(self, low: float = 100, high: float = 800) -> List[float]:
        freqs: List[float] = []
        for ratio in self.ratios:
            base = ratio * self.fundamental
            low_exp = math.ceil(math.log2(low / base))
            high_exp = math.floor(math.log2(high / base))
            for i in range(low_exp, high_exp + 1):
                freqs.append(base * (2 ** i))
        freqs.sort()
        return freqs

    @property
    def sargam_names(self) -> List[str]:
        names: List[str] = []
        for s, val in self.rule_set.items():
            if isinstance(val, dict):
                if val.get('lowered'):
                    names.append(s.lower())
                if val.get('raised'):
                    names.append(s.capitalize())
            else:
                if val:
                    names.append(s.capitalize())
        return names

    @property
    def swara_objects(self) -> List[Dict[str, Union[int, bool]]]:
        objs: List[Dict[str, Union[int, bool]]] = []
        idx = 0
        for s, val in self.rule_set.items():
            if isinstance(val, dict):
                if val.get('lowered'):
                    objs.append({'swara': idx, 'raised': False})
                if val.get('raised'):
                    objs.append({'swara': idx, 'raised': True})
                idx += 1
            else:
                if val:
                    objs.append({'swara': idx, 'raised': True})
                idx += 1
        return objs

    # ------------------------------------------------------------------
    def pitch_from_log_freq(self, log_freq: float) -> Pitch:
        epsilon = 1e-6
        log_options = [math.log2(f) for f in self.get_frequencies(low=75, high=2400)]
        quantized = min(log_options, key=lambda x: abs(x - log_freq))
        log_offset = log_freq - quantized
        log_diff = quantized - math.log2(self.fundamental)
        rounded = round(log_diff)
        if abs(log_diff - rounded) < epsilon:
            log_diff = rounded
        oct_offset = math.floor(log_diff)
        log_diff -= oct_offset
        # find closest ratio index
        r_idx = 0
        for i, r in enumerate(self.ratios):
            if abs(r - 2 ** log_diff) < 1e-6:
                r_idx = i
                break
        swara_letter = self.sargam_letters[r_idx]
        raised = swara_letter.isupper()
        return Pitch({
            'swara': swara_letter,
            'oct': oct_offset,
            'fundamental': self.fundamental,
            'ratios': self.stratified_ratios,
            'log_offset': log_offset,
            'raised': raised,
        })

    def ratio_idx_to_tuning_tuple(self, idx: int) -> Tuple[str, Optional[str]]:
        mapping: List[Tuple[str, Optional[str]]] = []
        for key, val in self.rule_set.items():
            if isinstance(val, dict):
                if val.get('lowered'):
                    mapping.append((key, 'lowered'))
                if val.get('raised'):
                    mapping.append((key, 'raised'))
            else:
                if val:
                    mapping.append((key, None))
        return mapping[idx]

    # ------------------------------------------------------------------
    def to_json(self) -> Dict[str, Union[str, float, List[float], TuningType]]:
        return {
            'name': self.name,
            'fundamental': self.fundamental,
            'ratios': self.ratios,
            'tuning': self.tuning,
        }

    @staticmethod
    def from_json(obj: Dict) -> 'Raga':
        return Raga(obj)
