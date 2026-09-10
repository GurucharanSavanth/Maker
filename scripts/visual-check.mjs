import {chromium,expect} from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';
import {mkdir,writeFile} from 'node:fs/promises';
const browser=await chromium.launch({headless:true});
const context=await browser.newContext({viewport:{width:1440,height:1000}});
const page=await context.newPage();const errors=[],badRequests=[];
page.on('pageerror',e=>errors.push(e.message));page.on('response',r=>{if(r.status()>=400)badRequests.push([r.status(),r.url()])});
await mkdir('test-results/redesign',{recursive:true});const results=[];
for(const route of ['/','/7ps/commercial/','/journeys/mobile/','/network-evidence/','/studio/relationships/','/studio/text/']){
  await page.goto('http://127.0.0.1:4173'+route,{waitUntil:'networkidle'});await page.waitForTimeout(700);
  if(route.includes('studio'))await expect(page.locator('.loading')).toHaveCount(0);
  const audit=await new AxeBuilder({page}).withTags(['wcag2a','wcag2aa','wcag21aa','wcag22aa']).analyze();
  results.push({route,overflow:await page.evaluate(()=>document.documentElement.scrollWidth>innerWidth+1),violations:audit.violations.map(v=>({id:v.id,impact:v.impact,nodes:v.nodes.map(n=>({html:n.html,summary:n.failureSummary}))}))});
  await page.screenshot({path:'test-results/redesign/'+(route==='/'?'home':route.replaceAll('/','-'))+'.png',fullPage:true});
}
await page.goto('http://127.0.0.1:4173/studio/relationships/',{waitUntil:'networkidle'});
await page.getByLabel('Provider',{exact:true}).selectOption('Airtel');
await expect(page.locator('[class*="sampleLens"]')).toContainText('433');
await page.getByLabel('Second rating',{exact:true}).selectOption('reliability');
await expect(page.locator('.interpretation-panel')).toContainText('perfectly correlated with itself');
await page.goto('http://127.0.0.1:4173/',{waitUntil:'networkidle'});
await page.getByRole('button',{name:'03 experience'}).click();
await expect(page.locator('[class*="signalReadout"]')).toContainText('433 survey records');
await page.getByRole('button',{name:'Pause motion',exact:true}).click();
await expect(page.locator('html')).toHaveAttribute('data-motion','off');
await page.getByRole('button',{name:'Resume motion',exact:true}).click();
await page.setViewportSize({width:390,height:844});
for(const route of ['/','/7ps/commercial/','/journeys/mobile/','/studio/relationships/']){await page.goto('http://127.0.0.1:4173'+route,{waitUntil:'networkidle'});await page.waitForTimeout(600);await page.screenshot({path:'test-results/redesign/mobile-'+(route==='/'?'home':route.replaceAll('/','-'))+'.png',fullPage:true});results.push({route,width:390,overflow:await page.evaluate(()=>document.documentElement.scrollWidth>innerWidth+1)})}
await writeFile('test-results/redesign/audit.json',JSON.stringify({results,errors,badRequests},null,2));
console.log(JSON.stringify({routes:results.length,violations:results.map(r=>[r.route,r.violations?.reduce((s,v)=>s+v.nodes.length,0)]),overflows:results.filter(r=>r.overflow),errors,badRequests}));
await browser.close();
