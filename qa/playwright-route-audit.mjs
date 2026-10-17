import { chromium } from 'file:///C:/Users/Administrator/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright/index.mjs';
import { writeFileSync } from 'node:fs';
const browser=await chromium.launch({headless:true,executablePath:'C:/Program Files/Google/Chrome/Application/chrome.exe',args:['--no-sandbox']});
const base='http://127.0.0.1:4174/cloud-pet-demo/';const audit=[];const errors=[];
try{
 const context=await browser.newContext({viewport:{width:390,height:844},deviceScaleFactor:2,isMobile:true,hasTouch:true});const page=await context.newPage();page.setDefaultTimeout(10000);page.setDefaultNavigationTimeout(15000);
 page.on('pageerror',e=>errors.push(String(e)));
 await page.goto(base+'?role=customer&season=summer&period=day#customer/home',{waitUntil:'domcontentloaded'});await page.waitForFunction(()=>window.__cloudDemo?.context?.state);
 const routes=await page.evaluate(()=>[...window.__cloudDemo.customerRoutes.map(r=>({...r,role:'customer'})),...window.__cloudDemo.businessRoutes.map(r=>({...r,role:r.role||'owner'}))]);
 for(let i=0;i<routes.length;i++){
  const r=routes[i],url=base+`?role=${r.role}&store=cloud&season=summer&period=day#${r.role}/${r.page}${r.id?'/'+r.id:''}`;
  console.log(`${i+1}/${routes.length} ${r.role}/${r.page}`);
  try{await page.goto(url,{waitUntil:'domcontentloaded',timeout:15000});await page.waitForFunction(()=>window.__cloudDemo?.context?.state,{timeout:10000});const data=await page.evaluate(()=>({role:window.__cloudDemo.context.role,page:window.__cloudDemo.context.page,overflow:document.documentElement.scrollWidth-innerWidth,broken:[...document.images].filter(x=>x.complete&&x.naturalWidth===0).map(x=>x.src),title:document.querySelector('#app h1')?.textContent||''}));audit.push({...r,...data});}catch(e){audit.push({...r,error:String(e)});errors.push(`${r.role}/${r.page}: ${e}`);await page.close();break;}
 }
 await context.close();
}finally{await browser.close()}
const report={at:new Date().toISOString(),method:'Chrome mobile emulation 390×844 DPR2, 54 route load and geometry, no physical device',audit,errors};writeFileSync('outputs/cloud-pet-demo/docs/final-route-audit.json',JSON.stringify(report,null,2));console.log(JSON.stringify({count:audit.length,errors:errors.length,overflows:audit.filter(r=>r.overflow>1).length,broken:audit.reduce((n,r)=>n+(r.broken?.length||0),0)}));if(errors.length||audit.length!==54||audit.some(r=>r.overflow>1||r.broken?.length))process.exitCode=1;
