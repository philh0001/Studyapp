import {readFile} from 'node:fs/promises';
import {expect,test} from '@playwright/test';
import type {ContentPack} from '../../src/content/types';
import type {Session} from '../../src/sessions/types';

test('all 300 installed drafts and 82 distinct subskills remain honest about approval',async({page})=>{
 await page.goto('/#/practice');await page.getByRole('button',{name:/Draft preview/}).click();await expect(page.locator('main')).toContainText('300 questions installed');
 const installed=await page.evaluate(()=>new Promise<number>((resolve,reject)=>{const request=indexedDB.open('az104-studyapp');request.onerror=()=>reject(request.error);request.onsuccess=()=>{const db=request.result;const get=db.transaction('packs').objectStore('packs').getAll();get.onsuccess=()=>{resolve(get.result.reduce((total,pack)=>total+pack.questions.length,0));db.close()};get.onerror=()=>reject(get.error)}}));expect(installed).toBe(300);
 await page.goto('/#/progress/coverage');await expect(page.getByRole('heading',{name:'Explore your coverage.'})).toBeVisible();await expect(page.locator('.objective-row')).toHaveCount(82);await expect(page.locator('.objective-row').first()).toContainText('0 approved');
 expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth)).toBe(true);
});

test('real draft ordering and matching keep timed feedback hidden until durable finalisation',async({page})=>{
 const pack=JSON.parse(await readFile('content/packs/az104-identity-expanded-draft.json','utf8')) as ContentPack;
 const questions=['ordering','matching'].map(type=>pack.questions.find(q=>q.type===type)!);expect(questions.every(Boolean)).toBe(true);
 await page.goto('/');await expect(page.getByRole('button',{name:'Explore draft questions →'})).toBeVisible();
 const session:Session={id:'browser-format-fixture',mode:'draft-preview',questionSnapshots:questions,optionOrders:Object.fromEntries(questions.map(q=>[q.id,q.options.map(o=>o.id)])),answers:{},flags:[],currentIndex:0,startedAt:new Date().toISOString(),deadlineAt:new Date(Date.now()+30*60000).toISOString(),status:'active',submittedAt:null,correctionWarnings:[]};
 // This disposable browser uses actual bundled drafts and grants no factual approval.
 await page.evaluate(value=>new Promise<void>((resolve,reject)=>{const request=indexedDB.open('az104-studyapp');request.onerror=()=>reject(request.error);request.onsuccess=()=>{const db=request.result;const transaction=db.transaction('sessions','readwrite');transaction.objectStore('sessions').put(value);transaction.oncomplete=()=>{db.close();resolve()};transaction.onerror=()=>reject(transaction.error)}}),session);
 await page.goto('/#/session/browser-format-fixture');await page.reload();await expect(page.getByRole('timer',{name:'Time remaining'})).toBeVisible();await expect(page.getByRole('heading',{name:'Microsoft Learn sources'})).toHaveCount(0);
 await page.getByRole('button',{name:'Use this order',exact:true}).click();await page.getByRole('button',{name:'Save & next',exact:true}).click();
 await expect(page.getByRole('heading',{name:questions[1].prompt,exact:true})).toBeVisible();
 const selects=page.getByRole('group',{name:'Answer choices'}).getByRole('combobox');for(let index=0;index<questions[1].correctOptionIds.length;index++)await selects.nth(index).selectOption(questions[1].correctOptionIds[index]);
 await expect(page.getByRole('heading',{name:'Microsoft Learn sources'})).toHaveCount(0);await page.reload();await expect(selects.nth(0)).toHaveValue(questions[1].correctOptionIds[0]);
 await page.getByRole('button',{name:'Save & next',exact:true}).click();const confirmation=page.getByRole('group',{name:'Confirm practice submission'});await expect(confirmation).toBeVisible();await expect(page.getByRole('heading',{name:'Microsoft Learn sources'})).toHaveCount(0);await confirmation.getByRole('button',{name:'Confirm submission',exact:true}).click();await expect(page.getByRole('heading',{name:'Session complete'})).toBeVisible();await page.locator('details summary').first().click();await expect(page.locator('details').first().getByRole('heading',{name:'Microsoft Learn sources'})).toBeVisible();await page.reload();await expect(page.getByRole('heading',{name:'Session complete'})).toBeVisible();
 await page.goto('/#/progress/coverage');await expect(page.locator('.objective-row').first()).toContainText('0 distinct studied');
});

test('device checks start unclaimed, support keyboard, persist reload and reset',async({page})=>{
 await page.goto('/#/settings');const panel=page.locator('.device-checklist');await expect(panel).toContainText('No physical-device checks recorded.');const first=panel.getByRole('checkbox').first();await first.focus();await page.keyboard.press('Space');await expect(first).toBeChecked();await expect(panel).toContainText('1 of 5 physical-device checks recorded by you.');await page.reload();await expect(first).toBeChecked();await panel.getByRole('button',{name:'Reset device checks',exact:true}).click();await expect(first).not.toBeChecked();await expect(panel).toContainText('No physical-device checks recorded.');
});

test('starts a whole linked draft case through the real practice controls',async({page})=>{
 await page.goto('/#/practice');await page.getByRole('button',{name:/Draft preview/}).click();await page.getByLabel('Practice format').selectOption('case-study');const group=await page.getByRole('combobox',{name:'Case study',exact:true}).inputValue();await page.getByRole('button',{name:'Start session →'}).click();await expect(page.getByRole('timer',{name:'Time remaining'})).toBeVisible();
 const saved=await page.evaluate(()=>new Promise<Session>((resolve,reject)=>{const request=indexedDB.open('az104-studyapp');request.onsuccess=()=>{const db=request.result,get=db.transaction('sessions').objectStore('sessions').getAll();get.onsuccess=()=>{resolve(get.result.find((s:Session)=>s.status==='active'));db.close()};get.onerror=()=>reject(get.error)}}));expect(saved.questionSnapshots).toHaveLength(3);expect(saved.questionSnapshots.every(q=>q.caseStudy?.id===group)).toBe(true);expect(saved.mode).toBe('draft-preview');
 await expect(page.getByRole('heading',{name:'Microsoft Learn sources'})).toHaveCount(0);await page.getByRole('button',{name:'Finish practice',exact:true}).click();await page.getByRole('group',{name:'Confirm practice submission'}).getByRole('button',{name:'Confirm submission',exact:true}).click();await expect(page.getByRole('heading',{name:'Session complete'})).toBeVisible();await expect(page.locator('main')).toContainText('does not affect your scored progress');
});

test('real timed draft start allocates twenty mixed questions to published domain weights',async({page})=>{
 await page.goto('/#/practice');await page.getByRole('button',{name:/Draft preview/}).click();await page.getByRole('checkbox',{name:/Use a practice timer/}).check();await page.getByRole('button',{name:'Start session →'}).click();await expect(page.getByRole('timer',{name:'Time remaining'})).toBeVisible();
 const saved=await page.evaluate(()=>new Promise<Session>((resolve,reject)=>{const request=indexedDB.open('az104-studyapp');request.onsuccess=()=>{const db=request.result,get=db.transaction('sessions').objectStore('sessions').getAll();get.onsuccess=()=>{resolve(get.result.find((s:Session)=>s.status==='active'));db.close()};get.onerror=()=>reject(get.error)}}));expect(saved.questionSnapshots).toHaveLength(20);expect(['identity','storage','compute','networking','monitoring'].map(id=>saved.questionSnapshots.filter(q=>q.domainId===id).length)).toEqual([5,4,5,4,2]);expect(saved.questionSnapshots.every(q=>!q.assessmentReserved&&!q.caseStudy)).toBe(true);
});
