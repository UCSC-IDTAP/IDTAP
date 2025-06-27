from __future__ import annotations
from typing import List, Optional
from .trajectory import Trajectory

class Phrase:
    def __init__(self, trajectories: Optional[List[Trajectory]] = None, raga=None, durTot: Optional[float] = None):
        self.trajectories: List[Trajectory] = trajectories or []
        self.raga = raga
        self.durTot = durTot
        self.durArray: List[float] = []
        if self.trajectories:
            self.durTotFromTrajectories()
            self.durArrayFromTrajectories()
        else:
            if self.durTot is None:
                self.durTot = 1

    def durTotFromTrajectories(self) -> None:
        self.durTot = sum(t.durTot for t in self.trajectories)

    def durArrayFromTrajectories(self) -> None:
        self.durTotFromTrajectories()
        if self.durTot == 0:
            self.durArray = [0 for _ in self.trajectories]
        else:
            self.durArray = [t.durTot / self.durTot for t in self.trajectories]

    def reset(self) -> None:
        self.durArrayFromTrajectories()
