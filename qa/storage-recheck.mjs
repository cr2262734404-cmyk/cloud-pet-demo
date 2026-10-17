import {spawnSync} from 'node:child_process';
import {resolve} from 'node:path';
import {writeFileSync} from 'node:fs';
const code=`(async()=>{
 const app=window.__cloudDemo,original=localStorage.getItem('cloud-demo-db'),records=[];let frame;
 try{
  await app.context.mutate('profile.save',{notes:'qa baseline'});
  app.context.modal('<h2>隔离会话数据一致性检查</h2>');
  const {DemoEngine}=await import('./engine.mjs');
  const other=new DemoEngine({data:JSON.parse(localStorage.getItem('cloud-demo-db')),onSave:db=>localStorage.setItem('cloud-demo-db',JSON.stringify(db))});
  other.apply('cloud','customer','pet.save',{id:'p1',name:'来自另一标签的宠物编辑'});
  window.dispatchEvent(new StorageEvent('storage',{key:'cloud-demo-db',newValue:localStorage.getItem('cloud-demo-db')}));
  const before=JSON.parse(localStorage.getItem('cloud-demo-db')).stores.cloud.pets.find(p=>p.id==='p1').name;
  await app.context.mutate('profile.save',{notes:'当前标签提交'});
  const after=JSON.parse(localStorage.getItem('cloud-demo-db')).stores.cloud.pets.find(p=>p.id==='p1').name;
  records.push({name:'modal-open missed storage event, followed by write',method:'same repro as failed version: separate engine writes shared localStorage and dispatches storage event while modal is open',before,after,passed:before===after});
  app.context.closeModal();
  frame=document.createElement('iframe');frame.style.cssText='position:fixed;width:1px;height:1px;left:-5000px;top:-5000px';frame.src='./?role=customer#customer/profile';document.body.append(frame);
  await new Promise((resolve,reject)=>{const end=Date.now()+12000;const check=()=>{if(frame.contentWindow.__cloudDemo?.mode==='local')resolve();else if(Date.now()>end)reject(Error('Second context did not initialize'));else setTimeout(check,50);};check();});
  const second=frame.contentWindow.__cloudDemo;
  const both=await Promise.all([app.context.mutate('profile.save',{name:'并发保存的主人'}),second.context.mutate('pet.save',{id:'p1',name:'并发保存的宠物'})]);
  const store=JSON.parse(localStorage.getItem('cloud-demo-db')).stores.cloud;
  const customerName=store.customers.find(c=>c.id==='c1').name,petName=store.pets.find(p=>p.id==='p1').name;
  records.push({name:'two independent browsing contexts submit concurrently',method:'main application plus same-origin iframe application, independent engine instances, Promise.all writes through each real main.js mutate',locksAvailable:!!navigator.locks,customerName,petName,results:both.map(r=>r.ok),passed:customerName==='并发保存的主人'&&petName==='并发保存的宠物'&&both.every(r=>r.ok)});
  return {createdAt:new Date().toISOString(),url:location.href,userAgent:navigator.userAgent,mode:app.mode,realDeviceTest:false,method:'isolated Chrome own-application test; no user production data',records,passed:records.every(r=>r.passed)};
 }finally{frame?.remove();app.context.closeModal();if(original===null)localStorage.removeItem('cloud-demo-db');else localStorage.setItem('cloud-demo-db',original);}
})()`;
const r=spawnSync(process.execPath,[resolve('work/tools/node_modules/agent-browser/bin/agent-browser.js'),'--session','cloud-themeqa','--json','eval','-b',Buffer.from(code).toString('base64')],{encoding:'utf8',timeout:30000,windowsHide:true});
if(r.error)throw r.error;if(r.status!==0)throw Error(r.stderr||r.stdout);
const parsed=JSON.parse(r.stdout);if(!parsed.success)throw Error(JSON.stringify(parsed.error));
const report=parsed.data.result;writeFileSync('outputs/cloud-pet-demo/docs/storage-validation.json',JSON.stringify(report,null,2));console.log(JSON.stringify(report,null,2));if(!report.passed)process.exitCode=1;
