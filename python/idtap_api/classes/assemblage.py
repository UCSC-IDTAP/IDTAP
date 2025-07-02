from __future__ import annotations
from typing import List, Optional, Dict, TypedDict
import uuid

from .phrase import Phrase
from ..enums import Instrument


class StrandDescriptorType(TypedDict):
    label: str
    phraseIDs: List[str]
    id: str


class AssemblageDescriptorType(TypedDict):
    instrument: Instrument
    strands: List[StrandDescriptorType]
    name: str
    id: str
    loosePhraseIDs: List[str]


class Assemblage:  # forward declaration for Strand type hints
    pass


class Strand:
    def __init__(self, label: str, phrase_ids: List[str], assemblage: Assemblage, id: Optional[str] = None) -> None:
        self.label = label
        self.phrase_ids: List[str] = phrase_ids
        self.assemblage = assemblage
        self.id = id or str(uuid.uuid4())
        self.name_editing: bool = False

    # ------------------------------------------------------------------
    def add_phrase(self, phrase: Phrase) -> None:
        if phrase.unique_id in self.phrase_ids:
            raise Exception(f"Phrase with UUID {phrase.unique_id} already exists in strand {self.label}")
        self.phrase_ids.append(phrase.unique_id)

    # ------------------------------------------------------------------
    def remove_phrase(self, phrase: Phrase) -> None:
        try:
            self.phrase_ids.remove(phrase.unique_id)
        except ValueError:
            raise Exception(f"Phrase with UUID {phrase.unique_id} not found in strand {self.label}")

    # ------------------------------------------------------------------
    @property
    def phrases(self) -> List[Phrase]:
        phrases = []
        for uid in self.phrase_ids:
            match = next((p for p in self.assemblage.phrases if p.unique_id == uid), None)
            if match is not None:
                phrases.append(match)
        phrases.sort(key=lambda p: p.start_time or 0)
        return phrases


class Assemblage:
    def __init__(self, instrument: Instrument, name: str, id: Optional[str] = None) -> None:
        self.phrases: List[Phrase] = []
        self.strands: List[Strand] = []
        self.instrument = instrument
        self.name = name
        self.id = id or str(uuid.uuid4())

    # ------------------------------------------------------------------
    def add_strand(self, label: str, id: Optional[str] = None) -> None:
        if any(s.label == label for s in self.strands):
            raise Exception(f"Strand with label {label} already exists")
        self.strands.append(Strand(label, [], self, id))

    # ------------------------------------------------------------------
    def add_phrase(self, phrase: Phrase, strand_id: Optional[str] = None) -> None:
        if any(p.unique_id == phrase.unique_id for p in self.phrases):
            raise Exception(f"Phrase with UUID {phrase.unique_id} already exists in assemblage")
        self.phrases.append(phrase)
        if strand_id is None:
            return
        strand = next((s for s in self.strands if s.id == strand_id), None)
        if strand is None:
            raise Exception(f"Strand with id {strand_id} not found")
        strand.add_phrase(phrase)

    # ------------------------------------------------------------------
    def remove_strand(self, id: str) -> None:
        idx = next((i for i, s in enumerate(self.strands) if s.id == id), -1)
        if idx == -1:
            raise Exception(f"Strand with id {id} not found")
        self.strands.pop(idx)

    # ------------------------------------------------------------------
    def move_phrase_to_strand(self, phrase: Phrase, target_strand_id: Optional[str] = None) -> None:
        source = next((s for s in self.strands if phrase.unique_id in s.phrase_ids), None)
        target = next((s for s in self.strands if s.id == target_strand_id), None)
        if target is None:
            if source:
                source.remove_phrase(phrase)
            return
        if source is None:
            if phrase not in self.phrases:
                raise Exception(f"Phrase with UUID {phrase.unique_id} not found in assemblage")
            target.add_phrase(phrase)
        else:
            source.remove_phrase(phrase)
            target.add_phrase(phrase)

    # ------------------------------------------------------------------
    def remove_phrase(self, phrase: Phrase) -> None:
        if phrase not in self.phrases:
            raise Exception(f"Phrase with UUID {phrase.unique_id} not found in assemblage")
        for strand in self.strands:
            if phrase.unique_id in strand.phrase_ids:
                strand.remove_phrase(phrase)
        self.phrases.remove(phrase)

    # ------------------------------------------------------------------
    @staticmethod
    def from_descriptor(descriptor: AssemblageDescriptorType, phrases: List[Phrase]) -> 'Assemblage':
        assemblage = Assemblage(descriptor['instrument'], descriptor['name'], descriptor['id'])
        for strand_desc in descriptor['strands']:
            assemblage.add_strand(strand_desc['label'], strand_desc['id'])
            for pid in strand_desc['phraseIDs']:
                match = next((p for p in phrases if p.unique_id == pid), None)
                if match is None:
                    raise Exception(f"Phrase with UUID {pid} not found")
                assemblage.add_phrase(match, strand_desc['id'])
        for pid in descriptor['loosePhraseIDs']:
            match = next((p for p in phrases if p.unique_id == pid), None)
            if match is None:
                raise Exception(f"Loose phrase with UUID {pid} not found")
            assemblage.add_phrase(match)
        return assemblage

    # ------------------------------------------------------------------
    @property
    def loose_phrases(self) -> List[Phrase]:
        attached_ids = {pid for s in self.strands for pid in s.phrase_ids}
        loose = [p for p in self.phrases if p.unique_id not in attached_ids]
        loose.sort(key=lambda p: p.start_time or 0)
        return loose

    # ------------------------------------------------------------------
    @property
    def descriptor(self) -> AssemblageDescriptorType:
        return {
            'instrument': self.instrument,
            'strands': [
                {'label': s.label, 'phraseIDs': list(s.phrase_ids), 'id': s.id}
                for s in self.strands
            ],
            'name': self.name,
            'id': self.id,
            'loosePhraseIDs': [p.unique_id for p in self.loose_phrases],
        }
