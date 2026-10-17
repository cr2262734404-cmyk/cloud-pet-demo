import {spawnSync} from 'node:child_process';
import {mkdirSync,writeFileSync} from 'node:fs';
import {resolve} from 'node:path';

const root=process.cwd(),cli=resolve(root,'work/tools/node_modules/agent-browser/bin/agent-browser.js');
const screenshots=resolve(root,'outputs/screenshots/themes-v2');
const destination=resolve(root,'outputs/cloud-pet-demo/docs/theme-validation.json');
mkdirSync(screenshots,{recursive:true});
function command(args){
 const r=spawnSync(process.execPath,[cli,'--session','cloud-final','--json',...args],{cwd:root,encoding:'utf8',timeout:45000,maxBuffer:8*1024*1024,windowsHide:true});
 if(r.error)throw r.error;
 if(r.status!==0)throw new Error(r.stderr||r.stdout||String(r.status));
 let parsed;try{parsed=JSON.parse(r.stdout);}catch{throw new Error('Invalid CLI result: '+r.stdout.slice(0,500));}
 if(!parsed.success)throw new Error(JSON.stringify(parsed.error));
 return parsed.data;
}
function evaluate(source){return command(['eval','-b',Buffer.from(source).toString('base64')]).result;}
const report={title:'云朵宠物 H5 四季四时段浏览器尺寸矩阵',createdAt:new Date().toISOString(),url:'http://127.0.0.1:4174/cloud-pet-demo/',method:'Isolated Chrome; 390px uses actual theme picker clicks for all16 states and DPR2 screenshots; 320/430 set the same app theme context for geometry. Desktop emulation, not physical hardware.',realDeviceTest:false,android:'not-tested-no-physical-device',iphone:'not-tested-no-physical-device',selectedVariants:{summer:'b',autumn:'a'},sceneImplementation:'Four unchanged canonical mother scenes and twelve independent time extensions; no scene brightness or color filter.',checks:[]};
command(['open',report.url]);
evaluate(`(async()=>{while(!window.__cloudDemo?.context?.state)await new Promise(r=>setTimeout(r,30));})()`);
for(const [width,height] of [[390,844],[320,720],[430,932]]){
 command(['set','viewport',String(width),String(height),width===390?'2':'1']);
 for(const season of ['spring','summer','autumn','winter'])for(const period of ['morning','day','sunset','night']){
  if(width===390){
   command(['click','[data-action="theme-controls"]']);
   command(['click',`[data-action="season"][data-id="${season}"]`]);
   command(['click',`[data-action="period"][data-id="${period}"]`]);
   command(['click','.modal-close']);
  }
  const data=evaluate(`(async()=>{
   const app=window.__cloudDemo;if(!app)throw Error('App not initialized');
   const theme=app.context.theme;if(${width}===390&&(theme.season!==${JSON.stringify(season)}||theme.period!==${JSON.stringify(period)}))throw Error('Theme controls did not apply expected state');Object.assign(theme,{season:${JSON.stringify(season)},period:${JSON.stringify(period)},auto:false,low:false,variants:{summer:'b',autumn:'a'}});
   app.go('home');window.scrollTo({top:0,behavior:'instant'});
   await document.fonts.ready;
   await Promise.all([...document.images].map(im=>im.complete?Promise.resolve():new Promise(r=>{im.addEventListener('load',r,{once:true});im.addEventListener('error',r,{once:true});})));
   const background=getComputedStyle(document.querySelector('.home-scene')).backgroundImage;
   const computedFilter=getComputedStyle(document.querySelector('.home-scene')).filter;
   const source=background.startsWith('url(')?background.slice(4,-1).replaceAll('"','').replaceAll("'",''):null;
   const sceneLoaded=source?await new Promise(resolve=>{const i=new Image();i.onload=()=>resolve({width:i.naturalWidth,height:i.naturalHeight});i.onerror=()=>resolve(false);i.src=source;}):false;
   await new Promise(r=>requestAnimationFrame(()=>requestAnimationFrame(r)));
   const visible=e=>{const s=getComputedStyle(e),r=e.getBoundingClientRect();return s.display!=='none'&&s.visibility!=='hidden'&&r.width>0&&r.height>0;};
   const label=e=>(e.innerText||e.getAttribute('aria-label')||e.tagName).trim().slice(0,90);
   const outside=[...document.querySelectorAll('#app button,#app h1,#app h2,#app p,#app strong,#bottom-nav button,#demo-bar button')].filter(visible).map(e=>({label:label(e),left:e.getBoundingClientRect().left,right:e.getBoundingClientRect().right})).filter(x=>x.left < -1||x.right>innerWidth+1);
   const clipped=[...document.querySelectorAll('#app h1,#app h2,#app p,#app strong,#app button,#bottom-nav button')].filter(e=>visible(e)&&e.clientWidth>0&&e.scrollWidth>e.clientWidth+2).map(e=>({label:label(e),clientWidth:e.clientWidth,scrollWidth:e.scrollWidth}));
   const nav=document.querySelector('#bottom-nav'),buttons=[...nav.querySelectorAll('button')];
   const navTop=nav.getBoundingClientRect().top;
   const navInteractable=buttons.every(b=>{const r=b.getBoundingClientRect();const hit=document.elementFromPoint(r.x+r.width/2,r.y+r.height/2);return hit===b||b.contains(hit);});
   const primary=document.querySelector('.home-booking button');const pr=primary?.getBoundingClientRect();const hit=pr?document.elementFromPoint(pr.x+pr.width/2,pr.y+pr.height/2):null;
   const primaryInteractable=!!primary&&(hit===primary||primary.contains(hit));
   window.scrollTo({top:document.documentElement.scrollHeight,behavior:'instant'});await new Promise(r=>requestAnimationFrame(r));
   const actions=[...document.querySelectorAll('#app button')].filter(visible);const last=actions.at(-1);const lastActionBottom=last?.getBoundingClientRect().bottom;
   const lastActionClearOfNav=lastActionBottom<=nav.getBoundingClientRect().top-1;
   window.scrollTo({top:0,behavior:'instant'});await new Promise(r=>requestAnimationFrame(r));
   return {mode:app.mode,season:document.body.dataset.season,period:document.body.dataset.period,variant:theme.variant,viewport:{width:innerWidth,height:innerHeight},background,computedFilter,sceneLoaded,horizontalOverflow:document.documentElement.scrollWidth>innerWidth,outside,clipped,navInteractable,primaryInteractable,lastActionClearOfNav,lastActionBottom,navTop,brokenImages:[...document.images].filter(im=>im.complete&&im.naturalWidth===0).map(im=>im.src),userAgent:navigator.userAgent};
  })()`);
  const file=`${season}-${period}-${width}x${height}.png`;
  command(['screenshot',resolve(screenshots,file)]);
  report.checks.push({...data,screenshot:`../../screenshots/themes-v2/${file}`});
  writeFileSync(destination,JSON.stringify(report,null,2));
  console.log(`${report.checks.length}/48 ${file}: ${data.horizontalOverflow||data.outside.length||data.clipped.length||data.brokenImages.length||!data.navInteractable||!data.primaryInteractable||!data.lastActionClearOfNav?'REVIEW':'PASS'}`);
 }
}
report.completedAt=new Date().toISOString();report.total=report.checks.length;report.issues=report.checks.filter(x=>x.horizontalOverflow||x.outside.length||x.clipped.length||x.brokenImages.length||!x.navInteractable||!x.primaryInteractable||!x.lastActionClearOfNav).map(x=>({season:x.season,period:x.period,viewport:x.viewport,outside:x.outside,clipped:x.clipped,horizontalOverflow:x.horizontalOverflow,brokenImages:x.brokenImages,navInteractable:x.navInteractable,primaryInteractable:x.primaryInteractable,lastActionClearOfNav:x.lastActionClearOfNav}));
writeFileSync(destination,JSON.stringify(report,null,2));console.log(JSON.stringify({done:report.total,issues:report.issues.length,destination}));

