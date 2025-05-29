<template>
  <div class="dropdown" :style='dynamicStyle'>
    <div 
      class="dropdown-btn" 
      @click="toggleDropdown"
      v-html="selectedValue"
      
      ></div>
    <div class="dropdown-content" v-show="isOpen">
      <div class='scrollingDropdownContainer'>
        <div 
          v-for="(swatch, idx) in swatches" 
          :key="idx" 
          class="dropdown-item" 
          @click="selectSwatch(swatch)"
          v-html="swatch.svgString"
        >
        </div>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent, PropType, ref, onMounted, computed, watch } from 'vue';
import * as d3 from 'd3';
import { CMap } from '@shared/types';
import * as d3CMap from 'd3-scale-chromatic';

const createSwatches = (width: number, height: number): { svgString: string, cMap: CMap }[] => {
  // for every color map in the enum CMap,
  // create a swatch with the color map applied
  // and return an array of the swatches
  // const width = 120;
  const swatches: { svgString: string, cMap: CMap }[] = [];
  for (const [key, value] of Object.entries(CMap)) {
    const swatchSVG = d3.create('svg')
      .attr('width', width)
      .attr('height', height)
      // .style('border-radius', '4px')
      .attr('xmlns', 'http://www.w3.org/2000/svg');
    const n = width;
    const sliceWidth = width / n;
    const colorScale = d3CMap[value];
    const data = Array.from({ length: n }, (_, i) => i / (n-1));
    swatchSVG.selectAll('rect')
      .data(data)
      .enter()
      .append('rect')
      .attr('x', (d, i) => i * sliceWidth)
      .attr('y', 0)
      .attr('width', sliceWidth)
      .attr('height', height)
      .attr('fill', d => colorScale(d));
    const svgString = new XMLSerializer().serializeToString(swatchSVG.node()!);
    swatches.push({ svgString, cMap: value as CMap });    
  }
  return swatches;
}

export default defineComponent({
  name: 'DropdownMenu',
  props: {
    initCMap: {
      type: String as PropType<CMap>,
      required: true
    }
  },
  emits: ['update:modelValue', 'change'],
  setup(props, { emit }) {
    const isOpen = ref(false);
    const selectedLabel = ref(props.initCMap);
    const width = ref(120);
    const height = ref(20);
    const swatches: { 
      svgString: string, 
      cMap: CMap 
    }[] = createSwatches(width.value - 2, height.value - 2);

    const selectedValue = ref(swatches.find(swatch => swatch.cMap === props.initCMap)!.svgString);
    
    const toggleDropdown = () => {
      isOpen.value = !isOpen.value;
      console.log('isOpen', isOpen.value);
    };

    const dynamicStyle = computed(() => {
      return {
        '--width': `${width.value}px`,
        '--height': `${height.value}px`,
        '--dropdownHeight': `${(height.value - 2) * swatches.length}px`,
      };
    });

    const selectSwatch = (swatch: { svgString: string, cMap: CMap }) => {
      selectedLabel.value = swatch.cMap;
      selectedValue.value = swatch.svgString;
      isOpen.value = false;
      emit('update:modelValue', swatch.cMap);
      emit('change', swatch.cMap);
    };

    watch(() => props.initCMap, (newValue) => {
      const swatch = swatches.find(s => s.cMap === newValue);
      if (swatch) {
        selectedLabel.value = newValue;
        selectedValue.value = swatch.svgString;
      }
    });



    return {
      isOpen,
      selectedLabel,
      selectedValue,
      selectSwatch,
      toggleDropdown,
      swatches,
      width,
      height,
      dynamicStyle
    };
  },
});
</script>



<style scoped>
* {
  padding: 0;
  margin: 0;
}

.dropdown {
  position: relative;
  width: calc(var(--width) - 2px);
  height: calc(var(--height) - 2px);
  border: 1px solid white;
  font-family: Arial, sans-serif;
  background-color: black;
  display: block;
}

.dropdown-btn {
  background-color: #ffffff;
  color: #333;
  width: calc(var(--width) - 2px);
  height: calc(var(--height) - 2px);
  text-align: left;
  cursor: pointer;
  box-sizing: border-box;
}

.dropdown-content {
  position: absolute;
  background-color: #f9f9f9;
  width: calc(var(--width) - 2px);
  left: -1px;
  box-shadow: 0 8px 16px rgba(0,0,0,0.1);
  z-index: 1;
  border: 1px solid white;
  overflow-y: auto;
  overflow-x: hidden;
  height: 100px;
}

.scrollingDropdownContainer {
  width: calc(var(--width) - 2px);
  height: var(--dropdownHeight);
  position: relative;
  top: 0px;
  padding: 0px;
  margin: 0px;
}

.dropdown-content .dropdown-item {
  color: black;
  background-color: black;
  text-decoration: none;
  white-space: nowrap;
  cursor: pointer;
}

.dropdown-item {
  height: calc(var(--height) - 2px);
}

.dropdown-content .dropdown-item:last-child {
  border-bottom: none;
  margin: none;
  padding: none;
}

.dropdown-content .dropdown-item:hover {
  background-color: black;
}

.dropdown-btn:hover, .dropdown-btn:focus {
  background-color: #f1f1f1;
}

.dropdown-content {
  display: block;
  /* vertical-align: bottom; */
}
</style>
