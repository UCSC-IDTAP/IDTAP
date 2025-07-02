from __future__ import annotations
from typing import List, Optional, Dict, Any

from .pitch import Pitch
from .raga import Raga


class NoteViewPhrase:
    def __init__(self, options: Optional[Dict[str, Any]] = None) -> None:
        opts = options or {}
        self.pitches: List[Pitch] = opts.get('pitches', [])
        self.dur_tot: Optional[float] = opts.get('dur_tot')
        self.raga: Optional[Raga] = opts.get('raga')
        self.start_time: Optional[float] = opts.get('start_time')
