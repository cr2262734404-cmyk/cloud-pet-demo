import {spawnSync} from 'node:child_process';
import {mkdirSync,readFileSync,writeFileSync} from 'node:fs';
import {resolve} from 'node:path';

const cli=resolve('work/tools/node_modules/agent-browser/bin/agent-browser.js');
const out=resolve('outputs/screenshots/hd-v2');
const session='cloud-hdv2qa';
const base=process.env.CLOUD_CAPTURE_URL||'http://127.0.0.1:4174/cloud-pet-demo/';
const expected=Number(process.env.CLOUD_CAPTURE_ROUTE_COUNT||54);
mkdirSync(out,{recursive:true});
function cmd(args){
 const r=spawnSync(process.execPath,[cli,'--session',session,'--json',...args],{encoding:'utf8',timeout:45000,windowsHide:true,maxBuffer:8*1024*1024});
 if(r.error)throw r.error;
 if(r.status!==0)throw Error(r.stderr||r.stdout);
 const j=JSON.parse(r.stdout);if(!j.success)throw Error(JSON.stringify(j.error));return j.data;
}
const evaluate=code=>cmd(['eval','-b',Buffer.from(code).toString('base64')]).result;
const awaitApp=`const end=Date.now()+12000;while(!window.__cloudDemo?.context?.state){if(Date.now()>end)throw Error('App did not initialize');await new Promise(r=>setTimeout(r,50));}`;
const report={createdAt:new Date().toISOString(),url:base,method:'Official agent-browser set viewport 390 844 2; Chrome fresh-render screenshots --full. Existing screenshots were not resampled.',viewport:{width:390,height:844,deviceScaleFactor:2},realDeviceTest:false,scope:'Live exported customerRoutes and businessRoutes; each declared route captured with its seed ID in an isolated static browser session.',theme:{season:'summer',period:'day',variant:'b'},routes:[]};
const persist=()=>writeFileSync(resolve(out,'manifest.json'),JSON.stringify(report,null,2));
try{
 cmd(['--executable-path','C:/Program Files/Google/Chrome/Application/chrome.exe','open',base+'?role=customer&store=cloud&season=summer&period=day#customer/home']);
 cmd(['set','viewport','390','844','2']);
 const routes=evaluate(`(async()=>{${awaitApp}return [...window.__cloudDemo.customerRoutes.map(r=>({...r,role:'customer'})),...window.__cloudDemo.businessRoutes.map(r=>({...r,role:r.role||'owner'}))];})()`)
  .map(r=>({...r,code:/^[COS]\d+/.exec(r.title)?.[0]||'',filename:[r.role,/^[COS]\d+/.exec(r.title)?.[0],r.page,'2x'].filter(Boolean).join('-')+'.png'}));
 if(routes.length!==expected)throw Error('Expected '+expected+' live routes, got '+routes.length);
 if(new Set(routes.map(r=>r.role+'/'+r.page+'/'+(r.id||''))).size!==routes.length)throw Error('Duplicate routes');
 report.sourceRouteCount=routes.length;
 report.routeCounts=Object.fromEntries(['customer','owner','staff'].map(role=>[role,routes.filter(r=>r.role===role).length]));
 persist();
 for(const route of routes){
  const url=base+`?role=${route.role}&store=cloud&season=summer&period=day&variant=b#${route.role}/${route.page}${route.id?'/'+route.id:''}`;
  cmd(['open',url]);
  const measurement=evaluate(`(async()=>{
   ${awaitApp}
   const app=window.__cloudDemo,ctx=app.context;
   if(ctx.role!==${JSON.stringify(route.role)})throw Error('Unexpected role '+ctx.role);
   Object.assign(ctx.theme,{season:'summer',period:'day',variant:'b',variants:{summer:'b',autumn:'a'},auto:false,low:false});
   if(${JSON.stringify(route.page)}==='confirm')ctx.draft.booking={petId:'p1',serviceId:'s1',date:new Date(Date.parse(ctx.state.today+'T00:00:00Z')+86400000).toISOString().slice(0,10),employeeId:'e1',time:ctx.state.openingHours?.open||'09:00',notes:'温柔一点，糯米会更安心。'};
   if(${JSON.stringify(route.page)}==='complete'&&ctx.state.appointments.find(a=>a.id==='a2')?.status==='arrived')await ctx.mutate('booking.start',{id:'a2'});
   app.go(${JSON.stringify(route.page)},${JSON.stringify(route.id||'')});
   await document.fonts.ready;
   for(let y=0;y<document.documentElement.scrollHeight;y+=700){window.scrollTo({top:y,behavior:'instant'});await new Promise(r=>requestAnimationFrame(r));}
   await Promise.all([...document.images].map(im=>im.complete?Promise.resolve():new Promise(r=>{im.addEventListener('load',r,{once:true});im.addEventListener('error',r,{once:true});setTimeout(r,6000);})));
   const scene=getComputedStyle(document.documentElement).getPropertyValue('--scene-image').trim();
   const sceneUrl=/url\\(["']?(.*?)["']?\\)/.exec(scene)?.[1];
   const sceneReady=sceneUrl?await new Promise(resolve=>{const i=new Image();i.onload=()=>resolve({ok:true,width:i.naturalWidth,height:i.naturalHeight});i.onerror=()=>resolve({ok:false});i.src=sceneUrl;setTimeout(()=>resolve({ok:false,timeout:true}),6000);}):null;
   window.scrollTo({top:0,behavior:'instant'});await new Promise(r=>requestAnimationFrame(()=>requestAnimationFrame(r)));
   return {role:app.context.role,page:app.context.page,id:app.context.id,title:document.querySelector('#app h1')?.innerText||document.title,innerWidth,innerHeight,devicePixelRatio,scrollWidth:document.documentElement.scrollWidth,scrollHeight:document.documentElement.scrollHeight,brokenImages:[...document.images].filter(i=>i.complete&&i.naturalWidth===0).map(i=>i.src),scene,sceneReady,mode:app.mode,userAgent:navigator.userAgent};
  })()`);
  if(measurement.innerWidth!==390||measurement.devicePixelRatio!==2)throw Error('Viewport/DPR mismatch '+JSON.stringify(measurement));
  if(measurement.role!==route.role||measurement.page!==route.page)throw Error('Wrong live route '+JSON.stringify(measurement));
  cmd(['screenshot','--full',resolve(out,route.filename)]);
  const png=readFileSync(resolve(out,route.filename)),width=png.readUInt32BE(16),height=png.readUInt32BE(20);
  if(width!==780)throw Error('Screenshot is not true DPR2: '+width);
  report.routes.push({...route,declaredTitle:route.title,...measurement,url,physicalPixels:{width,height},bytes:png.length});persist();
  console.log(`${report.routes.length}/${routes.length} ${route.filename} ${width}×${height} ${measurement.title}`);
 }
 report.completedAt=new Date().toISOString();report.total=report.routes.length;report.allWidth780=report.routes.every(r=>r.physicalPixels.width===780);report.brokenImageCount=report.routes.reduce((n,r)=>n+r.brokenImages.length,0);report.horizontalOverflowRoutes=report.routes.filter(r=>r.scrollWidth>390).map(r=>r.role+'/'+r.page);persist();
 const esc=s=>String(s).replaceAll('&','&amp;').replaceAll('<','&lt;').replaceAll('"','&quot;');
 writeFileSync(resolve(out,'index.html'),`<!doctype html><html lang="zh-CN"><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1"><title>云朵宠物 · 第二版高清截图</title><style>body{font:15px system-ui,sans-serif;color:#173c53;background:#edf6f8;margin:24px}h1{font-size:24px}p{line-height:1.7}main{display:grid;grid-template-columns:repeat(auto-fit,minmax(280px,1fr));gap:24px}article{padding:16px;background:white;border-radius:16px;overflow:hidden}img{display:block;width:100%;height:auto;max-height:720px;object-fit:contain;object-position:top}a{color:inherit}small{color:#557b92}</style><h1>云朵宠物 · ${report.total} 页高清截图</h1><p>390×844 逻辑视口、DPR2，全页重新渲染，PNG宽780px。桌面Chrome模拟，非Android/iPhone真机测试。点击标题查看完整原图；长页面中的固定导航保持浏览器实际截图位置。</p><main>${report.routes.map(r=>`<article><h2><a href="${esc(r.filename)}">${esc(r.declaredTitle)}</a></h2><small>${r.physicalPixels.width} × ${r.physicalPixels.height} · ${esc(r.role)}</small><a href="${esc(r.filename)}"><img loading="lazy" src="${esc(r.filename)}" alt="${esc(r.title)}"></a></article>`).join('')}</main></html>`);
 writeFileSync(resolve(out,'README.md'),`# 云朵宠物第二版高清页面截图\n\n${report.total} 个当前应用导出路由（顾客 ${report.routeCounts.customer}、老板 ${report.routeCounts.owner}、员工 ${report.routeCounts.staff}），Chrome 官方 DPR2 设置重新渲染。逻辑视口 390×844，PNG 实际宽 780px，完整页面高度按内容变化。没有放大旧截图。\n\n- 浏览索引：index.html\n- 实时路由、场景资源、逐图参数：manifest.json\n- 统一主题：正式夏 B / 白天\n- 数据：独立静态演示会话与种子 ID；确认页仅设置未提交的预约草稿；员工收尾页将本会话 a2 从已到店开始护理以展示完整表单。未改发布代码或服务器数据。\n- 固定导航保留浏览器全页截图的实际位置，不移动或抹除。\n- 本组为桌面 Chrome 模拟高清截图，不构成 Android/iPhone 真机验收。\n`);
 console.log(JSON.stringify({total:report.total,counts:report.routeCounts,allWidth780:report.allWidth780,brokenImageCount:report.brokenImageCount,horizontalOverflowRoutes:report.horizontalOverflowRoutes,out}));
}catch(error){report.error=String(error);persist();throw error;}finally{try{cmd(['close']);}catch{}}
