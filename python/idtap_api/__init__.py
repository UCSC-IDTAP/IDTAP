"""Python API package exposing IDTAP data classes and client."""

__version__ = "0.1.2"

from .client import SwaraClient
from .auth import login_google

from .classes.articulation import Articulation
from .classes.automation import Automation  # type: ignore
from .classes.assemblage import Assemblage
from .classes.chikari import Chikari
from .classes.group import Group
from .classes.meter import Meter
from .classes.note_view_phrase import NoteViewPhrase
from .classes.piece import Piece
from .classes.phrase import Phrase
from .classes.pitch import Pitch
from .classes.raga import Raga
from .classes.section import Section
from .classes.trajectory import Trajectory

from .enums import Instrument
from .audio_models import (
    AudioMetadata,
    AudioUploadResult,
    AudioEventConfig,
    Musician,
    Location,
    RecordingDate,
    Raga as AudioRaga,
    PerformanceSection,
    Permissions,
    ValidationResult,
    LocationHierarchy,
    FileInfo,
    ProcessingStatus
)

__all__ = [
    "SwaraClient",
    "Articulation",
    "Automation",
    "Assemblage",
    "Chikari",
    "Group",
    "Meter",
    "NoteViewPhrase",
    "Piece",
    "Phrase",
    "Pitch",
    "Raga",
    "Section",
    "Trajectory",
    "Instrument",
    "login_google",
    # Audio upload classes
    "AudioMetadata",
    "AudioUploadResult", 
    "AudioEventConfig",
    "Musician",
    "Location",
    "RecordingDate",
    "AudioRaga",
    "PerformanceSection",
    "Permissions",
    "ValidationResult",
    "LocationHierarchy",
    "FileInfo",
    "ProcessingStatus",
]
