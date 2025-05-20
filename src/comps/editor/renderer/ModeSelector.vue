<template>
  <div class='modeSelectorMain' :style='cssVars' ref='modeSelectorMain'>
    <div
      class='tile'
      v-for='(mode, mIdx) in possibleModeTiles' 
      :key='mode'
      :id='`${mIdx}`'
      @click='() => $emit("update:selectedMode", mode)'
      @mouseover='handleMouseOver'
      @mouseout='handleMouseOut'
      >
      <div class='tileText'>
        {{ typeof mode === 'string' ? mode[0] : mode + 1 }}
      </div>
    </div>
  </div>
</template>

<script lang='ts'>
import { defineComponent, ref, onMounted, PropType, computed, watch } from 'vue';
import { EditorMode } from '@shared/enums';
import { TooltipData } from '@shared/types';
export default defineComponent({
  name: 'ModeSelector',
  props: {
    selectedMode: {
      type: [String, Number] as PropType<EditorMode | Record<string, number> | number>,
    },
    height: {
      type: Number,
      required: true
    },
    enum: {
      type: Object as PropType<Record<string, string | number>>,
      required: true
    },
    noneEnumItem: {
      type: [String, Number] as PropType<string | number>,
      required: true
    },
    tooltipTexts: {
      type: Object as PropType<string[]>,
      required: true
    }
  },
  setup(props, { emit }) {
    const modeSelectorMain = ref<HTMLDivElement | null>(null);
    const hoverTimeout = ref<NodeJS.Timeout | undefined>(undefined);
    const possibleModeTiles = computed(() => {
      const noneIdx = Object.values(props.enum).indexOf(props.noneEnumItem);
      const possibleModeTiles = Object.values(props.enum);
      if (noneIdx > -1) {
        possibleModeTiles.splice(noneIdx, 1);
      }
      return possibleModeTiles;
    });

    const handleMouseOver = (e: MouseEvent) => {
      if (hoverTimeout.value === undefined) {
        hoverTimeout.value = setTimeout(() => {
          const target = e.target as HTMLDivElement;
          const text = props.tooltipTexts[Number(target.id)];
          const data: TooltipData = {
            text,
            x: e.clientX,
            y: e.clientY,
          }
          emit('showTooltip', data)
        }, 500);
      }
    };

    const handleMouseOut = () => {
      if (hoverTimeout.value) {
        clearTimeout(hoverTimeout.value);
        hoverTimeout.value = undefined;
      }
      emit('hideTooltip');
    };

    watch(() => props.selectedMode, newMode => {
      if (modeSelectorMain.value) {
        const tiles = modeSelectorMain.value.querySelectorAll('.tile');
        const newModeIdx = Object.values(props.enum)
          .indexOf(newMode as string | number);
        tiles.forEach((tile, tIdx) => {
          if (tile.id === String(newModeIdx)) {
            tile.classList.add('selected');
          } else {
            tile.classList.remove('selected');
          }
        });
      }
    });

    const cssVars = computed(() => {
      return {
        '--height': `${props.height}px`
      }
    })
    onMounted(() => {
      const tiles = modeSelectorMain.value?.querySelectorAll('.tile');
      tiles?.forEach(tile => {
        if (tile.id === String(props.selectedMode)) {
          tile.classList.add('selected');
        }
      });
    });

    return {
      modeSelectorMain,
      possibleModeTiles,
      cssVars,
      handleMouseOver,
      handleMouseOut
    }
  }
})
</script>

<style scoped>
.modeSelectorMain {
  display: flex;
  flex-direction: row;
  width: 100%;
  height: 100%;
  background-color: #202621
}

.tile {
  width: var(--height);
  height: var(--height);
  border: 1px solid lightgrey;
  box-sizing: border-box;
  color: lightgrey;
  position: relative;
}

.tile:hover {
  background-color: #404d43;
  cursor: pointer;
  color: white;
}

.tile.selected {
  background-color: #404d43;
  color: white;
}

.tileText {
  position: absolute;
  bottom: 1px;
  right: 5px;
  font-size: 10px;
  text-align: right;
  pointer-events: none;
}
</style>
