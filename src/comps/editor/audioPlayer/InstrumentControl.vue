<template>
  <div class='instControlMain' :style='mainStyle'>
    <div class='topBox'>
      <div class='title'>{{  synthControl.inst }}</div>
      <div class='sonifyCheck'>
        <label :for='`sonifyToggle${synthControl.idx}`'>Sonify</label>
        <input :id='`sonifyToggle${synthControl.idx}`' type='checkbox' v-model='sonifyProxy' />
      </div>
    </div>
    <div :class='["controlCol", { "singleItem": sliders.length === 1 }]'>
      <div class='controlRow' v-for='(slider, index) in sliders' :key='index'>
        <label>{{ slider.label }}</label>
        <input 
          type='range' 
          min='0' 
          max='1' 
          step='0.01' 
          v-model.number='slider.target'
          @input='updateParam(slider, $event)'
          :ref='`slider`'
          :class='`slider${index}`'
          :disabled='index === 0 ? slider0Disabled : false'
        />
      </div>
    </div>
  </div>
</template>
<script lang='ts'>
import { defineComponent, PropType, computed, ref } from 'vue'
import { 
  SynthControl, 
  SitarSynthControl, 
  SarangiSynthControl,
  KlattSynthControl,
  SynthType,
  SitarSynthType,
  SarangiSynthType,
  KlattSynthType 
} from '@shared/types';
import { Instrument } from '@shared/enums';

export default defineComponent({
  name: 'InstrumentControl',
  props: {
    synthControl: {
      type: Object as PropType<SynthControl>,
      required: true
    },
    height: {
      type: Number,
      required: true
    },
    sonify: {
      type: Boolean,
      required: true
    },
  },
  emits: ['update:sonify', 'update:gainNode', 'update:cutoff'],
  setup(props, { emit }) {
    const tempSynthControl = ref<SynthControl>(props.synthControl);
    const sonifyProxy = computed({
      get() {
        return props.sonify
      },
      set(val) {
        emit('update:sonify', val)
      }
    });
    const slider = ref<HTMLInputElement[] | null>(null);
    const slider0Disabled = ref(false);
    const slider0TempVal = ref(0);

    
    const sliders = computed(() => {
      const inst = tempSynthControl.value.inst;
      if (inst === Instrument.Sitar) {
        const sc = props.synthControl as SitarSynthControl;
        return [
          { 
            label: 'Volume', 
            target: sc.params.outGain,
            paramName: 'outGainNode',
            instIdx: sc.idx
          },
          { 
            label: 'String', 
            target: sc.params.extSitarGain,
            paramName: 'extSitarGainNode',
            instIdx: sc.idx 
          },
          { 
            label: 'Chikari', 
            target: sc.params.extChikariGain,
            paramName: 'extChikariGainNode',
            instIdx: sc.idx 
          },
          { 
            label: 'Dampen', 
            target: sc.params.dampen,
            paramName: 'sitarNode',
            instIdx: sc.idx

          },
        ]
      } else if (inst === Instrument.Sarangi) {
        const sarControl = props.synthControl as SarangiSynthControl;
        return [
          { 
            label: 'Volume', 
            target: sarControl.params.extSarangiGain,
            paramName: 'extGain',
            instIdx: sarControl.idx
          }
        ]
      } else if (inst === Instrument.Vocal_M || inst === Instrument.Vocal_F) {
        const kc = props.synthControl as KlattSynthControl;
        return [
          { 
            label: 'Volume', 
            target: kc.params.extGain,
            paramName: 'extGain',
            instIdx: kc.idx
          }
        ]
      } else {
        throw new Error('Instrument not recognized')
      }
    });

    const updateParam = (
      slider: {
        label: string,
        target: number,
        paramName: string,
        instIdx: number
      },
      event: Event
    
    ) => {
      if (slider.label === 'Dampen') {
        emit('update:cutoff', slider)
      } else {
        emit('update:gainNode', slider)
      }
    };

    const reemitParams = () => {
      sliders.value.forEach(slider => {
        // Create a dummy input event if needed (or simply pass undefined)
        updateParam(slider, new Event('input'));
      });
    };


    const mainStyle = computed(() => {
      return {
        '--height': props.height + 'px',
        '--topBoxHeight': '70px'
      }
    })
    const instControlHeight = props.height + 'px'
    return { 
      instControlHeight,
      sonifyProxy,
      mainStyle,
      sliders,
      updateParam,
      slider0Disabled,
      slider,
      slider0TempVal,
      reemitParams
     }
  }
})
</script>
<style scoped>

.instControlMain {
  width: 200px;
  height: var(--height);
  display: flex;
  flex-direction: column;
  border-left: 1px solid white;
  box-sizing: border-box;
}

.topBox {
  display: flex;
  justify-content: center;
  align-items: top;
  position: relative;
  height: 70px;
  border-bottom: 1px solid white;
  box-sizing: border-box;
}

.title {
  text-align: center;
  font-size: 1.3em;
  height: 50px;
  display: flex;
  justify-content: center;
  align-items: center;
}

.sonifyCheck {
  position: absolute;
  bottom: 2px;
  right: 0px;
  width: 70px;
}

.sonifyCheck > label {
  text-align: right;
}

.controlCol {
  display: flex;
  flex-direction: column;
  justify-content: space-evenly;
  align-items: center;
  height: calc(var(--height) - var(--topBoxHeight));
  padding-top: 5px;
  padding-bottom: 5px;
}

.controlRow {
  display: flex;
  justify-content: space-between;
  align-items: center;
  height: 30px;
  
}

.controlRow > label {
  width: 90px;
  text-align: right;
}

.controlRow > input {
  width: 110px;
  margin-right: 10px;
  margin-left: 10px;
}

.controlCol.singleItem {
  /* justify-content: top; */
justify-content: flex-start;
}

label {
  font-size: 14px;
}
</style>
