import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@/': `${path.resolve(__dirname, 'src')}/`,
    },
  },
  server: {
    proxy: {
      '^/(eservices|producers)': {
        target: 'https://dev.stato-eservice.interop.pagopa.it',
        changeOrigin: true,
        secure: false,
      },
    },
  },
})