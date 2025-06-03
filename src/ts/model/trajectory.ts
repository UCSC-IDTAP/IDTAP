import { Pitch } from './pitch';
import { Articulation } from './articulation';
import { Automation } from './automation';

import { 
	VibObjType,
	TrajIdFunction,
	IdType,
	NumObj,
} from '@shared/types';
import { Instrument } from '@shared/enums';
import { getStarts } from '@/ts/utils';
import { v4 as uuidv4 } from 'uuid';
import { findLastIndex } from 'lodash';


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
  tags: string[];



  get freqs() {
    return this.pitches.map(p => p.frequency)
  }

  get logFreqs() {
    return this.pitches.map(p => Math.log2(p.frequency))
  }

  get sloped() {
    return this.id === 2 || this.id === 3 || this.id === 4 || this.id === 5
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
    uniqueId = undefined,
    tags = undefined
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
    uniqueId?: string,
    tags?: string[]
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
    if (tags === undefined) {
      this.tags = []
    } else {
      this.tags = tags
    }
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
        let chromaPitch = Pitch.pitchNumberToChroma(Number(p))
        altPitchDurs[chromaPitch] = pitchDurs[p];
      });
      return altPitchDurs
    } else if (outputType === 'scaleDegree') {
      const altPitchDurs: { [key: number]: number } = {};
      Object.keys(pitchDurs).forEach(p => {
        const chromaPitch = Pitch.pitchNumberToChroma(Number(p));
        const scaleDegree = Pitch.chromaToScaleDegree(chromaPitch)[0];
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
      tags: this.tags,
    }
  }

  static names() {
    const traj = new Trajectory();
    return traj.names
  }
  // skip id 11, same code as id 7, just different articulation
}

export { Trajectory }
