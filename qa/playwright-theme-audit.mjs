import { chromium } from 'file:///C:/Users/Administrator/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright/index.mjs';
import { writeFileSync } from 'node:fs';
const browser=await chromium.launch({headless:true,executablePath:'C:/Program Files/Google/Chrome/Application/chrome.exe',args:['--no-sandbox']});
const base='http://127.0.0.1:4174/cloud-pet-demo/';const checks=[];const errors=[];
try{for(const width of [320,390,430]){const context=await browser.newContext({viewport:{width,height:width===320?720:width===390?844:932},deviceScaleFactor:width===390?2:1,isMobile:true,hasTouch:true});const page=await context.newPage();page.on('pageerror',e=>errors.push(String(e)));
 for(const season of ['spring','summer','autumn','winter'])for(const period of ['morning','day','sunset','night']){
  await page.goto(`${base}?role=customer&season=${season}&period=${period}#customer/home`,{waitUntil:'domcontentloaded'});await page.waitForFunction(()=>window.__cloudDemo?.context?.state);
  const v=await page.evaluate(()=>({theme:document.body.dataset.season+'-'+document.body.dataset.period,overflow:document.documentElement.scrollWidth-innerWidth,icons:[...document.querySelectorAll('.home-entry img')].map(x=>({src:x.getAttribute('src'),ok:x.complete&&x.naturalWidth>0})),scene:getComputedStyle(document.querySelector('.home-scene')).backgroundImage,navVisible:document.querySelector('#bottom-nav').getBoundingClientRect().width>0}));
  checks.push({width,season,period,...v});if(v.overflow>1||v.icons.length!==3||v.icons.some(x=>!x.ok||!x.src.includes(`feature-${season}-`))||!v.navVisible)errors.push({width,season,period,v});
 }await context.close();}}
finally{await browser.close()}
const report={at:new Date().toISOString(),method:'Chrome mobile emulation; 320/390/430 widths, 16 scenes; not real phones',realDeviceTest:false,checks,errors};writeFileSync('outputs/cloud-pet-demo/docs/final-theme-audit.json',JSON.stringify(report,null,2));console.log(JSON.stringify({checks:checks.length,errors:errors.length,sceneFiles:new Set(checks.map(x=>x.scene)).size}));if(errors.length||checks.length!==48)process.exitCode=1;
