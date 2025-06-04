import { Phrase } from './phrase';
import { Instrument } from '@shared/enums';
import { Temporality, AssemblageDescriptor } from '@shared/types';
import { v4 as uuidv4 } from 'uuid';


class Strand {
	label: string;
	phraseIDs: string[];
	assemblage: Assemblage;
	id: string;

	constructor(label: string, phraseIDs: string[], assemblage: Assemblage, id?: string) {
		this.label = label;
		this.phraseIDs = phraseIDs;
		this.assemblage = assemblage;
		this.id = id ? id : uuidv4();
	}

	addPhrase(phrase: Phrase): void {
		if (this.phraseIDs.includes(phrase.uniqueId)) {
			throw new Error(`Phrase with UUID ${phrase.uniqueId} already exists in strand ${this.label}`);
		}
		this.phraseIDs.push(phrase.uniqueId);
	}

  removePhrase(phrase: Phrase): void {
    const index = this.phraseIDs.indexOf(phrase.uniqueId);
    if (index === -1) {
      throw new Error(`Phrase with UUID ${phrase.uniqueId} not found in strand ${this.label}`);
    }
    this.phraseIDs.splice(index, 1);
  }

	get phrases(): Phrase[] {
		return this.phraseIDs.map(uuid => {
			return this.assemblage.phrases.find(p => p.uniqueId === uuid)!
		}).sort((a, b) => a.startTime! - b.startTime!);
	}
}

class Assemblage {
	phrases: Phrase[];
	strands: Strand[];
	instrument: Instrument;
	name: string;
	id: string;

	constructor(instrument: Instrument, name: string, id?: string) {
		this.phrases = [];
		this.strands = [];
		this.instrument = instrument;
		this.name = name;
		this.id = id ? id : uuidv4();
	}

	addStrand(label: string, id?: string): void {
		const existingStrand = this.strands.find(s => s.label === label);
		if (existingStrand) {
			throw new Error(`Strand with label ${label} already exists`);
		}
		this.strands.push(new Strand(label, [], this, id));
	}

	addPhrase(phrase: Phrase, strandLabel?: string): void {
		if (this.phrases.some(p => p.uniqueId === phrase.uniqueId)) {
			throw new Error(`Phrase with UUID ${phrase.uniqueId} already exists in assemblage`);
		}
		this.phrases.push(phrase);
    if (strandLabel === undefined) {
      return; // If no strand label is provided, do not add to any strand
    }
		const strand = this.strands.find(s => s.label === strandLabel);
		if (strand) {
			strand.addPhrase(phrase);
		} else {
			throw new Error(`Strand with label ${strandLabel} not found`);
		}
	}

	removeStrand(label: string): void {
		
	}

  static fromDescriptor(
    descriptor: AssemblageDescriptor, phrases: Phrase[]
  ): Assemblage {
    const assemblage = new Assemblage(descriptor.instrument, descriptor.name, descriptor.id);
    descriptor.strands.forEach(strand => {
      assemblage.addStrand(strand.label, strand.id);
      strand.phraseIDs.forEach(phraseID => {
        const phrase = phrases.find(p => p.uniqueId === phraseID);
        if (phrase) {
          assemblage.addPhrase(phrase, strand.label);
        } else {
          throw new Error(`Phrase with UUID ${phraseID} not found`);
        }
      });
    });
    return assemblage;
  }
  
  get descriptor(): AssemblageDescriptor {
    return {
      instrument: this.instrument,
      strands: this.strands.map(strand => ({
        label: strand.label,
        phraseIDs: strand.phraseIDs,
		id: strand.id
      })),
	  name: this.name,
	  id: this.id
    };
  }
}

export { Assemblage, Strand };
