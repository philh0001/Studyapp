import {defineConfig,devices} from '@playwright/test';
export default defineConfig({
 testDir:'./tests/e2e',fullyParallel:false,timeout:45000,
 use:{baseURL:'http://127.0.0.1:4173',trace:'retain-on-failure',screenshot:'only-on-failure'},
 projects:[{name:'chromium',use:{...devices['Desktop Chrome']}},{name:'mobile-chromium',use:{...devices['Desktop Chrome'],viewport:{width:390,height:844},isMobile:true,hasTouch:true}}],
 webServer:{command:'npm run build && npm exec vite -- preview --host 0.0.0.0 --port 4173 --strictPort',url:'http://127.0.0.1:4173',reuseExistingServer:false,timeout:120000},
});
