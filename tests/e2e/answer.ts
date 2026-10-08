import {expect,type Page} from '@playwright/test';
/** Choose valid inputs, not necessarily correct answers; never reads the answer key. */
export async function chooseAnswer(page:Page){
 const choices=page.getByRole('group',{name:'Answer choices'});await expect(choices).toBeVisible();
 const order=choices.getByRole('button',{name:'Use this order',exact:true});
 if(await order.count()){await order.click();return}
 const matches=choices.getByRole('combobox');
 if(await matches.count()){const used=new Set<string>();for(let i=0;i<await matches.count();i++){const values=await matches.nth(i).locator('option').evaluateAll(nodes=>nodes.map(n=>(n as HTMLOptionElement).value).filter(Boolean));const value=values.find(v=>!used.has(v))!;await matches.nth(i).selectOption(value);used.add(value)}return}
 const instruction=await page.locator('.question-panel>.eyebrow').textContent(),required=Number(instruction?.match(/Choose (\d+)/)?.[1]??1);
 for(let i=0;i<required;i++)await choices.locator('input').nth(i).check();
}
