from typing import Optional, Dict
import humps
from .pitch import Pitch
from .articulation import Articulation

ArtDict = Dict[str, Articulation]

class TrajectoryOptions(dict):
    pass

class Trajectory:
    def __init__(self, options: Optional[TrajectoryOptions] = None):
        if options is None:
            options = {}
        else:
            options = humps.decamelize(options)

        self.id = options.get('id', 0)
        self.pitches = options.get('pitches', [Pitch()])
        self.dur_tot = options.get('dur_tot', 1.0)
        self.dur_array = options.get('dur_array')
        self.slope = options.get('slope', 2)

        arts = options.get('articulations')
        if arts is None:
            self.articulations: ArtDict = {'0.00': Articulation({'name': 'pluck', 'stroke': 'd'})}
        else:
            self.articulations = {}
            for key, value in arts.items():
                if isinstance(key, (int, float)) or (isinstance(key, str) and key.replace('.', '', 1).isdigit()):
                    k = f"{float(key):.2f}"
                else:
                    k = str(key)
                self.articulations[k] = value
        # normalize any numeric string keys left as integers like '0'
        for key in list(self.articulations.keys()):
            if isinstance(key, str) and key.isdigit():
                val = self.articulations.pop(key)
                self.articulations[f"{float(key):.2f}"] = val

        self.num = options.get('num')
        self.name = options.get('name')
