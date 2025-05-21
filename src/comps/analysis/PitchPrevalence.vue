<template>
  <div class='outerHolder'>
    <div 
      class='axisHolder' 
      :style="{ '--margin': margin + 'px' }"
      ref='axisHolder'
      >
    </div>
    <div class='scrollingGraphHolder' :style="{ 
      '--margin': margin + 'px',
      '--yAxisWidth': yAxisWidth + 'px'
      }">
    </div>
  </div>
</template>
<script lang='ts'>

import Gradient from 'javascript-color-gradient';
import { defineComponent, PropType } from 'vue';
import { 
  Piece,
  durationsOfFixedPitches,  
} from '@/js/classes.ts';
import { 
  PhraseCatType,
} from '@shared/types'
import { Instrument } from '@shared/enums';
import * as d3 from 'd3';
import { 
  segmentByDuration,
  durationsOfPitchOnsets,
  chromaSeqToCondensedPitchNums
} from '@/js/analysis.ts';

import { displayTime } from '@/ts/utils.ts';

type PitchPrevalenceDataType = {
  showGraph: boolean,
  margin: number,
  graphHeight: number,
  xAxisHeight: number,
  yAxisWidth: number,
  topOfGraph: number,
}


export default defineComponent({
  name: 'PitchPrevalence',
  props: {
    segmentation: {
      type: String,
      required: true
    },
    duration: {
      type: Number,
      required: true
    },
    pitchChroma: {
      type: Boolean,
      required: true
    },
    condensed: {
      type: Boolean,
      required: true
    },
    heatmap: {
      type: Boolean,
      required: true
    },
    pitchRepresentation: {
      type: String,
      required: true
    },
    piece: {
      type: Piece,
      required: true
    },
    fadeTime: {
      type: Number,
      required: true
    },
    height: {
      type: Number,
      required: true
    },
    secTopLevels: {
      type: Array as PropType<{ name: string, bool: boolean }[]>,
      required: true
    },
    diffs: {
      type: Object as PropType<{ [key: string]: 'include' | 'exclude' }>,
      required: true
    },
    phraseInfo: {
      type: Object as PropType<{
        phraseTypes: { name: keyof PhraseCatType['Phrase'], bool: boolean }[],
        elaborations: { 
          name: keyof PhraseCatType['Elaboration'],
          bool: boolean 
        }[],
        vocalArticulations: { 
          name: keyof PhraseCatType['Vocal Articulation'], 
          bool: boolean 
        }[],
        instArticulations: { 
          name: keyof PhraseCatType['Instrumental Articulation'], 
          bool: boolean 
        }[],
        incidentals: { 
          name: keyof PhraseCatType['Incidental'], 
          bool: boolean 
        }[],
      }>,
       required: true
    },
    instIdx: {
      type: Number,
      required: true
    }
  },
  data(): PitchPrevalenceDataType {
    return {

      showGraph: true,
      margin: 10,
      graphHeight: 600,
      xAxisHeight: 70,
      yAxisWidth: 70,
      topOfGraph: 80,
    }
  },

  mounted() {
    this.generateGraph();
    window.addEventListener('resize', this.resetWidth);
  
  },

  beforeUnmount() {
    window.removeEventListener('resize', this.resetWidth);
  },

  methods: {

    generateGraph() {
      if (this.segmentation === 'Section') {
        this.generateSectionGraph();
      } else if (this.segmentation === 'Phrase') {
        this.generatePhraseGraph();
      } else if (this.segmentation === 'Duration') {
        this.generateDurationGraph();
      }
    },

    generateSectionGraph() {
      this.topOfGraph = 80;
      const tog = this.topOfGraph;
      d3.select('.axisSVG').remove();
      d3.select('.gS').remove();
      let segments = this.piece.sectionsGrid[this.instIdx].map(s => {
        return s.trajectories
      });
      const func = this.pitchRepresentation === 'Fixed Pitch' ?
        durationsOfFixedPitches :
        durationsOfPitchOnsets;
      const durIdxs: number[] = [];
      const durs = segments.map((seg, sIdx) => {
        if (seg.length === 0) {
          return undefined;
        } else {
          return func(seg, {
            countType: 'proportional',
            outputType: this.pitchChroma ? 'chroma' : 'pitchNumber',
            maxSilence: this.fadeTime
          })
        }  
      }).filter((seg, sIdx) => {
        let bool1 = false;
        if (seg !== undefined) {
          bool1 = true;
        }
        let bool2 = false;
        this.secTopLevels.forEach(sec => {
          const section = this.piece.sectionsGrid[this.instIdx][sIdx];
          const sCat = section.categorization;
          if (sec.name === sCat['Top Level'] && sec['bool'] === true) {
            bool2 = true;
          }
        })
        if (bool1 && bool2) {
          durIdxs.push(sIdx);
          return true;
        }
      })
      let lowestKey: number = 10000, highestKey: number = -10000;
      durs.forEach(dur => {
        if (dur === undefined) {
          throw new Error('dur is undefined');
        }
        const keys = Object.keys(dur);
        keys.forEach(key => {
          if (Number(key) < lowestKey) {
            lowestKey = Number(key);
          }
          if (Number(key) > highestKey) {
            highestKey = Number(key);
          }
        })
      });
      if (this.condensed) {
        lowestKey = this.piece.raga.pitchNumberToScaleNumber(lowestKey);
        highestKey = this.piece.raga.pitchNumberToScaleNumber(highestKey);
      }
      let totalWidth = 0.9 * window.innerWidth;
      const pnLen = this.piece.raga.getPitchNumbers(0, 11).length;
      const ppOct = this.condensed ? pnLen: 12;
      const lkOct = Math.floor(lowestKey / ppOct);
      const hOct = Math.floor(highestKey / ppOct);
      this.xAxisHeight = 70;
      this.yAxisWidth = 70.5;

      const heights = this.xAxisHeight + tog;
      this.graphHeight = this.height - heights - this.margin * 2;
      const axisHolder = this.$refs.axisHolder as HTMLElement;
      
      const axisSVG = d3.select(axisHolder)
        .append('svg')
        .classed('axisSVG', true)
        .attr('width', 0.9 * window.innerWidth - this.margin * 2 + 1)
        .attr('height', this.height - this.margin * 2)
        .style('background-color', 'white');
    
      
      let y = d3.scaleLinear()
        .domain([lowestKey - 1, highestKey + 1])
        .range([this.graphHeight, 0]);
      const yAxisNode = axisSVG.append('g');
      const pitchNumbers = this.condensed ? 
        [...Array(1 + highestKey - lowestKey)].map((_, i) => i + lowestKey) :
        this.piece.raga.getPitchNumbers(lowestKey, highestKey);
      const tickLabels = this.condensed ? 
        pitchNumbers.map(sn => {
          return this.piece.raga.scaleNumberToSargamLetter(sn);
        }) :
        pitchNumbers.map(pn => {
          return this.piece.raga.pitchNumberToSargamLetter(pn);
        });
      yAxisNode.call(d3.axisLeft(y)
          .tickValues(pitchNumbers)
          .tickFormat((d, i) => tickLabels[i] || '')
          .tickSize(0)
          .tickPadding(15))
        .style('color', 'black')
        .style('font-weight', 'normal')
        .attr('transform', `translate(${this.yAxisWidth}, ${heights})`);
      
        // horizontal line above sargam
      this.addLine({
        x1: this.yAxisWidth - 35,
        x2: this.yAxisWidth,
        y1: this.xAxisHeight + tog,
        y2: this.xAxisHeight + tog,
        stroke: 'black',
        el: axisSVG
      })

      const aboveAxLines = [
        { num: 20, text: 'Sec. Type' }, 
        { num: 40, text: 'Duration' },
        { num: 60, text: 'Start' },
        { num: 80, text: 'Section #' }
      ];
      aboveAxLines.forEach((d, idx) => {
        const add = idx === 3 ? 1 : 0;
        this.addLine({
          x1: this.yAxisWidth - 70,
          x2: this.yAxisWidth + add,
          y1: this.xAxisHeight + tog - d.num,
          y2: this.xAxisHeight + tog - d.num,
          stroke: 'black',
          el: axisSVG
        })
        this.addText({
          x: this.yAxisWidth - 35,
          y: this.xAxisHeight + tog - d.num + 10,
          text: d.text,
          el: axisSVG
        
        })
      })

      // vertical line top left
      this.addLine({
        x1: this.yAxisWidth - 70,
        x2: this.yAxisWidth - 70,
        y1: this.xAxisHeight + tog - 140,
        y2: this.xAxisHeight + tog,
        stroke: 'black',
        el: axisSVG
      })
      this.addLine({
        x1: this.yAxisWidth,
        x2: this.yAxisWidth,
        y1: this.xAxisHeight,
        y2: this.xAxisHeight + tog,
        stroke: 'black',
        el: axisSVG
      })
      const wideLines = [
        { num: 140, text: this.piece.title },
        { num: 110, text: 'Pitch Range and Percentage of Duration on each \
          Fixed Pitch, Segmented by Section' }
      ];
      wideLines.forEach(wl => {
        this.addLine({
          x1: this.yAxisWidth - 70,
          x2: this.yAxisWidth - 70 + totalWidth,
          y1: this.xAxisHeight + tog - wl.num,
          y2: this.xAxisHeight + tog - wl.num,
          stroke: 'black',
          el: axisSVG,
          class_: 'wideLine'
        });
        this.addText({
          x: this.yAxisWidth - 70 + totalWidth / 2,
          y: this.xAxisHeight + tog - wl.num + 15,
          text: wl.text,
          el: axisSVG,
          fSize: '14px',
          fWeight: 'bold',
          class_: 'titleText'
        })
      });

      // top right vertical line
      this.addLine({
        x1: totalWidth - this.margin * 2 + 0.5,
        x2: totalWidth - this.margin * 2 + 0.5,
        y1: this.margin,
        y2: this.xAxisHeight,
        stroke: 'black',
        el: axisSVG,
        class_: 'topRightVertical'
      })
      for (let i = lkOct; i <= hOct; i++) {
        let lowY = i * ppOct;
        let highY = (i + 1) * ppOct;
        if (i === lkOct) {
          lowY = lowestKey - 0.5;
        }
        if (i === hOct) {
          highY = highestKey + 1.5;
        }
        this.addText({ 
          x: this.yAxisWidth - 50, 
          y: this.xAxisHeight + tog + y((lowY + highY) / 2 - 0.5), 
          text: i, 
          el: axisSVG 
        })
        const h_ = y(lowY) - y(highY);
        const y_ = y(highY - 0.5);
        const add = i === lkOct ? - 0.5 : 0;
        this.addRect({
          x: this.yAxisWidth - 70,
          y: this.xAxisHeight + tog + y_,
          w: 35,
          h: h_ + add,
          stroke: 'black',
          el: axisSVG
        });
        const lY_ = y(lowY - 0.5);
        this.addLine({ 
          x1: this.yAxisWidth - 35,
          y1: lY_ + this.xAxisHeight + add + tog,
          x2: this.yAxisWidth - add * 2,
          y2: lY_ + this.xAxisHeight + add + tog,
          stroke: 'black',
          el: axisSVG
        })
      };

      //  first need to get width of graph
      const widthPerSeg = 80;
      const width = widthPerSeg * durs.length;


      const gS = d3.select('.scrollingGraphHolder')
        .append('svg')
        .attr('width', width)
        .attr('height', this.graphHeight + 80 - 1.5)
        .style('background-color', 'white')
        .attr('transform', `translate(-0.5, 0)`)
        .classed('gS', true);
      
      const sectionRects = [...Array(durs.length)];
      if (this.condensed) {
        // transform durs
        durs.forEach((dur) => {
          
          if (dur === undefined) {
            throw new Error('dur is undefined');
          }
          const keys = Object.keys(dur);
          keys.forEach(key => {
            const sn = this.piece.raga.pitchNumberToScaleNumber(Number(key));
            dur[sn] = dur[key];
            if (Number(key) !== Number(sn)) delete dur[key];
          })
        });
      }
      durs.forEach((dur, dIdx) => {
          let minVal: (number | undefined) = undefined; 
          let maxVal: (number | undefined) = undefined;
          let modeIdx: number | undefined = undefined; 
          let modeVal = 0;
          if (dur === undefined) {
            throw new Error('dur is undefined');
          }
          const keys = Object.keys(dur);
          if (keys.length > 0) {
            keys.forEach(key => {
              if (key !== 'sIdx') {
                if (minVal === undefined) {
                  minVal = Number(key);
                }
                if (maxVal === undefined) {
                  maxVal = Number(key);
                }
                if (Number(key) < minVal) {
                  minVal = Number(key);
                }
                if (Number(key) > maxVal) {
                  maxVal = Number(key);
                }
                if (Number(dur[key]) > modeVal) {
                  modeVal = Number(dur[key]);
                  modeIdx = Number(key);
                }
              }
            })
            if (maxVal === undefined) {
              throw new Error('maxVal is undefined');
            }
            if (minVal === undefined) {
              throw new Error('minVal is undefined');
            }
            maxVal = maxVal + 0.5;
            minVal = minVal - 0.5;  
            const x_ = dIdx * width / durs.length;
            const y_ = y(maxVal) + tog;
            const w_ = width / durs.length;
            const h_ = y(minVal) - y(maxVal);
            if ((!this.pitchChroma) && (!this.heatmap)) {
              sectionRects[dIdx] = this.addRect({
                x: x_,
                y: y_,
                w: w_,
                h: h_,
                fill: this.heatmap ? 'none' : '#D3D3D3',
                el: gS
              })
            }

            
            keys.forEach((key, kIdx) => {

              let fillColor = 'black';
              const mY_ = y(Number(key)+0.5) + tog;
              const mH_ = y(Number(key)-0.5) - y(Number(key)+0.5);
              if (this.heatmap) {
                fillColor = this.getHeatmapColor(dur[key]);
                this.addRect({ 
                  x: x_, 
                  y: mY_, 
                  w: w_, 
                  h: mH_, 
                  fill: fillColor,
                  el: gS
                });
                this.addText({ 
                  x: x_ + width / (2 * durs.length), 
                  y: y(Number(key)) + tog, 
                  text: (100*dur[key]).toFixed(0)+'%',
                  fill: dur[key] > 0.5 ? 'white' : 'black',
                  el: gS
                })
              } else {
                if (Number(key) === modeIdx) {
                  fillColor = 'white'
                  this.addRect({ 
                    x: x_, 
                    y: mY_, 
                    w: w_, 
                    h: mH_, 
                    fill: 'grey',
                    el: gS 
                  })
                } else if (this.pitchChroma) {
                  this.addRect({ 
                    x: x_, 
                    y: mY_, 
                    w: w_, 
                    h: mH_, 
                    fill: '#D3D3D3',
                    el: gS
                  })
                }
                this.addText({ 
                  x: x_ + width / (2 * durs.length), 
                  y: y(Number(key)) + tog, 
                  text: (100*dur[key]).toFixed(0)+'%', 
                  fill: fillColor,
                  el: gS
                })
              }

            })
            if ((!this.pitchChroma) && (this.heatmap)) {
              sectionRects[dIdx] = this.addRect({
                x: x_,
                y: y_,
                w: w_,
                h: h_,
                fill: this.heatmap ? 'none' : '#D3D3D3',
                el: gS
              })
            }
          }
        })
        sectionRects.forEach(rect => {
          rect?.attr('stroke', 'black')
        });
        for (let i = lkOct; i <= hOct; i++) {
          let lowY = i * ppOct;
          let highY = (i+1) * ppOct;
          if (i === lkOct) {
            lowY = lowestKey - 0.5;
          }
          if (i === hOct) {
            highY = highestKey + 1.5;
          }
          const yPos = y((lowY + highY) / 2 - 0.5) + tog;
          this.addText({ x: -45, y: yPos, text: i, el: gS })
          const h_ = y(lowY) - y(highY);
          const y_ = y(highY - 0.5) + tog;
          this.addRect({ x: -60, y: y_, w: 30, h: h_, stroke: 'black', el: gS })
          const lY_ = y(lowY - 0.5) + tog;
          this.addLine({ x1: -30, y1: lY_, x2: width, y2: lY_, el: gS })
          if (i === hOct) {
            this.addLine({ x1: -30, y1: y_, x2: width, y2: y_, el: gS })
          }
          this.addLine({ x1: width, y1: lY_, x2: width, y2: y_, el: gS })
          this.addLine({ x1: -60, y1: tog-60, x2: width, y2: tog-60, el: gS })
          this.addLine({ x1: -60, y1: tog-40, x2: width, y2: tog-40, el: gS })
          this.addLine({ x1: -60, y1: tog-20, x2: width, y2: tog-20, el: gS })
          this.addLine({ x1: -60, y1: -80, x2: width, y2: -80, el: gS })
          this.addLine({ x1: -60, y1: -140, x2: width, y2: -140, el: gS })
          this.addLine({ x1: -60, y1: 0, x2: -60, y2: -140, el: gS })
          this.addLine({ x1: 0, y1: 0, x2: 0, y2: -80, el: gS })
          this.addLine({ x1: width, y1: 0, x2: width, y2: -140, el: gS })
          this.addLine({ x1: -60, y1: -110, x2: width, y2: -110, el: gS })
          durs.forEach((dur, dIdx) => {
            const sIdx = durIdxs[dIdx];
            const sCats = this.piece!.sectionCategorization[sIdx];
            const secPhrases = this.piece!.sections[sIdx].phrases;
            if (secPhrases.length > 0) {  
              const st = secPhrases[0].startTime!;
              const lastPhrase = secPhrases[secPhrases.length - 1];
              const et = lastPhrase.startTime! + lastPhrase.durTot!;
              const x_ = widthPerSeg * (dIdx + 0.5);
              this.addText({ 
                x: x_, 
                y: -50 + tog, 
                text: displayTime(st), 
                el: gS 
              });
              this.addText({ x: x_, y: -70 + tog, text: sIdx + 1, el: gS })
              this.addText({ 
                x: x_, 
                y: -30 + tog, 
                text: displayTime(et - st), 
                el: gS 
              });
              this.addText({ 
                x: x_, 
                y: -10 + tog, 
                text: sCats['Top Level'], 
                el: gS 
              })
              if (dIdx !== durs.length - 1) {
                const x_ = widthPerSeg * (dIdx + 1)
                this.addLine({ 
                  x1: x_, 
                  y1: tog, 
                  x2: x_, 
                  y2: 0, 
                  stroke: '#D3D3D3',
                  el: gS 
                })
              }  
            }    

          })
           
        }

      

     
    },

    generatePhraseGraph() {
      d3.select('.axisSVG').remove();
      d3.select('.gS').remove();
      let segments = this.piece.phraseGrid[this.instIdx].map(p => {
        return p.trajectories
      });
      const func = this.pitchRepresentation === 'Fixed Pitch' ?
        durationsOfFixedPitches :
        durationsOfPitchOnsets;
      const durIdxs: number[] = [];
      let phraseTypeHeight = 1, elabHeight = 1, artHeight = 1, incHeight = 1; 
      const durs = segments.map(seg => {
        if (seg.length === 0) {
          return undefined
        } else {
          return func(seg, {
            countType: 'proportional',
            outputType: this.pitchChroma ? 'chroma' : 'pitchNumber',
            maxSilence: this.fadeTime
          })
        }
      }).filter((seg, pIdx) => {
        let bool1 = false;
        if (seg !== undefined) {
          bool1 = true
        }
        let bool2 = false; //part of section that is not allowed to be shown
        this.secTopLevels.forEach(sec => {
          const sIdx = this.piece.sIdxFromPIdx(pIdx, this.instIdx);
          const section = this.piece.sectionsGrid[this.instIdx][sIdx];
          const sCat = section.categorization;
          if (sec.name === sCat['Top Level'] && sec['bool'] === true) {
            bool2 = true;
          }
        });
        
        const phrase = this.piece.phraseGrid[this.instIdx][pIdx];
        const pCat = phrase.categorizationGrid[0];

        // check if phrase type is allowed
        let ptBool = false; // phrase type bool
        const ptKeys = Object.keys(pCat.Phrase) as (keyof typeof pCat.Phrase)[];
        const thesePhraseTypes = ptKeys.filter(pt => {
          return pCat.Phrase[pt] === true;
        });
        const newPhraseTypeHeight = thesePhraseTypes.length > 1 ? 
          thesePhraseTypes.length : 
          1;
        if (newPhraseTypeHeight > phraseTypeHeight) {
          phraseTypeHeight = newPhraseTypeHeight;
        }
        const selectedPhraseTypes = this.phraseInfo.phraseTypes.filter(pt => {
          return pt.bool === true;
        });
        if (thesePhraseTypes.length === 0) {
          ptBool = true;
        } else if (this.diffs['phraseTypeDiff'] === 'include') {
          selectedPhraseTypes.forEach(pt => {
            if (thesePhraseTypes.includes(pt.name)) {
              ptBool = true;
            }
          })
        } else if (this.diffs['phraseTypeDiff'] === 'exclude') {
          ptBool = true;
          selectedPhraseTypes.forEach(pt => {
            if (thesePhraseTypes.includes(pt.name)) {
              ptBool = false;
            }
          })
        }

        // check if elaboration is allowed
        let elabBool = false;
        const elabKeys = Object.keys(pCat.Elaboration) as 
          (keyof typeof pCat.Elaboration)[];
        const theseElabs = elabKeys.filter(elab => {
          return pCat.Elaboration[elab] === true;
        });
        const newElabHeight = theseElabs.length > 1 ? theseElabs.length : 1;
        if (newElabHeight > elabHeight) {
          elabHeight = newElabHeight;
        }
        const selectedElabs = this.phraseInfo.elaborations.filter(elab => {
          return elab.bool === true;
        });
        if (theseElabs.length === 0) {
          elabBool = true;
        } else if (this.diffs['elaborationDiff'] === 'include') {
          selectedElabs.forEach(elab => {
            if (theseElabs.includes(elab.name)) {
              elabBool = true;
            }
          })
        } else if (this.diffs['elaborationDiff'] === 'exclude') {
          elabBool = true;
          selectedElabs.forEach(elab => {
            if (theseElabs.includes(elab.name)) {
              elabBool = false;
            }
          })
        }

        // if vocal, check if vocal articulation is allowed, else check if 
        // instrumental articulation is allowed
        let artBool = false;
        const inst = this.piece.instrumentation[this.instIdx];
        const vox = [Instrument.Vocal_M, Instrument.Vocal_F];
        if (vox.includes(inst)) {
          const artKeys = Object.keys(pCat['Vocal Articulation']) as 
            (keyof typeof pCat['Vocal Articulation'])[];
          const theseArts = artKeys.filter(art => {
            return pCat['Vocal Articulation'][art] === true;
          });
          const newArtHeight = theseArts.length > 1 ? theseArts.length : 1;
          if (newArtHeight > artHeight) {
            artHeight = newArtHeight;
          }
          const selArts = this.phraseInfo.vocalArticulations.filter(art => {
            return art.bool === true;
          });
          if (theseArts.length === 0) {
            artBool = true;
          } else if (this.diffs['articulationDiff'] === 'include') {
            selArts.forEach(art => {
              if (theseArts.includes(art.name)) {
                artBool = true;
              }
            })
          } else if (this.diffs['articulationDiff'] === 'exclude') {
            artBool = true;
            selArts.forEach(art => {
              if (theseArts.includes(art.name)) {
                artBool = false;
              }
            })
          }
        } else {
          const artKeys = Object.keys(pCat['Instrumental Articulation']) as 
            (keyof typeof pCat['Instrumental Articulation'])[];
          const theseArts = artKeys.filter(art => {
            return pCat['Instrumental Articulation'][art] === true;
          });
          artHeight = theseArts.length > 1 ? theseArts.length : 1;
          const selArts = this.phraseInfo.instArticulations.filter(art => {
            return art.bool === true;
          });
          if (theseArts.length === 0) {
            artBool = true;
          } else if (this.diffs['articulationDiff'] === 'include') {
            selArts.forEach(art => {
              if (theseArts.includes(art.name)) {
                artBool = true;
              }
            })
          } else if (this.diffs['articulationDiff'] === 'exclude') {
            artBool = true;
            selArts.forEach(art => {
              if (theseArts.includes(art.name)) {
                artBool = false;
              }
            })
          }
        }

        // check if incidental is allowed
        let incBool = false;
        const incKeys = Object.keys(pCat.Incidental) as 
          (keyof typeof pCat.Incidental)[];
        const theseIncs = incKeys.filter(inc => {
          return pCat.Incidental[inc] === true;
        });
        const newIncHeight = theseIncs.length > 1 ? theseIncs.length : 1;
        if (newIncHeight > incHeight) {
          incHeight = newIncHeight;
        }
        const selectedIncs = this.phraseInfo.incidentals.filter(inc => {
          return inc.bool === true;
        });
        if (theseIncs.length === 0) {
          incBool = true;
        } else if (this.diffs['incidentalDiff'] === 'include') {
          selectedIncs.forEach(inc => {
            if (theseIncs.includes(inc.name)) {
              incBool = true;
            }
          })
        } else if (this.diffs['incidentalDiff'] === 'exclude') {
          incBool = true;
          selectedIncs.forEach(inc => {
            if (theseIncs.includes(inc.name)) {
              incBool = false;
            }
          })
        }
        if (bool1 && bool2 && ptBool && elabBool && artBool && incBool) {
          durIdxs.push(pIdx);
          return true;
        } else {
          return false;
        }
      });
      let lowestKey: number = 10000, highestKey: number = -10000;
      durs.forEach(dur => {
        if (dur === undefined) {
          throw new Error('dur is undefined');
        }
        const keys = Object.keys(dur);
        keys.forEach(key => {
          if (Number(key) < lowestKey) {
            lowestKey = Number(key);
          }
          if (Number(key) > highestKey) {
            highestKey = Number(key);
          }
        })
      });
      if (this.condensed) {
        lowestKey = this.piece.raga.pitchNumberToScaleNumber(lowestKey);
        highestKey = this.piece.raga.pitchNumberToScaleNumber(highestKey);
      }
      let totalWidth = 0.9 * window.innerWidth;
      const pnLen = this.piece.raga.getPitchNumbers(0, 11).length;
      const ppOct = this.condensed ? pnLen: 12;
      const lkOct = Math.floor(lowestKey / ppOct);
      const hOct = Math.floor(highestKey / ppOct);
      this.xAxisHeight = 70;
      this.yAxisWidth = 70.5;
      const sumHeights = phraseTypeHeight + elabHeight + artHeight + incHeight;
      this.topOfGraph = 100 + 20 * sumHeights;
      const tog = this.topOfGraph;
      this.graphHeight = this.height - this.xAxisHeight - tog - this.margin * 2;
      const axisHolder = this.$refs.axisHolder as HTMLElement;

      const axisSVG = d3.select(axisHolder)
        .append('svg')
        .classed('axisSVG', true)
        .attr('width', 0.9 * window.innerWidth - this.margin * 2 + 1)
        .attr('height', this.height - this.margin * 2)
        .style('background-color', 'white');
      
      let y = d3.scaleLinear()
        .domain([lowestKey - 1, highestKey + 1])
        .range([this.graphHeight, 0]);
      const yAxisNode = axisSVG.append('g');
      const pitchNumbers = this.condensed ? 
        [...Array(1 + highestKey - lowestKey)].map((_, i) => i + lowestKey) :
        this.piece.raga.getPitchNumbers(lowestKey, highestKey);
      const tickLabels = this.condensed ?
        pitchNumbers.map(sn => {
          return this.piece.raga.scaleNumberToSargamLetter(sn);
        }) :
        pitchNumbers.map(pn => {
          return this.piece.raga.pitchNumberToSargamLetter(pn);
        });
      const yVal = this.xAxisHeight + this.topOfGraph;
      const xVal = this.yAxisWidth;
      yAxisNode.call(d3.axisLeft(y)
          .tickValues(pitchNumbers)
          .tickFormat((d, i) => tickLabels[i] || '')
          .tickSize(0)
          .tickPadding(15))
        .style('color', 'black')
        .style('font-weight', 'normal')
        .attr('transform', `translate(${xVal}, ${yVal})`);
      
      // horizontal line above sargam
      this.addLine({
        x1: this.yAxisWidth - 35,
        x2: this.yAxisWidth,
        y1: this.xAxisHeight + this.topOfGraph,
        y2: this.xAxisHeight + this.topOfGraph,
        stroke: 'black',
        el: axisSVG
      });
      const aboveAxLines: { num: number, height: number, text: string }[] = [];
      aboveAxLines.push({ 
        num: incHeight * 20, 
        height: incHeight * 20, 
        text: 'Incidental' 
      });
      aboveAxLines.push({
        num: aboveAxLines[0].num + artHeight * 20,
        height: artHeight * 20,
        text: 'Articulation'
      })
      aboveAxLines.push({
        num: aboveAxLines[1].num + elabHeight * 20,
        height: elabHeight * 20,
        text: 'Elaboration'
      })
      aboveAxLines.push({
        num: aboveAxLines[2].num + phraseTypeHeight * 20,
        height: phraseTypeHeight * 20,
        text: 'Phrase Type'
      })
      aboveAxLines.push({
        num: aboveAxLines[3].num + 20,
        height: 20,
        text: 'Duration'
      })
      aboveAxLines.push({
        num: aboveAxLines[4].num + 20,
        height: 20,
        text: 'Start'
      })
      aboveAxLines.push({
        num: aboveAxLines[5].num + 20,
        height: 20,
        text: 'Phrase #'
      })
      aboveAxLines.push({
        num: aboveAxLines[6].num + 20,
        height: 20,
        text: 'Section'
      })
      aboveAxLines.push({
        num: aboveAxLines[7].num + 20,
        height: 20,
        text: 'Section #'
      })



      aboveAxLines.forEach((d, idx) => {
        const add = idx === 3 ? 1 : 0;
        this.addLine({
          x1: this.yAxisWidth - 70,
          x2: this.yAxisWidth + add,
          y1: this.xAxisHeight + this.topOfGraph - d.num,
          y2: this.xAxisHeight + this.topOfGraph - d.num,
          stroke: 'black',
          el: axisSVG
        })
        this.addText({
          x: this.yAxisWidth - 35,
          y: this.xAxisHeight + this.topOfGraph - d.num + d.height/2,
          text: d.text,
          el: axisSVG
        
        })
      })

      // vertical line top left
      this.addLine({
        x1: this.yAxisWidth - 70,
        x2: this.yAxisWidth - 70,
        y1: this.xAxisHeight + this.topOfGraph - (aboveAxLines[8].num + 60),
        y2: this.xAxisHeight + this.topOfGraph,
        stroke: 'black',
        el: axisSVG
      });
      this.addLine({
        x1: this.yAxisWidth,
        x2: this.yAxisWidth,
        y1: this.xAxisHeight,
        y2: this.xAxisHeight + this.topOfGraph,
        stroke: 'black',
        el: axisSVG
      });
      const wideLines = [
        { num: aboveAxLines[8].num + 30, text: this.piece.title },
        { 
          num: aboveAxLines[8].num + 60, 
          text: 'Pitch Range and Percentage of Duration on each \
                 Fixed Pitch, Segmented by Phrase' 
        }
      ];
      wideLines.forEach(wl => {
        this.addLine({
          x1: this.yAxisWidth - 70,
          x2: this.yAxisWidth - 70 + totalWidth,
          y1: this.xAxisHeight + this.topOfGraph - wl.num,
          y2: this.xAxisHeight + this.topOfGraph - wl.num,
          stroke: 'black',
          el: axisSVG,
          class_: 'wideLine'
        });
        this.addText({
          x: this.yAxisWidth - 70 + totalWidth / 2,
          y: this.xAxisHeight + this.topOfGraph - wl.num + 15,
          text: wl.text,
          el: axisSVG,
          fSize: '14px',
          fWeight: 'bold',
          class_: 'titleText'
        })
      })
      // top right vertical line
      this.addLine({
        x1: totalWidth - this.margin * 2 + 0.5,
        x2: totalWidth - this.margin * 2 + 0.5,
        y1: this.margin,
        y2: this.xAxisHeight,
        stroke: 'black',
        el: axisSVG,
        class_: 'topRightVertical'
      })
      for (let i = lkOct; i <= hOct; i++) {
        let lowY = i * ppOct;
        let highY = (i + 1) * ppOct;
        if (i === lkOct) {
          lowY = lowestKey - 0.5;
        }
        if (i === hOct) {
          highY = highestKey + 1.5;
        }
        this.addText({ 
          x: this.yAxisWidth - 50, 
          y: this.xAxisHeight + this.topOfGraph + y((lowY + highY) / 2 - 0.5), 
          text: i, 
          el: axisSVG 
        })
        const h_ = y(lowY) - y(highY);
        const y_ = y(highY - 0.5);
        const add = i === lkOct ? - 0.5 : 0;
        this.addRect({
          x: this.yAxisWidth - 70,
          y: this.xAxisHeight + this.topOfGraph + y_,
          w: 35,
          h: h_ + add,
          stroke: 'black',
          el: axisSVG
        });
        const lY_ = y(lowY - 0.5);
        this.addLine({ 
          x1: this.yAxisWidth - 35,
          y1: lY_ + this.xAxisHeight + add + this.topOfGraph,
          x2: this.yAxisWidth - add * 2,
          y2: lY_ + this.xAxisHeight + add + this.topOfGraph,
          stroke: 'black',
          el: axisSVG
        })
      };

      const widthPerSeg = 80;
      const width = widthPerSeg * durs.length;

      const gS = d3.select('.scrollingGraphHolder')
        .append('svg')
        .attr('width', width)
        .attr('height', this.graphHeight + this.topOfGraph - 1.5)
        .style('background-color', 'white')
        .attr('transform', `translate(-0.5, 0)`)
        .classed('gS', true);
      
      const phraseRects = [...Array(durs.length)];
      if (this.condensed) {
        durs.forEach(dur => {
          if (dur === undefined) {
            throw new Error('dur is undefined');
          }
          const keys = Object.keys(dur);
          keys.forEach(key => {
            const sn = this.piece.raga.pitchNumberToScaleNumber(Number(key));
            dur[sn] = dur[key];
            if (Number(key) !== Number(sn)) delete dur[key];
          })
        })
      }
      durs.forEach((dur, dIdx) => {
        let minVal: (number | undefined) = undefined; 
        let maxVal: (number | undefined) = undefined;
        let modeIdx: number | undefined = undefined; 
        let modeVal = 0;
        if (dur === undefined) {
          throw new Error('dur is undefined');
        }
        const keys = Object.keys(dur);
        if (keys.length > 0) {
          keys.forEach(key => {
            if (key !== 'sIdx') {
              if (minVal === undefined) {
                minVal = Number(key);
              }
              if (maxVal === undefined) {
                maxVal = Number(key);
              }
              if (Number(key) < minVal) {
                minVal = Number(key);
              }
              if (Number(key) > maxVal) {
                maxVal = Number(key);
              }
              if (Number(dur[key]) > modeVal) {
                modeVal = Number(dur[key]);
                modeIdx = Number(key);
              }
            }
          })
          if (maxVal === undefined) {
            throw new Error('maxVal is undefined');
          }
          if (minVal === undefined) {
            throw new Error('minVal is undefined');
          }
          maxVal = maxVal + 0.5;
          minVal = minVal - 0.5;  
          const x_ = dIdx * width / durs.length;
          const y_ = y(maxVal) + this.topOfGraph;
          const w_ = width / durs.length;
          const h_ = y(minVal) - y(maxVal);
          if ((!this.pitchChroma) && (!this.heatmap)) {
            phraseRects[dIdx] = this.addRect({
              x: x_,
              y: y_,
              w: w_,
              h: h_,
              fill: this.heatmap ? 'none' : '#D3D3D3',
              el: gS
            })
          }
          keys.forEach(key => {
            let fillColor = 'black';
            const mY_ = y(Number(key)+0.5) + this.topOfGraph;
            const mH_ = y(Number(key)-0.5) - y(Number(key)+0.5);
            if (this.heatmap) {
              fillColor = this.getHeatmapColor(dur[key]);
              this.addRect({ 
                x: x_, 
                y: mY_, 
                w: w_, 
                h: mH_, 
                fill: fillColor,
                el: gS
              });
              this.addText({ 
                x: x_ + width / (2 * durs.length), 
                y: y(Number(key)) + this.topOfGraph, 
                text: (100*dur[key]).toFixed(0)+'%',
                fill: dur[key] > 0.5 ? 'white' : 'black',
                el: gS
              })
            } else {
              if (Number(key) === modeIdx) {
                fillColor = 'white'
                this.addRect({ 
                  x: x_, 
                  y: mY_, 
                  w: w_, 
                  h: mH_, 
                  fill: 'grey',
                  el: gS 
                })
              } else if (this.pitchChroma) {
                this.addRect({ 
                  x: x_, 
                  y: mY_, 
                  w: w_, 
                  h: mH_, 
                  fill: '#D3D3D3',
                  el: gS
                })
              }
              this.addText({ 
                x: x_ + width / (2 * durs.length), 
                y: y(Number(key)) + this.topOfGraph, 
                text: (100*dur[key]).toFixed(0)+'%', 
                fill: fillColor,
                el: gS
              })
            }
          })
          if ((!this.pitchChroma) && (this.heatmap)) {
            phraseRects[dIdx] = this.addRect({
              x: x_,
              y: y_,
              w: w_,
              h: h_,
              fill: this.heatmap ? 'none' : '#D3D3D3',
              el: gS
            })
          }
        }
      })
      phraseRects.forEach(rect => {
        rect?.attr('stroke', 'black')
      });
      for (let i = lkOct; i <= hOct; i++) {
        let lowY = i * ppOct;
        let highY = (i+1) * ppOct;
        if (i === lkOct) {
          lowY = lowestKey - 0.5;
        }
        if (i === hOct) {
          highY = highestKey + 1.5;
        }
        const yPos = y((lowY + highY) / 2 - 0.5) + this.topOfGraph;
        this.addText({ x: -45, y: yPos, text: i, el: gS })
        const h_ = y(lowY) - y(highY);
        const y_ = y(highY - 0.5) + this.topOfGraph;
        this.addRect({ x: -60, y: y_, w: 30, h: h_, stroke: 'black', el: gS })
        const lY_ = y(lowY - 0.5) + this.topOfGraph;
        this.addLine({ x1: -30, y1: lY_, x2: width, y2: lY_, el: gS })
        if (i === hOct) {
          this.addLine({ x1: -30, y1: y_, x2: width, y2: y_, el: gS })
        }
        this.addLine({ x1: width, y1: lY_, x2: width, y2: y_, el: gS })
        const lNums: number[] = [];
        lNums.push(incHeight * -20);
        lNums.push(lNums[0] + artHeight * -20);
        lNums.push(lNums[1] + elabHeight * -20);
        lNums.push(lNums[2] + phraseTypeHeight * -20);
        lNums.push(lNums[3] - 20, lNums[3] - 40, lNums[3] - 60, lNums[3] - 80)
        lNums.forEach(n => {
          this.addLine({ 
            x1: -60, 
            y1: n + this.topOfGraph, 
            x2: width, 
            y2: n + this.topOfGraph, 
            el: gS 
          })
        })
        let currentSIdx = this.piece.sIdxFromPIdx(durIdxs[0], this.instIdx);
        let csidxTrig = true;
        durs.forEach((dur, dIdx) => {
          const pIdx = durIdxs[dIdx];
          const phrase = this.piece.phraseGrid[this.instIdx][pIdx];
          const pCat = phrase.categorizationGrid[0];
          const pStart = phrase.startTime!;
          const pDur = phrase.durTot!;
          const pTypes = (Object.keys(pCat.Phrase) as 
            (keyof typeof pCat.Phrase)[]
            ).filter(pt => {
              return pCat.Phrase[pt] === true;
            });
          const pElabs = (Object.keys(pCat.Elaboration) as
            (keyof typeof pCat.Elaboration)[]
            ).filter(elab => {
              return pCat.Elaboration[elab] === true;
            });
          const vox = [Instrument.Vocal_M, Instrument.Vocal_F];
          const inst = this.piece.instrumentation[this.instIdx];
          const pArts = vox.includes(inst) ?
            (Object.keys(pCat['Vocal Articulation']) as
              (keyof typeof pCat['Vocal Articulation'])[]
              ).filter(art => {
                return pCat['Vocal Articulation'][art] === true;
              }) :
            (Object.keys(pCat['Instrumental Articulation']) as
              (keyof typeof pCat['Instrumental Articulation'])[]
              ).filter(art => {
                return pCat['Instrumental Articulation'][art] === true;
              });
          const pIncs = (Object.keys(pCat.Incidental) as
            (keyof typeof pCat.Incidental)[]
            ).filter(inc => {
              
              return pCat.Incidental[inc] === true;
            });
          const x_ = widthPerSeg * (dIdx + 0.5);
          pIncs.forEach((pInc, pIncIdx) => {
            const y_ = -20 * (incHeight - pIncIdx) + this.topOfGraph + 10;
            this.addText({ 
              x: x_, 
              y: y_, 
              text: pInc, 
              el: gS 
            })
          });
          pArts.forEach((pArt, pArtIdx) => {
            const sumH = incHeight + artHeight;
            const y_ = -20 * (sumH - pArtIdx) + this.topOfGraph + 10;
            this.addText({ 
              x: x_, 
              y: y_, 
              text: pArt, 
              el: gS 
            })
          });
          pElabs.forEach((pElab, pElabIdx) => {
            const sumH = incHeight + artHeight + elabHeight;
            const y_ = -20 * (sumH - pElabIdx) + this.topOfGraph + 10;
            this.addText({ 
              x: x_, 
              y: y_, 
              text: pElab, 
              el: gS 
            })
          });
          pTypes.forEach((pType, pTypeIdx) => {
            const sumH = incHeight + artHeight + elabHeight + phraseTypeHeight;
            const y_ = -20 * (sumH - pTypeIdx) + this.topOfGraph + 10;
            this.addText({ 
              x: x_, 
              y: y_, 
              text: pType, 
              el: gS 
            })
          });

          // add duration
          const summedH = incHeight + artHeight + elabHeight + phraseTypeHeight;
          const y_ = -20 * (summedH + 1) + this.topOfGraph + 10;
          this.addText({ 
            x: x_, 
            y: y_, 
            text: displayTime(pDur), 
            el: gS 
          })

          // add start time
          const st_y = -20 * (summedH + 2) + this.topOfGraph + 10;
          this.addText({ 
            x: x_, 
            y: st_y, 
            text: displayTime(pStart), 
            el: gS 
          })

          // add phrase #
          const pNum_y = -20 * (summedH + 3) + this.topOfGraph + 10;
          this.addText({ 
            x: x_, 
            y: pNum_y, 
            text: pIdx + 1, 
            el: gS 
          })
          
          const sIdx = this.piece.sIdxFromPIdx(pIdx, this.instIdx);
          
          if (sIdx !== currentSIdx) {
            // draw vertical line at left
            currentSIdx = sIdx;
            
            // const s_y = -20 * (summedH + 3) + this.topOfGraph;
            const x_ = widthPerSeg * dIdx;
            this.addLine({ 
              x1: x_, 
              y1: this.topOfGraph - 20 * (summedH + 5), 
              x2: x_, 
              y2: this.topOfGraph + this.graphHeight,
              stroke: 'black', 
              el: gS 
            })
            const sIdxOfEachDurIdx = durIdxs.map(pIdx => {
              return this.piece.sIdxFromPIdx(pIdx, this.instIdx);
            });
            const size = sIdxOfEachDurIdx.filter(sIdx_ => {
              return sIdx_ === sIdx;
            }).length;
            if (csidxTrig) {
              const prevDIdx = dIdx - 1;
              const prevPIdx = durIdxs[prevDIdx];
              const pSIdx = this.piece.sIdxFromPIdx(prevPIdx, this.instIdx);
              const prev_size = sIdxOfEachDurIdx.filter(sIdx_ => {
                return sIdx_ === pSIdx;
              }).length;
              const prev_x = widthPerSeg * prev_size / 2;
              const prev_y = -20 * (summedH + 5) + this.topOfGraph + 10;
              this.addText({ 
                x: prev_x, 
                y: prev_y, 
                text: pSIdx + 1, 
                el: gS 
              });
              //add section type
              let psTxt = this.piece.sectionCatGrid[this.instIdx][pSIdx]['Top Level'];
              this.addText({ 
                x: prev_x, 
                y: prev_y + 20, 
                text: psTxt, 
                el: gS 
              });
              csidxTrig = false;
            }
            const sNum_y = -20 * (summedH + 5) + this.topOfGraph + 10;
            this.addText({ 
              x: x_ + widthPerSeg * size / 2, 
              y: sNum_y, 
              text: sIdx + 1, 
              el: gS 
            });
            // add section type
            const secType = this.piece.sectionCatGrid[this.instIdx][sIdx]['Top Level'];
            this.addText({ 
              x: x_ + widthPerSeg * size / 2, 
              y: sNum_y + 20, 
              text: secType, 
              el: gS 
            });

          }
          // grey vertical lines between each phrase
          if (dIdx !== durs.length - 1) {
            const x_ = widthPerSeg * (dIdx + 1);
            this.addLine({ 
              x1: x_, 
              y1: this.topOfGraph - 20 * (summedH + 3), 
              x2: x_, 
              y2: this.topOfGraph,
              stroke: 'grey', 
              el: gS 
            })
          }
        })
      }
    },

    generateDurationGraph() {
      this.topOfGraph = 20;
      const tog = this.topOfGraph;
      d3.select('.axisSVG').remove();
      d3.select('.gS').remove();
      let segments = segmentByDuration(this.piece, { duration: this.duration });
      const func = this.pitchRepresentation === 'Fixed Pitch' ?
        durationsOfFixedPitches :
        durationsOfPitchOnsets ;
      const durs = segments.map(seg => func(seg, {
        countType: 'proportional',
        outputType: this.pitchChroma ? 'chroma' : 'pitchNumber',
        maxSilence: this.fadeTime,
      }));
      let lowestKey: number = 10000, highestKey: number = -10000;
      durs.forEach(dur => {
        if (dur === undefined) {
          throw new Error('dur is undefined');
        }
        const keys = Object.keys(dur);
        keys.forEach(key => {
          if (Number(key) < lowestKey) {
            lowestKey = Number(key);
          }
          if (Number(key) > highestKey) {
            highestKey = Number(key);
          }
        })
      });
      if (this.condensed) {
        lowestKey = this.piece.raga.pitchNumberToScaleNumber(lowestKey);
        highestKey = this.piece.raga.pitchNumberToScaleNumber(highestKey);
      }
      let totalWidth = 0.9 * window.innerWidth;
      const pnLen = this.piece.raga.getPitchNumbers(0, 11).length;
      const ppOct = this.condensed ? pnLen: 12;
      const lkOct = Math.floor(lowestKey / ppOct);
      const hOct = Math.floor(highestKey / ppOct);
      this.xAxisHeight = 70;
      this.yAxisWidth = 70.5;

      this.graphHeight = this.height - this.xAxisHeight - tog - this.margin * 2;
      const axisHolder = this.$refs.axisHolder as HTMLElement;
      
      const axisSVG = d3.select(axisHolder)
        .append('svg')
        .classed('axisSVG', true)
        .attr('width', 0.9 * window.innerWidth - this.margin * 2 + 1)
        .attr('height', this.height - this.margin * 2)
        .style('background-color', 'white');

      let y = d3.scaleLinear()
        .domain([lowestKey - 1, highestKey + 1])
        .range([this.graphHeight, 0]);
      const yAxisNode = axisSVG.append('g');
      const pitchNumbers = this.condensed ? 
        [...Array(1 + highestKey - lowestKey)].map((_, i) => i + lowestKey) :
        this.piece.raga.getPitchNumbers(lowestKey, highestKey);
      const tickLabels = this.condensed ? 
        pitchNumbers.map(sn => {
          return this.piece.raga.scaleNumberToSargamLetter(sn);
        }) :
        pitchNumbers.map(pn => {
          return this.piece.raga.pitchNumberToSargamLetter(pn);
        });
      const yVal = this.xAxisHeight + tog;
      const xVal = this.yAxisWidth;
      yAxisNode.call(d3.axisLeft(y)
          .tickValues(pitchNumbers)
          .tickFormat((d, i) => tickLabels[i] || '')
          .tickSize(0)
          .tickPadding(15))
        .style('color', 'black')
        .style('font-weight', 'normal')
        .attr('transform', `translate(${ xVal }, ${ yVal })`);
      
      // horizontal line above sargam
      this.addLine({
        x1: this.yAxisWidth - 35,
        x2: this.yAxisWidth,
        y1: this.xAxisHeight + this.topOfGraph,
        y2: this.xAxisHeight + this.topOfGraph,
        stroke: 'black',
        el: axisSVG
      });

      const aboveAxLines = [
        { num: 20, text: 'start' }
      ];
      aboveAxLines.forEach((d, idx) => {
        const add = idx === 3 ? 1 : 0;
        this.addLine({
          x1: this.yAxisWidth - 70,
          x2: this.yAxisWidth + 1,
          y1: this.xAxisHeight + this.topOfGraph - d.num,
          y2: this.xAxisHeight + this.topOfGraph - d.num,
          stroke: 'black',
          el: axisSVG,
          class_: 'wideLine'
        });
        this.addText({
          x: this.yAxisWidth - 35,
          y: this.xAxisHeight + this.topOfGraph - d.num + 10,
          text: d.text,
          el: axisSVG,
          class_: 'titleText'
        })   
      });
      // vertical line top left
      this.addLine({
        x1: this.yAxisWidth - 70,
        x2: this.yAxisWidth - 70,
        y1: this.xAxisHeight + this.topOfGraph - (aboveAxLines[0].num + 60),
        y2: this.xAxisHeight + this.topOfGraph,
        stroke: 'black',
        el: axisSVG
      });
      this.addLine({
        x1: this.yAxisWidth,
        x2: this.yAxisWidth,
        y1: this.xAxisHeight,
        y2: this.xAxisHeight + this.topOfGraph,
        stroke: 'black',
        el: axisSVG
      });
      const wideLines = [
        { num: aboveAxLines[0].num + 30, text: this.piece.title },
        { 
          num: aboveAxLines[0].num + 60, 
          text: `Pitch Range and Percentage of Duration on each ` + 
              `Fixed Pitch, Segmented into ${this.duration}s Windows` }
      ];
      wideLines.forEach(wl => {
        this.addLine({
          x1: this.yAxisWidth - 70,
          x2: this.yAxisWidth - 70 + totalWidth,
          y1: this.xAxisHeight + this.topOfGraph - wl.num,
          y2: this.xAxisHeight + this.topOfGraph - wl.num,
          stroke: 'black',
          el: axisSVG,
          class_: 'wideLine'
        });
        this.addText({
          x: this.yAxisWidth - 70 + totalWidth / 2,
          y: this.xAxisHeight + this.topOfGraph - wl.num + 15,
          text: wl.text,
          el: axisSVG,
          fSize: '14px',
          fWeight: 'bold',
          class_: 'titleText'
        })
      });
      // top right vertical line
      this.addLine({
        x1: totalWidth - this.margin * 2 + 0.5,
        x2: totalWidth - this.margin * 2 + 0.5,
        y1: this.margin,
        y2: this.xAxisHeight,
        stroke: 'black',
        el: axisSVG,
        class_: 'topRightVertical'
      });
      for (let i = lkOct; i <= hOct; i++) {
        let lowY = i * ppOct;
        let highY = (i + 1) * ppOct;
        if (i === lkOct) {
          lowY = lowestKey - 0.5;
        }
        if (i === hOct) {
          highY = highestKey + 1.5;
        }
        this.addText({ 
          x: this.yAxisWidth - 50, 
          y: this.xAxisHeight + this.topOfGraph + y((lowY + highY) / 2 - 0.5), 
          text: i, 
          el: axisSVG 
        })
        const h_ = y(lowY) - y(highY);
        const y_ = y(highY - 0.5);
        const add = i === lkOct ? - 0.5 : 0;
        this.addRect({
          x: this.yAxisWidth - 70,
          y: this.xAxisHeight + this.topOfGraph + y_,
          w: 35,
          h: h_ + add,
          stroke: 'black',
          el: axisSVG
        });
        const lY_ = y(lowY - 0.5);
        this.addLine({ 
          x1: this.yAxisWidth - 35,
          y1: lY_ + this.xAxisHeight + add + this.topOfGraph,
          x2: this.yAxisWidth - add * 2,
          y2: lY_ + this.xAxisHeight + add + this.topOfGraph,
          stroke: 'black',
          el: axisSVG
        })
      };
      const widthPerSeg = 80;
      const width = widthPerSeg * durs.length;
      const gS = d3.select('.scrollingGraphHolder')
        .append('svg')
        .attr('width', width)
        .attr('height', this.graphHeight + this.topOfGraph - 1.5)
        .style('background-color', 'white')
        .attr('transform', `translate(-0.5, 0)`)
        .classed('gS', true);
      
      const rects = [...Array(durs.length)];
      if (this.condensed) {
        durs.forEach(dur => {
          if (dur === undefined) {
            throw new Error('dur is undefined');
          }
          const keys = Object.keys(dur);
          keys.forEach(key => {
            const sn = this.piece.raga.pitchNumberToScaleNumber(Number(key));
            dur[sn] = dur[key];
            if (Number(key) !== Number(sn)) delete dur[key];
          })
        })
      };
      durs.forEach((dur, dIdx) => {
        let minVal: (number | undefined) = undefined; 
        let maxVal: (number | undefined) = undefined;
        let modeIdx: number | undefined = undefined; 
        let modeVal = 0;
        if (dur === undefined) {
          throw new Error('dur is undefined');
        }
        const keys = Object.keys(dur);
        if (keys.length > 0) {
          keys.forEach(key => {
            if (key !== 'sIdx') {
              if (minVal === undefined) {
                minVal = Number(key);
              }
              if (maxVal === undefined) {
                maxVal = Number(key);
              }
              if (Number(key) < minVal) {
                minVal = Number(key);
              }
              if (Number(key) > maxVal) {
                maxVal = Number(key);
              }
              if (Number(dur[key]) > modeVal) {
                modeVal = Number(dur[key]);
                modeIdx = Number(key);
              }
            }
          })
          if (maxVal === undefined) {
            throw new Error('maxVal is undefined');
          }
          if (minVal === undefined) {
            throw new Error('minVal is undefined');
          }
          maxVal = maxVal + 0.5;
          minVal = minVal - 0.5;  
          const x_ = dIdx * width / durs.length;
          const y_ = y(maxVal) + this.topOfGraph;
          const w_ = width / durs.length;
          const h_ = y(minVal) - y(maxVal);
          if ((!this.pitchChroma) && (!this.heatmap)) {
            rects[dIdx] = this.addRect({
              x: x_,
              y: y_,
              w: w_,
              h: h_,
              fill: this.heatmap ? 'none' : '#D3D3D3',
              el: gS
            })
          }

          keys.forEach(key => {
            let fillColor = 'black';
            const mY_ = y(Number(key)+0.5) + this.topOfGraph;
            const mH_ = y(Number(key)-0.5) - y(Number(key)+0.5);
            if (this.heatmap) {
              fillColor = this.getHeatmapColor(dur[key]);
              this.addRect({ 
                x: x_, 
                y: mY_, 
                w: w_, 
                h: mH_, 
                fill: fillColor,
                el: gS
              });
              this.addText({ 
                x: x_ + width / (2 * durs.length), 
                y: y(Number(key)) + this.topOfGraph, 
                text: (100*dur[key]).toFixed(0)+'%',
                fill: dur[key] > 0.5 ? 'white' : 'black',
                el: gS
              })
            } else {
              if (Number(key) === modeIdx) {
                fillColor = 'white'
                this.addRect({ 
                  x: x_, 
                  y: mY_, 
                  w: w_, 
                  h: mH_, 
                  fill: 'grey',
                  el: gS 
                })
              } else if (this.pitchChroma) {
                this.addRect({ 
                  x: x_, 
                  y: mY_, 
                  w: w_, 
                  h: mH_, 
                  fill: '#D3D3D3',
                  el: gS
                })
              }
              this.addText({ 
                x: x_ + width / (2 * durs.length), 
                y: y(Number(key)) + this.topOfGraph, 
                text: (100*dur[key]).toFixed(0)+'%', 
                fill: fillColor,
                el: gS
              })
            }
          })
          if ((!this.pitchChroma) && (this.heatmap)) {
            rects[dIdx] = this.addRect({
              x: x_,
              y: y_,
              w: w_,
              h: h_,
              fill: this.heatmap ? 'none' : '#D3D3D3',
              el: gS
            })
          }
        }
      })
      rects.forEach(rect => {
        rect?.attr('stroke', 'black')
      });
      for (let i = lkOct; i<= hOct; i++) {
        let lowY = i * ppOct;
        let highY = (i+1) * ppOct;
        if (i === lkOct) {
          lowY = lowestKey - 0.5;
        }
        if (i === hOct) {
          highY = highestKey + 1.5;
        }
        const yPos = y((lowY + highY) / 2 - 0.5) + this.topOfGraph;
        this.addText({ x: -45, y: yPos, text: i, el: gS })
        const h_ = y(lowY) - y(highY);
        const y_ = y(highY - 0.5) + this.topOfGraph;
        this.addRect({ x: -60, y: y_, w: 30, h: h_, stroke: 'black', el: gS })
        const lY_ = y(lowY - 0.5) + this.topOfGraph;
        this.addLine({ x1: -30, y1: lY_, x2: width, y2: lY_, el: gS })
        if (i === hOct) {
          this.addLine({ x1: -30, y1: y_, x2: width, y2: y_, el: gS })
        }
        this.addLine({ x1: width, y1: lY_, x2: width, y2: y_, el: gS })
        durs.forEach((dur, dIdx) => {
          const startTime = dIdx * this.duration;
          this.addText({ 
            x: (dIdx + 0.5) * widthPerSeg, 
            y: -10 + this.topOfGraph, 
            text: displayTime(startTime), 
            el: gS 
          })
          if (dIdx !== durs.length - 1) {
            const x_ = (dIdx + 1) * widthPerSeg;
            this.addLine({ 
              x1: x_, 
              y1: this.topOfGraph, 
              x2: x_, 
              y2: 0, 
              stroke: '#D3D3D3', 
              el: gS 
            })
          }
        })
      }
    },

    getHeatmapColor(val: number) {
      const gradientArray = new Gradient()
        .setColorGradient('#ffffff', '#000000')
        .setMidpoint(100)
        .getColors();
      val = Math.floor(100 * val);
      if (val === 100) val = 99;
      return gradientArray[val]
    },

    addText({
      x = undefined,
      y = undefined,
      text = '',
      fSize = '12px',
      fWeight = 'normal',
      fill = 'black',
      anchor = 'middle',
      el = undefined,
      class_ = undefined
    }: {
      x?: number,
      y?: number,
      text?: string | number,
      fSize?: string,
      fWeight?: string,
      fill?: string,
      anchor?: string,
      el?: d3.Selection<SVGSVGElement, unknown, HTMLElement | null, any>,
      class_?: string
    } = {}) {
      if (x === undefined || y === undefined || text === undefined) {
        throw new Error('x, y, or text is undefined');
      }
      if (el === undefined) {
        throw new Error('el is undefined');
      }
      const txt = el.append('text')
        .attr('x', x)
        .attr('y', y)
        .text(text)
        .attr('font-size', fSize)
        .attr('font-weight', fWeight)
        .attr('fill', fill)
        .attr('text-anchor', anchor)
        .attr('alignment-baseline', 'middle')
      if (class_ !== undefined) {
        txt.classed(class_, true);
      }
    },

    addRect({
      x = undefined,
      y = undefined,
      w = undefined,
      h = undefined,
      fill = 'none',
      stroke = 'none',
      el = undefined
    }: {
      x?: number,
      y?: number,
      w?: number,
      h?: number,
      fill?: string,
      stroke?: string,
      el?: d3.Selection<SVGSVGElement, unknown, HTMLElement | null, any>
    } = {}) {
      if (
        x === undefined || 
        y === undefined || 
        w === undefined || 
        h === undefined
      ) {
        throw new Error('x, y, w, or h is undefined');
      }
      if (el === undefined) {
        throw new Error('el is undefined');
      }
      return el.append('rect')
        .attr('x', x)
        .attr('y', y)
        .attr('width', w)
        .attr('height', h)
        .attr('fill', fill)
        .attr('stroke', stroke)
    },

    addLine({
      x1 = undefined,
      y1 = undefined,
      x2 = undefined,
      y2 = undefined,
      stroke = 'black',
      el = undefined,
      class_ = undefined
    }: {
      x1?: number,
      y1?: number,
      x2?: number,
      y2?: number,
      stroke?: string,
      el?: d3.Selection<SVGSVGElement, unknown, HTMLElement | null, any>,
      class_?: string
    } = {}) {
      if (
        x1 === undefined || 
        y1 === undefined || 
        x2 === undefined || 
        y2 === undefined
      ) {
        throw new Error('x1, y1, x2, or y2 is undefined');
      }
      if (el === undefined) {
        throw new Error('el is undefined');
      }
      const line = el.append('line')
        .attr('x1', x1)
        .attr('y1', y1)
        .attr('x2', x2)
        .attr('y2', y2)
        .attr('stroke', stroke)
      if (class_ !== undefined) {
        line.classed(class_, true);
      }
      return line
    },

    resetWidth() {
      const totalWidth = 0.9 * window.innerWidth;
      d3.select('.axisSVG')
        .attr('width', totalWidth - this.margin * 2 + 2)
      d3.selectAll('.wideLine')
        .attr('x2', totalWidth - this.margin * 2 + 1)
      d3.selectAll('.titleText')
        .attr('x', totalWidth / 2)
      d3.select('.topRightVertical')
        .attr('x1', totalWidth - this.margin * 2 + 0.5)
        .attr('x2', totalWidth - this.margin * 2 + 0.5)
    } 
  },

  

})

</script>

<style scoped>

.outerHolder {
  width: 90vw;
  min-height: v-bind(height + 'px');
  background-color: white;
  position: relative;
}

.axisHolder {
  width: calc(100% - var(--margin) * 2);
  height: v-bind(height - 2 * margin + 'px');
  background-color: white;
  position: absolute;
  left: v-bind(margin + 'px');
  top: v-bind(margin + 'px');
}
.scrollingGraphHolder {
  width: calc(90vw - (var(--margin) * 2 + var(--yAxisWidth)) + 0.5px );
  height: v-bind(graphHeight + topOfGraph + 0.5 + 'px');
  background-color: #FAF9F6;
  position: absolute;
  left: v-bind(yAxisWidth + margin + 0.5 + 'px');
  top: v-bind(xAxisHeight + margin - 1 + 'px');
  overflow-x: scroll;
  overflow-y: hidden;
  border-top: 1px solid black;
  border-bottom: 1px solid black;
  border-right: 1px solid black;
  box-sizing: border-box;

}


</style>
