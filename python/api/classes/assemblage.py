from __future__ import annotations
from typing import List, Optional, TypedDict
from uuid import uuid4

from enum import Enum

class Instrument(Enum):
    SITAR = "Sitar"

class Phrase:
    def __init__(self, unique_id: Optional[str] = None, start_time: Optional[float] = None):
        self.unique_id = unique_id or str(uuid4())
        self.start_time = start_time

class Strand:
    def __init__(self, label: str, assemblage: 'Assemblage', phrase_ids: Optional[List[str]] = None, id: Optional[str] = None):
        self.label = label
        self.phrase_ids: List[str] = phrase_ids[:] if phrase_ids else []
        self.assemblage = assemblage
        self.id = id or str(uuid4())
        self.name_editing = False

    def add_phrase(self, phrase: Phrase) -> None:
        if phrase.unique_id in self.phrase_ids:
            raise ValueError(f"Phrase with UUID {phrase.unique_id} already exists in strand {self.label}")
        self.phrase_ids.append(phrase.unique_id)

    def remove_phrase(self, phrase: Phrase) -> None:
        if phrase.unique_id not in self.phrase_ids:
            raise ValueError(f"Phrase with UUID {phrase.unique_id} not found in strand {self.label}")
        self.phrase_ids.remove(phrase.unique_id)

    @property
    def phrases(self) -> List[Phrase]:
        phrases = [p for p in self.assemblage.phrases if p.unique_id in self.phrase_ids]
        return sorted(phrases, key=lambda p: p.start_time or 0)

class StrandDescriptor(TypedDict):
    label: str
    phraseIDs: List[str]
    id: str

class AssemblageDescriptor(TypedDict):
    instrument: str
    strands: List[StrandDescriptor]
    name: str
    id: str
    loosePhraseIDs: List[str]

class Assemblage:
    def __init__(self, instrument: Instrument, name: str, id: Optional[str] = None):
        self.phrases: List[Phrase] = []
        self.strands: List[Strand] = []
        self.instrument = instrument
        self.name = name
        self.id = id or str(uuid4())

    def add_strand(self, label: str, id: Optional[str] = None) -> None:
        if any(s.label == label for s in self.strands):
            raise ValueError(f"Strand with label {label} already exists")
        self.strands.append(Strand(label, self, [], id))

    def add_phrase(self, phrase: Phrase, strand_id: Optional[str] = None) -> None:
        if any(p.unique_id == phrase.unique_id for p in self.phrases):
            raise ValueError(f"Phrase with UUID {phrase.unique_id} already exists in assemblage")
        self.phrases.append(phrase)
        if strand_id is None:
            return
        strand = next((s for s in self.strands if s.id == strand_id), None)
        if strand is None:
            raise ValueError(f"Strand with id {strand_id} not found")
        strand.add_phrase(phrase)

    def remove_strand(self, id: str) -> None:
        strand = next((s for s in self.strands if s.id == id), None)
        if strand is None:
            raise ValueError(f"Strand with id {id} not found")
        self.strands.remove(strand)

    def remove_phrase(self, phrase: Phrase) -> None:
        if phrase not in self.phrases:
            raise ValueError(f"Phrase with UUID {phrase.unique_id} not found in assemblage")
        for strand in self.strands:
            if phrase.unique_id in strand.phrase_ids:
                strand.remove_phrase(phrase)
        self.phrases.remove(phrase)

    def move_phrase_to_strand(self, phrase: Phrase, target_strand_id: Optional[str]) -> None:
        source_strand = next((s for s in self.strands if phrase.unique_id in s.phrase_ids), None)
        target_strand = next((s for s in self.strands if s.id == target_strand_id), None)
        if target_strand is None:
            if source_strand:
                source_strand.remove_phrase(phrase)
            return
        if source_strand is None:
            if phrase not in self.phrases:
                raise ValueError(f"Phrase with UUID {phrase.unique_id} not found in assemblage")
            target_strand.add_phrase(phrase)
        else:
            source_strand.remove_phrase(phrase)
            target_strand.add_phrase(phrase)

    @property
    def loose_phrases(self) -> List[Phrase]:
        loose = [p for p in self.phrases if not any(p.unique_id in s.phrase_ids for s in self.strands)]
        return sorted(loose, key=lambda p: p.start_time or 0)

    @property
    def descriptor(self) -> AssemblageDescriptor:
        return {
            "instrument": self.instrument.value,
            "strands": [{"label": s.label, "phraseIDs": s.phrase_ids, "id": s.id} for s in self.strands],
            "name": self.name,
            "id": self.id,
            "loosePhraseIDs": [p.unique_id for p in self.loose_phrases],
        }

    @staticmethod
    def from_descriptor(desc: AssemblageDescriptor, phrases: List[Phrase]) -> 'Assemblage':
        a = Assemblage(Instrument(desc["instrument"]), desc["name"], desc["id"])
        for strand_desc in desc.get("strands", []):
            a.add_strand(strand_desc["label"], strand_desc["id"])
            for pid in strand_desc.get("phraseIDs", []):
                phrase = next((p for p in phrases if p.unique_id == pid), None)
                if phrase is None:
                    raise ValueError(f"Phrase with UUID {pid} not found")
                a.add_phrase(phrase, strand_desc["id"])
        for pid in desc.get("loosePhraseIDs", []):
            phrase = next((p for p in phrases if p.unique_id == pid), None)
            if phrase is None:
                raise ValueError(f"Loose phrase with UUID {pid} not found")
            a.add_phrase(phrase)
        return a
