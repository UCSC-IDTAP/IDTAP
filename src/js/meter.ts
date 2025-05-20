import { v4 as uuidv4 } from 'uuid';
const approxEqual = (v1: number, v2: number, epsilon = 0.001) => {
  return Math.abs(v1 - v2) <= epsilon
};

import { AffiliationType } from '@shared/types'
class Pulse {
  realTime: number;
  uniqueId: string;
  affiliations: AffiliationType[]; // for PulseStructures
  meterId?: string;
  corporeal: boolean = true; // as opposed to just a placeholder that won't 
  // actually be visible in the transcription; useful for when a pulsed melodic
  // action begins in the middle of a metric / pulse structure (or ends midway
  // through one)

  constructor({
    realTime = 0.0,
    uniqueId = undefined,
    affiliation = undefined,
    meterId = undefined,
    corporeal = true,
    affiliations = undefined,
  }: {
    realTime?: number,
    uniqueId?: string,
    affiliation?: AffiliationType,
    meterId?: string,
    corporeal?: boolean,
    affiliations?: AffiliationType[],
  } = {}) {
    this.realTime = realTime;
    if (uniqueId === undefined) {
      this.uniqueId = uuidv4();
    } else {
      this.uniqueId = uniqueId;
    }
    if (affiliations === undefined) {
      this.affiliations = affiliation ? [affiliation] : [];
    } else {
      this.affiliations = affiliations;
    }
    
    this.corporeal = corporeal;
    this.meterId = meterId;
  }

  removeAffiliation(psId: string) {
    this.affiliations = this.affiliations.filter(a => a.psId !== psId)
  }

  addAffiliation({
    pulseStructure = undefined,
    idx = 0,
    segmentedMeterIdx = 0,
    layer = undefined,
    strong = false,
  }: {
    pulseStructure?: PulseStructure,
    idx?: number,
    segmentedMeterIdx?: number,
    layer?: number,
    strong?: boolean,
  } = {}) {
    // check if pulse real time is the same as the affiliation's pulse real time
    if (pulseStructure === undefined) {
      throw new Error('Pulse structure not defined')
    }
    if (this.realTime === pulseStructure.pulses[idx].realTime) {
      const affiliation = { 
        psId: pulseStructure.uniqueId, 
        idx, 
        layer,
        segmentedMeterIdx,
        strong,
      };
      if (this.affiliations.some(a => a.psId !== affiliation.psId)) {
        this.affiliations.push(affiliation)
      } else {
        throw new Error('Pulse already affiliated with this pulse structure')
      }
    } else {
      console.log(this.realTime, pulseStructure.pulses[idx].realTime)
      throw new Error('Pulse real time does not match affiliation real time')
    }
  }

  get lowestLayer(): number {
    // get all affiliations that have an associated layer
    const layers = this.affiliations.map(a => a.layer);
    const filteredLayers = layers.filter(l => l !== undefined) as number[];
    // if there are no layers, throw error
    if (filteredLayers.length === 0) {
      throw new Error('No layers found')
    } else {
      // otherwise return the lowest layer
      return Math.min(...filteredLayers)
    }
  }

  getLowestPSID() {
    const layer = this.lowestLayer;
    const affiliation = this.affiliations.find(a => a.layer === layer);
    if (affiliation === undefined) {
      throw new Error('Affiliation not found')
    }
    return affiliation.psId
  }

  toJSON() {
    return {
      realTime: this.realTime,
      uniqueId: this.uniqueId,
      affiliations: this.affiliations,
      meterId: this.meterId,
      corporeal: this.corporeal,
    }
  }
}

class PulseStructure {
  pulses: Pulse[];
  tempo: number; // bpm
  pulseDur: number; // seconds
  size: number;
  linearOffsets: number[];
  proportionalOffsets: number[];
  startTime: number;
  uniqueId: string;
  frontWeighted: boolean;
  layer?: number;
  parentPulseID?: string;
  primary: boolean;
  segmentedMeterIdx: number;
  meterId?: string;

  constructor({
    tempo = 60,
    size = 4,
    offsetType = 'proportional', 
    offsets = undefined,
    startTime = 0.0,
    uniqueId = uuidv4(),
    frontWeighted = true,
    initPulse = undefined,
    layer = undefined,
    parentPulseID = undefined,
    primary = true,
    segmentedMeterIdx = 0,
    meterId = undefined,
    pulses = undefined,
  }: {
    tempo?: number,
    size?: number,
    offsetType?: 'linear' | 'proportional',
    offsets?: number[],
    startTime?: number,
    uniqueId?: string,
    frontWeighted?: boolean,
    initPulse?: Pulse,
    layer?: number,
    parentPulseID?: string,
    primary?: boolean,
    segmentedMeterIdx?: number,
    meterId?: string,
    linearOffsets?: number[],
    pulses?: Pulse[],
  } = {}) {
    this.segmentedMeterIdx = segmentedMeterIdx;
    this.frontWeighted = frontWeighted;
    this.uniqueId = uniqueId;
    this.tempo = tempo;
    this.pulseDur = 60 / tempo;
    this.size = size;
    this.startTime = startTime;
    this.layer = layer;
    this.parentPulseID = parentPulseID;
    this.primary = primary;
    this.meterId = meterId;
    if (pulses === undefined) {
      if (offsets === undefined) {
        this.pulses = [...Array(size).keys()].map(i => new Pulse({ 
          realTime: this.startTime + i * this.pulseDur,
          affiliation: { 
            psId: this.uniqueId, 
            idx: i, 
            layer: this.layer,
            segmentedMeterIdx: this.segmentedMeterIdx,
            strong: this.frontWeighted ? i === 0 : i === size - 1, 
          },
          meterId: this.meterId,
        }));
        this.proportionalOffsets = [...Array(size).keys()].map(() => 0.0);
        this.linearOffsets = [...Array(size).keys()].map(() => 0.0);
      } else {
        if (offsets.length !== size) {
          throw new Error('offsets must be same length as size')
        } else if (offsetType === 'proportional') {
          this.proportionalOffsets = offsets;
          const min = Math.min(...offsets);
          const max = Math.max(...offsets);
          if (min < -0.5 || max > 0.5) {
            throw new Error('offsets must be between -0.5 and 0.5')
          }
          this.linearOffsets = offsets.map(o => o * this.pulseDur);
        } else { // offsetType === 'linear'
          const maxOff = 0.5 * this.pulseDur;
          const min = Math.min(...offsets);
          const max = Math.max(...offsets);
          if (min < -maxOff || max > maxOff) {
            throw new Error('offsets must be between -0.5 and 0.5')
          }
          this.linearOffsets = offsets;
          this.proportionalOffsets = offsets.map(o => o / this.pulseDur);
        }
        this.pulses = this.linearOffsets.map((o, i) => {
          const time = this.startTime + o + i * this.pulseDur;
          return new Pulse({
            realTime: time,
            affiliation: { 
              psId: this.uniqueId, 
              idx: i,
              segmentedMeterIdx: this.segmentedMeterIdx,
              strong: this.frontWeighted ? i === 0 : i === size - 1,
            },
            meterId: this.meterId,
          })
        });
        if (this.pulses[0].realTime < 0) {
          throw new Error('all pulses must be positive or zero')
        }
      }
      if (initPulse !== undefined) {
        if (this.frontWeighted === true) {
          this.pulses[0] = initPulse;
        } else {
          this.pulses[this.pulses.length - 1] = initPulse;
        }
      }
    } else {
      this.pulses = pulses.map(p => {
        return new Pulse(p)
      });
      // assuming the offsets are proportional
      if (offsets === undefined) {
        throw new Error('Must provide offsets if providing pulses')
      }
      this.proportionalOffsets = offsets;
      this.linearOffsets = offsets.map(o => o * this.pulseDur);
    }
  }

  get durTot() {
    return this.size * this.pulseDur;
  }

  getPulseIdxFromId(pulseId: string) {
    return this.pulses.findIndex(p => p.uniqueId === pulseId)
  }

  adjustLinearOffsets(offsets: number[], override: boolean = false) {
    if (offsets.length !== this.size) {
      throw new Error('offsets must be same length as size')
    }
    const maxOff = 0.5 * this.pulseDur;
    const min = Math.min(...offsets);
    const max = Math.max(...offsets);
    if (!override && (min < -maxOff || max > maxOff)) {
      throw new Error('offsets must be between -0.5 and 0.5 of pulse duration')
    }
    this.linearOffsets = offsets;
    this.proportionalOffsets = offsets.map(o => o / this.pulseDur);
    const newRealTimes = this.linearOffsets.map((o, i) => {
      return this.startTime + o + i * this.pulseDur;
    });
    this.pulses.forEach((p, i) => {
      p.realTime = newRealTimes[i];
    });
    this.fixOffsets();
  }

  fixOffsets() {
    // is first offset is not zero, adjusts the pulse structure accordingly
    if (this.linearOffsets[0] !== 0) {
      const newDurTot = this.durTot - this.linearOffsets[0];
      const newStartTime = this.startTime + this.linearOffsets[0];
      const newPulseDur = newDurTot / this.size;
      this.pulseDur = newPulseDur;
      this.startTime = newStartTime;
      this.tempo = 60 / newPulseDur;
      this.linearOffsets = this.pulses.map((p, i) => {
        return p.realTime - this.startTime - i * this.pulseDur;
      });
      this.proportionalOffsets = this.linearOffsets.map(o => o / this.pulseDur);
    }
  }

  adjustProportionalOffsets(offsets: number[]) {
    if (offsets.length !== this.size) {
      throw new Error('offsets must be same length as size')
    }
    const min = Math.min(...offsets);
    const max = Math.max(...offsets);
    if (min < -0.5 || max > 0.5) {
      throw new Error('offsets must be between -0.5 and 0.5')
    }
    this.proportionalOffsets = offsets;
    this.linearOffsets = offsets.map(o => o * this.pulseDur);
    const newRealTimes = this.linearOffsets.map((o, i) => {
      return this.startTime + o + i * this.pulseDur;
    });
    this.pulses.forEach((p, i) => {
      p.realTime = newRealTimes[i];
    });
    this.fixOffsets();
  }

  static fromPulse(pulse: Pulse, duration: number, size: number, {
    frontWeighted = true,
    layer = 0,
  }: {
    frontWeighted?: boolean,
    layer?: number,
  } = {}) {
    // for evenly spaced pulse structures ... you can always update offsets
    // later
    const startTime = pulse.realTime;
    const tempo = 60 * size / duration;
    const ps = new PulseStructure({
      tempo,
      size, 
      startTime,
      frontWeighted,
      initPulse: pulse,
      layer,
      parentPulseID: pulse.uniqueId,
      meterId: pulse.meterId,
    });
    const idx = frontWeighted === true ? 0 : ps.pulses.length - 1;
    pulse.addAffiliation({
      pulseStructure: ps, 
      idx, 
      segmentedMeterIdx: 0, 
      layer,
      strong: true,
    })
    return ps
  }

  setTempo(newTempo: number) {
    const newPulseDur = 60.0 / newTempo;
    const newRealTimes = this.proportionalOffsets.map((o, i) => {
      return this.startTime + o * newPulseDur + i * newPulseDur;
    });
    this.pulseDur = newPulseDur;
    this.pulses.forEach((p, i) => {
      p.realTime = newRealTimes[i];
    });
    this.tempo = newTempo;
  }

  setStartTime(newStartTime: number) {
    const newRealTimes = this.proportionalOffsets.map((o, i) => {
      return newStartTime + o * this.pulseDur + i * this.pulseDur;
    });
    this.startTime = newStartTime;
    this.pulses.forEach((p, i) => {
      p.realTime = newRealTimes[i];
    });
    
  }

  toJSON() {
    return {
      pulses: this.pulses.map(p => p.toJSON()),
      tempo: this.tempo,
      pulseDur: this.pulseDur,
      size: this.size,
      startTime: this.startTime,
      uniqueId: this.uniqueId,
      frontWeighted: this.frontWeighted,
      layer: this.layer,
      parentPulseID: this.parentPulseID,
      primary: this.primary,
      segmentedMeterIdx: this.segmentedMeterIdx,
      meterId: this.meterId,
      offsets: this.proportionalOffsets

    }
  }
}
// [4] or [4, 2] or [[4, 3], [2]] or 

const sum = (arr: number[]) => arr.reduce((a, b) => a + b, 0);

class Meter {
  hierarchy: (number | number[])[];
  pulseStructures: PulseStructure[][];
  startTime: number;
  uniqueId: string;
  repetitions: number;
  tempo: number;
  relCorpLims: number[]; // relative corporeal limits
  propCorpLims: number[]; // proportional corporeal limits

  constructor({
    hierarchy = [4, 4],
    startTime = 0.0,
    tempo = 60, //bpm
    uniqueId = undefined,
    repetitions = 1,
    relCorpLims = undefined,
    propCorpLims = undefined,
    pulseStructures = undefined,
  }: {
    hierarchy?: (number | number[])[],
    startTime?: number,
    tempo?: number,
    uniqueId?: string,
    repetitions?: number,
    relCorpLims?: number[],
    propCorpLims?: number[],
    pulseStructures?: PulseStructure[][],
  } = {}) {
    if (uniqueId === undefined) {
      this.uniqueId = uuidv4();
    } else {
      this.uniqueId = uniqueId;
    }
    this.repetitions = repetitions;
    this.hierarchy = hierarchy;
    this.startTime = startTime;
    this.tempo = tempo;
    if (pulseStructures === undefined) {
      this.pulseStructures = [];
      this.hierarchy.forEach((h, i) => {
        const subPulseStructures: PulseStructure[] = [];
        if (i === 0) {
          for (let rep = 0; rep < repetitions; rep++) {
            if (typeof h === 'number') {
              const tempo_ = 60 * h / this.cycleDur;
              const ps = new PulseStructure({
                tempo: tempo_,
                size: h,
                startTime: rep * this.cycleDur + this.startTime,
                layer: i,
                meterId: this.uniqueId,
              })
              subPulseStructures.push(ps)
            } else {
              const summed = sum(h);
              const tempo_ = 60 * summed / this.cycleDur;
              const beatDur = this.cycleDur / summed;
              h.forEach((subH, j) => {
                let startTime = this.startTime + beatDur * sum(h.slice(0, j));
                startTime += rep * this.cycleDur;
                const ps = new PulseStructure({
                  tempo: tempo_,
                  size: subH,
                  startTime,
                  layer: i,
                  primary: j === 0,
                  segmentedMeterIdx: j,
                  meterId: this.uniqueId,
                })
                subPulseStructures.push(ps)
              })
            }
          }         
        } else {
          if (typeof h === 'number') {
            this.pulseStructures[i - 1].forEach(parentPS => {
              parentPS.pulses.forEach(p => {
                let duration = parentPS.pulseDur;
                const ps = PulseStructure.fromPulse(p, duration, h, { 
                  layer: i 
                })
                subPulseStructures.push(ps)
              })
            })
          } else {
            const summed = sum(h);
            this.pulseStructures[i - 1].forEach(parentPS => {
              parentPS.pulses.forEach(p => {
                const beatDur = parentPS.pulseDur / summed;
                h.forEach((subH, k) => {
                  let startTime = p.realTime + beatDur * sum(h.slice(0, k));
                  const tempo_ = 60 / beatDur;
                  const duration = beatDur * subH;
                  const c1 = parentPS.frontWeighted && k === 0;
                  const c2 = !parentPS.frontWeighted && k === h.length - 1;
                  let ps: PulseStructure;
                  if (c1 || c2) {
                    ps = PulseStructure.fromPulse(p, duration, subH, {
                      frontWeighted: parentPS.frontWeighted,
                      layer: i,
                    })
                  } else {
                    ps = new PulseStructure({
                      tempo: tempo_,
                      size: subH,
                      startTime,
                      layer: i,
                      parentPulseID: p.uniqueId,
                      primary: false,
                      segmentedMeterIdx: k,
                      meterId: this.uniqueId,
                    });
                  }
                  subPulseStructures.push(ps)
                })
              })
            })
          }
        }
        this.pulseStructures.push(subPulseStructures)
      })
    } else {
      this.pulseStructures = pulseStructures.map(psArr => {
        return psArr.map(ps => new PulseStructure(ps))
      });
    }
    


    if (relCorpLims !== undefined) {
      if (propCorpLims !== undefined) {
        const translated = propCorpLims.map(p => p * this.durTot);
        const equalArrs = translated.every((t, i) => {
          const diff = Math.abs(t - relCorpLims[i]);
          return diff < 0.000000001
        });
        if (!equalArrs) {
          throw new Error('Cannot specify both relative and proportional ' + 
            'corporeal limits')
        }
        this.propCorpLims = propCorpLims;
      }
      this.relCorpLims = relCorpLims;
      this.propCorpLims = this.relCorpLims.map(r => {
        return r / this.durTot
      })
    } else if (propCorpLims !== undefined) {
      this.propCorpLims = propCorpLims;
      this.relCorpLims = this.propCorpLims.map(p => {
        return p * this.durTot
      })
    } else {
      this.relCorpLims = [0, this.durTot];
      this.propCorpLims = [0, 1];
    }
    const start = this.relCorpLims[0];
    const end = this.relCorpLims[1];
    this.limitRelTemporalCorporeality(start, end)
  }

  hidePulseAndPriors(pulse: Pulse) {
    const prop = Number.EPSILON + pulse.realTime / this.durTot;
    this.limitPropCorporeality({
      propStartTime: prop
    })    
  }

  showPriorPulses() {
    this.limitPropCorporeality({ propStartTime: 0 })
  }

  showLaterPulses() {
    this.limitPropCorporeality({ propEndTime: 1 })
  }

  hidePulseAndFollowing(pulse: Pulse) {
    const prop = pulse.realTime / this.durTot - Number.EPSILON;
    this.limitPropCorporeality({
      propEndTime: prop
    })
  }

  growCycle() {
    this.resetTempo();
    const newPSs: PulseStructure[][] = [];
    this.hierarchy.forEach((h, i) => {
      const subPulseStructures: PulseStructure[] = [];
      if (i === 0) {
        if (typeof h === 'number') {
          const tempo_ = 60 * h / this.cycleDur;
          const ps = new PulseStructure({
            tempo: tempo_,
            size: h,
            startTime: this.repetitions * this.cycleDur + this.startTime,
            layer: i,
            meterId: this.uniqueId,
          })
          subPulseStructures.push(ps)
        } else {
          const summed = sum(h);
          const tempo_ = 60 * summed / this.cycleDur;
          const beatDur = this.cycleDur / summed;
          h.forEach((subH, j) => {
            let startTime = this.startTime + beatDur * sum(h.slice(0, j));
            startTime += this.repetitions * this.cycleDur;
            const ps = new PulseStructure({
              tempo: tempo_,
              size: subH,
              startTime,
              layer: i,
              primary: j === 0,
              segmentedMeterIdx: j,
              meterId: this.uniqueId,
            });
            subPulseStructures.push(ps)
          })
        }
      } else {
        if (typeof h === 'number') {
          newPSs[i-1].forEach(parentPS => {
            parentPS.pulses.forEach(p => {
              let duration = parentPS.pulseDur;
              const ps = PulseStructure.fromPulse(p, duration, h, {
                layer: i
              })
              subPulseStructures.push(ps)
            })
          })
        } else {
          const summed = sum(h);
          newPSs[i-1].forEach(parentPS => {
            parentPS.pulses.forEach(p => {
              const beatDur = parentPS.pulseDur / summed;
              h.forEach((subH, k) => {
                let startTime = p.realTime + beatDur * sum(h.slice(0, k));
                const tempo_ = 60 / beatDur;
                const duration = beatDur * subH;
                const c1 = parentPS.frontWeighted && k === 0;
                const c2 = !parentPS.frontWeighted && k === h.length - 1;
                let ps: PulseStructure;
                if (c1 || c2) {
                  ps = PulseStructure.fromPulse(p, duration, subH, {
                    frontWeighted: parentPS.frontWeighted,
                    layer: i,
                  })
                } else {
                  ps = new PulseStructure({
                    tempo: tempo_,
                    size: subH,
                    startTime,
                    layer: i,
                    parentPulseID: p.uniqueId,
                    primary: false,
                    segmentedMeterIdx: k,
                    meterId: this.uniqueId,
                  });
                }
                subPulseStructures.push(ps)
              })
            })
          })
        }
      }
      newPSs.push(subPulseStructures)    
    })
    newPSs.forEach((psArr, i) => {
      this.pulseStructures[i] = this.pulseStructures[i].concat(psArr)
    })
    this.repetitions += 1;
    const mult = this.repetitions / (this.repetitions - 1);
    this.relCorpLims[1] = this.relCorpLims[1] * mult;
  }

  growCycles(n: number) {
    for (let i = 0; i < n; i++) {
      this.growCycle()
    }
  }

  shrinkCycle() {
    if (this.repetitions <= 1) {
      throw new Error('Cannot shrink meter with only one cycle')
    }
    this.hierarchy.forEach((_, i) => {
      const pssPerCycle = this.pulseStructures[i].length / this.repetitions;
      const cutoff = pssPerCycle * (this.repetitions - 1);
      this.pulseStructures[i] = this.pulseStructures[i].slice(0, cutoff)
    })
    this.repetitions -= 1;
    const mult = this.repetitions / (this.repetitions + 1);
    this.relCorpLims[1] = this.relCorpLims[1] * mult;
  }

  shrinkCycles(n: number) {
    for (let i = 0; i < n; i++) {
      this.shrinkCycle()
    }
  }

  shrinkLayer() {
    if (this.hierarchy.length <= 1) {
      throw new Error('Cannot shrink meter with only one layer')
    }
    const layer = this.hierarchy.length - 1;
    this.allPulses.forEach(p => {
      p.affiliations = p.affiliations.filter(aff => {
        return aff.layer !== layer
      })
  
    })
    this.hierarchy.pop();
    this.pulseStructures.pop();

  }

  shrinkLayers(n: number) {
    if (n > this.hierarchy.length - 1) {
      throw new Error('Cannot shrink meter below one layer')
    }
    for (let i = 0; i < n; i++) {
      this.shrinkLayer()
    }
  }

  growLayer(hierarchy: number[] | number) {
    this.hierarchy.push(hierarchy);
    const newPSs: PulseStructure[] = [];
    let durs = this.realTimes.slice(0, this.realTimes.length-1).map((rt, i) => {
      return this.realTimes[i+1] - rt;
    })
    durs.push(this.cycleDur * this.repetitions - sum(durs));
    const lastPSs = this.pulseStructures[this.pulseStructures.length - 1];
    if (typeof hierarchy === 'number') {  
      let ct = 0;
      lastPSs.forEach(ps => {
        ps.pulses.forEach(p => {
          const dur = durs[ct];
          const newPS = PulseStructure.fromPulse(p, dur, hierarchy, {
            layer: this.pulseStructures.length,
          })
          newPSs.push(newPS)
          ct += 1;
        })
      })
    } else {
      let ct = 0;
      lastPSs.forEach(ps => {
        ps.pulses.forEach(p => {
          const durTot = durs[ct];
          const summed = sum(hierarchy);
          const beatDur = durTot / summed;
          hierarchy.forEach((h, j) => {
            let startTime = p.realTime + beatDur * sum(hierarchy.slice(0, j));
            const tempo_ = 60 / beatDur;
            const duration = beatDur * h;
            const c1 = ps.frontWeighted && j === 0;
            const c2 = !ps.frontWeighted && j === hierarchy.length - 1;
            let newPS: PulseStructure;
            if (c1 || c2) {
              newPS = PulseStructure.fromPulse(p, duration, h, {
                frontWeighted: ps.frontWeighted,
                layer: this.pulseStructures.length,
              })
            } else {
              newPS = new PulseStructure({
                tempo: tempo_,
                size: h,
                startTime,
                layer: this.pulseStructures.length,
                parentPulseID: p.uniqueId,
                primary: false,
                segmentedMeterIdx: j,
                meterId: this.uniqueId,
              });
            }
            newPSs.push(newPS)            
          })
          ct += 1;
        })
      })
    }
    this.pulseStructures.push(newPSs);
  }

  growLayers(hierarchies: (number | number[])[]) {
    hierarchies.forEach(h => this.growLayer(h))
  }

  alterLayer(layer: number, hierarchy: number | number[]) {
    if (layer > this.hierarchy.length - 1) {
      throw new Error(`Layer ${layer} does not exist`)
    }
    this.hierarchy[layer] = hierarchy;
    const hiCopy = this.hierarchy.slice(0, this.hierarchy.length);
    this.shrinkLayers(this.hierarchy.length - layer);
    this.growLayers(hiCopy.slice(layer))
  }

  get allPulses() {
    // go to lowest layer, get all pulses
    const lastLayer = this.pulseStructures[this.pulseStructures.length - 1];
    return lastLayer.map(ps => ps.pulses).flat()
  }

  get allCorporealPulses() {
    return this.allPulses.filter(p => p.corporeal)
  }

  get allPulseStructures() {
    return this.pulseStructures.flat()
  }

  getPSFromId(id: string) {
    const outPS = this.allPulseStructures.find(ps => ps.uniqueId === id);
    if (outPS === undefined) {
      throw new Error(`PulseStructure with ID ${id} not found`)
    }
    return outPS
  }

  addTimePoints(timePoints: number[], layer: number = 1) {
    timePoints = timePoints.sort((a, b) => a - b);
    const lastRealTime = this.realTimes[this.realTimes.length - 1];
    if (timePoints[0] < lastRealTime) {
      throw new Error('timePoints must be greater than last realTime')
    }
    const curEndTime = this.durTot + this.startTime;
    let summed = this.hierarchy[0] instanceof Array ? 
      sum(this.hierarchy[0] as number[]) : 
      this.hierarchy[0] as number;
    if (layer > 0) {
      const hierarchySlice = this.hierarchy.slice(1, layer + 1) as number[]
      const mult = hierarchySlice.reduce((a, b) => a * b, 1);
      summed = summed * mult;
    }
    const beatDur = this.cycleDur / summed;
    const predictedTimes: number[] = [];
    let cTime = curEndTime; 
    while (cTime < timePoints[timePoints.length-1] + beatDur) {
      predictedTimes.push(cTime);
      cTime += beatDur
    }
    const idxs = findClosestIdxs(timePoints, predictedTimes);
    const cycleNums = idxs.map(idx => {
      return Math.floor(idx / summed)
    });
    const prevPLen = this.pulseStructures[layer]
      .map(ps => ps.pulses).flat().length;
    this.growCycles(Math.max(...cycleNums) + 1);
    for (let l = 0; l <= layer; l++) {
      idxs.forEach((idx, i) => {
        const layerPulses = this.pulseStructures[layer]
          .map(ps => ps.pulses).flat();
        const pulse = layerPulses[prevPLen + idx];
        const offset = timePoints[i] - pulse.realTime;
        if (l === pulse.lowestLayer) {
          this.offsetPulse(pulse, offset)
        }
      })
    }
  }

  static fromTimePoints({
    timePoints = undefined,
    hierarchy = undefined,
    repetitions = 1,
    layer = 0
  }: {
    timePoints?: number[],
    hierarchy?: (number | number[])[],
    repetitions?: number,
    layer?: number
  } = {}) {
    
    // assume timepoints are top layer, with no skips, they start at beginning
    // of cycle, and they are in order
    if (timePoints === undefined) {
      throw new Error('Must provide timePoints to create Meter')
    }
    if (timePoints.length < 2) {
      throw new Error('Must provide at least two timePoints')
    }
    if (hierarchy === undefined) {
      throw new Error('Must provide hierarchy to create Meter')
    }
    if (hierarchy.length < 1) {
      throw new Error('Must provide at least one hierarchy')
    }
    if (layer === 1) {
      const layer0Size = hierarchy[0] instanceof Array ?
        sum(hierarchy[0] as number[]) :
        hierarchy[0] as number;
      const avgDiff = (timePoints[timePoints.length - 1] - timePoints[0]) / 
        (timePoints.length - 1);
      while (timePoints.length < layer0Size + 1) {
        timePoints.push(timePoints[timePoints.length - 1] + avgDiff)
      }
    }
    
    let diffs = timePoints.slice(0, timePoints.length - 1).map((tp, i) => {
      return timePoints![i+1] - tp;
    })
    const initTimepoints = timePoints.slice(0, timePoints.length);
    let pulseDur = sum(diffs) / diffs.length;

    let zerodTPs = timePoints.map(tp => tp - timePoints![0]);
    let norms = timePoints.map((_, i) => pulseDur * i);
    let tpDiffs = zerodTPs.map((tp, i) => (tp - norms[i]) / pulseDur);
    while (tpDiffs.some(d => Math.abs(d) > 0.4)) {
      const absTpDiffs = tpDiffs.map(d => Math.abs(d));
      const biggestIdx = absTpDiffs.indexOf(Math.max(...absTpDiffs));
      const diff = tpDiffs[biggestIdx];
      if (diff > 0) {
        const newTP = (timePoints[biggestIdx-1] + timePoints[biggestIdx]) / 2;
        timePoints.splice(biggestIdx, 0, newTP);
      } else {
        const newTP = (timePoints[biggestIdx] + timePoints[biggestIdx+1]) / 2;
        timePoints.splice(biggestIdx+1, 0, newTP);
      }
      diffs = timePoints.slice(0, timePoints.length - 1).map((tp, i) => {
        return timePoints![i+1] - tp;
      });
      pulseDur = sum(diffs) / diffs.length;
      zerodTPs = timePoints.map(tp => tp - timePoints![0]);
      norms = timePoints.map((_, i) => pulseDur * i);
      tpDiffs = zerodTPs.map((tp, i) => (tp - norms[i]) / pulseDur);
    }

    if (layer === 1) {
      let sum = 0;
      if (typeof hierarchy[1] === 'number') {
        sum = hierarchy[1] as number;
      } else {
        sum = (hierarchy[1] as number[]).reduce((a, b) => a + b, 0);
      }
      timePoints = timePoints.filter((_, i) => i % sum === 0)
    }
    if (typeof hierarchy[0] === 'number') {
      while (hierarchy[0] * repetitions < timePoints.length) {
        repetitions += 1;
      }
    } else {
      while (sum(hierarchy[0]) * repetitions < timePoints.length) {
        repetitions += 1;
      }
    }
    diffs = timePoints.slice(0, timePoints.length - 1).map((tp, i) => {
      return timePoints![i+1] - tp;
    });
    pulseDur = sum(diffs) / diffs.length;
    
    const tempo = 60 / pulseDur;
    const startTime = timePoints[0];
    const meter = new Meter({
      hierarchy,
      startTime,
      tempo,
      repetitions
    })
    const metricPulses = meter.allPulses
      .filter(p => p.lowestLayer === 0)
    const metricTimes = metricPulses
      .map(p => p.realTime);
    timePoints.forEach((tp, i) => {
      if (i > 0) {
        const diff = tp - metricTimes[i];
        meter.offsetPulse(metricPulses[i], diff)
      }
    })
    if (layer === 1) {
      let otpCt = 0;
      meter.pulseStructures[1].forEach(ps => {
        let psMetricPulses = ps.pulses;
        let psMetricTimes = psMetricPulses.map(p => p.realTime);
        psMetricTimes.forEach((mt, i) => {
          if (i > 0) {
            const tp = initTimepoints[otpCt + i];
            if (tp !== undefined) {
              const pulse = psMetricPulses[i];
              const diff = tp - mt;
              meter.offsetPulse(pulse, diff);
            }
          }
        })
        otpCt += psMetricTimes.length;
      })
    }
    return meter
  }

  getPulseFromId(id: string) {
    return this.allPulses.find(p => p.uniqueId === id)
  }

  cycleOfPulse(pulse: Pulse) {
    // returns the cycle number of the pulse
    const pulseIdx = this.allPulses.indexOf(pulse);
    const pulsesPerCycle = this.allPulses.length / this.repetitions;
    return Math.floor(pulseIdx / pulsesPerCycle)
  }

  async replaceAllChildrenPulseStructures(pulse: Pulse, layer: number) {
    // recursive
    const bottomLayerPulses = this.allPulses.filter(p => {
      return p.lowestLayer <= layer - 1
    })
    const pulseIdx = bottomLayerPulses.map(p => p.uniqueId).indexOf(pulse.uniqueId);
    if (pulseIdx === -1) {
      throw new Error(`Pulse ${pulse.uniqueId} not found`)
    } else if (pulseIdx === 0) {
      throw new Error(`Cannot shift first pulse`)
    }
    const prevPulse = bottomLayerPulses[pulseIdx - 1];
    let parentPulseIDs = [prevPulse.uniqueId, pulse.uniqueId];
    let removeIdxsGrid = [];
    for (let i = layer; i < this.pulseStructures.length; i++) {
      const psLayer = this.pulseStructures[i];
      const removeIdxs: number[] = [];
      psLayer.forEach((ps, j) => {
        if (parentPulseIDs.includes(ps.parentPulseID!)) {
          removeIdxs.push(j);
          ps.pulses.forEach(p => {
            if (!parentPulseIDs.includes(p.uniqueId)) {
              parentPulseIDs.push(p.uniqueId);
            }
          })
        }
      })
      removeIdxsGrid.push(removeIdxs);
    }
    removeIdxsGrid.forEach((removeIdxs, i) => {
      const replacePSs: PulseStructure[] = [];
      const relLayer = i + layer;
      const lps = this.pulseStructures[relLayer-1].map(ps => ps.pulses).flat();
      const layerDurs = [...Array(lps.length-1).keys()].map(j => {
        return lps[j+1].realTime - lps[j].realTime
      })
      const durTot = this.repetitions * this.cycleDur;
      const lastLPSTime = lps[lps.length-1].realTime; 
      const last = durTot - lastLPSTime + lps[0].realTime;
      layerDurs.push(last);
      const h = this.hierarchy[relLayer];
      if (typeof h === 'number') {
        removeIdxs.forEach(idx => {
          const dur = layerDurs[idx];
          const oldPS = this.pulseStructures[relLayer][idx];
          const newPS = PulseStructure.fromPulse(lps[idx], dur, oldPS.size, {
            layer: relLayer
          })
          replacePSs.push(newPS);
        })
      } else {
        const summed = sum(h);
        const prevPulseAff = prevPulse.affiliations.find(aff => {
          return aff.layer === relLayer - 1
        })
        if (prevPulseAff === undefined) {
          throw new Error(`Pulse ${prevPulse.uniqueId} does not have ` + 
            `affiliation in layer ${relLayer - 1}`)
        }
        let startIdx: number;
        if (prevPulseAff.segmentedMeterIdx === 0) {
          startIdx = prevPulseAff?.idx
        } else {
          const hierarchyLayer = this.hierarchy[relLayer - 1];
          if (typeof hierarchyLayer === 'number') {
            throw new Error(`Cannot have segmented meter index for layer ` + 
              `${relLayer - 1} because it is not a hierarchical layer`)
          }
          const segIdx = prevPulseAff.segmentedMeterIdx;

          const idxOffset = sum(hierarchyLayer.slice(0, segIdx))
          startIdx = prevPulseAff.idx + idxOffset;
        }
        layerDurs.forEach((dur, j) => {
          if (j >= startIdx && j < startIdx + 2) {
            const unitDur = dur / summed;
            h.forEach((subH, k) => {
              const dur = unitDur * subH;
              if (k === 0) {
                const newPS = PulseStructure.fromPulse(lps[j], dur, subH, {
                  layer: relLayer
                })
                replacePSs.push(newPS);
              } else {
                const tempo_ = 60 * subH / dur;
                const st = lps[j].realTime + unitDur * sum(h.slice(0, k));
                const newPS = new PulseStructure({
                  tempo: tempo_,
                  size: subH,
                  startTime: st,
                  layer: relLayer,
                  parentPulseID: lps[j].uniqueId,
                  primary: false,
                  meterId: this.uniqueId
                })
                replacePSs.push(newPS);
              }
            })
          }
        })
      }
      const riStart = removeIdxs[0];
      const riEnd = removeIdxs[removeIdxs.length - 1];
      const deletedPSs = this.pulseStructures[relLayer]
        .splice(riStart, riEnd - riStart + 1, ...replacePSs)
      deletedPSs.forEach(ps => {
        ps.pulses.forEach(p => p.removeAffiliation(ps.uniqueId))
      })
    })
  }

  offsetPulse(pulse: Pulse, offset: number, override: boolean = false) { 
    // adjust the start time of one
    // of the pulses in the pulse structure by a given amount, and adjust the 
    // relevent higher-layer pulses accordingly.
    const psID = pulse.getLowestPSID();
    const layer = pulse.lowestLayer;
    const pulseStructure = this.getPSFromId(psID);
    const psIdx = this.pulseStructures[layer].findIndex(ps => {
      return ps.uniqueId === psID
    });
    const first = pulse.affiliations[0].idx === 0;
    const firstSeg = pulseStructure.segmentedMeterIdx === 0;
    if (layer === 0 && psIdx > 0 && firstSeg && first) {
        const prevPS = this.pulseStructures[0][psIdx - 1];
        const prevDurTot = prevPS.durTot;
        const newDurTot = prevDurTot + offset;
        const newPulseDur = newDurTot / prevPS.size;
        const newLinearOffsets = prevPS.pulses.map((p, pIdx) => {
          return (p.realTime - prevPS.startTime) - newPulseDur * pIdx
        })
        const newProporionalOffsets = newLinearOffsets.map((o) => {
          return o / newPulseDur
        })
        const newTempo = 60 / newPulseDur;
        prevPS.tempo = newTempo;
        prevPS.pulseDur = newPulseDur;
        prevPS.linearOffsets = newLinearOffsets;
        prevPS.proportionalOffsets = newProporionalOffsets;
      // }
    } else {
      /* eslint-disable no-undef */
      /* eslint-disable no-console */
    }
    // first, adjust the pulse structure
    const pulseIdx = pulseStructure.getPulseIdxFromId(pulse.uniqueId);
    const newOffsets = pulseStructure.linearOffsets;
    newOffsets[pulseIdx] += offset;
    pulseStructure.adjustLinearOffsets(newOffsets, override);
    // then, for relevent pulses (the previous, and the next), get rid of all
    // children pulse structures, and re-add them
    // get all pulses whose lowest layer is less than or equal to that layer;
    const layerPulses = this.allPulses.filter(p => p.lowestLayer <= layer);
    const layerPulseIdx = layerPulses.findIndex(p => {
      p.uniqueId === pulse.uniqueId
    });
    if (layerPulseIdx === 0) {
      throw new Error('Cannot offset first pulse')
    }
    this.replaceAllChildrenPulseStructures(pulse, layer+1)
  }

  resetTempo() {
    // for when a pulse has been offset, and we need to ensure the new added 
    // cycles make sense gong forward. [would a better solution just to have 
    // each cycle be its own tempo? How to deal with tempo shifts ...........]

    // simple case, single hierarchies

    const curLPTime = this.allPulses[this.allPulses.length - 1].realTime;
    const _summed = typeof this.hierarchy[0] === 'number' ?
      this.hierarchy[0] as number :
      sum(this.hierarchy[0] as number[]);
    const mults = this.hierarchy.map((h, i) => {
      if (i === 0) {
        return _summed
      } else {
        return h as number
      }
    });
    const multed = mults.reduce((a, b) => a * b, 1);
    const _bit = this.cycleDur / multed;
    const targetLPTime = _bit * (this.allPulses.length - 1) + this.startTime;
    const diff = Math.abs(targetLPTime - curLPTime);
    if (diff > 0.000000001) {
      const bifurcated = typeof this.hierarchy[0] !== 'number';
      if (this.hierarchy.length === 1) {
        const summed = typeof this.hierarchy[0] === 'number' ?
          this.hierarchy[0] as number :
          sum(this.hierarchy[0] as number[]);
        const lastPulseNum = this.allPulses.length - 1;
        const lastPulse = this.allPulses[lastPulseNum];
        const pulseProp =  lastPulseNum / 
          (this.repetitions * summed);
        const propDur = lastPulse.realTime - this.startTime;
        const newDurTot = propDur / pulseProp;
        const newCyDur = newDurTot / this.repetitions;
        const newTempo = 60 * summed / newCyDur;
        const newDefaultTimes = this.pulseStructures[0].map((ps, i) => {
          const bit = newCyDur / summed;
          const topHIdx = bifurcated ? 
            i % (this.hierarchy[0] as number[]).length :
            0;
          const cyNum = bifurcated ? 
            Math.floor(i / (this.hierarchy[0] as number[]).length) :
            i;
          return ps.pulses.map((_, idx) => {
            let partialTime = 0;
            if (bifurcated) {
              const h = this.hierarchy[0] as number[];
              partialTime = newCyDur * sum(h.slice(0, topHIdx)) / summed;
            }
            return bit * idx + cyNum * newCyDur + partialTime + this.startTime
          })
        });
        const linOffsets = newDefaultTimes.map((times, i) => {
          const topHIdx = bifurcated ? 
            i % (this.hierarchy[0] as number[]).length :
            0;
          const cyNum = bifurcated ? 
            Math.floor(i / (this.hierarchy[0] as number[]).length) :
            i;
          const p = bifurcated ? 
            sum((this.hierarchy[0] as number[]).slice(0, topHIdx)) :
            0;
          return times.map((t, tIdx) => {
            return -t + this.realTimes[cyNum * summed + p + tIdx]
          })
        });
        this.pulseStructures[0].forEach((ps, i) => {
          
          ps.setTempo(newTempo);
          ps.setStartTime(newDefaultTimes[i][0]);
          ps.adjustLinearOffsets(linOffsets[i], true)
        })
        this.tempo = newTempo;
      } else if (this.hierarchy.length === 2) {
        const lastPulseNum = this.allPulses.length - 1;
        const lastPulse = this.allPulses[lastPulseNum];
        const pulseProp = lastPulseNum / this.allPulses.length;
        const propDur = lastPulse.realTime - this.startTime;
        const newDurTot = propDur / pulseProp;
        const newCyDur = newDurTot / this.repetitions;
        const bifurcated = typeof this.hierarchy[0] !== 'number';
        const summed = !bifurcated ?
          this.hierarchy[0] as number :
          sum(this.hierarchy[0] as number[]);
        const newTopTempo = 60 * summed / newCyDur;
        const newLowTempo = newTopTempo * (this.hierarchy[1] as number);
        const newTopDefaultTimes = this.pulseStructures[0].map((ps, i) => {
          const bit = newCyDur / summed;
          const topHIdx = bifurcated ? 
            i % (this.hierarchy[0] as number[]).length :
            0;
          const cyNum = bifurcated ? 
            Math.floor(i / (this.hierarchy[0] as number[]).length) :
            i;
          return ps.pulses.map((_, idx) => {
            let partialTime = 0;
            if (bifurcated) {
              const h = this.hierarchy[0] as number[];
              partialTime = newCyDur * sum(h.slice(0, topHIdx)) / summed;
            }
            return bit * idx + cyNum * newCyDur + partialTime + this.startTime
          })
        });
        const realTopTimes = this.pulseStructures[0]
          .map(ps => ps.pulses.map(p => p.realTime))
          .flat();
        const topLinOffsets = newTopDefaultTimes.map((times, i) => {
          const topHIdx = bifurcated ? 
            i % (this.hierarchy[0] as number[]).length :
            0;
          const cyNum = bifurcated ? 
            Math.floor(i / (this.hierarchy[0] as number[]).length) :
            i;
          const p = bifurcated ? 
            sum((this.hierarchy[0] as number[]).slice(0, topHIdx)) :
            0;
          return times.map((t, tIdx) => {
            return -t + realTopTimes[cyNum * summed + p + tIdx]
          })
        });
        this.pulseStructures[0].forEach((ps, i) => {
          ps.setTempo(newTopTempo);
          ps.setStartTime(newTopDefaultTimes[i][0]);
          ps.adjustLinearOffsets(topLinOffsets[i], true)
        })
        let ct = 0;
        const newLowDefaultTimes = this.pulseStructures[1].map(ps => {
          const bit = newCyDur / (summed * (this.hierarchy[1] as number));
          return ps.pulses.map(() => {
            const out = bit * ct + this.startTime;
            ct += 1;
            return out
          })
        })
        const realLowTimes = this.pulseStructures[1]
          .map(ps => ps.pulses.map(p => p.realTime))
        const lowLinOffsets = newLowDefaultTimes.map((times, i) => {
          return times.map((t, tIdx) => -t + realLowTimes[i][tIdx])
        });
        this.pulseStructures[1].forEach((ps, i) => {
          ps.setTempo(newLowTempo);
          ps.setStartTime(newLowDefaultTimes[i][0]);
          ps.adjustLinearOffsets(lowLinOffsets[i], true)
        });
        this.tempo = newTopTempo;
      } else if (this.hierarchy.length === 3) {
        const lastPulseNum = this.allPulses.length - 1;
        const lastPulse = this.allPulses[lastPulseNum];
        const pulseProp = lastPulseNum / this.allPulses.length;
        const propDur = lastPulse.realTime - this.startTime;
        const newDurTot = propDur / pulseProp;
        const newCyDur = newDurTot / this.repetitions;
        const bifurcated = typeof this.hierarchy[0] !== 'number';
        const summed = !bifurcated ?
          this.hierarchy[0] as number :
          sum(this.hierarchy[0] as number[]);
        const newTopTempo = 60 * summed / newCyDur;
        const newMidTempo = newTopTempo * (this.hierarchy[1] as number);
        const newLowTempo = newMidTempo * (this.hierarchy[2] as number);
        const newTopDefaultTimes = this.pulseStructures[0].map((ps, i) => {
          const bit = newCyDur / summed;
          const topHIdx = bifurcated ? 
            i % (this.hierarchy[0] as number[]).length :
            0;
          const cyNum = bifurcated ? 
            Math.floor(i / (this.hierarchy[0] as number[]).length) :
            i;
          return ps.pulses.map((_, idx) => {
            let partialTime = 0;
            if (bifurcated) {
              const h = this.hierarchy[0] as number[];
              partialTime = newCyDur * sum(h.slice(0, topHIdx)) / summed;
            }
            return bit * idx + cyNum * newCyDur + partialTime + this.startTime
          })
        });
        const realTopTimes = this.pulseStructures[0]
          .map(ps => ps.pulses.map(p => p.realTime))
          .flat();
        const topLinOffsets = newTopDefaultTimes.map((times, i) => {
          const topHIdx = bifurcated ? 
            i % (this.hierarchy[0] as number[]).length :
            0;
          const cyNum = bifurcated ? 
            Math.floor(i / (this.hierarchy[0] as number[]).length) :
            i;
          const p = bifurcated ? 
            sum((this.hierarchy[0] as number[]).slice(0, topHIdx)) :
            0;
          return times.map((t, tIdx) => {
            return -t + realTopTimes[cyNum * summed + p + tIdx]
          })
        });
        this.pulseStructures[0].forEach((ps, i) => {
          ps.setTempo(newTopTempo);
          ps.setStartTime(newTopDefaultTimes[i][0]);
          ps.adjustLinearOffsets(topLinOffsets[i], true)
        });
        let midCt = 0;
        const newMidDefaultTimes = this.pulseStructures[1].map(ps => {
          const bit = newCyDur / (summed * (this.hierarchy[1] as number));
          return ps.pulses.map(() => {
            const out = bit * midCt + this.startTime;
            midCt += 1;
            return out
          })
        });
        const realMidTimes = this.pulseStructures[1]
          .map(ps => ps.pulses.map(p => p.realTime))
        const midLinOffsets = newMidDefaultTimes.map((times, i) => {
          return times.map((t, tIdx) => -t + realMidTimes[i][tIdx])
        });
        this.pulseStructures[1].forEach((ps, i) => {
          ps.setTempo(newMidTempo);
          ps.setStartTime(newMidDefaultTimes[i][0]);
          ps.adjustLinearOffsets(midLinOffsets[i], true)
        });
        let lowCt = 0;
        const newLowDefaultTimes = this.pulseStructures[2].map(ps => {
          const h1 = this.hierarchy[1] as number;
          const h2 = this.hierarchy[2] as number;
          const bit = newCyDur / (summed * h1 * h2);
          return ps.pulses.map(() => {
            const out = bit * lowCt + this.startTime;
            lowCt += 1;
            return out
          })
        });
        const realLowTimes = this.pulseStructures[2]
          .map(ps => ps.pulses.map(p => p.realTime))
        const lowLinOffsets = newLowDefaultTimes.map((times, i) => {
          return times.map((t, tIdx) => -t + realLowTimes[i][tIdx])
        });
        this.pulseStructures[2].forEach((ps, i) => {
          ps.setTempo(newLowTempo);
          ps.setStartTime(newLowDefaultTimes[i][0]);
          ps.adjustLinearOffsets(lowLinOffsets[i], true)
        });
        this.tempo = newTopTempo;
      } else if (this.hierarchy.length === 4) {
        const lastPulseNum = this.allPulses.length - 1;
        const lastPulse = this.allPulses[lastPulseNum];
        const pulseProp = lastPulseNum / this.allPulses.length;
        const propDur = lastPulse.realTime - this.startTime;
        const newDurTot = propDur / pulseProp;
        const newCyDur = newDurTot / this.repetitions;
        const bifurcated = typeof this.hierarchy[0] !== 'number';
        const summed = !bifurcated ?
          this.hierarchy[0] as number :
          sum(this.hierarchy[0] as number[]);
        const newTopTempo = 60 * summed / newCyDur;
        const newMidTempo = newTopTempo * (this.hierarchy[1] as number);
        const newLowTempo = newMidTempo * (this.hierarchy[2] as number);
        const newBotTempo = newLowTempo * (this.hierarchy[3] as number);
        const newTopDefaultTimes = this.pulseStructures[0].map((ps, i) => {
          const bit = newCyDur / summed;
          const topHIdx = bifurcated ?
            i % (this.hierarchy[0] as number[]).length :
            0;
          const cyNum = bifurcated ?
            Math.floor(i / (this.hierarchy[0] as number[]).length) :
            i;
          return ps.pulses.map((_, idx) => {
            let partialTime = 0;
            if (bifurcated) {
              const h = this.hierarchy[0] as number[];
              partialTime = newCyDur * sum(h.slice(0, topHIdx)) / summed;
            }
            return bit * idx + cyNum * newCyDur + partialTime + this.startTime
          });
        });
        const realTopTimes = this.pulseStructures[0]
          .map(ps => ps.pulses.map(p => p.realTime))
          .flat();
        const topLinOffsets = newTopDefaultTimes.map((times, i) => {
          const topHIdx = bifurcated ?
            i % (this.hierarchy[0] as number[]).length :
            0;
          const cyNum = bifurcated ?
            Math.floor(i / (this.hierarchy[0] as number[]).length) :
            i;
          const p = bifurcated ?
            sum((this.hierarchy[0] as number[]).slice(0, topHIdx)) :
            0;
          return times.map((t, tIdx) => {
            return -t + realTopTimes[cyNum * summed + p + tIdx]
          })
        });
        this.pulseStructures[0].forEach((ps, i) => {
          ps.setTempo(newTopTempo);
          ps.setStartTime(newTopDefaultTimes[i][0]);
          ps.adjustLinearOffsets(topLinOffsets[i], true)
        });
        let midCt = 0;
        const newMidDefaultTimes = this.pulseStructures[1].map(ps => {
          const bit = newCyDur / (summed * (this.hierarchy[1] as number));
          return ps.pulses.map(() => {
            const out = bit * midCt + this.startTime;
            midCt += 1;
            return out
          });
        });
        const realMidTimes = this.pulseStructures[1]
          .map(ps => ps.pulses.map(p => p.realTime))
        const midLinOffsets = newMidDefaultTimes.map((times, i) => {
          return times.map((t, tIdx) => -t + realMidTimes[i][tIdx])
        });
        this.pulseStructures[1].forEach((ps, i) => {
          ps.setTempo(newMidTempo);
          ps.setStartTime(newMidDefaultTimes[i][0]);
          ps.adjustLinearOffsets(midLinOffsets[i], true)
        });
        let lowCt = 0;
        const newLowDefaultTimes = this.pulseStructures[2].map(ps => {
          const h1 = this.hierarchy[1] as number;
          const h2 = this.hierarchy[2] as number;

          const bit = newCyDur / (summed * h1 * h2);
          return ps.pulses.map(() => {
            const out = bit * lowCt + this.startTime;
            lowCt += 1;
            return out
          });
        });
        const realLowTimes = this.pulseStructures[2]
          .map(ps => ps.pulses.map(p => p.realTime))
        const lowLinOffsets = newLowDefaultTimes.map((times, i) => {
          return times.map((t, tIdx) => -t + realLowTimes[i][tIdx])
        });
        this.pulseStructures[2].forEach((ps, i) => {
          ps.setTempo(newLowTempo);
          ps.setStartTime(newLowDefaultTimes[i][0]);
          ps.adjustLinearOffsets(lowLinOffsets[i], true)
        });
        let botCt = 0;
        const newBotDefaultTimes = this.pulseStructures[3].map(ps => {
          const h1 = this.hierarchy[1] as number;
          const h2 = this.hierarchy[2] as number;
          const h3 = this.hierarchy[3] as number;
          const bit = newCyDur / (summed * h1 * h2 * h3);
          return ps.pulses.map(() => {
            const out = bit * botCt + this.startTime;
            botCt += 1;
            return out
          });
        });
        const realBotTimes = this.pulseStructures[3]
          .map(ps => ps.pulses.map(p => p.realTime))
        const botLinOffsets = newBotDefaultTimes.map((times, i) => {
          return times.map((t, tIdx) => -t + realBotTimes[i][tIdx])
        });
        this.pulseStructures[3].forEach((ps, i) => {
          ps.setTempo(newBotTempo);
          ps.setStartTime(newBotDefaultTimes[i][0]);
          ps.adjustLinearOffsets(botLinOffsets[i], true)
        });
        this.tempo = newTopTempo;
      } else {
        const ls = this.hierarchy.length;
        throw new Error(`Cannot reset tempo for meter with ${ls} layers`)
      }
      this.relCorpLims = this.propCorpLims.map(p => p * this.durTot);
    }
  }

  adjustTempo(newTempo: number) {
    const oldTempo = this.tempo;
    const ratio = oldTempo / newTempo;
    this.pulseStructures.forEach(psLayer => {
      psLayer.forEach((ps) => {
        const newSt = this.startTime + (ps.startTime - this.startTime) * ratio;
        ps.setStartTime(newSt);
        const psNewTempo = ps.tempo / ratio;
        ps.setTempo(psNewTempo);
      })
    })
    this.tempo = newTempo;
    this.limitPropCorporeality();
  }

  setStartTime(newStartTime: number) {
    const oldStartTime = this.startTime;
    const offset = newStartTime - oldStartTime;
    this.pulseStructures.forEach(psLayer => {
      psLayer.forEach(ps => {
        const newSt = ps.startTime + offset;
        ps.setStartTime(newSt);
      })
    })
    this.startTime = newStartTime;
    this.limitPropCorporeality();
  }

  adjustStartTime(offset: number) {
    if (this.startTime + offset < 0) {
      throw new Error('Cannot adjust start time to negative value')
    }
    this.setStartTime(this.startTime + offset);
  }

  limitRealTemporalCorporeality(startTime: number, endTime: number) {
    // all pulses whose `realTime` is less than `startTime` or greater than 
    // `endTime` are set to `corporeal: false`
    this.allPulses.forEach(p => {
      if (p.realTime < startTime || p.realTime > endTime) {
        p.corporeal = false;
      } else {
        p.corporeal = true;
      }
    });
    const relStartTime = startTime - this.startTime;
    const relEndTime = endTime - this.startTime;
    this.relCorpLims = [relStartTime, relEndTime];
    this.propCorpLims = this.relCorpLims.map(r => r / this.durTot);
  }

  limitRelTemporalCorporeality(relStartTime: number, relEndTime: number) {
    const startTime = this.startTime + relStartTime;
    const endTime = this.startTime + relEndTime;
    this.limitRealTemporalCorporeality(startTime, endTime);
  }

  limitPropCorporeality({
    propStartTime = undefined, 
    propEndTime = undefined
  }: {
    propStartTime?: number,
    propEndTime?: number
  } = {}) {
    if (propStartTime === undefined) {
      propStartTime = this.propCorpLims[0];
    }
    if (propEndTime === undefined) {
      propEndTime = this.propCorpLims[1];
    }
    if (approxEqual(1, propEndTime)) {
      propEndTime = 1;
    }
    if (propStartTime < 0 || propStartTime > 1) {
      throw new Error(`Invalid proportional start time: ${propStartTime}`)
    }
    if (propEndTime < 0 || propEndTime > 1) {
      throw new Error(`Invalid proportional end time: ${propEndTime}`)
    }
    if (propStartTime >= propEndTime) {
      throw new Error(`Proportional start time must be less than proportional` + 
      ` end time`)
    }
    const startTime = this.startTime + propStartTime * this.durTot;
    const endTime = this.startTime + propEndTime * this.durTot;
    this.limitRealTemporalCorporeality(startTime, endTime);

  }

  get durTot() {
    return this.cycleDur * this.repetitions;
  }
  
  get realTimes() {
    return this.allPulses.map(p => p.realTime)
  }

  get realCorpTimes() {
    return this.allCorporealPulses.map(p => p.realTime)
  }

  get cycleDur() {
    if (typeof this.hierarchy[0] === 'number') {
      return 60 * this.hierarchy[0] / this.tempo;
    } else {
      const summed = sum(this.hierarchy[0]);
      return 60 * summed / this.tempo;
    }
  }

  toJSON() {
    return {
      uniqueId: this.uniqueId,
      hierarchy: this.hierarchy,
      startTime: this.startTime,
      tempo: this.tempo,
      repetitions: this.repetitions,
      pulseStructures: this.pulseStructures.map(psLayer => {
        return psLayer.map(ps => ps.toJSON())
      })
    }
  }
}

const findClosestIdxs = (trials: number[], items: number[]) => {
  const usedIndexes = new Set();
  return trials.map(trial => {
    let diffs = items.map((item, index) => [Math.abs(trial - item), index]);
    diffs = diffs.filter((_, index) => !usedIndexes.has(index));
    diffs.sort((a, b) => a[0] - b[0]);
    usedIndexes.add(diffs[0][1]);
    return diffs[0][1];
  });
}

export { Meter, Pulse, PulseStructure, findClosestIdxs }


 
