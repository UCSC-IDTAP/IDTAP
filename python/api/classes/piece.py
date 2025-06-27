from __future__ import annotations
from typing import List, Optional, Dict, Union, Any

from .phrase import Phrase
from .trajectory import Trajectory
from .raga import Raga
from .meter import Meter
from ..enums import Instrument
from .chikari import Chikari
from .automation import get_starts

SecCatType = Dict[str, Union[Dict[str, bool], str]]


def init_sec_categorization() -> SecCatType:
    return {
        "Pre-Chiz Alap": {"Pre-Chiz Alap": False},
        "Alap": {"Alap": False, "Jor": False, "Alap-Jhala": False},
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
        "Tala": {"Ektal": False, "Tintal": False, "Rupak": False},
        "Improvisation": {"Improvisation": False},
        "Other": {"Other": False},
        "Top Level": "None",
    }


# ----------------------------------------------------------------------
# Helper used outside the class
# ----------------------------------------------------------------------
def durations_of_fixed_pitches(
    trajs: List[Trajectory],
    output_type: str = "pitchNumber",
    count_type: str = "cumulative",
) -> Dict:
    pitch_durs: Dict[Any, float] = {}
    for traj in trajs:
        traj_pitch_durs = traj.durations_of_fixed_pitches({"output_type": output_type})
        if not isinstance(traj_pitch_durs, dict):
            raise SyntaxError(
                "invalid trajPitchDurs type, must be object: " + str(traj_pitch_durs)
            )
        for k, v in traj_pitch_durs.items():
            pitch_durs[k] = pitch_durs.get(k, 0.0) + float(v)

    if count_type == "proportional":
        total = sum(pitch_durs.values()) or 1.0
        for k in pitch_durs:
            pitch_durs[k] /= total
    return pitch_durs


class Piece:
    def __init__(self, options: Optional[dict] = None) -> None:
        opts = options or {}
        raga_opt = opts.get("raga")
        if raga_opt is not None and not isinstance(raga_opt, Raga):
            raga_opt = Raga.from_json(raga_opt)
        self.raga: Raga = raga_opt or Raga()

        instrumentation = opts.get("instrumentation", [Instrument.Sitar])
        self.instrumentation: List[Instrument] = instrumentation

        phrase_grid = opts.get("phraseGrid")
        if phrase_grid is None:
            phrases = opts.get("phrases", [])
            phrase_grid = [phrases]
        grid: List[List[Phrase]] = []
        for row in phrase_grid:
            new_row = []
            for p in row:
                if not isinstance(p, Phrase):
                    new_row.append(Phrase.from_json(p))
                else:
                    new_row.append(p)
            grid.append(new_row)
        self.phraseGrid = grid

        self.meters: List[Meter] = []
        for m in opts.get("meters", []):
            if isinstance(m, Meter):
                self.meters.append(m)
            else:
                self.meters.append(Meter.from_json(m))

        self.durTot: Optional[float] = opts.get("durTot")
        self.durArrayGrid: Optional[List[List[float]]] = opts.get("durArrayGrid")
        if self.durTot is None or self.durArrayGrid is None:
            self.dur_array_from_phrases()
        else:
            self.update_start_times()

    # ------------------------------------------------------------------
    @property
    def phrases(self) -> List[Phrase]:
        return self.phraseGrid[0]

    @property
    def durArray(self) -> List[float]:
        return self.durArrayGrid[0] if self.durArrayGrid else []

    # ------------------------------------------------------------------
    def update_start_times(self) -> None:
        if not self.durArrayGrid or self.durTot is None:
            return
        for track, phrases in enumerate(self.phraseGrid):
            starts = [s * self.durTot for s in get_starts(self.durArrayGrid[track])]
            for p, st in zip(phrases, starts):
                p.start_time = st
                p.piece_idx = phrases.index(p)

    # ------------------------------------------------------------------
    def dur_tot_from_phrases(self) -> None:
        totals = [sum(p.dur_tot for p in row) for row in self.phraseGrid]
        self.durTot = max(totals) if totals else 0.0

    def dur_array_from_phrases(self) -> None:
        self.dur_tot_from_phrases()
        self.durArrayGrid = []
        if self.durTot == 0:
            self.durArrayGrid.append([])
            return
        for row in self.phraseGrid:
            arr = [p.dur_tot / self.durTot for p in row]
            self.durArrayGrid.append(arr)
        self.update_start_times()

    # ------------------------------------------------------------------
    def set_dur_tot(self, dur_tot: float) -> None:
        if self.durTot is None:
            self.dur_tot_from_phrases()
        if self.durTot is None:
            self.durTot = dur_tot
            return
        if dur_tot < self.durTot:
            raise ValueError("cannot shorten duration")
        extra = dur_tot - self.durTot
        if extra > 0 and self.phrases:
            last_phrase = self.phrases[-1]
            if last_phrase.trajectories and last_phrase.trajectories[-1].id == 12:
                last_phrase.trajectories[-1].dur_tot += extra
            else:
                silent = Trajectory({"id": 12, "dur_tot": extra})
                last_phrase.trajectory_grid[0].append(silent)
            last_phrase.reset()
        self.durTot = dur_tot
        self.dur_array_from_phrases()

    def realign_pitches(self) -> None:
        for phrases in self.phraseGrid:
            for p in phrases:
                p.realign_pitches()

    def update_fundamental(self, fundamental: float) -> None:
        self.raga.fundamental = fundamental
        for phrases in self.phraseGrid:
            for p in phrases:
                p.update_fundamental(fundamental)

    def put_raga_in_phrase(self) -> None:
        for phrases in self.phraseGrid:
            for p in phrases:
                p.raga = self.raga

    # ------------------------------------------------------------------
    def all_trajectories(self, inst: int = 0) -> List[Trajectory]:
        trajs: List[Trajectory] = []
        for p in self.phraseGrid[inst]:
            trajs.extend(p.trajectories)
        return trajs

    def durations_of_fixed_pitches(
        self, inst: int = 0, output_type: str = "pitchNumber"
    ) -> Dict:
        trajs = self.all_trajectories(inst)
        return durations_of_fixed_pitches(trajs, output_type)

    def proportions_of_fixed_pitches(
        self, inst: int = 0, output_type: str = "pitchNumber"
    ) -> Dict:
        return durations_of_fixed_pitches(trajs=self.all_trajectories(inst), output_type=output_type, count_type="proportional")

    # ------------------------------------------------------------------
    def chikari_freqs(self, inst_idx: int) -> List[float]:
        phrases = self.phraseGrid[inst_idx]
        for p in phrases:
            if p.chikaris:
                chikari = list(p.chikaris.values())[0]
                return [c.frequency for c in chikari.pitches[:2]]
        f = self.raga.fundamental
        return [f * 2, f * 4]

    # ------------------------------------------------------------------
    def clean_up_section_categorization(self, c: SecCatType) -> None:
        if "Improvisation" not in c:
            c["Improvisation"] = {"Improvisation": False}
        if "Other" not in c:
            c["Other"] = {"Other": False}
        top_level = c.get("Top Level")
        if not top_level or top_level == "None":
            if any(c["Pre-Chiz Alap"].values()):
                c["Top Level"] = "Pre-Chiz Alap"
            elif any(c["Alap"].values()):
                c["Top Level"] = "Alap"
            elif any(c["Composition Type"].values()):
                c["Top Level"] = "Composition"
            elif any(c["Comp.-section/Tempo"].values()):
                c["Top Level"] = "Composition"
            elif any(c["Improvisation"].values()):
                c["Top Level"] = "Improvisation"
            elif any(c["Other"].values()):
                c["Top Level"] = "Other"
            else:
                c["Top Level"] = "None"

    # ------------------------------------------------------------------
    def to_json(self) -> Dict[str, Any]:
        return {
            "raga": self.raga.to_json(),
            "phraseGrid": [[p.to_json() for p in row] for row in self.phraseGrid],
            "instrumentation": [int(i) if isinstance(i, Instrument) else i for i in self.instrumentation],
            "durTot": self.durTot,
            "durArrayGrid": self.durArrayGrid,
            "meters": [m.to_json() for m in self.meters],
        }

    @staticmethod
    def from_json(obj: Dict[str, Any]) -> "Piece":
        new_obj = dict(obj)
        if "raga" in new_obj:
            new_obj["raga"] = Raga.from_json(new_obj["raga"])
        if "phraseGrid" in new_obj:
            pg = []
            for row in new_obj["phraseGrid"]:
                pg.append([Phrase.from_json(p) for p in row])
            new_obj["phraseGrid"] = pg
        if "meters" in new_obj:
            new_obj["meters"] = [Meter.from_json(m) for m in new_obj["meters"]]
        return Piece(new_obj)
