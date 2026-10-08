import {readFile} from 'node:fs/promises';
import {expect,test} from '@playwright/test';

test('recovery captures edits made after inspection and stale copies cannot replace newer data',async({page})=>{
 await page.goto('/#/settings');await page.getByLabel('Appearance').selectOption('dark');await expect(page.getByRole('status').filter({hasText:'Changes saved'})).toBeVisible();const exporting=page.waitForEvent('download');await page.getByRole('button',{name:'Export backup',exact:true}).click();const original=await readFile((await (await exporting).path())!,'utf8');await page.getByLabel('Appearance').selectOption('light');await page.getByLabel('Import backup').setInputFiles({name:'personal.json',mimeType:'application/json',buffer:Buffer.from(original)});await expect(page.getByRole('button',{name:'Download recovery backup'})).toBeVisible();await page.getByLabel('Exam date').fill('2029-02-03');await expect(page.getByRole('status').filter({hasText:'Changes saved'})).toBeVisible();const recovery=page.waitForEvent('download');await page.getByRole('button',{name:'Download recovery backup'}).click();const contents=await readFile((await (await recovery).path())!,'utf8');expect(JSON.parse(contents).settings[0]).toMatchObject({theme:'light',examDate:'2029-02-03'});await page.getByLabel('Text size').selectOption('1.2');await expect(page.getByRole('status').filter({hasText:'Changes saved'})).toBeVisible();await page.getByRole('button',{name:'Confirm replace'}).click();await expect(page.getByRole('alert').filter({hasText:'Local data changed since the recovery download'})).toBeVisible();await expect(page.getByRole('button',{name:'Confirm replace'})).toBeDisabled();await expect(page.getByLabel('Exam date')).toHaveValue('2029-02-03');await expect(page.getByLabel('Appearance')).toHaveValue('light');const fresh=page.waitForEvent('download');await page.getByRole('button',{name:'Download recovery backup'}).click();expect(JSON.parse(await readFile((await (await fresh).path())!,'utf8')).settings[0].textScale).toBe(1.2);await page.getByRole('button',{name:'Confirm replace'}).click();await expect(page.getByRole('status').filter({hasText:'Backup restored.'})).toBeVisible();await expect(page.getByLabel('Appearance')).toHaveValue('dark');
});

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
