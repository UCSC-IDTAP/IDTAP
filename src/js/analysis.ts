import { 
  Pitch, 
  Trajectory, 
  Phrase,
  Piece,
  Articulation,
  Chikari, 
  Raga,
  Group,
  getStarts,
  pitchNumberToChroma
} from './classes';
import { Meter } from '@/js/meter.ts';
import { getPiece, getRaagRule } from './serverCalls.ts';
const testQueryId = '63445d13dc8b9023a09747a6';

const instantiatePiece = async (queryId = testQueryId) => {
  // if (fundamental) piece.raga.fundamental = fundamental;
  let piece = await getPiece(queryId);
  // console.log(piece)
  const rsRes = await getRaagRule(piece.raga.name);
  piece.raga.ruleSet = rsRes.rules;
  piece.raga = new Raga(piece.raga);
  if (piece.phraseGrid === undefined) {
    piece.phraseGrid = [piece.phrases];
    while (piece.phraseGrid.length < piece.instrumentation.length) {
      piece.phraseGrid.push([]);
    }
  }
  piece.phraseGrid.forEach((phrases, instIdx) => {
    phrases.forEach(phrase => {
      let pt = phrase.trajectoryGrid ?
              phrase.trajectoryGrid[0] : 
              phrase.trajectories;
      pt.forEach(traj => {
        traj.pitches = traj.pitches.map(pitch => {
          pitch.fundamental = piece.raga.fundamental;
          // convert to pitch ratio format
          pitch.ratios = piece.raga.stratifiedRatios;
          return new Pitch(pitch)
        });
        const artKeys = Object.keys(traj.articulations);
        const artEntries = artKeys.map(key => traj.articulations[key]);
        const artObj: { [key: string]: Articulation } = {};
        artKeys.forEach((key, i) => {
          artObj[key] = new Articulation(artEntries[i]);
        });
        traj.articulations = artObj;
        if (traj.id === 12 && traj.fundID12 !== piece.raga.fundamental) {
          traj.fundID12 = piece.raga.fundamental
        }
        if (traj.id === 12 && Object.keys(traj.articulations).length > 0) {
          traj.articulations = {};
        }
        if (piece.instrumentation) {
          traj.instrumentation = piece.instrumentation[instIdx];
        }
        const vox = ['Vocal (M)', 'Vocal (F)'];
        if (vox.includes(traj.instrumentation)) {
          if (traj.vowel === undefined && traj.id !== 12) {
            traj.vowel = 'a';
          }
        }
      });
      if (phrase.trajectoryGrid === undefined) {
        phrase.trajectoryGrid = [];
      }
      phrase.trajectoryGrid[0] = pt.map(traj => {
        return new Trajectory(traj)
      });
      if (phrase.groupsGrid !== undefined) {
        phrase.groupsGrid.forEach((groups, ggIdx) => {
          groups.forEach((group, gIdx) => {
            group.trajectories.forEach((traj, idx) => {
              const tIdx = traj.num!;
              const realTraj = phrase.trajectoryGrid[0][tIdx];
              group.trajectories[idx] = realTraj;
            })
            groups[gIdx] = new Group(group)
          })
        })
      }
      const chikariKeys = Object.keys(phrase.chikaris);
      const chikariEntries = chikariKeys.map(key => phrase.chikaris[key]);
      const chikariObj: { [key: string]: Chikari } = {};
      chikariKeys.forEach((key, i) => {
        // console.log(chikariEntries[i])
        const entry = chikariEntries[i];
        entry.fundamental = piece.raga.fundamental;
        entry.pitches = entry.pitches.map(p => {
          p.fundamental = piece.raga.fundamental;
          p.ratios = piece.raga.stratifiedRatios;
          return new Pitch(p)
        })
        // console.log(entry)
        chikariObj[key] = new Chikari(entry)
      })
      phrase.chikaris = chikariObj;
      if (piece.instrumentation) {
        phrase.instrumentation = piece.instrumentation;
      }
    });
  });
  if (piece.phraseGrid !== undefined) {
    // piece.phraseGrid.forEach((phrases) => {
    //   phrases = phrases.map(phrase => new Phrase(phrase));
    // })
    piece.phraseGrid = piece.phraseGrid.map(phrases => {
      return phrases.map(phrase => new Phrase(phrase))
    })
  } else {
    piece.phrases = piece.phrases.map(phrase => new Phrase(phrase));
  }
  if (piece.meters) {
    piece.meters = piece.meters.map(meter => new Meter(meter))
  }
  piece = new Piece(piece);
  // let dateModified = new Date(piece.dateModified);
  fixTrajs(piece);
  piece.phraseGrid.forEach((phrases, instIdx) => {
    phrases.forEach(phrase => {
      phrase.consolidateSilentTrajs()
    })
  })
  piece.durArrayFromPhrases();
  piece.sectionStartsGrid = piece.sectionStartsGrid.map((arr, i) => {
    return [...new Set(arr)]
  })
  return piece
};

const fixTrajs = (piece: Piece) => {
  piece.phraseGrid.forEach((phrases, instIdx) => {
    phrases.forEach(phrase => {
      phrase.trajectories.forEach((traj) => {
        const arts = traj.articulations;
        const c1 = arts[0] && arts[0].name === 'slide';
        const c2 = arts['0.00'] && arts['0.00'].name === 'slide';
        if (c1 || c2) {
          traj.articulations['0.00'].name = 'pluck'
        }
      })
    })
  })
}

const PitchTimes = (trajs: Trajectory[], { 
  outputType = 'pitchNumber' 
} = {}) => { // outputs pitches as pitchNumbers
  // returns a list of all pitches in trajs, and the cumulative times at which 
  // they begin, calculated based on summing durtot as we go.
  // silences are included: instead of pitch, just the string 'silence'.
  // outputType can be 'pitchNumber', 'chroma', 'scaleDegree', or 'sargamLetter'
  let pitchTimes: { 
    time: number, 
    pitch: string | number, 
    articulation: boolean 
  }[] = [];
  let startTime = 0;
  trajs.forEach(traj => {
    const art = traj.articulations[0] || traj.articulations['0.00'];
    if (traj.id === 12) {
      const obj = { time: startTime, pitch: 'silence', articulation: false };
      pitchTimes.push(obj);
      startTime += traj.durTot;
    } else {
      traj.pitches.forEach((pitch, pIdx) => {  
        let pitchRep;
        if (outputType === 'pitchNumber') {
          pitchRep = pitch.numberedPitch;
        } else if (outputType === 'chroma') {
          pitchRep = pitch.chroma;
        } else if (outputType === 'sargamLetter') { 
          pitchRep = pitch.sargamLetter;
        } else if (outputType === 'octavedSargamLetter') { 
          pitchRep = pitch.octavedSargamLetter;
        } else if (outputType === 'scaleDegree') {
          pitchRep = pitch.scaleDegree;
        } else if (outputType === 'octavedScaleDegree') {
          pitchRep = pitch.octavedScaleDegree;
        } else {
          throw new Error('outputType not recognized')
        }
        const obj = { 
          time: startTime, 
          pitch: pitchRep,
          articulation: pIdx === 0 && (art !== undefined)
        };
        pitchTimes.push(obj);
        if (pIdx < traj.pitches.length - 1) {
          if (traj.durArray === undefined) {
            throw new Error('traj.durArray is undefined')
          }
          startTime += traj.durArray[pIdx] * traj.durTot;
        }
      })
    }
  })
  // filter out duplicates time + pitch
  pitchTimes = pitchTimes.filter((obj, idx, arr) => {
    if (idx === arr.length - 1) {
      return true
    } else {
      const c1 = obj.pitch === pitchTimes[idx+1].pitch;
      const c2 = obj.time === pitchTimes[idx+1].time;
      return !(c1 && c2)
    }
  })
  // now if there are adjacent with the same time but different pitch, 
  // filter out the first one
  pitchTimes = pitchTimes.filter((obj, idx) => {
    if (idx === 0 || idx === pitchTimes.length - 1) {
      return true
    } else {
      return obj.time !== pitchTimes[idx+1].time;
    }
  })
  if (outputType === 'chroma') {
    pitchTimes.forEach(pt => {
      if (pt.pitch !== 'silence') {
        if (typeof pt.pitch !== 'number') {
          throw new Error('pitch is not a number')
        }
        pt.pitch = pitchNumberToChroma(pt.pitch)
      }
    })
  } 
  return pitchTimes
}



const condensedDurations = (trajs: Trajectory[], { 
  outputType = 'pitchNumber', // pitchNumber, chroma, scaleDegree, sargamLetter
  maxSilence = 5,
  excludeSilence = true,
 } = {}) => {
  let pitchTimes = PitchTimes(trajs);
  if (outputType === 'chroma') {
    pitchTimes.forEach(pt => {
      if (pt.pitch !== 'silence') {
        if (typeof pt.pitch !== 'number') {
          throw new Error('pitch is not a number')
        }
        pt.pitch = pitchNumberToChroma(pt.pitch)
      }
    })
  }
  // remove latter of adjacent items where pitch is equal
  pitchTimes = pitchTimes.filter((obj, idx) => {
    if (idx === 0) {
      return true
    } else {
      return obj.pitch !== pitchTimes[idx-1].pitch;
    }
  })
  const durations: { dur: number, pitch: string | number }[] = [];
  const endTime = trajs.reduce((sum, traj) => sum + traj.durTot, 0);
  const ends = pitchTimes.map(obj => obj.time).slice(1).concat([endTime]);
  pitchTimes.forEach((obj, idx) => {
    const newObj = { dur: ends[idx] - obj.time, pitch: obj.pitch };
    durations.push(newObj);
  })
  // if dur of silence is less than maxSilence, add it to the previous pitch
  let condensedDurations: { dur: number, pitch: string | number }[] = [];
  durations.forEach((obj, idx) => {
    if (obj.pitch === 'silence') {
      if (idx === 0) {
        condensedDurations.push(obj)
      } else if (obj.dur < maxSilence) {
        condensedDurations[condensedDurations.length - 1].dur += obj.dur;
      } else {
        condensedDurations[condensedDurations.length - 1].dur += maxSilence;
        obj.dur -= maxSilence;
        condensedDurations.push(obj);
      }
    } else {
      condensedDurations.push(obj);
    }
    
  });
  if (excludeSilence) {
    condensedDurations = condensedDurations
      .filter(obj => obj.pitch !== 'silence');
  }
  return condensedDurations
}

const durationsOfPitchOnsets = (trajs: Trajectory[], { 
  outputType = 'pitchNumber', // pitchNumber, chroma, scaleDegree, sargamLetter
  countType = 'cumulative',
  excludeSilence = true,
  maxSilence = 5,
 } = {}) => {
  let pitchTimes = PitchTimes(trajs);
  if (outputType === 'chroma') {
    pitchTimes.forEach(pt => {
      if (pt.pitch !== 'silence') {
        if (typeof pt.pitch !== 'number') {
          throw new Error('pitch is not a number')
        }
        pt.pitch = pitchNumberToChroma(pt.pitch)
      }
    })
  }
  // remove latter of adjacent items where pitch is equal
  pitchTimes = pitchTimes.filter((obj, idx) => {
    if (idx === 0) {
      return true
    } else {
      return obj.pitch !== pitchTimes[idx-1].pitch;
    }
  })
  const durations: { dur: number, pitch: string | number }[] = [];
  const endTime = trajs.reduce((sum, traj) => sum + traj.durTot, 0);
  const ends = pitchTimes.map(obj => obj.time).slice(1).concat([endTime]);
  pitchTimes.forEach((obj, idx) => {
    const newObj = { dur: ends[idx] - obj.time, pitch: obj.pitch };
    durations.push(newObj);
  })
  // if dur of silence is less than maxSilence, add it to the previous pitch
  let condensedDurations: { dur: number, pitch: string | number }[] = [];
  durations.forEach((obj, idx) => {
    if (obj.pitch === 'silence') {
      if (idx === 0) {
        condensedDurations.push(obj)
      } else if (obj.dur < maxSilence) {
        condensedDurations[condensedDurations.length - 1].dur += obj.dur;
      } else {
        condensedDurations[condensedDurations.length - 1].dur += maxSilence;
        obj.dur -= maxSilence;
        condensedDurations.push(obj);
      }
    } else {
      condensedDurations.push(obj);
    }
  });

  // pitchDurations is an object whose keys are the pitches, and whose values 
  // are the summed durations
  const pitchDurations: { [key: string | number]: number } = {};
  condensedDurations.forEach(obj => {
    if (pitchDurations[obj.pitch]) {
      pitchDurations[obj.pitch] += obj.dur;
    } else {
      pitchDurations[obj.pitch] = obj.dur;
    }
  })
  if (excludeSilence) {
    delete pitchDurations['silence'];
    condensedDurations = condensedDurations
      .filter(obj => obj.pitch !== 'silence');
  }
  if (countType === 'proportional') {
    const total = condensedDurations.reduce((sum, obj) => sum + obj.dur, 0);
    const keys = Object.keys(pitchDurations);
    keys.forEach(key => {
      pitchDurations[key] = pitchDurations[key]/total;
    })
    return pitchDurations
  }
}

const segmentByDuration = (piece: Piece, { 
  // options for type are 'left', 'right', and 'rounded' indicating which 
  // direction border trajs get pushed.
  duration = 10,
  type = 'rounded',
  inst = 0,
  removeEmpty = true 
}: {
  duration?: number,
  type?: 'left' | 'right' | 'rounded',
  inst?: number,
  removeEmpty?: boolean
} = {}) => {
  if (piece.durTot === undefined) {
    throw new Error('piece.durTot is undefined')
  } 
  const numSegments = Math.ceil(piece.durTot / duration);
  let segments: Trajectory[][] = [...Array(numSegments)].map(() => []);
  const trajs = piece.allTrajectories(inst);
  const trajDurs = trajs.map(traj => traj.durTot);
  const starts = getStarts(trajDurs);
  trajs.forEach((traj, i) => {
    const start = starts[i];
    const end = start + traj.durTot;
    let segmentIdx;
    if (Math.floor(start / duration) === Math.floor(end / duration) ) {
      segmentIdx = Math.floor(start / duration);
    } else if (type === 'left') {
      segmentIdx = Math.floor(start / duration);
    } else if (type === 'right') {
      segmentIdx = Math.floor(end / duration);
    } else { // (type === 'rounded')
      const center = (start + end) / 2;
      segmentIdx = Math.floor(center / duration);
    }
    if (!(i === trajs.length - 1 && traj.id === 12)) {
      segments[segmentIdx].push(traj);
    }
  })
  if (removeEmpty) {
    segments = segments.filter(segment => {
      const out = segment.length > 0;
      return out
    });
  }
  return segments
}

const patternCounter = (trajs: Trajectory[], { 
  size = 2, 
  maxLagTime = 3,
  sort = true,
  outputType = 'pitchNumber',
  targetPitch = undefined,
  minSize = 1,
}: {
  size?: number,
  maxLagTime?: number,
  sort?: boolean,
  outputType?: string,
  targetPitch?: number | string,
  minSize?: number,
} = {}) => {
  const pitchTimes = PitchTimes(trajs, { outputType: outputType });
  // For all adjacent pitchs duplicates in pitchTimes list, remove all 
  // second instances, unless articulation on second adjacent pitch is === true
  pitchTimes.forEach((obj, idx) => {
    if (idx === 0) {
      return true
    } else {
      if (obj.pitch === pitchTimes[idx-1].pitch) {
        if (obj.articulation === true) {
          return true
        } else {
          pitchTimes.splice(idx, 1);
        }
      }
    }
  })
  const endTime = trajs.reduce((sum, traj) => sum + traj.durTot, 0);
  const ends = pitchTimes.map(obj => obj.time).slice(1).concat([endTime]);
  const durations = pitchTimes.map((obj, idx) => {
    return { 
      dur: ends[idx] - obj.time, 
      pitch: obj.pitch, 
      articulation: obj.articulation 
    }
  })
  
  // if dur of silence is less than maxLagTime, add it to the previous pitch
  let condensedDurations: { dur: number, pitch: string | number }[] = [];
  durations.forEach((obj, idx) => {
    if (obj.pitch === 'silence') {
      if (idx === 0) {
        condensedDurations.push(obj)
      } else if (obj.dur < maxLagTime) {
        condensedDurations[condensedDurations.length - 1].dur += obj.dur;
      } else {
        condensedDurations[condensedDurations.length - 1].dur += maxLagTime;
        obj.dur -= maxLagTime;
        condensedDurations.push(obj);
      }
    } else {
      condensedDurations.push(obj );
    }
  });
  const patterns: { [key: number | string]: number | {} } = {};
  let subPattern: (string | number)[] = [];
  condensedDurations.forEach(obj => {
    if (obj.pitch === 'silence') {
      subPattern = [];
    } else if (subPattern.length < size) {
      subPattern.push(obj.pitch);
    } else {
      subPattern.shift();
      subPattern.push(obj.pitch);
      let sel = patterns;
      subPattern.forEach((pitch, pIdx, arr) => {
        if (sel[pitch] === undefined) {
          sel[pitch] = pIdx === arr.length - 1 ? 0 : {};
        }
        if (pIdx === arr.length - 1) {
          const lcl = sel[pitch];
          if (typeof lcl === 'number') {
            sel[pitch] = lcl + 1;
          } else {
            throw new Error('sel[pitch] is not a number')
          }      
        }
        if (typeof sel[pitch] === 'object' && sel[pitch] !== null) {
          sel = sel[pitch] as { [key: string]: number | {}; [key: number]: number | {} };
        }
      })
    }
  })
  // now, create a list of objects from patterns, where each object has a 
  // 'pattern' key, an array of the nested keys, and a 'count' key, the nested 
  // value
  let out: { pattern: number[], count: number }[] = [];
  // const recurse = (obj: { 
  //   [key: number | string]: number | {} 
  // }, pattern = []) => {
  //   const keys = Object.keys(obj);
  //   keys.forEach(key => {
  //     if (typeof obj[key] === 'number') {
  //       const ok = obj[key] as number;
  //       out.push({ pattern: pattern.concat([Number(key)]), count: ok });
  //     } else {
  //       recurse(obj[key] as {}, pattern.concat([Number(key)]));
  //     }
  //   })
  // }
  const recurse = (
    obj: Record<string, number|Record<string, any>>,
    pattern: number[] = []
  ) => {
    Object.keys(obj).forEach(key => {
      if (typeof obj[key] === 'number') {
        const ok = obj[key] as number;
        out.push({ pattern: pattern.concat([Number(key)]), count: ok });
      } else {
        recurse(obj[key] as Record<string, any>, pattern.concat([Number(key)]));
      }
    });
  };
  recurse(patterns);
  if (sort) {
    out.sort((a, b) => b.count - a.count);
  }
  if (targetPitch !== undefined) {
    // at end of pattern
    out = out.filter(o => o.pattern[o.pattern.length - 1] === targetPitch);
  }
  out = out.filter(o => o.count >= minSize)
  return out
  // return patterns
}

const argSort = (arr: number[]) => {
  const indices = [...arr.keys()].sort((a, b) => arr[a] - arr[b]);
  return indices
}
const chromaSeqToCondensedPitchNums = (chromaSeq: number[]) => {
  // given an array of chroma pitches, (potentially) shift some of them up or
  // down by an octave such that the max difference between any two elements is
  // minimized

  // then sort
  const sortIdxs = argSort(chromaSeq)
  const dblArgSort = argSort(sortIdxs);
  const sorted = sortIdxs.map(idx => chromaSeq[idx]);

  // find dif between all adjacent elements; as well as dif between last element
  // shifted down an octave and first element
  const difs = sorted.map((pitch, idx) => {
    if (idx === sorted.length - 1) {
      return sorted[0] - (pitch - 12);
    } else {
      return sorted[idx + 1] - pitch;
    }
  })

  // everything above the max diff idx gets shifted down an octave
  const maxDifIdx = difs.indexOf(Math.max(...difs));
  const out = sorted.map((pitch, idx) => {
    if (idx > maxDifIdx) {
      return pitch - 12;
    } else {
      return pitch;
    }
  })
  const unsorted = dblArgSort.map(idx => out[idx]);
  return unsorted
}

export { 
  instantiatePiece, 
  segmentByDuration, 
  durationsOfPitchOnsets,
  patternCounter,
  chromaSeqToCondensedPitchNums,
  condensedDurations,
  PitchTimes,
}
