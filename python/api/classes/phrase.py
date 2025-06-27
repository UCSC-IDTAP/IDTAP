from __future__ import annotations
from typing import List, Optional

from .trajectory import Trajectory

class Phrase:
    def __init__(self, options: Optional[dict] = None) -> None:
        opts = options or {}
        self.trajectories: List[Trajectory] = opts.get('trajectories', [])
        self.start_time: Optional[float] = opts.get('start_time')
        self.dur_array = opts.get('dur_array')
        self.dur_tot = opts.get('dur_tot')
        self.raga = opts.get('raga')

    def assign_traj_nums(self) -> None:
        for i, t in enumerate(self.trajectories):
            t.num = i

    @property
    def swara(self):
        if self.start_time is None:
            raise Exception('startTime is undefined')
        out = []
        for traj in self.trajectories:
            if traj.id != 12:
                if traj.dur_array is None:
                    raise Exception('traj.durArray is undefined')
                if traj.start_time is None:
                    raise Exception('traj.startTime is undefined')
        return out
