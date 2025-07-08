import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
    plugins: [react()],
    server: {
        proxy: {
            // ① forward anything beginning with /api → http://localhost:5000
            '/api': {
                target: 'http://localhost:5000',
                changeOrigin: true,   // sets Host header to target host
                secure: false,        // ignore self‑signed SSL certs if using https
                // rewrite: path => path.replace(/^\/api/, ''), // optional
            },
        },
        port: 80,
    },
})
