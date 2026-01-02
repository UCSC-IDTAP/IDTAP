"""
Shared pytest fixtures for IDTAP Python tests.

IMPORTANT: These tests are designed to be completely isolated:
- All output goes to temporary directories (cleaned up after each test)
- No MongoDB connections are made (scripts that connect at import are not imported)
- No writes to production paths (spectrograms/, melographs/, audio/, etc.)
"""
import pytest
import os
import tempfile
import shutil
from pathlib import Path


# Safety check: Ensure we never accidentally connect to production MongoDB
@pytest.fixture(autouse=True)
def block_production_mongodb(monkeypatch):
    """
    Block production MongoDB connections by unsetting credentials.
    This ensures tests never accidentally write to production database.
    """
    monkeypatch.delenv("USER_NAME", raising=False)
    monkeypatch.delenv("PASSWORD", raising=False)
    monkeypatch.delenv("MONGODB_URI", raising=False)


@pytest.fixture
def project_root():
    """Return the project root directory."""
    return Path(__file__).parent.parent.parent


@pytest.fixture
def python_dir():
    """Return the python scripts directory."""
    return Path(__file__).parent.parent


@pytest.fixture
def test_audio_path(python_dir):
    """Return path to test audio file (read-only, never modified)."""
    audio_path = python_dir / "visualization_tools" / "test_audio.wav"
    if not audio_path.exists():
        pytest.skip(f"Test audio file not found: {audio_path}")
    return str(audio_path)


@pytest.fixture
def temp_output_dir():
    """
    Create a temporary directory for test outputs.

    All test outputs go here - this directory is completely removed
    after each test, ensuring no pollution of the codebase.
    """
    temp_dir = tempfile.mkdtemp(prefix="idtap_test_")
    yield temp_dir
    # Cleanup after test
    shutil.rmtree(temp_dir, ignore_errors=True)


@pytest.fixture
def isolated_test_env(temp_output_dir, monkeypatch):
    """
    Create a fully isolated test environment.

    Changes working directory to temp dir and sets up safe paths.
    """
    original_cwd = os.getcwd()
    os.chdir(temp_output_dir)

    # Create subdirectories that scripts might expect
    for subdir in ["audio/wav", "audio/mp3", "audio/opus", "spectrograms", "melographs", "peaks", "data/json", "data/excel"]:
        os.makedirs(subdir, exist_ok=True)

    yield temp_output_dir

    os.chdir(original_cwd)
