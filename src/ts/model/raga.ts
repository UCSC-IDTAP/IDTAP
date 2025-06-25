import { 
	RuleSetType,
	TuningType,
	NumObj,
	BoolObj,

} from '@shared/types';
import { 
	isObject,
	getClosest,
	isUpperCase,
	closeTo
} from '@/ts/utils';
import { Pitch } from './pitch';


const yamanRuleSet = {
  sa: true,
  re: {
    lowered: false,
    raised: true
  },
  ga: {
    lowered: false,
    raised: true
  },
  ma: {
    lowered: false,
    raised: true
  },
  pa: true,
  dha: {
    lowered: false,
    raised: true
  },
  ni: {
    lowered: false,
    raised: true
  }
}

const etTuning: TuningType = {
  sa: 2 ** (0 / 12),
  re: {
    lowered: 2 ** (1 / 12),
    raised: 2 ** (2 / 12)
  },
  ga: {
    lowered: 2 ** (3 / 12),
    raised: 2 ** (4 / 12)
  },
  ma: {
    lowered: 2 ** (5 / 12),
    raised: 2 ** (6 / 12)
  },
  pa: 2 ** (7 / 12),
  dha: {
    lowered: 2 ** (8 / 12),
    raised: 2 ** (9 / 12)
  },
  ni: {
    lowered: 2 ** (10 / 12),
    raised: 2 ** (11 / 12)
  }
};

class Raga {
  name: string;
  fundamental: number;
  ruleSet: RuleSetType;
  tuning: TuningType;
  ratios: number[];

  constructor({
	name = 'Yaman',
	fundamental = 261.63,
	ruleSet = yamanRuleSet,
	ratios = undefined,
	tuning = undefined
  }: {
	name?: string,
	fundamental?: number,
	ruleSet?: RuleSetType,
	ratios?: number[],
	tuning?: TuningType
  } = {}) {

	this.name = name;
	this.ruleSet = ruleSet;
	this.fundamental = fundamental;
	this.tuning = tuning ? tuning : etTuning;
	if (ratios === undefined || ratios.length !== this.ruleSetNumPitches)  {
	  this.ratios = this.setRatios(this.ruleSet)
	} else {
	  this.ratios = ratios
	}

	// set tuning from ratios
	this.ratios.forEach((ratio, rIdx) => {
	  const tuningKeys = this.ratioIdxToTuningTuple(rIdx);
	  if (tuningKeys[0] === 'sa' || tuningKeys[0] === 'pa') {
		this.tuning[tuningKeys[0]] = ratio
	  } else {
		(this.tuning[tuningKeys[0]] as NumObj)[tuningKeys[1]!] = ratio
	  }
	})
  }

  get sargamLetters() {
	const initSargam = ['sa', 're', 'ga', 'ma', 'pa', 'dha', 'ni'];
	const sl: string[] = [];
	initSargam.forEach(s => {
	  if (isObject(this.ruleSet[s])) {
		const ruleSet = this.ruleSet[s] as BoolObj;
		if (ruleSet.lowered) sl.push(s.slice(0, 1));
		if (ruleSet.raised) sl.push(s.slice(0, 1).toUpperCase());
	  } else if (this.ruleSet[s]) {
		sl.push(s.slice(0, 1).toUpperCase())
	  }
	});
	return sl
  }

  get solfegeStrings() {
	const pitches = this.getPitches({ low: this.fundamental, high: this.fundamental * 1.999})
	return pitches.map(p => p.solfegeLetter)
  }
  
  get pcStrings() {
	const pitches = this.getPitches({ low: this.fundamental, high: this.fundamental * 1.999})
	return pitches.map(p => p.chroma.toString())
  }

  get westernPitchStrings() {
	const westernPitches = [
	  'C',
	  'C#',
	  'D',
	  'D#',
	  'E',
	  'F',
	  'F#',
	  'G',
	  'G#',
	  'A',
	  'A#',
	  'B'
	]
	const pitches = this.getPitches({ low: this.fundamental, high: this.fundamental * 1.999})
	return pitches.map(p => westernPitches[p.chroma])
  }

  get ruleSetNumPitches() {
	let numPitches = 0;
	const keys = Object.keys(this.ruleSet);
	keys.forEach(key => {
	  if (typeof(this.ruleSet[key]) === 'boolean') {
		if (this.ruleSet[key]) {
		  numPitches += 1;
		}
	  } else {
		const ruleSet = this.ruleSet[key] as BoolObj;
		if (ruleSet.lowered) numPitches += 1;
		if (ruleSet.raised) numPitches += 1;
	  }
	})
	return numPitches
  }

  pitchNumberToSargamLetter(pitchNumber: number) {
	const oct = Math.floor(pitchNumber / 12);
	let out;
	let chroma = pitchNumber % 12;
	while (chroma < 0) chroma += 12;
	let scaleDegree, raised;
	[scaleDegree, raised] = Pitch.chromaToScaleDegree(chroma);
	const sargam = ['sa', 're', 'ga', 'ma', 'pa', 'dha', 'ni'][scaleDegree];
	if (typeof this.ruleSet[sargam] === 'boolean') {
	  if (this.ruleSet[sargam]) {
		out = sargam.slice(0, 1).toUpperCase()
	  }
	} else {
	  const ruleSet = this.ruleSet[sargam] as BoolObj;
	  if (ruleSet[raised ? 'raised' : 'lowered']) {
		out = raised ? sargam.slice(0, 1).toUpperCase() : sargam.slice(0, 1)
	  }
	}
	return out
  }

  getPitchNumbers(low: number, high: number) { // returns all pitch numbers, 
	// inclusive
	let pitchNumbers = [];
	for (let i = low; i <= high; i++) {
	  const oct = Math.floor(i / 12);
	  let chroma = i % 12;
	  while (chroma < 0) chroma += 12;
	  let scaleDegree, raised;
	  [scaleDegree, raised] = Pitch.chromaToScaleDegree(chroma);
	  const sargam = ['sa', 're', 'ga', 'ma', 'pa', 'dha', 'ni'][scaleDegree];
	  if (typeof this.ruleSet[sargam] === 'boolean') {
		if (this.ruleSet[sargam]) {
		  pitchNumbers.push(i);
		}
	  } else {
		const ruleSet = this.ruleSet[sargam] as BoolObj;
		if (ruleSet[raised ? 'raised' : 'lowered']) {
		  pitchNumbers.push(i);
		}
	  }
	}
	return pitchNumbers
  }

  pitchNumberToScaleNumber(pitchNumber: number) {
	// as opposed to scale degree. This is just 0 - x, depending on how many 
	// pitches are in the raga
	const oct = Math.floor(pitchNumber / 12);
	let chroma = pitchNumber % 12;
	while (chroma < 0) chroma += 12;
	const mainOct = this.getPitchNumbers(0, 11);
	const idx = mainOct.indexOf(chroma);
	if (idx === -1) {
	  throw new Error('pitchNumberToScaleNumber: pitchNumber not in raga')
	}
	return idx + oct * mainOct.length
  }

  scaleNumberToPitchNumber(scaleNumber: number) {
	const mainOct = this.getPitchNumbers(0, 11);
	const oct = Math.floor(scaleNumber / mainOct.length);
	while (scaleNumber < 0) scaleNumber += mainOct.length;
	const chroma = mainOct[scaleNumber % mainOct.length];
	return chroma + oct * 12
  }

  scaleNumberToSargamLetter(scaleNumber: number) {
	const pn = this.scaleNumberToPitchNumber(scaleNumber);
	return this.pitchNumberToSargamLetter(pn)
  }

  setRatios(ruleSet: RuleSetType) {
	const sargam = Object.keys(ruleSet);
	const ratios: number[] = [];
	sargam.forEach(s => {
	  if (typeof(etTuning[s]) === 'number' && ruleSet[s]) {
		ratios.push(etTuning[s] as number);
	  } else {
		const ruleSet = this.ruleSet[s] as BoolObj;
		const tuning = etTuning[s] as NumObj;
		if (ruleSet.lowered) ratios.push(tuning.lowered);
		if (ruleSet.raised) ratios.push(tuning.raised);
	  }
	})
	return ratios;
  }

  getPitches({ low=100, high=800 } = {}) {
	const sargam = Object.keys(this.ruleSet);
	let pitches: Pitch[] = [];
	sargam.forEach(s => {
	  if (typeof(this.ruleSet[s]) === 'boolean' && this.ruleSet[s]) {
		const freq = this.tuning[s] as number * this.fundamental;
		const octsBelow = Math.ceil(Math.log2(low/freq));
		const octsAbove = Math.floor(Math.log2(high/freq));
		for (let i = octsBelow; i <= octsAbove; i++) {
		  pitches.push(new Pitch({ 
			swara: s, 
			oct: i, 
			fundamental: this.fundamental,
			ratios: this.stratifiedRatios,
		  }))
		}
	  } else {
		if ((this.ruleSet[s] as BoolObj).lowered) {
		  const freq = (this.tuning[s] as NumObj).lowered * this.fundamental;
		  const octsBelow = Math.ceil(Math.log2(low/freq));
		  const octsAbove = Math.floor(Math.log2(high/freq));
		  for (let i = octsBelow; i <= octsAbove; i++) {
			pitches.push(new Pitch({ 
			  swara: s, 
			  oct: i, 
			  raised: false, 
			  fundamental: this.fundamental,
			  ratios: this.stratifiedRatios, 
			}))
		  }
		}
		if ((this.ruleSet[s] as BoolObj).raised) {
		  const freq = (this.tuning[s] as NumObj).raised * this.fundamental;
		  const octsBelow = Math.ceil(Math.log2(low/freq));
		  const octsAbove = Math.floor(Math.log2(high/freq));
		  for (let i = octsBelow; i <= octsAbove; i++) {
			pitches.push(new Pitch({ 
			  swara: s, 
			  oct: i, 
			  raised: true, 
			  fundamental: this.fundamental,
			  ratios: this.stratifiedRatios, 
			}))
		  }
		}
	  }
	});
	pitches.sort((a, b) => a.frequency - b.frequency)
	pitches = pitches.filter(p => {
	  return p.frequency >= low && p.frequency <= high
	})
	return pitches
  }

  get stratifiedRatios() {
	const sargam = ['sa', 're', 'ga', 'ma', 'pa', 'dha', 'ni'];
	const ratios: (number | number[])[] = [];
	let ct = 0;
	sargam.forEach((s, sIdx) => {
	  if (typeof(this.ruleSet[s]) === 'boolean') {
		if (this.ruleSet[s]) {
		  ratios.push(this.ratios[ct]);
		  ct++;
		} else {
		  ratios.push(this.tuning[s] as number)
		}
	  } else {
		ratios.push([]);
		if ((this.ruleSet[s] as BoolObj).lowered) {
		  (ratios[sIdx] as number[]).push(this.ratios[ct]);
		  ct++;
		} else {
		  (ratios[sIdx] as number[]).push((this.tuning[s] as NumObj).lowered)
		}
		if ((this.ruleSet[s] as BoolObj).raised) {
		  (ratios[sIdx] as number[]).push(this.ratios[ct]);
		  ct++;
		} else {
		  (ratios[sIdx] as number[]).push((this.tuning[s] as NumObj).raised)
		}
	  } 
	});
	return ratios
  }

  get chikariPitches() {
	return [
	  new Pitch({ swara: 's', oct: 2, fundamental: this.fundamental }),
	  new Pitch({ swara: 's', oct: 1, fundamental: this.fundamental }),
	]
  }

  getFrequencies({
	low = 100,
	high = 800
  } = {}) {
	// returns all oct instances of raga's pitches that are between low and high
	const baseFreqs = this.ratios.map(r => r * this.fundamental);
	const freqs: number[] = [];
	baseFreqs.forEach(f => {
	  const lowExp = Math.ceil(Math.log2(low / f));
	  const highExp = Math.floor(Math.log2(high / f));
	  let range = [...Array(highExp - lowExp + 1).keys()].map(i => i + lowExp);
	  const exps = range.map(r => 2.0 ** r);
	  const additionalFreqs = exps.map(exp => f * exp);
	  freqs.push(...additionalFreqs)
	});
	freqs.sort((a, b) => (a - b));
	return freqs;
  }

  get sargamNames() {
	const names: string[] = [];
	const sargam = Object.keys(this.ruleSet);
	sargam.forEach(s => {
	  if (typeof(this.ruleSet[s]) === 'object') {
		const obj = this.ruleSet[s] as BoolObj;
		if (obj.lowered) {
		  const str = s.charAt(0).toLowerCase() + s.slice(1);
		  names.push(str)
		}
		if (obj.raised) {
		  const str = s.charAt(0).toUpperCase() + s.slice(1);
		  names.push(str)
		}
	  } else {
		if (this.ruleSet[s]) {
		  const str = s.charAt(0).toUpperCase() + s.slice(1);
		  names.push(str)
		}
	  }
	});
	return names
  }

  get swaraObjects() {
	const swaraObjs: { swara: number, raised: boolean }[] = [];
	const sargam = Object.keys(this.ruleSet);
	let idx = 0;
	sargam.forEach(s => {
	  if (typeof(this.ruleSet[s]) === 'object') {
		const obj = this.ruleSet[s] as BoolObj;
		if (obj.lowered) {
		  swaraObjs.push({ swara: idx, raised: false });
		}
		if (obj.raised) {
		  swaraObjs.push({ swara: idx, raised: true });
		}
		idx++;
	  } else {
		if (this.ruleSet[s]) {
		  swaraObjs.push({ swara: idx, raised: true });
		}
		idx++;
	  }
	});
	return swaraObjs
  }


  pitchFromLogFreq(logFreq: number) {
	const epsilon = 1e-6
	const options = this.getFrequencies({ low: 75, high: 2400 })
	  .map(f => Math.log2(f));
	const quantizedLogFreq = getClosest(options, logFreq);
	const logOffset = logFreq - quantizedLogFreq;
	let logDiff = quantizedLogFreq - Math.log2(this.fundamental);
	// for situations when logDiff is 0.99999999999991 or similar
	const roundedLogDiff = Math.round(logDiff)
	if (Math.abs(logDiff - roundedLogDiff) < epsilon) {
	  logDiff = roundedLogDiff
	}

	const octOffset = Math.floor(logDiff);
	logDiff -= octOffset;
	const rIdx = this.ratios.findIndex(r => closeTo(r, 2 ** logDiff));
	const swara = this.sargamLetters[rIdx];
	
	const raised = isUpperCase(swara);
	return new Pitch({ 
	  swara: swara, 
	  oct: octOffset, 
	  fundamental: this.fundamental,
	  ratios: this.stratifiedRatios,
	  logOffset: logOffset,
	  raised
	})
  }

  ratioIdxToTuningTuple(idx: number): [string, string | undefined] {
	const noteMapping: Array<[string, string | undefined]> = [];
	const sargamKeys = ["sa", "re", "ga", "ma", "pa", "dha", "ni"];
	sargamKeys.forEach(key => {
	  if (typeof this.ruleSet[key] === "object") {
		if (this.ruleSet[key].lowered) {
		  noteMapping.push([key, "lowered"]);
		}
		if (this.ruleSet[key].raised) {
		  noteMapping.push([key, "raised"]);
		}
	  } else {
		if (this.ruleSet[key]) {
		  noteMapping.push([key, undefined]);
		}
	  }
	});
	return noteMapping[idx];
  }

  

  toJSON() {
        return {
          name: this.name,
          fundamental: this.fundamental,
          ratios: this.ratios,
          tuning: this.tuning,
        }
  }

  static fromJSON(obj: any): Raga {
        return new Raga(obj);
  }
}

export { Raga };
