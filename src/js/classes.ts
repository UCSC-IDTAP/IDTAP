import { findLastIndex } from 'lodash';
import { v4 as uuidv4 } from 'uuid';
import { Meter } from './meter.ts';
import { 
  SecCatType,
  PhraseCatType,
  VibObjType,
  IdType,
  TrajIdFunction,
  OutputType,
  StrokeNicknameType,
  ArtNameType,
  SargamDisplayType,
  VowelDisplayType,
  ConsonantDisplayType,
  PhraseDivDisplayType,
  ChikariDisplayType,
  BolDisplayType,
  RuleSetType,
  BoolObj,
  NumObj,
  TuningType,
  ExcerptRange
} from '@/ts/types.ts';
import { Instrument } from '@/ts/enums.ts';
import { closeTo, getClosest, isUpperCase } from '@/ts/utils.ts';


const initSecCategorization = (): SecCatType => {
  return {
    "Pre-Chiz Alap": {
      "Pre-Chiz Alap": false
    },
    "Alap": {
      "Alap": false,
      "Jor": false,
      "Alap-Jhala": false
    },
    "Composition Type": {
      "Dhrupad": false,
      "Bandish": false,
      "Thumri": false,
      "Ghazal": false,
      "Qawwali": false,
      "Dhun": false,
      "Tappa": false,
      "Bhajan": false,
      "Kirtan": false,
      "Kriti": false,
      "Masitkhani Gat": false,
      "Razakhani Gat": false,
      "Ferozkhani Gat": false,
    },
    "Comp.-section/Tempo": {
      "Ati Vilambit": false,
      "Vilambit": false,
      "Madhya": false,
      "Drut": false,
      "Ati Drut": false,
      "Jhala": false,
    },
    "Tala": {
      "Ektal": false,
      "Tintal": false,
      "Rupak": false,
    },
    "Improvisation": {
      "Improvisation": false,
    },
    "Other": {
      "Other": false,
    },
    "Top Level": "None"
  }
}

const initPhraseCategorization = (): PhraseCatType => {
  return {
    "Phrase": {
      "Mohra": false,
      "Mukra": false,
      "Asthai": false,
      "Antara": false,
      "Manjha": false,
      "Abhog": false,
      "Sanchari": false,
      "Jhala": false
    },
    "Elaboration": {
      "Vistar": false,
      "Barhat": false,
      "Prastar": false,
      "Bol Banao": false,
      "Bol Alap": false,
      "Bol Bandt": false,
      "Behlava": false,
      "Gat-kari": false,
      "Tan (Sapat)": false,
      "Tan (Gamak)": false,
      "Laykari": false,
      "Tihai": false,
      "Chakradar": false,
    },
    "Vocal Articulation": {
      "Bol": false,
      "Non-Tom": false,
      "Tarana": false,
      "Aakar": false,
      "Sargam": false
    },
    "Instrumental Articulation": {
      "Bol": false,
      "Non-Bol": false
    },
    "Incidental": {
      "Talk/Conversation": false,
        "Praise ('Vah')": false,
        "Tuning": false,
        "Pause": false,
    }
  }
}

const chromaToScaleDegree = (chroma: number): [number, boolean] => {
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

const pitchNumberToChroma = (pitchNumber: number) => {
  let chroma = pitchNumber % 12;
  while (chroma < 0) {
    chroma += 12;
  }
  return chroma
}

/**
 * Generates an array of evenly spaced values between startVal and stopVal.
 * The number of values in the array is determined by cardinality.
 *
 * @param {number} startVal - The start value of the sequence.
 * @param {number} stopVal - The end value of the sequence.
 * @param {number} cardinality - The number of values to generate.
 * @returns {number[]} An array of evenly spaced values.
 */
const linSpace = (startVal: number, stopVal: number, cardinality: number) => {
  var arr = [];
  var step = (stopVal - startVal) / (cardinality - 1);
  for (var i = 0; i < cardinality; i++) {
    arr.push(startVal + (step * i));
  }
  return arr;
};

// type OutputType = 'pitchNumber' | 'chroma' | 'pitch' | 'pitchClass';

/**
 * Calculates the durations of fixed pitches in a set of trajectories.
 *
 * @param {Trajectory[]} trajs - An array of Trajectory objects.
 * @param {Object} options - An object containing optional parameters.
 * @param {number} options.inst - The instrument number. Default is 0.
 * @param {OutputType} options.outputType - The type of output. Can be 
 * 'pitchNumber', 'chroma', 'pitch', or 'pitchClass'. Default is 'pitchNumber'.
 * @param {'cumulative' | 'proportional'} options.countType - The type of count. 
 * Can be 'cumulative' or 'proportional'. Default is 'cumulative'.
 *
 * @returns {NumObj} An object where the keys are pitch numbers and the values 
 * are their corresponding durations.
 *
 * @throws {SyntaxError} If the durations of fixed pitches in a trajectory is 
 * not an object.
 */
const durationsOfFixedPitches = (trajs: Trajectory[], {
  inst = 0, 
  outputType = 'pitchNumber',
  countType = 'cumulative'  // 'cumulative' or 'proportional'
}: {
  inst?: number,
  outputType?: OutputType,
  countType?: 'cumulative' | 'proportional'
} = {}) => {
  const pitchDurs: NumObj = {};
  trajs.forEach(traj => {
    const trajPitchDurs = traj.durationsOfFixedPitches({ 
      outputType: outputType,
    });
    if (typeof trajPitchDurs !== 'object' || trajPitchDurs === null) {
      throw new SyntaxError(`invalid trajPitchDurs type, must be object: ` +
        `${trajPitchDurs}`)
    }
    Object.keys(trajPitchDurs).forEach(pitchNumber => {
      if (pitchDurs[pitchNumber]) {
        pitchDurs[pitchNumber] += trajPitchDurs[pitchNumber];
      } else {
        pitchDurs[pitchNumber] = trajPitchDurs[pitchNumber];
      }
    })
  })
  if (countType === 'cumulative') {
    return pitchDurs
  } else if (countType === 'proportional') {
    let totalDuration = 0;
    Object.keys(pitchDurs).forEach(pitchNumber => {
      totalDuration += pitchDurs[pitchNumber];
    })
    Object.keys(pitchDurs).forEach(pitchNumber => {
      pitchDurs[pitchNumber] /= totalDuration;
    })
    return pitchDurs
  }
}

const isObject = (argument: any) => {
  return typeof argument === 'object' && argument !== null
}

const getStarts = (durArray: number[]) => {
  const cumsum: (value: number) => number = (sum => value => sum += value)(0);
  return [0].concat(durArray.slice(0, durArray.length - 1)).map(cumsum)
};

const getEnds = (durArray: number[]) => {
  const cumsum: (value: number) => number = (sum => value => sum += value)(0);
  return durArray.map(cumsum)
}

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
    [scaleDegree, raised] = chromaToScaleDegree(chroma);
    return new Pitch({ 
      swara: scaleDegree,
      oct: oct,
      raised: raised,
      fundamental: fundamental
    })
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
}

class Articulation {
  name: ArtNameType;
  stroke: string | undefined;
  hindi: string | undefined;
  ipa: string | undefined;
  engTrans: string | undefined;
  strokeNickname: StrokeNicknameType | undefined;

  // pluck, hammer-off, hammer-on, slide, pluck, dampen
  constructor({
    name = 'pluck',
    stroke = undefined,
    hindi = undefined,
    ipa = undefined,
    engTrans = undefined,
    strokeNickname = undefined,
  }: {
    name?: ArtNameType,
    stroke?: string,
    hindi?: string,
    ipa?: string,
    engTrans?: string,
    strokeNickname?: StrokeNicknameType
  } = {}) {
    this.name = name
    if (stroke !== undefined) this.stroke = stroke;
    if (hindi !== undefined) this.hindi = hindi;
    if (ipa !== undefined) this.ipa = ipa;
    if (engTrans !== undefined) this.engTrans = engTrans;
    if (strokeNickname !== undefined) this.strokeNickname = strokeNickname;
    if (this.stroke === 'd' && this.strokeNickname === undefined) {
      this.strokeNickname = 'da'
    } else if (this.stroke === 'r' && this.strokeNickname === undefined) {
      this.strokeNickname = 'ra'
    }
  }
}

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

// type VibObjType = {
//   periods: number;
//   vertOffset: number;
//   initUp: boolean;
//   extent: number;
// }

// type IdType = 'id0' | 'id1' | 'id2' | 'id3' | 'id4' | 'id5' | 'id6' | 'id7' |
//   'id8' | 'id9' | 'id10' | 'id12' | 'id13';

// type TrajIdFunction =
//   ((x: number, lf?: number[], sl?: number, da?: number[]) => number) |
//   ((x: number, lf?: number[], da?: number[]) => number) |
//   ((x: number, lf?: number[], sl?: number) => number) |
//   ((x: number, lf?: number[]) => number) |
//   ((x: number) => number);

class Automation {
  // like an automation lane in a DAW, but in our case, applied to a particular
  // trajectory. Will be used for volume, but maybe something else would be 
  // useful too.
  values: { normTime: number, value: number }[]; // normalized time, from 0 - 1

  constructor({
    values = []
  }: {
    values?: { normTime: number, value: number }[]
  } = {}) {
    this.values = values;
    if (values.length == 0) {
      this.values.push({ normTime: 0, value: 1 });
      this.values.push({ normTime: 1, value: 1 });
    }
  }

  addValue(normTime: number, value: number) {
    if (normTime < 0 || normTime > 1) {
      throw new SyntaxError(`invalid normTime, must be between 0 and 1: ` + 
        `${normTime}`)
    }
    if (value < 0 || value > 1) {
      throw new SyntaxError(`invalid value, must be between 0 and 1: ` + 
        `${value}`)
    }
    // if the normTime is already in the values, then replace the value
    const idx = this.values.findIndex(v => v.normTime === normTime);
    if (idx !== -1) {
      this.values[idx].value = value;
    } else {
      this.values.push({ normTime, value });
      this.values.sort((a, b) => a.normTime - b.normTime);
    }
  }

  removeValue(idx: number) {
    if (idx < 0 || idx > this.values.length - 1) {
      throw new SyntaxError(`invalid idx, must be between 0 and ` + 
        `${this.values.length - 1}: ${idx}`)
    }
    if (idx === 0 || idx === this.values.length - 1) {
      throw new SyntaxError(`cannot remove first or last value`)
    }
    this.values.splice(idx, 1);
  }

  valueAtX(x: number) {
    if (x < 0 || x > 1) {
      throw new SyntaxError(`invalid x, must be between 0 and 1: ${x}`)
    }
    const idx = findLastIndex(this.values, v => v.normTime <= x);
    if (idx === -1) {
      throw new SyntaxError(`invalid x, must be between 0 and 1: ${x}`)
    } else if (idx === this.values.length - 1) {
      return this.values[idx].value;
    } else {
      const start = this.values[idx];
      const end = this.values[idx + 1];
      const slope = (end.value - start.value) / (end.normTime - start.normTime);
      return start.value + slope * (x - start.normTime);
    }
  }

  generateValueCurve(valueDur: number, duration: number, max: number = 1) {
    const valueCt = Math.round(duration / valueDur);
    let envelope = new Float32Array(valueCt+1);
    // sort values by normTime
    this.values.sort((a, b) => a.normTime - b.normTime);
    const normTimes = envelope.map((_, i) => i / valueCt);
    envelope = envelope.map((_, i) => max * this.valueAtX(normTimes[i]))
    return envelope;
  }

  partition(durArray: number[]) {
    // takes the current Automation, and partitions it into an array of 
    // Automations, splitting it up proportionally to the durArray

    // do so by getting the starting point and ending point of every durArray
    // chunk, using those time points to figure out some of the start and end
    // values for the new automations. Then, go through each value in the larger
    // automation, and if it falls within the range of the current durArray
    // chunk, then add it to the new automation. 
    const starts = getStarts(durArray);
    const ends = getEnds(durArray);
    const newAutomations: Automation[] = [];
    for (let i = 0; i < starts.length; i++) {
      const start = starts[i];
      const startVal = this.valueAtX(start);
      const end = ends[i];
      const endVal = this.valueAtX(end);
      const newAutomation = new Automation({ values: [
        { normTime: 0, value: startVal },
        { normTime: 1, value: endVal }
      ]});
      newAutomations.push(newAutomation);
    }
    this.values.forEach(v => {
      if (!starts.includes(v.normTime) && !ends.includes(v.normTime)) {
        for (let i = 0; i < starts.length; i++) {
          if (v.normTime > starts[i] && v.normTime < ends[i]) {
            const dur = ends[i] - starts[i];
            const relNormTime = (v.normTime - starts[i]) / dur;
            newAutomations[i].addValue(relNormTime, v.value);
          }
        } 
      }
    })
    return newAutomations;
  }

  static compress(automations: Automation[], durArray: number[]) {
    // take a sequence of automations, and compress them into a single one
    // that represents the entire sequence.
    let allValues: { normTime: number, value: number }[] = [];
    let durAccumulator = 0;
    automations.forEach((a, i) => {
      const dur = durArray[i];
      const relValues = a.values.map(v => {
        return { normTime: v.normTime * dur + durAccumulator, value: v.value }
      })
      allValues.push(...relValues);
      durAccumulator += dur;
    })
    // get rid of any duplicate normTimes
    allValues = allValues.filter((v, i, a) => {
      return a.findIndex(av => av.normTime === v.normTime) === i
    });
    // go through every set of three consective values, and if the slope from 
    // the first to middle is the same as from the middle to last one, get rid 
    // of the middle one. Each time you do this, you have to start over, because
    // the array has changed.
    let changed = true;
    while (changed) {
      changed = false;
      for (let i = 0; i < allValues.length - 2; i++) {
        const a = allValues[i];
        const b = allValues[i + 1];
        const c = allValues[i + 2];
        const slope1 = (b.value - a.value) / (b.normTime - a.normTime);
        const slope2 = (c.value - b.value) / (c.normTime - b.normTime);
        if (closeTo(slope1, slope2)) {
          allValues.splice(i + 1, 1);
          changed = true;
          break;
        }
      }
    }
    return new Automation({ values: allValues })
  }
}

class Trajectory {
  // archetypal motion from pitch to pitch, or through series of pitches
  id: number;
  pitches: Pitch[];
  durTot: number;
  durArray?: number[];
  slope: number;
  articulations: { [key: string]: Articulation };
  num: number | undefined;
  name: string | undefined;
  fundID12: number | undefined;
  vibObj: VibObjType;
  instrumentation: Instrument;
  vowel: string | undefined;
  vowelIpa: string | undefined;
  vowelHindi: string | undefined;
  vowelEngTrans: string | undefined;
  startConsonant: string | undefined;
  startConsonantHindi: string | undefined;
  startConsonantIpa: string | undefined;
  startConsonantEngTrans: string | undefined;
  endConsonant: string | undefined;
  endConsonantHindi: string | undefined;
  endConsonantIpa: string | undefined;
  endConsonantEngTrans: string | undefined;
  groupId?: string;
  ids: TrajIdFunction[];
  structuredNames: object;
  cIpas: string[];
  cIsos: string[];
  cHindis: string[];
  cEngTrans: string[];
  vIpas: string[];
  vIsos: string[];
  vHindis: string[];
  vEngTrans: string[];
  startTime: number | undefined;
  phraseIdx: number | undefined;
  names: string[];
  automation: Automation | undefined;
  uniqueId: string | undefined;

  get freqs() {
    return this.pitches.map(p => p.frequency)
  }

  get logFreqs() {
    return this.pitches.map(p => Math.log2(p.frequency))
  }

  constructor({
    id = 0,
    pitches = [new Pitch()],
    durTot = 1.0,
    durArray = undefined,
    slope = undefined,
    articulations = undefined,
    num = undefined,
    name = undefined,
    fundID12 = undefined,
    vibObj = undefined,
    instrumentation = Instrument.Sitar,
    vowel = undefined,
    vowelIpa = undefined,
    vowelHindi = undefined,
    vowelEngTrans = undefined,
    startConsonant = undefined,
    startConsonantHindi = undefined,
    startConsonantIpa = undefined,
    startConsonantEngTrans = undefined,
    endConsonant = undefined,
    endConsonantHindi = undefined,
    endConsonantIpa = undefined,
    endConsonantEngTrans = undefined,
    groupId = undefined,
    automation = undefined,
    uniqueId = undefined
  }: {
    id?: number,
    pitches?: Pitch[],
    durTot?: number,
    durArray?: number[],
    slope?: number,
    articulations?: { [key: string]: Articulation } | {},
    num?: number,
    name?: string,
    fundID12?: number,
    vibObj?: VibObjType,
    instrumentation?: Instrument,
    vowel?: string,
    vowelIpa?: string,
    vowelHindi?: string,
    vowelEngTrans?: string,
    startConsonant?: string,
    startConsonantHindi?: string,
    startConsonantIpa?: string,
    startConsonantEngTrans?: string,  
    endConsonant?: string,
    endConsonantHindi?: string,
    endConsonantIpa?: string,
    endConsonantEngTrans?: string,
    groupId?: string,
    automation?: Automation,
    uniqueId?: string
  } = {}) {
    this.names = [
      'Fixed',
      'Bend: Simple',
      'Bend: Sloped Start',
      'Bend: Sloped End',
      'Bend: Ladle',
      'Bend: Reverse Ladle',
      'Bend: Simple Multiple',
      'Krintin',
      'Krintin Slide',
      'Krintin Slide Hammer',
      'Dense Krintin Slide Hammer',
      'Slide',
      'Silent',
      'Vibrato'
    ];
    if (typeof(id) === 'number' && Number.isInteger(id)) {
      this.id = id
    } else {
      throw new SyntaxError(`invalid id type, must be int: ${id}`)
    }
    let isArr = Array.isArray(pitches);
    if (isArr && pitches.length > 0 && pitches.every(p => p instanceof Pitch)) {
      this.pitches = pitches
    } else if (pitches.length === 0) {
      this.pitches = pitches
    } else {
      throw new SyntaxError('invalid pitches type, must be array of Pitch: ' + 
        `${pitches}`)
    }

    if (typeof(durTot) === 'number') {
      this.durTot = durTot
    } else {
      throw new SyntaxError(`invalid durTot type, must be number: ${durTot}`)
    }
    this.durArray = durArray;

    if (slope === undefined) {
      this.slope = 2
    } else if (typeof(slope) === 'number') {
      this.slope = slope
    } else {
      throw new SyntaxError(`invalid slope type, must be number: ${slope}`)
    }
    if (vibObj === undefined) {
      this.vibObj = {
        periods: 8,
        vertOffset: 0,
        initUp: true,
        extent: 0.05
      }
    } else {
      this.vibObj = vibObj
    }
    if (articulations === undefined) {
      if (instrumentation === Instrument.Sitar) {
        this.articulations = {
          '0.00': new Articulation({
            name: 'pluck',
            stroke: 'd'
          })
        }
      } else {
        this.articulations = {}
      }
    } else {
      this.articulations = articulations
    }
    if (typeof(this.articulations) !== 'object') {
      throw new SyntaxError(`invalid articulations type, must be object: ` + 
        `${articulations}`)
    }
    this.num = num;
    this.name = name;
    this.name = this.name_;
    this.ids = [];
    for (let i = 0; i < 14; i++) {
      if (i !== 11) {
        const key: IdType = `id${i.toString()}` as IdType;
        this.ids.push(this[key].bind(this))
      } else {
        this.ids.push(this.id7.bind(this))
      }
    }
    this.fundID12 = fundID12;
    this.instrumentation = instrumentation;
    this.structuredNames = {
      fixed: 0,
      bend: {
        simple: 1,
        'sloped start': 2,
        'sloped end': 3,
        ladle: 4,
        'reverse ladle': 5,
        yoyo: 6,
      },
      krintin: {
        'krintin': 7,
        'krintin slide': 8,
        'krintin slide hammer': 9,
        'spiffy krintin slide hammer': 10
      },
      slide: 11,
      silent: 12,
      vibrato: 13
    };
    this.vowel = vowel;
    this.vowelIpa = vowelIpa;
    this.vowelHindi = vowelHindi;
    this.vowelEngTrans = vowelEngTrans;
    this.startConsonant = startConsonant;
    this.startConsonantHindi = startConsonantHindi;
    this.startConsonantIpa = startConsonantIpa;
    this.startConsonantEngTrans = startConsonantEngTrans;
    this.endConsonant = endConsonant;
    this.endConsonantHindi = endConsonantHindi;
    this.endConsonantIpa = endConsonantIpa;
    this.endConsonantEngTrans = endConsonantEngTrans;
    this.groupId = groupId;
    if (automation !== undefined) {
      this.automation = new Automation(automation);
    } else if (this.id === 12) {
      this.automation = undefined
    } else {
      this.automation = new Automation();
    }
    

    if (this.startConsonant !== undefined) {
      this.articulations['0.00'] = new Articulation({
        name: 'consonant',
        stroke: this.startConsonant,
        hindi: this.startConsonantHindi,
        ipa: this.startConsonantIpa
      })
    }

    if (this.endConsonant !== undefined) {
      this.articulations['1.00'] = new Articulation({
        name: 'consonant',
        stroke: this.endConsonant,
        hindi: this.endConsonantHindi,
        ipa: this.endConsonantIpa
      })
    }

    // adding proper articulations here, although it feels like it could be
    // done better. Gonna get tricky, because other stuff is done in the compute
    // in each id.]
    if (this.id < 4) {
      this.durArray = [1]
    } else if (this.durArray === undefined && this.id === 4) {
      this.durArray = [1 / 3, 2 / 3]
    } else if (this.durArray === undefined && this.id === 5) {
      this.durArray = [2 / 3, 1 / 3]
    } else if (this.durArray === undefined && this.id === 6) {
      this.durArray = Array.from({
        length: this.logFreqs.length - 1
      }, () => {
        return 1 / (this.logFreqs.length - 1)
      })
    } else if (this.id === 7) {
      if (this.durArray === undefined) this.durArray = [0.2, 0.8];
      const starts = getStarts(this.durArray);
      this.articulations[starts[1]] = new Articulation({
        name: this.logFreqs[1] >= this.logFreqs[0] ? 'hammer-on' : 'hammer-off'
      });
    } else if (this.id === 8) {
      if (this.durArray === undefined) this.durArray = [1 / 3, 1 / 3, 1 / 3];
      const starts = getStarts(this.durArray);
      this.articulations[starts[1]] = new Articulation({
        name: 'hammer-off'
      });
      this.articulations[starts[2]] = new Articulation({
        name: 'slide'
      });
    } else if (this.id === 9) {
      if (this.durArray === undefined) this.durArray = [0.25, 0.25, 0.25, 0.25];
      const starts = getStarts(this.durArray);
      this.articulations[starts[1]] = new Articulation({
        name: 'hammer-off'
      });
      this.articulations[starts[2]] = new Articulation({
        name: 'slide'
      });
      this.articulations[starts[3]] = new Articulation({
        name: 'hammer-on'
      });
    } else if (this.id === 10) {
      if (this.durArray === undefined) this.durArray = [...Array(6)].fill(1 / 6)
      const starts = getStarts(this.durArray);
      this.articulations[starts[1]] = new Articulation({
        name: 'slide'
      });
      this.articulations[starts[2]] = new Articulation({
        name: 'hammer-on'
      });
      this.articulations[starts[3]] = new Articulation({
        name: 'hammer-off'
      });
      this.articulations[starts[4]] = new Articulation({
        name: 'slide'
      });
      this.articulations[starts[5]] = new Articulation({
        name: 'hammer-on'
      });
    } else if (this.id === 11) {
      if (
        this.durArray === undefined || 
        (Array.isArray(this.durArray) && this.durArray.length === 1)
        ) {
        this.durArray = [0.5, 0.5]
      }
      const starts = getStarts(this.durArray);
      this.articulations[starts[1]] = new Articulation({
        name: 'slide'
      });
    }
    this.durArray?.forEach((d, idx) => {
      if (d === 0) {
        console.log('removing zero dur')
        this.durArray!.splice(idx, 1)
        this.logFreqs.splice(idx + 1, 1);
        this.pitches.splice(idx + 1, 1);
        this.freqs.splice(idx + 1, 1);
      }
    })

    const vox = ['Vocal (M)', 'Vocal (F)'];
    if (vox.includes(this.instrumentation)) {
      const keys = Object.keys(this.articulations)
      keys?.forEach(k => {
        if (this.articulations[k].name === 'pluck') {
          delete this.articulations[k]
        }
      })
    }
    this.cIpas = ['k', 'kʰ', 'g', 'gʱ', 'ŋ', 'c', 'cʰ', 'ɟ', 'ɟʱ', 'ɲ', 'ʈ', 
      'ʈʰ', 'ɖ', 'ɖʱ', 'n', 't', 'tʰ', 'd', 'dʱ', 'n̪', 'p', 'pʰ', 'b', 'bʱ', 
      'm', 'j', 'r', 'l', 'v', 'ʃ', 'ʂ', 's', 'h'];
    this.cIsos = ['ka', 'kha', 'ga', 'gha', 'ṅa', 'ca', 'cha', 'ja', 'jha', 
      'ña', 'ṭa', 'ṭha', 'ḍa', 'ḍha', 'na', 'ta', 'tha', 'da', 'dha', 'na', 
      'pa', 'pha', 'ba', 'bha', 'ma', 'ya', 'ra', 'la', 'va', 'śa', 'ṣa', 'sa', 
      'ha'];
    this.cHindis = ['क', 'ख', 'ग', 'घ', 'ङ', 'च', 'छ', 'ज', 'झ', 'ञ', 'ट', 
      'ठ', 'ड', 'ढ', 'न', 'त', 'थ', 'द', 'ध', 'न', 'प', 'फ़', 'ब', 'भ', 'म', 'य', 
      'र', 'ल', 'व', 'श', 'ष', 'स', 'ह'];
    this.cEngTrans = ['k', 'kh', 'g', 'gh', 'ṅ', 'c', 'ch', 'j', 'jh', 'ñ', 'ṭ', 
      'ṭh', 'ḍ', 'ḍh', 'n', 't', 'th', 'd', 'dh', 'n', 'p', 'ph', 'b', 'bh', 
      'm', 'y', 'r', 'l', 'v', 'ś', 'ṣ', 's', 'h'];
    this.vIpas = ['ə', 'aː', 'ɪ', 'iː', 'ʊ', 'uː', 'eː', 'ɛː', 'oː', 'ɔː', '_'];
    this.vIsos = ['a', 'ā', 'i', 'ī', 'u', 'ū', 'ē', 'ai', 'ō', 'au', '_'];
    this.vHindis = ['अ', 'आ', 'इ', 'ई', 'उ', 'ऊ', 'ए', 'ऐ', 'ओ', 'औ', '_'];
    this.vEngTrans = ['a', 'ā', 'i', 'ī', 'u', 'ū', 'ē', 'ai', 'ō', 'au', '_'];
    this.uniqueId = uniqueId;
    if (this.uniqueId === undefined) {
      this.uniqueId = uuidv4();
    }

    this.convertCIsoToHindiAndIpa()

    const artKeys = Object.keys(this.articulations);
    artKeys.forEach(k => {
      if (k === '0') {
        this.articulations['0.00'] = this.articulations[k];
        delete this.articulations[k];
      }
    })
  }

  updateFundamental(fundamental: number) {
    this.pitches.forEach(p => p.fundamental = fundamental)
  }

  get minFreq() {
    return Math.min(...this.freqs)
  }

  get maxFreq() {
    return Math.max(...this.freqs)
  }

  get minLogFreq() {
    return Math.min(...this.logFreqs)
  }

  get maxLogFreq() {
    return Math.max(...this.logFreqs)
  }

  get endTime() {
    if (this.startTime === undefined) return undefined
    return this.startTime + this.durTot
  }


  get name_() {
    // eventually this will replace regular `name`, just testing for now
    
    return this.names[this.id]
  }

  /**
    * Computes the value of a function identified by its id at a given point.
    * 
    * @param x - The point (on a scale from 0 to 1) at which the function is evaluated.
    * @param logScale - A boolean indicating whether the result should be in logarithmic scale. Default is false.
    * 
    * @returns The value of the function at point x. If logScale is true, the result is in logarithmic scale.
    */
  compute(x: number, logScale = false) {
    const value = this.ids[this.id](x);
    return logScale ? Math.log2(value) : value;
  }

  // x is always beteen zero and one

  id0(x: number, lf?: number[]): number { // steady state
    const logFreqs = lf === undefined ? this.logFreqs : lf;
    return 2 ** logFreqs[0]
  }

  id1(x: number, lf?: number[]): number { // half cosine interpolation
    const logFreqs = lf === undefined ? this.logFreqs : lf;
    const piX = (Math.cos(Math.PI * (x + 1)) / 2) + 0.5;
    const diff = logFreqs[1] - logFreqs[0];
    return 2 ** (piX * diff + logFreqs[0])

  }

  id2(x: number, lf?: number[], sl?: number): number { // asymptotic approach
    const logFreqs = lf === undefined ? this.logFreqs : lf;
    const slope = sl === undefined ? this.slope : sl;
    const a = logFreqs[0];
    const b = logFreqs[1];
    const logFreqOut = (a - b) * ((1 - x) ** slope) + b;
    return 2 ** logFreqOut
  }

  id3(x: number, lf?: number[], sl?: number): number { // reverse asymptote
    const logFreqs = lf === undefined ? this.logFreqs : lf;
    const slope = sl === undefined ? this.slope : sl;
    const a = logFreqs[0];
    const b = logFreqs[1];
    const logFreqOut = (b - a) * (x ** slope) + a;
    return 2 ** logFreqOut
  }

  id4(x: number, lf?: number[], sl?: number, da?: number[]): number { // ladle
    const logFreqs = lf === undefined ? this.logFreqs : lf;
    const slope = sl === undefined ? this.slope : sl;
    let durArray = da === undefined ? this.durArray : da;
    if (durArray === undefined) durArray = [1 / 3, 2 / 3];
    const bend0 = (x: number) => this.id2(x, logFreqs.slice(0, 2), slope);
    const bend1 = (x: number) => this.id1(x, logFreqs.slice(1, 3));
    const out0 = (x: number) => bend0(x / durArray![0]);
    const out1 = (x: number) => bend1((x - durArray![0]) / (durArray![1]));
    const out = (x: number) => x < durArray![0] ? out0(x) : out1(x);
    return out(x)
  }

  id5(x: number, lf?: number[], sl?: number, da?: number[]): number { 
    // reverse ladle, or 'setup'
    const logFreqs = lf === undefined ? this.logFreqs : lf;
    const slope = sl === undefined ? this.slope : sl;

    let durArray: number[] | undefined = da === undefined ? this.durArray : da;
    durArray = durArray || [1 / 3, 2 / 3];
    if (typeof(durArray) === 'undefined') {
      durArray = [2 / 3, 1 / 3];
    }

    const bend0 = (x: number) => this.id1(x, logFreqs.slice(0, 2));
    const bend1 = (x: number) => this.id3(x, logFreqs.slice(1, 3), slope);
    const out0 = (x: number) => bend0(x / durArray![0]);
    const out1 = (x: number) => bend1((x - durArray![0]) / (durArray![1]));
    const out = (x: number) => x < durArray![0] ? out0(x) : out1(x);
    return out(x)
  }


  id6(x: number, lf?: number[], da?: number[]): number { 
    // yoyo // make this one so it can be any length
    const logFreqs = lf === undefined ? this.logFreqs : lf;
    let durArray = da === undefined ? this.durArray : da;

    if (durArray === undefined) {
      durArray = Array.from({
        length: logFreqs.length - 1
      }, () => 1 / (logFreqs.length - 1))
    }
    const bends = Array.from({
      length: logFreqs.length - 1
    }, (_, i) => {
      return (x: number) => this.id1(x, logFreqs.slice(i, i + 2))
    });

    const outs = Array.from({
      length: logFreqs.length - 1
    }, (_, i) => {
      let durSum = i === 0 ? 
        0 : 
        durArray!.slice(0, i).reduce((a, b) => a + b, 0);
      return (x: number) => bends[i]((x - durSum) / durArray![i])
    });
    const out = (x: number) => {
      const starts = getStarts(durArray!);
      const index = findLastIndex(starts, s => x >= s);
      if (index === -1) {
        console.log(outs, index)
      }
      return outs[index](x)
    };
    return out(x)
  }

  id7(x: number, lf?: number[], da?: number[]): number { // simple krintin
    const logFreqs = lf === undefined ? this.logFreqs : lf;
    let durArray = da === undefined ? this.durArray : da;
    if (durArray === undefined) durArray = [0.5, 0.5];
    const out = x < durArray[0] ? logFreqs[0] : logFreqs[1];
    return 2 ** out
  }

  id8(x: number, lf?: number[], da?: number[]): number { // krintin slide
    const logFreqs = lf === undefined ? this.logFreqs : lf;
    let durArray = da === undefined ? this.durArray : da;
    if (durArray === undefined) durArray = [1 / 3, 1 / 3, 1 / 3];
    const starts = getStarts(durArray);
    const index = findLastIndex(starts, s => x >= s);
    return 2 ** logFreqs[index]
  }

  id9(x: number, lf?: number[], da?: number[]): number { // krintin slide hammer
    const logFreqs = lf === undefined ? this.logFreqs : lf;
    let durArray = da === undefined ? this.durArray : da;
    if (durArray === undefined) durArray = [1 / 4, 1 / 4, 1 / 4, 1 / 4];
    const starts = getStarts(durArray);
    const index = findLastIndex(starts, s => x >= s);
    return 2 ** logFreqs[index]
  }

  id10(x: number, lf?: number[], da?: number[]): number { 
    // fancy krintin slide hammer
    const logFreqs = lf === undefined ? this.logFreqs : lf;
    let durArray = da === undefined ? this.durArray : da;
    if (durArray === undefined) durArray = [...Array(6)].map((_, i) => i / 6);
    const starts = getStarts(durArray);
    const index = findLastIndex(starts, s => x >= s);
    return 2 ** logFreqs[index]
  }
  // eslint-disable-next-line no-unused-vars
  id12(x: number): number {
    return this.fundID12!
  }

  id13(x: number): number {
    // vib object includes: periods, vertOffset, initUp, extent
    
    const periods = this.vibObj.periods;
    let vertOffset = this.vibObj.vertOffset;
    const initUp = this.vibObj.initUp;
    const extent = this.vibObj.extent;
    if (Math.abs(vertOffset) > extent / 2) {
      vertOffset = Math.sign(vertOffset) * extent / 2;
    }
    let out = Math.cos(x * 2 * Math.PI * periods + Number(initUp) * Math.PI);
    if (x < 1 / (2 * periods)) {
      const start = this.logFreqs[0];
      const end = Math.log2(this.id13(1 / (2 * periods)));
      const middle = (end + start) / 2;
      const ext = Math.abs(end - start) / 2;
      out = out * ext + middle;
      return 2 ** out
    } else if (x > 1 - 1 / (2 * periods)) {
      const start = Math.log2(this.id13(1 - 1 / (2 * periods)));
      const end = this.logFreqs[0];
      const middle = (end + start) / 2;
      const ext = Math.abs(end - start) / 2;
      out = out * ext + middle;
      return 2 ** out
    } else {
      return 2 ** (out * extent / 2 + vertOffset + this.logFreqs[0])
    }
  }

  removeConsonant(start=true) {
    if (start) {
      this.startConsonant = undefined;
      this.startConsonantHindi = undefined;
      this.startConsonantIpa = undefined;
      this.startConsonantEngTrans = undefined;
      const art = this.articulations['0.00'];
      if (art && art.name === 'consonant') {
        delete this.articulations['0.00'];
      }
    } else {
      this.endConsonant = undefined;
      this.endConsonantHindi = undefined;
      this.endConsonantIpa = undefined;
      this.endConsonantEngTrans = undefined;
      const art = this.articulations['1.00'];
      if (art && art.name === 'consonant') {
        delete this.articulations['1.00'];
      }
    }
  }

  addConsonant(consonant: string, start=true) {
    const idx = this.cIsos.indexOf(consonant);
    const hindi = this.cHindis[idx];
    const ipa = this.cIpas[idx];
    const engTrans = this.cEngTrans[idx];
    const art = new Articulation({
      name: 'consonant',
      stroke: consonant,
      hindi: hindi,
      ipa: ipa,
      engTrans: engTrans,
    });
    if (start) {
      this.startConsonant = consonant;
      this.startConsonantHindi = hindi;
      this.startConsonantIpa = ipa;
      this.startConsonantEngTrans = engTrans
      this.articulations['0.00'] = art;
    } else {
      this.endConsonant = consonant;
      this.endConsonantHindi = hindi;
      this.endConsonantIpa = ipa;
      this.endConsonantEngTrans = engTrans;
      this.articulations['1.00'] = art;
    }
  }

  changeConsonant(consonant: string, start=true) {
    const idx = this.cIsos.indexOf(consonant);
    const hindi = this.cHindis[idx];
    const ipa = this.cIpas[idx];
    const engTrans = this.cEngTrans[idx];
    if (start) {
      this.startConsonant = consonant;
      this.startConsonantHindi = hindi;
      this.startConsonantIpa = ipa;
      this.startConsonantEngTrans = engTrans;
      const art = this.articulations['0.00'];
      art.stroke = consonant;
      art.hindi = hindi;
      art.ipa = ipa;
      art.engTrans = engTrans;
    } else {
      this.endConsonant = consonant;
      this.endConsonantHindi = hindi;
      this.endConsonantIpa = ipa;
      this.endConsonantEngTrans = engTrans;
      const art = this.articulations['1.00'];
      art.stroke = consonant;
      art.hindi = hindi;
      art.ipa = ipa;
      art.engTrans = engTrans;
    }
  }

  durationsOfFixedPitches({ outputType = 'pitchNumber' }: 
    { outputType?: string } = {} ): NumObj {
    const pitchDurs: NumObj = {};
    switch (this.id.toString()) {
      case '0':
      case '13': 
        pitchDurs[this.pitches[0].numberedPitch] = this.durTot;
        break
      case '1':
      case '2':
      case '3':
        if (this.pitches[0].numberedPitch === this.pitches[1].numberedPitch) {
          pitchDurs[this.pitches[0].numberedPitch] = this.durTot;
        }
        break
      case '4':
      case '5':
        let p0 = this.pitches[0].numberedPitch;
        let p1 = this.pitches[1].numberedPitch;
        let p2 = this.pitches[2].numberedPitch;
        if (p0 === p1) {
          pitchDurs[p0] = this.durTot * this.durArray![0];
        } else if (p1 === p2) {
          if (pitchDurs[p1]) {
            pitchDurs[p1] += this.durTot * this.durArray![1];
          } else {
            pitchDurs[p1] = this.durTot * this.durArray![1];
          }
        }
        break
      case '6':
        let lastNum: number | undefined = undefined;
        this.pitches.forEach((p, i) => {
          const num = p.numberedPitch;
          if (num === lastNum) {
            if (pitchDurs[num]) {
              pitchDurs[num] += this.durTot * this.durArray![i-1];
            } else {
              pitchDurs[num] = this.durTot * this.durArray![i-1];
            }
          }
          lastNum = num;
        });
        break
      case '7':
      case '8':
      case '9':
      case '10':
      case '11':
        this.pitches.forEach((p, i) => {
          const num = p.numberedPitch;
          if (this.durArray![i] !== undefined) {
            if (pitchDurs[num]) {
              pitchDurs[num] += this.durTot * this.durArray![i];
            } else {
              pitchDurs[num] = this.durTot * this.durArray![i];
            }
          }
        });
        break
    }
    if (outputType === 'pitchNumber') {
      return pitchDurs
    } else if (outputType === 'chroma') {
      const altPitchDurs: {[key: number]: number } = {};
      Object.keys(pitchDurs).forEach(p => {
        let chromaPitch = pitchNumberToChroma(Number(p))
        altPitchDurs[chromaPitch] = pitchDurs[p];
      });
      return altPitchDurs
    } else if (outputType === 'scaleDegree') {
      const altPitchDurs: { [key: number]: number } = {};
      Object.keys(pitchDurs).forEach(p => {
        const chromaPitch = pitchNumberToChroma(Number(p));
        const scaleDegree = chromaToScaleDegree(chromaPitch)[0];
        altPitchDurs[scaleDegree] = pitchDurs[p];
      });
      return altPitchDurs
    } else if (outputType === 'sargamLetter') {
      const altPitchDurs: NumObj = {};
      Object.keys(pitchDurs).forEach(p => {
        const sargamLetter = Pitch.fromPitchNumber(Number(p)).sargamLetter;
        altPitchDurs[sargamLetter] = pitchDurs[p];
      });
      return altPitchDurs
    } else {
      throw new Error('outputType not recognized')
    }
  }

  convertCIsoToHindiAndIpa() {
    // if the consonants and vowels are in cIso_15919, add fields for hindi and 
    // ipa. If that works, delete the cIso_15919 fields.

    const keys = Object.keys(this.articulations);
    keys.forEach(key => {
      const art = this.articulations[key];
      if (art.name === 'consonant') {
        if (typeof(art.stroke) !== 'string') {
          throw new Error('stroke is not a string')
        }
        const cIso = art.stroke;
        const idx = this.cIsos.indexOf(cIso);
        if (!art['hindi']) {
          art['hindi'] = this.cHindis[idx];
        } 
        if (!art['ipa']) {
          art['ipa'] = this.cIpas[idx];
        }
        if (!art['engTrans']) {
          art['engTrans'] = this.cEngTrans[idx];
        }
      }
    })
    if (this.startConsonant !== undefined) {
      const cIso = this.startConsonant;
      const idx = this.cIsos.indexOf(cIso);
      if (!this.startConsonantHindi) {
        this.startConsonantHindi = this.cHindis[idx];
      }
      if (!this.startConsonantIpa) {
        this.startConsonantIpa = this.cIpas[idx];
      }
      if (!this.startConsonantEngTrans) {
        this.startConsonantEngTrans = this.cEngTrans[idx];
      }
    }
    if (this.endConsonant !== undefined) {
      const cIso = this.endConsonant;
      const idx = this.cIsos.indexOf(cIso);
      if (!this.endConsonantHindi) {
        this.endConsonantHindi = this.cHindis[idx];
      }
      if (!this.endConsonantIpa) {
        this.endConsonantIpa = this.cIpas[idx];
      }
      if (!this.endConsonantEngTrans) {
        this.endConsonantEngTrans = this.cEngTrans[idx];
      }
    }
    if (this.vowel !== undefined) {
      const vIso = this.vowel;
      const idx = this.vIsos.indexOf(vIso);
      if (!this.vowelHindi) {
        this.vowelHindi = this.vHindis[idx];
      }
      if (!this.vowelIpa) {
        this.vowelIpa = this.vIpas[idx];
      }
      if (!this.vowelEngTrans) {
        this.vowelEngTrans = this.vEngTrans[idx];
      }
    }
  }

  updateVowel(vIso: string) {
    const idx = this.vIsos.indexOf(vIso);
    this.vowel = vIso;
    this.vowelHindi = this.vHindis[idx];
    this.vowelIpa = this.vIpas[idx];
    this.vowelEngTrans = this.vEngTrans[idx];
  }

  toJSON() {
    return {
      id: this.id,
      pitches: this.pitches,
      durTot: this.durTot,
      durArray: this.durArray,
      slope: this.slope,
      articulations: this.articulations,
      startTime: this.startTime,
      num: this.num,
      name: this.name,
      fundID12: this.fundID12,
      vibObj: this.vibObj,
      instrumentation: this.instrumentation,
      vowel: this.vowel,
      startConsonant: this.startConsonant,
      startConsonantHindi: this.startConsonantHindi,
      startConsonantIpa: this.startConsonantIpa,
      startConsonantEngTrans: this.startConsonantEngTrans,
      endConsonant: this.endConsonant,
      endConsonantHindi: this.endConsonantHindi,
      endConsonantIpa: this.endConsonantIpa,
      endConsonantEngTrans: this.endConsonantEngTrans,
      groupId: this.groupId,
      automation: this.automation,
      uniqueId: this.uniqueId,
    }
  }

  static names() {
    const traj = new Trajectory();
    return traj.names
  }
  // skip id 11, same code as id 7, just different articulation
}



class Group { 
  trajectories: Trajectory[];
  id: string;
  //  a group of adjacent trajectories, cloneable for copy and paste
  // takes the trajectories as input (they should have already been tested for 
  // adjacency, but testing again just in case).
  // this will sit in in the phrase object, within a `groupsGrid` nested array. 
  // A reference to this group, via ID, is held in each relevent trajectory.
  // (if we held the group itself in the traj, we would get circularity ...)

  // when reconstructing this upon loading the piece from JSON, need to make 
  // sure that the trajectories involved are the same real ones.


  constructor({
    trajectories = [],
    id = undefined,
  }: {
    trajectories?: Trajectory[],
    id?: string,
  } = {}) {
    this.trajectories = trajectories;

    this.trajectories.sort((a, b) => {
      if (a.num === undefined || b.num === undefined) {
        throw new Error('Trajectory must have a num')
      }
      return a.num - b.num
    });
    if (this.trajectories.length < 2) {
      throw new Error('Group must have at least 2 trajectories')
    }
    if (!this.testForAdjacency()) {
      throw new Error('Trajectories are not adjacent')
    }
    
    if (id === undefined) {
      id = uuidv4();
    }
    this.id = id;
    this.trajectories.forEach(traj => {
      traj.groupId = this.id;
    })
  }

  get minFreq() {
    const out = Math.min(...this.trajectories.map(t => t.minFreq));
    return out
  }

  get maxFreq() {
    const out = Math.max(...this.trajectories.map(t => t.maxFreq));
    return out
  }

  allPitches(repetition: boolean = true) {
    let allPitches: Pitch[] = [];
    this.trajectories.forEach(traj => {
      if (traj.id !== 12) {
        allPitches.push(...traj.pitches)
      }
    });
    if (!repetition) {
      allPitches = allPitches.filter((pitch, i) => {
        const c1 = i === 0;
        const c2 = pitch.swara === allPitches[i-1]?.swara;
        const c3 = pitch.oct === allPitches[i-1]?.oct;
        const c4 = pitch.raised === allPitches[i-1]?.raised;
        return c1 || !(c2 && c3 && c4)
      })
    }
    return allPitches
  }

  testForAdjacency() {
    const uniquePIdxs = [...new Set(this.trajectories.map(t => t.phraseIdx))];
    if (uniquePIdxs.length === 1) {
      this.trajectories.sort((a, b) => {
        if (a.num === undefined || b.num === undefined) {
          throw new Error('Trajectory must have a num')
        }
        return a.num - b.num
      });
      const nums = this.trajectories.map(t => {
        if (t.num === undefined) {
          throw new Error('Trajectory must have a num')
        }
        return t.num
      });
      const diffs = nums.slice(1).map((num, nIdx) => {
          return num - nums[nIdx];
      })
      return diffs.every(diff => diff === 1)
    } else {
      return false
    }
  }

  addTraj(traj: Trajectory) {
    this.trajectories.push(traj);
    this.trajectories.sort((a, b) => {
      if (a.num === undefined || b.num === undefined) {
        throw new Error('Trajectory must have a num')
      }
      return a.num - b.num
    });
    if (!this.testForAdjacency()) {
      throw new Error('Trajectories are not adjacent')
    }
    traj.groupId = this.id;
  }

  toJSON() {
    return {
      trajectories: this.trajectories,
      id: this.id
    }
  }
}


class Phrase {
  startTime?: number;
  raga?: Raga;
  trajectoryGrid: Trajectory[][];
  chikariGrid: { [key: string]: Chikari }[];
  instrumentation: string[];
  groupsGrid: Group[][];
  durTot?: number;
  durArray?: number[];
  // chikaris: { [key: string]: Chikari };
  pieceIdx?: number;
  categorizationGrid: PhraseCatType[];
  uniqueId: string;
  
  constructor({
    trajectories = [],
    durTot = undefined,
    durArray = undefined,
    chikaris = {},
    raga = undefined,
    startTime = undefined,
    trajectoryGrid = undefined,
    chikariGrid = undefined,
    instrumentation = ['Sitar'],
    groupsGrid = undefined,
    categorizationGrid = undefined,
    uniqueId = undefined,
  }: {
    trajectories?: Trajectory[],
    durTot?: number,
    durArray?: number[],
    chikaris?: { [key: string]: Chikari },
    raga?: Raga,
    startTime?: number,
    trajectoryGrid?: Trajectory[][],
    chikariGrid?: { [key: string]: Chikari }[],
    instrumentation?: string[],
    groupsGrid?: Group[][],
    categorizationGrid?: PhraseCatType[],
    uniqueId?: string,
  } = {}) {
    if (uniqueId === undefined) {
      this.uniqueId = uuidv4();
    } else {
      this.uniqueId = uniqueId;
    }
    this.startTime = startTime;
    this.raga = raga;
    if (trajectoryGrid !== undefined) {
      this.trajectoryGrid = trajectoryGrid;
      for (let i = trajectoryGrid.length; i < instrumentation.length; i++) {
        this.trajectoryGrid.push([])
      }
      this.trajectoryGrid.length = instrumentation.length;
    } else {
      this.trajectoryGrid = [trajectories];
      for (let i = 1; i < instrumentation.length; i++) {
        this.trajectoryGrid.push([])
      }
    }
    if (chikariGrid !== undefined) {
      this.chikariGrid = chikariGrid;
      for (let i = chikariGrid.length; i < instrumentation.length; i++) {
        this.chikariGrid.push({})
      }
      this.chikariGrid.length = instrumentation.length;
    } else {
      this.chikariGrid = [chikaris];
      for (let i = 1; i < instrumentation.length; i++) {
        this.chikariGrid.push({})
      }
    }
    if (this.trajectories.length === 0) {
      if (durTot === undefined) {
        this.durTot = 1;
        this.durArray = [];
      } else {
        this.durTot = durTot;
        this.durArray = []
      }
    } else {
      this.durTotFromTrajectories();
      this.durArrayFromTrajectories();
      if (durTot !== undefined && this.durTot !== durTot) {
        this.trajectories.forEach(t => {
          t.durTot = t.durTot * durTot / this.durTot!
        });
        this.durTot = durTot;
      }
      if (durArray !== undefined && this.durArray !== durArray) {
        this.trajectories.forEach((t, i) => {
          t.durTot = t.durTot * durArray[i] / this.durArray![i]
        })
        this.durArray = durArray;
        this.durTotFromTrajectories()
      }
    }
    this.assignStartTimes();
    this.assignTrajNums();
    this.instrumentation = instrumentation;
    if (groupsGrid !== undefined) {
      this.groupsGrid = groupsGrid;
    } else {
      this.groupsGrid = this.instrumentation.map(() => []);
    }
    this.categorizationGrid = categorizationGrid || [];
    if (this.categorizationGrid.length === 0) {
      for (let i = 0; i < this.trajectoryGrid.length; i++) {
        this.categorizationGrid.push(initPhraseCategorization())
      }
    }
    if (this.categorizationGrid[0].Elaboration['Bol Alap'] === undefined) {
      this.categorizationGrid.forEach(cat => {
        cat.Elaboration['Bol Alap'] = false;
      })
    }
  }

  updateFundamental(fundamental: number) {
    this.trajectories.forEach(traj => traj.updateFundamental(fundamental))
  }

  getGroups(idx = 0) {
    if (this.groupsGrid[idx] !== undefined) {
      return this.groupsGrid[idx]
    } else {
      throw new Error('No groups for this index')
    }
  }

  getGroupFromId(id: string) {
    const allGroups: Group[] = [];
    this.groupsGrid.forEach(groups => allGroups.push(...groups));
    return allGroups.find(g => g.id === id)
  }

  assignPhraseIdx() {
    this.trajectories.forEach(traj => traj.phraseIdx = this.pieceIdx)
  }

  assignTrajNums() {
    this.trajectories.forEach((traj, i) => traj.num = i)
  }

  durTotFromTrajectories() {
    this.durTot = this.trajectories
      .map(t => t.durTot)
      .reduce((a, b) => a + b, 0)
  }

  durArrayFromTrajectories() {
    this.durTotFromTrajectories();
    this.durArray = this.trajectories.map(t => t.durTot / this.durTot!);
  }

  compute(x: number, logScale = false) {
    if (this.durArray === undefined ) {
      throw new Error('durArray is undefined')
    }
    if (this.durArray.length === 0) {
      return null
    } else {
      const starts = getStarts(this.durArray);
      const index = findLastIndex(starts, s => x >= s);
      const innerX = (x - starts[index]) / this.durArray[index];
      const traj = this.trajectories[index];
      
      return traj.compute(innerX, logScale)
    }
  }

  realignPitches() {
    this.trajectories.forEach(traj => {
      traj.pitches = traj.pitches.map(p => {
        p.ratios = this.raga!.stratifiedRatios;
        return new Pitch(p)
      })
    })
  }

  assignStartTimes() {
    if (this.durArray === undefined) {
      throw new Error('durArray is undefined')
    }
    if (this.durTot === undefined) {
      throw new Error('durTot is undefined')
    }
    const starts = getStarts(this.durArray).map(s => s * this.durTot!)
    this.trajectories.forEach((traj, i) => {
      traj.startTime = starts[i]
    })
  }

  getRange() {
    // returns an object with the lowest and highest pitches in the phrase
    const allPitches = this.trajectories.map(t => t.pitches).flat();
    allPitches.sort((a, b) => a.frequency - b.frequency);
    let low = allPitches[0];
    let high = allPitches[allPitches.length - 1];
    const low_ = {
      frequency: low?.frequency,
      swara: low?.swara,
      oct: low?.oct,
      raised: low?.raised,
      numberedPitch: low?.numberedPitch,
    };
    const high_ = {
      frequency: high?.frequency,
      swara: high?.swara,
      oct: high?.oct,
      raised: high?.raised,
      numberedPitch: high?.numberedPitch,
    }
    return {
      min: low_,
      max: high_
    }
  }

  consolidateSilentTrajs() {
    // within phrase, if there are ever two or more silent trajectories in a 
    // row, consolidate them into one.
    let chain = false;
    let start: number | undefined = undefined;
    const delIdxs: number[] = [];
    this.trajectories.forEach((traj, i) => {
      if (traj.id === 12) {
        if (chain === false) {
          start = i;
          chain = true
        }
        if (i === this.trajectories.length - 1) {
          if (start === undefined) {
            throw new Error('start is undefined')
          }
          const extraDur = this.trajectories
            .slice(start+1)
            .map(t => t.durTot)
            .reduce((a, b) => a + b, 0);
          this.trajectories[start].durTot += extraDur;
          const dIdxs = [...Array(this.trajectories.length - start - 1)]
            .map((_, i) => i + start! + 1);
          delIdxs.push(...dIdxs)
        }
      } else {
        if (chain === true) {
          if (start === undefined) {
            throw new Error('start is undefined')
          }
          const extraDur = this.trajectories
            .slice(start+1, i)
            .map(t => t.durTot)
            .reduce((a, b) => a + b, 0);
          const dIdxs = [...Array(i - (start+1))].map((_, i) => i + start! + 1);
          this.trajectories[start].durTot += extraDur;
          delIdxs.push(...dIdxs);
          chain = false;
          start = undefined;
        }
      }
    });
    const newTs = this.trajectories.filter(traj => {
      if (traj.num === undefined) {
        console.log(traj)
        throw new Error('traj.num is undefined')
      }
      return !delIdxs.includes(traj.num)
    });
    // this.trajectories = newTrajs;
    this.trajectoryGrid[0] = newTs;
    this.durArrayFromTrajectories();
    this.assignStartTimes();
    this.assignTrajNums();
    this.assignPhraseIdx();
  }

  chikarisDuringTraj(traj: Trajectory, track: number) {
    const start = traj.startTime!;
    const dur = traj.durTot;
    const end = start + dur;
    const chikaris = this.chikariGrid[0];
    const chikarisDuring = Object.keys(chikaris).filter(k => {
      const chikari = chikaris[k];
      const time = Number(k);
      return time >= start && time <= end
    }).map(k => {
      const realTime = Number(k) + this.startTime!;
      const cd: ChikariDisplayType = {
        time: realTime,
        phraseTimeKey: k,
        phraseIdx: this.pieceIdx!,
        track: track,
        chikari: chikaris[k],
        uId: chikaris[k].uniqueId
      }
      return cd
  });
    return chikarisDuring
  }

  get trajectories() {
    return this.trajectoryGrid[0]
  }

  get chikaris() {
    return this.chikariGrid[0]
  }

  set chikaris(chikaris: { [key: string]: Chikari }) {
    this.chikariGrid[0] = chikaris
  }

  get swara() {
    const swara: object[] = [];
    if (this.startTime === undefined) {
      throw new Error('startTime is undefined')
    }
    this.trajectories.forEach(traj => {
      if (traj.id !== 12) {
        if (traj.durArray === undefined) {
          throw new Error('traj.durArray is undefined')
        }
        if (traj.startTime === undefined) {
          throw new Error('traj.startTime is undefined')
        }
        if (traj.durArray.length === traj.pitches.length - 1) {
          traj.pitches.slice(0, traj.pitches.length - 1).forEach((pitch, i) => {
            const st = this.startTime! + traj.startTime!;
            const obj = {
              pitch: pitch,
              time: st + getStarts(traj.durArray!)[i] * traj.durTot
            };       
            swara.push(obj)
          })
        } else {
          traj.pitches.forEach((pitch, i) => {
            const st = this.startTime! + traj.startTime!;
            const obj = {
              pitch: pitch,
              time: st + getStarts(traj.durArray!)[i] * traj.durTot
            };
            obj.pitch = pitch;
            swara.push(obj)
          })
        }
      }
    });
    return swara
  }

  allPitches(repetition: boolean = true) {
    let allPitches: Pitch[] = [];
    this.trajectories.forEach(traj => {
      if (traj.id !== 12) {
        allPitches.push(...traj.pitches)
      }
    });
    if (!repetition) {
      allPitches = allPitches.filter((pitch, i) => {
        const c1 = i === 0;
        const c2 = pitch.swara === allPitches[i-1]?.swara;
        const c3 = pitch.oct === allPitches[i-1]?.oct;
        const c4 = pitch.raised === allPitches[i-1]?.raised;
        return c1 || !(c2 && c3 && c4)
      })
    }
    return allPitches
  }

  firstTrajIdxs() {
    // returns the indexes of each traj that non-silent and 1) is the first of 
    // the phrase, or 2) is preceded by a silent traj, or 3) has a starting 
    // consonant, or 4) follows a traj that has an ending consonant, or 5) is a
    // different vowel than the previous non silent traj
    // for the purpose of displaying vowels in vocal notation
    const idxs: number[] = [];
    let ct = 0;
    let silentTrigger = false;
    let lastVowel: string | undefined = undefined;
    let endConsonantTrigger: boolean | undefined = undefined;
    this.trajectories.forEach((traj, tIdx) => {
      if (traj.id !== 12) {
        const c1 = ct === 0;
        const c2 = silentTrigger;
        const c3 = traj.startConsonant !== undefined;
        const c4 = endConsonantTrigger;
        const c5 = traj.vowel !== lastVowel;
        if (c1 || c2 || c3 || c4 || c5) {
          idxs.push(tIdx);
        }
        ct += 1;
        endConsonantTrigger = traj.endConsonant !== undefined;
        lastVowel = traj.vowel;
      }
      silentTrigger = traj.id === 12;
    });
    return idxs
  }

  trajIdxFromTime(time: number) {
    const phraseTime = time - this.startTime!;
    const trajs = this.trajectories.filter(traj => {
      const smallOffset = 1e-10;
      const a = phraseTime >= traj.startTime! - smallOffset;
      const b = phraseTime < traj.startTime! + traj.durTot;
      return a && b
    })
    if (trajs.length === 0) {
      // breakpoint
      throw new Error('No trajectory found')
    }
    return trajs[0].num
  }

  toJSON() {
    return {
      durTot: this.durTot,
      durArray: this.durArray,
      chikaris: this.chikaris,
      raga: this.raga,
      startTime: this.startTime,
      trajectoryGrid: this.trajectoryGrid,
      instrumentation: this.instrumentation,
      groupsGrid: this.groupsGrid,
      categorizationGrid: this.categorizationGrid,
      uniqueId: this.uniqueId,
    }
  }

  toNoteViewPhrase() {
    const pitches: Pitch[] = [];
    this.trajectories.forEach(traj => {
      if (traj.id !== 0) {
        traj.pitches.forEach(pitch => pitches.push(pitch))
      } else if (Object.keys(traj.articulations).length > 0) {
        traj.pitches.forEach(pitch => pitches.push(pitch))
      }
    })
    const nvPhrase = new NoteViewPhrase({
      pitches: pitches,
      durTot: this.durTot,
      raga: this.raga,
      startTime: this.startTime
    });
    return nvPhrase
  }
  
  reset() {
    this.durArrayFromTrajectories();
    this.assignStartTimes();
    this.assignPhraseIdx();
    this.assignTrajNums();
  }
}

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

class Piece {
  // phrases: Phrase[];
  durTot?: number;
  // durArray?: number[];
  raga: Raga;
  title: string;
  dateCreated: Date;
  dateModified: Date;
  location: string;
  _id?: string;
  audioID?: string;
  audio_DB_ID?: string;
  userID?: string;
  name?: string;
  family_name?: string;
  given_name?: string;
  permissions?: string;
  instrumentation: Instrument[];
  possibleTrajs: { [key: string]: number[] };
  meters: Meter[];
  // sectionCategorization: SecCatType[];
  explicitPermissions: {
    edit: string[],
    view: string[],
    publicView: boolean
  };
  soloist?: string;
  soloInstrument?: string;
  phraseGrid: Phrase[][];
  durArrayGrid: number[][];
  sectionStartsGrid: number[][];
  sectionCatGrid: SecCatType[][];
  excerptRange?: ExcerptRange;



  constructor({
    phrases = [],
    durTot = undefined,
    durArray = undefined,
    raga = new Raga(),
    title = 'untitled',
    dateCreated = new Date(),
    dateModified = new Date(),
    location = 'Santa Cruz',
    _id = undefined,
    audioID = undefined,
    audio_DB_ID = undefined,
    userID = undefined,
    name = undefined,
    family_name = undefined,
    given_name = undefined,
    permissions = undefined,
    sectionStarts = undefined,
    instrumentation = [Instrument.Sitar],
    meters = [],
    sectionCategorization = undefined,
    explicitPermissions = undefined,
    soloist = undefined,
    soloInstrument = undefined,
    phraseGrid = undefined,
    durArrayGrid = undefined,
    sectionStartsGrid = undefined,
    sectionCatGrid = undefined,
    excerptRange = undefined,

  }: {
    phrases?: Phrase[],
    durTot?: number,
    durArray?: number[],
    raga?: Raga,
    title?: string,
    dateCreated?: Date,
    dateModified?: Date,
    location?: string,
    _id?: string,
    audioID?: string,
    audio_DB_ID?: string,
    userID?: string,
    name?: string,
    family_name?: string,
    given_name?: string,
    permissions?: string,
    sectionStarts?: number[],
    instrumentation?: Instrument[],
    meters?: Meter[],
    sectionCategorization?: SecCatType[],
    explicitPermissions?: {
      edit: string[],
      view: string[],
      publicView: boolean
    },
    soloist?: string,
    soloInstrument?: string,
    phraseGrid?: Phrase[][],
    durArrayGrid?: number[][],
    sectionStartsGrid?: number[][],
    sectionCatGrid?: SecCatType[][],
    excerptRange?: ExcerptRange,
  } = {}) {
    this.meters = meters;

    // setting up grids so they can transform from non-grid specs
    if (phraseGrid !== undefined) {
      this.phraseGrid = phraseGrid;
    } else {
      this.phraseGrid = [phrases];
    }
    for (let i = 1; i < instrumentation.length; i++) {
      this.phraseGrid.push([])
    }
    this.phraseGrid.length = instrumentation.length;
    if (durArrayGrid !== undefined) {
      this.durArrayGrid = durArrayGrid;
    } else {
      this.durArrayGrid = durArray === undefined ? [[]] : [durArray];
    }
    for (let i = 1; i < instrumentation.length; i++) {
      this.durArrayGrid.push([])
    }
    this.durArrayGrid.length = instrumentation.length;
    if (sectionStartsGrid !== undefined) {
      this.sectionStartsGrid = sectionStartsGrid;
    } else {
      this.sectionStartsGrid = sectionStarts === undefined ? 
        [[0]] : 
        [sectionStarts];
    }
    for (let i = 1; i < instrumentation.length; i++) {
      this.sectionStartsGrid.push([0])
    }
    this.sectionStartsGrid.length = instrumentation.length;
    this.sectionStartsGrid.forEach((ss, i) => {
      ss.sort((a, b) => a - b);
    })
    if (sectionCatGrid !== undefined) {
      this.sectionCatGrid = sectionCatGrid;
      if (this.sectionCatGrid.length === 0) {
        const ss = this.sectionStartsGrid[0];
        this.sectionCatGrid.push(ss.map(() => initSecCategorization()));
      }
      for (let i = 1; i < instrumentation.length; i++) {
        const ss = this.sectionStartsGrid[i];
        this.sectionCatGrid.push(ss.map(() => initSecCategorization()))
      }
    } else {
      this.sectionCatGrid = this.sectionStartsGrid.map((ss, ssIdx) => {
        if (ssIdx === 0) {
          if (sectionCategorization !== undefined) {
            const sc = sectionCategorization;
            sc.forEach(this.cleanUpSectionCategorization);
            return sc;
          } else {
            return ss.map(() => initSecCategorization())
          }
        }
        return ss.map(() => initSecCategorization())
      })
    }
    const err = new Error();
    // get a call trace here?




    this.raga = raga;
    if (this.phrases.length === 0) {
      if (durTot === undefined) {
        this.durTot = 1;
        this.durArray = [];
      } else {
        this.durTot = durTot;
        this.durArray = []
      }
    } else {
      this.durTotFromPhrases();
      this.durArrayFromPhrases();
      this.updateStartTimes()
    }
    this.putRagaInPhrase();
    this.title = title;
    this.dateCreated = dateCreated;
    this.dateModified = dateModified;
    this.location = location;
    this._id = _id;
    this.audioID = audioID;
    this.audio_DB_ID = audio_DB_ID;
    this.userID = userID;
    this.permissions = permissions;
    this.name = name;
    this.family_name = family_name;
    this.given_name = given_name;
    this.soloist = soloist;
    this.soloInstrument = soloInstrument;
    this.instrumentation = instrumentation;
    // this is really confusing becuase id12 is silent. The current solution 
    // is to just skip that number; so 12 listed below is really id13
    this.possibleTrajs = {
      [Instrument.Sitar]: [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13], 
      [Instrument.Vocal_M]: [0, 1, 2, 3, 4, 5, 6, 12, 13],
      [Instrument.Vocal_F]: [0, 1, 2, 3, 4, 5, 6, 12, 13],
      [Instrument.Bansuri]: [0, 1, 2, 3, 4, 5, 6, 12, 13],
      [Instrument.Esraj]: [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13],
      [Instrument.Sarangi]: [0, 1, 2, 3, 4, 5, 6, 12, 13],
      [Instrument.Rabab]: [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13],
      [Instrument.Santoor]: [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13],
      [Instrument.Sarod]: [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13],
      [Instrument.Shehnai]: [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13],
      [Instrument.Surbahar]: [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13],
      [Instrument.Veena_Saraswati]: [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13],
      [Instrument.Veena_Vichitra]: [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13],
      [Instrument.Veena_Rudra_Bin]: [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13],
      [Instrument.Violin]: [0, 1, 2, 3, 4, 5, 6, 12, 13],
      [Instrument.Harmonium]: [0, 12, 13],
    }

    this.sectionStartsGrid.forEach((ss, ssIdx) => {
      if (this.sectionCatGrid[ssIdx] === undefined) {
        debugger;
      }
      if (ss.length > this.sectionCatGrid[ssIdx].length) {
        const dif = ss.length - this.sectionCatGrid[ssIdx].length;
        for (let i = 0; i < dif; i++) {
          this.sectionCatGrid[ssIdx].push(initSecCategorization())
        }
      }
    })
    if (explicitPermissions === undefined) {
      this.explicitPermissions = {
        edit: [],
        view: [],
        publicView: true
      }
    } else {
      this.explicitPermissions = explicitPermissions
    }
    this.excerptRange = excerptRange;
  }

  get phrases() {
    return this.phraseGrid[0]
  }

  set phrases(arr) {
    this.phraseGrid[0] = arr
  }

  get durArray() {
    return this.durArrayGrid[0]
  }

  set durArray(arr) {
    this.durArrayGrid[0] = arr
  }

  get sectionStarts() {
    return this.sectionStartsGrid[0]
  }

  set sectionStarts(arr) {
    this.sectionStartsGrid[0] = arr
  }

  get sectionCategorization() {
    return this.sectionCatGrid[0]
  }

  set sectionCategorization(arr) { 
    this.sectionCatGrid[0] = arr
  }

  chikariFreqs(instIdx: number) {
    const allChikaris: Chikari[] = [];
    this.phraseGrid[instIdx].forEach(p => {
      const chikaris = Object.values(p.chikaris);
      allChikaris.push(...chikaris)
    });
    if (allChikaris.length === 0) {
      return [this.raga.fundamental * 2, this.raga.fundamental * 4]
    } else {
      // console.log(allChikaris[0].pitches)
      return allChikaris[0].pitches.slice(0, 2).map(p => p.frequency);
    }
  }

  updateFundamental(fundamental: number) {
    this.raga.fundamental = fundamental;
    this.phraseGrid.forEach(phrases => {
      phrases.forEach(phrase => phrase.updateFundamental(fundamental))
    })
  }

  cleanUpSectionCategorization(c: SecCatType) {
    if (c['Improvisation'] === undefined) {
      c['Improvisation'] = { "Improvisation": false }
    }
    if (c['Other'] === undefined) {
      c['Other'] = { "Other": false }
    }
    if (c['Top Level'] === undefined) {
      const com = c['Composition Type'];
      let comSecTemp = c['Comp.-section/Tempo'];
      if (comSecTemp === undefined) {
      // @ts-ignore
      comSecTemp = c['Composition-section/Tempo']
      }
      const tala = c['Tala'];
      const improv = c['Improvisation'];
      const other = c['Other'];
      const someTrue = (obj: object) => {
        return Object.values(obj).some(v => v)
      };
      if (c['Pre-Chiz Alap']['Pre-Chiz Alap']) {
        c['Top Level'] = 'Pre-Chiz Alap'
      } else if (someTrue(c['Alap'])) {
        c['Top Level'] = 'Alap'
      } else if (someTrue(com) || someTrue(comSecTemp) || someTrue(tala)) {
        c['Top Level'] = 'Composition'
      } else if (improv['Improvisation']) {
        c['Top Level'] = 'Improvisation'
      } else if (other['Other']) {
        c['Top Level'] = 'Other'
      } else {
        c['Top Level'] = 'None'
      }
    }
    if (c['Comp.-section/Tempo'] === undefined) {
      // @ts-ignore
      c['Comp.-section/Tempo'] = c['Composition-section/Tempo'];
      // @ts-ignore
      delete c['Composition-section/Tempo']
    }
  }

  putRagaInPhrase() {
    this.phraseGrid.forEach(ps => ps.forEach(p => p.raga = this.raga))
  }

  addMeter(meter: Meter) {
    if (this.meters.length === 0) {
      this.meters.push(meter);
    } else {
      const start = meter.startTime;
      const end = start + meter.durTot;
      this.meters.forEach(m => {
        const c1 = m.startTime <= start && m.startTime + m.durTot >= start;
        const c2 = m.startTime < end && m.startTime + m.durTot > end;
        const c3 = m.startTime > start && m.startTime + m.durTot < end;
        if (c1 || c2 || c3) {
          throw new Error('meters overlap')
        }
      })
      this.meters.push(meter);
    }
  }

  removeMeter(meter: Meter) {
    const idx = this.meters.indexOf(meter);
    this.meters.splice(idx, 1);
  }

  durStarts(track=0) {
    if (this.durArray === undefined) {
      throw new Error('durArray is undefined')
    }
    if (this.durTot === undefined) {
      throw new Error('durTot is undefined')
    }
    const starts = getStarts(this.durArrayGrid[track]
        .map(d => d * this.durTot!));
    return starts
  }

  get trajIdxs() {
    return this.possibleTrajs[this.instrumentation[0]]
  }
 
  get trajIdxsGrid() {
    return this.instrumentation.map(i => this.possibleTrajs[i])
  }

  allGroups({ instrumentIdx = 0 }: { instrumentIdx?: number } = {}) {
    const allGroups: Group[] = [];
    this.phrases.forEach(p => {
      allGroups.push(...p.getGroups(instrumentIdx))
    });
    return allGroups

  }

  updateStartTimes() {
    this.phraseGrid.forEach((phrases, idx) => {
      phrases.forEach((p, i) => {
        p.startTime = this.durStarts(idx)[i];
        p.pieceIdx = i;
        p.assignPhraseIdx();
      })
    })
  }

  durTotFromPhrases() {
    const durTots = this.phraseGrid.map(ps => {
      return ps
        .map(p => p.durTot as number)
        .reduce((a, b) => a + b, 0)
    });
    const maxDurTot = Math.max(...durTots);
    this.durTot = maxDurTot;
    durTots.forEach((d, t) => {
      if (d !== maxDurTot) {
        const extra = maxDurTot - d;
        const phrases = this.phraseGrid[t];
        const extraSilent = new Trajectory({
          id: 12,
          durTot: extra,
          fundID12: this.raga!.fundamental,
        });
        if (phrases.length === 0) {
          phrases.push(new Phrase({
            trajectories: [extraSilent],
            durTot: extra,
            raga: this.raga,
            instrumentation: this.instrumentation
          }));
          phrases[0].reset();
        } else {
          const lastPhrase = phrases[phrases.length - 1];
          lastPhrase.trajectories.push(extraSilent);
          lastPhrase.reset();
        }
      }
    })
  }

  durArrayFromPhrases() {
    this.durTotFromPhrases();
    this.phraseGrid.forEach((phrases, idx) => {
      this.durArrayGrid[idx] = phrases.map(p => {
        if (p.durTot === undefined) {
          throw new Error('p.durTot is undefined')
        } else if (isNaN(p.durTot)) {
          const removes = p.trajectories.filter(t => isNaN(t.durTot))
          removes.forEach(r => {
            const rIdx = p.trajectories.indexOf(r);
            p.trajectories.splice(rIdx, 1)
          })
          p.durTot = p.trajectories.map(t => {
            return t.durTot
          }).reduce((a, b) => a + b, 0)
        }
        return p.durTot / this.durTot!
      })
      this.updateStartTimes();
    })
  }

  realignPitches() {
    this.phraseGrid.forEach(ps => ps.forEach(p => p.realignPitches()))
  }


  // set up for one instrumnet, shoudl still work as is.
  get sections() {

    return this.sectionsGrid[0]
  }

  get sectionsGrid() {
    return this.sectionStartsGrid.map((ss, i) => {
      const sections: Section[] = [];
      ss.forEach((s, j) => {
        let slice;
        if (j === ss.length - 1) {
          slice = this.phraseGrid[i].slice(s)
        } else {
          slice = this.phraseGrid[i].slice(s, ss[j + 1])
        }
        sections.push(new Section({
          phrases: slice,
          categorization: this.sectionCatGrid[i][j]
        }))
      });
      return sections
    })
  }

  trackFromTraj(traj: Trajectory) {
    let track: number | undefined = undefined;
    for (let i = 0; i < this.instrumentation.length; i++) {
      const trajs = this.allTrajectories(i);
      const trajUIds = trajs.map(t => t.uniqueId);
      if (trajUIds.includes(traj.uniqueId)) {
        track = i;
        break
      }
    }
    if (track === undefined) {
      throw new Error('Trajectory not found')
    }
    return track
  }

  trackFromTrajUId(trajUId: string) {
    let track: number | undefined = undefined;
    for (let i = 0; i < this.instrumentation.length; i++) {
      const trajs = this.allTrajectories(i);
      const trajUIds = trajs.map(t => t.uniqueId);
      if (trajUIds.includes(trajUId)) {
        track = i;
        break
      }
    }
    if (track === undefined) {
      throw new Error('Trajectory not found')
    }  
    return track
  }

  phraseFromUId(uId: string): Phrase {
    let phrase: Phrase | undefined = undefined;
    this.phraseGrid.forEach(ps => {
      ps.forEach(p => {
        if (p.uniqueId === uId) {
          phrase = p
        }
      })
    });
    if (phrase === undefined) {
      throw new Error('Phrase not found')
    }
    return phrase
  }

  trackFromPhraseUId(phraseUId: string) {
    let track: number | undefined = undefined;
    for (let i = 0; i < this.instrumentation.length; i++) {
      const phrases = this.phraseGrid[i];
      const phraseUIds = phrases.map(p => p.uniqueId);
      if (phraseUIds.includes(phraseUId)) {
        track = i;
        break
      }
    }
    if (track === undefined) {
      console.log('here')
      throw new Error('Phrase not found')
    }
    return track
  }

  allPitches({ repetition=true, pitchNumber=false } = {}, track=0) {
    let allPitches: Pitch[] = [];
    const phrases = this.phraseGrid[track];
    phrases.forEach(p => allPitches.push(...p.allPitches()));
    if (!repetition) {
      allPitches = allPitches.filter((pitch, i) => {
        if (typeof pitch === 'number') {
          throw new Error('pitch is a number')
        }
        const c1 = i === 0;
        const lastP = allPitches[i-1];
        if (typeof lastP === 'number') {
          throw new Error('lastP is a number')
        }
        const c2 = pitch.swara === lastP?.swara;
        const c3 = pitch.oct === lastP?.oct;
        const c4 = pitch.raised === lastP?.raised;
        return c1 || !(c2 && c3 && c4)
      })
    }
    if (pitchNumber) {
      const allPitchNumbers = allPitches.map((p) => {
        if (typeof p === 'number') {
          throw new Error('p is a number')
        }
        return p.numberedPitch
      })
      return allPitchNumbers
    } else {
      return allPitches
    }
  }

  get highestPitchNumber() {
    return Math.max(...this.allPitches({ pitchNumber: true }) as number[]);
  }

  get lowestPitchNumber() {
    return Math.min(...this.allPitches({ pitchNumber: true }) as number[])
  }

  allTrajectories(inst = 0) {
    const allTrajectories: Trajectory[] = [];
    this.phraseGrid[inst].forEach(p => allTrajectories.push(...p.trajectories));
    return allTrajectories
  }

  trajFromTime(time: number, track: number) {
    const trajs = this.allTrajectories(track);
    const starts = this.trajStartTimes(track);
    const endTimes = starts.map((s, i) => s + trajs[i].durTot);
    const idx = findLastIndex(starts, s => time >= s);
    if (idx === -1) {
      return trajs[0]
    } else {
      const eT = endTimes[idx];
      if (time < eT) {
        return trajs[idx]
      } else {
        return trajs[idx + 1]
      }
    }
  }

  trajFromUId(uId: string, track: number) {
    const traj = this.allTrajectories(track).find(t => t.uniqueId === uId);
    if (traj === undefined) {
      throw new Error('Trajectory not found')
    }
    return traj
  }

  phraseFromTime(time: number, track: number) {
    const starts = this.durStarts(track);
    const idx = findLastIndex(starts, s => time >= s);
    return this.phraseGrid[track][idx]
  }

  phraseIdxFromTime(time: number, track: number) {
    const starts = this.durStarts(track);
    const idx = findLastIndex(starts, s => time >= s);
    return idx
  }

  trajStartTimes(inst = 0) {
    const trajs = this.allTrajectories(inst);
    const durs = trajs.map(t => t.durTot);
    return durs.reduce((acc, dur, idx) => {
      if (idx < durs.length - 1) {
        acc.push(acc[acc.length - 1] + dur);
      }
      return acc
    }, [0]);
  }


  chunkedTrajs(inst = 0, duration = 30) {
    // for all trajs in the piece, return an array of arrays of trajs, each
    // containing trajs that overlap with a chunk of the given duration
    const trajs = this.allTrajectories(inst);
    const durs = trajs.map(t => t.durTot);
    const starts = getStarts(durs);
    const endTimes = getEnds(durs);
    const chunks: Trajectory[][] = [];
    for (let i = 0; i < this.durTot!; i += duration) {
      const f1 = (startTime: number) => {
        return startTime >= i && startTime < i + duration
      };
      const f2 = (endTime: number) => {
        return endTime > i && endTime <= i + duration
      };
      const f3 = (startTime: number, endTime: number) => {
        return startTime < i && endTime > i + duration
      };
      const chunk = trajs.filter((_, j) => {
        return f1(starts[j]) || f2(endTimes[j]) || f3(starts[j], endTimes[j])
      });
      chunks.push(chunk)
    }
    const lastChunk = trajs.filter((_, j) => {
      return starts[j] >= this.durTot! - duration
    });
    return chunks
  }

  allDisplayBols(inst = 0) {
    const trajs = this.allTrajectories(inst);
    const starts = this.trajStartTimes(inst);
    const idxs: number[] = [];
    const bols: BolDisplayType[] = trajs
      .filter((t, tIdx) => {
        const c = t.articulations['0.00'] && t.articulations['0.00'].name === 'pluck';
        if (c) {
          idxs.push(tIdx)
        }
        return c
      })
      .map((t, tIdx) => {
        const time = starts[idxs[tIdx]];
        const bol = t.articulations['0.00'].strokeNickname!;
        const uId = t.uniqueId!;
        const logFreq = t.logFreqs[0];
        return { time, bol, uId, logFreq, track: inst }
      })
    return bols
  }

  allDisplaySargam(inst = 0){
    const trajs = this.allTrajectories(inst);
    const starts = this.trajStartTimes(inst);
    const sargams: SargamDisplayType[] = [];
    let lastPitch: { logFreq?: number, time?: number } = {
      logFreq: undefined,
      time: undefined
    };
    trajs.forEach((t, i) => {
      if (t.id !== 12) {
        const subDurs = t.durArray!.map(d => d * t.durTot);
        let timePts = getStarts(subDurs);
        timePts.push(t.durTot);
        timePts = timePts.map(d => d + starts[i]);
        timePts.forEach((tp, tpIdx) => {
          const logFreq = t.logFreqs[tpIdx] ? 
            t.logFreqs[tpIdx] : 
            t.logFreqs[tpIdx - 1];
          const cLF = lastPitch.logFreq === logFreq;
          const cT = lastPitch.time === tp;
          if (!(cLF || (cLF && cT))) {
            sargams.push({
              logFreq: logFreq!,
              sargam: t.pitches[tpIdx].sargamLetter,
              time: tp,
              uId: t.uniqueId!,
              track: inst,
              solfege: t.pitches[tpIdx].solfegeLetter,
              pitchClass: t.pitches[tpIdx].chroma.toString(),
              westernPitch: t.pitches[tpIdx].westernPitch,
            })
          };
          lastPitch = {
            logFreq: logFreq,
            time: tp
          }
        })
      }
    });
    const phraseDivs = (this.phraseGrid[inst].map(p => p.startTime! + p.durTot!));
    const pwr = 10 ** 5;
    const roundedPDS = phraseDivs.map(pd => Math.round(pd * pwr) / pwr);
    
    sargams.forEach((s, sIdx) => {
      let pos: number = 1;
      let lastHigher = true;
      let nextHigher = true;
      if (sIdx !== 0 && sIdx !== sargams.length - 1) {
        const lastS = sargams[sIdx - 1];
        const nextS = sargams[sIdx + 1];
        lastHigher = lastS.logFreq! > s.logFreq!;
        nextHigher = nextS.logFreq! > s.logFreq!;
      }
      if (lastHigher && nextHigher) {
        pos = 0
      } else if (!lastHigher && !nextHigher) {
        pos = 1
      } else if (lastHigher && !nextHigher) {
        pos = 3
      } else if (!lastHigher && nextHigher) {
        pos = 2
      }
      if (roundedPDS.includes(Math.round(s.time * pwr) / pwr)) {
        if (nextHigher) {
          pos = 5
        } else {
          pos = 4
        }
      }
      s.pos = pos
    })

    return sargams
  }

  allPhraseDivs(inst = 0) {
    const phraseDivObjs: PhraseDivDisplayType[] = [];
    this.phraseGrid[inst].forEach((p, pIdx) => {
      if (pIdx !== 0) {
        phraseDivObjs.push({
          time: p.startTime!,
          type: this.sectionStartsGrid[inst].includes(pIdx) ? 
            'section' : 
            'phrase',
          idx: pIdx,
          track: inst,
          uId: p.uniqueId
        })
      }
    });
    return phraseDivObjs
  }

  allDisplayVowels(inst = 0) {
    const vocalInsts = [Instrument.Vocal_M, Instrument.Vocal_F];
    const displayVowels: VowelDisplayType[] = []
    if (vocalInsts.includes(this.instrumentation[inst])) {
      this.phraseGrid[inst].forEach(phrase => {
        const firstTrajIdxs = phrase.firstTrajIdxs();
        const phraseStart = phrase.startTime!;
        firstTrajIdxs.forEach(tIdx => {
          const traj = phrase.trajectories[tIdx];
          const time = phraseStart + traj.startTime!;
          const logFreq = traj.logFreqs[0];
          const withC = traj.startConsonant !== undefined;
          const art = withC ? traj.articulations['0.00'] : undefined;
          let text: string = '';
          const ipaText = withC ? art!.ipa + traj.vowelIpa! : traj.vowelIpa!;
          const devanagariText = withC ? 
            art!.hindi + traj.vowelHindi! :
            traj.vowelHindi!;
          const englishText = withC ?
            art!.engTrans + traj.vowelEngTrans! :
            traj.vowelEngTrans!;
          const uId = traj.uniqueId!;
          displayVowels.push({
            time, 
            logFreq, 
            ipaText, 
            devanagariText, 
            englishText,
            uId
          })
        })
      })
    } else {
      throw new Error('instrumentation is not vocal')
    }
    return displayVowels
  }

  allDisplayEndingConsonants(inst = 0) {
    const vocalInsts = ['Vocal (M)', 'Vocal (F)'];
    const displayEndingConsonants: ConsonantDisplayType[] = [];
    const trajs = this.allTrajectories(inst);
    trajs.forEach((t, i) => {
      if (t.endConsonant !== undefined) {
        const phrase = this.phraseGrid[inst].find(p => p.trajectories.includes(t));
        const phraseStart = phrase?.startTime;
        const time = phraseStart! + t.startTime! + t.durTot!;
        const logFreq = t.logFreqs[t.logFreqs.length - 1];
        const art = t.articulations['1.00'];
        const ipaText = art!.ipa!;
        const devanagariText = art!.hindi!;
        const englishText = art!.engTrans!;
        const uId = t.uniqueId!;
        displayEndingConsonants.push({
          time,
          logFreq,
          ipaText,
          devanagariText,
          englishText,
          uId
        })
      }
    });
    return displayEndingConsonants
  }

  allDisplayChikaris(inst = 0) {
    const chikaris: ChikariDisplayType[] = [];
    this.phraseGrid[inst].forEach(p => {
      const keys = Object.keys(p.chikaris);
      keys.forEach(k => {
        const chikari = p.chikaris[k];
        const time = p.startTime! + Number(k);
        chikaris.push({
          time,
          phraseTimeKey: k,
          phraseIdx: p.pieceIdx!,
          track: inst,
          chikari: chikari,
          uId: chikari.uniqueId
        })
      })
    })
    return chikaris
  }

  chunkedDisplayChikaris(inst = 0, duration = 30) {
    const displayChikaris = this.allDisplayChikaris(inst);
    const chunks: ChikariDisplayType[][] = [];
    for (let i = 0; i < this.durTot!; i += duration) {
      const chunk = displayChikaris.filter(c => {
        return c.time >= i && c.time < i + duration
      });
      chunks.push(chunk)
    }
    return chunks
  }

  chunkedDisplayConsonants(inst = 0, duration = 30) {
    const displayEndingConsonants = this.allDisplayEndingConsonants(inst);
    const chunks: ConsonantDisplayType[][] = [];
    for (let i = 0; i < this.durTot!; i += duration) {
      const chunk = displayEndingConsonants.filter(c => {
        return c.time >= i && c.time < i + duration
      });
      chunks.push(chunk)
    }
    return chunks
  }

  chunkedDisplayVowels(inst = 0, duration = 30) {
    const displayVowels = this.allDisplayVowels(inst);
    const chunks: VowelDisplayType[][] = [];
    for (let i = 0; i < this.durTot!; i += duration) {
      const chunk = displayVowels.filter(v => {
        return v.time >= i && v.time < i + duration
      });
      chunks.push(chunk)
    }
    return chunks
  }

  chunkedDisplaySargam(inst = 0, duration = 30) {
    const displaySargam = this.allDisplaySargam(inst);
    const chunks: SargamDisplayType[][] = [];
    for (let i = 0; i < this.durTot!; i += duration) {
      const chunk = displaySargam.filter(s => {
        return s.time >= i && s.time < i + duration
      });
      chunks.push(chunk)
    }
    return chunks
  }

  chunkedDisplayBols(inst = 0, duration = 30) {
    const displayBols = this.allDisplayBols(inst);
    const chunks: BolDisplayType[][] = [];
    for (let i = 0; i < this.durTot!; i += duration) {
      const chunk = displayBols.filter(b => {
        return b.time >= i && b.time < i + duration
      });
      chunks.push(chunk)
    }
    return chunks
  }

  chunkedPhraseDivs(inst = 0, duration = 30) {
    const phraseDivs = this.allPhraseDivs(inst);
    const chunks: PhraseDivDisplayType[][] = [];
    for (let i = 0; i < this.durTot!; i += duration) {
      const chunk = phraseDivs.filter(pd => {
        return pd.time >= i && pd.time < i + duration
      });
      chunks.push(chunk)
    }
    return chunks
  }

  chunkedMeters(duration = 30) {
    const meters = this.meters;
    const chunks: Meter[][] = [];
    for (let i = 0; i < this.durTot!; i += duration) {
      const chunk = meters.filter(m => {
        return m.startTime >= i && m.startTime < i + duration
      });
      chunks.push(chunk)
    }
    return chunks
  }

  mostRecentTraj(time: number, inst: number = 0) {
    const trajs = this.allTrajectories(inst);
    const endTimes = trajs.map(t => {
      const phrase = this.phraseGrid[inst].find(p => p.trajectories.includes(t));
      const phraseStart = phrase?.startTime;
      return phraseStart! + t.startTime! + t.durTot!
    })
    // find the latest endTime that is less than time
    const latestTime = endTimes
      .filter(t => t <= time)
      .reduce((max, t) => t > max ? t : max, -Infinity);
    const idx = endTimes.indexOf(latestTime);
    return trajs[idx]

  }

  durationsOfFixedPitches({ 
    inst = 0, 
    outputType = 'pitchNumber' }: {
      inst?: number,
      outputType?: OutputType
    } = {}) {
    const trajs = this.allTrajectories(inst);
    return durationsOfFixedPitches(trajs, { 
      inst: inst, 
      outputType: outputType 
    })
  }

  proportionsOfFixedPitches({ 
    inst = 0, 
    outputType = 'pitchNumber' 
  }: {
    inst?: number,
    outputType?: OutputType
  } = {}) {
    const pitchDurs = this.durationsOfFixedPitches({ 
      inst: inst,
      outputType: outputType
    })!;
    let totalDur = 0;
    Object.keys(pitchDurs).forEach(key => {
      totalDur += pitchDurs[key];
    });
    const pitchProps: NumObj = {};
    for (let key in pitchDurs) {
      pitchProps[key] = pitchDurs[key] / totalDur;
    }
    return pitchProps
  }

  setDurTot(durTot: number) {
    for (let inst = 0; inst < this.instrumentation.length; inst++) {
      const phrases = this.phraseGrid[inst];

      let lastPhrase: Phrase = phrases[phrases.length - 1];
      while (lastPhrase.durTot === 0) {
        phrases.pop();
        this.durTotFromPhrases();
        this.durArrayFromPhrases();
        lastPhrase = phrases[phrases.length - 1];
      }
      const trajs = lastPhrase.trajectories;
      const lastTraj: Trajectory = trajs[trajs.length - 1];
      if (lastTraj.id === 12) {
        const extraDur = durTot - this.durTot!;
        lastTraj.durTot += extraDur;
        lastPhrase.durTotFromTrajectories();
        lastPhrase.durArrayFromTrajectories();
        this.durArrayFromPhrases();
        this.updateStartTimes();
      }
    }
  }

  pulseFromId(id: string) {
    const allPulses = this.meters.map(m => m.allPulses).flat();
    const pulse = allPulses.find(p => p.uniqueId === id);
    return pulse
  }

  sIdxFromPIdx(pIdx: number, inst = 0) {
    // section index from phrase index
    // const ss = this.sectionStarts!;
    const ss = this.sectionStartsGrid[inst];
    const sIdx = ss.length - 1 - ss.slice().reverse().findIndex(s => pIdx >= s);
    return sIdx
  }

  pIdxFromGroup(g: Group) {
    const pIdx = this.phrases.findIndex(p => { // this `phrases` needs addressing, mostly in query.ts
      let bool = false;
      p.groupsGrid.forEach(gg => {
        if (gg.includes(g)) {
          bool = true
        }
      })
      return bool
    });
    return pIdx
  }

  toJSON() {
    return {
      raga: this.raga,
      durTot: this.durTot,
      durArray: this.durArray,
      title: this.title,
      dateCreated: this.dateCreated,
      dateModified: this.dateModified,
      location: this.location,
      _id: this._id,
      audioID: this.audioID,
      userID: this.userID,
      permissions: this.permissions,
      name: this.name,
      family_name: this.family_name,
      given_name: this.given_name,
      sectionStarts: this.sectionStarts,
      instrumentation: this.instrumentation,
      meters: this.meters,
      sectionCategorization: this.sectionCategorization,
      explicitPermissions: this.explicitPermissions,
      soloist: this.soloist,
      soloInstrument: this.soloInstrument,
      phraseGrid: this.phraseGrid,
      durArrayGrid: this.durArrayGrid,
      sectionStartsGrid: this.sectionStartsGrid,
      sectionCatGrid: this.sectionCatGrid,
    }
  }
}

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

class Section {
  phrases: Phrase[];
  categorization: SecCatType;

  constructor({
    phrases = [],
    categorization = undefined
  }: {
    phrases?: Phrase[],
    categorization?: SecCatType
  } = {}) {
    this.phrases = phrases;
    if (categorization !== undefined) {
      this.categorization = categorization;
    } else {
      this.categorization = initSecCategorization();
    }
  }

  allPitches(repetition=true) {
    let pitches: Pitch[] = [];
    this.phrases.forEach(p => pitches.push(...p.allPitches(true)));
    if (!repetition) {
      pitches = pitches.filter((pitch, i) => {
        const c1 = i === 0;
        const c2 = pitch.swara === pitches[i-1]?.swara;
        const c3 = pitch.oct === pitches[i-1]?.oct;
        const c4 = pitch.raised === pitches[i-1]?.raised;
        return c1 || !(c2 && c3 && c4)
      })
    }
    return pitches
  }

  get trajectories() {
    const trajectories: Trajectory[] = [];
    this.phrases.forEach(p => trajectories.push(...p.trajectories));
    return trajectories
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
    [scaleDegree, raised] = chromaToScaleDegree(chroma);
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
      [scaleDegree, raised] = chromaToScaleDegree(chroma);
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
}

export { 
  Pitch,
  Trajectory,
  Phrase,
  Piece,
  Articulation,
  Chikari,
  Raga,
  Section,
  getStarts,
  getEnds,
  Group,
  durationsOfFixedPitches,
  pitchNumberToChroma,
  linSpace,
  initSecCategorization,
  Automation
}

export type {
  RuleSetType,
  VibObjType,
}
