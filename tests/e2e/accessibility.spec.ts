import {expect,test} from '@playwright/test';

for(const width of [320,390,430])test(`no horizontal overflow at ${width}px and 1.4 text scale`,async({page})=>{
 await page.setViewportSize({width,height:844});await page.goto('/');
 await expect(page.getByRole('button',{name:'Explore draft questions →'})).toBeVisible();
 await page.evaluate(()=>document.documentElement.style.setProperty('--text-scale','1.4'));
 expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth)).toBe(true);
 await page.getByRole('link',{name:'Practice',exact:true}).click();
 await expect(page.getByRole('button',{name:'Start session →'})).toBeVisible();
 expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth)).toBe(true);
});

test('keyboard focus reaches skip link and answer inputs with visible focus',async({page})=>{
 await page.goto('/');await expect(page.getByRole('button',{name:'Explore draft questions →'})).toBeVisible();
 await page.keyboard.press('Tab');await expect(page.getByRole('link',{name:'Skip to content'})).toBeFocused();
 await page.keyboard.press('Enter');
 const start=page.getByRole('button',{name:'Explore draft questions →'});
 for(let step=0;step<30&&!(await start.evaluate(node=>node===document.activeElement));step++)await page.keyboard.press('Tab');
 await expect(start).toBeFocused();await page.keyboard.press('Enter');
 const choices=page.getByRole('group',{name:'Answer choices'});await expect(choices).toBeVisible();
 const input=choices.locator('input').first();
 for(let step=0;step<20&&!(await input.evaluate(node=>node===document.activeElement));step++)await page.keyboard.press('Tab');
 await expect(input).toBeFocused();await page.keyboard.press('Space');await expect(input).toBeChecked();
 expect(await input.evaluate(node=>getComputedStyle(node).outlineStyle)).not.toBe('none');
 const instruction=await page.locator('.question-panel .eyebrow').textContent();
 const required=Number(instruction?.match(/Choose (\d+)/)?.[1]??1);
 for(let choice=1;choice<required;choice++){await page.keyboard.press('Tab');await page.keyboard.press('Space')}
 const submit=page.getByRole('button',{name:'Submit answer',exact:true});
 for(let step=0;step<30&&!(await submit.evaluate(node=>node===document.activeElement));step++)await page.keyboard.press('Tab');
 await expect(submit).toBeFocused();await page.keyboard.press('Enter');
 await expect(page.getByRole('button',{name:'Next question',exact:true})).toBeVisible();
});

test('reduced-motion preference removes automatic animated movement',async({page})=>{
 await page.emulateMedia({reducedMotion:'reduce'});await page.goto('/');
 await expect(page.getByRole('button',{name:'Explore draft questions →'})).toBeVisible();
 expect(await page.evaluate(()=>matchMedia('(prefers-reduced-motion: reduce)').matches)).toBe(true);
 const animated=await page.evaluate(()=>Array.from(document.querySelectorAll('*')).filter(node=>{const style=getComputedStyle(node);return style.animationName!=='none'&&style.animationDuration.split(',').some(duration=>parseFloat(duration)>0.001)}).length);
 expect(animated).toBe(0);
});

function contrastRatio(foreground:string,background:string):number {
 const luminance=(color:string)=>{
  const rgb=color.match(/[\d.]+/g)!.slice(0,3).map(Number).map(value=>{const channel=value/255;return channel<=0.04045?channel/12.92:((channel+0.055)/1.055)**2.4});
  return rgb[0]*0.2126+rgb[1]*0.7152+rgb[2]*0.0722;
 };
 const a=luminance(foreground),b=luminance(background);
 return (Math.max(a,b)+0.05)/(Math.min(a,b)+0.05);
}

test('system dark and explicit dark keep hero, brand, source copy and primary text readable',async({page})=>{
 await page.emulateMedia({colorScheme:'dark'});await page.goto('/');
 await expect(page.getByRole('button',{name:'Explore draft questions →'})).toBeVisible();
 for(const theme of ['system','dark','light']){
  await page.evaluate(value=>{document.documentElement.dataset.theme=value},theme);
  for(const selector of ['.hero-card h2','.hero-card p','.hero-footer','.brand-icon','.brand small','.source-card p']){
   const colors=await page.locator(selector).evaluate(node=>{
    const style=getComputedStyle(node);let element:Element|null=node;
    while(element&&getComputedStyle(element).backgroundColor==='rgba(0, 0, 0, 0)')element=element.parentElement;
    return {foreground:style.color,background:element?getComputedStyle(element).backgroundColor:'rgb(255, 255, 255)'};
   });
   expect(contrastRatio(colors.foreground,colors.background),`${theme} ${selector}: ${JSON.stringify(colors)}`).toBeGreaterThanOrEqual(4.5);
  }
 }
 await page.getByRole('link',{name:'Practice',exact:true}).click();
 const primary=page.getByRole('button',{name:'Start session →'});await expect(primary).toBeVisible();
 for(const theme of ['system','dark','light']){
  await page.evaluate(value=>{document.documentElement.dataset.theme=value},theme);
  const colors=await primary.evaluate(node=>({foreground:getComputedStyle(node).color,background:getComputedStyle(node).backgroundColor}));
  expect(contrastRatio(colors.foreground,colors.background),`${theme} primary: ${JSON.stringify(colors)}`).toBeGreaterThanOrEqual(4.5);
 }
});
