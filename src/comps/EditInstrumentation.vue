<template>
  <div class='modal'>
    <div class='editInstrumentation'>
      <div class='formRow'>
        <label>Number of Instruments</label>
        <div class='selectRow'>
          <input 
            type='number' 
            v-model='instrumentationLength' 
            min='1' 
            max='4'
            />
        </div>
      </div>
      <div class='formRow tall' v-if='instrumentation'>
        <label>Instrumentation</label>
        <div class='selectCol'>
          <div class='selectRow' v-for='(inst, i) in instrumentation' :key='i'>
            <select v-model='instrumentation[i]'>
              <option v-for='inst in instruments' :key='inst'>
                {{inst}}
              </option>
            </select>
          </div>
        </div>
      </div>
      <div class='formRow' v-if='destructive || !permissible || unsavedChanges'>
        <div class='warning' v-if='destructive'>
        {{ warningText }}
        </div>
        <div class='warning' v-if='!permissible'>
          {{ permissionText }}
        </div>
        <div class='warning' v-if='unsavedChanges'>
          Warning: You have unsaved changes. Save before updating instrumentation.
        </div>
      </div>
      <div class='buttonRow'>
        <button 
          @click='submitNewInstrumentation'
          :disabled='
            !altered || 
            instrumentation.some(i => i === undefined) ||
            unsavedChanges'
          >
          Submit
        </button>
      </div>
    </div>
  </div>
</template>
<script lang='ts'>
import { 
  defineComponent, 
  onMounted, 
  ref, 
  computed, 
  watch, 
  PropType,
  onUnmounted 
} from 'vue';
import { useStore } from 'vuex';
import { 
  getTranscriptionInstrumentation, 
  updateInstrumentation 
} from '@/js/serverCalls.ts';
import { TransMetadataType } from '@shared/types';
import { Instrument } from '@shared/enums';
export default defineComponent({
  name: 'EditInstrumentation',
  props: {
    transMetadata: {
      type: Object as PropType<TransMetadataType>,
      required: true
    },
    unsavedChanges: {
      type: Boolean,
      default: false
    }
  },
  emits: ['close'],
  setup(props, { emit }) {
    const store = useStore();
    const instrumentation = ref<(Instrument | undefined)[]>([]);
    const initInstrumentation = ref<Instrument[]>([]);
    const instruments: Instrument[] = [
      Instrument.Sitar,
      Instrument.Sarangi,
      Instrument.Vocal_M,
      Instrument.Vocal_F,
    ];
    const warningText = 'Warning: Changing or removing an instrument will \
      result in the loss of all saved data associated with that instrument.';
    const permissionText = 'You do not have permission to edit this \
      transcription.';
    const instrumentationLength = computed({
      get() {
        return instrumentation.value.length;
      },
      set(newVal: number) {
        if (newVal > instrumentation.value.length) {
          for (let i = instrumentation.value.length; i < newVal; i++) {
            if (initInstrumentation.value[i]) {
              instrumentation.value.push(initInstrumentation.value[i]);
            } else {
              instrumentation.value.push(undefined)
            }
          }
        } else if (newVal < instrumentation.value.length) {
          instrumentation.value = instrumentation.value.slice(0, newVal)
        }
      }
    });
    const destructive = computed(() => {
      return initInstrumentation.value.some((inst, i) => {
        if (instrumentation.value[i] === undefined) {
          return true;
        }
        return inst !== instrumentation.value[i];
      });
    });
    const permissible = computed(() => {
      return permissionToEdit(props.transMetadata);
    });
    const altered = computed(() => {
      const c1 = initInstrumentation.value.some((inst, i) => {
        return inst !== instrumentation.value[i];
      })
      const c2 = initInstrumentation.value.length !== instrumentation.value.length;
      return c1 || c2;
    });
    const permissionToEdit = (piece: TransMetadataType) => {
      const id = store.state.userID!;
      const c1 = id === piece.userID;
      const c2 = piece.explicitPermissions.edit.includes(id);
      return c1 || c2;
    };
    const submitNewInstrumentation = async () => {
      if (permissible.value) {
        if (instrumentation.value.some(i => i === undefined)) {
          throw new Error('Instrumentation not fully defined');
        }
        const insts = instrumentation.value as Instrument[];
        try {
          await updateInstrumentation(props.transMetadata._id, insts);
        } catch (e) {
          console.error(e);
        }
        emit('close')
      }
    };

    watch(instrumentationLength, newVal => {
      if (newVal > 4) {
        instrumentationLength.value = 4;
      }
      if (newVal < 1) {
        instrumentationLength.value = 1;
      }
    })

    onMounted(async () => {
      initInstrumentation.value = await getTranscriptionInstrumentation(props.transMetadata._id);
      instrumentation.value = [...initInstrumentation.value];
      window.addEventListener('click', (e) => {
        if (e.target === document.querySelector('.modal')) {
          emit('close');
        }
      });
    });

    onUnmounted(() => {
      window.removeEventListener('click', (e) => {
        if (e.target === document.querySelector('.modal')) {
          emit('close');
        }
      });
    });
    
    return {
      instrumentation,
      instrumentationLength,
      instruments,
      destructive,
      warningText,
      initInstrumentation,
      altered,
      permissionText,
      permissible,
      submitNewInstrumentation

    }

  }
})
</script>
<style scoped>
  .editInstrumentation {
    display: flex;
    flex-direction: column;
    align-items: center;
    width: 350px;
    height: 250px;
    background-color: lightgrey;
    border: 1px solid black;
    margin-top: 20vh;
  }

  .modal {
    display: flex;
    justify-content: center;
    align-items: flex-start;
    height: 100vh;
    width: 100vw;
    position: absolute;
    top: 0;
    left: 0;
  }

  .formRow {
    width: 100%;
    display: flex;
    flex-direction: row;
    justify-content: left;
    align-items: center;
    height: 40px;
  }

  label {
    width: 120px;
    min-width: 120px;
    display: flex;
    flex-direction: row;
    justify-content: right;
    padding-right: 10px;
    margin: 10px;
    height: 30px;
  }

  .formRow input {
    width: 40px;
  }
  
  select {
    width: 130px;
    max-width: 130px;
    min-width: 130px;
  }

.selectRow {
  display: flex;
  flex-direction: row;
  justify-content: left;
  align-items: center;
  margin: 4px;
}

.tall {
  height: 120px;
}

.buttonRow {
  display: flex;
  flex-direction: row;
  justify-content: center;
  align-items: center;
  height: 40px;
}

.warning {
  width: 100%;
  display: flex;
  flex-direction: row;
  justify-content: center;
  align-items: center;
  color: red;
  font-size: 13px;
}


</style>
