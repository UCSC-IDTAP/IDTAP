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
      slideCount: this.slideCount
    };
  }
}


export {
  SitarPhraseAnalyzer
};
