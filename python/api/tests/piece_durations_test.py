from python.api.classes.piece import Piece, Instrument
from python.api.classes.phrase import Phrase
from python.api.classes.trajectory import Trajectory
from python.api.classes.raga import Raga
import pytest
import math

# Helper to build a piece with two tracks, second empty

def build_piece_with_empty_track():
    raga = Raga()
    t1 = Trajectory(durTot=1)
    p1 = Phrase(trajectories=[t1], raga=raga)
    return Piece(
        phraseGrid=[[p1], []],
        instrumentation=[Instrument.Sitar, Instrument.Sitar],
        raga=raga,
    )


def test_durtotfromphrases_creates_silent_phrase_for_empty_track():
    piece = build_piece_with_empty_track()
    piece.durTotFromPhrases()
    assert len(piece.phraseGrid[1]) == 1
    silent_traj = piece.phraseGrid[1][0].trajectories[0]
    assert silent_traj.id == 12
    assert silent_traj.durTot == pytest.approx(1)

# Helper for NaN trajectory cleanup

def build_piece_with_nan_traj():
    raga = Raga()
    piece = Piece(raga=raga, instrumentation=[Instrument.Sitar])
    good = Trajectory(durTot=1)
    bad = Trajectory(durTot=math.nan)
    phrase = Phrase(trajectories=[good, bad], raga=raga)
    phrase.durTotFromTrajectories()
    piece.phraseGrid[0].append(phrase)
    return piece, phrase


def test_durarrayfromphrases_removes_nan_trajectories():
    piece, phrase = build_piece_with_nan_traj()
    assert math.isnan(phrase.durTot)
    piece.durArrayFromPhrases()
    assert len(phrase.trajectories) == 1
    assert phrase.durTot == pytest.approx(1)
