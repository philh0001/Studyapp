import {expect,test} from '@playwright/test';

test('approves five real drafts locally and keeps timed answers hidden until confirmed submission',async({page})=>{
 await page.goto('/');await expect(page.getByRole('button',{name:'Explore draft questions →'})).toBeVisible();
 await page.getByRole('link',{name:'Review',exact:true}).click();
 await page.getByRole('button',{name:'Review starter questions →'}).click();
 const selector=page.getByRole('combobox',{name:'Question',exact:true});
 // This browser test exercises explicit approval controls on a disposable profile.
 // It is not a human factual acceptance of the bundled drafts.
 for(let i=1;i<=5;i++){
  const id=`az104-identity-0${i}`;await selector.selectOption(id);
  const approve=page.getByRole('button',{name:'Approve this revision',exact:true});
  await expect(approve).toBeDisabled();await expect(page.getByRole('heading',{name:'Microsoft Learn sources'})).toBeVisible();
  await page.getByRole('checkbox',{name:/I opened the official Microsoft Learn sources and checked/}).check();
  await approve.click();await expect(selector.locator(`option[value="${id}"]`)).toHaveCount(0);
 }
 await page.getByRole('link',{name:'Home',exact:true}).click();
 await expect(page.locator('.stat').filter({hasText:'Approved questions'})).toContainText('5');
 await page.reload();await expect(page.locator('.stat').filter({hasText:'Approved questions'})).toContainText('5');
 await page.getByRole('link',{name:'Practice',exact:true}).click();
 await page.getByRole('button',{name:'Timed practice Feedback when you finish'}).click();
 await page.getByLabel('Practice duration (minutes)').fill('10');
 const shorter=page.waitForEvent('dialog');const start=page.getByRole('button',{name:'Start session →'}).click();
 const dialog=await shorter;expect(dialog.message()).toContain('Only 5 unique questions match.');expect(dialog.message()).toContain('Start this shorter session?');await dialog.accept();await start;
 await expect(page.getByRole('timer',{name:'Time remaining'})).toBeVisible();
 await expect(page.getByText('Question 1 of 5',{exact:true})).toBeVisible();
 await expect(page.getByRole('heading',{name:'Microsoft Learn sources'})).toHaveCount(0);
 const instruction=await page.locator('.question-panel .eyebrow').textContent();
 const required=Number(instruction?.match(/Choose (\d+)/)?.[1]??1);
 const choices=page.getByRole('group',{name:'Answer choices'}).locator('input');
 for(let i=0;i<required;i++)await choices.nth(i).check();
 await page.getByRole('button',{name:'Save & next',exact:true}).click();
 await expect(page.getByText('Question 2 of 5',{exact:true})).toBeVisible();
 await expect(page.getByRole('heading',{name:'Microsoft Learn sources'})).toHaveCount(0);
 await page.getByRole('button',{name:'Finish practice',exact:true}).click();
 const confirmation=page.getByRole('group',{name:'Confirm practice submission'});
 await expect(confirmation).toContainText('4 unanswered questions');
 await expect(page.getByRole('heading',{name:'Session complete'})).toHaveCount(0);
 await confirmation.getByRole('button',{name:'Confirm submission',exact:true}).click();
 await expect(page.getByRole('heading',{name:'Session complete'})).toBeVisible();
 await expect(page.getByRole('heading',{name:'Review your answers'})).toBeVisible();
 await expect(page.locator('details')).toHaveCount(5);
 await page.locator('details summary').first().click();
 await expect(page.locator('details').first()).toContainText('(your selection)');
 await expect(page.locator('details').first().getByRole('heading',{name:'Microsoft Learn sources'})).toBeVisible();
 await page.reload();await expect(page.getByRole('heading',{name:'Session complete'})).toBeVisible();
 await expect(page.locator('details')).toHaveCount(5);
});
