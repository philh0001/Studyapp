import {chooseAnswer} from './answer';
import {expect,test} from '@playwright/test';

test('starts five fresh-install questions without review and keeps timed answers hidden until confirmed submission',async({page})=>{
 await page.goto('/#/practice');await page.getByRole('button',{name:'Timed practice Feedback when you finish'}).click();await page.getByRole('radio',{name:'5',exact:true}).check();await page.getByLabel('Practice duration (minutes)').fill('10');await page.getByRole('button',{name:'Start session →'}).click();
 await expect(page.getByRole('timer',{name:'Time remaining'})).toBeVisible();
 await expect(page.getByText('Question 1 of 5',{exact:true})).toBeVisible();
 await expect(page.getByRole('heading',{name:'Microsoft Learn sources'})).toHaveCount(0);
 await chooseAnswer(page);
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
 const reviewAnswers=page.locator('section').filter({has:page.getByRole('heading',{name:'Review your answers',exact:true})});await expect(reviewAnswers.locator('details')).toHaveCount(5);
 await reviewAnswers.locator('details summary').first().click();
 await expect(reviewAnswers.locator('details').first()).toContainText('(your selection)');
 await expect(reviewAnswers.locator('details').first().getByRole('heading',{name:'Microsoft Learn sources'})).toBeVisible();
 await page.reload();await expect(page.getByRole('heading',{name:'Session complete'})).toBeVisible();
 await expect(reviewAnswers.locator('details')).toHaveCount(5);
});
