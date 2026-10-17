import {execFileSync} from 'node:child_process';import {writeFileSync,mkdirSync} from 'node:fs';
const cli='work/tools/node_modules/agent-browser/bin/agent-browser.js';
const run=(...a)=>execFileSync(process.execPath,[cli,'--session','cloud-business',...a],{encoding:'utf8',timeout:45000,maxBuffer:12*1024*1024}).trim();
const templates=['新客欢迎','洗护预约','节日活动','生日祝福','服务介绍','老客回访'];const out=[];
run('open','http://127.0.0.1:4173/?role=owner&store=meadow#owner/posters');run('reload');run('wait','#biz-poster-form');
for(let i=0;i<templates.length;i++){
 run('select','select[name="template"]',templates[i]);
 run('fill','input[name="title"]',templates[i]+'：让每一次温柔照顾，都成为值得珍藏的好时光');
 run('fill','textarea[name="subtitle"]','专业而有耐心地照顾每一只小伙伴，听见它的小情绪，记住它的护理习惯。预约合适的时间，让毛孩子安心，让家长放心。');
 run('select','select[name="petId"]','p3');
 run('scrollintoview','[data-action="biz:poster-download"]');run('scroll','down','320');
 run('click','[data-action="biz:poster-download"]');
 let retried=false;try{run('wait','--fn','document.querySelector("#export-image")?.naturalWidth>0');}catch{retried=true;run('click','[data-action="biz:poster-download"]');run('wait','--fn','document.querySelector("#export-image")?.naturalWidth>0');}
 const info=JSON.parse(run('eval','({width:document.querySelector("#export-image").naturalWidth,height:document.querySelector("#export-image").naturalHeight,viewport:innerWidth,documentWidth:document.documentElement.scrollWidth})'));
 const file='outputs/screenshots/business/export-template-'+(i+1)+'.png';run('screenshot',file);
 const data=JSON.parse(run('eval','(async()=>{const b=await (await fetch(document.querySelector("#export-image").src)).blob();return await new Promise(r=>{const f=new FileReader();f.onload=()=>r(f.result);f.readAsDataURL(b);});})()'));
 writeFileSync('outputs/screenshots/business/export-'+(i+1)+'-actual.png',Buffer.from(data.split(',')[1],'base64'));
 out.push({template:templates[i],...info,screenshot:file,retried,status:'generated-and-previewed',fileSavedBy:'readback of displayed locally generated blob; native CLI download canceled'});console.log(templates[i]+': '+JSON.stringify(info));run('click','button.modal-close');
 writeFileSync('work/business-export-report.json',JSON.stringify({testType:'Desktop Chrome 390x844 browser simulation, not physical hardware',templates:out},null,2));
}
