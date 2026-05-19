import { defineConfig } from 'vite'
import react, { reactCompilerPreset } from '@vitejs/plugin-react'
import babel from '@rolldown/plugin-babel'

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react(),
    babel({ presets: [reactCompilerPreset()] })
  ],
  server: {
    port: 3000,
    host: true, // Дозволяє доступ по IP в локальній мережі
    proxy: {
      // 🚀 МАГІЯ CORS: перехоплюємо всі запити, що починаються на /api
      '/api': {
        target: 'https://avyro.onrender.com', // Реальна адреса бекенду Сані
        changeOrigin: true,                   // Підміняємо Origin, щоб бекенд не блокував запит
        rewrite: (path) => path.replace(/^\/api/, '') // Відрізаємо '/api' перед відправкою на Onrender
      }
    }
  }
})
