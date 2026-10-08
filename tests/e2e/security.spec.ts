import {readFileSync} from 'node:fs';import {expect,test} from '@playwright/test';
test('loads and validates backups under the deployed strict script policy',async({page})=>{
 const policy=readFileSync('public/_headers','utf8').split('\n').find(line=>line.trim().startsWith('Content-Security-Policy:'))!.trim().slice('Content-Security-Policy:'.length).trim();
 expect(policy).not.toContain('unsafe-eval');const errors:string[]=[];page.on('pageerror',e=>errors.push(e.message));
 await page.route('**/',async route=>{const response=await route.fetch();await route.fulfill({response,headers:{...response.headers(),'content-security-policy':policy}})});
 await page.goto('/');await expect(page.getByRole('button',{name:'Start Quick 10 →'})).toBeVisible();await page.getByRole('link',{name:'Settings',exact:true}).click();await page.getByLabel('Import backup').setInputFiles({name:'invalid.json',mimeType:'application/json',buffer:Buffer.from('{}')});await expect(page.getByRole('alert')).toContainText('schemaVersion');expect(errors).toEqual([]);
});
