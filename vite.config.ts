import {  defineConfig, loadEnv } from 'vite';
import tsconfigpaths from 'vite-tsconfig-paths';
import circleDependency from 'vite-plugin-circular-dependency'

export default defineConfig(({  mode }) => {

  const env = loadEnv(mode, process.cwd(), '')

  return {
    plugins: [
      tsconfigpaths(),
      circleDependency(),
    ],
    resolve: {
      alias: {
        src: '/src',
      },
    },
    esbuild: {
      pure: ['console.log'],
    },
    base: '/',
    build: {
      outDir: './build',
      assetsDir: './static',
      
      rollupOptions: {
        external: ['pdfjs-dist'],
        output: {
          exports: 'named',
          globals: {
            'pdfjs-dist': 'pdfjsLib',
          },
          manualChunks: (id) => {
            if (id.includes('@lexical/')) {
              return 'editor';
            }
            if (id.includes('@tanstack/react-table')) {
              return 'table';
            }
            if (id.includes('react-datepicker')) {
              return 'datepicker';
            }
            if (id.includes('apexcharts')) {
              return 'apexcharts';
            }
          }
        },
      },
    },
    assetsInclude: ['/sb-preview/runtime.js'],
  
    server: {
      port: Number(env.VITE_PORT) || 3000,
      proxy: {
        '/api': {
          target: env.VITE_BACKEND_URL,
          changeOrigin: true,
          secure: false,
          ws: true,
        },
        '/chat': {
          target: env.VITE_BACKEND_URL,
          changeOrigin: true,
          secure: false,
          ws: true,
        },
        '/token': {
          target: env.VITE_BACKEND_URL,
          changeOrigin: true,
          secure: false,
          ws: true,
        },
        '/nano': {
          target: env.VITE_BACKEND_URL,
          changeOrigin: true,
          secure: false,
          ws: true,
        },
        '/UIService': {
          target: env.VITE_BACKEND_URL,
          changeOrigin: true,
          secure: false,
          ws: true,
        },
      },
    },
  }
})