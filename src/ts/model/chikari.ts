import { Pitch } from './pitch'
import { v4 as uuidv4 } from 'uuid';
class Chikari {
  fundamental: number;
  pitches: Pitch[];
  uniqueId: string;
  constructor({
	pitches = [
	  new Pitch({
		'swara': 's',
		'oct': 2
	  }),
	  new Pitch({
		'swara': 's',
		'oct': 1
	  }),
	  new Pitch({
		'swara': 'p',
		'oct': 0
	  }),
	  new Pitch({
		'swara': 'g',
		'oct': 0
	  })
	],
	fundamental = new Pitch().fundamental,
	uniqueId = undefined

  }: {
	pitches?: Pitch[],
	fundamental?: number,
	uniqueId?: string
  } = {}) {
	if (uniqueId === undefined) {
	  this.uniqueId = uuidv4()
	} else {
	  this.uniqueId = uniqueId
	}
	this.fundamental = fundamental;
	this.pitches = pitches.map(pitch => {
	  pitch.fundamental = this.fundamental;
	  return pitch
	})
  }

  toJSON() {
	return {
	  fundamental: this.fundamental,
	  pitches: this.pitches.map(p => p.toJSON()),
	  uniqueId: this.uniqueId
	}
  }
}

export { Chikari };
