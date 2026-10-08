import {expect,test} from '@playwright/test';

test('course notes navigate, save completion and reopen offline without a notes editor',async({page,context})=>{
 await page.setViewportSize({width:320,height:568});
 await page.goto('/');await page.evaluate(async()=>{await navigator.serviceWorker.ready});await page.reload();await expect.poll(()=>page.evaluate(()=>!!navigator.serviceWorker.controller)).toBe(true);
 await page.getByRole('link',{name:'Read & listen',exact:true}).click();
 await expect(page.getByRole('navigation',{name:'Main navigation'}).getByRole('link',{name:'Learn',exact:true})).toHaveAttribute('href','#/course');
 const nav=page.getByRole('navigation',{name:'Main navigation'});await expect(nav.getByRole('link')).toHaveCount(6);await expect(nav.getByRole('link',{name:'Learn',exact:true})).toHaveAttribute('aria-current','page');for(const link of await nav.getByRole('link').all()){const box=await link.boundingBox();expect(box!.width).toBeGreaterThanOrEqual(48);expect(box!.height).toBeGreaterThanOrEqual(48)}
 await expect(page.getByRole('heading',{name:'Read & listen',exact:true})).toBeVisible();
 await expect(page.getByLabel('Learning path')).toHaveCount(1);await expect(page.getByRole('combobox',{name:'Module',exact:true})).toHaveCount(1);
 await page.getByRole('combobox',{name:'Lesson',exact:true}).selectOption({label:'What is Azure Cloud Shell?'});
 await expect(page.locator('.course-points')).toContainText('Cloud Shell');
 await expect(page.locator('.course-explanations')).toBeVisible();await expect(page.locator('.course-explanations h3')).toHaveCount(3);const expandedText=await page.locator('.course-explanations').innerText();expect(expandedText.split(/\s+/).length).toBeGreaterThan(180);
 await page.getByRole('button',{name:'Mark as read',exact:true}).click();await expect(page.getByRole('button',{name:'Marked read ✓',exact:true})).toBeVisible();
 await page.getByRole('link',{name:'Home',exact:true}).click();await page.getByRole('link',{name:'Read & listen',exact:true}).click();
 await expect(page.getByRole('heading',{name:'What is Azure Cloud Shell?',exact:true})).toBeVisible();await expect(page.getByRole('button',{name:'Marked read ✓',exact:true})).toBeVisible();
 await context.setOffline(true);await page.reload();await expect(page.locator('.course-points')).toContainText('Cloud Shell');expect(await page.locator('.course-explanations').innerText()).toBe(expandedText);await page.getByRole('button',{name:'Next lesson',exact:true}).click();await expect(page.getByRole('heading',{name:'How does Azure Cloud Shell work?',exact:true})).toBeVisible();await expect(page.getByRole('heading',{name:'How does Azure Cloud Shell work?',exact:true})).toBeInViewport({ratio:1});
 await expect(page.getByRole('textbox')).toHaveCount(0);
 expect(await page.evaluate(()=>document.documentElement.scrollWidth<=window.innerWidth)).toBe(true);
});

test('whole-course listening stays opt-in and source details are collapsed',async({page})=>{
 await page.goto('/#/course');await page.getByRole('combobox',{name:'Listen to',exact:true}).selectOption('course');
 await expect(page.locator('.course-sources')).not.toHaveAttribute('open','');
 await expect(page.getByRole('button',{name:'Pause reading',exact:true})).toHaveCount(0);
 await page.getByText('Course sources and coverage',{exact:true}).click();await expect(page.locator('.course-sources')).toContainText('28 modules and 231 units');
 await expect(page.getByRole('link',{name:'Official Microsoft Learn course',exact:true})).toHaveAttribute('href','https://learn.microsoft.com/en-us/training/courses/az-104t00');
});

test('spoken text follows passage and word events with reachable pause controls',async({page})=>{
 await page.addInitScript(()=>{
  const spoken:any[]=[];(window as any).__courseSpoken=spoken;
  class Utterance{rate=1;voice=null;onend:any=null;onerror:any=null;onboundary:any=null;constructor(public text:string){}}
  Object.defineProperty(window,'SpeechSynthesisUtterance',{configurable:true,value:Utterance});
  Object.defineProperty(window,'speechSynthesis',{configurable:true,value:{speak:(u:any)=>spoken.push(u),cancel:()=>{},getVoices:()=>[],addEventListener:()=>{},removeEventListener:()=>{}}});
 });
 await page.goto('/#/course');await page.getByRole('combobox',{name:'Lesson',exact:true}).selectOption({label:'What is Azure Cloud Shell?'});
 await page.setViewportSize({width:320,height:568});await page.evaluate(()=>document.documentElement.style.fontSize='28px');
 await page.getByRole('button',{name:'Play course notes',exact:true}).click();await expect(page.locator('#course-lesson-title mark')).toContainText('What is Azure Cloud Shell?');
 await page.evaluate(()=>(window as any).__courseSpoken.at(-1).onend());await expect(page.locator('.course-points mark')).toContainText('Cloud Shell');
 await page.evaluate(()=>(window as any).__courseSpoken.at(-1).onboundary({name:'word',charIndex:6,charLength:5}));await expect(page.locator('.course-spoken-word')).toHaveText('Shell');
 await page.evaluate(()=>{const utterance=(window as any).__courseSpoken.at(-1);utterance.onboundary({name:'word',charIndex:utterance.text.lastIndexOf('locally'),charLength:7})});await expect(page.locator('.course-spoken-word')).toHaveText('locally');
 await expect.poll(()=>page.evaluate(()=>{const word=document.querySelector('.course-spoken-word')!.getBoundingClientRect(),toolbar=document.querySelector('.course-playback-active')!.getBoundingClientRect();return word.top>=16&&word.bottom<=toolbar.top-12})).toBe(true);
 await expect(page.getByRole('button',{name:'Pause reading',exact:true})).toBeInViewport({ratio:1});await page.getByRole('button',{name:'Pause reading',exact:true}).click();await expect(page.locator('.course-spoken-word')).toHaveText('locally');
 await page.getByRole('button',{name:'Stop reading',exact:true}).click();await expect(page.locator('.course-reading-passage')).toHaveCount(0);
 await page.getByRole('button',{name:'Play course notes',exact:true}).click();
 for(let i=0;i<60&&!await page.locator('.course-explanations p .course-reading-passage').count();i++)await page.evaluate(()=>(window as any).__courseSpoken.at(-1).onend());
 await expect(page.locator('.course-explanations p .course-reading-passage')).toBeVisible();
 await page.evaluate(()=>{const utterance=(window as any).__courseSpoken.at(-1);utterance.onboundary({name:'word',charIndex:0,charLength:utterance.text.split(/\s+/)[0].length})});
 await expect(page.locator('.course-explanations .course-spoken-word')).toBeVisible();await expect(page.getByRole('button',{name:'Pause reading',exact:true})).toBeInViewport({ratio:1});
 expect(await page.evaluate(()=>document.documentElement.scrollWidth<=window.innerWidth)).toBe(true);
});
