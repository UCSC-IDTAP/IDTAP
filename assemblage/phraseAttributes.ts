import { Phrase, Pitch } from './../src/js/classes';

import { Instrument } from '@shared/enums';
import { Temporality } from '@shared/types';
import { nPVI, nCVI } from './rhythmicAnalysis';
import { Morph } from 'morphological-metrics';

interface BasePhraseAttributes {
	instrument: Instrument;
	temporality: Temporality;
	noteDensity: number; // by this we mean an instantated or re-instantiated swara, or a change to a different swara
	notePresenceRatio: number;
}

interface SitarPhraseAttributes extends BasePhraseAttributes {
	pluckCount: number;
	pluckTemporalDensity: number;
	pluckNPVI: number;
	pluckNCVI: number;
	chikariCount: number;
	chikariTemporalDensity: number;
	chikariNPVI: number;
	chikariNCVI: number;
	krintinCount: number;
	slideCount: number;
  directionInterval: (-1 | 0 | 1)[];
  linearContourVector: [number, number, number];
  combinatorialContourVector: [number, number, number];
  morph: number[];
  pitchCounts: Record<number, number>;
  transitionMatrix1: { states: number[][]; matrix: number[][] };
  transitionMatrix2: { states: number[][]; matrix: number[][] };
}


class SitarPhraseAnalyzer {
	phrase: Phrase;
	instrument: Instrument;
	temporality: Temporality;

	constructor(phrase: Phrase, instrument: Instrument, temporality: Temporality) {
		if (instrument !== Instrument.Sitar) {
			throw new Error('SitarPhraseAnalyzer can only be used with Sitar instrument');
		}
		this.phrase = phrase;
		this.instrument = instrument;
		this.temporality = temporality;
	}

  get allPitches(): Pitch[] {
    const pitches: Pitch[] = [];
     let init = true;
    this.phrase.trajectories.forEach((t, tIdx) => {
      if (t.id === 12) {
        init = true;
        return;
      }
      if (init) {
        t.pitches.forEach((p, pIdx) => {
          if (pIdx === 0) {
            pitches.push(p);
          } else {
            if (!p.sameAs(pitches.at(-1)!)) {
              pitches.push(p);
            }
          }
        })
        init = false;
      } else {
        t.pitches.forEach((p, pIdx) => {
          if (pIdx === 0) {
            if (p.sameAs(pitches.at(-1)!)) {
              if (t.articulations['0.00'] && t.articulations['0.00'].name === 'pluck') {
                pitches.push(p);
              }
            }
          } else {
            if (!p.sameAs(pitches.at(-1)!)) {
              pitches.push(p);
            }
          }
        })
      }
    })
    return pitches;
  } 

  get allNotes(): number[] {
    return this.allPitches.map(p => p.numberedPitch);
  }

  get morph(): Morph {
    return new Morph(this.allNotes);
  }

  get noteDensity(): number {
    return this.allPitches.length / this.temporality.duration;
  }

  get notePresenceRatio(): number {
    let pitchDur = 0;
    this.phrase.trajectories.forEach(t => {
      if (t.id !== 12) {
        pitchDur += t.durTot;
      }
    })
    return pitchDur / this.temporality.duration;
  }

	get pluckCount(): number {
		return this.phrase.trajectories.filter(t => {
			return t.articulations['0.00'] && t.articulations['0.00'].name === 'pluck'
		}).length;
	}

	get pluckTimes(): number[] {
		// with respect to the phrase, not real time in a recording
 		return this.phrase.trajectories.filter(t => {
			return t.articulations['0.00'] && t.articulations['0.00'].name === 'pluck'
		}).map(t => t.startTime!);
	}

  get pluckDurations(): number[] {
    return this.pluckTimes.map((t, i) => {
      if (i === 0) {
        return 0;
      }
      return t - this.pluckTimes[i - 1];
    });
  }

	get pluckTemporalDensity(): number {
		if (this.pluckCount === 0) {
			return 0;
		}
		return this.temporality.duration / this.pluckCount;
	}

	get pluckNPVI(): number {
		return nPVI(this.pluckDurations);
	}

  get pluckNCVI(): number {
    return nCVI(this.pluckDurations);
  }

  get chikariCount(): number {
    return this.chikariTimes.length;
  }

  get chikariTimes(): number[] {
    // console.log(this.phrase.chikaris);
    return Object.keys(this.phrase.chikaris).map(k => Number(k));
  }

  get chikariDurations(): number[] {
    return this.chikariTimes.map((t, i) => {
      if (i === 0) {
        return 0;
      }
      return t - this.chikariTimes[i - 1];
    });
  }

  get chikariTemporalDensity(): number {
    if (this.chikariCount === 0) {
      return 0;
    }
    return this.temporality.duration / this.chikariCount;
  }

  get chikariNPVI(): number {
    return nPVI(this.chikariDurations);
  }

  get chikariNCVI(): number {
    return nCVI(this.chikariDurations);
  }

  get krintinTimes(): number[] {
    const times: number[] = [];
    this.phrase.trajectories.forEach(t => {
      const keys = Object.keys(t.articulations);
      keys.forEach(k => {
        if (t.articulations[k].name === 'hammer-off' || t.articulations[k].name === 'hammer-on') {
          times.push(t.startTime! + Number(k));
        }
      })
    })
    return times;
  }

  get krintinCount(): number {
    return this.krintinTimes.length;
  }

  get slideTimes(): number[] {
    const times: number[] = [];
    this.phrase.trajectories.forEach(t => {
      const keys = Object.keys(t.articulations);
      keys.forEach(k => {
        if (t.articulations[k].name === 'slide') {
          times.push(t.startTime! + Number(k));
        }
      })
    })
    return times;
  }

  get slideCount(): number {
    return this.slideTimes.length;
  }

  get pitchCounts(): Record<number, number> {
    const counts: Record<number, number> = {};
    this.allNotes.forEach(note => {
      if (counts[note]) {
        counts[note]++;
      } else {
        counts[note] = 1;
      }
    });
    return counts;
  }

  // ngrams<T>(data: T[], n: number): T[][] {
  //   const out: T[][] = [];
  //   for (let i = 0; i <= data.length - n; i++) {
  //     out.push(data.slice(i, i + n));
  //   }
  //   return out;
  // }

  markovCounts<T>(data: T[], order: number = 1): { states: T[][]; matrix: number[][] } {
    // generate n-grams of length `order`
    const ngrams: T[][] = [];
    for (let i = 0; i <= data.length - order; i++) {
      ngrams.push(data.slice(i, i + order));
    }
    // collect unique states in order of first appearance
    const stateMap = new Map<string, T[]>();
    ngrams.forEach(ng => {
      const key = JSON.stringify(ng);
      if (!stateMap.has(key)) {
        stateMap.set(key, ng);
      }
    });
    const states = Array.from(stateMap.values());
    // map each state to its index
    const index = new Map<string, number>();
    states.forEach((s, i) => index.set(JSON.stringify(s), i));
    // initialize transition matrix
    const N = states.length;
    const matrix: number[][] = Array.from({ length: N }, () => Array(N).fill(0));
    // count transitions between consecutive n-grams
    for (let i = 0; i < ngrams.length - 1; i++) {
      const fromKey = JSON.stringify(ngrams[i]);
      const toKey = JSON.stringify(ngrams[i + 1]);
      const fromIdx = index.get(fromKey)!;
      const toIdx = index.get(toKey)!;
      matrix[fromIdx][toIdx]++;
    }
    return { states, matrix };
  }

  get statistics(): SitarPhraseAttributes {
    return {
      instrument: this.instrument,
      temporality: this.temporality,
      noteDensity: this.noteDensity,
      notePresenceRatio: this.notePresenceRatio,
      pluckCount: this.pluckCount,
      pluckTemporalDensity: this.pluckTemporalDensity,
      pluckNPVI: this.pluckNPVI,
      pluckNCVI: this.pluckNCVI,
      chikariCount: this.chikariCount,
      chikariTemporalDensity: this.chikariTemporalDensity,
      chikariNPVI: this.chikariNPVI,
      chikariNCVI: this.chikariNCVI,
      krintinCount: this.krintinCount,
      slideCount: this.slideCount,
      directionInterval: this.morph.directionInterval,
      linearContourVector: this.morph.linearContourVector,
      combinatorialContourVector: this.morph.combinatorialContourVector,
      morph: this.morph.data,
      pitchCounts: this.pitchCounts,
      transitionMatrix1: this.markovCounts(this.allNotes, 1),
      transitionMatrix2: this.markovCounts(this.allNotes, 2),
    };
  }
}


export {
  SitarPhraseAnalyzer
};

