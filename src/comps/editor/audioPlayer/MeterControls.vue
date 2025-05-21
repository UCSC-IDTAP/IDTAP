<template>
<div class='outer'>
  <div class='controlsBox'>
    <div class='controlsRow'>
      <label class='big'>Hierarchical Depth</label>
      <select 
        v-model.number='numLayers' 
        @change='updateDepth'
        :disabled='!editable'
        >
        <option value='1'>1</option>
        <option value='2'>2</option>
        <option value='3'>3</option>
        <option value='4'>4</option>
      </select>
    </div>
    <div class='controlsRow' v-for='(n, i) in Number(numLayers)' :key='n'>
      <label>Layer {{ i }}</label>
      <div class='buttonCol' v-if='i === 0'>
        <button 
          :disabled='layerCompounds[i] === 4 || !editable' 
          @click='increaseCompounds(i)'
          >+</button>
        <button 
          :disabled='layerCompounds[i] === 1 || !editable'
          @click='decreaseCompounds(i)'
          >-</button>
      </div>
      <div class='buttonCol' v-else></div>
      <select 
        v-for='k, kIdx in layerCompounds[i]' 
        v-model.number='pulseDivisions[i][kIdx]'
        @change='updatePulseDivs(i, kIdx)'
        :disabled='!editable'
        >
        <option v-for='j in 8'>{{ j+1 }}</option>
      </select>
    </div>
  </div>
  <div class='controlsBox'>
    <div class='controlsRow'>
      <label>Tempo</label>
      <input 
        type='number' 
        min='20' 
        max='300' 
        step='1' 
        v-model='tempo'
        @input='updateTempo'
        :disabled='!editable'
        />
      <input 
        type='range' 
        min='0' 
        max='1' 
        step='0.001' 
        v-model='tempoSlider'
        @input='updateTempo'
        :disabled='!editable'
        />
    </div>
    <div class='controlsRow'>
      <label>Cycles</label>
      <input 
        type='number' 
        min='1' 
        max='1000' 
        step='1' 
        class='no-text-entry'
        v-model='cycles'
        @input='updateCycles'
        :disabled='!editable'
        />
    </div>
    <div class='controlsRow'>
      <label>Start</label>
      {{ getStartTime() }}
    </div>
    <div class='controlsRow'>
      <label>Duration</label>
      {{ getDuration() }}
    </div>
    <div class='controlsRow' v-if='insertPulseMode && prevMeter'>
    <label class='wide'>Attach to Prev Meter</label>
    <input 
      type='checkbox' 
      v-model='attachToPrevMeter' 
      @change='updateAttachToPrevMeter'/>
    
    </div>
    <div class='controlsRow' v-if='insertPulseMode'>
      <div v-if='numLayers === 1' class='row'>
        <label>Layer {{ 0 }}</label>
        <input type='radio' v-model.number='insertLayer' value='0' />
      </div>
      <div v-else class='row'>
        <div class='row'>
          <label>Layer {{ 0 }}</label>
          <input type='radio' v-model.number='insertLayer' value='0' />
        </div>
        <div class='row'>
          <label>Layer {{ 1 }}</label>
          <input type='radio' v-model.number='insertLayer' value='1' />
        </div>
      </div> 
    </div>
    <div class='controlsRow'>
      <button 
        @click='insertMeter' 
        v-if='!(meterSelected || insertPulseMode)'
        :disabled='(!editable || !meterCurrentlyInsertable)'
        >
        Insert Meter at Playhead
      </button>
      <button 
        v-if='insertPulseMode && !attachToPrevMeter && meterFromPulseInsertable' 
        @click='insertMeterFromPulses'
        :disabled='!editable'>
        Insert Meter from Pulses
      </button>
      <button
        v-if='insertPulseMode && prevMeter && attachToPrevMeter'
        @click='addTimePointsToPrevMeter'
        :disabled='!editable'>
        Add Time Points to Prev Meter
      </button>
    </div>
  </div>
  <div class='controlsBox'>
    <div class='titleRow'>Layer Visibility</div>
    <div class='controlsRow'>
      <label>max: {{ maxLayer }}</label>
      <input 
        type='range' 
        min='-1' 
        max='3' 
        step='1' 
        v-model.number='maxLayer' 
        @input='updateVisibility'
        />
    </div>
  </div>
</div>
</template>

<script lang='ts'>

import { Meter } from '@/js/meter.ts';
import { 
  selectAll as d3SelectAll,
  select as d3Select,
 } from 'd3';
import { defineComponent, PropType } from 'vue';
import { EditorMode } from '@shared/enums';
 
type MeterControlsDataType = {
  numLayers: number,
  layerCompounds: number[],
  pulseDivisions: number[][],
  tempo: number,
  tempoSlider: number,
  minTempo: number,
  maxTempo: number,
  cycles: number,
  meter?: Meter,
  meterSelected: boolean,
  maxLayer: number,
  // insertPulseMode: boolean,
  insertLayer: number,
  attachToPrevMeter: boolean,
  prevMeter: boolean,
};

export default defineComponent({
  name: 'MeterControls',
  data(): MeterControlsDataType {
    return {
      numLayers: 2,
      layerCompounds: [1, 1, 1, 1],
      pulseDivisions: [
        [4, 2, 2, 2],
        [4, 2, 2, 2],
        [4, 2, 2, 2],
        [4, 2, 2, 2]
      ],
      tempo: 60,
      tempoSlider: 0.5,
      minTempo: 20,
      maxTempo: 300,
      cycles: 1,
      meter: undefined,
      meterSelected: false,
      maxLayer: 3,
      // insertPulseMode: false,
      insertLayer: 0,
      attachToPrevMeter: false,
      prevMeter: false,
    }
  },
  props: {
    height: {
      type: Number,
      required: true,
    },
    playerHeight: {
      type: Number,
      required: true,
    },
    editable: {
      type: Boolean,
      required: true,
    },
    currentTime: {
      type: Number,
      required: true,
    },
    insertPulses: {
      type: Array as PropType<number[]>,
      required: true,
    },
    editorMode: {
      type: String as PropType<EditorMode>,
      required: true,
    },
    selectedMeter: {
      type: Object as PropType<Meter>,
      required: false,
    },
    meters: {
      type: Array as PropType<Meter[]>,
      required: true,
    },
  },

  mounted() {
    this.$emit('maxLayerEmit', this.maxLayer);
  },

  computed: {

    insertPulseMode() {
      return this.editorMode === EditorMode.Meter;
    },

    meterCurrentlyInsertable() {
      const start = this.currentTime;
      const relDivs = this.pulseDivisions[0].slice(0, this.layerCompounds[0]);
      const pulsesPer = this.sum(relDivs);
      const dur = (this.cycles * (60 / this.tempo) * pulsesPer);
      const end = start + dur;
      const conflict = this.meters.some((meter) => {
        const mEndTime = meter.startTime + meter.cycleDur * meter.repetitions;
        if (start >= meter.startTime && start <= mEndTime) {
          return true;
        }
        if (end >= meter.startTime && end <= mEndTime) {
          return true;
        }
        if (start <= meter.startTime && end >= mEndTime) {
          return true;
        }
        return false;
      })
      return !conflict;
    },

    meterFromPulseInsertable() {
      return this.insertPulses.length > 1;
    },
  },

  watch: {
    selectedMeter(newVal, oldVal) {
      if (newVal !== undefined) {
        this.meter = newVal;
        this.assignData();
      } else {
        this.meter = undefined;
        this.numLayers = 2;
        this.layerCompounds = [1, 1, 1, 1];
        this.pulseDivisions = [
          [4, 2, 2, 2],
          [4, 2, 2, 2],
          [4, 2, 2, 2],
          [4, 2, 2, 2]
        ];
        this.tempo = 60;
        this.tempoSlider = 0.5;
        this.cycles = 1;

      }
    }
  },
  
  methods: {

    cycleGrowable() {
      if (this.meter === undefined) {
        return false;
      }
      const start = this.meter.startTime;
      const dur = this.meter.cycleDur * this.meter.repetitions;
      const curEnd = start + dur;
      const grownEnd = curEnd + this.meter.cycleDur;
      const conflict = this.meters
        .filter(m => m !== this.meter)
        .some((meter) => {
          const out = (meter.startTime >= start && meter.startTime <= grownEnd);
          return out;
        })
      return !conflict;
    },

    increaseCompounds(i: number) {
      this.layerCompounds[i]++;
      // this.updateMeter();
      if (this.meter !== undefined) {
        if (i === 0) {
          this.updateMeter();
        } else {
          const newHi = this.pulseDivisions[i].slice(0, this.layerCompounds[i]);
          this.meter.alterLayer(i, newHi);
          this.$emit('passthroughResetZoomEmit')
          this.$emit('pSelectMeterEmit', this.meter.allPulses[0].uniqueId)
          this.$emit('passthroughUnsavedChangesEmit', true)
        }
      }
    },

    decreaseCompounds(i: number) {
      this.layerCompounds[i]--;
      // this.updateMeter();
      if (this.meter !== undefined) {
        if (i === 0) {
          this.updateMeter();
        } else {
          const newHi = this.pulseDivisions[i].slice(0, this.layerCompounds[i]);
          this.meter.alterLayer(i, newHi);
          // editor.resetZoom();
          this.$emit('passthroughResetZoomEmit')
          this.$emit('pSelectMeterEmit', this.meter.allPulses[0].uniqueId)
          this.$emit('passthroughUnsavedChangesEmit', true)
        }
      }
    },

    removeMeter() {
      this.$emit('passthroughRemoveMeterEmit', this.meter!);
      this.meterSelected = false;
    },

    async updateMeter() {
      if (this.meter !== undefined) {
        const startTime = this.meter!.startTime;
        await this.removeMeter();
        this.insertMeter(undefined, startTime)
        await this.$nextTick();
        this.$emit('pSelectMeterEmit', this.meter.allPulses[0].uniqueId)
      }
    },

    updateDepth() {
      if (this.meter !== undefined) {
        const oldDepth = this.meter.hierarchy.length;
        const newDepth = this.numLayers;
        const diff = newDepth - oldDepth;
        if (diff < 0) {
          this.meter.shrinkLayers(-diff);
        } else {
          const newHierarchies = [];
          for (let i = oldDepth; i < newDepth; i++) {
            const lc = this.layerCompounds[i];
            if (lc === 1) {
              newHierarchies.push(this.pulseDivisions[i][0]);
            } else {
              newHierarchies.push(this.pulseDivisions[i].slice(0, lc));
            }
          }
          this.meter.growLayers(newHierarchies);
        }
        this.$emit('passthroughResetZoomEmit')
        this.$emit('pSelectMeterEmit', this.meter.allPulses[0].uniqueId)
        this.$emit('passthroughUnsavedChangesEmit', true)
      }
    },

    updateCycles(event: Event) {

      if (this.meter !== undefined) {
        const oldReps = this.meter.repetitions;
        const newReps = this.cycles;
        const diff = newReps - oldReps;
        if (diff > 0) {
          if (this.cycleGrowable()) {
            this.meter.growCycles(diff);
          } else {
            this.cycles = oldReps;
          }
        } else if (diff < 0) { 
          this.meter.shrinkCycles(-diff);
        }
        this.$emit('passthroughResetZoomEmit')
        this.$emit('pSelectMeterEmit', this.meter.allPulses[0].uniqueId)
        this.$emit('passthroughUnsavedChangesEmit', true)
        this.$emit('rerenderMeter', this.meter);
      }
    },

    updatePulseDivs(i: number, kIdx: number) {
      if (this.meter !== undefined) {
        const newHierarchy = [];
        for (let i = 0; i < this.numLayers; i++) {
          const lc = this.layerCompounds[i];
          if (lc === 1) {
            newHierarchy.push(this.pulseDivisions[i][0]);
          } else {
            newHierarchy.push(this.pulseDivisions[i].slice(0, lc));
          }
        }
        if (i === 0) {
          this.updateMeter()
        } else {
          this.meter.alterLayer(i, newHierarchy[i]);
          this.$emit('passthroughResetZoomEmit')
          this.$emit('pSelectMeterEmit', this.meter.allPulses[0].uniqueId)
        }
        this.$emit('passthroughUnsavedChangesEmit', true)
      } 
    },

    updateVisibility() {
      // for (let i = 0; i <= 4; i++) {
      //   const selects = d3SelectAll(`.layer_${i}`)
      //     .filter((d, idx: number, nodes) => { 
      //       return !d3Select(nodes[idx]).classed('overlay')
      //   })
      //     .style('opacity', this.maxLayer >= i ? 1 : 0)
      // }
      this.$emit('maxLayerEmit', this.maxLayer);
    },

    assignData() {
      if (this.meter === undefined) {
        throw new Error('Meter is undefined');
      }
      this.numLayers = this.meter.hierarchy.length;
      this.cycles = this.meter.repetitions;
      this.tempo = this.meter.tempo;
      const logTempoDiff = Math.log(this.maxTempo) - Math.log(this.minTempo);
      const logTempoOffset = Math.log(this.tempo) - Math.log(this.minTempo);
      this.tempoSlider = logTempoOffset / logTempoDiff;

      this.meter.hierarchy.map((layer, i) => {
        if (typeof layer === 'number') {
          this.layerCompounds[i] = 1;
          this.pulseDivisions[i][0] = layer;
        } else {
          this.layerCompounds[i] = layer.length;
          layer.map((div, j) => {
            this.pulseDivisions[i][j] = div;
          })
        }
      })
    },

    updateTempo() {
      const logMin = Math.log(this.minTempo);
      const logMax = Math.log(this.maxTempo);
      const logTempo = logMin + (logMax - logMin) * this.tempoSlider;
      this.tempo = Math.round(Math.exp(logTempo));
      if (this.meter !== undefined) {
        this.meter.adjustTempo(this.tempo);
        this.$emit('passthroughResetZoomEmit')
        this.$emit('pSelectMeterEmit', this.meter.allPulses[0].uniqueId)
        this.$emit('passthroughUnsavedChangesEmit', true)
        this.$emit('rerenderMeter', this.meter);
      }
    },

    sum(arr: number[]) {
      return arr.reduce((a, b) => a + b, 0);
    }, 

    getDuration() {
      const relDivs = this.pulseDivisions[0].slice(0, this.layerCompounds[0]);
      const pulsesPer = this.sum(relDivs);
      const dur = (this.cycles * (60 / this.tempo) * pulsesPer);
      return this.displayTime(dur)
    },

    getStartTime() {
      if (this.meter !== undefined) {
        return this.displayTime(this.meter.startTime);
      } else {
        return this.displayTime(this.currentTime)
      }
    },

    displayTime(dur: number) {
      const hours = Math.floor(dur / 3600);
      let minutes: number | string = Math.floor((dur - hours * 3600) / 60);
      let seconds: number | string = Math.round(dur % 60);
      if (seconds.toString().length === 1) seconds = '0' + seconds;
      if (hours !== 0) {
        if (minutes.toString().length === 1) minutes = '0' + minutes;
        return ([hours, minutes, seconds]).join(':')
      } else {
        return minutes + ':' + seconds 
      }
    },

    insertMeter(_?: MouseEvent, startTime_?: number) {
      const startTime = startTime_ !== undefined ? 
                        startTime_ : 
                        this.currentTime;
      const hierarchy: (number | number[])[] = [];
      for (let i = 0; i < this.numLayers; i++) {
        if (this.layerCompounds[i] === 1) {
          hierarchy.push(this.pulseDivisions[i][0])
        } else {
          const layer = this.pulseDivisions[i].slice(0, this.layerCompounds[i]);
          hierarchy.push(layer)
        }
      }
      const meter = new Meter({
        hierarchy,
        startTime,
        tempo: this.tempo,
        repetitions: this.cycles,
      });
      this.$emit('passthroughAddMeterEmit', meter);
      this.$emit('passthroughUnsavedChangesEmit', true)
      // this.$emit('passthroughAddMetricGridEmit', true);
      this.meterSelected = true;
      // this.$nextTick(() => {
      //   const p = meter.allPulses[0];
      //   // this.$emit('pSelectMeterEmit', p.uniqueId)
      // })
    },

    insertMeterFromPulses() {
      const timePoints = this.insertPulses;
      const hierarchy: (number | number[])[] = [];
      for (let i = 0; i < this.numLayers; i++) {
        if (this.layerCompounds[i] === 1) {
          hierarchy.push(this.pulseDivisions[i][0])
        } else {
          const layer = this.pulseDivisions[i].slice(0, this.layerCompounds[i]);
          hierarchy.push(layer)
        }
      }
      timePoints.sort((a: number, b: number) => a - b);
      const meter = Meter.fromTimePoints( {
        timePoints,
        hierarchy,
        repetitions: this.cycles,
        layer: Number(this.insertLayer),
      });
      this.$emit('passthroughAddMeterEmit', meter);
      // this.$emit('passthroughAddMetricGridEmit', true);
      this.meterSelected = true;
      this.$emit('pSelectMeterEmit', meter.allPulses[0].uniqueId)
    },

    addTimePointsToPrevMeter() {
      const timePoints = this.insertPulses;
      timePoints.sort((a: number, b: number) => a - b);
      this.meter!.addTimePoints(timePoints, this.insertLayer);
      // this.$emit('passthroughAddMetricGridEmit', true);
      this.meterSelected = true;
      this.$emit('pSelectMeterEmit', this.meter!.allPulses[0].uniqueId, true)
      this.$emit('passthroughUnsavedChangesEmit', true);
      this.$emit('renderMeter', this.meter);
      // d3SelectAll('.insertPulse').remove();
      // this.insertPulseMode = false;
    },

    updateAttachToPrevMeter() {
      if (this.attachToPrevMeter === true) {
        this.$emit('passthroughAssignPrevMeterEmit');
        // this.$emit('pSelectMeterEmit', this.meter!.allPulses[0].uniqueId)
        this.numLayers = this.meter!.hierarchy.length;
        if (typeof this.meter!.hierarchy[0] === 'number') {
          this.layerCompounds[0] = 1;
          this.pulseDivisions[0][0] = this.meter!.hierarchy[0];
        } else {
          this.layerCompounds[0] = this.meter!.hierarchy[0].length;
          this.meter!.hierarchy[0].map((div, i) => {
            this.pulseDivisions[0][i] = div;
          })
        }
        (this.meter!.hierarchy.slice(1) as number[]).forEach((h, hIdx) => {
          this.pulseDivisions[hIdx + 1][0] = h;
        })
      }
    }
  },
})

</script>

<style scoped>
.outer {
  background-color: #202621;
  height: v-bind(height + 'px');
  position: absolute;
  right: 0px;
  bottom: v-bind(playerHeight + 'px');
  color: white;
  z-index: -1;
  display: flex;
  flex-direction: row;
  align-items: center;
  justify-content: left;
}

.controlsRow {
  display: flex;
  flex-direction: row;
  align-items: center;
  justify-content: left;
  width: 250px;
  height: 40px;
}

label {
  width: 60px;
  min-width: 60px;
  margin-right: 10px;
  text-align: right;
}

.wide {
  width: 150px;
  min-width: 150px;
  margin-right: 10px;
  text-align: right;
}

.big {
  width: 150px;
}

select {
  height: 20px;
  margin-left: 5px;
}

.controlsBox {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: top;
  /* margin: 10px; */
  width: 260px;
  height: 100%;
  border-right: 1px solid white
}

.buttonCol {
  display: flex;
  flex-direction: column;
  width: 30px;
}

.buttonCol > button {
  height: 17px;
  width: 25px;
}

button {
  cursor: pointer;
}

.buttonCol > button:disabled {
  cursor: auto;
}

input[type=number] {
  width: 45px;
  max-width: 45px;
  min-width: 45px;
  cursor: pointer
}

input[type=range] {
  margin-left: 5px;
  margin-right: 5px;
  width: 100%;
  cursor: pointer
}

select {
  cursor: pointer
}

.row {
  display: flex;
  flex-direction: row;
  align-items: center;
  justify-content: left;
  margin-top: 5px;
  margin-bottom: 5px;
}

.no-text-entry {
  pointer-events: none; /* Disable text entry */
}
.no-text-entry::-webkit-inner-spin-button,
.no-text-entry::-webkit-outer-spin-button {
  pointer-events: auto; /* Enable spin buttons */
}

</style>
