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
    piece.dateCreated = datetime.now()
    piece.dateModified = datetime.now()
    piece.instrumentation = ['Sitar']
    piece.durTot = 60.0

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
    piece.phraseGrid[0].append(new_phrase)
    
    silent_traj = Trajectory({
        'id': 12,
        'dur_tot': piece.durTot - traj_1.dur_tot,
        'fundID12': Pitch().fundamental
    })
    silent_phrase = Phrase({ 'trajectories': [silent_traj]})
    piece.phraseGrid[0].append(silent_phrase)
    # Recompute piece-level durations and start times
    piece.dur_array_from_phrases()

    # Prepare JSON payload and remove any null _id to allow insertion
    payload = piece.to_json()
    payload.pop("_id", None)

    print(f"Inserting new transcription with title: {payload['title']}")
    try:
        response = client.insert_new_transcription(payload)
        print("✅ Inserted transcription:", response)
    except Exception as e:
        print("❌ Failed to insert transcription:", e)


if __name__ == '__main__':
    main()
