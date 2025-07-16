import os
import sys

sys.path.insert(0, os.path.abspath('.'))

from python.idtap_api.classes.section import Section
from python.idtap_api.classes.phrase import Phrase
from python.idtap_api.classes.trajectory import Trajectory
from python.idtap_api.classes.pitch import Pitch


# Tests mirror src/ts/tests/section.test.ts


def test_section_aggregates():
    p1 = Phrase({'trajectories': [Trajectory()]})
    p2 = Phrase({'trajectories': [Trajectory()]})
    sec = Section({'phrases': [p1, p2]})
    assert len(sec.trajectories) == 2
    assert len(sec.all_pitches()) == 2


def test_section_all_pitches_and_trajectories_getters():
    sa1 = Trajectory({'pitches': [Pitch({'swara': 'sa'})]})
    sa2 = Trajectory({'pitches': [Pitch({'swara': 'sa'})]})
    re = Trajectory({'pitches': [Pitch({'swara': 're'})]})

    p1 = Phrase({'trajectories': [sa1, sa2]})
    p2 = Phrase({'trajectories': [re]})
    sec = Section({'phrases': [p1, p2]})

    assert len(sec.all_pitches(False)) == 2
    assert sec.trajectories == [sa1, sa2, re]

