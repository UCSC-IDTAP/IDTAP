from __future__ import annotations
from typing import List, Optional
import math

from .phrase import Phrase
from .trajectory import Trajectory
from .raga import Raga
from enum import Enum

class Instrument(Enum):
    Sitar = "Sitar"

class Piece:
    def __init__(self,
                 phraseGrid: Optional[List[List[Phrase]]] = None,
                 instrumentation: Optional[List[Instrument]] = None,
                 raga: Optional[Raga] = None):
        self.instrumentation = instrumentation or [Instrument.Sitar]
        self.raga = raga or Raga()
        if phraseGrid is not None:
            self.phraseGrid = phraseGrid
        else:
            self.phraseGrid = [[] for _ in self.instrumentation]
        self.durTot: Optional[float] = None
        self.durArrayGrid: List[List[float]] = [[] for _ in self.instrumentation]

    def durTotFromPhrases(self) -> None:
        durTots = []
        for phrases in self.phraseGrid:
            durTot = sum(p.durTot for p in phrases)
            durTots.append(durTot)
        maxDurTot = max(durTots) if durTots else 0
        self.durTot = maxDurTot
        for idx, d in enumerate(durTots):
            if d != maxDurTot:
                extra = maxDurTot - d
                extra_silent = Trajectory(id=12, durTot=extra)
                if len(self.phraseGrid[idx]) == 0:
                    phr = Phrase(trajectories=[extra_silent], durTot=extra, raga=self.raga)
                    self.phraseGrid[idx].append(phr)
                    phr.reset()
                else:
                    lastPhrase = self.phraseGrid[idx][-1]
                    lastPhrase.trajectories.append(extra_silent)
                    lastPhrase.reset()

    def durArrayFromPhrases(self) -> None:
        self.durTotFromPhrases()
        for idx, phrases in enumerate(self.phraseGrid):
            arr = []
            for p in phrases:
                if p.durTot is None:
                    raise ValueError('p.durTot is undefined')
                elif math.isnan(p.durTot):
                    removes = [t for t in p.trajectories if math.isnan(t.durTot)]
                    for r in removes:
                        p.trajectories.remove(r)
                    p.durTot = sum(t.durTot for t in p.trajectories)
                arr.append(p.durTot / self.durTot if self.durTot else 0)
            self.durArrayGrid[idx] = arr
