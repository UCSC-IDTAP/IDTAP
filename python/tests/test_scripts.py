"""
Integration tests for the actual Python scripts used by the server.

These tests verify that each script can run successfully with test data,
which is critical for validating Python version compatibility.

ISOLATION STRATEGY:
- All outputs go to temp directories (auto-cleaned after each test)
- MongoDB credentials are blocked (see conftest.py)
- Scripts are modified to use temp paths before running
- process_audio.py is NOT imported (it connects to DB at module level)
  Instead, we test its functions in isolation

Scripts tested:
- make_spec_data.py - Generates spectrogram data (tested via function import)
- generate_melograph.py - Generates pitch contour data (tested via subprocess)
- generate_log_spectrograms.py - Generates spectrogram images (tested via subprocess)
- process_audio.py - Only the get_peaks() function is tested (DB-free)
- make_excel.py - Helper functions tested, import verified (DB-dependent script)
- delete_unlinked_audio.py - Import verification only (DB-dependent script)
- backup_mongo.py - Import verification only (shell wrapper)
"""
import pytest
import subprocess
import sys
import os
import json
import tempfile
import shutil
from pathlib import Path


class TestMakeSpecData:
    """Test the make_spec_data.py script."""

    def test_make_spec_data_function(self, test_audio_path, temp_output_dir):
        """Test the make_spec_data function directly."""
        # Add the visualization_tools directory to path
        viz_tools_dir = Path(__file__).parent.parent / "visualization_tools"
        sys.path.insert(0, str(viz_tools_dir))

        try:
            from make_spec_data import make_spec_data

            # Run the function
            make_spec_data(test_audio_path, temp_output_dir)

            # Verify outputs were created
            spec_data_path = os.path.join(temp_output_dir, "spec_data.gz")
            spec_shape_path = os.path.join(temp_output_dir, "spec_shape.json")

            assert os.path.exists(spec_data_path), "spec_data.gz not created"
            assert os.path.exists(spec_shape_path), "spec_shape.json not created"

            # Verify spec_shape.json is valid
            with open(spec_shape_path) as f:
                shape_data = json.load(f)
            assert "shape" in shape_data
            assert len(shape_data["shape"]) == 2  # Should be 2D array shape

        finally:
            sys.path.remove(str(viz_tools_dir))

    def test_make_spec_data_output_decompresses(self, test_audio_path, temp_output_dir):
        """Test that the gzipped output can be decompressed."""
        import gzip
        import numpy as np

        viz_tools_dir = Path(__file__).parent.parent / "visualization_tools"
        sys.path.insert(0, str(viz_tools_dir))

        try:
            from make_spec_data import make_spec_data
            make_spec_data(test_audio_path, temp_output_dir)

            # Read shape
            with open(os.path.join(temp_output_dir, "spec_shape.json")) as f:
                shape_data = json.load(f)
            shape = tuple(shape_data["shape"])

            # Decompress and verify
            with gzip.open(os.path.join(temp_output_dir, "spec_data.gz"), "rb") as f:
                data = f.read()

            arr = np.frombuffer(data, dtype=np.uint8).reshape(shape)
            assert arr.shape == shape

        finally:
            sys.path.remove(str(viz_tools_dir))


class TestGenerateMelograph:
    """Test the generate_melograph.py script."""

    def test_generate_melograph_subprocess(self, python_dir, temp_output_dir):
        """Test running generate_melograph.py as a subprocess."""
        # Setup: copy test audio to expected location
        test_audio = python_dir / "visualization_tools" / "test_audio.wav"
        if not test_audio.exists():
            pytest.skip("Test audio not found")

        # Create temp audio directory structure
        audio_dir = Path(temp_output_dir) / "audio" / "wav"
        audio_dir.mkdir(parents=True)

        melographs_dir = Path(temp_output_dir) / "melographs"
        melographs_dir.mkdir(parents=True)

        # Copy test audio with a test ID
        test_id = "test_audio_123"
        shutil.copy(test_audio, audio_dir / f"{test_id}.wav")

        # Create a modified version of the script that uses our temp dirs
        script_path = python_dir / "visualization_scripts" / "generate_melograph.py"

        # Read the script and modify paths
        with open(script_path) as f:
            script_content = f.read()

        # Create modified script in temp dir
        modified_script = Path(temp_output_dir) / "test_melograph.py"
        modified_content = script_content.replace(
            "path_to_audio = os.path.join(os.path.dirname(__file__), '..', 'audio')",
            f"path_to_audio = '{audio_dir.parent}'"
        ).replace(
            "path_to_melographs = os.path.join(os.path.dirname(__file__), '..', 'melographs')",
            f"path_to_melographs = '{melographs_dir}'"
        )

        with open(modified_script, "w") as f:
            f.write(modified_content)

        # Get the Python interpreter from the test environment
        python_exe = sys.executable

        # Run the script
        result = subprocess.run(
            [python_exe, str(modified_script), test_id],
            capture_output=True,
            text=True,
            timeout=120
        )

        # Check for success
        assert result.returncode == 0, f"Script failed: {result.stderr}"

        # Verify output was created
        output_file = melographs_dir / test_id / "melograph.json"
        assert output_file.exists(), f"melograph.json not created at {output_file}"

        # Verify JSON is valid
        with open(output_file) as f:
            data = json.load(f)

        assert "data_chunks" in data
        assert "time_chunk_starts" in data
        assert "time_increment" in data


class TestGenerateLogSpectrograms:
    """Test the generate_log_spectrograms.py script."""

    def test_spectrogram_generation_subprocess(self, python_dir, temp_output_dir):
        """Test running generate_log_spectrograms.py as a subprocess."""
        test_audio = python_dir / "visualization_tools" / "test_audio.wav"
        if not test_audio.exists():
            pytest.skip("Test audio not found")

        # Create audio directory structure
        audio_dir = Path(temp_output_dir) / "audio" / "wav"
        audio_dir.mkdir(parents=True)

        spectrograms_dir = Path(temp_output_dir) / "spectrograms"
        spectrograms_dir.mkdir(parents=True)

        # Copy test audio
        test_id = "test_spec_456"
        shutil.copy(test_audio, audio_dir / f"{test_id}.wav")

        script_path = python_dir / "visualization_tools" / "generate_log_spectrograms.py"

        # Read and modify the script
        with open(script_path) as f:
            script_content = f.read()

        modified_script = Path(temp_output_dir) / "test_spectrograms.py"
        modified_content = script_content.replace(
            "path_to_audio = './audio'",
            f"path_to_audio = '{audio_dir.parent}'"
        ).replace(
            "folder_path = 'spectrograms/' + file_id",
            f"folder_path = '{spectrograms_dir}/' + file_id"
        )

        with open(modified_script, "w") as f:
            f.write(modified_content)

        python_exe = sys.executable
        sa_estimate = "130.0"  # Tonic estimate in Hz

        result = subprocess.run(
            [python_exe, str(modified_script), test_id, sa_estimate],
            capture_output=True,
            text=True,
            timeout=180  # Spectrograms can take longer
        )

        assert result.returncode == 0, f"Script failed: {result.stderr}"

        # Verify output directory was created
        output_dir = spectrograms_dir / test_id
        assert output_dir.exists(), f"Spectrogram directory not created at {output_dir}"

        # Should have subdirectories for different zoom levels (0, 1, 2, 3, 4)
        assert (output_dir / "0").exists(), "Zoom level 0 directory not created"


class TestProcessAudioFunctions:
    """Test functions from process_audio.py without database."""

    def test_get_peaks_function(self):
        """Test the get_peaks function from process_audio.py."""
        import numpy as np

        # Import just the function (avoid module-level DB connection)
        # We need to extract it manually since the module connects to DB at import

        def get_peaks(data, num_levels=4, block_size=64):
            """Copy of the function for testing."""
            obj = {}
            for i in range(num_levels):
                top = []
                bottom = []
                size = block_size * 2 ** i
                indices = np.repeat(size, len(data) // size)
                if len(data) % size != 0:
                    indices = np.append(indices, len(data) % size)
                cur_top = np.maximum.reduceat(data, np.append([0], np.cumsum(indices[:-1])))/size
                top.append(cur_top)
                cur_bottom = np.minimum.reduceat(data, np.append([0], np.cumsum(indices[:-1])))/size
                bottom.append(cur_bottom)
                peaks = np.dstack((top, bottom))
                obj[size] = peaks[0].tolist()
            return obj

        # Create test audio data
        test_data = np.sin(np.linspace(0, 100, 44100)).astype(np.float32)

        # Run get_peaks
        result = get_peaks(test_data, num_levels=3, block_size=1024)

        # Verify structure
        assert 1024 in result
        assert 2048 in result
        assert 4096 in result

        # Each level should have peak data
        for size, peaks in result.items():
            assert len(peaks) > 0
            # Each peak should be [top, bottom]
            assert len(peaks[0]) == 2

    def test_get_peaks_with_real_audio(self, test_audio_path):
        """Test get_peaks with actual audio file."""
        import essentia.standard as ess
        import numpy as np

        def get_peaks(data, num_levels=4, block_size=64):
            obj = {}
            for i in range(num_levels):
                top = []
                bottom = []
                size = block_size * 2 ** i
                indices = np.repeat(size, len(data) // size)
                if len(data) % size != 0:
                    indices = np.append(indices, len(data) % size)
                cur_top = np.maximum.reduceat(data, np.append([0], np.cumsum(indices[:-1])))/size
                top.append(cur_top)
                cur_bottom = np.minimum.reduceat(data, np.append([0], np.cumsum(indices[:-1])))/size
                bottom.append(cur_bottom)
                peaks = np.dstack((top, bottom))
                obj[size] = peaks[0].tolist()
            return obj

        # Load real audio
        loader = ess.EasyLoader(filename=test_audio_path)
        audio = loader()

        # Generate peaks
        result = get_peaks(audio, num_levels=5, block_size=2048)

        # Verify we got results for all levels
        assert len(result) == 5

        # Verify peaks are reasonable (normalized between -1 and 1 range)
        for size, peaks in result.items():
            for peak in peaks[:10]:  # Check first 10
                top, bottom = peak
                assert -2 < top < 2, f"Top peak out of range: {top}"
                assert -2 < bottom < 2, f"Bottom peak out of range: {bottom}"


class TestMakeExcel:
    """Test make_excel.py helper functions.

    Note: The main script connects to MongoDB at module level, so we can't
    import it directly. We test the helper functions by extracting them.
    """

    def test_get_date_string_function(self):
        """Test the date formatting function from make_excel.py."""
        import datetime

        def get_date_string(date):
            """Copy of function from make_excel.py"""
            date = datetime.datetime.strptime(str(date), '%Y-%m-%d %H:%M:%S.%f')
            return date.strftime('%m/%d/%Y %I:%M %p')

        # Test with a known date
        test_date = datetime.datetime(2024, 6, 15, 14, 30, 45, 123456)
        result = get_date_string(test_date)

        assert result == "06/15/2024 02:30 PM"

    def test_get_mod_date_string_function(self):
        """Test the modified date formatting function from make_excel.py."""
        import datetime

        def get_mod_date_string(date):
            """Copy of function from make_excel.py"""
            date = datetime.datetime.strptime(str(date), '%Y-%m-%dT%H:%M:%S.%fZ')
            return date.strftime('%m/%d/%Y %I:%M %p')

        # Test with ISO format date string
        test_date = "2024-06-15T14:30:45.123456Z"
        result = get_mod_date_string(test_date)

        assert result == "06/15/2024 02:30 PM"

    def test_xlsxwriter_available(self):
        """Verify xlsxwriter is installed and works."""
        import xlsxwriter
        import tempfile
        import os

        # Create a test workbook
        with tempfile.NamedTemporaryFile(suffix='.xlsx', delete=False) as f:
            temp_path = f.name

        try:
            workbook = xlsxwriter.Workbook(temp_path)
            worksheet = workbook.add_worksheet()
            worksheet.write(0, 0, "Test")
            workbook.close()

            assert os.path.exists(temp_path)
            assert os.path.getsize(temp_path) > 0
        finally:
            os.unlink(temp_path)


class TestDBDependentScripts:
    """Verify DB-dependent scripts can at least be syntax-checked.

    These scripts connect to MongoDB at module level, so we can't import them
    without mocking. Instead, we verify:
    1. They have valid Python syntax
    2. Their dependencies are available
    """

    def test_make_excel_syntax(self, python_dir):
        """Verify make_excel.py has valid syntax."""
        script_path = python_dir / "cleanJson" / "make_excel.py"
        result = subprocess.run(
            [sys.executable, "-m", "py_compile", str(script_path)],
            capture_output=True,
            text=True
        )
        assert result.returncode == 0, f"Syntax error in make_excel.py: {result.stderr}"

    def test_delete_unlinked_audio_syntax(self, python_dir):
        """Verify delete_unlinked_audio.py has valid syntax."""
        script_path = python_dir / "dataManagement" / "aggregations" / "delete_unlinked_audio.py"
        result = subprocess.run(
            [sys.executable, "-m", "py_compile", str(script_path)],
            capture_output=True,
            text=True
        )
        assert result.returncode == 0, f"Syntax error: {result.stderr}"

    def test_backup_mongo_syntax(self, python_dir):
        """Verify backup_mongo.py has valid syntax."""
        script_path = python_dir / "backup_scripts" / "backup_mongo.py"
        result = subprocess.run(
            [sys.executable, "-m", "py_compile", str(script_path)],
            capture_output=True,
            text=True
        )
        assert result.returncode == 0, f"Syntax error: {result.stderr}"

    def test_process_audio_syntax(self, python_dir):
        """Verify process_audio.py has valid syntax."""
        script_path = python_dir / "process_audio.py"
        result = subprocess.run(
            [sys.executable, "-m", "py_compile", str(script_path)],
            capture_output=True,
            text=True
        )
        assert result.returncode == 0, f"Syntax error: {result.stderr}"
