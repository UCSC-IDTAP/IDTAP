from __future__ import annotations
from typing import Optional, TypedDict, Dict

try:
    import humps
    decamelize = humps.decamelize  # type: ignore
except Exception:
    import re
    def decamelize(obj: Dict) -> Dict:
        if isinstance(obj, dict):
            out: Dict = {}
            for k, v in obj.items():
                s = re.sub(r'(?<!^)(?=[A-Z])', '_', k).lower()
                out[s] = decamelize(v) if isinstance(v, dict) else v
            return out
        return obj

class ArticulationOptions(TypedDict, total=False):
    name: str
    stroke: str
    hindi: str
    ipa: str
    eng_trans: str
    stroke_nickname: str

class Articulation:
    def __init__(self, options: Optional[ArticulationOptions] = None) -> None:
        opts = decamelize(options or {})
        self.name: str = opts.get('name', 'pluck')
        stroke = opts.get('stroke')
        hindi = opts.get('hindi')
        ipa = opts.get('ipa')
        eng_trans = opts.get('eng_trans')
        stroke_nickname = opts.get('stroke_nickname')

        if stroke is not None:
            self.stroke = stroke
        if hindi is not None:
            self.hindi = hindi
        if ipa is not None:
            self.ipa = ipa
        if eng_trans is not None:
            self.eng_trans = eng_trans
        if stroke_nickname is not None:
            self.stroke_nickname = stroke_nickname

        if getattr(self, 'stroke', None) == 'd' and not hasattr(self, 'stroke_nickname'):
            self.stroke_nickname = 'da'
        elif getattr(self, 'stroke', None) == 'r' and not hasattr(self, 'stroke_nickname'):
            self.stroke_nickname = 'ra'

    @staticmethod
    def from_json(obj: Dict) -> 'Articulation':
        return Articulation(obj)
