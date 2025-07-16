from __future__ import annotations
from typing import List, Optional, Dict, TypedDict
import uuid

try:
    import humps
    decamelize = humps.decamelize  # type: ignore
except Exception:  # pragma: no cover - fallback for missing humps
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


class ChikariOptionsType(TypedDict, total=False):
    pitches: List[Pitch] | List[Dict]
    fundamental: float
    unique_id: str


class Chikari:
    def __init__(self, options: Optional[ChikariOptionsType] = None) -> None:
        opts = decamelize(options or {})

        default_pitches = [
            Pitch({'swara': 's', 'oct': 2}),
            Pitch({'swara': 's', 'oct': 1}),
            Pitch({'swara': 'p', 'oct': 0}),
            Pitch({'swara': 'g', 'oct': 0}),
        ]
        pitches_in = opts.get('pitches', default_pitches)
        fundamental = opts.get('fundamental', Pitch().fundamental)
        unique_id = opts.get('unique_id')

        self.unique_id: str = str(unique_id) if unique_id is not None else str(uuid.uuid4())
        self.fundamental: float = fundamental

        self.pitches: List[Pitch] = []
        for p in pitches_in:
            if not isinstance(p, Pitch):
                p = Pitch(p)  # type: ignore[arg-type]
            p.fundamental = self.fundamental
            self.pitches.append(p)

    # ------------------------------------------------------------------
    def to_json(self) -> Dict:
        return {
            'fundamental': self.fundamental,
            'pitches': [p.to_JSON() for p in self.pitches],
            'uniqueId': self.unique_id,
        }

    @staticmethod
    def from_json(obj: Dict) -> 'Chikari':
        opts = decamelize(obj)
        pitches = [Pitch.from_json(p) for p in opts.get('pitches', [])]
        opts['pitches'] = pitches
        return Chikari(opts)  # type: ignore[arg-type]
