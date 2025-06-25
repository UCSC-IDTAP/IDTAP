import { Raga } from './raga';
import { Trajectory } from './trajectory';
import { Chikari } from './chikari';
import { Group } from './group';
import { Pitch } from './pitch';
import { PhraseCatType, ChikariDisplayType } from '@shared/types';
import { v4 as uuidv4 } from 'uuid';
import  findLastIndex  from 'lodash/findLastIndex';
import { getStarts } from '@/ts/utils';

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
  adHocCategorizationGrid: string[];
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
    adHocCategorizationGrid = undefined,
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
    adHocCategorizationGrid?: string[],
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
    if (adHocCategorizationGrid !== undefined) {
      this.adHocCategorizationGrid = adHocCategorizationGrid;
    } else {
      this.adHocCategorizationGrid = [];
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
      adHocCategorizationGrid: this.adHocCategorizationGrid,
    }
  }

  static fromJSON(obj: any): Phrase {
    const trajectoryGrid = obj.trajectoryGrid
      ? obj.trajectoryGrid.map((trajs: any[]) => trajs.map((t: any) => Trajectory.fromJSON(t)))
      : undefined;
    const trajectories = obj.trajectories
      ? obj.trajectories.map((t: any) => Trajectory.fromJSON(t))
      : undefined;
    const chikaris: { [key: string]: Chikari } = {};
    if (obj.chikaris) {
      Object.keys(obj.chikaris).forEach(k => {
        chikaris[k] = Chikari.fromJSON(obj.chikaris[k]);
      });
    }
    const chikariGrid = obj.chikariGrid
      ? obj.chikariGrid.map((cg: any) => {
          const newObj: { [key: string]: Chikari } = {};
          Object.keys(cg).forEach(k => {
            newObj[k] = Chikari.fromJSON(cg[k]);
          });
          return newObj;
        })
      : undefined;
    return new Phrase({
      ...obj,
      trajectories,
      trajectoryGrid,
      chikaris,
      chikariGrid,
    });
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

export { Phrase }
