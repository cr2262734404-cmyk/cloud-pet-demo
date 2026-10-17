import {spawnSync} from 'node:child_process';
import {mkdirSync,readFileSync,writeFileSync} from 'node:fs';
import {resolve} from 'node:path';
const cli=resolve('work/tools/node_modules/agent-browser/bin/agent-browser.js'),out=resolve('outputs/screenshots/hd');mkdirSync(out,{recursive:true});
const customer=JSON.parse(readFileSync('outputs/screenshots/customer/route-layout-checks.json','utf8')).measurements.filter(r=>r.width===390).map((r,i)=>({role:'customer',page:r.page,id:r.id,code:`C${String(i+1).padStart(2,'0')}`,filename:`C${String(i+1).padStart(2,'0')}-${r.page}-2x.png`}));
const business=JSON.parse(readFileSync('outputs/cloud-pet-demo/docs/business-browser-report.json','utf8')).routes.map(r=>({role:r.role,page:r.page,id:r.id,filename:`${r.role}-${r.page}-2x.png`}));
const routes=[...customer,...business];if(routes.length!==48)throw Error('Expected 48 recorded routes');
function cmd(args){const r=spawnSync(process.execPath,[cli,'--session','cloud-hdqa','--json',...args],{encoding:'utf8',timeout:45000,windowsHide:true,maxBuffer:8*1024*1024});if(r.error)throw r.error;if(r.status!==0)throw Error(r.stderr||r.stdout);const j=JSON.parse(r.stdout);if(!j.success)throw Error(JSON.stringify(j.error));return j.data;}
const evaluate=code=>cmd(['eval','-b',Buffer.from(code).toString('base64')]).result;
const report={createdAt:new Date().toISOString(),url:'http://127.0.0.1:4174/cloud-pet-demo/',method:'Official agent-browser set viewport 390 844 2; Chrome fresh render screenshots --full, no resampling of existing screenshots.',viewport:{width:390,height:844,deviceScaleFactor:2},realDeviceTest:false,scope:'18 customer and 30 owner/staff route pages, isolated seeded static mode. Seed IDs preserved; confirmation uses transient booking draft and staff completion starts a2 only in isolated browser data.',theme:{season:'summer',period:'day',variant:'b'},routes:[]};
for(const route of routes){
 const url=report.url+`?role=${route.role}&store=cloud&season=summer&period=day&variant=b#${route.role}/${route.page}${route.id?'/'+route.id:''}`;
 cmd(['open',url]);
 const measurement=evaluate(`(async()=>{
  const end=Date.now()+12000;while(!window.__cloudDemo?.context?.state){if(Date.now()>end)throw Error('App did not initialize');await new Promise(r=>setTimeout(r,50));}
  const app=window.__cloudDemo,ctx=app.context;
  if(ctx.role!==${JSON.stringify(route.role)})throw Error('Unexpected role '+ctx.role);
  Object.assign(ctx.theme,{season:'summer',period:'day',variant:'b',variants:{summer:'b',autumn:'a'},auto:false,low:false});
  if(${JSON.stringify(route.page)}==='confirm')ctx.draft.booking={petId:'p1',serviceId:'s1',date:new Date(Date.parse(ctx.state.today+'T00:00:00Z')+86400000).toISOString().slice(0,10),employeeId:'e1',time:'09:00',notes:'温柔一点，糯米会更安心。'};
  if(${JSON.stringify(route.page)}==='complete'&&ctx.state.appointments.find(a=>a.id==='a2')?.status==='arrived')await ctx.mutate('booking.start',{id:'a2'});
  app.go(${JSON.stringify(route.page)},${JSON.stringify(route.id||'')});
  await document.fonts.ready;
  for(let y=0;y<document.documentElement.scrollHeight;y+=700){window.scrollTo({top:y,behavior:'instant'});await new Promise(r=>requestAnimationFrame(r));}
  await Promise.all([...document.images].map(im=>im.complete?Promise.resolve():new Promise(r=>{im.addEventListener('load',r,{once:true});im.addEventListener('error',r,{once:true});setTimeout(r,6000);})));
  window.scrollTo({top:0,behavior:'instant'});await new Promise(r=>requestAnimationFrame(()=>requestAnimationFrame(r)));
  return {role:app.context.role,page:app.context.page,id:app.context.id,title:document.querySelector('#app h1')?.innerText||document.title,innerWidth,innerHeight,devicePixelRatio,scrollWidth:document.documentElement.scrollWidth,scrollHeight:document.documentElement.scrollHeight,brokenImages:[...document.images].filter(i=>i.complete&&i.naturalWidth===0).map(i=>i.src),mode:app.mode,userAgent:navigator.userAgent};
 })()`);
 if(measurement.innerWidth!==390||measurement.devicePixelRatio!==2)throw Error('Viewport/DPR mismatch '+JSON.stringify(measurement));
 cmd(['screenshot','--full',resolve(out,route.filename)]);
 const png=readFileSync(resolve(out,route.filename));const width=png.readUInt32BE(16),height=png.readUInt32BE(20);
 if(width!==780)throw Error('Screenshot is not true DPR2: '+width);
 report.routes.push({...route,...measurement,url,physicalPixels:{width,height},bytes:png.length});
 writeFileSync(resolve(out,'manifest.json'),JSON.stringify(report,null,2));
 console.log(`${report.routes.length}/48 ${route.filename} ${width}×${height} ${measurement.title}`);
}
report.completedAt=new Date().toISOString();report.total=report.routes.length;report.allWidth780=report.routes.every(r=>r.physicalPixels.width===780);report.brokenImageCount=report.routes.reduce((n,r)=>n+r.brokenImages.length,0);
writeFileSync(resolve(out,'manifest.json'),JSON.stringify(report,null,2));
const esc=s=>String(s).replaceAll('&','&amp;').replaceAll('<','&lt;').replaceAll('"','&quot;');
writeFileSync(resolve(out,'index.html'),`<!doctype html><html lang="zh-CN"><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1"><title>云朵宠物 · DPR2 高清截图</title><style>body{font:15px system-ui,sans-serif;color:#173c53;background:#edf6f8;margin:24px}h1{font-size:24px}p{line-height:1.7}main{display:grid;grid-template-columns:repeat(auto-fit,minmax(280px,1fr));gap:24px}article{padding:16px;background:white;border-radius:16px;overflow:hidden}img{display:block;width:100%;height:auto;max-height:720px;object-fit:contain;object-position:top}a{color:inherit}small{color:#557b92}</style><h1>云朵宠物 · 48页高清截图</h1><p>390×844 逻辑视口、DPR2，全页重新渲染，PNG宽780px。不是放大既有图片，不是Android/iPhone真机测试。点击标题查看完整原图。长页面中的固定导航保持浏览器实际截图位置。</p><main>${report.routes.map(r=>`<article><h2><a href="${esc(r.filename)}">${esc(r.code||r.role+' / '+r.page)} · ${esc(r.title)}</a></h2><small>${r.physicalPixels.width} × ${r.physicalPixels.height} · ${esc(r.role)}</small><a href="${esc(r.filename)}"><img loading="lazy" src="${esc(r.filename)}" alt="${esc(r.title)}"></a></article>`).join('')}</main></html>`);
writeFileSync(resolve(out,'README.md'),`# 云朵宠物高清页面截图\n\n48个已记录路由（顾客18、老板及员工30），用Chrome的官方DPR2设置重新渲染。逻辑视口390×844，PNG实际宽780px，完整页面高度按内容变化。没有放大旧截图。\n\n- 浏览索引：index.html\n- 逐图参数与路由：manifest.json\n- 统一主题：夏B/白天\n- 数据：独立静态演示会话与种子ID；确认页仅设置未提交的预约草稿；员工收尾页将本会话a2从已到店开始护理以展示完整表单。未改发布代码或服务器数据。\n- 固定导航以浏览器全页截图方式保留，不移动或抹除它。\n- 本组是桌面Chrome模拟高清截图，不构成Android/iPhone真机验收。\n`);
console.log(JSON.stringify({total:report.total,allWidth780:report.allWidth780,brokenImageCount:report.brokenImageCount,out}));
