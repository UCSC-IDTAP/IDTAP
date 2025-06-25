class Pitch {
  sargam: string[];
  ratios: (number | number[])[];
  raised: boolean;
  swara: string | number = 'sa';
  oct: number;
  fundamental: number;
  logOffset: number;

  constructor({
	swara = 'sa',
	oct = 0,
	raised = true,
	fundamental = 261.63,
	ratios = [
	  1,
	  [2 ** (1 / 12), 2 ** (2 / 12)],
	  [2 ** (3 / 12), 2 ** (4 / 12)],
	  [2 ** (5 / 12), 2 ** (6 / 12)],
	  2 ** (7 / 12),
	  [2 ** (8 / 12), 2 ** (9 / 12)],
	  [2 ** (10 / 12), 2 ** (11 / 12)]
	],
	logOffset = 0
  }: {
	swara?: string | number,
	oct?: number,
	raised?: boolean,
	fundamental?: number,
	ratios?: (number | number[])[]
	logOffset?: number
  } = {}) {
	// """
	// swara: str or int, can be either sargam or number from 0 - 6 as follows
	//   0 - sa
	//   1 - re
	//   2 - ga
	//   3 - ma
	//   4 - pa
	//   5 - dha
	//   6 - ni
	// oct: integer, positive or negative. Center is assumed to be, the sa in
	//   the center of the sitar, [get approx freq here]
	// raised: boolean, if true, then pitch is suddha (or tivra, for ma),
	//   otherwise, komal (or suddha, for ma)
	// fundamental: float, frequency (in hz) of center sa
	// """
	this.logOffset = logOffset;
	this.sargam = ['sa', 're', 'ga', 'ma', 'pa', 'dha', 'ni'];
	const sargamLetters = this.sargam.map(s => s.slice(0, 1));
	this.ratios = ratios;
	this.ratios.forEach(r => {
	  if (Array.isArray(r)) {
		r.forEach(subR => {
		  if (subR === undefined) {
			throw new SyntaxError(`invalid ratio type, must be float: ${subR}`)
		  }
		})
	  } else {
		if (r === undefined) {
		  throw new SyntaxError(`invalid ratio type, must be float: ${r}`)
		}
	  }
	})
	if (typeof(raised) != 'boolean') {
	  throw new SyntaxError(`invalid raised type, must be boolean: ${raised}`)
	} else {
	  this.raised = raised
	}
	if (typeof(swara) === 'string') {
	  // if (swara.length === 2 && swara[1] === "̲") {
	  //   if (!sargamLetters.includes(swara[0].toLowerCase())) {
	  //     throw new SyntaxError(`invalid swara string: "${swara}"`)
	  //   } else {
	  //     this.swara = sargamLetters.indexOf(swara[0].toLowerCase())
	  //     this.raised = false
	  //   }
	  // }
	  if (swara.length > 1) {
		if (!this.sargam.includes(swara.toLowerCase())) {
		  throw new SyntaxError(`invalid swara string: "${swara}"`)
		} else {
		  this.swara = this.sargam.indexOf(swara.toLowerCase())
		}
	  } else if (swara.length === 1) {
		if (!sargamLetters.includes(swara.toLowerCase())) {
		  throw new SyntaxError(`invalid swara string: "${swara}"`)
		} else {
		  this.swara = sargamLetters.indexOf(swara.toLowerCase())
		}
	  }
	} else if (typeof(swara) === 'number') {
	  if (swara < 0 || swara > this.sargam.length - 1) {
		throw new SyntaxError(`invalid swara number: ${swara}`)
	  } else {
		this.swara = swara
	  }
	} else {
	  throw new SyntaxError(`invalad swara type: ${swara}, ${typeof(swara)}`)
	}
	if (typeof(this.swara) !== 'number') {
	  throw new SyntaxError(`invalid swara type: ${this.swara}`)
	}

	if (typeof(oct) != 'number') {
	  throw new SyntaxError(`invalid oct type: ${oct}`)
	} else if (!Number.isInteger(oct)) {
	  throw new SyntaxError(`invalid oct number type, must be integer: ${oct}`)
	} else {
	  this.oct = oct
	}

	if (typeof(fundamental) != 'number') {
	  throw new SyntaxError(`invalid fundamental type, ` + 
		`must be float: ${fundamental}`)
	}
	else {
	  this.fundamental = fundamental
	}

	if (this.swara === 0 || this.swara == 4) {
	  // raised override
	  this.raised = true
	}
  }

  static fromPitchNumber(pitchNumber: number, fundamental: number  = 261.63) {
	const oct = Math.floor(pitchNumber / 12);
	let chroma = pitchNumber % 12;
	while (chroma < 0) {
	  chroma += 12
	}
	let scaleDegree, raised;
	[scaleDegree, raised] = Pitch.chromaToScaleDegree(chroma);
	return new Pitch({ 
	  swara: scaleDegree,
	  oct: oct,
	  raised: raised,
	  fundamental: fundamental
	})
  }

  static pitchNumberToChroma(pitchNumber: number) {
	let chroma = pitchNumber % 12;
	while (chroma < 0) {
	  chroma += 12;
	}
	return chroma
  }

  static chromaToScaleDegree(chroma: number): [number, boolean] {
	let scaleDegree = 0;
	let raised = true;
	switch (chroma) {
	  case 0:
		scaleDegree = 0;
		raised = true;
		break;
	  case 1:
		scaleDegree = 1;
		raised = false;
		break;
	  case 2:
		scaleDegree = 1;
		raised = true;
		break;
	  case 3:
		scaleDegree = 2;
		raised = false;
		break;
	  case 4:
		scaleDegree = 2;
		raised = true;
		break;
	  case 5:
		scaleDegree = 3;
		raised = false;
		break;
	  case 6:
		scaleDegree = 3;
		raised = true;
		break;
	  case 7:
		scaleDegree = 4;
		raised = true;
		break;
	  case 8:
		scaleDegree = 5;
		raised = false;
		break;
	  case 9:
		scaleDegree = 5;
		raised = true;
		break;
	  case 10:
		scaleDegree = 6;
		raised = false;
		break;
	  case 11:
		scaleDegree = 6;
		raised = true;
		break;
	}
	return [scaleDegree, raised]
  }
  

  get frequency() {
	let ratio;
	if (this.swara === 0 || this.swara === 4) {
	  ratio = this.ratios[this.swara]
	  if (typeof ratio !== 'number') {
		throw new SyntaxError(`invalid ratio type, must be float: ${ratio}`)
	  }
	} else {
	  if (typeof this.swara !== 'number') {
		throw new SyntaxError(`wrong swara type, must be number: ${this.swara}`)
	  }
	  const nestedRatios = this.ratios[this.swara];
	  if (typeof nestedRatios !== 'object') {
		throw new SyntaxError(`invalid nestedRatios type, ` + 
		  `must be array: ${nestedRatios}`)
	  }
	  ratio = nestedRatios[Number(this.raised)]
	}
	return ratio * this.fundamental * (2 ** this.oct) * (2 ** this.logOffset);
  }

  get nonOffsetFrequency() {

	let ratio;
	if (this.swara === 0 || this.swara === 4) {
	  ratio = this.ratios[this.swara]
	  if (typeof ratio !== 'number') {
		throw new SyntaxError(`invalid ratio type, must be float: ${ratio}`)
	  }
	} else {
	  if (typeof this.swara !== 'number') {
		throw new SyntaxError(`wrong swara type, must be number: ${this.swara}`)
	  }
	  const nestedRatios = this.ratios[this.swara];
	  if (typeof nestedRatios !== 'object') {
		throw new SyntaxError(`invalid nestedRatios type, ` + 
		  `must be array: ${nestedRatios}`)
	  }
	  ratio = nestedRatios[Number(this.raised)]
	}
	return ratio * this.fundamental * (2 ** this.oct);
  }

  get nonOffsetLogFreq() {
	return Math.log2(this.nonOffsetFrequency)
  }

  setOct(newOct: number) {
	this.oct = newOct;
	let ratio;
	if (this.swara === 0 || this.swara === 4) {
	  ratio = this.ratios[this.swara]
	  if (typeof ratio !== 'number') {
		throw new SyntaxError(`invalid ratio type, must be float: ${ratio}`)
	  }
	} else {
	  if (typeof(this.swara) !== 'number') {
		throw new SyntaxError(`invalid swara type: ${this.swara}`)
	  }
	  const nestedRatios = this.ratios[this.swara];
	  if (typeof nestedRatios !== 'object') {
		throw new SyntaxError(`invalid nestedRatios type, ` + 
		  `must be array: ${nestedRatios}`)
	  }
	  ratio = nestedRatios[Number(this.raised)]
	}
  }

  get sargamLetter() {
	let s = this.sargam[this.swara as number].slice(0,1);
	if (this.raised) {
	  s = s.toUpperCase()
	}
	// this is gilding the lily, for now, just lowercase/ uppercase is better
	// if (this.swara !== 0 && this.swara !== 4 && this.raised === false) {
	//   s = s + '\u0332'
	// }
	return s
  }

  get solfegeLetter() {
	const solfege = [
	  'Do', 'Ra', 'Re', 'Me', 'Mi', 'Fa', 'Fi', 'Sol', 'Le', 'La', 'Te', 'Ti'
	]
	let s = solfege[this.chroma as number];
	return s
  }

  get scaleDegree() {
	return Number(this.swara) + 1;
  }

  get octavedScaleDegree() {
	let s = String(this.scaleDegree);
	if (this.oct === -2) {
	  s = s + '\u0324'
	} else if (this.oct === -1) {
	  s = s + '\u0323'
	} else if (this.oct === 1) {
	  s = s + '\u0307'
	} else if (this.oct === 2) {
	  s = s + '\u0308'
	} else if (this.oct === -3) {
	  s = s + '\u20E8'
	} else if (this.oct === 3) {
	  s = s + '\u20DB'
	}
	return s
  }

  get octavedSargamLetter() {
	let s = this.sargamLetter;
	if (this.oct === -2) {
	  s = s + '\u0324'
	} else if (this.oct === -1) {
	  s = s + '\u0323'
	} else if (this.oct === 1) {
	  s = s + '\u0307'
	} else if (this.oct === 2) {
	  s = s + '\u0308'
	} else if (this.oct === -3) {
	  s = s + '\u20E8'
	} else if (this.oct === 3) {
	  s = s + '\u20DB'
	}
	return s
  }

  get octavedSargamLetterWithCents() {
	let out = this.octavedSargamLetter;
	const etFreq = this.fundamental * 2 ** (this.chroma / 12) * 2 ** this.oct;
	const cents = 1200 * Math.log2(this.frequency / etFreq);
	const sign = cents >= 0 ? '+' : '-';
	const absCents = Math.abs(cents);
	const centsStr = ' (' + sign + Math.round(absCents).toString() + '\u00A2)';
	return out + centsStr 
  }

  get octavedSolfegeLetter() {
	let s = this.solfegeLetter;
	if (this.oct === -2) {
	  s = s + '\u0324'
	} else if (this.oct === -1) {
	  s = s + '\u0323'
	} else if (this.oct === 1) {
	  s = s + '\u0307'
	} else if (this.oct === 2) {
	  s = s + '\u0308'
	} else if (this.oct === -3) {
	  s = s + '\u20E8'
	} else if (this.oct === 3) {
	  s = s + '\u20DB'
	}
	return s
  }

  get octavedSolfegeLetterWithCents() {
	let out = this.octavedSolfegeLetter;
	const etFreq = this.fundamental * 2 ** (this.chroma / 12) * 2 ** this.oct;
	const cents = 1200 * Math.log2(this.frequency / etFreq);
	const sign = cents >= 0 ? '+' : '-';
	const absCents = Math.abs(cents);
	const centsStr = ' (' + sign + Math.round(absCents).toString() + '\u00A2)';
	return out + centsStr 
  }

  get octavedChroma() {
	let s = String(this.chroma)
	if (this.oct === -2) {
	  s = s + '\u0324'
	} else if (this.oct === -1) {
	  s = s + '\u0323'
	} else if (this.oct === 1) {
	  s = s + '\u0307'
	} else if (this.oct === 2) {
	  s = s + '\u0308'
	} else if (this.oct === -3) {
	  s = s + '\u20E8'
	} else if (this.oct === 3) {
	  s = s + '\u20DB'
	}
	return s
  }

  get octavedChromaWithCents() {
	let out = this.octavedChroma;
	const etFreq = this.fundamental * 2 ** (this.chroma / 12) * 2 ** this.oct;
	const cents = 1200 * Math.log2(this.frequency / etFreq);
	const sign = cents >= 0 ? '+' : '-';
	const absCents = Math.abs(cents);
	const centsStr = ' (' + sign + Math.round(absCents).toString() + '\u00A2)';
	return out + centsStr 
  }

  get centsString() {
	const etFreq = this.fundamental * 2 ** (this.chroma / 12) * 2 ** this.oct;
	const cents = 1200 * Math.log2(this.frequency / etFreq);
	const sign = cents >= 0 ? '+' : '-';
	const absCents = Math.abs(cents);
	const centsStr = sign + Math.round(absCents).toString() + '\u00A2';
	return centsStr
  }

  get numberedPitch(): number { 
	// something like a midi pitch, but centered on 0 instead of 60
	if (this.swara === 0) {
	  return this.oct * 12 + 0
	} else if (this.swara === 1) {
	  return this.oct * 12 + 1 + Number(this.raised)
	} else if (this.swara === 2) {
	  return this.oct * 12 + 3 + Number(this.raised)
	} else if (this.swara === 3) {
	  return this.oct * 12 + 5 + Number(this.raised)
	} else if (this.swara === 4) {
	  return this.oct * 12 + 7
	} else if (this.swara === 5) {
	  return this.oct * 12 + 8 + Number(this.raised)
	} else if (this.swara === 6) {
	  return this.oct * 12 + 10 + Number(this.raised)
	} else {
	  throw new SyntaxError(`invalid swara: ${this.swara}`)
	}
  }

  get a440CentsDeviation(): string {
	const c0 = 16.3516;
	const deviation = 1200 * Math.log2(this.frequency / c0);
	const oct = Math.floor(deviation / 1200);
	let pitchIdx = Math.round(deviation % 1200 / 100);
	let cents = Math.round(deviation % 100);
	let sign = '+';
	if (cents > 50) {
	  cents = 100 - cents;
	  sign = '-';
	  pitchIdx += 1;
	  pitchIdx = pitchIdx % 12;
	}
	
	let pitch = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G',
	  'G#', 'A', 'A#', 'B'][pitchIdx];
	return `${pitch}${oct} (${sign}${cents}\u00A2)`
  }

  get westernPitch(): string {
	let pitch = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G',
	  'G#', 'A', 'A#', 'B'][this.chroma];
	return `${pitch}`
  }

  get movableCCentsDeviation(): string {
	let pitch = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G',
	  'G#', 'A', 'A#', 'B'][this.chroma];
	const etFreq = this.fundamental * 2 ** (this.chroma / 12) * 2 ** this.oct;
	const cents = 1200 * Math.log2(this.frequency / etFreq);
	const sign = cents >= 0 ? '+' : '-';
	const absCents = Math.abs(cents);
	return `${pitch} (${sign}${Math.round(absCents)}\u00A2)`
  }

  get chroma() {
	let np = this.numberedPitch;
	while (np < 0) {
	  np += 12
	}
	return np % 12
  }

  get logFreq() {
	return Math.log2(this.frequency)
  }

  sameAs(other: Pitch): boolean {
	return this.swara === other.swara && 
	  this.oct === other.oct && 
	  this.raised === other.raised
  }

  toJSON() {
        return {
          swara: this.swara,
          raised: this.raised,
          oct: this.oct,
          ratios: this.ratios,
          fundamental: this.fundamental,
          logOffset: this.logOffset,
        }
  }

  static fromJSON(obj: any): Pitch {
        return new Pitch(obj);
  }
}

export { Pitch };
