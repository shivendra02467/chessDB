import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

export default defineConfig({
    plugins: [react(), tailwindcss()],
    server: {
        proxy: {
            '/api': {
                target: 'http://localhost:5000',
                changeOrigin: true,   // sets Host header to target host
                secure: false,        // ignore self-signed SSL certs if using https
                // rewrite: path => path.replace(/^\/api/, ''), // optional
            },
        },
        port: 3000,
    },
})
