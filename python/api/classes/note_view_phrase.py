from typing import Optional, TypedDict, List


from .pitch import Pitch
from .raga import Raga

class NoteViewPhraseOptions(TypedDict, total=False):
    pitches: List[Pitch]
    dur_tot: float
    raga: Raga
    start_time: float

class NoteViewPhrase:
    def __init__(self, options: Optional[NoteViewPhraseOptions] = None):
        if options is None:
            options = {}
        else:
            # handle camelCase keys without relying on external libraries
            new_options = {}
            for k, v in options.items():
                snake = []
                for ch in k:
                    if ch.isupper():
                        snake.append('_')
                        snake.append(ch.lower())
                    else:
                        snake.append(ch)
                new_options[''.join(snake)] = v
            options = new_options
        self.pitches: List[Pitch] = options.get('pitches', [])
        self.dur_tot: Optional[float] = options.get('dur_tot')
        self.raga: Optional[Raga] = options.get('raga')
        self.start_time: Optional[float] = options.get('start_time')
