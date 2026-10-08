import {defineConfig} from 'vitest/config';
import react from '@vitejs/plugin-react';
import {VitePWA} from 'vite-plugin-pwa';

export default defineConfig({
 plugins:[react(),VitePWA({
  registerType:'prompt', injectRegister:false,
  manifest:{name:'Studyapp — AZ-104 revision',short_name:'Studyapp',description:'Personal AZ-104 revision with original scenarios, local progress, and offline study.',start_url:'/',scope:'/',display:'standalone',background_color:'#f7f5ef',theme_color:'#143d34',icons:[{src:'/icons/icon-192.png',sizes:'192x192',type:'image/png'},{src:'/icons/icon-512.png',sizes:'512x512',type:'image/png'},{src:'/icons/maskable-512.png',sizes:'512x512',type:'image/png',purpose:'maskable'}]},
  workbox:{globPatterns:['**/*.{js,css,html,json,svg,png,webmanifest}'],navigateFallback:'index.html',cleanupOutdatedCaches:true,skipWaiting:false,clientsClaim:false},
 })],
 test:{environment:'jsdom',include:['tests/**/*.test.ts','tests/**/*.test.tsx'],setupFiles:['./tests/setup.ts']},
});
