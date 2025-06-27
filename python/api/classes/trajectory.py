from typing import Optional, TypedDict, List
import humps
import math
from .pitch import Pitch

class TrajectoryOptionsType(TypedDict, total=False):
    id: int
    pitches: List[Pitch]
    dur_tot: float
    dur_array: List[float]

class Trajectory:
    def __init__(self, options: Optional[TrajectoryOptionsType] = None):
        if options is None:
            options = {}
        else:
            options = humps.decamelize(options)

        self.id = options.get('id', 0)
        self.pitches: List[Pitch] = options.get('pitches', [Pitch()])
        self.dur_tot = options.get('dur_tot', 1.0)
        self.dur_array = options.get('dur_array')
        if self.dur_array is None:
            self.dur_array = [1 / len(self.pitches)] * len(self.pitches)

        idx = 0
        while idx < len(self.dur_array):
            if self.dur_array[idx] == 0:
                self.dur_array.pop(idx)
                if idx + 1 < len(self.pitches):
                    self.pitches.pop(idx + 1)
            else:
                idx += 1

        self.freqs = [p.frequency for p in self.pitches]
        self.log_freqs = [math.log2(p.frequency) for p in self.pitches]
