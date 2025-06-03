<template>
  <div class='trajAnnotationWindow'>
    <div class="tag-list">
      <div v-for="(tag, index) in tags" :key="index" class="tag-item">
        <input
          type="text"
          v-model="tags[index]"
          :placeholder="`Tag ${index + 1}`"
          :disabled="false"
          @keydown.stop
        />
      </div>
    </div>
    <div class="tag-controls">
      <button type="button" @click="removeTag" :disabled="tags.length === 1">-</button>
      <button type="button" @click="addTag">+</button>
    </div>
    <button type="button" class="update-button" @click="handleUpdate">Update</button>
  </div>
</template>
<script lang='ts'>
import { defineComponent, PropType, ref, onMounted } from 'vue';
import { Trajectory } from '@model';

export default defineComponent({
  name: 'TrajectoryAnnotator',
  props: {
    trajectory: {
      type: Object as PropType<Trajectory>,
      required: true,
    },
    x: {
      type: Number,
      required: true,
    },
    y: {
      type: Number,
      required: true,
    },
    width: {
      type: Number,
      required: true,
    },
    height: {
      type: Number,
      required: true,
    },
  },
  setup(props, { emit }) {
    const tags = ref<string[]>([]);

    const addTag = () => {
      tags.value.push('');
    }
    const removeTag = () => {
      tags.value.pop();
    }
    const handleUpdate = () => {
      props.trajectory.tags = tags.value;
      emit('closeWindow')
    }

    onMounted(() => {
      tags.value = props.trajectory.tags;
      if (tags.value.length === 0) {
        tags.value.push('');
      }
    });

    return {
      tags,
      addTag,
      removeTag,
      handleUpdate,
    }
  }

})
</script>
<style scoped>

.trajAnnotationWindow {
  position: absolute;
  background-color: white;
  border: 1px solid black;
  box-sizing: border-box;
  padding: 8px;
  width: v-bind(width + 'px');
  height: v-bind(height + 'px');
  top: v-bind(y + 'px');
  left: v-bind(x + 'px');
  z-index: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: flex-start;
}

.tag-list {
  flex: 1 1 auto;
  min-height: 0;
  overflow-y: auto;
  width: 100%;
  padding: 8px;
  box-sizing: border-box;
}
.tag-item {
  margin-bottom: 6px;
}
.tag-controls {
  display: flex;
  justify-content: center;
  margin: 8px 0;
}
.tag-controls button {
  margin: 0 4px;
}

.update-button {
  margin-bottom: 5px;
}

</style>
