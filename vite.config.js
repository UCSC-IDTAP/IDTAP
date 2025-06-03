import { defineConfig } from 'vite';
import vue from '@vitejs/plugin-vue';
import vueDevTools from 'vite-plugin-vue-devtools';
import Markdown from 'unplugin-vue-markdown/vite';
import path from 'path';

export default defineConfig(({ command }) => {
  return {
    plugins: [
      Markdown(),
      vue({
        include: [/\.vue$/, /\.md$/],
      }),
      vueDevTools(),
    ],
    // Only include the asset pattern in build mode.
    ...(command === 'build'
      ? { assetsInclude: /src\/audioWorklets\/.*\.worklet\.js$/ }
      : {}),
    build: {
      sourcemap: true,
    },
    optimizeDeps: {
      include: ['vexflow']
    },
    resolve: {
      alias: {
        "@": path.resolve(__dirname, "./src"),
        '@shared': path.resolve(__dirname, './shared'),
        '@model': path.resolve(__dirname, './src/ts/model'),
      },
    },
    server: {
      port: 3000,
    },
  };
});
