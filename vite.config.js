<<<<<<< HEAD
=======
// vite.config.js
>>>>>>> dcb7593 (Inicializando repositório com código atualizado)
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
<<<<<<< HEAD
      '@': path.resolve(__dirname, 'src'), // Permite usar ''@/firebase', '@/pages', etc.
    },
  },
  build: {
    outDir: 'dist' // Mantém seu destino de build
  }
})
=======
      '@': path.resolve(__dirname, './src')
    }
  }
})
>>>>>>> dcb7593 (Inicializando repositório com código atualizado)
