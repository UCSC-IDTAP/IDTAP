from __future__ import annotations
from typing import List, Dict, Optional
from uuid import uuid4


def find_closest_idxs(trials: List[float], items: List[float]) -> List[int]:
    """Return indexes of items closest to each trial (greedy)."""
    used: set[int] = set()
    out: List[int] = []
    for trial in trials:
        diffs = [(abs(trial - item), idx) for idx, item in enumerate(items)
                 if idx not in used]
        diffs.sort(key=lambda x: x[0])
        if not diffs:
            raise ValueError("not enough items to match trials")
        used.add(diffs[0][1])
        out.append(diffs[0][1])
    return out


class Pulse:
    def __init__(self, real_time: float = 0.0, unique_id: Optional[str] = None,
                 affiliations: Optional[List[Dict]] = None,
                 meter_id: Optional[str] = None,
                 corporeal: bool = True) -> None:
        self.real_time = real_time
        self.unique_id = unique_id or str(uuid4())
        self.affiliations: List[Dict] = affiliations or []
        self.meter_id = meter_id
        self.corporeal = corporeal

    @staticmethod
    def from_json(obj: Dict) -> 'Pulse':
        return Pulse(
            real_time=obj.get('realTime', 0.0),
            unique_id=obj.get('uniqueId'),
            affiliations=obj.get('affiliations'),
            meter_id=obj.get('meterId'),
            corporeal=obj.get('corporeal', True),
        )

    def to_json(self) -> Dict:
        return {
            'realTime': self.real_time,
            'uniqueId': self.unique_id,
            'affiliations': self.affiliations,
            'meterId': self.meter_id,
            'corporeal': self.corporeal,
        }

    def __eq__(self, other: object) -> bool:
        return isinstance(other, Pulse) and self.to_json() == other.to_json()


class PulseStructure:
    def __init__(self, tempo: float = 60.0, size: int = 4,
                 start_time: float = 0.0, unique_id: Optional[str] = None,
                 front_weighted: bool = True, layer: Optional[int] = None,
                 parent_pulse_id: Optional[str] = None,
                 primary: bool = True, segmented_meter_idx: int = 0,
                 meter_id: Optional[str] = None,
                 pulses: Optional[List[Pulse | Dict]] = None) -> None:
        self.tempo = tempo
        self.pulse_dur = 60.0 / tempo
        self.size = size
        self.start_time = start_time
        self.unique_id = unique_id or str(uuid4())
        self.front_weighted = front_weighted
        self.layer = layer
        self.parent_pulse_id = parent_pulse_id
        self.primary = primary
        self.segmented_meter_idx = segmented_meter_idx
        self.meter_id = meter_id

        if pulses is not None:
            self.pulses = [p if isinstance(p, Pulse) else Pulse.from_json(p)
                           for p in pulses]
        else:
            self.pulses = [
                Pulse(
                    real_time=start_time + i * self.pulse_dur,
                    affiliations=[{
                        'psId': self.unique_id,
                        'idx': i,
                        'layer': self.layer,
                        'segmentedMeterIdx': self.segmented_meter_idx,
                        'strong': (i == 0) if front_weighted else (i == size - 1),
                    }],
                    meter_id=meter_id
                ) for i in range(size)
            ]

    @property
    def dur_tot(self) -> float:
        return self.size * self.pulse_dur

    def set_tempo(self, new_tempo: float) -> None:
        self.tempo = new_tempo
        self.pulse_dur = 60.0 / new_tempo
        for i, pulse in enumerate(self.pulses):
            pulse.real_time = self.start_time + i * self.pulse_dur

    def set_start_time(self, new_start: float) -> None:
        diff = new_start - self.start_time
        self.start_time = new_start
        for pulse in self.pulses:
            pulse.real_time += diff

    @staticmethod
    def from_pulse(pulse: Pulse, duration: float, size: int,
                   front_weighted: bool = True, layer: int = 0) -> 'PulseStructure':
        tempo = 60 * size / duration
        ps = PulseStructure(tempo=tempo, size=size, start_time=pulse.real_time,
                            front_weighted=front_weighted, layer=layer,
                            parent_pulse_id=pulse.unique_id, meter_id=pulse.meter_id)
        idx = 0 if front_weighted else ps.size - 1
        pulse.affiliations.append({
            'psId': ps.unique_id,
            'idx': idx,
            'layer': layer,
            'segmentedMeterIdx': 0,
            'strong': True,
        })
        ps.pulses[idx] = pulse
        return ps

    def to_json(self) -> Dict:
        return {
            'pulses': [p.to_json() for p in self.pulses],
            'tempo': self.tempo,
            'pulseDur': self.pulse_dur,
            'size': self.size,
            'startTime': self.start_time,
            'uniqueId': self.unique_id,
            'frontWeighted': self.front_weighted,
            'layer': self.layer,
            'parentPulseID': self.parent_pulse_id,
            'primary': self.primary,
            'segmentedMeterIdx': self.segmented_meter_idx,
            'meterId': self.meter_id,
            'offsets': [0.0] * self.size,
        }

    @staticmethod
    def from_json(obj: Dict) -> 'PulseStructure':
        return PulseStructure(
            tempo=obj.get('tempo', 60.0),
            size=obj.get('size', 4),
            start_time=obj.get('startTime', 0.0),
            unique_id=obj.get('uniqueId'),
            front_weighted=obj.get('frontWeighted', True),
            layer=obj.get('layer'),
            parent_pulse_id=obj.get('parentPulseID'),
            primary=obj.get('primary', True),
            segmented_meter_idx=obj.get('segmentedMeterIdx', 0),
            meter_id=obj.get('meterId'),
            pulses=[Pulse.from_json(p) for p in obj.get('pulses', [])]
        )

    def __eq__(self, other: object) -> bool:
        return isinstance(other, PulseStructure) and self.to_json() == other.to_json()


class Meter:
    def __init__(self, hierarchy: Optional[List[int | List[int]]] = None,
                 start_time: float = 0.0, tempo: float = 60.0,
                 unique_id: Optional[str] = None, repetitions: int = 1) -> None:
        self.hierarchy = hierarchy or [4, 4]
        self.start_time = start_time
        self.tempo = tempo
        self.unique_id = unique_id or str(uuid4())
        self.repetitions = repetitions
        self.pulse_structures: List[List[PulseStructure]] = []
        self._generate_pulse_structures()

    # helper values
    @property
    def _top_size(self) -> int:
        h0 = self.hierarchy[0]
        return sum(h0) if isinstance(h0, list) else int(h0)

    @property
    def _bottom_mult(self) -> int:
        mult = 1
        for h in self.hierarchy[1:]:
            mult *= int(h)
        return mult

    @property
    def _pulses_per_cycle(self) -> int:
        return self._top_size * self._bottom_mult

    @property
    def _pulse_dur(self) -> float:
        return 60.0 / self.tempo / self._bottom_mult

    @property
    def cycle_dur(self) -> float:
        return self._pulse_dur * self._pulses_per_cycle

    def _generate_pulse_structures(self) -> None:
        self.pulse_structures = [[]]
        # single layer of pulses for simplified implementation
        pulses: List[Pulse] = []
        for rep in range(self.repetitions):
            start = self.start_time + rep * self.cycle_dur
            for i in range(self._pulses_per_cycle):
                pulses.append(Pulse(real_time=start + i * self._pulse_dur,
                                    meter_id=self.unique_id))
        self.pulse_structures[0] = [PulseStructure(
            tempo=self.tempo,
            size=self._pulses_per_cycle,
            start_time=self.start_time,
            meter_id=self.unique_id,
            pulses=pulses,
        )]

    @property
    def all_pulses(self) -> List[Pulse]:
        return self.pulse_structures[-1][0].pulses

    @property
    def real_times(self) -> List[float]:
        return [p.real_time for p in self.all_pulses]

    def offset_pulse(self, pulse: Pulse, offset: float) -> None:
        pulse.real_time += offset

    def reset_tempo(self) -> None:
        base = self.all_pulses[:self._pulses_per_cycle]
        diff = base[-1].real_time - base[0].real_time
        if len(base) > 1:
            bit = diff / (len(base) - 1)
            if bit > 0:
                self.tempo = 60.0 / (bit * self._bottom_mult)
        # pulse duration will be derived from tempo

    def grow_cycle(self) -> None:
        self.reset_tempo()
        start = self.start_time + self.repetitions * self.cycle_dur
        for i in range(self._pulses_per_cycle):
            new_pulse = Pulse(real_time=start + i * self._pulse_dur,
                              meter_id=self.unique_id)
            self.pulse_structures[0][0].pulses.append(new_pulse)
        self.repetitions += 1

    def add_time_points(self, time_points: List[float], layer: int = 1) -> None:
        time_points = sorted(time_points)
        for tp in time_points:
            self.pulse_structures[0][0].pulses.append(Pulse(real_time=tp,
                                                            meter_id=self.unique_id))
        self.pulse_structures[0][0].pulses.sort(key=lambda p: p.real_time)

    @staticmethod
    def from_json(obj: Dict) -> 'Meter':
        m = Meter(hierarchy=obj.get('hierarchy'),
                  start_time=obj.get('startTime', 0.0),
                  tempo=obj.get('tempo', 60.0),
                  unique_id=obj.get('uniqueId'),
                  repetitions=obj.get('repetitions', 1))
        m.pulse_structures = [
            [PulseStructure.from_json(ps) for ps in layer]
            for layer in obj.get('pulseStructures', [])
        ]
        return m

    def to_json(self) -> Dict:
        return {
            'uniqueId': self.unique_id,
            'hierarchy': self.hierarchy,
            'startTime': self.start_time,
            'tempo': self.tempo,
            'repetitions': self.repetitions,
            'pulseStructures': [[ps.to_json() for ps in layer]
                                for layer in self.pulse_structures]
        }

    def __eq__(self, other: object) -> bool:
        return isinstance(other, Meter) and self.to_json() == other.to_json()
