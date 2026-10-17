import {spawnSync} from 'node:child_process';
import {mkdirSync,writeFileSync} from 'node:fs';
import path from 'node:path';
const root=process.cwd(),out=path.join(root,'outputs/screenshots/customer');
mkdirSync(out,{recursive:true});
const exe=path.join(root,'work/tools/node_modules/agent-browser/bin/agent-browser-win32-x64.exe');
function run(...args){const r=spawnSync(exe,['--session','customer-qa',...args],{encoding:'utf8',windowsHide:true,maxBuffer:20*1024*1024});if(r.status!==0)throw Error(`${args[0]}: ${r.stderr||r.stdout}`);return r.stdout.trim();}
function evaluate(js){const output=run('eval','-b',Buffer.from(js).toString('base64'));try{return JSON.parse(output);}catch{return output;}}
const routes=evaluate('window.__cloudDemo.customerRoutes');
const measurements=[];
for(const width of [390,320,430]){
 run('set','viewport',String(width),'844');
 for(const [idx,r] of routes.entries()){
  const code=`(async()=>{const app=window.__cloudDemo,c=app.context;c.draft.booking={petId:'p1',serviceId:'s1',date:'2026-10-20',time:'09:00',employeeId:'e1',notes:'截图验收用预约草稿，未提交'};app.go(${JSON.stringify(r.page)},${JSON.stringify(r.id||'')});await document.fonts.ready;await Promise.all(Array.from(document.images).filter(i=>!i.complete).map(i=>new Promise(resolve=>{i.onload=resolve;i.onerror=resolve;setTimeout(resolve,1000)})));window.scrollTo({top:0,behavior:'instant'});await new Promise(resolve=>requestAnimationFrame(()=>requestAnimationFrame(resolve)));return {page:${JSON.stringify(r.page)},id:${JSON.stringify(r.id||'')},width:innerWidth,scrollWidth:document.documentElement.scrollWidth,bodyWidth:document.body.scrollWidth,brokenImages:Array.from(document.images).filter(i=>i.complete&&!i.naturalWidth).map(i=>i.src),overflow:Array.from(document.querySelectorAll('#app button,#app input:not([type=hidden]),#app select,#app textarea,#app h1,#app h2,#app p,#app .card')).filter(el=>{const s=getComputedStyle(el),b=el.getBoundingClientRect();return s.display!=='none'&&s.visibility!=='hidden'&&b.width>0&&(b.left<-.5||b.right>innerWidth+.5)}).map(el=>({tag:el.tagName,cls:el.className,text:el.textContent.slice(0,60),left:el.getBoundingClientRect().left,right:el.getBoundingClientRect().right}))}})()`;
  const m=evaluate(code); measurements.push(m);
  if(width===390){const prefix=`C${String(idx+1).padStart(2,'0')}`;run('screenshot','--full',path.join(out,`${prefix}-${r.page}.png`));}
 }
 console.log(`${width}px: ${measurements.filter(m=>m.width===width).length} routes checked`);
}
run('set','viewport','390','844');
writeFileSync(path.join(out,'route-layout-checks.json'),JSON.stringify({generatedAt:new Date().toISOString(),browser:'Chrome 155 desktop viewport emulation; not real phone',measurements},null,2));
console.log(JSON.stringify({checks:measurements.length,overflow:measurements.filter(m=>m.scrollWidth>m.width||m.bodyWidth>m.width||m.overflow.length),brokenImages:measurements.filter(m=>m.brokenImages.length)},null,2));
