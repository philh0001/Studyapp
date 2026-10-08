import {expect,test} from '@playwright/test';
import {readFileSync} from 'node:fs';
import type {ModuleAssessmentPack} from '../../src/features/course/assessment-types';
const pack=(JSON.parse(readFileSync(new URL('../../content/course/assessments/01-modules.json',import.meta.url),'utf8')) as ModuleAssessmentPack[])[0];
test('six module questions explain answers and retain progress through offline reload',async({page,context})=>{
 await page.setViewportSize({width:320,height:640});await page.goto('/#/course');
 await page.getByRole('button',{name:'Module assessment · 6 questions'}).click();
 const quiz=page.locator('.course-module-check');await expect(quiz.getByRole('heading',{name:'Module assessment',exact:true})).toBeInViewport({ratio:1});
 await expect(quiz.getByText('Question 1 of 6',{exact:true})).toBeVisible();await expect(quiz.getByRole('button',{name:'Check answer',exact:true})).toBeDisabled();
 const firstWrong=pack.questions[0].options.findIndex(option=>option.id!==pack.questions[0].correctOptionId);
 await quiz.getByRole('radio').nth(firstWrong).check();await quiz.getByRole('button',{name:'Check answer',exact:true}).click();
 await expect(quiz).toContainText(pack.questions[0].options[firstWrong].explanation);await expect(quiz).toContainText(pack.questions[0].options.find(option=>option.id===pack.questions[0].correctOptionId)!.explanation);
 await expect(quiz.getByRole('radio').first()).toBeDisabled();
 await page.reload();await expect(quiz.getByText('Question 1 of 6',{exact:true})).toBeVisible();await expect(quiz).toContainText(pack.questions[0].options[firstWrong].explanation);
 await context.setOffline(true);await page.reload();await expect(quiz.getByRole('button',{name:'Next question',exact:true})).toBeVisible();
 await quiz.getByRole('button',{name:'Next question',exact:true}).click();
 for(let i=1;i<6;i++){
  await expect(quiz.getByText(`Question ${i+1} of 6`,{exact:true})).toBeVisible();
  const q=pack.questions[i];await quiz.getByRole('radio').nth(q.options.findIndex(option=>option.id===q.correctOptionId)).check();await quiz.getByRole('button',{name:'Check answer',exact:true}).click();
  await quiz.getByRole('button',{name:i===5?'Finish assessment':'Next question',exact:true}).click();
 }
 await expect(quiz.getByRole('heading',{name:'Assessment complete',exact:true})).toBeVisible();await expect(quiz).toContainText('5 / 6 correct');
 await page.reload();await expect(quiz).toContainText('5 / 6 correct');expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth)).toBe(true);
 await quiz.getByRole('button',{name:'Try again',exact:true}).click();await expect(quiz.getByText('Question 1 of 6',{exact:true})).toBeVisible();await expect(quiz.getByRole('radio').first()).not.toBeChecked();
});
test('a module without an official knowledge check still supplies its own six-question assessment',async({page})=>{
 await page.goto('/#/course');await page.getByRole('combobox',{name:'Learning path',exact:true}).selectOption('az-104-manage-identities-governance');
 await page.getByRole('combobox',{name:'Module',exact:true}).selectOption('allow-users-reset-their-password');await page.getByRole('button',{name:'Module assessment · 6 questions'}).click();
 const quiz=page.locator('.course-module-check');await expect(quiz.getByText('Question 1 of 6',{exact:true})).toBeVisible();await expect(quiz).toContainText('self-service password reset');await expect(quiz.getByRole('radio')).toHaveCount(4);
 await quiz.getByRole('radio').first().check();await quiz.getByRole('button',{name:'Check answer',exact:true}).click();await expect(quiz.getByRole('button',{name:'Next question',exact:true})).toBeEnabled();await page.reload();await expect(quiz.getByText('Question 1 of 6',{exact:true})).toBeVisible();await expect(quiz.getByRole('radio').first()).toBeChecked();await expect(quiz.getByRole('radio').first()).toBeDisabled();
});
