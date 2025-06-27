from __future__ import annotations
from typing import List, Optional, Dict, Union

from .phrase import Phrase
from .trajectory import Trajectory


SecCatType = Dict[str, Union[Dict[str, bool], str]]


def init_sec_categorization() -> SecCatType:
    return {
        "Pre-Chiz Alap": {
            "Pre-Chiz Alap": False,
        },
        "Alap": {
            "Alap": False,
            "Jor": False,
            "Alap-Jhala": False,
        },
        "Composition Type": {
            "Dhrupad": False,
            "Bandish": False,
            "Thumri": False,
            "Ghazal": False,
            "Qawwali": False,
            "Dhun": False,
            "Tappa": False,
            "Bhajan": False,
            "Kirtan": False,
            "Kriti": False,
            "Masitkhani Gat": False,
            "Razakhani Gat": False,
            "Ferozkhani Gat": False,
        },
        "Comp.-section/Tempo": {
            "Ati Vilambit": False,
            "Vilambit": False,
            "Madhya": False,
            "Drut": False,
            "Ati Drut": False,
            "Jhala": False,
        },
        "Tala": {
            "Ektal": False,
            "Tintal": False,
            "Rupak": False,
        },
        "Improvisation": {
            "Improvisation": False,
        },
        "Other": {
            "Other": False,
        },
        "Top Level": "None",
    }
from .raga import Raga
from ..enums import Instrument

from .trajectory import Trajectory


def durations_of_fixed_pitches(trajs: List[Trajectory], output_type: str = 'pitchNumber', count_type: str = 'cumulative') -> Dict:
    pitch_durs: Dict = {}
    for traj in trajs:
        traj_pitch_durs = traj.durations_of_fixed_pitches({'output_type': output_type})
        if not isinstance(traj_pitch_durs, dict):
            raise SyntaxError('invalid trajPitchDurs type, must be object: ' + str(traj_pitch_durs))
        for k, v in traj_pitch_durs.items():
            pitch_durs[k] = pitch_durs.get(k, 0) + v
    if count_type == 'cumulative':
        return pitch_durs
    elif count_type == 'proportional':
        total = sum(pitch_durs.values())
        for k in pitch_durs:
            pitch_durs[k] /= total
        return pitch_durs
    else:
        return pitch_durs


class Piece:
    def __init__(self, options: Optional[dict] = None) -> None:
        opts = options or {}
        self.phrases: List[Phrase] = opts.get('phrases', [])
        self.raga: Raga = opts.get('raga', Raga())
        self.instrumentation: List[Instrument] = opts.get('instrumentation', [Instrument.Sitar])

    def all_trajectories(self, inst: int = 0) -> List[Trajectory]:
        trajs: List[Trajectory] = []
        for phrase in self.phrases:
            trajs.extend(phrase.trajectories)
        return trajs

    def durations_of_fixed_pitches(self, inst: int = 0, output_type: str = 'pitchNumber') -> Dict:
        trajs = self.all_trajectories(inst)
        return durations_of_fixed_pitches(trajs, output_type)

    def proportions_of_fixed_pitches(self, inst: int = 0, output_type: str = 'pitchNumber') -> Dict:
        durs = self.durations_of_fixed_pitches(inst, output_type)
        total = sum(durs.values())
        return {k: v/total for k, v in durs.items()}
