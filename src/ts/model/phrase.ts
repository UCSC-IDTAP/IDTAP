import { Raga } from './raga';
import { Trajectory } from './trajectory';
import { Chikari } from './chikari';
import { Group } from './group';
import { Pitch } from './pitch';
import { PhraseCatType, ChikariDisplayType } from '@shared/types';
import { v4 as uuidv4 } from 'uuid';
import  findLastIndex  from 'lodash/findLastIndex';
import { getStarts } from '@/ts/utils';

export const initPhraseCategorization = (): PhraseCatType => {
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
      // Ensure we have at least 2 slots for strings (0: main, 1: second)
      while (this.trajectoryGrid.length < 2) {
        this.trajectoryGrid.push([]);
      }
    } else {
      // Initialize with main string trajectories at index 0
      this.trajectoryGrid = [trajectories || []];
      // Add empty array for second string at index 1
      this.trajectoryGrid.push([]);
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
      this.durTot = durTot === undefined ? 1 : durTot;
      this.durArray = durArray === undefined ? [] : durArray;
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
    // Update main trajectories array
    this.trajectories.forEach(traj => traj.phraseIdx = this.pieceIdx);
    
    // Update trajectoryGrid for both strings
    [0, 1].forEach(stringIdx => {
      if (this.trajectoryGrid[stringIdx]) {
        this.trajectoryGrid[stringIdx].forEach(traj => traj.phraseIdx = this.pieceIdx);
      }
    });
  }

  assignTrajNums() {
    // Update main trajectories array  
    this.trajectories.forEach((traj, i) => traj.num = i);
    
    // Update trajectoryGrid for both strings
    [0, 1].forEach(stringIdx => {
      if (this.trajectoryGrid[stringIdx]) {
        this.trajectoryGrid[stringIdx].forEach((traj, i) => traj.num = i);
      }
    });
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
    
    // Update main trajectories array
    this.trajectories.forEach((traj, i) => {
      traj.startTime = starts[i]
    });
    
    // Update trajectoryGrid for both strings
    [0, 1].forEach(stringIdx => {
      if (this.trajectoryGrid[stringIdx]) {
        // For polyphonic instruments, calculate timing for each string separately
        const stringTrajs = this.trajectoryGrid[stringIdx];
        const stringDurs = stringTrajs.map(t => t.durTot);
        const stringTotalDur = stringDurs.reduce((a, b) => a + b, 0);
        
        if (stringTotalDur > 0) {
          const stringDurArray = stringDurs.map(d => d / stringTotalDur);
          const stringStarts = getStarts(stringDurArray).map(s => s * stringTotalDur);
          stringTrajs.forEach((traj, i) => {
            traj.startTime = stringStarts[i];
          });
        }
      }
    });
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

    // Helper function to consolidate silent trajectories in a trajectory array
    const consolidateArray = (trajArray: Trajectory[]) => {
      const result: Trajectory[] = [];
      let i = 0;

      while (i < trajArray.length) {
        const currentTraj = trajArray[i];

        if (currentTraj.id === 12) {
          // This is a silent trajectory - look ahead for consecutive silent trajectories
          let totalDuration = currentTraj.durTot;
          let j = i + 1;

          // Find all consecutive silent trajectories
          while (j < trajArray.length && trajArray[j].id === 12) {
            totalDuration += trajArray[j].durTot;
            j++;
          }

          // Create consolidated silent trajectory
          const consolidatedTraj = new Trajectory({
            id: 12,
            durTot: totalDuration,
            pitches: [],
            fundID12: currentTraj.fundID12 || this.raga?.fundamental,
            instrumentation: currentTraj.instrumentation,
            uniqueId: currentTraj.uniqueId // Preserve the unique ID from first trajectory
          });

          result.push(consolidatedTraj);
          i = j; // Skip all the trajectories we just consolidated
        } else {
          // Non-silent trajectory - keep as is
          result.push(currentTraj);
          i++;
        }
      }

      return result;
    };

    // Consolidate string 1 (main) trajectories
    this.trajectories = consolidateArray(this.trajectories);
    this.trajectoryGrid[0] = this.trajectories;

    // Consolidate string 2 trajectories if they exist
    if (this.trajectoryGrid[1] && this.trajectoryGrid[1].length > 0) {
      this.trajectoryGrid[1] = consolidateArray(this.trajectoryGrid[1]);
    }

    // Reset phrase to recalculate timing and numbering
    this.reset();
  }

  consolidateContinuousTrajectories() {
    // First, consolidate silent trajectories using existing method
    this.consolidateSilentTrajs();

    // Then, additionally consolidate continuous fixed pitch trajectories on string 2
    if (this.trajectoryGrid[1] && this.trajectoryGrid[1].length > 0) {
      // Helper to check if trajectory has initial pluck articulation
      const hasInitialPluck = (traj: Trajectory): boolean => {
        // Check if trajectory has articulations
        if (!traj.articulations || Object.keys(traj.articulations).length === 0) {
          return false;
        }

        // Check for pluck at time 0.00 (start of trajectory)
        const firstArticulation = traj.articulations['0.00'];
        return firstArticulation?.name === 'pluck';
      };

      // Consolidate fixed pitch trajectories on string 2
      const result: Trajectory[] = [];
      let i = 0;
      const trajectories = this.trajectoryGrid[1];

      while (i < trajectories.length) {
        const currentTraj = trajectories[i];

        if (currentTraj.id === 0) {
          // For string 2, consolidate fixed pitch trajectories
          let j = i + 1;
          let totalDuration = currentTraj.durTot;

          // Find consecutive fixed trajectories with same pitch
          // BUT stop if we encounter a pluck articulation at the start
          while (j < trajectories.length &&
                 trajectories[j].id === 0 &&
                 trajectories[j].pitches.length === 1 &&
                 currentTraj.pitches[0].frequency === trajectories[j].pitches[0].frequency &&
                 !hasInitialPluck(trajectories[j])) {  // Don't merge if next traj has pluck at 0.00
            totalDuration += trajectories[j].durTot;
            j++;
          }

          if (j > i + 1) {
            // Create consolidated fixed trajectory
            const consolidatedTraj = new Trajectory({
              id: 0,
              durTot: totalDuration,
              pitches: [currentTraj.pitches[0]], // Keep the single pitch
              fundID12: currentTraj.fundID12,
              instrumentation: currentTraj.instrumentation,
              // Preserve properties from first trajectory
              articulations: currentTraj.articulations, // Keep original articulations
              vowel: currentTraj.vowel,
              vowelIpa: currentTraj.vowelIpa,
              vowelHindi: currentTraj.vowelHindi,
              groupId: currentTraj.groupId,
              uniqueId: currentTraj.uniqueId // Preserve the unique ID from first trajectory
            });
            result.push(consolidatedTraj);
            i = j;
          } else {
            result.push(currentTraj);
            i++;
          }
        } else {
          // Keep all other trajectories as-is
          result.push(currentTraj);
          i++;
        }
      }

      // Update string 2 trajectories
      this.trajectoryGrid[1] = result;

      // Reset phrase to recalculate timing after string 2 consolidation
      this.reset();
    }
  }

  chikarisDuringTraj(traj: Trajectory, track: number) {
    const start = traj.startTime!;
    const dur = traj.durTot;
    const end = start + dur;
    const chikaris = this.chikariGrid[0];
    const chikarisDuring = Object.keys(chikaris).filter(k => {
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

  set trajectories(arr: Trajectory[]) {
    this.trajectoryGrid[0] = arr
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

  firstTrajIdxs(stringIdx = 0) {
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
    const trajectoryArray = this.trajectoryGrid[stringIdx] || this.trajectories;
    trajectoryArray.forEach((traj, tIdx) => {
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

  trajIdxFromTime(time: number, stringIdx = 0) {
    const phraseTime = time - this.startTime!;
    const trajectoryArray = this.trajectoryGrid[stringIdx] || this.trajectories;
    const trajs = trajectoryArray.filter(traj => {
      const smallOffset = 1e-10;
      const a = phraseTime >= traj.startTime! - smallOffset;
      const b = phraseTime < traj.startTime! + traj.durTot;
      return a && b
    })
    if (trajs.length === 0) {
      // breakpoint
      throw new Error('No trajectory found')
    }
    // Return the index within the specific string's trajectory array, not the num property
    return trajectoryArray.indexOf(trajs[0])
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
