import {expect,test} from '@playwright/test';
import {chooseAnswer} from './answer';

test('fresh phone setup selects the shown filters and starts Learn without extra steps',async({page})=>{
 await page.goto('/#/practice');
 await expect(page.getByRole('button',{name:/Draft preview/})).toHaveCount(0);
 await expect(page.getByLabel('Study area')).toHaveValue('');
 await expect(page.getByRole('combobox',{name:/^Objective/})).toHaveValue('');
 await expect(page.getByLabel('Specific skill')).toHaveValue('');
 await expect(page.getByRole('combobox',{name:/^Difficulty/})).toHaveValue('');
 await expect(page.getByLabel('Practice format')).toHaveValue('standard');
 await expect(page.locator('details.practice-options')).not.toHaveAttribute('open','');
 await expect(page.getByRole('checkbox',{name:/Include fresh reserved/})).not.toBeVisible();
 let dialogs=0;page.on('dialog',async dialog=>{dialogs++;await dialog.dismiss()});
 await page.getByRole('button',{name:'Start session →'}).click();
 await expect(page.getByRole('group',{name:'Answer choices'})).toBeVisible();
 expect(dialogs).toBe(0);
 await chooseAnswer(page);await page.getByRole('radio',{name:'Unsure',exact:true}).check();await page.getByRole('button',{name:'Submit answer',exact:true}).click();
 await expect(page.getByRole('heading',{name:'Microsoft Learn sources'})).toBeVisible();
 await page.getByRole('button',{name:'Pause & return home'}).click();
 await page.getByRole('link',{name:'Progress',exact:true}).click();
 await expect(page.locator('.stat').filter({hasText:'Unique questions studied'})).toContainText('1');
 await page.getByRole('link',{name:'Review',exact:true}).click();await page.getByRole('button',{name:'Unsure / guessed',exact:true}).click();
 await expect(page.locator('main')).toContainText('1 questions in this queue');
 const approvals=await page.evaluate(()=>new Promise<number>((resolve,reject)=>{const open=indexedDB.open('az104-studyapp');open.onerror=()=>reject(open.error);open.onsuccess=()=>{const db=open.result,get=db.transaction('contentTrust').objectStore('contentTrust').getAll();get.onsuccess=()=>{resolve(get.result.filter(row=>row.humanReviewedAt).length);db.close()}}}));expect(approvals).toBe(0);
});

test('an old preview link opens standard practice and records a scored Learn session',async({page})=>{
 await page.goto('/#/practice?mode=draft-preview&count=5');await page.getByLabel('Study area').selectOption('storage');
 await page.getByRole('combobox',{name:/^Difficulty/}).selectOption('foundation');await page.getByRole('button',{name:'Start session →'}).click();
 await expect(page.getByRole('group',{name:'Answer choices'})).toBeVisible();
 const session=await page.evaluate(()=>new Promise<{mode:string;domains:string[]}>((resolve,reject)=>{const open=indexedDB.open('az104-studyapp');open.onerror=()=>reject(open.error);open.onsuccess=()=>{const db=open.result,get=db.transaction('sessions').objectStore('sessions').getAll();get.onsuccess=()=>{const s=get.result.find(row=>row.status==='active');resolve({mode:s.mode,domains:s.questionSnapshots.map((q:{domainId:string})=>q.domainId)});db.close()}}}));expect(session.mode).toBe('learn');expect(session.domains.every(d=>d==='storage')).toBe(true);
});
