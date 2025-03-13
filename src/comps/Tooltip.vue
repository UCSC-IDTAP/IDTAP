<template>
  <div
    ref='tooltip'
    :class='["tooltipOuter", { closed: !open }]'
    :style='{ top: computedY + "px", left: computedX + "px" }'
    >{{ text }}

  </div>
</template>

<script lang='ts'>

import { defineComponent, nextTick, ref, computed, watch } from 'vue';

export default defineComponent({
  name: 'Tooltip',
  props: {
    x: {
      type: Number,
      required: true
    },
    y: {
      type: Number,
      required: true
    },
    text: {
      type: String,
      required: true
    },
    open: {
      type: Boolean,
      required: true,
    }
  },
  setup(props) {
    const tooltip = ref<HTMLDivElement | null>(null);
    const yOffset = 20;
    const xOffset = 0;
    const maxWidth = 200;
    const maxHeight = 50;
    const actualWidth = ref(0);
    const actualHeight = ref(0);

    const updateDimensions = () => {
      nextTick(() => {
        if (tooltip.value) {
          actualWidth.value = tooltip.value.offsetWidth;
          actualHeight.value = tooltip.value.offsetHeight;
        }
      })
    }

    watch(() => props.open, () => {
      if (props.open) {
        updateDimensions();
      }
    });

    const computedX = computed(() => {
      let tempX = props.x + xOffset;
      if (tempX + actualWidth.value > window.innerWidth) {
        tempX = window.innerWidth - actualWidth.value;
      }
      return tempX
    });
    const computedY = computed(() => {
      let tempY = props.y + yOffset;
      if (tempY + actualHeight.value > window.innerHeight) {
        tempY = window.innerHeight - actualHeight.value;
      }
      return tempY
    });
    return {
      computedX,
      computedY,
      tooltip
    }
  }
})
</script>

<style scoped>

.tooltipOuter {
  position: absolute;
  background-color: #fff9a8;
  border: 1px solid black;
  padding: 5px;
  z-index: 100;
  max-width: 220px;
  max-height: 50px;
  width: auto;
  height: auto;
  overflow: auto;
  white-space: nowrap;
  display: inline-block;
  font-size: 14px;

}

.tooltipOuter.closed {
  visibility: hidden;
  opacity: 0;
  transition: visiblity 0s 0.15s, opacity 0.15s linear;

}
</style>
