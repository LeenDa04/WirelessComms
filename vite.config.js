// vite.config.js
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  base: './',
  plugins: [react()],
  preview: {
    // listens on any IPv4 address,
    // so Render can forward public traffic here
    host: '0.0.0.0',
    // match the port you’re using on Render
    port: 10000,
    // disable strict host checking
    strict: false,
    // OR, if you’d rather keep strict mode on and whitelist
    // allowedHosts: ['wirelesscomms.onrender.com'],
  },
})
