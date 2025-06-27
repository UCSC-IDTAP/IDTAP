from typing import List, Optional, TypedDict
import humps
from .pitch import Pitch

class TrajectoryOptionsType(TypedDict, total=False):
    id: int
    pitches: List[Pitch]
    dur_array: List[float]

class Trajectory:
    def __init__(self, options: Optional[TrajectoryOptionsType] = None):
        if options is None:
            options = {}
        else:
            options = humps.decamelize(options)
        self.id = options.get('id', 0)
        self.pitches: List[Pitch] = options.get('pitches', [])
        self.dur_array: Optional[List[float]] = options.get('dur_array')
        self.log_freqs = [p.log_freq for p in self.pitches]
        if self.id == 6 and self.dur_array is None and len(self.pitches) >= 2:
            self.dur_array = [1/(len(self.pitches)-1)] * (len(self.pitches)-1)

    def id1(self, x: float, log_freqs: Optional[List[float]] = None) -> float:
        if log_freqs is None:
            log_freqs = self.log_freqs[:2]
        start, end = log_freqs[0], log_freqs[1]
        lf = start + (end - start) * x
        return 2 ** lf

    def id6(self, x: float, lf: Optional[List[float]] = None, da: Optional[List[float]] = None) -> float:
        log_freqs = self.log_freqs if lf is None else lf
        dur_array = self.dur_array if da is None else da
        if dur_array is None:
            dur_array = [1/(len(log_freqs)-1)] * (len(log_freqs)-1)
        starts = [0]
        for d in dur_array[:-1]:
            starts.append(starts[-1] + d)
        index = -1
        for i, s in enumerate(starts):
            if x >= s:
                index = i
        if index == -1 or index >= len(log_freqs)-1:
            print('invalid x', x, 'index', index)
            raise ValueError('x out of bounds')
        inner_x = (x - starts[index]) / dur_array[index]
        return self.id1(inner_x, log_freqs[index:index+2])
