#!/usr/bin/env python3
"""
test_write_transcription.py

Proof-of-concept: create a new Piece with random Trajectories and insert it via server.
"""

import random
import uuid
from datetime import datetime

from idtap_api.client import SwaraClient
from idtap_api.classes.piece import Piece
from idtap_api.classes.trajectory import Trajectory
from idtap_api.classes.phrase import Phrase
from idtap_api.classes.pitch import Pitch


def main():
    # Initialize client (will prompt for login if needed)
    client = SwaraClient()

    # Create a new transcription Piece
    piece = Piece()
    piece.title = f"Test Piece {uuid.uuid4().hex[:8]}"
    piece.location = "Automated Test"
    piece.date_created = datetime.now()
    piece.date_modified = datetime.now()
    piece.instrumentation = ['Sitar']
    piece.dur_tot = 60.0

    # Generate a few random trajectories
    traj_1 = Trajectory({
        'id': 6,
        'pitches': [
            Pitch({ 'swara': 1 }), 
            Pitch({ 'swara': 2 }),
            Pitch({ 'swara': 1 }),
            ],
        'dur_array': [0.3, 0.7]
    })
    new_phrase = Phrase({ 'trajectories': [traj_1] })
    piece.phrase_grid[0].append(new_phrase)
    
    # Save the transcription using client method
    client.save_transcription(piece)


if __name__ == '__main__':
    main()
