class Trajectory:
    def __init__(self):
        self.names = [
            'Fixed',
            'Bend: Simple',
            'Bend: Sloped Start',
            'Bend: Sloped End',
            'Bend: Ladle',
            'Bend: Reverse Ladle',
            'Bend: Simple Multiple',
            'Krintin',
            'Krintin Slide',
            'Krintin Slide Hammer',
            'Dense Krintin Slide Hammer',
            'Slide',
            'Silent',
            'Vibrato'
        ]

    @classmethod
    def names(cls):
        return cls().names
