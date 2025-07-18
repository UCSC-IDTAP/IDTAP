#!/usr/bin/env python3
"""
test_update_transcription.py

Test downloading an existing transcription, modifying it, and saving the changes.
"""

from idtap_api.client import SwaraClient
from idtap_api.classes.piece import Piece
from idtap_api.classes.trajectory import Trajectory


def main():
    # Initialize client (will prompt for login if needed)
    client = SwaraClient()

    # Download existing transcription
    transcription_id = "6879968c8ba7abed03294fae"
    print(f"Downloading transcription {transcription_id}...")
    
    try:
        transcription_data = client.get_piece(transcription_id)
        print(f"✅ Downloaded transcription: {transcription_data.get('title', 'untitled')}")
    except Exception as e:
        print(f"❌ Failed to download transcription: {e}")
        return

    # Convert to Piece object
    piece = Piece.from_json(transcription_data)
    print(f"Converted to Piece object with {len(piece.phrases)} phrases")

    # Get the first trajectory from the first phrase
    if not piece.phrases or not piece.phrases[0].trajectories:
        print("❌ No trajectories found in the first phrase")
        return
    
    first_trajectory = piece.phrases[0].trajectories[0]
    print(f"Found first trajectory with ID: {first_trajectory.id}")

    # Create a new trajectory with the same attributes as the first trajectory
    # Remove uniqueId so a new one will be generated
    trajectory_json = first_trajectory.to_json()
    trajectory_json.pop('uniqueId', None)  # Remove uniqueId to force generation of new one
    trajectory_copy = Trajectory.from_json(trajectory_json)
    
    # Find the position to insert (before the last silent trajectory if it exists)
    trajectories = piece.phrases[0].trajectory_grid[0]
    insert_position = len(trajectories)
    
    # Check if the last trajectory is silent (id 12) and insert before it
    if trajectories and trajectories[-1].id == 12:
        insert_position = len(trajectories) - 1
        print(f"Found silent trajectory at end, inserting copy at position {insert_position}")
    else:
        print(f"No silent trajectory at end, appending copy at position {insert_position}")
    
    # Insert the copy at the calculated position
    trajectories.insert(insert_position, trajectory_copy)
    piece.phrases[0].reset()  # Recalculate phrase durations
    
    print(f"Added copy of first trajectory. First phrase now has {len(piece.phrases[0].trajectories)} trajectories")

    # Update piece-level durations
    piece.dur_array_from_phrases()

    # Save the updated transcription
    print("Saving updated transcription...")
    client.save_transcription(piece, fill_duration=False)  # Don't fill duration since it's an existing piece


if __name__ == '__main__':
    main()
