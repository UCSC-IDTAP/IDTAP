
import { Phrase } from './phrase';
import { Trajectory } from './trajectory';
import { Raga } from './raga';
import { Chikari } from './chikari';
import { Group } from './group';
import { Section } from './section';
import { Pitch } from './pitch';
import { Assemblage } from './assemblage';
import { Instrument } from '@shared/enums';
import { 
	SecCatType, 
	ExcerptRange, 
	BolDisplayType,
	SargamDisplayType,
	PhraseDivDisplayType,
	VowelDisplayType,
	ConsonantDisplayType,
	ChikariDisplayType,
	OutputType,
	NumObj,
	AssemblageDescriptor
} from '@shared/types';
import { Meter } from '@/js/meter';
import { getStarts, getEnds } from '@/ts/utils';
import { findLastIndex } from 'lodash';

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
  adHocSectionCatGrid: string[][][];
  assemblageDescriptors: AssemblageDescriptor[];

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
    adHocSectionCatGrid = undefined,
	assemblageDescriptors = undefined

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
    adHocSectionCatGrid?: string[][][],
	assemblageDescriptors?: AssemblageDescriptor[]
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
    if (adHocSectionCatGrid !== undefined) {
      this.adHocSectionCatGrid = adHocSectionCatGrid;
      // Remove any empty-string entries from the nested ad-hoc arrays
      this.adHocSectionCatGrid = this.adHocSectionCatGrid.map(track =>
        track.map(fields => fields.filter(field => field !== ''))
      );
    } else {
      this.adHocSectionCatGrid = this.sectionCatGrid.map(sc => {
        return sc.map(() => [])
      })
    }
    while (this.adHocSectionCatGrid.length < this.sectionStartsGrid.length) {
      this.adHocSectionCatGrid.push(this.adHocSectionCatGrid[0].map(() => []))
    }
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
        console.log('this is where the fix is')
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
	if (assemblageDescriptors === undefined) {
	  this.assemblageDescriptors = [];
	} else {
		this.assemblageDescriptors = assemblageDescriptors;
	}
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
  
  get assemblages(): Assemblage[] {
	return this.assemblageDescriptors.map(ad => 
	  Assemblage.fromDescriptor(ad, this.phraseGrid.flat())
	)
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
          categorization: this.sectionCatGrid[i][j],
          adHocCategorization: this.adHocSectionCatGrid[i][j],
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
      excerptRange: this.excerptRange,
      adHocSectionCatGrid: this.adHocSectionCatGrid,
      assemblageDescriptors: this.assemblageDescriptors,
    }
  }

  static fromJSON(obj: any): Piece {
    const raga = obj.raga ? Raga.fromJSON(obj.raga) : new Raga();
    obj.raga = raga;

    if (obj.phraseGrid === undefined && obj.phrases !== undefined) {
      obj.phraseGrid = [obj.phrases];
      while (obj.phraseGrid.length < obj.instrumentation.length) {
        obj.phraseGrid.push([]);
      }
    }

    obj.phraseGrid = (obj.phraseGrid || []).map((phrases: any[], instIdx: number) => {
      return phrases.map((p: any) => Phrase.fromJSON(p));
    });

    if (obj.meters) {
      obj.meters = obj.meters.map((m: any) => new Meter(m));
    }

    const piece = new Piece(obj);

    // reconnect groups to actual trajectories
    piece.phraseGrid.forEach((phrases) => {
      phrases.forEach((phrase) => {
        if (phrase.groupsGrid) {
          phrase.groupsGrid = phrase.groupsGrid.map((groups) =>
            groups.map((g) => {
              g.trajectories = g.trajectories.map((t: Trajectory) => {
                const tIdx = t.num!;
                return phrase.trajectoryGrid[0][tIdx];
              });
              return new Group(g);
            })
          );
        }
      });
    });

    // fix articulations named slide at start
    piece.phraseGrid.forEach((phrases) => {
      phrases.forEach((phrase) => {
        phrase.trajectories.forEach((traj) => {
          const arts = traj.articulations;
          const a1 = arts[0] && arts[0].name === 'slide';
          const a2 = arts['0.00'] && arts['0.00'].name === 'slide';
          if (a1 || a2) {
            arts['0.00'].name = 'pluck';
          }
        });
        phrase.consolidateSilentTrajs();
      });
    });

    piece.durArrayFromPhrases();
    piece.sectionStartsGrid = piece.sectionStartsGrid.map((arr) => [...new Set(arr)]);
    return piece;
  }
}

export { Piece, initSecCategorization, durationsOfFixedPitches }
