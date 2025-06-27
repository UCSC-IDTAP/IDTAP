from typing import Optional, TypedDict
import humps

class ArticulationOptions(TypedDict, total=False):
    name: str
    stroke: str
    hindi: str
    ipa: str
    eng_trans: str
    stroke_nickname: str

class Articulation:
    def __init__(self, options: Optional[ArticulationOptions] = None):
        if options is None:
            options = {}
        else:
            options = humps.decamelize(options)
        self.name = options.get('name', 'pluck')
        stroke = options.get('stroke')
        hindi = options.get('hindi')
        ipa = options.get('ipa')
        eng_trans = options.get('eng_trans')
        stroke_nickname = options.get('stroke_nickname')

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

        if getattr(self, 'stroke', None) == 'd' and stroke_nickname is None:
            self.stroke_nickname = 'da'
        elif getattr(self, 'stroke', None) == 'r' and stroke_nickname is None:
            self.stroke_nickname = 'ra'

    @staticmethod
    def from_json(obj: dict) -> "Articulation":
        return Articulation(obj)
