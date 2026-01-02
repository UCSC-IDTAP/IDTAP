"""
Test that all required Python packages can be imported.

This is the most critical test for verifying Python environment compatibility.
If these tests pass, the Python environment has all required dependencies.
"""
import pytest


class TestCoreImports:
    """Test core dependencies that all scripts need."""

    def test_numpy(self):
        import numpy as np
        assert np.__version__

    def test_pymongo(self):
        import pymongo
        assert pymongo.__version__

    def test_bson(self):
        from bson.objectid import ObjectId
        # Verify ObjectId works
        oid = ObjectId()
        assert len(str(oid)) == 24


class TestEssentiaImports:
    """Test essentia and related audio processing imports."""

    def test_essentia(self):
        import essentia
        assert essentia.__version__

    def test_essentia_standard(self):
        import essentia.standard as ess
        # Verify key algorithms are available
        assert hasattr(ess, 'MonoLoader')
        assert hasattr(ess, 'PitchYin')
        assert hasattr(ess, 'Spectrum')

    def test_soundfile(self):
        import soundfile as sf
        assert sf.__version__


class TestVisualizationImports:
    """Test visualization dependencies."""

    def test_matplotlib(self):
        import matplotlib
        import matplotlib.pyplot as plt
        assert matplotlib.__version__

    def test_pillow(self):
        from PIL import Image
        assert Image.__version__


class TestDataProcessingImports:
    """Test data processing dependencies."""

    def test_xlsxwriter(self):
        import xlsxwriter
        assert xlsxwriter.__version__

    def test_json(self):
        import json
        # stdlib, always available

    def test_gzip(self):
        import gzip
        # stdlib, always available


class TestNetworkImports:
    """Test network/HTTP dependencies."""

    def test_requests(self):
        import requests
        assert requests.__version__

    def test_urllib3(self):
        import urllib3
        # Verify we have the secure version
        version = urllib3.__version__
        major, minor, *_ = version.split('.')
        assert int(major) >= 2, f"urllib3 version {version} is too old"
        if int(major) == 2:
            assert int(minor) >= 6, f"urllib3 version {version} is vulnerable, need >= 2.6.0"
