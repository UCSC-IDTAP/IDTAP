<template>
  <div class='autoWindow'>
    <div class='innerGraph' ref='innerGraph'>
    </div>
  </div>
</template>

<script lang='ts'>
import { defineComponent, PropType } from 'vue';
import { Automation, Trajectory, Piece } from '@model';
import * as d3 from 'd3';

import { AutoValue } from '@shared/types';

type AutomationWindowDataType = {
  height: number,
  svg?: d3.Selection<SVGSVGElement, unknown, null, undefined>,
  xScale?: d3.ScaleLinear<number, number, never>
  yScale?: d3.ScaleLinear<number, number, never>
  automation?: Automation,
  dragIdx?: number,
  moveableFirst: boolean,
  shifted: boolean,
  optioned: boolean,
  overDot?: number,
}

export default defineComponent({
  name: 'AutomationWindow',
  data(): AutomationWindowDataType {
    return {
      height: 100,
      svg: undefined,
      xScale: undefined,
      yScale: undefined,
      automation: undefined,
      dragIdx: undefined,
      moveableFirst: true,
      shifted: false,
      optioned: false,
      overDot: undefined
    }
  },
  mounted() {
    const startPIdx = this.trajectories[0].phraseIdx!;
    const startTIdx = this.trajectories[0].num!;
    if (startTIdx === 0) {
      if (startPIdx > 0) {
        const prevPhraseTrajs = this.piece!.phrases[startPIdx - 1].trajectories;
        const lastTraj = prevPhraseTrajs[prevPhraseTrajs.length - 1];
        if (lastTraj.id !== 12) {
          this.moveableFirst = false;
        }
      }
    } else {
      const lastTraj = this.piece!.phrases[startPIdx].trajectories[startTIdx - 1];
      if (lastTraj.id !== 12) {
        this.moveableFirst = false;
      }
    }

    const graphDiv = this.$refs.innerGraph as HTMLElement;
    this.svg = d3.select(graphDiv)
      .append('svg')
      .attr('width', '100%')
      .attr('height', '100%')    
    this.xScale = d3.scaleLinear()
      .domain([0, 1])
      .range([20, this.width - 20]);
    this.yScale = d3.scaleLinear()
      .domain([0, 1])
      .range([this.height - 20, 20]);
    if (this.trajectories.length === 1) {
      this.automation = this.trajectories[0].automation
    } else {
      const autos = this.trajectories.map(traj => traj.automation!);
      let durArray = this.trajectories.map(traj => traj.durTot);
      const durTot = durArray.reduce((a, b) => a + b, 0);
      durArray = durArray.map(dur => dur / durTot);
      this.automation = Automation.compress(autos, durArray);
    }
    this.addBackground();
    this.addDots();
    this.addLines();
    // add keydown event listenr
    window.addEventListener('keydown', this.keydown);
    window.addEventListener('keyup', this.keyup);

  },
  beforeUnmount() {
    window.removeEventListener('keydown', this.keydown);
    window.removeEventListener('keyup', this.keyup);
  },
  props: {
    trajectories: {
      type: Array as PropType<Trajectory[]>,
      required: true
    },
    x: {
      type: Number,
      required: true
    },
    y: {
      type: Number,
      required: true
    },
    width: {
      type: Number,
      required: true
    },
    piece: {
      type: Object as PropType<Piece>,
      required: true
    }
  },
  methods: {

    keydown(key: KeyboardEvent) {
      if (key.key === 'Shift') {
        this.shifted = true;
      }
      if (key.key === 'Alt') {
        this.optioned = true;
      }
      this.updateCursor();
      if (this.overDot !== undefined) {
        this.applyDotHover(this.overDot)
      }
    },

    keyup(key: KeyboardEvent) {
      if (key.key === 'Shift') {
        this.shifted = false;
      }
      if (key.key === 'Alt') {
        this.optioned = false;
      };
      this.updateCursor();
      if (this.overDot !== undefined) {
        this.applyDotHover(this.overDot)
      }
    },

    addDots() {
      if (this.svg && this.xScale && this.yScale && this.automation) {
        // remove dots
        this.svg.selectAll('circle').remove();

        // drag behavior
        const drag = d3.drag<SVGCircleElement, { normTime: number; value: number; }>()
          .on('start', (event: d3.D3DragEvent<HTMLDivElement, any, MouseEvent>, d) => {
            const idx = event.sourceEvent.target.id.split('invisibleAutoDot')[1];
            this.dragIdx = Number(idx);
          })
          .on('drag', (event, d) => {
            const dot = d3.select(`#autoDot${this.dragIdx}`);
            const invisibleDot = d3.select(`#invisibleAutoDot${this.dragIdx}`);
            const first = this.dragIdx === 0;
            const last = this.dragIdx === this.automation!.values.length - 1;
            if (!(first && !this.moveableFirst)) {
              let newY = event.y;
              if (newY < this.yScale!(1)) {
                newY = this.yScale!(1);
              } else if (newY > this.yScale!(0)) {
                newY = this.yScale!(0);
              }
              dot
                .attr('cy', newY)
              invisibleDot
                .attr('cy', newY)
            }
            if (!first && !last) {
              let newX = event.x;
              if (newX < this.xScale!(0.01)) {
                newX = this.xScale!(0.01);
              } else if (newX > this.xScale!(0.99)) {
                newX = this.xScale!(0.99);
              }
              dot
                .attr('cx', newX);
              invisibleDot
                .attr('cx', newX);
            }
          })
          .on('end', (event, d) => {
            const dot = d3.select(`#autoDot${this.dragIdx}`);
            const invisibleDot = d3.select(`#invisibleAutoDot${this.dragIdx}`);
            const first = this.dragIdx === 0;
            const last = this.dragIdx === this.automation!.values.length - 1;
            if (!(first && !this.moveableFirst)) {
              let newY = event.y;
              if (newY < this.yScale!(1)) {
                newY = this.yScale!(1);
              } else if (newY > this.yScale!(0)) {
                newY = this.yScale!(0);
              }
              dot
                .attr('cy', newY)
              invisibleDot
                .attr('cy', newY)
            }
            if (!first && !last) {
              let newX = event.x;
              if (newX < this.xScale!(0.01)) {
                newX = this.xScale!(0.01);
              } else if (newX > this.xScale!(0.99)) {
                newX = this.xScale!(0.99);
              }
              dot
                .attr('cx', newX);
              invisibleDot
                .attr('cx', newX);
            }
            const normTime = this.xScale!.invert(Number(dot.attr('cx')));
            const value = this.yScale!.invert(Number(dot.attr('cy')));
            this.automation!.values[this.dragIdx!].normTime = normTime;
            this.automation!.values[this.dragIdx!].value = value;
            if (this.trajectories.length > 1) {
              let durArray = this.trajectories.map(traj => traj.durTot);
              const durTot = durArray.reduce((a, b) => a + b, 0);
              durArray = durArray.map(dur => dur / durTot);
              const autos = this.automation!.partition(durArray);
              this.trajectories.forEach((traj, i) => {
                traj.automation = autos[i];
              });
            }
            this.addLines();
          });
        this.svg.selectAll('circle.visible')
          .data(this.automation.values)
          .enter()
          .append('circle')
          .attr('class', 'visible')
          .attr('id', (_, i) => `autoDot${i}`)
          .attr('cx', d => this.xScale!(d.normTime))
          .attr('cy', d => this.yScale!(d.value))
          .attr('r', 3)
          .attr('fill', 'black')
        
        const first = (i: number) => i === 0;
        const last = (i: number) => i === this.trajectories.values.length - 1;

        this.svg.selectAll('circle.invisible')
          .data(this.automation.values)
          .enter()
          .append('circle')
          .attr('class', 'invisible')
          .attr('cx', d => this.xScale!(d.normTime))
          .attr('cy', d => this.yScale!(d.value))
          .attr('r', 9)
          .attr('fill', 'transparent')
          .attr('data-index', (_, i) => i)
          .attr('id', (_, i) => `invisibleAutoDot${i}`)
          .call(drag)
          .on('mouseover', (event, d) => {
            const i = Number(d3.select(event.target).attr('data-index'));
            this.applyDotHover(i);
            if (!(first(i) || last(i))) {
              this.overDot = i;
            }
          })
          .on('mouseout', (event) => {
            const i = Number(d3.select(event.target).attr('data-index'));
            if (!(first(i) || last(i))) {
              this.overDot = undefined;
            }
          })
          .on('click', this.handleClickDot)
      }
    },

    applyDotHover(idx: number) {
      const hoverType = this.hoverType(idx);
      d3.select(`#invisibleAutoDot${idx}`)
        .attr('cursor', hoverType)
    },

    handleClickDot(event: MouseEvent, d: AutoValue) {
      const target = event.target as HTMLElement;
      const idx = Number(d3.select(target).attr('data-index'));
      if (idx === 0 && !this.moveableFirst) {
        return;
      }
      if (this.optioned) {
        this.automation!.removeValue(idx);
        if (this.trajectories.length > 1) {
          let durArray = this.trajectories.map(traj => traj.durTot);
          const durTot = durArray.reduce((a, b) => a + b, 0);
          durArray = durArray.map(dur => dur / durTot);
          const autos = this.automation!.partition(durArray);
          this.trajectories.forEach((traj, i) => {
            traj.automation = autos[i];
          });
        }
        this.addDots();
        this.addLines();
      }
    },

    hoverType(dragIdx: number) {
      const middle = dragIdx !== 0 && dragIdx !== this.automation!.values.length - 1;
      if (dragIdx === 0 && !this.moveableFirst) {
        return 'default'
      } else if (middle && this.optioned) {
        return 'not-allowed'
      } else {
        return 'move'
      }
    },

    addLines() {
      if (this.svg && this.xScale && this.yScale && this.automation) {
        const line = d3.line<AutoValue>()
          .x(d => this.xScale!(d.normTime))
          .y(d => this.yScale!(d.value))
        d3.select('.line').remove();
        this.svg.append('path')
          .datum(this.automation.values)
          .classed('line', true)
          .attr('fill', 'none')
          .attr('stroke', 'black')
          .attr('stroke-width', 1.5)
          .attr('d', line);
      }
    },

    updateCursor() {
      let cursor = this.shifted ? 'crosshair' : 'default';
      this.svg!.selectAll('rect')
        .attr('cursor', cursor)
    },

    addBackground() {
      // add a grey background rectangle, from 0 to 1 on the x axis, and 0 to 1 
      // on the y axis
      this.svg!.append('rect')
        .attr('x', this.xScale!(0))
        .attr('y', this.yScale!(1))
        .attr('width', this.xScale!(1) - this.xScale!(0))
        .attr('height', this.yScale!(0) - this.yScale!(1))
        .attr('fill', '#f0f0f0')
        .on('mousemove', () => {
          this.updateCursor();
        })
        .on('click', async (event) => {
          if (this.shifted) {
            const x = event.offsetX;
            const y = event.offsetY;
            const normTime = this.xScale!.invert(x);
            const value = this.yScale!.invert(y);
            this.automation!.addValue(normTime, value);
            if (this.trajectories.length > 1) {
              let durArray = this.trajectories.map(traj => traj.durTot);
              const durTot = durArray.reduce((a, b) => a + b, 0);
              durArray = durArray.map(dur => dur / durTot);
              const autos = this.automation!.partition(durArray);
              this.trajectories.forEach((traj, i) => {
                traj.automation = autos[i];
              });
            };
            try {
              await this.$nextTick();
              this.addDots();
              this.addLines();

            }
            catch (e) {
              console.log(e);
            }
          }
        })
    }
  }
})

</script>

<style scoped>

.autoWindow {
  position: absolute;
  background-color: white;
  border: 1px solid black;
  box-sizing: border-box;
  width: v-bind(width + 'px');
  height: v-bind(height + 'px');
  top: v-bind(y + 'px');
  left: v-bind(x + 'px');
  z-index: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
}

.innerGraph {
  width: v-bind(width + 'px');
  height: v-bind(height + 'px');
}
</style>
