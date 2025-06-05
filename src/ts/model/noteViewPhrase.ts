import { Pitch } from './pitch';
import { Raga } from './raga';

class NoteViewPhrase {
  pitches: Pitch[];
  durTot?: number;
  raga?: Raga;
  startTime?: number;

  constructor({
	pitches = [],
	durTot = undefined,
	raga = undefined,
	startTime = undefined
  }: {
	pitches?: Pitch[],
	durTot?: number,
	raga?: Raga,
	startTime?: number
  } = {}) {
	this.pitches = pitches;
	this.durTot = durTot;
	this.raga = raga;
	this.startTime = startTime;
  }
}

export { NoteViewPhrase };
