import {readFile} from 'node:fs/promises';
import {expect,test} from '@playwright/test';

test('exports personal settings and restores them only after downloading a recovery backup',async({page})=>{
 await page.goto('/');await expect(page.getByRole('button',{name:'Explore draft questions →'})).toBeVisible();
 await page.getByRole('link',{name:'Settings',exact:true}).click();
 const examDate=page.getByLabel('Exam date'),appearance=page.getByLabel('Appearance');
 await examDate.fill('2027-03-19');await appearance.selectOption('dark');
 await expect(page.getByRole('status').filter({hasText:'Changes saved'})).toBeVisible();
 const exportEvent=page.waitForEvent('download');await page.getByRole('button',{name:'Export backup',exact:true}).click();
 const exported=await exportEvent;expect(exported.suggestedFilename()).toBe('az104-backup.json');
 const backupPath=await exported.path();expect(backupPath).not.toBeNull();
 const content=await readFile(backupPath!,'utf8');
 expect(content).toContain('2027-03-19');
 await examDate.fill('2027-06-21');await appearance.selectOption('light');
 await page.getByLabel('Import backup').setInputFiles({name:'personal-backup.json',mimeType:'application/json',buffer:Buffer.from(content)});
 const confirmation=page.getByRole('group',{name:'Confirm backup replacement'});
 await expect(confirmation).toBeVisible();await expect(confirmation.getByRole('button',{name:'Confirm replace',exact:true})).toBeDisabled();
 await expect(examDate).toHaveValue('2027-06-21');
 const recoveryEvent=page.waitForEvent('download');await confirmation.getByRole('button',{name:'Download recovery backup',exact:true}).click();
 const recovery=await recoveryEvent;expect(recovery.suggestedFilename()).toBe('az104-recovery.json');
 expect(await readFile((await recovery.path())!,'utf8')).toContain('2027-06-21');
 await confirmation.getByRole('button',{name:'Confirm replace',exact:true}).click();
 await expect(page.getByRole('status').filter({hasText:'Backup restored.'})).toBeVisible();
 // Restored preferences must be visible immediately without remounting the settings page.
 await expect(page.getByLabel('Exam date')).toHaveValue('2027-03-19');await expect(page.getByLabel('Appearance')).toHaveValue('dark');
 await page.reload();await expect(page.getByLabel('Exam date')).toHaveValue('2027-03-19');
});

test('imports a local gzip backup and retains recovery-before-replacement safeguards',async({page})=>{
 await page.goto('/#/settings');await expect(page.getByRole('button',{name:'Export backup',exact:true})).toBeVisible();
 await page.getByLabel('Appearance').selectOption('dark');
 const downloaded=page.waitForEvent('download');await page.getByRole('button',{name:'Export backup',exact:true}).click();const json=await readFile((await (await downloaded).path())!,'utf8');
 const gzip=await page.evaluate(async text=>{const blob=await new Response(new Blob([text]).stream().pipeThrough(new CompressionStream('gzip'))).blob();return Array.from(new Uint8Array(await blob.arrayBuffer()))},json);
 await page.getByLabel('Appearance').selectOption('light');
 await page.getByLabel('Import backup').setInputFiles({name:'personal-backup.json.gz',mimeType:'application/gzip',buffer:Buffer.from(gzip)});
 const confirmation=page.getByRole('group',{name:'Confirm backup replacement'});await expect(confirmation).toBeVisible();await expect(confirmation.getByRole('button',{name:'Confirm replace',exact:true})).toBeDisabled();
 const recovery=page.waitForEvent('download');await confirmation.getByRole('button',{name:'Download recovery backup',exact:true}).click();await recovery;await confirmation.getByRole('button',{name:'Confirm replace',exact:true}).click();await expect(page.getByLabel('Appearance')).toHaveValue('dark');
});
