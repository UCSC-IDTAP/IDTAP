<template>
  <div class="instructions-container">
    <div class="instructions-content" v-html="markdownHtml"></div>
  </div>
</template>

<script lang="ts">
import { defineComponent, ref, onMounted } from 'vue';
import { marked } from 'marked';

export default defineComponent({
  name: 'GeneralInstructions',
  setup() {
    const markdownHtml = ref('');

    onMounted(async () => {
      try {
        const response = await fetch('/general_instructions.md');
        const markdownText = await response.text();
        markdownHtml.value = marked(markdownText);
      } catch (error) {
        console.error('Error loading instructions:', error);
        markdownHtml.value = '<p>Error loading instructions. Please try again later.</p>';
      }
    });

    return {
      markdownHtml
    };
  }
});
</script>

<style scoped>
.instructions-container {
  width: 100%;
  height: 100vh;
  overflow-y: auto;
  background-color: #f5f5f5;
}

.instructions-content {
  max-width: 900px;
  margin: 0 auto;
  padding: 40px 20px;
  background-color: white;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
  line-height: 1.6;
}

.instructions-content :deep(h1) {
  color: #50945c;
  border-bottom: 2px solid #50945c;
  padding-bottom: 10px;
  margin-bottom: 30px;
}

.instructions-content :deep(h2) {
  color: #242660;
  margin-top: 40px;
  margin-bottom: 20px;
}

.instructions-content :deep(h3) {
  color: #333;
  margin-top: 30px;
  margin-bottom: 15px;
}

.instructions-content :deep(h4) {
  color: #555;
  margin-top: 20px;
  margin-bottom: 10px;
}

.instructions-content :deep(ul),
.instructions-content :deep(ol) {
  margin-left: 30px;
  margin-bottom: 15px;
}

.instructions-content :deep(li) {
  margin-bottom: 5px;
}

.instructions-content :deep(code) {
  background-color: #f0f0f0;
  padding: 2px 6px;
  border-radius: 3px;
  font-family: 'Courier New', Courier, monospace;
}

.instructions-content :deep(pre) {
  background-color: #f0f0f0;
  padding: 15px;
  border-radius: 5px;
  overflow-x: auto;
}

.instructions-content :deep(blockquote) {
  border-left: 4px solid #50945c;
  padding-left: 20px;
  margin-left: 0;
  color: #666;
}

.instructions-content :deep(strong) {
  color: #242660;
  font-weight: 600;
}

.instructions-content :deep(a) {
  color: #10abb6;
  text-decoration: none;
}

.instructions-content :deep(a:hover) {
  text-decoration: underline;
}

.instructions-content :deep(hr) {
  border: none;
  border-top: 1px solid #ddd;
  margin: 30px 0;
}
</style>