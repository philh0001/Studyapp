import {expect,test} from '@playwright/test';
test('ten locally approved questions preserve learning, bookmark and note through reload',async({page})=>{
 await page.goto('/#/review/content');const selector=page.getByRole('combobox',{name:'Question',exact:true});
 // Mechanical approval in disposable browser storage tests the workflow, not factual human review.
 for(const domain of ['identity','storage'])for(let i=1;i<=5;i++){
  const id=`az104-${domain}-0${i}`;await selector.selectOption(id);for(const checkbox of await page.getByRole('group',{name:'Individual factual review checklist'}).getByRole('checkbox').all())await checkbox.check();await page.getByRole('checkbox',{name:/I opened the official Microsoft Learn/}).check();await page.getByRole('button',{name:'Approve this revision',exact:true}).click();await expect(selector.locator(`option[value="${id}"]`)).toHaveCount(0);
 }
 await page.getByRole('link',{name:'Home',exact:true}).click();await page.getByRole('button',{name:'Start Quick 10 →'}).click();
 for(let n=0;n<10;n++){
  const choices=page.getByRole('group',{name:'Answer choices'});await expect(choices).toBeVisible();const instruction=await page.locator('.question-panel .eyebrow').textContent();const count=Number(instruction?.match(/Choose (\d+)/)?.[1]??1);for(let i=0;i<count;i++)await choices.locator('input').nth(i).check();await page.getByRole('button',{name:'Submit answer',exact:true}).click();await expect(page.getByRole('heading',{name:'Microsoft Learn sources'})).toBeVisible();
  if(n===0){await page.getByRole('button',{name:'☆ Bookmark question'}).click();await page.getByLabel('Personal note').fill('Review this official source again.');await page.getByRole('button',{name:'Save note',exact:true}).click();await expect(page.getByText('Note saved',{exact:true})).toBeVisible();await page.reload();await expect(page.getByRole('button',{name:'★ Bookmarked'})).toBeVisible();await expect(page.getByLabel('Personal note')).toHaveValue('Review this official source again.')}
  await page.getByRole('button',{name:'Next question',exact:true}).click();
 }
 await expect(page.getByRole('heading',{name:'Session complete'})).toBeVisible();await page.getByRole('link',{name:'Back to home',exact:true}).click();await page.getByRole('link',{name:'Progress',exact:true}).click();await expect(page.locator('main')).toContainText('10');
});
