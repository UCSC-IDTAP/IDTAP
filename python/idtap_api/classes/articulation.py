from __future__ import annotations
from typing import Optional, TypedDict, Dict

import humps

class ArticulationOptions(TypedDict, total=False):
    name: str
    stroke: str
    hindi: str
    ipa: str
    eng_trans: str
    stroke_nickname: str

class Articulation:
    def __init__(self, options: Optional[ArticulationOptions] = None) -> None:
        opts = humps.decamelize(options or {})
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

        if getattr(self, 'stroke', None) == 'd' and not getattr(self, 'stroke_nickname', None):
            self.stroke_nickname = 'da'
        elif getattr(self, 'stroke', None) == 'r' and not getattr(self, 'stroke_nickname', None):
            self.stroke_nickname = 'ra'

    @staticmethod
    def from_json(obj: Dict) -> 'Articulation':
        return Articulation(obj)

    def to_json(self) -> Dict:
        out = {}
        if hasattr(self, 'name'):
            out['name'] = self.name
        if hasattr(self, 'stroke'):
            out['stroke'] = self.stroke
        if hasattr(self, 'hindi'):
            out['hindi'] = self.hindi
        if hasattr(self, 'ipa'):
            out['ipa'] = self.ipa
        if hasattr(self, 'eng_trans'):
            out['engTrans'] = self.eng_trans
        if hasattr(self, 'stroke_nickname'):
            out['strokeNickname'] = self.stroke_nickname
        return out

    def __eq__(self, other: object) -> bool:
        if not isinstance(other, Articulation):
            return False
        return self.to_json() == other.to_json()
