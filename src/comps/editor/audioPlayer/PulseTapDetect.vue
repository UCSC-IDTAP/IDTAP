<template>
</template>
<script lang='ts'>

import { defineComponent, PropType, watch, onUnmounted, ref, getCurrentInstance } from 'vue';

export default defineComponent({
	name: 'PulseTapDetect',
	props: {
		ac: {
			type: Object as PropType<AudioContext>,
			required: true
		},
		tapTracking: {
			type: Boolean,
			required: true
		},
		startPlayTime: {
			type: Number,
			required: true
		}
	},
  setup(props) {
    const instance = getCurrentInstance();
    const emitter = instance?.appContext.config.globalProperties.emitter;
    const acTimeAtStart = ref(0);

    const handleKeydown = (e: KeyboardEvent) => {
      if (e.key === '=') {
        // Calculate tap time in recording coordinates:
        // startPlayTime is where we were in the recording when tracking started
        // (ac.currentTime - acTimeAtStart) is how much real time has elapsed since then
        const tapTime = props.startPlayTime + (props.ac.currentTime - acTimeAtStart.value);
        emitter?.emit('pulseTap', tapTime);
      }
    };

    watch(() => props.tapTracking, (active) => {
      if (active) {
        acTimeAtStart.value = props.ac.currentTime;
        window.addEventListener('keydown', handleKeydown);
      } else {
        window.removeEventListener('keydown', handleKeydown);
      }
    });

    onUnmounted(() => {
      window.removeEventListener('keydown', handleKeydown);
    });

    return {}
  }
})
</script>
