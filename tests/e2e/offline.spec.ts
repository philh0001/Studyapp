import {chooseAnswer} from './answer';
import {expect,test} from '@playwright/test';

test('precached shell reloads offline with local draft content',async({page,context})=>{
 await page.goto('/');
 await expect(page.getByRole('button',{name:'Explore draft questions →'})).toBeVisible();
 await page.evaluate(async()=>{await navigator.serviceWorker.ready});
 await page.reload();
 await expect.poll(()=>page.evaluate(()=>!!navigator.serviceWorker.controller)).toBe(true);
 await context.setOffline(true);
 await page.reload();
 await expect(page.getByText('Offline',{exact:true})).toBeVisible();
 await page.getByRole('button',{name:'Explore draft questions →'}).click();
 await expect(page.getByRole('group',{name:'Answer choices'})).toBeVisible();
 await expect(page.locator('main')).toContainText(/draft/i);
});

test('answers a ten-question draft preview offline and preserves completed progress',async({page,context})=>{
 await page.goto('/');
 await expect(page.getByRole('button',{name:'Explore draft questions →'})).toBeVisible();
 await page.evaluate(async()=>{await navigator.serviceWorker.ready});
 await page.reload();
 await expect.poll(()=>page.evaluate(()=>!!navigator.serviceWorker.controller)).toBe(true);
 await page.getByRole('button',{name:'Explore draft questions →'}).click();
 await expect(page.getByRole('group',{name:'Answer choices'})).toBeVisible();
 await context.setOffline(true);
 for(let index=0;index<10;index++){
  const choices=page.getByRole('group',{name:'Answer choices'});
  await expect(choices).toBeVisible();
  await chooseAnswer(page);
  await page.getByRole('button',{name:'Submit answer',exact:true}).click();
  await expect(page.getByRole('button',{name:'Next question',exact:true})).toBeVisible();
  await expect(page.getByRole('heading',{name:'Microsoft Learn sources'})).toBeVisible();
  if(index===0){await page.reload();await expect(page.getByRole('button',{name:'Next question',exact:true})).toBeVisible()}
  await page.getByRole('button',{name:'Next question',exact:true}).click();
 }
 await expect(page.getByRole('heading',{name:'Session complete'})).toBeVisible();
 await page.reload();
 await expect(page.getByRole('heading',{name:'Session complete'})).toBeVisible();
 await expect(page.locator('main')).toContainText(/draft/i);
});
