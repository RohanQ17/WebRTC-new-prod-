import { defineConfig } from 'vite'
import { resolve } from 'path'
import fs from 'fs'

export default defineConfig(({ command, mode }) => {
  const isProduction = mode === 'production'
  
  const config = {
    build: {
      outDir: 'dist',
      assetsDir: 'assets',
      minify: isProduction,
      sourcemap: !isProduction,
      rollupOptions: {
        input: {
          main: resolve(__dirname, 'index.html'),
          room: resolve(__dirname, 'room.html')
        }
      }
    }
  }

  // Only add server config for development
  if (!isProduction) {
    config.server = {
      port: 3000,
      host: '0.0.0.0',
      https: fs.existsSync('cert.key') && fs.existsSync('cert.crt') ? {
        key: fs.readFileSync('cert.key'),
        cert: fs.readFileSync('cert.crt')
      } : false,
      proxy: {
        '/get_app_id': {
          target: 'http://localhost:8080',
          changeOrigin: true,
        },
        '/get_token': {
          target: 'http://localhost:8080',
          changeOrigin: true,
        },
        '/create_member': {
          target: 'http://localhost:8080',
          changeOrigin: true,
        },
        '/get_member': {
          target: 'http://localhost:8080',
          changeOrigin: true,
        },
        '/delete_member': {
          target: 'http://localhost:8080',
          changeOrigin: true,
        },
        '/send_message': {
          target: 'http://localhost:8080',
          changeOrigin: true,
        },
        '/get_messages': {
          target: 'http://localhost:8080',
          changeOrigin: true,
        }
      }
    }
  }

  return config
})
