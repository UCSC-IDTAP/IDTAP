import { Phrase, Trajectory, Pitch } from './../src/js/classes'
import { Instrument } from '@shared/enums'
import { Temporality } from '@shared/types'

class Strand {
  label: string;
  phraseIndices: number[];
  assemblage: Assemblage;

  constructor(label: string, phraseIndices: number[], assemblage: Assemblage) {
    this.label = label;
    this.phraseIndices = phraseIndices;
	this.assemblage = assemblage;
  }

  get phrases(): Phrase[] {
    return this.phraseIndices.map(idx => this.assemblage.phrases[idx]);
  }
}


class Assemblage {
  phrases: Phrase[];
  strands: Strand[];
  instrument: Instrument;

  constructor(phrases: Phrase[], strandLabels: string[], instrument: Instrument) {
    this.phrases = phrases;
    this.strands = strandLabels.map(label => new Strand(label, [], this));
    this.instrument = instrument;
  }

  addStrand(label: string): void {
	const existingStrand = this.strands.find(s => s.label === label);
	if (existingStrand) {
	  throw new Error(`Strand with label ${label} already exists`);
	}
	this.strands.push(new Strand(label, [], this));
  }

  prependPhrase(phrase: Phrase, strandLabel: string | undefined): void {
	this.phrases.unshift(phrase);
	this.strands.forEach(strand => {
	  strand.phraseIndices = strand.phraseIndices.map(idx => idx + 1);
	});
	if (strandLabel) {
	  const strand = this.strands.find(s => s.label === strandLabel);
	  if (strand) {
		strand.phraseIndices.unshift(0);
	  }
	  else {
		throw new Error(`Strand with label ${strandLabel} not found`);
	  }
	}
  }
  appendPhrase(phrase: Phrase, strandLabel: string | undefined): void {
	this.phrases.push(phrase);
	if (strandLabel) {
	  const strand = this.strands.find(s => s.label === strandLabel);
	  if (strand) {
		strand.phraseIndices.push(this.phrases.length - 1);
	  } else {
		throw new Error(`Strand with label ${strandLabel} not found`);
	  }
	}
  }

  assignPhraseToStrand(phraseIdx: number, strandLabel: string): void {
	const strand = this.strands.find(s => s.label === strandLabel);
	if (!strand) {
	  throw new Error(`Strand with label ${strandLabel} not found`);
	}
	strand.phraseIndices.push(phraseIdx);
  }

  temporalityOfPhraseIdx(phraseIdx: number): Temporality {
	const phrase = this.phrases[phraseIdx];
	const startTime = this.phrases.slice(0, phraseIdx).reduce((acc, p) => acc + p.durTot!, 0);
	const endTime = startTime + phrase.durTot!;
	const duration = phrase.durTot!;
	return { startTime, endTime, duration };
  }

  temporalityOfPhrase(phrase: Phrase): Temporality {
	const phraseIdx = this.phrases.indexOf(phrase);
	if (phraseIdx === -1) {
	  throw new Error('Phrase not found in assemblage');
	}
	return this.temporalityOfPhraseIdx(phraseIdx);
  }
}
