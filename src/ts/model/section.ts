import { Phrase } from './phrase';
import { Pitch } from './pitch';
import { Trajectory } from './trajectory';
import { initSecCategorization } from './piece';
import { SecCatType,  } from '@shared/types';
import { TuningType } from '@shared/types';

class Section {
  phrases: Phrase[];
  categorization: SecCatType;
  adHocCategorization: string[];

  constructor({
    phrases = [],
    categorization = undefined,
    adHocCategorization = undefined
  }: {
    phrases?: Phrase[],
    categorization?: SecCatType,
    adHocCategorization?: string[]
  } = {}) {
    this.phrases = phrases;
    if (categorization !== undefined) {
      this.categorization = categorization;
    } else {
      this.categorization = initSecCategorization();
    }
    if (adHocCategorization !== undefined) {
      this.adHocCategorization = adHocCategorization;
    } else {
      this.adHocCategorization = [];
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

export { Section};
