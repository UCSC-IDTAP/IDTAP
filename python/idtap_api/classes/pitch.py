from typing import List, Dict, TypedDict, Optional, Union
try:
    import humps
    decamelize = humps.decamelize  # type: ignore
except Exception:  # fallback if humps is missing or has no decamelize
    import re

    def decamelize(obj):
        if isinstance(obj, dict):
            out = {}
            for k, v in obj.items():
                s = re.sub(r'(?<!^)(?=[A-Z])', '_', k).lower()
                out[s] = decamelize(v) if isinstance(v, dict) else v
            return out
        return obj
import math

# this should all be implemented in snake_case, even though the TypeScript 
# version is in camelCase

class PitchOptionsType(TypedDict, total=False):
    swara: str | int
    oct: int
    raised: bool
    fundamental: float
    ratios: list[float | list[float]]
    log_offset: float

class Pitch:

    def __init__(self, options: Optional[PitchOptionsType] = None):
        if options is None:
            options = {}
        else:
            # convert camelCase incoming keys to snake_case
            options = decamelize(options)

        self.log_offset = options.get('log_offset', 0.0)

        self.sargam = ['sa', 're', 'ga', 'ma', 'pa', 'dha', 'ni']
        self.sargam_letters = [s[0] for s in self.sargam]

        ratios_default = [
            1,
            [2 ** (1 / 12), 2 ** (2 / 12)],
            [2 ** (3 / 12), 2 ** (4 / 12)],
            [2 ** (5 / 12), 2 ** (6 / 12)],
            2 ** (7 / 12),
            [2 ** (8 / 12), 2 ** (9 / 12)],
            [2 ** (10 / 12), 2 ** (11 / 12)]
        ]

        self.ratios = options.get('ratios', ratios_default)

        # validate ratios for undefined values (None)
        for r in self.ratios:
            if isinstance(r, list):
                for sub in r:
                    if sub is None:
                        raise SyntaxError(f"invalid ratio type, must be float: {sub}")
            else:
                if r is None:
                    raise SyntaxError(f"invalid ratio type, must be float: {r}")

        raised = options.get('raised', True)
        if not isinstance(raised, bool):
            raise SyntaxError(f"invalid raised type, must be boolean: {raised}")
        self.raised = raised

        swara = options.get('swara', 'sa')
        if isinstance(swara, str):
            swara = swara.lower()
            if len(swara) > 1:
                if swara not in self.sargam:
                    raise SyntaxError(f"invalid swara string: \"{swara}\"")
                self.swara = self.sargam.index(swara)
            elif len(swara) == 1:
                if swara not in self.sargam_letters:
                    raise SyntaxError(f"invalid swara string: \"{swara}\"")
                self.swara = self.sargam_letters.index(swara)
        elif isinstance(swara, int):
            if swara < 0 or swara > len(self.sargam) - 1:
                raise SyntaxError(f"invalid swara number: {swara}")
            self.swara = swara
        else:
            raise SyntaxError(f"invalad swara type: {swara}, {type(swara)}")

        if not isinstance(self.swara, int):
            raise SyntaxError(f"invalid swara type: {self.swara}")

        octv = options.get('oct', 0)
        if not isinstance(octv, int):
            raise SyntaxError(f"invalid oct type: {octv}")
        self.oct = octv

        fundamental = options.get('fundamental', 261.63)
        if not isinstance(fundamental, (int, float)):
            raise SyntaxError(f"invalid fundamental type, must be float: {fundamental}")
        self.fundamental = float(fundamental)

        # raised override for sa and pa
        if self.swara in (0, 4):
            self.raised = True
    
    def __eq__(self, other):
      if not isinstance(other, Pitch):
        return False
      else:
        return (self.swara == other.swara and
                self.raised == other.raised and
                self.oct == other.oct
                )

    @property
    def frequency(self):
        if not isinstance(self.swara, int):
            raise SyntaxError(f"wrong swara type, must be number: {self.swara}")
        if self.swara in (0, 4):
            ratio = self.ratios[self.swara]
            if not isinstance(ratio, (int, float)):
                raise SyntaxError(f"invalid ratio type, must be float: {ratio}")
        else:
            nested = self.ratios[self.swara]
            if not isinstance(nested, list):
                raise SyntaxError(
                    f"invalid nestedRatios type, must be array: {nested}")
            ratio = nested[int(self.raised)]
            if not isinstance(ratio, (int, float)):
                raise SyntaxError(f"invalid ratio type, must be float: {ratio}")
        return self.fundamental * ratio * (2 ** self.oct) * (2 ** self.log_offset)

    @property
    def non_offset_frequency(self):
        if not isinstance(self.swara, int):
            raise SyntaxError(f"wrong swara type, must be number: {self.swara}")
        if self.swara in (0, 4):
            ratio = self.ratios[self.swara]
            if not isinstance(ratio, (int, float)):
                raise SyntaxError(f"invalid ratio type, must be float: {ratio}")
        else:
            nested = self.ratios[self.swara]
            if not isinstance(nested, list):
                raise SyntaxError(
                    f"invalid nestedRatios type, must be array: {nested}")
            ratio = nested[int(self.raised)]
            if not isinstance(ratio, (int, float)):
                raise SyntaxError(f"invalid ratio type, must be float: {ratio}")
        return self.fundamental * ratio * (2 ** self.oct)
    
    @property
    def non_offset_log_freq(self):
        return math.log2(self.non_offset_frequency)

    @property
    def log_freq(self):
        return math.log2(self.frequency)

    @property
    def sargam_letter(self):
        sargam = ['sa', 're', 'ga', 'ma', 'pa', 'dha', 'ni']
        s = sargam[int(self.swara)][0]
        if self.swara == 0 or self.swara == 4:
            # raised override
            self.raised = True
        if self.raised:
            s = s.upper()  # Ensure the first letter is capitalized
        return s

    @property
    def octaved_sargam_letter(self):
        s = self.sargam_letter
        if (self.oct == -2):
            s = s + '\u0324'
        elif (self.oct == -1):
            s = s + '\u0323'
        elif (self.oct == 1):
            s = s + '\u0307'
        elif (self.oct == 2):
            s = s + '\u0308'
        return s

    @property
    def numbered_pitch(self):
        # something like a midi pitch, but centered on 0 instead of 60
        if not isinstance(self.swara, int):
            raise SyntaxError(f"invalid swara: {self.swara}")
        if self.swara < 0 or self.swara > 6:
            raise SyntaxError(f"invalid swara: {self.swara}")
        if self.swara == 0:
            return self.oct * 12 + 0
        elif self.swara == 1:
            return self.oct * 12 + 1 + int(self.raised)
        elif self.swara == 2:
            return self.oct * 12 + 3 + int(self.raised)
        elif self.swara == 3:
            return self.oct * 12 + 5 + int(self.raised)
        elif self.swara == 4:
            return self.oct * 12 + 7
        elif self.swara == 5:
            return self.oct * 12 + 8 + int(self.raised)
        elif self.swara == 6:
            return self.oct * 12 + 10 + int(self.raised)
        else:
            raise SyntaxError(f"invalid swara: {self.swara}")

    @property
    def chroma(self):
        np = self.numbered_pitch
        while np < 0:
            np += 12
        return np % 12
    
    #method
    def to_JSON(self):
        return { # this should still be camelCase
            'swara': self.swara,
            'raised': self.raised,
            'oct': self.oct,
            'ratios': self.ratios,
            'fundamental': self.fundamental,
            'logOffset': self.log_offset,
        } 

    #method
    def set_oct(self, newOct):
        self.oct = newOct
        ratio = None
        
        if self.swara == 0 or self.swara == 4:
            ratio = self.ratios[self.swara]
            if not isinstance(ratio, (int, float)):
                raise SyntaxError(f"Invalid ratio type, must be int or float: {ratio}")
        else:
            if not isinstance(self.swara, int):
                raise SyntaxError(f"Invalid swara type: {self.swara}")

            nestedRatios = self.ratios[self.swara]
            if not isinstance(nestedRatios, list):
                raise SyntaxError(f"Invalid nestedRatios type, must be array: {nestedRatios}")

            ratio = nestedRatios[int(self.raised)]

    # ------------------------------------------------------------------
    # additional helpers and display properties mirroring pitch.ts

    @staticmethod
    def pitch_number_to_chroma(pitch_number: int) -> int:
        chroma = pitch_number % 12
        while chroma < 0:
            chroma += 12
        return chroma

    @staticmethod
    def chroma_to_scale_degree(chroma: int) -> tuple[int, bool]:
        mapping = {
            0: (0, True),
            1: (1, False),
            2: (1, True),
            3: (2, False),
            4: (2, True),
            5: (3, False),
            6: (3, True),
            7: (4, True),
            8: (5, False),
            9: (5, True),
            10: (6, False),
            11: (6, True),
        }
        return mapping[chroma]

    @staticmethod
    def from_pitch_number(pitch_number: int, fundamental: float = 261.63) -> "Pitch":
        octv = math.floor(pitch_number / 12)
        chroma = Pitch.pitch_number_to_chroma(pitch_number)
        swara, raised = Pitch.chroma_to_scale_degree(chroma)
        return Pitch({
            'swara': swara,
            'oct': octv,
            'raised': raised,
            'fundamental': fundamental
        })

    # ------------------------------------------------------------------

    @property
    def solfege_letter(self) -> str:
        solfege = [
            'Do', 'Ra', 'Re', 'Me', 'Mi', 'Fa', 'Fi', 'Sol', 'Le', 'La', 'Te', 'Ti'
        ]
        return solfege[self.chroma]

    @property
    def scale_degree(self) -> int:
        return int(self.swara) + 1

    def _octave_diacritic(self) -> str:
        mapping = {
            -3: '\u20E8',
            -2: '\u0324',
            -1: '\u0323',
            1: '\u0307',
            2: '\u0308',
            3: '\u20DB'
        }
        return mapping.get(self.oct, '')

    @property
    def octaved_scale_degree(self) -> str:
        return f"{self.scale_degree}{self._octave_diacritic()}"

    @property
    def octaved_sargam_letter(self) -> str:
        return f"{self.sargam_letter}{self._octave_diacritic()}"

    @property
    def octaved_sargam_letter_with_cents(self) -> str:
        cents = self.cents_string
        return f"{self.octaved_sargam_letter} ({cents})"

    @property
    def octaved_solfege_letter(self) -> str:
        return f"{self.solfege_letter}{self._octave_diacritic()}"

    @property
    def octaved_solfege_letter_with_cents(self) -> str:
        cents = self.cents_string
        return f"{self.octaved_solfege_letter} ({cents})"

    @property
    def octaved_chroma(self) -> str:
        return f"{self.chroma}{self._octave_diacritic()}"

    @property
    def octaved_chroma_with_cents(self) -> str:
        cents = self.cents_string
        return f"{self.octaved_chroma} ({cents})"

    @property
    def cents_string(self) -> str:
        et_freq = self.fundamental * 2 ** (self.chroma / 12) * 2 ** self.oct
        cents = 1200 * math.log2(self.frequency / et_freq)
        sign = '+' if cents >= 0 else '-'
        return f"{sign}{round(abs(cents))}\u00A2"

    @property
    def a440_cents_deviation(self) -> str:
        c0 = 16.3516
        deviation = 1200 * math.log2(self.frequency / c0)
        octv = math.floor(deviation / 1200)
        pitch_idx = round((deviation % 1200) / 100)
        cents = round(deviation % 100)
        sign = '+'
        if cents > 50:
            cents = 100 - cents
            sign = '-'
            pitch_idx = (pitch_idx + 1) % 12
        pitch = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'][pitch_idx]
        return f"{pitch}{octv} ({sign}{cents}\u00A2)"

    @property
    def western_pitch(self) -> str:
        pitch = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'][self.chroma]
        return pitch

    @property
    def movable_c_cents_deviation(self) -> str:
        pitch = self.western_pitch
        et_freq = self.fundamental * 2 ** (self.chroma / 12) * 2 ** self.oct
        cents = 1200 * math.log2(self.frequency / et_freq)
        sign = '+' if cents >= 0 else '-'
        return f"{pitch} ({sign}{round(abs(cents))}\u00A2)"

    def same_as(self, other: "Pitch") -> bool:
        return self.swara == other.swara and self.oct == other.oct and self.raised == other.raised

    @classmethod
    def from_json(cls, obj: dict) -> "Pitch":
        return cls(obj)
