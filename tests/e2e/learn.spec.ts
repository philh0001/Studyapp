import {chooseAnswer} from './answer';
import {expect,test} from '@playwright/test';
test('ten fresh-install questions without approval preserve learning, bookmark and note through reload',async({page})=>{
 await page.goto('/#/practice');await expect(page.getByRole('button',{name:/Draft preview/})).toHaveCount(0);await page.getByRole('button',{name:'Start session →'}).click();
 for(let n=0;n<10;n++){
  const choices=page.getByRole('group',{name:'Answer choices'});await expect(choices).toBeVisible();await chooseAnswer(page);await page.getByRole('button',{name:'Submit answer',exact:true}).click();await expect(page.getByRole('heading',{name:'Microsoft Learn sources'})).toBeVisible();
  if(n===0){await page.getByRole('button',{name:'☆ Bookmark question'}).click();await page.getByLabel('Personal note').fill('Review this official source again.');await page.getByRole('button',{name:'Save note',exact:true}).click();await expect(page.getByText('Note saved',{exact:true})).toBeVisible();await page.reload();await expect(page.getByRole('button',{name:'★ Bookmarked'})).toBeVisible();await expect(page.getByLabel('Personal note')).toHaveValue('Review this official source again.')}
  await page.getByRole('button',{name:'Next question',exact:true}).click();
 }
 await expect(page.getByRole('heading',{name:'Session complete'})).toBeVisible();await page.getByRole('link',{name:'Back to home',exact:true}).click();await page.getByRole('link',{name:'Progress',exact:true}).click();await expect(page.locator('main')).toContainText('10');
});
