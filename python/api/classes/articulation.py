from typing import Optional, TypedDict
import humps

class ArticulationOptionsType(TypedDict, total=False):
    name: str
    stroke: str
    hindi: str
    ipa: str
    eng_trans: str
    stroke_nickname: str

class Articulation:
    def __init__(self, options: Optional[ArticulationOptionsType] = None):
        if options is None:
            options = {}
        else:
            options = humps.decamelize(options)
        self.name = options.get('name', 'pluck')
        self.stroke: Optional[str] = options.get('stroke')
        self.hindi: Optional[str] = options.get('hindi')
        self.ipa: Optional[str] = options.get('ipa')
        self.eng_trans: Optional[str] = options.get('eng_trans')
        self.stroke_nickname: Optional[str] = options.get('stroke_nickname')

        if self.stroke == 'd' and self.stroke_nickname is None:
            self.stroke_nickname = 'da'
        elif self.stroke == 'r' and self.stroke_nickname is None:
            self.stroke_nickname = 'ra'

    @classmethod
    def from_json(cls, obj: dict):
        return cls(obj)

    def to_json(self):
        return {
            'name': self.name,
            'stroke': self.stroke,
            'hindi': self.hindi,
            'ipa': self.ipa,
            'engTrans': self.eng_trans,
            'strokeNickname': self.stroke_nickname,
        }
