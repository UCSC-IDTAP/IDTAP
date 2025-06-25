import { findLastIndex } from 'lodash'
import { getStarts, getEnds, closeTo } from '@/ts/utils'

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

  static fromJSON(obj: any): Automation {
    return new Automation(obj);
  }
}

export { Automation };
