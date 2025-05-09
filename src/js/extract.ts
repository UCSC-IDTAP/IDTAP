import { 
  instantiatePiece,
  condensedDurations,
} from './analysis.ts';
import {
	Piece,
  Pitch,
  Phrase,
  Trajectory,
} from './classes.ts'
import { writeFileSync } from 'fs';
import {
  Instrument,
} from './../ts/enums.ts';


class Extractor {
  piece: Piece;

  private constructor(piece: Piece) {
      this.piece = piece;
  }

  static async create(id: string): Promise<Extractor> {
      try {
          const piece = await instantiatePiece(id);
          return new Extractor(piece);
      } catch (error) {
          console.error('Error instantiating piece:', error);
          throw error;
      }
  }

  chroma() {
    const pitches = this.piece.allPitches() as [Pitch]
    return pitches.map(p => p.chroma)
  }

  writeChromaToFile(filename: string) {
    const chromaData = this.chroma();
    writeFileSync(filename, JSON.stringify(chromaData), 'utf-8');
  }

  writeChromaDurationsToFile(filename: string) {
    const trajs = this.piece.allTrajectories();
    const cd_obj_array = condensedDurations(trajs, { 
      outputType: 'chroma',
      maxSilence: 1 
    })
    const tuplets = cd_obj_array.map((cd_obj) => {
      return [cd_obj.pitch, cd_obj.dur]
    })
    writeFileSync(filename, JSON.stringify(tuplets), 'utf-8');
  }

  writeAlapChromaDurationsToFile(filename: string) {
    const alapSections = e.piece.sections.filter(section => {
      return section.categorization.Alap.Alap
    })
    const allTrajs = alapSections.flatMap(s => s.trajectories)

    const cd_obj_array = condensedDurations(allTrajs, { 
      outputType: 'chroma',
      maxSilence: 1 
    })
    const tuplets = cd_obj_array.map((cd_obj) => {
      return [cd_obj.pitch, cd_obj.dur]
    })
    writeFileSync(filename, JSON.stringify(tuplets), 'utf-8');
  }

  writeNonMohraSectionsToFile(filename: string) {
    const alapSections = e.piece.sections.filter(section => {
      return section.categorization.Alap.Alap
    });
    const alapPhrases = alapSections.flatMap(section => section.phrases);
    // console.log(alapPhrases[0].categorizationGrid)
    const mohraBoolArray = alapPhrases.map(p => p.categorizationGrid[0].Phrase.Mohra);
    const mohraIdxs = mohraBoolArray.map((isMohra, idx) => isMohra ? idx : -1).filter(idx => idx !== -1);
    const phrase_groups: Phrase[][] = [];
    let current_group: Phrase[] = [];
    for (let i = 0; i < alapPhrases.length; i++) {
      const phrase = alapPhrases[i];
      if (mohraBoolArray[i]) {
        if (current_group.length > 0) {
          phrase_groups.push(current_group);
          current_group = [];
        }
      } else {
        current_group.push(phrase);
      }
    }
    if (current_group.length > 0) {
      phrase_groups.push(current_group);
    }
    let objects: {
      index: number, 
      start: number, 
      end: number,
      tuplets: number[][]
    }[] = []
    phrase_groups.map((group, idx) => {
      const trajs = group.flatMap(phrase => phrase.trajectories);
      const cd_obj_array = condensedDurations(trajs, { 
        outputType: 'chroma',
        maxSilence: 1 
      })
      const tuplets = cd_obj_array.map((cd_obj) => {
        const pitch = cd_obj.pitch as number;
        return [pitch, cd_obj.dur]
      })
      // return tuplets;
      const end = group[group.length - 1].startTime! + group[group.length - 1].durTot!;
      objects.push({
        index: idx,
        start: group[0].startTime!,
        end: end,
        tuplets: tuplets
      })
    })
    writeFileSync(filename, JSON.stringify(objects), 'utf-8');
  }
}

const mak_yaman_id = '63445d13dc8b9023a09747a6';
const e = await Extractor.create(mak_yaman_id);
// e.writeChromaDurationsToFile('extracts/mushtaq_ali_khan_yaman/full_chroma_durations.json');
// e.writeAlapChromaDurationsToFile('extracts/mushtaq_ali_khan_yaman/alap_chroma_durations.json');
e.writeNonMohraSectionsToFile('extracts/mushtaq_ali_khan_yaman/non_mohra_alap_chroma_durations.json');


// Dard Neuman - extraction

// options: 
// 
// Phrase Division type - 
//    'user-defined', 
//    'interspersed silence', 
//    'trajectory following chikari',

// Pitch justification -
//    'all', 
//    'with duration above dur threshold',

enum Segmentation {
  UserDefined = 'user-defined',
  Silence = 'silence',
  Chikari = 'chikari',
  MelodicDiscontinuity = 'melodic discontinuity',
}

enum PitchInclusionMethod {
  All = 'all',
  AboveThreshold = 'above threshold',
}

type DN_ExtractorOptions = {
  segmentation: Segmentation,
  pitchJustification: PitchInclusionMethod,
  durThreshold: number,
  track: number,
};

class DN_Extractor {
  piece: Piece;
  options: DN_ExtractorOptions;

  private constructor(piece: Piece, options: DN_ExtractorOptions) {
      this.piece = piece;
      this.options = options;
  }

  static async create(
    id: string,
    options: Partial<DN_ExtractorOptions> = {}
  ): Promise<DN_Extractor> {
    // merge defaults
    const mergedOptions: DN_ExtractorOptions = {
      segmentation: Segmentation.UserDefined,
      pitchJustification: PitchInclusionMethod.All,
      durThreshold: 0.1,
      track: 0,
      ...options,
    };
    try {
      const piece = await instantiatePiece(id);
      return new DN_Extractor(piece, mergedOptions);
    } catch (error) {
      console.error('Error instantiating piece:', error);
      throw error;
    }
  }

  get segments(): Trajectory[][] {
    const phrases = this.piece.phraseGrid[this.options.track]
    if (this.options.segmentation === Segmentation.UserDefined) {
      return phrases.map(p => p.trajectories)
    } else if (this.options.segmentation === Segmentation.Silence) {
      const trajs = this.piece.allTrajectories(this.options.track);
      const groups: Trajectory[][] = [];
      let currentGroup: Trajectory[] = [];
      trajs.forEach(traj => {
        if (traj.id === 12) {
          if (currentGroup.length) {
            groups.push(currentGroup);
            currentGroup = [];
          }
        } else {
          currentGroup.push(traj);
        }
      });
      if (currentGroup.length) {
        groups.push(currentGroup);
      }
      return groups;
    } else if (this.options.segmentation === Segmentation.Chikari) {
      if (this.piece.instrumentation[this.options.track] !== Instrument.Sitar) {
        throw new Error('Chikari segmentation is only available for Sitar');
      }
      const allChikariTimes: number[] = [];
      phrases.forEach(phrase => {
        const chikarisTimes = Object
          .keys(phrase.chikaris)
          .map(t => Number(t) + phrase.startTime!);
        allChikariTimes.push(...chikarisTimes);
      });
      const trajArr = this.piece.allTrajectories(this.options.track);
      // plucks, times, traj idxs
      const plucks: {
        time: number,
        trajArrIdx: number
      }[] = [];
      trajArr.forEach((traj, trajArrIdx) => {
        const arts = traj.articulations;
        if (arts['0.00'] !== undefined && arts['0.00'].name === 'pluck') {
          const trajStart = phrases[traj.phraseIdx!].startTime! + traj.startTime!;
          plucks.push({ time: trajStart, trajArrIdx });
        }
      });
      const sortedChikariTimes = allChikariTimes.slice().sort((a, b) => a - b);
      const groups: Trajectory[][] = [];
      let currentGroup: Trajectory[] = [];
      let chikIdx = 0;
      plucks.forEach(({ time, trajArrIdx }) => {
        while (chikIdx < sortedChikariTimes.length && time >= sortedChikariTimes[chikIdx]) {
          if (currentGroup.length > 0) {
            groups.push(currentGroup);
            currentGroup = [];
          }
          chikIdx++;
        }
        currentGroup.push(trajArr[trajArrIdx]);
      });
      if (currentGroup.length > 0) {
        groups.push(currentGroup);
      }

      return groups;
    } else if (this.options.segmentation === Segmentation.MelodicDiscontinuity) {
      const trajs = this.piece.allTrajectories(this.options.track);
      const groups: Trajectory[][] = [];
      let currentGroup: Trajectory[] = [];
      trajs.forEach(traj => {
        if (traj.id === 12) {
          if (currentGroup.length) {
            groups.push(currentGroup);
            currentGroup = [];
          }
        } else if (
          currentGroup.length > 0 && 
          currentGroup.at(-1)!.logFreqs.at(-1) !== traj.logFreqs[0]
          ) {
            groups.push(currentGroup);
            currentGroup = [traj];
        } else {
          currentGroup.push(traj);
        }
      })
      if (currentGroup.length) {
        groups.push(currentGroup);
      }
      return groups;
    } else {
      throw new Error('Invalid segmentation method');
    }
  }
}
