import { 
  instantiatePiece,
  condensedDurations,
  durationsOfPitchOnsets,
  PitchTimes
} from './analysis.ts';
import {
	Piece,
  Pitch,
  Phrase,
  Trajectory,
  durationsOfFixedPitches
} from './classes.ts'
import { writeFileSync } from 'fs';
import {
  Instrument,
} from './../ts/enums.ts';
import { displayTime } from './../ts/utils.ts';

import ExcelJS from 'exceljs';

const getExcelColumn = (colNum: number): string => {
  let dividend = colNum;
  let columnName = '';
  while (dividend > 0) {
    const mod = (dividend - 1) % 26;
    columnName = String.fromCharCode(65 + mod) + columnName;
    dividend = Math.floor((dividend - 1) / 26);
  }
  return columnName;
};
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

// const mak_yaman_id = '63445d13dc8b9023a09747a6';
// const e = await Extractor.create(mak_yaman_id);
// e.writeChromaDurationsToFile('extracts/mushtaq_ali_khan_yaman/full_chroma_durations.json');
// e.writeAlapChromaDurationsToFile('extracts/mushtaq_ali_khan_yaman/alap_chroma_durations.json');
// e.writeNonMohraSectionsToFile('extracts/mushtaq_ali_khan_yaman/non_mohra_alap_chroma_durations.json');


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
  AboveThreshold = 'above threshold', // not implemented yet
}

enum PitchRepresentation {
  Chroma = 'chroma',
  PitchNumber = 'pitchNumber',
  SargamLetter = 'sargamLetter',
  OctavedSargamLetter = 'octavedSargamLetter',
}

type DN_ExtractorOptions = {
  segmentation: Segmentation,
  pitchJustification: PitchInclusionMethod,
  durThreshold: number,
  track: number,
  pitchRepresentation: PitchRepresentation,
  endSequenceLength: number,
}

type SegmentType = {
  start: number,
  end: number,
  trajectories: Trajectory[],
}

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
      pitchRepresentation: PitchRepresentation.PitchNumber,
      endSequenceLength: 3,
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

  get segments(): SegmentType[] {
    const phrases = this.piece.phraseGrid[this.options.track]
    if (this.options.segmentation === Segmentation.UserDefined) {
      return phrases.map(p => {
        return {
          start: p.startTime!,
          end: p.startTime! + p.durTot!,
          trajectories: p.trajectories,
        };
      });
    } else if (this.options.segmentation === Segmentation.Silence) {
      const trajs = this.piece.allTrajectories(this.options.track);
      const groups: Trajectory[][] = [];
      const starts: number[] = [];
      const ends: number[] = [];
      let currentGroup: Trajectory[] = [];
      trajs.forEach(traj => {
        const phrase = phrases[traj.phraseIdx!];
        const trajStart = phrase.startTime! + traj.startTime!;
        const trajEnd = phrase.startTime! + traj.endTime!;
        if (traj.id === 12) {
          if (currentGroup.length) {
            groups.push(currentGroup);
            ends.push(trajEnd);
            currentGroup = [];
          }
        } else {
          if (currentGroup.length === 0) starts.push(trajStart)
          currentGroup.push(traj);
        }
      });
      if (currentGroup.length) {
        groups.push(currentGroup);
      }
      return groups.map((group, idx) => {
        return {
          start: starts[idx],
          end: ends[idx],
          trajectories: group,
        };
      });
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
      const starts: number[] = [];
      const ends: number[] = [];
      let currentGroup: Trajectory[] = [];
      let chikIdx = 0;
      plucks.forEach(({ time, trajArrIdx }) => {
        while (chikIdx < sortedChikariTimes.length && time >= sortedChikariTimes[chikIdx]) {
          if (currentGroup.length > 0) {
            const startTraj = currentGroup[0];
            const startPhrase = phrases[startTraj.phraseIdx!];
            const startTime = startPhrase.startTime! + startTraj.startTime!;
            const endTraj = currentGroup.at(-1);
            const endPhrase = phrases[endTraj!.phraseIdx!];
            const endTime = endPhrase.startTime! + endTraj!.endTime!;
            starts.push(startTime);
            ends.push(endTime);
            groups.push(currentGroup);
            currentGroup = [];
          }
          chikIdx++;
        }
        currentGroup.push(trajArr[trajArrIdx]);
      });
      if (currentGroup.length > 0) {
        const startTraj = currentGroup[0];
        const startPhrase = phrases[startTraj.phraseIdx!];
        const startTime = startPhrase.startTime! + startTraj.startTime!;
        const endTraj = currentGroup.at(-1);
        const endPhrase = phrases[endTraj!.phraseIdx!];
        const endTime = endPhrase.startTime! + endTraj!.endTime!;
        starts.push(startTime);
        ends.push(endTime);
        groups.push(currentGroup);
      }
      return groups.map((group, idx) => {
        return {
          start: starts[idx],
          end: ends[idx],
          trajectories: group,
        };
      });
    } else if (this.options.segmentation === Segmentation.MelodicDiscontinuity) {
      const trajs = this.piece.allTrajectories(this.options.track);
      const groups: Trajectory[][] = [];
      const starts: number[] = [];
      const ends: number[] = [];
      let currentGroup: Trajectory[] = [];
      trajs.forEach(traj => {
        if (traj.id === 12) {
          if (currentGroup.length) {
            const startTraj = currentGroup[0];
            const startPhrase = phrases[startTraj.phraseIdx!];
            const startTime = startPhrase.startTime! + startTraj.startTime!;
            const endTraj = currentGroup.at(-1);
            const endPhrase = phrases[endTraj!.phraseIdx!];
            const endTime = endPhrase.startTime! + endTraj!.endTime!;
            starts.push(startTime);
            ends.push(endTime);
            groups.push(currentGroup);
            currentGroup = [];
          }
        } else if (
          currentGroup.length > 0 && 
          currentGroup.at(-1)!.logFreqs.at(-1) !== traj.logFreqs[0]
          ) {
            const startTraj = currentGroup[0];
            const startPhrase = phrases[startTraj.phraseIdx!];
            const startTime = startPhrase.startTime! + startTraj.startTime!;
            const endTraj = currentGroup.at(-1);
            const endPhrase = phrases[endTraj!.phraseIdx!];
            const endTime = endPhrase.startTime! + endTraj!.endTime!;
            starts.push(startTime);
            ends.push(endTime);
            groups.push(currentGroup);
            currentGroup = [traj];
        } else {
          currentGroup.push(traj);
        }
      })
      if (currentGroup.length) {
        const startTraj = currentGroup[0];
        const startPhrase = phrases[startTraj.phraseIdx!];
        const startTime = startPhrase.startTime! + startTraj.startTime!;
        const endTraj = currentGroup.at(-1);
        const endPhrase = phrases[endTraj!.phraseIdx!];
        const endTime = endPhrase.startTime! + endTraj!.endTime!;
        starts.push(startTime);
        ends.push(endTime);
        groups.push(currentGroup);
      }
      return groups.map((group, idx) => {
        return {
          start: starts[idx],
          end: ends[idx],
          trajectories: group,
        };
      });
    } else {
      throw new Error('Invalid segmentation method');
    }
  }

  get segmentOutputs(): { start: number, end: number, pitches: (number | string)[] }[] {
    return this.segments.map(segment => {
      let pitchTimes = PitchTimes(segment.trajectories, {
        outputType: this.options.pitchRepresentation,
      })
      pitchTimes = pitchTimes.filter((pt, ptIdx) =>  {
        if (pt.pitch === 'silence') return false;
        if (ptIdx === 0) return true;
        const prevPT = pitchTimes[ptIdx - 1];
        if (prevPT.pitch === pt.pitch && !pt.articulation ) {
          return false;
        } else { 
          return true;
        }
      })
      return {
        start: segment.start,
        end: segment.end,
        pitches: pitchTimes.map(pt => pt.pitch)
      };
    })
  }

  get allEnds() {
    const initEnds: (number | string)[][] = this.segmentOutputs.map(s => s.pitches.slice(-this.options.endSequenceLength));
    const ends: (number | string)[][] = [];
    initEnds.forEach((end, idx) => {
      if (end.length === this.options.endSequenceLength) {
        ends.push(end);
      }
    })
    return ends;
  }

  get backPropagatedFromEndsPitchSubSegments() {
    const pitchSegments = this.segmentOutputs
      .map(s => s.pitches)
      .map(pitches => {
        // console.log('starting from: ', pitches);
        const pitchSubSegments: (number | string)[][] = [];
        const end = pitches.slice(-this.options.endSequenceLength);
        let endIdx = pitches.length - this.options.endSequenceLength - 1;
        pitchSubSegments.push(end);
        let tempSubSegment: (number | string)[] = [];
        while (endIdx >= 0) {
          const pitch = pitches[endIdx];
          if (tempSubSegment.includes(pitch)) {
            pitchSubSegments.push(tempSubSegment);
            tempSubSegment = [pitch];
          } else {
            tempSubSegment.unshift(pitch);
          }
          endIdx--;
        }
        if (tempSubSegment.length > 0) {
          pitchSubSegments.push(tempSubSegment);
        }
        pitchSubSegments.reverse()
        // console.log('turning into: ', pitchSubSegments);
        return pitchSubSegments;
      })
    return pitchSegments;
  }

  get uniqueEnds() {
    const uniqueEnds = Array.from(new Set(this.allEnds.map(e => JSON.stringify(e))))
      .map(s => JSON.parse(s) as (number | string)[]);
    // Sort uniqueEnds by the frequency of each pattern (descending)
    uniqueEnds.sort((a, b) =>
      this.uniqueEndsDict[JSON.stringify(b)].length -
      this.uniqueEndsDict[JSON.stringify(a)].length
    );
    return uniqueEnds;
  }

  get uniqueEndsDict() {
    const dict: { [key: string]: number[] } = {};
    this.segmentOutputs.forEach((segment, segIdx) => {
      const end = segment.pitches.slice(-this.options.endSequenceLength);
      if (end.length === this.options.endSequenceLength) {
        const key = JSON.stringify(end);
        if (!dict[key]) {
          dict[key] = [];
        }
        dict[key].push(segIdx);
      }
    });
    return dict;
  }

  addEndingSequencesWorksheet(workbook: ExcelJS.Workbook) {
    const sheet = workbook.addWorksheet('Ending Sequences');
    sheet.views = [
      { state: 'frozen', xSplit: 5 }
    ];
    this.addBoilerPlate(sheet);
    const c7 = sheet.getCell('C7');
    const d7 = sheet.getCell('D7');
    const e7 = sheet.getCell('E7');
    c7.value = 'Segment';
    c7.font = {
      bold: true
    }
    c7.alignment = { vertical: 'middle', horizontal: 'center' };
    d7.value = 'Start';
    d7.font = {
      bold: true
    }
    d7.alignment = { vertical: 'middle', horizontal: 'center' };
    e7.value = 'End';
    e7.font = {
      bold: true
    }
    e7.alignment = { vertical: 'middle', horizontal: 'center' };
    ['C', 'D', 'E'].forEach(col => {
      const cell = sheet.getCell(`${col}7`);
      cell.border = {
        top:    { style: 'medium' },
        bottom: { style: 'medium' },
        left: { style: 'medium' },
        right: { style: 'medium' },
      };
    });

    const longestLength = Math.max(...this.segmentOutputs.map(e => e.pitches.length));
    let idxCt = 0;
    this.uniqueEnds.forEach((end, idx) => {
      const allSegIdxs = this.uniqueEndsDict[JSON.stringify(end)];
      allSegIdxs.forEach((segIdx, rowIdx) => {
        const segment = this.segmentOutputs[segIdx];
        sheet.addRow([
          '', 
          '',
          segIdx + 1,
          displayTime(segment.start),
          displayTime(segment.end),
          ...Array.from({ length: longestLength - segment.pitches.length }, () => ''),
          ...segment.pitches
        ]);
        const cell = sheet.getCell(`C${rowIdx + idxCt + 8}`);
        cell.alignment = { vertical: 'middle', horizontal: 'center' };
        cell.border = { left: { style: 'medium' }, bottom: { style: 'thin' } };
        const startCell = sheet.getCell(`D${rowIdx + idxCt + 8}`);
        startCell.border = { left: { style: 'medium' }, bottom: { style: 'thin' } };
        startCell.alignment = { vertical: 'middle', horizontal: 'center' };
        const endCell = sheet.getCell(`E${rowIdx + idxCt + 8}`);
        endCell.border = {
          left: { style: 'medium' },
          right: { style: 'medium' },
          bottom: { style: 'thin' },
        };
        endCell.alignment = { vertical: 'middle', horizontal: 'center' };
        if (rowIdx === allSegIdxs.length - 1) {
          startCell.border['bottom'] = { style: 'medium' };
          endCell.border['bottom'] = { style: 'medium' };
          cell.border['bottom'] = { style: 'medium' };
        }        
        for (let col = 6; col <= longestLength + 5; col++) {
          const borderCell = sheet.getCell(`${getExcelColumn(col)}${rowIdx + idxCt + 8}`);
          borderCell.border = { bottom: { style: 'thin' } };
          if (idx === 0 && rowIdx === 0) {
            borderCell.border.top = { style: 'medium' };
          }
          if (rowIdx === allSegIdxs.length - 1) {
            borderCell.border.bottom = { style: 'medium' };
          }
        }
        const endCutoff = longestLength - this.options.endSequenceLength + 1;
        const colName = getExcelColumn(endCutoff + 5);
        const cellID = `${colName}${rowIdx + idxCt + 8}`;
        const cutoffCell = sheet.getCell(cellID);
        cutoffCell.border.left = { style: 'medium' };
        const lastCell = sheet.getCell(`${getExcelColumn(longestLength + 5)}${rowIdx + idxCt + 8}`);
        lastCell.border.right = { style: 'medium' };
      });
      idxCt += allSegIdxs.length;
    });
  }

   addSegmentedEndingSequencesWorksheet(workbook: ExcelJS.Workbook, title: string) {  
    const sheet = workbook.addWorksheet(title);
    sheet.views = [
      { state: 'frozen', xSplit: 5 }
    ];
    this.addBoilerPlate(sheet);
    const c7 = sheet.getCell('C7');
    const d7 = sheet.getCell('D7');
    const e7 = sheet.getCell('E7');
    c7.value = 'Segment';
    c7.font = {
      bold: true
    }
    c7.alignment = { vertical: 'middle', horizontal: 'center' };
    d7.value = 'Start';
    d7.font = {
      bold: true
    }
    d7.alignment = { vertical: 'middle', horizontal: 'center' };
    e7.value = 'End';
    e7.font = {
      bold: true
    }
    e7.alignment = { vertical: 'middle', horizontal: 'center' };
    ['C', 'D', 'E'].forEach(col => {
      const cell = sheet.getCell(`${col}7`);
      cell.border = {
        top:    { style: 'medium' },
        bottom: { style: 'medium' },
        left: { style: 'medium' },
        right: { style: 'medium' },
      };
    });

    const longestLength = Math.max(...this.segmentOutputs.map(e => e.pitches.length));
    let idxCt = 0;
    this.uniqueEnds.forEach((end, idx) => {
      const allSegIdxs = this.uniqueEndsDict[JSON.stringify(end)];
      allSegIdxs.forEach((segIdx, rowIdx) => {
        const segment = this.segmentOutputs[segIdx];
        const row = sheet.addRow([
          '', 
          '',
          segIdx + 1,
          displayTime(segment.start),
          displayTime(segment.end),
          ...Array.from({ length: longestLength - segment.pitches.length }, () => ''),
          ...segment.pitches
        ]);
        row.alignment = { vertical: 'middle', horizontal: 'center' };
        const cell = sheet.getCell(`C${rowIdx + idxCt + 8}`);
        cell.alignment = { vertical: 'middle', horizontal: 'center' };
        cell.border = { left: { style: 'medium' }, bottom: { style: 'thin' } };
        const startCell = sheet.getCell(`D${rowIdx + idxCt + 8}`);
        startCell.border = { left: { style: 'medium' }, bottom: { style: 'thin' } };
        startCell.alignment = { vertical: 'middle', horizontal: 'center' };
        const endCell = sheet.getCell(`E${rowIdx + idxCt + 8}`);
        endCell.border = {
          left: { style: 'medium' },
          right: { style: 'medium' },
          bottom: { style: 'thin' },
        };
        endCell.alignment = { vertical: 'middle', horizontal: 'center' };
        if (rowIdx === allSegIdxs.length - 1) {
          startCell.border['bottom'] = { style: 'medium' };
          endCell.border['bottom'] = { style: 'medium' };
          cell.border['bottom'] = { style: 'medium' };
        }        
        for (let col = 6; col <= longestLength + 5; col++) {
          const borderCell = sheet.getCell(`${getExcelColumn(col)}${rowIdx + idxCt + 8}`);
          borderCell.border = { bottom: { style: 'thin' } };
          if (idx === 0 && rowIdx === 0) {
            borderCell.border.top = { style: 'medium' };
          }
          if (rowIdx === allSegIdxs.length - 1) {
            borderCell.border.bottom = { style: 'medium' };
          }
        }
        const endCutoff = longestLength - this.options.endSequenceLength + 1;
        const colName = getExcelColumn(endCutoff + 5);
        const cellID = `${colName}${rowIdx + idxCt + 8}`;
        

        const addVerticalLine = (colIdx: number) => {
          const colName = getExcelColumn(colIdx + 5);
          const cellID = `${colName}${rowIdx + idxCt + 8}`;
          const cell = sheet.getCell(cellID);
          if (!cell.border) {
            cell.border = {};
          }
          cell.border.left = { style: 'thin' }
        }
        let vertIdx = longestLength - segment.pitches.length + 1;
        if (vertIdx > this.options.endSequenceLength) {
          addVerticalLine(vertIdx);
        }
        const segmentedEndSeq = this.backPropagatedFromEndsPitchSubSegments[segIdx];
        segmentedEndSeq.forEach((subSeg, subSegIdx) => {
          if (subSegIdx !== segmentedEndSeq.length - 1) {
            vertIdx += subSeg.length;
            addVerticalLine(vertIdx);
          }
        });
        const cutoffCell = sheet.getCell(cellID);
        cutoffCell.border.left = { style: 'medium' };
        const lastCell = sheet.getCell(`${getExcelColumn(longestLength + 5)}${rowIdx + idxCt + 8}`);
        lastCell.border.right = { style: 'medium' };

      });
      idxCt += allSegIdxs.length;
    });  
  }

  addSeparatedSegmentedEndingSequencesWorksheet(workbook: ExcelJS.Workbook, title: string, insertString: string) {
    const sheet = workbook.addWorksheet(title);
     sheet.views = [
      { state: 'frozen', xSplit: 5 }
    ];
    this.addBoilerPlate(sheet);
    const c7 = sheet.getCell('C7');
    const d7 = sheet.getCell('D7');
    const e7 = sheet.getCell('E7');
    c7.value = 'Segment';
    c7.font = {
      bold: true
    }
    c7.alignment = { vertical: 'middle', horizontal: 'center' };
    d7.value = 'Start';
    d7.font = {
      bold: true
    }
    d7.alignment = { vertical: 'middle', horizontal: 'center' };
    e7.value = 'End';
    e7.font = {
      bold: true
    }
    e7.alignment = { vertical: 'middle', horizontal: 'center' };
    ['C', 'D', 'E'].forEach(col => {
      const cell = sheet.getCell(`${col}7`);
      cell.border = {
        top:    { style: 'medium' },
        bottom: { style: 'medium' },
        left: { style: 'medium' },
        right: { style: 'medium' },
      };
    });
    const withInserts = this.backPropagatedFromEndsPitchSubSegments.map((seg, idx) => {
      const segment = seg.map((s, sIdx) => {
        if (sIdx === seg.length - 1) {
          return s;
        }
        return [...s, insertString];
      });
      return segment.flat();
    });
    const longestLength = Math.max(...withInserts.map(e => e.length));
    let idxCt = 0;
    this.uniqueEnds.forEach((end, idx) => {
      const allSegIdxs = this.uniqueEndsDict[JSON.stringify(end)];
      allSegIdxs.forEach((segIdx, rowIdx) => {
        const segment = withInserts[segIdx];
        const row = sheet.addRow([
          '', 
          '',
          segIdx + 1,
          displayTime(this.segmentOutputs[segIdx].start),
          displayTime(this.segmentOutputs[segIdx].end),
          ...Array.from({ length: longestLength - segment.length }, () => ''),
          ...segment
        ]);
        row.alignment = { vertical: 'middle', horizontal: 'center' };
        const cell = sheet.getCell(`C${rowIdx + idxCt + 8}`);
        cell.alignment = { vertical: 'middle', horizontal: 'center' };
        cell.border = { left: { style: 'medium' }, bottom: { style: 'thin' } };
        const startCell = sheet.getCell(`D${rowIdx + idxCt + 8}`);
        startCell.border = { left: { style: 'medium' }, bottom: { style: 'thin' } };
        startCell.alignment = { vertical: 'middle', horizontal: 'center' };
        const endCell = sheet.getCell(`E${rowIdx + idxCt + 8}`);
        endCell.border = {
          left: { style: 'medium' },
          right: { style: 'medium' },
          bottom: { style: 'thin' },
        };
        endCell.alignment = { vertical: 'middle', horizontal: 'center' };
        if (rowIdx === allSegIdxs.length - 1) {
          startCell.border['bottom'] = { style: 'medium' };
          endCell.border['bottom'] = { style: 'medium' };
          cell.border['bottom'] = { style: 'medium' };
        }        
        for (let col = 6; col <= longestLength + 5; col++) {
          const borderCell = sheet.getCell(`${getExcelColumn(col)}${rowIdx + idxCt + 8}`);
          borderCell.border = { bottom: { style: 'thin' } };
          if (idx === 0 && rowIdx === 0) {
            borderCell.border.top = { style: 'medium' };
          }
          if (rowIdx === allSegIdxs.length - 1) {
            borderCell.border.bottom = { style: 'medium' };
          }
        }
        const endCutoff = longestLength - this.options.endSequenceLength + 1;
        const colName = getExcelColumn(endCutoff + 5);
        const cellID = `${colName}${rowIdx + idxCt + 8}`;

        const addVerticalLine = (colIdx: number) => {
          const colName = getExcelColumn(colIdx + 5);
          const cellID = `${colName}${rowIdx + idxCt + 8}`;
          const cell = sheet.getCell(cellID);
          if (!cell.border) {
            cell.border = {};
          }
          cell.border.left = { style: 'thin' }
        }

        let vertIdx = longestLength - segment.length + 1;
        if (vertIdx > this.options.endSequenceLength) {
          addVerticalLine(vertIdx);
        }
        const segmentedEndSeq = this.backPropagatedFromEndsPitchSubSegments[segIdx]
          .map(seg => [...seg, insertString]);
        segmentedEndSeq.forEach((subSeg, subSegIdx) => {
          if (subSegIdx !== segmentedEndSeq.length - 1) {
            vertIdx += subSeg.length;
            addVerticalLine(vertIdx);
          }
        });
        const cutoffCell = sheet.getCell(cellID);
        cutoffCell.border.left = { style: 'medium' };
        const lastCell = sheet.getCell(`${getExcelColumn(longestLength + 5)}${rowIdx + idxCt + 8}`);
        lastCell.border.right = { style: 'medium' };
      });
      idxCt += allSegIdxs.length;
    });

  }

  addBoilerPlate(sheet: ExcelJS.Worksheet) {
    sheet.addRows([
      ['Soloist', this.piece.soloist],
      ['Raag', this.piece.raga.name],
      ['Transcription ID', this.piece._id],
      [{ 
        text: 'Swara.Studio Editor', 
        hyperlink: `https://swara.studio/editor?id=${this.piece._id}`,
      }],
      ['Segmentation Method', this.options.segmentation],
      ['Pitch Representation', this.options.pitchRepresentation],
    ]);
    sheet.getCell('A4').font = {
      bold: true,
      color: { argb: 'FF0000FF' },
      underline: true,
    };
    const colWidths = [20, 30, 10, 6, 6];
    for (let i = 0; i < 500; i++) {
      colWidths.push(4);
    }
    sheet.columns = colWidths.map(w => ({ width: w }));

  }

  addSeparatedSegmentSheet(workbook: ExcelJS.Workbook, title: string, endAligned: boolean = false) {
    const sheet = workbook.addWorksheet(title);
    this.addBoilerPlate(sheet);

    // Freeze the first 5 columns (A to E)
    sheet.views = [
      { state: 'frozen', xSplit: 5 }
    ];
    const c7 = sheet.getCell('C7');
    const d7 = sheet.getCell('D7');
    const e7 = sheet.getCell('E7');
    c7.value = 'Segment';
    c7.font = {
      bold: true
    }
    c7.alignment = { vertical: 'middle', horizontal: 'center' };
    d7.value = 'Start';
    d7.font = {
      bold: true
    }
    d7.alignment = { vertical: 'middle', horizontal: 'center' };
    e7.value = 'End';
    e7.font = {
      bold: true
    }
    e7.alignment = { vertical: 'middle', horizontal: 'center' };

    ['C', 'D', 'E'].forEach(col => {
      const cell = sheet.getCell(`${col}7`);
      cell.border = {
        top:    { style: 'medium' },
        bottom: { style: 'medium' },
        left: { style: 'medium' },
        right: { style: 'medium' },
      };
    });

    this.segmentOutputs.forEach((segment, idx) => {
      const cell = sheet.getCell(`C${idx + 8}`);
      cell.value = idx + 1;
      cell.alignment = { vertical: 'middle', horizontal: 'center' };
      cell.border = { left: { style: 'medium' }, bottom: { style: 'thin' } };
      const startCell = sheet.getCell(`D${idx + 8}`);
      startCell.border = { left: { style: 'medium' }, bottom: { style: 'thin' } };
      startCell.alignment = { vertical: 'middle', horizontal: 'center' };
      const endCell = sheet.getCell(`E${idx + 8}`);
      endCell.border = {
        left: { style: 'medium' },
        right: { style: 'medium' },
        bottom: { style: 'thin' },
      };
      endCell.alignment = { vertical: 'middle', horizontal: 'center' };
      startCell.value = displayTime(segment.start);
      endCell.value = displayTime(segment.end);

      let pitches = segment.pitches;
      let pitchCount = pitches.length;
      const baseColIndex = 'F'.charCodeAt(0) - 64; // A=1, B=2, C=3
      // If endAligned, right-align pitches in columns so last pitch is at the rightmost
      let offset = 0;
      if (endAligned) {
        // Find the maximum number of pitches across all segments
        const maxPitches = Math.max(...this.segmentOutputs.map(s => s.pitches.length));
        offset = maxPitches - pitchCount;
      }
      pitches.forEach((p, pIdx) => {
        let columnNumber;
        if (endAligned) {
          columnNumber = baseColIndex + offset + pIdx;
        } else {
          columnNumber = baseColIndex + pIdx;
        }
        const cellID = `${getExcelColumn(columnNumber)}${idx + 8}`;
        const cell = sheet.getCell(cellID);
        cell.value = p;
        cell.alignment = { vertical: 'middle', horizontal: endAligned ? 'right' : 'center' };
        cell.border = { top: { style: 'thin' }, bottom: { style: 'thin' } };
        if (pIdx === pitchCount - 1) {
          cell.border.right = { style: 'thin' };
        }
      });
      if (idx === this.segmentOutputs.length - 1) {
        startCell.border['bottom'] = { style: 'medium' };
        endCell.border['bottom'] = { style: 'medium' };
        cell.border['bottom'] = { style: 'medium' };
      }
    });
  }

  addCombinedSegmentSheet(workbook: ExcelJS.Workbook, title: string) {
    const sheet = workbook.addWorksheet(title);
    this.addBoilerPlate(sheet);
    const c7 = sheet.getCell('C7');
    const d7 = sheet.getCell('D7');
    const e7 = sheet.getCell('E7');
    c7.value = 'Segment';
    c7.font = {
      bold: true
    }
    c7.alignment = { vertical: 'middle', horizontal: 'center' };
    d7.value = 'Start';
    d7.font = {
      bold: true
    }
    d7.alignment = { vertical: 'middle', horizontal: 'center' };
    e7.value = 'End';
    e7.font = {
      bold: true
    }
    e7.alignment = { vertical: 'middle', horizontal: 'center' };
    ['C', 'D', 'E'].forEach(col => {
      const cell = sheet.getCell(`${col}7`);
      cell.border = {
        top:    { style: 'medium' },
        bottom: { style: 'medium' },
        left: { style: 'medium' },
        right: { style: 'medium' },
      };
    });

    this.segmentOutputs.forEach((segment, idx) => {
      const cell = sheet.getCell(`C${idx + 8}`);
      cell.value = idx + 1;
      cell.alignment = { vertical: 'middle', horizontal: 'center' };
      cell.border = { left: { style: 'medium' }, bottom: { style: 'thin' } };
      const startCell = sheet.getCell(`D${idx + 8}`);
      startCell.border = { left: { style: 'medium' }, bottom: { style: 'thin' } };
      startCell.alignment = { vertical: 'middle', horizontal: 'center' };
      const endCell = sheet.getCell(`E${idx + 8}`);
      endCell.border = {
        left: { style: 'medium' },
        right: { style: 'medium' },
        bottom: { style: 'thin' },
      };
      endCell.alignment = { vertical: 'middle', horizontal: 'center' };
      startCell.value = displayTime(segment.start);
      endCell.value = displayTime(segment.end);
      const contentCell = sheet.getCell(`F${idx + 8}`);
      contentCell.value = segment.pitches.join(', ');
      contentCell.alignment = { vertical: 'middle', horizontal: 'left' };
      contentCell.border = { top: { style: 'thin' }, bottom: { style: 'thin' } };
    })
    const longestLength = Math.max(...this.segmentOutputs.map(s => s.pitches.join(', ').length));
    sheet.columns[5].width = 0.7 * longestLength;
  }

  

  async writeToExcel(filename: string) {
    const workbook = new ExcelJS.Workbook();
    this.addSeparatedSegmentSheet(workbook, 'Segments separated');
    this.addSeparatedSegmentSheet(workbook, 'Segments separated end aligned', true);
    this.addCombinedSegmentSheet(workbook, 'Segments combined');
    this.addEndingSequencesWorksheet(workbook);
    this.addSegmentedEndingSequencesWorksheet(workbook, 'Segmented Ending Sequences');
    this.addSeparatedSegmentedEndingSequencesWorksheet(workbook, 'Segmented Ending Sequences with Inserts', ',');

    try {
      await workbook.xlsx.writeFile(filename);
    } catch (error) {
      console.error('Error writing to Excel file:', error);
    }
  }
}


// const mak_yaman_id = '63445d13dc8b9023a09747a6';
const multaniID = '6417585554a0bfbd8de2d3ff';
const options = {
  segmentation: Segmentation.UserDefined,
  endSequenceLength: 3,
  pitchRepresentation: PitchRepresentation.OctavedSargamLetter,

}
const e = await DN_Extractor.create(multaniID, options);
e.writeToExcel('extracts/excel/multani_test_octaved.xlsx')
