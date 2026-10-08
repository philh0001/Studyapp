import {defineConfig} from 'vitest/config';
import react from '@vitejs/plugin-react';
import {VitePWA} from 'vite-plugin-pwa';

export default defineConfig({
 build:{rolldownOptions:{output:{codeSplitting:{groups:[{name:'validators',test:/\/src\/content\/generated\/validators\.js$/,priority:30},{name:'question-bank',test:/\/content\/(packs|sources)\/.*\.json$/,priority:20},{name:'study-data',test:/\/content\/audits\/full-bank-review\.json$/,priority:15},{name:'learning-data',test:/\/content\/learning\/.*\.json$/,priority:15},{name:'vendor',test:/\/node_modules\//,priority:10}]}}}},
 plugins:[react(),{name:'offline-asset-inventory',apply:'build',generateBundle(_options,bundle){const files=[...Object.keys(bundle).filter(name=>name.endsWith('.js')||name.endsWith('.css')||name.endsWith('.html')),'index.html','manifest.webmanifest','icons/icon-192.png','icons/icon-512.png','icons/maskable-512.png','offline-assets.json'];this.emitFile({type:'asset',fileName:'offline-assets.json',source:JSON.stringify({version:1,files:[...new Set(files)].sort()})})}},VitePWA({
  registerType:'prompt', injectRegister:false,
  manifest:{name:'Studyapp — AZ-104 revision',short_name:'Studyapp',description:'Personal AZ-104 revision with original scenarios, local progress, and offline study.',start_url:'/',scope:'/',display:'standalone',background_color:'#f7f5ef',theme_color:'#143d34',icons:[{src:'/icons/icon-192.png',sizes:'192x192',type:'image/png'},{src:'/icons/icon-512.png',sizes:'512x512',type:'image/png'},{src:'/icons/maskable-512.png',sizes:'512x512',type:'image/png',purpose:'maskable'}]},
  workbox:{globPatterns:['**/*.{js,css,html,json,svg,png,webmanifest}'],maximumFileSizeToCacheInBytes:8*1024*1024,navigateFallback:'index.html',cleanupOutdatedCaches:true,skipWaiting:false,clientsClaim:false},
 })],
 test:{environment:'jsdom',include:['tests/**/*.test.ts','tests/**/*.test.tsx'],setupFiles:['./tests/setup.ts']},
});
