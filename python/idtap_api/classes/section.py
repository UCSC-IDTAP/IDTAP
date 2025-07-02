from __future__ import annotations

from typing import List, Optional

from .phrase import Phrase
from .pitch import Pitch
from .trajectory import Trajectory
from .piece import init_sec_categorization, SecCatType
from .raga import TuningType


class Section:
    def __init__(self, options: Optional[dict] = None) -> None:
        opts = options or {}
        self.phrases: List[Phrase] = opts.get('phrases', [])

        categorization = opts.get('categorization')
        if categorization is not None:
            self.categorization: SecCatType = categorization
        else:
            self.categorization = init_sec_categorization()

        ad_hoc = opts.get('ad_hoc_categorization')
        if ad_hoc is not None:
            self.ad_hoc_categorization: List[str] = ad_hoc
        else:
            self.ad_hoc_categorization = []

    # ------------------------------------------------------------------
    def all_pitches(self, repetition: bool = True) -> List[Pitch]:
        pitches: List[Pitch] = []
        for phrase in self.phrases:
            pitches.extend(phrase.all_pitches(True))

        if not repetition:
            out: List[Pitch] = []
            for p in pitches:
                if not out:
                    out.append(p)
                else:
                    prev = out[-1]
                    if not (
                        p.swara == prev.swara
                        and p.oct == prev.oct
                        and p.raised == prev.raised
                    ):
                        out.append(p)
            return out
        return pitches

    # ------------------------------------------------------------------
    @property
    def trajectories(self) -> List[Trajectory]:
        trajs: List[Trajectory] = []
        for phrase in self.phrases:
            trajs.extend(phrase.trajectories)
        return trajs


et_tuning: TuningType = {
    'sa': 2 ** (0 / 12),
    're': {
        'lowered': 2 ** (1 / 12),
        'raised': 2 ** (2 / 12),
    },
    'ga': {
        'lowered': 2 ** (3 / 12),
        'raised': 2 ** (4 / 12),
    },
    'ma': {
        'lowered': 2 ** (5 / 12),
        'raised': 2 ** (6 / 12),
    },
    'pa': 2 ** (7 / 12),
    'dha': {
        'lowered': 2 ** (8 / 12),
        'raised': 2 ** (9 / 12),
    },
    'ni': {
        'lowered': 2 ** (10 / 12),
        'raised': 2 ** (11 / 12),
    },
}

