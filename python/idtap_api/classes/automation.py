from __future__ import annotations
from typing import List, TypedDict, Optional, Dict

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


def get_starts(dur_array: List[float]) -> List[float]:
    starts = [0.0]
    total = 0.0
    for dur in dur_array[:-1]:
        total += dur
        starts.append(total)
    return starts


def get_ends(dur_array: List[float]) -> List[float]:
    ends = []
    total = 0.0
    for dur in dur_array:
        total += dur
        ends.append(total)
    return ends


def close_to(a: float, b: float) -> bool:
    return abs(a - b) < 1e-6


class AutomationValueType(TypedDict):
    norm_time: float
    value: float


class AutomationOptionsType(TypedDict, total=False):
    values: List[AutomationValueType]


class Automation:
    def __init__(self, options: Optional[AutomationOptionsType] = None) -> None:
        opts = decamelize(options or {})
        self.values: List[AutomationValueType] = []
        for v in opts.get('values', []):
            if 'norm_time' in v:
                nt = v['norm_time']
            else:
                nt = v.get('normTime')
            val = v['value']
            self.values.append({'norm_time': nt, 'value': val})
        if len(self.values) == 0:
            self.values.append({'norm_time': 0.0, 'value': 1.0})
            self.values.append({'norm_time': 1.0, 'value': 1.0})

    # ------------------------------------------------------------------
    def add_value(self, norm_time: float, value: float) -> None:
        if norm_time < 0 or norm_time > 1:
            raise SyntaxError(f"invalid normTime, must be between 0 and 1: {norm_time}")
        if value < 0 or value > 1:
            raise SyntaxError(f"invalid value, must be between 0 and 1: {value}")

        idx = next((i for i, v in enumerate(self.values) if v['norm_time'] == norm_time), -1)
        if idx != -1:
            self.values[idx]['value'] = value
        else:
            self.values.append({'norm_time': norm_time, 'value': value})
            self.values.sort(key=lambda x: x['norm_time'])

    # ------------------------------------------------------------------
    def remove_value(self, idx: int) -> None:
        if idx < 0 or idx > len(self.values) - 1:
            raise SyntaxError(f"invalid idx, must be between 0 and {len(self.values) - 1}: {idx}")
        if idx == 0 or idx == len(self.values) - 1:
            raise SyntaxError("cannot remove first or last value")
        self.values.pop(idx)

    # ------------------------------------------------------------------
    def value_at_x(self, x: float) -> float:
        if x < 0 or x > 1:
            raise SyntaxError(f"invalid x, must be between 0 and 1: {x}")
        idx = -1
        for i in range(len(self.values) - 1, -1, -1):
            if self.values[i]['norm_time'] <= x:
                idx = i
                break
        if idx == -1:
            raise SyntaxError(f"invalid x, must be between 0 and 1: {x}")
        elif idx == len(self.values) - 1:
            return self.values[idx]['value']
        else:
            start = self.values[idx]
            end = self.values[idx + 1]
            slope = (end['value'] - start['value']) / (end['norm_time'] - start['norm_time'])
            return start['value'] + slope * (x - start['norm_time'])

    # ------------------------------------------------------------------
    def generate_value_curve(self, value_dur: float, duration: float, max_val: float = 1.0) -> List[float]:
        value_ct = round(duration / value_dur)
        self.values.sort(key=lambda x: x['norm_time'])
        norm_times = [i / value_ct for i in range(value_ct + 1)]
        return [max_val * self.value_at_x(nt) for nt in norm_times]

    # ------------------------------------------------------------------
    def partition(self, dur_array: List[float]) -> List['Automation']:
        starts = get_starts(dur_array)
        ends = get_ends(dur_array)
        new_automations: List[Automation] = []
        for start, end in zip(starts, ends):
            start_val = self.value_at_x(start)
            end_val = self.value_at_x(end)
            new_automations.append(
                Automation({'values': [
                    {'norm_time': 0.0, 'value': start_val},
                    {'norm_time': 1.0, 'value': end_val}
                ]})
            )
        for v in self.values:
            if v['norm_time'] not in starts and v['norm_time'] not in ends:
                for i in range(len(starts)):
                    if starts[i] < v['norm_time'] < ends[i]:
                        dur = ends[i] - starts[i]
                        rel_norm_time = (v['norm_time'] - starts[i]) / dur if dur != 0 else 0
                        new_automations[i].add_value(rel_norm_time, v['value'])
        return new_automations

    # ------------------------------------------------------------------
    @staticmethod
    def compress(automations: List['Automation'], dur_array: List[float]) -> 'Automation':
        all_values: List[AutomationValueType] = []
        dur_accumulator = 0.0
        for a, dur in zip(automations, dur_array):
            rel_values = [
                {'norm_time': v['norm_time'] * dur + dur_accumulator, 'value': v['value']}
                for v in a.values
            ]
            all_values.extend(rel_values)
            dur_accumulator += dur
        unique: List[AutomationValueType] = []
        seen = set()
        for v in all_values:
            if v['norm_time'] not in seen:
                unique.append(v)
                seen.add(v['norm_time'])
        all_values = unique
        changed = True
        while changed:
            changed = False
            for i in range(len(all_values) - 2):
                a = all_values[i]
                b = all_values[i + 1]
                c = all_values[i + 2]
                slope1 = (b['value'] - a['value']) / (b['norm_time'] - a['norm_time'])
                slope2 = (c['value'] - b['value']) / (c['norm_time'] - b['norm_time'])
                if close_to(slope1, slope2):
                    all_values.pop(i + 1)
                    changed = True
                    break
        return Automation({'values': all_values})

    # ------------------------------------------------------------------
    @staticmethod
    def from_json(obj: Dict) -> 'Automation':
        return Automation(obj)

    def to_json(self) -> Dict:
        return {'values': self.values}
