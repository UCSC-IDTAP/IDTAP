import { instantiatePiece } from './analysis.ts';
import { 
  Piece, 
  Pitch, 
  Trajectory, 
} from '@/ts/model';

import { 
  CategoryType,
  DesignatorType,
  SegmentationType,
  QueryType,
  MultipleReturnType,
  QueryAnswerType,
  MultipleOptionType,
  SecCatType,
  PhraseCatType


} from '@shared/types.ts';



const findSequenceIndexes = (sequence: number[], longerSequence: number[]) => {
  const indexes: number[] = [];
  const startIndex = longerSequence.indexOf(sequence[0]);
  if (startIndex !== -1) {
    let match = true;
    for (let i = 1; i < sequence.length; i++) {
      if (longerSequence[startIndex + i] !== sequence[i]) {
        match = false;
        break;
      }
    }
    if (match) {
      indexes.push(startIndex);
    }
    for (let i = startIndex + 1; i < longerSequence.length; i++) {
      if (longerSequence[i] === sequence[0]) {
        let match = true;
        for (let j = 1; j < sequence.length; j++) {
          if (longerSequence[i + j] !== sequence[j]) {
            match = false;
            break;
          }
        }
        if (match) {
          indexes.push(i);
        }
      }
    }
  }
  return indexes;
}

const testLooseSequenceIndexes = (sequence: number[], longerSequence: number[]) => {
  let ct = 0;
  let out = false;
  let firstIdx: number | undefined = undefined;
  let lastIdx: number | undefined = undefined;
  for (let i = 0; i < longerSequence.length; i++) {
    const el = longerSequence[i];
    if (el === sequence[ct]) {
      if (ct === 0) {
        firstIdx = i;
      }
      ct++;
    }
    if (ct > sequence.length - 1) {
      out = true;
      lastIdx = i;
      break;
    }
  }
  return { truth: out, firstIdx: firstIdx, lastIdx: lastIdx };
};




class Query {
  trajectories: Trajectory[][] = [];
  phraseIdxs: number[] = [];
  instrumentIdx: number;
  identifier: (number | string | { phraseIdx: number, trajIdx: number })[] = [];
  stringifiedIdentifier: string[] = [];
  sequenceLength?: number;
  repetition: boolean;
  piece: Piece;
  consonant?: string;
  vowel?: string;
  trajectoryID?: number;
  pitch?: Pitch;
  designator: DesignatorType; 
  category: CategoryType;
  segmentation: SegmentationType;
  maxDur: number = 60;
  minDur: number = 0;
  startTimes: number[];
  pitchSequence?: Pitch[];
  trajIdSequence?: number[];
  sectionTopLevel?: SecCatType['Top Level'];
  alapSection?:  keyof SecCatType['Alap'];
  compType?: keyof SecCatType['Composition Type'];
  compSecTempo?: keyof SecCatType['Comp.-section/Tempo'];
  tala?: keyof SecCatType['Tala'];
  phraseType?: keyof PhraseCatType['Phrase'];
  elaborationType?: keyof PhraseCatType['Elaboration'];
  vocalArtType?: keyof PhraseCatType['Vocal Articulation'];
  instArtType?: keyof PhraseCatType['Instrumental Articulation'];
  incidental?: keyof PhraseCatType['Incidental'];

  private constructor(piece: Piece, {
    segmentation = 'phrase',
    designator = 'includes',
    category = 'trajectoryID',
    pitch = undefined,
    sequenceLength = undefined,
    trajectoryID = undefined,
    vowel = undefined,
    consonant = undefined,
    maxDur = 60,
    minDur = 0,
    pitchSequence = undefined,
    trajIdSequence = undefined,
    sectionTopLevel = undefined,
    alapSection = undefined,
    compType = undefined,
    compSecTempo = undefined,
    tala = undefined,
    phraseType = undefined,
    elaborationType = undefined,
    vocalArtType = undefined,
    instArtType = undefined,
    incidental = undefined,
    instrumentIdx = 0,
  }: {
    segmentation?: SegmentationType,
    designator?: DesignatorType,
    category?: CategoryType,
    pitch?: Pitch,
    sequenceLength?: number,
    trajectoryID?: number,
    vowel?: string,
    consonant?: string,
    maxDur?: number,
    minDur?: number,
    pitchSequence?: Pitch[],
    trajIdSequence?: number[],
    sectionTopLevel?: SecCatType['Top Level'],
    alapSection?:  keyof SecCatType['Alap'],
    compType?: keyof SecCatType['Composition Type'],
    compSecTempo?: keyof SecCatType['Comp.-section/Tempo'],
    tala?: keyof SecCatType['Tala'],
    phraseType?: keyof PhraseCatType['Phrase'],
    elaborationType?: keyof PhraseCatType['Elaboration'],
    vocalArtType?: keyof PhraseCatType['Vocal Articulation'],
    instArtType?: keyof PhraseCatType['Instrumental Articulation'],
    incidental?: keyof PhraseCatType['Incidental'],
    instrumentIdx?: number,

  } = {}) {
    this.category = category;
    this.designator = designator;
    this.trajectoryID = trajectoryID;
    this.consonant = consonant;
    this.pitch = pitch;
    this.vowel = vowel;
    this.piece = piece;
    this.identifier = [];
    this.trajectories = [];
    this.instrumentIdx = instrumentIdx;
    this.repetition = false;
    this.sequenceLength = sequenceLength;
    this.segmentation = segmentation;
    this.maxDur = maxDur;
    this.minDur = minDur;
    this.pitchSequence = pitchSequence;
    this.trajIdSequence = trajIdSequence;
    this.sectionTopLevel = sectionTopLevel;
    this.alapSection = alapSection;
    this.compType = compType;
    this.compSecTempo = compSecTempo;
    this.tala = tala;
    this.phraseType = phraseType;
    this.elaborationType = elaborationType;
    this.vocalArtType = vocalArtType;
    this.instArtType = instArtType;
    this.incidental = incidental;
    this.instrumentIdx = instrumentIdx;
    if (segmentation === 'sequenceOfTrajectories') {
      if (sequenceLength === undefined) {
        throw new Error('sequenceLength is required when type is ' + 
          'sequenceOfTrajectories');
      }
    }
    const c1 = category === 'startingConsonant';
    const c2 = category === 'endingConsonant';
    const c3 = category === 'anyConsonant';
    const consonantsCondition = c1 || c2 || c3;
    let sectionQuery = false;
    if (category === 'pitch') {
      if (pitch === undefined) {
        throw new Error('Pitch is required when category is pitch');
      }
    } else if (category === 'trajectoryID') {
      if (trajectoryID === undefined) {
        throw new Error('trajectoryID is required, category is trajectoryID');
      }
    } else if (category === 'vowel') {
      const inst = piece.instrumentation[this.instrumentIdx];
      if (!(inst === 'Vocal (F)' || inst === 'Vocal (M)')) {
        throw new Error('category vowel is only for vocal instruments');
      }
      if (vowel === undefined) {
        throw new Error('vowel is required when category is vowel');
      }
    } else if (consonantsCondition) {
      const inst = piece.instrumentation[this.instrumentIdx];
      if (!(inst === 'Vocal (F)' || inst === 'Vocal (M)')) {
        throw new Error('category consonant is only for vocal instruments');
      }
      if (consonant === undefined) {
        throw new Error('consonant is required when category is consonant');
      }
    } else if (
        category === 'pitchSequenceStrict' || 
        category === 'pitchSequenceLoose'
        ) {
      if (this.pitchSequence === undefined) {
        throw new Error('pitchSequence is required');
      }
    } else if (
        category === 'trajSequenceStrict' || 
        category === 'trajSequenceLoose'
        ) {
      if (this.trajIdSequence === undefined) {
        throw new Error('trajIdSequence is required');
      }
    } else if (category === 'sectionTopLevel') {
      if (this.sectionTopLevel === undefined) {
        throw new Error('sectionTopLevel is required');
      }
      sectionQuery = true;
    } else if (category === 'alapSection') {
      if (this.alapSection === undefined) {
        throw new Error('alapSection is required');
      }
      sectionQuery = true;
    } else if (category === 'compType') {
      if (this.compType === undefined) {
        throw new Error('compType is required');
      }
      sectionQuery = true;
    } else if (category === 'compSecTempo') {
      if (this.compSecTempo === undefined) {
        throw new Error('compSecTempo is required');
      }
      sectionQuery = true;
    } else if (category === 'tala') {
      if (this.tala === undefined) {
        throw new Error('tala is required');
      }
      sectionQuery = true;
    }
    if (sectionQuery) {
      if (this.designator === 'endsWith' || this.designator === 'startsWith') {
        const t = 'sectionTopLevel cannot be used with startsWith or endsWith';
        throw new Error(t);
      }
      if (this.segmentation === 'sequenceOfTrajectories') {
        throw new Error('sectionTopLevel cannot be used with segmentation ' +
          'sequenceOfTrajectories');
      } else if (this.segmentation === 'connectedSequenceOfTrajectories') {
        throw new Error('sectionTopLevel cannot be used with segmentation ' +
          'connectedSequenceOfTrajectories');
      }
    }
    this.allTypeFilters();
    this.filterByDuration();
    this.stringifiedIdentifier = this.identifier.map(id => JSON.stringify(id));
    this.startTimes = this.trajectories.map(traj => {
      const phrase = this.piece.phraseGrid[this.instrumentIdx][traj[0].phraseIdx!];
      return traj[0].startTime! + phrase.startTime!;
    });
  }

  private phraseFilter() {
    const phrases = this.piece.phraseGrid[this.instrumentIdx];
    const filteredPhrases = phrases.filter(phrase => {
      if (this.category === 'pitch') {
        const trialArr = phrase.allPitches(this.repetition)
          .map(pitch => pitch.numberedPitch);
        return this.pitchDiff(this.pitch!, trialArr);
      } else if (this.category === 'trajectoryID') {
        const trialArr = phrase.trajectories;
        return this.trajIDDiff(this.trajectoryID!, trialArr);
      } else if (this.category === 'vowel') {
        const trialArr = phrase.trajectories.map(traj => traj.vowel);
        return this.vowelDiff(this.vowel!, trialArr);
      } else if (this.category === 'startingConsonant') {
        const trialArr = phrase.trajectories.map(traj => traj.startConsonant);
        return this.consonantDiff(this.consonant!, trialArr);
      } else if (this.category === 'endingConsonant') {
        const trialArr = phrase.trajectories.map(traj => traj.endConsonant);
        return this.consonantDiff(this.consonant!, trialArr);
      } else if (this.category === 'anyConsonant') {
        const trialArr: (string | undefined)[] = [];
        phrase.trajectories.forEach(traj => {
          trialArr.push(traj.startConsonant);
          trialArr.push(traj.endConsonant);
        })
        return this.consonantDiff(this.consonant!, trialArr);
      } else if (this.category === 'pitchSequenceStrict') {
        const trialArr = phrase.allPitches(this.repetition)
          .map(pitch => pitch.numberedPitch);
        return this.pitchSeqStrictDiff(this.pitchSequence!, trialArr);
      } else if (this.category === 'pitchSequenceLoose') {
        const trialArr = phrase.allPitches(this.repetition)
          .map(pitch => pitch.numberedPitch);
        return this.pitchSeqLooseDiff(this.pitchSequence!, trialArr);
      } else if (this.category === 'trajSequenceStrict') {
        const trialArr = phrase.trajectories.map(traj => traj.id);
        return this.trajSeqStrictDiff(this.trajIdSequence!, trialArr);
      } else if (this.category === 'trajSequenceLoose') {
        const trialArr = phrase.trajectories.map(traj => traj.id);
        return this.trajSeqLooseDiff(this.trajIdSequence!, trialArr);
      } else if (this.category === 'sectionTopLevel') {
        const pIdx = phrase.pieceIdx!;
        return this.secTopLevelDiff(pIdx);
      } else if (this.category === 'alapSection') {
        const pIdx = phrase.pieceIdx!;
        return this.alapSectionDiff(pIdx);
      } else if (this.category === 'compType') {
        const pIdx = phrase.pieceIdx!;
        return this.compTypeDiff(pIdx);
      } else if (this.category === 'compSecTempo') {
        const pIdx = phrase.pieceIdx!;
        return this.compSecTempoDiff(pIdx);
      } else if (this.category === 'tala') {
        const pIdx = phrase.pieceIdx!;
        return this.talaDiff(pIdx);
      } else if (([
        'phraseType', 
        'elaborationType', 
        'vocalArtType', 
        'instArtType', 
        'incidental' 
      ]).includes(this.category)) {
        const pIdx = phrase.pieceIdx!;
        return this.phraseLabelDiff(pIdx);
      }
    });
    this.trajectories = filteredPhrases.map(phrase => phrase.trajectories);
    this.identifier = filteredPhrases.map(phrase => phrase.pieceIdx!);
  }

  private groupFilter() { //TODO
    const groups = this.piece.allGroups({ instrumentIdx: this.instrumentIdx });
    const filteredGroups = groups.filter(group => {
      let bool = false;
      if (this.category === 'pitch') {
        const trialArr = group.allPitches(this.repetition)
          .map(pitch => pitch.numberedPitch);
        bool = this.pitchDiff(this.pitch!, trialArr);
      } else if (this.category === 'trajectoryID') {
        const trialArr = group.trajectories;
        bool = this.trajIDDiff(this.trajectoryID!, trialArr);
      } else if (this.category === 'vowel') {
        const trialArr = group.trajectories.map(traj => traj.vowel);
        bool = this.vowelDiff(this.vowel!, trialArr);
      } else if (this.category === 'startingConsonant') {
        const trialArr = group.trajectories.map(traj => traj.startConsonant);
        bool = this.consonantDiff(this.consonant!, trialArr);
      } else if (this.category === 'endingConsonant') {
        const trialArr = group.trajectories.map(traj => traj.endConsonant);
        bool = this.consonantDiff(this.consonant!, trialArr);
      } else if (this.category === 'anyConsonant') {
        const trialArr: (string | undefined)[] = [];
        group.trajectories.forEach(traj => {
          trialArr.push(traj.startConsonant);
          trialArr.push(traj.endConsonant);
        })
        bool = this.consonantDiff(this.consonant!, trialArr);
      } else if (this.category === 'pitchSequenceStrict') {
        const trialArr = group.allPitches(this.repetition)
          .map(pitch => pitch.numberedPitch);
        bool = this.pitchSeqStrictDiff(this.pitchSequence!, trialArr);
      } else if (this.category === 'pitchSequenceLoose') {
        const trialArr = group.allPitches(this.repetition)
          .map(pitch => pitch.numberedPitch);
        bool = this.pitchSeqLooseDiff(this.pitchSequence!, trialArr);
      } else if (this.category === 'trajSequenceStrict') {
        const trialArr = group.trajectories.map(traj => traj.id);
        bool = this.trajSeqStrictDiff(this.trajIdSequence!, trialArr);
      } else if (this.category === 'trajSequenceLoose') {
        const trialArr = group.trajectories.map(traj => traj.id);
        bool = this.trajSeqLooseDiff(this.trajIdSequence!, trialArr);
      } else if (this.category === 'sectionTopLevel') {
        const pIdx = this.piece.pIdxFromGroup(group);
        bool = this.secTopLevelDiff(pIdx);
      } else if (this.category === 'alapSection') {
        const pIdx = this.piece.pIdxFromGroup(group);
        bool = this.alapSectionDiff(pIdx);
      } else if (this.category === 'compType') {
        const pIdx = this.piece.pIdxFromGroup(group);
        bool = this.compTypeDiff(pIdx);
      } else if (this.category === 'compSecTempo') {
        const pIdx = this.piece.pIdxFromGroup(group);
        bool = this.compSecTempoDiff(pIdx);
      } else if (this.category === 'tala') {
        const pIdx = this.piece.pIdxFromGroup(group);
        bool = this.talaDiff(pIdx);
      } else if (([
        'phraseType', 
        'elaborationType', 
        'vocalArtType', 
        'instArtType', 
        'incidental' 
      ]).includes(this.category)) {
        const pIdx = this.piece.pIdxFromGroup(group);
        return this.phraseLabelDiff(pIdx);
      }
      if (bool) {
        this.identifier.push(group.id);
      }
      return bool;
    });
    this.trajectories = filteredGroups.map(group => group.trajectories);
  }

  public get queryAnswers() {
    return this.trajectories.map((trajs, tIdx) => {
      const startPhrase = this.piece.phraseGrid[this.instrumentIdx][trajs[0].phraseIdx!];
      const startTime = trajs[0].startTime! + startPhrase.startTime!;
      const endPhrase = this.piece.phraseGrid[this.instrumentIdx][trajs[trajs.length - 1].phraseIdx!];
      const endTime = trajs[trajs.length - 1].endTime! + endPhrase.startTime!;
      const duration = endTime - startTime;
      let title: string = '';
      if (this.segmentation === 'phrase') {
        const pIdxStr = String(Number(startPhrase.pieceIdx!) + 1);
        title = 'Phrase ' + pIdxStr;
      } else if (this.segmentation === 'group') {
        const group = startPhrase.getGroupFromId(trajs[0].groupId!);
        if (group === undefined) throw new Error('group is undefined');
        const groupIdx = startPhrase.groupsGrid[0].indexOf(group);
        const pIdxStr = String(Number(startPhrase.pieceIdx!) + 1);
        title = `Phrase ${pIdxStr} Group ${groupIdx}`;
      } else if (this.segmentation === 'sequenceOfTrajectories') {
        const pIdxs = trajs.map(t => t.phraseIdx!);
        const phraseIdxs = [...new Set(pIdxs)];
        const firstTIdx = trajs[0].num! + 1;
        const lastTIdx = trajs[trajs.length - 1].num! + 1;
        if (phraseIdxs.length === 1) {
          const pIdxStr = String(Number(phraseIdxs[0]) + 1);
          title = `Phrase ${pIdxStr} Traj ${firstTIdx}-${lastTIdx}`;
        } else {
          const sPIdxStr = String(Number(phraseIdxs[0]) + 1);
          const lPIdxStr = String(Number(phraseIdxs[phraseIdxs.length - 1]) + 1);
          title = `Phrase ${sPIdxStr} Traj ${firstTIdx} - Phrase ` + 
            `${lPIdxStr} Traj ${lastTIdx} `
        }
      } else if (this.segmentation === 'connectedSequenceOfTrajectories') {
        const pIdxs = trajs.map(t => t.phraseIdx!);
        const phraseIdxs = [...new Set(pIdxs)];
        const firstTIdx = trajs[0].num! + 1;
        const lastTIdx = trajs[trajs.length - 1].num! + 1;
        if (phraseIdxs.length === 1) {
          const pIdxStr = String(Number(phraseIdxs[0]) + 1);
          title = `Phrase ${pIdxStr} Traj ${firstTIdx}-${lastTIdx}`;
        } else {
          const sPIdxStr = String(Number(phraseIdxs[0]) + 1);
          const lPIdxStr = String(Number(phraseIdxs[phraseIdxs.length - 1]) + 1);
          title = `Phrase ${sPIdxStr} Traj ${firstTIdx} - Phrase ` + 
            `${lPIdxStr} Traj ${lastTIdx} `
        }
      }
      return {
        title,
        startTime,
        endTime,
        duration,
        trajectories: trajs,
        identifier: this.identifier[tIdx],
        segmentation: this.segmentation,
      }
    })
  }

  private sequenceOfTrajectoriesFilter() {
    const allTrajs = this.piece.allTrajectories(this.instrumentIdx);
    for (let i = 0; i < allTrajs.length - this.sequenceLength! + 1; i++) {
      const trajSeq = allTrajs.slice(i, i + this.sequenceLength!);
      let boolean = false;
      if (this.category === 'pitch') {
        const pitches = trajSeq.map(traj => traj.pitches).flat();
        let nPitches = pitches.map(pitch => pitch.numberedPitch);
        if (!this.repetition) {
          let lastPitch: number | undefined = undefined;
          nPitches = nPitches.filter(pitch => {
            if (pitch === lastPitch) {
              return false;
            }
            lastPitch = pitch;
            return true;
          });
        }
        boolean = this.pitchDiff(this.pitch!, nPitches);
      } else if (this.category === 'trajectoryID') {
        boolean = this.trajIDDiff(this.trajectoryID!, trajSeq);
      } else if (this.category === 'vowel') {
        const vowels = trajSeq.map(traj => traj.vowel);
        boolean = this.vowelDiff(this.vowel!, vowels);
      } else if (this.category === 'startingConsonant') {
        const consonants = trajSeq.map(traj => traj.startConsonant);
        boolean = this.consonantDiff(this.consonant!, consonants);
      } else if (this.category === 'endingConsonant') {
        const consonants = trajSeq.map(traj => traj.endConsonant);
        boolean = this.consonantDiff(this.consonant!, consonants);
      } else if (this.category === 'anyConsonant') {
        const consonants: (string | undefined)[] = [];
        trajSeq.forEach(traj => {
          consonants.push(traj.startConsonant);
          consonants.push(traj.endConsonant);
        })
        boolean = this.consonantDiff(this.consonant!, consonants);
      } else if (this.category === 'pitchSequenceStrict') {
        const pitches = trajSeq.map(traj => traj.pitches).flat();
        let nPitches = pitches.map(pitch => pitch.numberedPitch);
        if (!this.repetition) {
          let lastPitch: number | undefined = undefined;
          nPitches = nPitches.filter(pitch => {
            if (pitch === lastPitch) {
              return false;
            }
            lastPitch = pitch;
            return true;
          });
        }
        boolean = this.pitchSeqStrictDiff(this.pitchSequence!, nPitches);
      } else if (this.category === 'pitchSequenceLoose') {
        const pitches = trajSeq.map(traj => traj.pitches).flat();
        let nPitches = pitches.map(pitch => pitch.numberedPitch);
        if (!this.repetition) {
          let lastPitch: number | undefined = undefined;
          nPitches = nPitches.filter(pitch => {
            if (pitch === lastPitch) {
              return false;
            }
            lastPitch = pitch;
            return true;
          });
        }
        boolean = this.pitchSeqLooseDiff(this.pitchSequence!, nPitches);
      } else if (this.category === 'trajSequenceStrict') {
        const trajIDs = trajSeq.map(traj => traj.id);
        boolean = this.trajSeqStrictDiff(this.trajIdSequence!, trajIDs);
      } else if (this.category === 'trajSequenceLoose') {
        const trajIDs = trajSeq.map(traj => traj.id);
        boolean = this.trajSeqLooseDiff(this.trajIdSequence!, trajIDs);
      } else if (this.category === 'sectionTopLevel') {
        throw new Error('sectionTopLevel cannot be used with segmentation ' +
          'sequenceOfTrajectories');
      }
      if (boolean) {
        this.trajectories.push(trajSeq);
        const idObj = {
          phraseIdx: trajSeq[0].phraseIdx!,
          trajIdx: trajSeq[0].num!
        }
        this.identifier.push(idObj);
      }
    }
  }

  private connectedSequenceOfTrajectoriesFilter() {
    const allTrajs = this.piece.allTrajectories(this.instrumentIdx);
    const splitTrajs = this.splitTrajsBySilences(allTrajs);
    splitTrajs.forEach(trajSeq => {
      let boolean = false;
      if (this.category === 'pitch') {
        let nPitches = trajSeq.map(traj => traj.pitches).flat()
          .map(pitch => pitch.numberedPitch);
        if (!this.repetition) {
          let lastPitch: number | undefined = undefined;
          nPitches = nPitches.filter(pitch => {
            if (pitch === lastPitch) {
              return false;
            }
            lastPitch = pitch;
            return true;
          });
        }
        boolean = this.pitchDiff(this.pitch!, nPitches);
      } else if (this.category === 'trajectoryID') {
        boolean = this.trajIDDiff(this.trajectoryID!, trajSeq);
      } else if (this.category === 'vowel') {
        const vowels = trajSeq.map(traj => traj.vowel);
        boolean = this.vowelDiff(this.vowel!, vowels);
      } else if (this.category === 'startingConsonant') {
        const consonants = trajSeq.map(traj => traj.startConsonant);
        boolean = this.consonantDiff(this.consonant!, consonants);
      } else if (this.category === 'endingConsonant') {
        const consonants = trajSeq.map(traj => traj.endConsonant);
        boolean = this.consonantDiff(this.consonant!, consonants);
      } else if (this.category === 'anyConsonant') {
        const consonants: (string | undefined)[] = [];
        trajSeq.forEach(traj => {
          consonants.push(traj.startConsonant);
          consonants.push(traj.endConsonant);
        })
        boolean = this.consonantDiff(this.consonant!, consonants);
      } else if (this.category === 'pitchSequenceStrict') {
        let nPitches = trajSeq.map(traj => traj.pitches).flat()
          .map(pitch => pitch.numberedPitch);
        if (!this.repetition) {
          let lastPitch: number | undefined = undefined;
          nPitches = nPitches.filter(pitch => {
            if (pitch === lastPitch) {
              return false;
            }
            lastPitch = pitch;
            return true;
          });
        }
        boolean = this.pitchSeqStrictDiff(this.pitchSequence!, nPitches);
      } else if (this.category === 'pitchSequenceLoose') {
        let nPitches = trajSeq.map(traj => traj.pitches).flat()
          .map(pitch => pitch.numberedPitch);
        if (!this.repetition) {
          let lastPitch: number | undefined = undefined;
          nPitches = nPitches.filter(pitch => {
            if (pitch === lastPitch) {
              return false;
            }
            lastPitch = pitch;
            return true;
          });
        }
        boolean = this.pitchSeqLooseDiff(this.pitchSequence!, nPitches);
      } else if (this.category === 'trajSequenceStrict') {
        const trajIDs = trajSeq.map(traj => traj.id);
        boolean = this.trajSeqStrictDiff(this.trajIdSequence!, trajIDs);
      } else if (this.category === 'trajSequenceLoose') {
        const trajIDs = trajSeq.map(traj => traj.id);
        boolean = this.trajSeqLooseDiff(this.trajIdSequence!, trajIDs);
        if (boolean) {
          this.trajectories.push(trajSeq);
          const idObj = {
            phraseIdx: trajSeq[0].phraseIdx!,
            trajIdx: trajSeq[0].num!
          }
          this.identifier.push(idObj);
        }
      }
    })
  }

  private allTypeFilters() {
    if (this.segmentation === 'phrase') {
      this.phraseFilter();
    } else if (this.segmentation === 'group') {
      this.groupFilter();
    } else if (this.segmentation === 'sequenceOfTrajectories') {
      this.sequenceOfTrajectoriesFilter();
    } else if (this.segmentation === 'connectedSequenceOfTrajectories') {
      this.connectedSequenceOfTrajectoriesFilter();
    }
  }

  private splitTrajsBySilences(trajectories: Trajectory[]) {
    return trajectories.reduce((acc, traj) => {
      if (traj.id === 12) {
        acc.push([]);
      } else {
        acc[acc.length - 1].push(traj);
      }
      return acc;
    }, [[]] as Trajectory[][]).filter(trajSeq => trajSeq.length > 0);
  }

  private pitchDiff(pitch: Pitch, nPitches: number[]) {
    let boolean: boolean = false;
    if (this.designator === 'includes') {
      boolean = nPitches.includes(pitch.numberedPitch);
    } else if (this.designator === 'excludes') {
      boolean = !nPitches.includes(pitch.numberedPitch);
    } else if (this.designator === 'startsWith') {
      boolean = nPitches[0] === pitch.numberedPitch;
    } else if (this.designator === 'endsWith') {
      boolean = nPitches[nPitches.length - 1] === pitch.numberedPitch;
    }
    return boolean;
  }

  private pitchSeqStrictDiff(pitchSeq: Pitch[], nPitches: number[]) {
    let boolean: boolean = false;
    const numPitchSeq = pitchSeq.map(pitch => pitch.numberedPitch);
    if (this.designator === 'includes') {
      boolean = findSequenceIndexes(numPitchSeq, nPitches).length > 0;
    } else if (this.designator === 'excludes') {
      boolean = findSequenceIndexes(numPitchSeq, nPitches).length === 0;
    } else if (this.designator === 'startsWith') {
      boolean = numPitchSeq.every((pitch, idx) => pitch === nPitches[idx]);
    } else if (this.designator === 'endsWith') {
      const startIdx = nPitches.length - numPitchSeq.length;
      boolean = numPitchSeq.every((p, i) => p === nPitches[startIdx + i]);
    }
    return boolean;
  }

  private pitchSeqLooseDiff(pitchSeq: Pitch[], nPitches: number[]) {
    let boolean: boolean = false;
    const numPitchSeq = pitchSeq.map(pitch => pitch.numberedPitch);
    if (this.designator === 'includes') {
      const looseObj = testLooseSequenceIndexes(numPitchSeq, nPitches);
      boolean = looseObj.truth;
    } else if (this.designator === 'excludes') {
      const looseObj = testLooseSequenceIndexes(numPitchSeq, nPitches);
      boolean = !looseObj.truth;
    } else if (this.designator === 'startsWith') {
      const looseObj = testLooseSequenceIndexes(numPitchSeq, nPitches);
      boolean = looseObj.truth && looseObj.firstIdx === 0;
    } else if (this.designator === 'endsWith') {
      const looseObj = testLooseSequenceIndexes(numPitchSeq, nPitches);
      boolean = looseObj.truth && looseObj.lastIdx === nPitches.length - 1;
    }
    return boolean;
  }

  private trajSeqStrictDiff(trajIdSeq: number[], fullTrajList: number[]) {
    let boolean: boolean = false;
    if (this.designator === 'includes') {
      boolean = findSequenceIndexes(trajIdSeq, fullTrajList).length > 0;
    } else if (this.designator === 'excludes') {
      boolean = findSequenceIndexes(trajIdSeq, fullTrajList).length === 0;
    } else if (this.designator === 'startsWith') {
      boolean = findSequenceIndexes(trajIdSeq, fullTrajList)[0] === 0;
    } else if (this.designator === 'endsWith') {
      const startIdx = fullTrajList.length - trajIdSeq.length;
      boolean = findSequenceIndexes(trajIdSeq, fullTrajList)[0] === startIdx;
    }
    return boolean;
  }

  private trajSeqLooseDiff(trajIdSeq: number[], fullTrajList: number[]) {
    let boolean: boolean = false;
    if (this.designator === 'includes') {
      const looseObj = testLooseSequenceIndexes(trajIdSeq, fullTrajList);
      boolean = looseObj.truth;
    } else if (this.designator === 'excludes') {
      const looseObj = testLooseSequenceIndexes(trajIdSeq, fullTrajList);
      boolean = !looseObj.truth;
    } else if (this.designator === 'startsWith') {
      const looseObj = testLooseSequenceIndexes(trajIdSeq, fullTrajList);
      boolean = looseObj.truth && looseObj.firstIdx === 0;
    } else if (this.designator === 'endsWith') {
      const looseObj = testLooseSequenceIndexes(trajIdSeq, fullTrajList);
      boolean = looseObj.truth && looseObj.lastIdx === fullTrajList.length - 1;
    }
    return boolean;
  }

  /**
    * Diffs a trajectory ID based on a given designator.
    * 
    * @param {number} trajID - The trajectory ID to Diff.
    * @param {string} designator - The designator to use for differentiation. 
*               It can be 'includes', 'excludes', 'startsWith', or 'endsWith'.
    * @param {Trajectory[]} trajectories - The array of trajectories to check 
    * against.
    * 
    * @returns {boolean} - Returns true if the trajectory ID matches the 
    * condition specified by the designator, false otherwise.
    */
  private trajIDDiff(trajID: number, trajectories: Trajectory[]) {
    let boolean: boolean = false;
    if (this.designator === 'includes') {
      boolean = trajectories.some(traj => traj.id === trajID);
    } else if (this.designator === 'excludes') {
      boolean = !trajectories.some(traj => traj.id === trajID);
    } else if (this.designator === 'startsWith') {
      boolean = trajectories[0].id === trajID;
    } else if (this.designator === 'endsWith') {
      boolean = trajectories[trajectories.length - 1].id === trajID;
    }
    return boolean;
  }

  private vowelDiff(vowel: string, vowels: (string | undefined)[]) {
    let boolean: boolean = false;
    if (this.designator === 'includes') {
      boolean = vowels.includes(vowel);
    } else if (this.designator === 'excludes') {
      boolean = !vowels.includes(vowel);
    } else if (this.designator === 'startsWith') {
      boolean = vowels[0] === vowel;
    } else if (this.designator === 'endsWith') {
      boolean = vowels[vowels.length - 1] === vowel;
    }
    return boolean;
  }

  private consonantDiff(consonant: string, 
            consonants: (string | undefined)[]) {
    let boolean: boolean = false;
    if (this.designator === 'includes') {
      boolean = consonants.includes(consonant);
    } else if (this.designator === 'excludes') {
      boolean = !consonants.includes(consonant);
    } else if (this.designator === 'startsWith') {
      boolean = consonants[0] === consonant;
    }
    return boolean;
  }

  private secTopLevelDiff(pIdx: number) {
    let boolean: boolean = false;
    const sIdx = this.piece.sIdxFromPIdx(pIdx, this.instrumentIdx);
    const section = this.piece.sections![sIdx];
    if (this.designator === 'includes') {
      boolean = section.categorization['Top Level'] === this.sectionTopLevel;
    } else if (this.designator === 'excludes') {
      boolean = section.categorization['Top Level'] !== this.sectionTopLevel;
    }
    return boolean;
  }

  private alapSectionDiff(pIdx: number) {
    let boolean: boolean = false;
    const sIdx = this.piece.sIdxFromPIdx(pIdx);
    const section = this.piece.sections![sIdx];
    if (this.designator === 'includes') {
      boolean = section.categorization['Alap'][this.alapSection!]
    } else if (this.designator === 'excludes') {
      boolean = !section.categorization['Alap'][this.alapSection!]
    }
    return boolean;
  }

  private compTypeDiff(pIdx: number) {
    let boolean: boolean = false;
    const sIdx = this.piece.sIdxFromPIdx(pIdx);
    const section = this.piece.sections![sIdx];
    if (this.designator === 'includes') {
      boolean = section.categorization['Composition Type'][this.compType!];
    } else if (this.designator === 'excludes') {
      boolean = !section.categorization['Composition Type'][this.compType!];
    }
    return boolean;
  }

  private compSecTempoDiff(pIdx: number) {
    let boolean: boolean = false;
    const sIdx = this.piece.sIdxFromPIdx(pIdx);
    const section = this.piece.sections![sIdx];
    const compSecTempoObj = section.categorization['Comp.-section/Tempo'];
    if (this.designator === 'includes') {
      boolean = compSecTempoObj[this.compSecTempo!];
    } else if (this.designator === 'excludes') {
      boolean = !compSecTempoObj[this.compSecTempo!];
    }
    return boolean;
  }

  private talaDiff(pIdx: number) {
    let boolean: boolean = false;
    const sIdx = this.piece.sIdxFromPIdx(pIdx);
    const section = this.piece.sections![sIdx];
    const talaObj = section.categorization['Tala'];
    if (this.designator === 'includes') {
      boolean = talaObj[this.tala!];
    } else if (this.designator === 'excludes') {
      boolean = !talaObj[this.tala!];
    }
    return boolean;
  }

  private phraseLabelDiff(pIdx: number) {
    let boolean: boolean = false;
    const phrase = this.piece.phrases[pIdx];
    const cat = phrase.categorizationGrid[0];
    if (this.category === 'phraseType') {
      boolean = cat['Phrase'][this.phraseType!];
    } else if (this.category === 'elaborationType') {
      boolean = cat['Elaboration'][this.elaborationType!];
    } else if (this.category === 'vocalArtType') {
      boolean = cat['Vocal Articulation'][this.vocalArtType!];
    } else if (this.category === 'instArtType') {
      boolean = cat['Instrumental Articulation'][this.instArtType!];
    } else if (this.category === 'incidental') {
      boolean = cat['Incidental'][this.incidental!];
    }
    if (this.designator === 'excludes') {
      boolean = !boolean;
    }
    return boolean;
  }

  private filterByDuration() {
    const removeIdxs = [] as number[];
    this.trajectories.map((trajSeq, tIdx) => {
      const firstPhrase = this.piece.phrases[trajSeq[0].phraseIdx!];
      const start = trajSeq[0].startTime! + firstPhrase.startTime!;
      const lastPIdx = trajSeq[trajSeq.length - 1].phraseIdx!;
      const lastPhrase = this.piece.phrases[lastPIdx];
      const end = trajSeq[trajSeq.length - 1].endTime! + lastPhrase.startTime!;
      if (end - start > this.maxDur) {
        removeIdxs.push(tIdx);
      }
      if (end - start < this.minDur) {
        removeIdxs.push(tIdx);
      }
    });
    this.trajectories = this.trajectories.filter((_, tIdx) => {
      return !removeIdxs.includes(tIdx)
    });
    this.identifier = this.identifier.filter((_, tIdx) => {
      return !removeIdxs.includes(tIdx)
    });

  }

  public static async single({
    transcriptionID = '63445d13dc8b9023a09747a6',
    segmentation = 'phrase',
    designator = 'includes',
    category = 'trajectoryID',
    pitch = undefined,
    sequenceLength = undefined,
    trajectoryID = undefined,
    vowel = undefined,
    consonant = undefined,
    instrumentIdx = 0,
  }: {
    segmentation?: SegmentationType,
    transcriptionID?: string,
    designator?: DesignatorType,
    category?: CategoryType,
    pitch?: Pitch,
    sequenceLength?: number,
    trajectoryID?: number,
    vowel?: string,
    consonant?: string,
    instrumentIdx?: number,
  } = {}) {
    const piece = await instantiatePiece(transcriptionID);
    const queryObj = { 
      segmentation, 
      designator, 
      category, 
      pitch, 
      sequenceLength,
      trajectoryID,
      vowel,
      consonant,
      instrumentIdx,
    };
    return new Query(piece, queryObj);
  }

  public static async multiple(queries: QueryType[] = [], {
    transcriptionID = '63445d13dc8b9023a09747a6',
    piece = undefined,
    segmentation = 'phrase',
    sequenceLength = undefined,
    minDur = 0,
    maxDur = 60,
    every = true, // if false, then any (in other words, all vs. any)
    instrumentIdx = 0,
  }: MultipleOptionType = {}): Promise<MultipleReturnType> {
    if (queries.length === 0) {
      throw new Error('No queries provided');
    }
    let outputTrajectories: Trajectory[][] = [];
    let outputIdentifiers: string[] = [];
    let queryAnswers: QueryAnswerType[] = [];
    let nonStringifiedOutputIdentifiers: (
      number | string | { phraseIdx: number, trajIdx: number }
      )[] = [];
    try {
      if (piece === undefined) {
        piece = await instantiatePiece(transcriptionID);
      }
      const queryObjs = queries.map(query => {
        return { 
          segmentation, 
          designator: query.designator, 
          category: query.category, 
          pitch: query.pitch, 
          sequenceLength: sequenceLength,
          trajectoryID: query.trajectoryID,
          vowel: query.vowel,
          consonant: query.consonant,
          pitchSequence: query.pitchSequence,
          trajIdSequence: query.trajIdSequence,
          sectionTopLevel: query.sectionTopLevel,
          alapSection: query.alapSection,
          compType: query.compType,
          compSecTempo: query.compSecTempo,
          tala: query.tala,
          phraseType: query.phraseType,
          elaborationType: query.elaborationType,
          vocalArtType: query.vocalArtType,
          instArtType: query.instArtType,
          incidental: query.incidental,
          minDur,
          maxDur,
          instrumentIdx,
        };
      });
      const answers = queryObjs.map((queryObj: QueryType ) => {
        return new Query(piece!, queryObj)
      });
      if (every) { // only selects trajectories that are in all answers
        outputIdentifiers = answers.reduce((acc, answer) => {
          const ids = answer.stringifiedIdentifier.filter(id => {
            return acc.includes(id)
          });
          return ids.length > 0 ? ids : [];
        }, answers[0].stringifiedIdentifier);
        const idxs = outputIdentifiers.map(id => {
          return answers[0].stringifiedIdentifier.indexOf(id);
        });
        outputTrajectories = idxs.map(idx => answers[0].trajectories[idx]);
        nonStringifiedOutputIdentifiers = idxs.map(idx => { 
          return answers[0].identifier[idx]
        });
        queryAnswers = idxs.map(idx => answers[0].queryAnswers[idx]);
      } else { // selects trajectories that are in any answer
        const startTimes = [] as number[];
        answers.forEach(answer => {
          answer.stringifiedIdentifier.forEach((sID,  sIDidx) => {
            if (!outputIdentifiers.includes(sID)) {
              outputIdentifiers.push(sID);
              outputTrajectories.push(answer.trajectories[sIDidx]);
              nonStringifiedOutputIdentifiers.push(answer.identifier[sIDidx]);
              queryAnswers.push(answer.queryAnswers[sIDidx]);
              startTimes.push(answer.startTimes[sIDidx]);
            }
          })
        })
        const sortIdxs = Array.from({length: startTimes.length}, (_, i) => i);
        sortIdxs.sort((a, b) => startTimes[a] - startTimes[b]);
        outputTrajectories = sortIdxs.map(idx => outputTrajectories[idx]);
        nonStringifiedOutputIdentifiers = sortIdxs.map(idx => {
          return nonStringifiedOutputIdentifiers[idx]
        });
        queryAnswers = sortIdxs.map(idx => queryAnswers[idx]);
      }   
    } catch (err: any) {
      throw new Error(err);
    }
    return [outputTrajectories, nonStringifiedOutputIdentifiers, queryAnswers];
  }
}

export { Query }
