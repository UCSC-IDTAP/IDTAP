from __future__ import annotations
from typing import List, Optional, Dict, Union, Any
from datetime import datetime

from .phrase import Phrase
from .trajectory import Trajectory
from .raga import Raga
from .meter import Meter
from ..enums import Instrument
from .chikari import Chikari
from .group import Group
from .automation import get_starts, get_ends
import math
from typing import TYPE_CHECKING

if TYPE_CHECKING:
    from .section import Section

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
        inst_list: List[Instrument] = []
        for i in instrumentation:
            if isinstance(i, Instrument):
                inst_list.append(i)
            else:
                try:
                    inst_list.append(Instrument(i))
                except ValueError:
                    inst_list.append(i)
        self.instrumentation = inst_list

        self.possible_trajs: Dict[Instrument, List[int]] = {
            Instrument.Sitar: list(range(14)),
            Instrument.Vocal_M: [0, 1, 2, 3, 4, 5, 6, 12, 13],
            Instrument.Vocal_F: [0, 1, 2, 3, 4, 5, 6, 12, 13],
        }

        first_inst = self.instrumentation[0]
        self.traj_idxs = self.possible_trajs.get(first_inst, [])
        self.traj_idxs_grid = [self.possible_trajs.get(i, []) for i in self.instrumentation]

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
        self.phrase_grid = grid

        self.title: str = opts.get("title", "untitled")
        self.date_created: datetime = opts.get("dateCreated", datetime.now())
        self.date_modified: datetime = opts.get("dateModified", datetime.now())
        self.location: str = opts.get("location", "Santa Cruz")
        self._id: Optional[str] = opts.get("_id")
        self.audio_id: Optional[str] = opts.get("audioID")
        self.audio_db_id: Optional[str] = opts.get("audio_DB_ID")
        self.user_id: Optional[str] = opts.get("userID")
        self.name: Optional[str] = opts.get("name")
        self.family_name: Optional[str] = opts.get("family_name")
        self.given_name: Optional[str] = opts.get("given_name")
        self.permissions: Optional[str] = opts.get("permissions")
        self.soloist: Optional[str] = opts.get("soloist")
        self.solo_instrument: Optional[str] = opts.get("soloInstrument")
        self.explicit_permissions: Dict[str, Any] = opts.get(
            "explicitPermissions",
            {"edit": [], "view": [], "publicView": True},
        )

        self.meters: List[Meter] = []
        for m in opts.get("meters", []):
            if isinstance(m, Meter):
                self.meters.append(m)
            else:
                self.meters.append(Meter.from_json(m))

        ss_grid = opts.get("sectionStartsGrid")
        if ss_grid is None:
            ss = opts.get("sectionStarts", [0])
            ss_grid = [ss]
        for _ in range(len(ss_grid), len(self.instrumentation)):
            ss_grid.append([0])
        self.section_starts_grid: List[List[float]] = [sorted(list(s)) for s in ss_grid]

        sc_grid = opts.get("sectionCatGrid")
        if sc_grid is None:
            section_cat = opts.get("sectionCategorization")
            sc_grid = []
            for i, ss in enumerate(self.section_starts_grid):
                if i == 0:
                    if section_cat is not None:
                        for c in section_cat:
                            self.clean_up_section_categorization(c)
                        row = section_cat
                    else:
                        row = [init_sec_categorization() for _ in ss]
                else:
                    row = [init_sec_categorization() for _ in ss]
                sc_grid.append(row)
        self.section_cat_grid: List[List[SecCatType]] = sc_grid
        for i, ss in enumerate(self.section_starts_grid):
            while len(self.section_cat_grid) <= i:
                self.section_cat_grid.append([init_sec_categorization() for _ in ss])
            if len(self.section_cat_grid[i]) < len(ss):
                diff = len(ss) - len(self.section_cat_grid[i])
                for _ in range(diff):
                    self.section_cat_grid[i].append(init_sec_categorization())

        ad_hoc = opts.get("adHocSectionCatGrid")
        if ad_hoc is None:
            self.ad_hoc_section_cat_grid = [[[] for _ in row] for row in self.section_cat_grid]
        else:
            self.ad_hoc_section_cat_grid = [
                [ [f for f in fields if f != ""] for fields in track ]
                for track in ad_hoc
            ]
        while len(self.ad_hoc_section_cat_grid) < len(self.section_starts_grid):
            self.ad_hoc_section_cat_grid.append([[] for _ in self.ad_hoc_section_cat_grid[0]])

        self.excerpt_range = opts.get("excerptRange")
        self.assemblage_descriptors = opts.get("assemblageDescriptors", [])

        self.dur_tot: Optional[float] = opts.get("durTot")
        self.dur_array_grid: Optional[List[List[float]]] = opts.get("durArrayGrid")
        if self.dur_tot is None or self.dur_array_grid is None:
            self.dur_array_from_phrases()
        else:
            self.update_start_times()

    # ------------------------------------------------------------------
    @property
    def phrases(self) -> List[Phrase]:
        return self.phrase_grid[0]

    @phrases.setter
    def phrases(self, arr: List[Phrase]) -> None:
        self.phrase_grid[0] = arr

    @property
    def dur_array(self) -> List[float]:
        return self.dur_array_grid[0] if self.dur_array_grid else []

    @dur_array.setter
    def dur_array(self, arr: List[float]) -> None:
        if self.dur_array_grid is None:
            self.dur_array_grid = [arr]
        else:
            self.dur_array_grid[0] = arr

    @property
    def section_starts(self) -> List[float]:
        return self.section_starts_grid[0]

    @section_starts.setter
    def section_starts(self, arr: List[float]) -> None:
        self.section_starts_grid[0] = arr

    @property
    def section_categorization(self) -> List[SecCatType]:
        return self.section_cat_grid[0]

    @section_categorization.setter
    def section_categorization(self, arr: List[SecCatType]) -> None:
        self.section_cat_grid[0] = arr

    @property
    def assemblages(self) -> List["Assemblage"]:
        from .assemblage import Assemblage
        flat_phrases = [p for row in self.phrase_grid for p in row]
        return [Assemblage.from_descriptor(d, flat_phrases) for d in self.assemblage_descriptors]

    # ------------------------------------------------------------------
    def update_start_times(self) -> None:
        if not self.dur_array_grid or self.dur_tot is None:
            return
        for track, phrases in enumerate(self.phrase_grid):
            starts = [s * self.dur_tot for s in get_starts(self.dur_array_grid[track])]
            for p, st in zip(phrases, starts):
                p.start_time = st
                p.piece_idx = phrases.index(p)

    # ------------------------------------------------------------------
    def dur_tot_from_phrases(self) -> None:
        """Set ``durTot`` from contained phrases and pad shorter tracks."""
        totals = [sum(p.dur_tot for p in row) for row in self.phrase_grid]
        max_dur = max(totals) if totals else 0.0
        self.dur_tot = max_dur
        for i, total in enumerate(totals):
            if total != max_dur:
                extra = max_dur - total
                phrases = self.phrase_grid[i]
                silent = Trajectory({"id": 12, "dur_tot": extra})
                if phrases:
                    phrases[-1].trajectory_grid[0].append(silent)
                    phrases[-1].reset()
                else:
                    p = Phrase({"trajectories": [silent], "dur_tot": extra, "raga": self.raga})
                    phrases.append(p)
                    p.reset()

    def dur_array_from_phrases(self) -> None:
        """Recompute ``durArrayGrid`` removing NaN trajectories."""
        self.dur_tot_from_phrases()
        self.dur_array_grid = []
        if self.dur_tot == 0:
            self.dur_array_grid.append([])
            return
        for row in self.phrase_grid:
            arr = []
            for p in row:
                if p.dur_tot is None:
                    raise Exception("p.durTot is undefined")
                if math.isnan(p.dur_tot):
                    p.trajectory_grid[0] = [t for t in p.trajectories if not math.isnan(t.dur_tot)]
                    p.dur_tot_from_trajectories()
                arr.append(p.dur_tot / self.dur_tot)
            self.dur_array_grid.append(arr)
        self.update_start_times()

    # ------------------------------------------------------------------
    def set_dur_tot(self, dur_tot: float) -> None:
        if self.dur_tot is None:
            self.dur_tot_from_phrases()
        if self.dur_tot is None:
            self.dur_tot = dur_tot
            return
        if dur_tot < self.dur_tot:
            raise ValueError("cannot shorten duration")
        extra = dur_tot - self.dur_tot
        if extra > 0 and self.phrases:
            last_phrase = self.phrases[-1]
            if last_phrase.trajectories and last_phrase.trajectories[-1].id == 12:
                last_phrase.trajectories[-1].dur_tot += extra
            else:
                silent = Trajectory({"id": 12, "dur_tot": extra})
                last_phrase.trajectory_grid[0].append(silent)
            last_phrase.reset()
        self.dur_tot = dur_tot
        self.dur_array_from_phrases()

    def fill_remaining_duration(self, target_duration: float, track: int = 0) -> None:
        """Add a silent trajectory to fill the remaining duration to reach target_duration.
        
        Args:
            target_duration: The desired total duration for the piece
            track: Which instrument track to add the silence to (default: 0)
        """
        if self.dur_tot is None:
            self.dur_tot_from_phrases()
        
        current_duration = sum(p.dur_tot for p in self.phrase_grid[track])
        
        if target_duration <= current_duration:
            return  # Already at or exceeding target duration
            
        remaining = target_duration - current_duration
        
        # Create silent trajectory to fill the remaining duration
        silent_traj = Trajectory({
            'id': 12,
            'dur_tot': remaining,
            'fundID12': self.raga.fundamental
        })
        
        # Add as a new phrase or append to existing phrase
        if self.phrase_grid[track]:
            # Add to last phrase
            last_phrase = self.phrase_grid[track][-1]
            last_phrase.trajectory_grid[0].append(silent_traj)
            last_phrase.reset()
        else:
            # Create new phrase with silent trajectory
            silent_phrase = Phrase({
                'trajectories': [silent_traj],
                'dur_tot': remaining,
                'raga': self.raga
            })
            self.phrase_grid[track].append(silent_phrase)
        
        # Update piece-level durations
        self.dur_array_from_phrases()

    def realign_pitches(self) -> None:
        for phrases in self.phrase_grid:
            for p in phrases:
                p.realign_pitches()

    def update_fundamental(self, fundamental: float) -> None:
        self.raga.fundamental = fundamental
        for phrases in self.phrase_grid:
            for p in phrases:
                p.update_fundamental(fundamental)

    def put_raga_in_phrase(self) -> None:
        for phrases in self.phrase_grid:
            for p in phrases:
                p.raga = self.raga

    # ------------------------------------------------------------------
    @property
    def sections_grid(self) -> List[List["Section"]]:
        from .section import Section
        grid: List[List["Section"]] = []
        for i, starts in enumerate(self.section_starts_grid):
            sections: List["Section"] = []
            for j, s in enumerate(starts):
                if j == len(starts) - 1:
                    slice_phrases = self.phrase_grid[i][s:]
                else:
                    slice_phrases = self.phrase_grid[i][s:starts[j + 1]]
                sections.append(
                    Section(
                        {
                            "phrases": slice_phrases,
                            "categorization": self.section_cat_grid[i][j],
                            "ad_hoc_categorization": self.ad_hoc_section_cat_grid[i][j],
                        }
                    )
                )
            grid.append(sections)
        return grid

    @property
    def sections(self) -> List["Section"]:
        return self.sections_grid[0]

    def add_meter(self, meter: Meter) -> None:
        for m in self.meters:
            dur_m = m.cycle_dur
            dur_new = meter.cycle_dur
            c1 = m.start_time <= meter.start_time < m.start_time + dur_m
            c2 = m.start_time < meter.start_time + dur_new <= m.start_time + dur_m
            c3 = meter.start_time <= m.start_time and meter.start_time + dur_new >= m.start_time + dur_m
            if c1 or c2 or c3:
                raise ValueError("meters overlap")
        self.meters.append(meter)

    def remove_meter(self, meter: Meter) -> None:
        if meter in self.meters:
            self.meters.remove(meter)

    # ------------------------------------------------------------------
    def all_trajectories(self, inst: int = 0) -> List[Trajectory]:
        trajs: List[Trajectory] = []
        for p in self.phrase_grid[inst]:
            trajs.extend(p.trajectories)
        return trajs

    # ------------------------------------------------------------------
    def track_from_traj(self, traj: Trajectory) -> int:
        for i in range(len(self.instrumentation)):
            if traj in self.all_trajectories(i):
                return i
        raise ValueError("Trajectory not found")

    def track_from_traj_uid(self, traj_uid: str) -> int:
        for i in range(len(self.instrumentation)):
            for t in self.all_trajectories(i):
                if t.unique_id == traj_uid:
                    return i
        raise ValueError("Trajectory not found")

    def phrase_from_uid(self, uid: str) -> Phrase:
        for track in self.phrase_grid:
            for p in track:
                if p.unique_id == uid:
                    return p
        raise ValueError("Phrase not found")

    def track_from_phrase_uid(self, uid: str) -> int:
        for i, track in enumerate(self.phrase_grid):
            if any(p.unique_id == uid for p in track):
                return i
        raise ValueError("Phrase not found")

    def traj_from_uid(self, uid: str, track: int = 0) -> Trajectory:
        for t in self.all_trajectories(track):
            if t.unique_id == uid:
                return t
        raise ValueError("Trajectory not found")

    def traj_from_time(self, time: float, track: int = 0) -> Optional[Trajectory]:
        trajs = self.all_trajectories(track)
        if not trajs:
            return None
        starts = self.traj_start_times(track)
        end_times = [s + t.dur_tot for s, t in zip(starts, trajs)]
        idx = -1
        for i, s in enumerate(starts):
            if time >= s:
                idx = i
        if idx == -1:
            return trajs[0]
        if time < end_times[idx]:
            return trajs[idx]
        if idx + 1 < len(trajs):
            return trajs[idx + 1]
        return None

    def phrase_from_time(self, time: float, track: int = 0) -> Phrase:
        starts = self.dur_starts(track)
        idx = 0
        for i, s in enumerate(starts):
            if time >= s:
                idx = i
        return self.phrase_grid[track][idx]

    def phrase_idx_from_time(self, time: float, track: int = 0) -> int:
        starts = self.dur_starts(track)
        idx = 0
        for i, s in enumerate(starts):
            if time >= s:
                idx = i
        return idx

    def all_groups(self, instrument_idx: int = 0) -> List["Group"]:
        groups: List["Group"] = []
        for p in self.phrase_grid[instrument_idx]:
            for g_list in p.groups_grid:
                groups.extend(g_list)
        return groups

    def p_idx_from_group(self, g: "Group") -> int:
        for i, p in enumerate(self.phrase_grid[0]):
            for group_list in p.groups_grid:
                if g in group_list:
                    return i
        return -1

    def all_display_vowels(self, inst: int = 0) -> List[Any]:
        vocal = [Instrument.Vocal_M, Instrument.Vocal_F]
        if self.instrumentation[inst] not in vocal:
            raise Exception("instrumentation is not vocal")
        # placeholder minimal return
        return []

    def s_idx_from_p_idx(self, p_idx: int, inst: int = 0) -> int:
        ss = self.section_starts_grid[inst]
        s_idx = len(ss) - 1
        for i, s in enumerate(ss):
            if p_idx < s:
                s_idx = i - 1
                break
        if s_idx < 0:
            s_idx = 0
        return s_idx

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
        phrases = self.phrase_grid[inst_idx]
        for p in phrases:
            if p.chikaris:
                chikari = list(p.chikaris.values())[0]
                return [c.frequency for c in chikari.pitches[:2]]
        f = self.raga.fundamental
        return [f * 2, f * 4]

    # ------------------------------------------------------------------
    def dur_starts(self, track: int = 0) -> List[float]:
        if self.dur_array_grid is None:
            raise Exception("durArray is undefined")
        if self.dur_tot is None:
            raise Exception("durTot is undefined")
        return get_starts([d * self.dur_tot for d in self.dur_array_grid[track]])

    def traj_start_times(self, inst: int = 0) -> List[float]:
        trajs = self.all_trajectories(inst)
        times = [0.0]
        for t in trajs[:-1]:
            times.append(times[-1] + t.dur_tot)
        return times

    def all_pitches(self, repetition: bool = True, pitch_number: bool = False, track: int = 0) -> List[Any]:
        pitches: List[Any] = []
        for p in self.phrase_grid[track]:
            pitches.extend(p.all_pitches(True))
        if not repetition:
            out: List[Any] = []
            for i, pitch in enumerate(pitches):
                if isinstance(pitch, (int, float)):
                    raise ValueError("pitch is a number")
                if i == 0:
                    out.append(pitch)
                else:
                    prev = out[-1]
                    if isinstance(prev, (int, float)):
                        raise ValueError("lastP is a number")
                    if not (pitch.swara == prev.swara and pitch.oct == prev.oct and pitch.raised == prev.raised):
                        out.append(pitch)
            pitches = out
        if pitch_number:
            nums: List[Any] = []
            for p in pitches:
                if isinstance(p, (int, float)):
                    nums.append(p)
                else:
                    nums.append(p.numbered_pitch)
            return nums
        return pitches

    @property
    def highest_pitch_number(self) -> float:
        return max(self.all_pitches(pitch_number=True))

    @property
    def lowest_pitch_number(self) -> float:
        return min(self.all_pitches(pitch_number=True))

    def most_recent_traj(self, time: float, inst: int = 0) -> Trajectory:
        trajs = self.all_trajectories(inst)
        end_times: List[float] = []
        for t in trajs:
            phrase = next((p for p in self.phrase_grid[inst] if t in p.trajectories), None)
            if phrase is None:
                continue
            end_times.append((phrase.start_time or 0) + (t.start_time or 0) + t.dur_tot)
        latest = max([et for et in end_times if et <= time], default=-float("inf"))
        idx = end_times.index(latest)
        return trajs[idx]

    # ------------------------------------------------------------------
    def chunked_trajs(self, inst: int = 0, duration: float = 30) -> List[List[Trajectory]]:
        trajs = self.all_trajectories(inst)
        durs = [t.dur_tot for t in trajs]
        starts = get_starts(durs)
        ends = get_ends(durs)
        chunks: List[List[Trajectory]] = []
        if self.dur_tot is None:
            self.dur_tot_from_phrases()
        dur_tot = self.dur_tot or 0.0
        i = 0.0
        while i < dur_tot:
            def f1(st: float) -> bool:
                return st >= i and st < i + duration

            def f2(et: float) -> bool:
                return et > i and et <= i + duration

            def f3(st: float, et: float) -> bool:
                return st < i and et > i + duration

            chunk = [trajs[j] for j in range(len(trajs)) if f1(starts[j]) or f2(ends[j]) or f3(starts[j], ends[j])]
            chunks.append(chunk)
            i += duration
        return chunks

    def all_display_bols(self, inst: int = 0) -> List[Dict[str, Any]]:
        trajs = self.all_trajectories(inst)
        starts = self.traj_start_times(inst)
        idxs: List[int] = []
        bol_trajs: List[Trajectory] = []
        for idx, t in enumerate(trajs):
            art = t.articulations.get("0.00")
            if art and art.name == "pluck":
                idxs.append(idx)
                bol_trajs.append(t)
        bols = []
        for i, t in enumerate(bol_trajs):
            art = t.articulations["0.00"]
            bols.append({
                "time": starts[idxs[i]],
                "bol": getattr(art, "stroke_nickname", None),
                "uId": t.unique_id,
                "logFreq": t.log_freqs[0],
                "track": inst,
            })
        return bols

    def all_display_sargam(self, inst: int = 0) -> List[Dict[str, Any]]:
        trajs = self.all_trajectories(inst)
        starts = self.traj_start_times(inst)
        sargams: List[Dict[str, Any]] = []
        last_pitch: Dict[str, Optional[float]] = {"logFreq": None, "time": None}
        for i, t in enumerate(trajs):
            if t.id != 12:
                sub_durs = [d * t.dur_tot for d in (t.dur_array or [])]
                time_pts = get_starts(sub_durs)
                time_pts.append(t.dur_tot)
                time_pts = [tp + starts[i] for tp in time_pts]
                for tp_idx, tp in enumerate(time_pts):
                    log_freq = t.log_freqs[tp_idx] if tp_idx < len(t.log_freqs) else t.log_freqs[tp_idx - 1]
                    c_lf = last_pitch["logFreq"] == log_freq
                    c_t = last_pitch["time"] == tp
                    if not (c_lf or (c_lf and c_t)):
                        pitch = t.pitches[min(tp_idx, len(t.pitches)-1)]
                        sargams.append({
                            "logFreq": log_freq,
                            "sargam": pitch.sargam_letter,
                            "time": tp,
                            "uId": t.unique_id,
                            "track": inst,
                            "solfege": pitch.solfege_letter,
                            "pitchClass": str(pitch.chroma),
                            "westernPitch": pitch.western_pitch,
                        })
                    last_pitch = {"logFreq": log_freq, "time": tp}
        phrase_divs = [p.start_time + p.dur_tot for p in self.phrase_grid[inst]]
        pwr = 10 ** 5
        rounded_pds = [round(pd * pwr) / pwr for pd in phrase_divs]
        for s_idx, s in enumerate(sargams):
            pos = 1
            last_higher = True
            next_higher = True
            if s_idx != 0 and s_idx != len(sargams) - 1:
                last_s = sargams[s_idx - 1]
                next_s = sargams[s_idx + 1]
                last_higher = last_s["logFreq"] > s["logFreq"]
                next_higher = next_s["logFreq"] > s["logFreq"]
            if last_higher and next_higher:
                pos = 0
            elif not last_higher and not next_higher:
                pos = 1
            elif last_higher and not next_higher:
                pos = 3
            elif not last_higher and next_higher:
                pos = 2
            if round(s["time"] * pwr) / pwr in rounded_pds:
                pos = 5 if next_higher else 4
            s["pos"] = pos
        return sargams

    def all_phrase_divs(self, inst: int = 0) -> List[Dict[str, Any]]:
        objs: List[Dict[str, Any]] = []
        for p_idx, p in enumerate(self.phrase_grid[inst]):
            if p_idx != 0:
                objs.append({
                    "time": p.start_time,
                    "type": "section" if p_idx in self.section_starts_grid[inst] else "phrase",
                    "idx": p_idx,
                    "track": inst,
                    "uId": p.unique_id,
                })
        return objs

    def all_display_vowels(self, inst: int = 0) -> List[Dict[str, Any]]:
        vocal = [Instrument.Vocal_M, Instrument.Vocal_F]
        if self.instrumentation[inst] not in vocal:
            raise Exception("instrumentation is not vocal")
        display_vowels: List[Dict[str, Any]] = []
        for phrase in self.phrase_grid[inst]:
            first_idxs = phrase.first_traj_idxs()
            phrase_start = phrase.start_time or 0
            for t_idx in first_idxs:
                traj = phrase.trajectories[t_idx]
                time = phrase_start + (traj.start_time or 0)
                log_freq = traj.log_freqs[0]
                with_c = traj.start_consonant is not None
                art = traj.articulations.get("0.00") if with_c else None
                ipa_text = (art.ipa if art else "") + (traj.vowel_ipa or "")
                devanagari_text = (art.hindi if art else "") + (traj.vowel_hindi or "")
                english_text = (art.eng_trans if art else "") + (traj.vowel_eng_trans or "")
                display_vowels.append({
                    "time": time,
                    "logFreq": log_freq,
                    "ipaText": ipa_text,
                    "devanagariText": devanagari_text,
                    "englishText": english_text,
                    "uId": traj.unique_id,
                })
        return display_vowels

    def all_display_ending_consonants(self, inst: int = 0) -> List[Dict[str, Any]]:
        display: List[Dict[str, Any]] = []
        trajs = self.all_trajectories(inst)
        for t in trajs:
            if t.end_consonant is not None:
                phrase = next((p for p in self.phrase_grid[inst] if t in p.trajectories), None)
                phrase_start = phrase.start_time if phrase else 0
                time = phrase_start + (t.start_time or 0) + t.dur_tot
                log_freq = t.log_freqs[-1]
                art = t.articulations.get("1.00")
                display.append({
                    "time": time,
                    "logFreq": log_freq,
                    "ipaText": art.ipa if art else None,
                    "devanagariText": art.hindi if art else None,
                    "englishText": art.eng_trans if art else None,
                    "uId": t.unique_id,
                })
        return display

    def all_display_chikaris(self, inst: int = 0) -> List[Dict[str, Any]]:
        display: List[Dict[str, Any]] = []
        for p in self.phrase_grid[inst]:
            for k, chikari in p.chikaris.items():
                time = p.start_time + float(k)
                display.append({
                    "time": time,
                    "phraseTimeKey": k,
                    "phraseIdx": p.piece_idx,
                    "track": inst,
                    "chikari": chikari,
                    "uId": chikari.unique_id,
                })
        return display

    def chunked_display_chikaris(self, inst: int = 0, duration: float = 30) -> List[List[Dict[str, Any]]]:
        display = self.all_display_chikaris(inst)
        chunks: List[List[Dict[str, Any]]] = []
        dur_tot = self.dur_tot or 0.0
        i = 0.0
        while i < dur_tot:
            chunk = [c for c in display if c["time"] >= i and c["time"] < i + duration]
            chunks.append(chunk)
            i += duration
        return chunks

    def chunked_display_consonants(self, inst: int = 0, duration: float = 30) -> List[List[Dict[str, Any]]]:
        display = self.all_display_ending_consonants(inst)
        chunks: List[List[Dict[str, Any]]] = []
        dur_tot = self.dur_tot or 0.0
        i = 0.0
        while i < dur_tot:
            chunk = [c for c in display if c["time"] >= i and c["time"] < i + duration]
            chunks.append(chunk)
            i += duration
        return chunks

    def chunked_display_vowels(self, inst: int = 0, duration: float = 30) -> List[List[Dict[str, Any]]]:
        display = self.all_display_vowels(inst)
        chunks: List[List[Dict[str, Any]]] = []
        dur_tot = self.dur_tot or 0.0
        i = 0.0
        while i < dur_tot:
            chunk = [v for v in display if v["time"] >= i and v["time"] < i + duration]
            chunks.append(chunk)
            i += duration
        return chunks

    def chunked_display_sargam(self, inst: int = 0, duration: float = 30) -> List[List[Dict[str, Any]]]:
        display = self.all_display_sargam(inst)
        chunks: List[List[Dict[str, Any]]] = []
        dur_tot = self.dur_tot or 0.0
        i = 0.0
        while i < dur_tot:
            chunk = [s for s in display if s["time"] >= i and s["time"] < i + duration]
            chunks.append(chunk)
            i += duration
        return chunks

    def chunked_display_bols(self, inst: int = 0, duration: float = 30) -> List[List[Dict[str, Any]]]:
        display = self.all_display_bols(inst)
        chunks: List[List[Dict[str, Any]]] = []
        dur_tot = self.dur_tot or 0.0
        i = 0.0
        while i < dur_tot:
            chunk = [b for b in display if b["time"] >= i and b["time"] < i + duration]
            chunks.append(chunk)
            i += duration
        return chunks

    def chunked_phrase_divs(self, inst: int = 0, duration: float = 30) -> List[List[Dict[str, Any]]]:
        phrase_divs = self.all_phrase_divs(inst)
        chunks: List[List[Dict[str, Any]]] = []
        dur_tot = self.dur_tot or 0.0
        i = 0.0
        while i < dur_tot:
            chunk = [pd for pd in phrase_divs if pd["time"] >= i and pd["time"] < i + duration]
            chunks.append(chunk)
            i += duration
        return chunks

    def chunked_meters(self, duration: float = 30) -> List[List[Meter]]:
        chunks: List[List[Meter]] = []
        dur_tot = self.dur_tot or 0.0
        i = 0.0
        while i < dur_tot:
            chunk = [m for m in self.meters if m.start_time >= i and m.start_time < i + duration]
            chunks.append(chunk)
            i += duration
        return chunks

    def pulse_from_id(self, id: str):
        all_pulses = [p for m in self.meters for p in m.all_pulses]
        for pulse in all_pulses:
            if pulse.unique_id == id:
                return pulse
        return None

    # ------------------------------------------------------------------
    def clean_up_section_categorization(self, c: SecCatType) -> None:
        if "Improvisation" not in c:
            c["Improvisation"] = {"Improvisation": False}
        if "Other" not in c:
            c["Other"] = {"Other": False}
        if "Comp.-section/Tempo" not in c and "Composition-section/Tempo" in c:
            c["Comp.-section/Tempo"] = c["Composition-section/Tempo"]
            del c["Composition-section/Tempo"]
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
        data: Dict[str, Any] = {
            "raga": self.raga.to_json(),
            "phraseGrid": [[p.to_json() for p in row] for row in self.phrase_grid],
            "instrumentation": [i.value if isinstance(i, Instrument) else i for i in self.instrumentation],
            "durTot": self.dur_tot,
            "durArrayGrid": self.dur_array_grid,
            "meters": [m.to_json() for m in self.meters],
            "title": self.title,
            "dateCreated": self.date_created.isoformat(),
            "dateModified": self.date_modified.isoformat(),
            "location": self.location,
            "_id": self._id,
            "audioID": self.audio_id,
            "userID": self.user_id,
            "permissions": self.permissions,
            "name": self.name,
            "family_name": self.family_name,
            "given_name": self.given_name,
            "sectionStartsGrid": self.section_starts_grid,
            "sectionCatGrid": self.section_cat_grid,
            "explicitPermissions": self.explicit_permissions,
            "soloist": self.soloist,
            "soloInstrument": self.solo_instrument,
            "excerptRange": self.excerpt_range,
            "adHocSectionCatGrid": self.ad_hoc_section_cat_grid,
            "assemblageDescriptors": self.assemblage_descriptors,
        }
        # drop None values so they serialize as undefined (omitted) rather than null
        return {k: v for k, v in data.items() if v is not None}

    @staticmethod
    def from_json(obj: Dict[str, Any]) -> "Piece":
        new_obj = dict(obj)
        if "raga" in new_obj:
            new_obj["raga"] = Raga.from_json(new_obj["raga"])
        if "phraseGrid" in new_obj:
            pg = []
            for row in new_obj["phraseGrid"]:
                phrase_row = [Phrase.from_json(p) for p in row]
                pg.append(phrase_row)
            # reconstruct groups so they reference existing trajectories
            for row in pg:
                for phrase in row:
                    new_groups: List[List[Group]] = []
                    for g_list in phrase.groups_grid:
                        rebuilt: List[Group] = []
                        for g in g_list:
                            data = g if isinstance(g, dict) else g.to_json()
                            trajs = []
                            for t in data.get("trajectories", []):
                                traj = t if isinstance(t, Trajectory) else Trajectory.from_json(t)
                                num = traj.num
                                if num is None or num >= len(phrase.trajectory_grid[0]):
                                    continue
                                real_traj = phrase.trajectory_grid[0][num]
                                art = real_traj.articulations.get("0.00") or real_traj.articulations.get("0")
                                if art and art.name == "slide":
                                    art.name = "pluck"
                                trajs.append(real_traj)
                            rebuilt.append(Group({"trajectories": trajs, "id": data.get("id")}))
                        new_groups.append(rebuilt)
                    phrase.groups_grid = new_groups
            new_obj["phraseGrid"] = pg
        if "meters" in new_obj:
            new_obj["meters"] = [Meter.from_json(m) for m in new_obj["meters"]]
        if "dateCreated" in new_obj:
            dc = new_obj["dateCreated"]
            if isinstance(dc, dict) and "$date" in dc:
                dc = dc["$date"]
            new_obj["dateCreated"] = datetime.fromisoformat(str(dc).replace('Z',''))
        if "dateModified" in new_obj:
            dm = new_obj["dateModified"]
            if isinstance(dm, dict) and "$date" in dm:
                dm = dm["$date"]
            new_obj["dateModified"] = datetime.fromisoformat(str(dm).replace('Z',''))

        piece = Piece(new_obj)

        # reconnect groups to actual trajectories
        for phrases in piece.phrase_grid:
            for phrase in phrases:
                new_group_grid: List[List[Group]] = []
                for group_list in phrase.groups_grid:
                    rebuilt: List[Group] = []
                    for g in group_list:
                        if not isinstance(g, Group):
                            g = Group.from_json(g)
                        new_trajs: List[Trajectory] = []
                        for t in g.trajectories:
                            if t.num is None:
                                raise Exception("traj.num is undefined")
                            new_trajs.append(phrase.trajectory_grid[0][t.num])
                        rebuilt.append(Group({"trajectories": new_trajs, "id": g.id}))
                    new_group_grid.append(rebuilt)
                phrase.groups_grid = new_group_grid

                for traj in phrase.trajectories:
                    art = traj.articulations.get("0.00")
                    if art and art.name == "slide":
                        art.name = "pluck"
                phrase.consolidate_silent_trajs()

        piece.dur_array_from_phrases()
        piece.section_starts_grid = [sorted(set(arr)) for arr in piece.section_starts_grid]

        return piece
