import { 
  instantiatePiece,
  condensedDurations,
} from './analysis.ts';
import {
	Piece,
  Pitch,
  Phrase
} from './classes.ts'
import { writeFileSync } from 'fs';



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
