"""
Test audio processing functionality using essentia.

These tests verify that the core audio processing pipeline works correctly
without requiring database connections.
"""
import pytest
import numpy as np
import os
import tempfile
import json
import gzip


class TestEssentiaAudioLoading:
    """Test that essentia can load and process audio files."""

    def test_mono_loader(self, test_audio_path):
        """Test loading audio with MonoLoader."""
        import essentia.standard as ess

        loader = ess.MonoLoader(filename=test_audio_path)
        audio = loader()

        assert isinstance(audio, np.ndarray)
        assert len(audio) > 0
        assert audio.dtype == np.float32

    def test_audio_properties(self, test_audio_path):
        """Test getting audio properties."""
        import essentia.standard as ess

        loader = ess.MonoLoader(filename=test_audio_path, sampleRate=44100)
        audio = loader()

        # Audio should be at least 0.1 seconds
        assert len(audio) > 4410

    def test_pitch_detection(self, test_audio_path):
        """Test pitch detection on audio."""
        import essentia.standard as ess

        loader = ess.MonoLoader(filename=test_audio_path, sampleRate=44100)
        audio = loader()

        # Use PitchYin for pitch detection
        pitch_extractor = ess.PitchYin(sampleRate=44100)

        # Process a frame
        frame_size = 2048
        if len(audio) >= frame_size:
            frame = audio[:frame_size]
            pitch, confidence = pitch_extractor(frame)

            assert isinstance(pitch, float)
            assert isinstance(confidence, float)
            assert 0 <= confidence <= 1


class TestSpectrogramGeneration:
    """Test spectrogram generation functionality."""

    def test_spectrum_computation(self, test_audio_path):
        """Test computing spectrum from audio."""
        import essentia.standard as ess

        loader = ess.MonoLoader(filename=test_audio_path, sampleRate=44100)
        audio = loader()

        # Compute spectrum
        spectrum = ess.Spectrum()
        windowing = ess.Windowing(type='hann')

        frame_size = 2048
        if len(audio) >= frame_size:
            frame = audio[:frame_size]
            windowed = windowing(frame)
            spec = spectrum(windowed)

            assert isinstance(spec, np.ndarray)
            assert len(spec) == frame_size // 2 + 1

    def test_mel_bands(self, test_audio_path):
        """Test mel band extraction."""
        import essentia.standard as ess

        loader = ess.MonoLoader(filename=test_audio_path, sampleRate=44100)
        audio = loader()

        spectrum = ess.Spectrum()
        windowing = ess.Windowing(type='hann')
        mel_bands = ess.MelBands(numberBands=128, sampleRate=44100)

        frame_size = 2048
        if len(audio) >= frame_size:
            frame = audio[:frame_size]
            windowed = windowing(frame)
            spec = spectrum(windowed)
            mels = mel_bands(spec)

            assert isinstance(mels, np.ndarray)
            assert len(mels) == 128


class TestOutputFormats:
    """Test output file generation."""

    def test_json_output(self, temp_output_dir):
        """Test JSON output generation."""
        test_data = {
            "audio_id": "test123",
            "pitches": [440.0, 442.0, 438.5],
            "times": [0.0, 0.1, 0.2]
        }

        output_path = os.path.join(temp_output_dir, "test_output.json")
        with open(output_path, 'w') as f:
            json.dump(test_data, f)

        # Verify file was created and can be read back
        with open(output_path, 'r') as f:
            loaded = json.load(f)

        assert loaded == test_data

    def test_gzip_json_output(self, temp_output_dir):
        """Test gzipped JSON output (used by make_spec_data.py)."""
        test_data = {
            "spectrogram": [[1.0, 2.0], [3.0, 4.0]],
            "times": [0.0, 0.1]
        }

        output_path = os.path.join(temp_output_dir, "test_output.json.gz")
        with gzip.open(output_path, 'wt') as f:
            json.dump(test_data, f)

        # Verify file was created and can be read back
        with gzip.open(output_path, 'rt') as f:
            loaded = json.load(f)

        assert loaded == test_data

    def test_image_output(self, temp_output_dir):
        """Test image output generation (used by spectrogram scripts)."""
        from PIL import Image
        import numpy as np

        # Create a test spectrogram image
        spec_data = np.random.rand(128, 256) * 255
        spec_data = spec_data.astype(np.uint8)

        img = Image.fromarray(spec_data)
        output_path = os.path.join(temp_output_dir, "test_spec.png")
        img.save(output_path)

        # Verify image was created and can be read back
        loaded_img = Image.open(output_path)
        assert loaded_img.size == (256, 128)
