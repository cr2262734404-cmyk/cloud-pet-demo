import {spawnSync} from 'node:child_process';
import {writeFileSync} from 'node:fs';
import path from 'node:path';
const root=process.cwd(),out=path.join(root,'outputs/screenshots/customer');
const exe=path.join(root,'work/tools/node_modules/agent-browser/bin/agent-browser-win32-x64.exe');
function run(...args){const r=spawnSync(exe,['--session','customer-qa',...args],{encoding:'utf8',windowsHide:true,maxBuffer:20*1024*1024});if(r.status!==0)throw Error(`${args[0]}: ${r.stderr||r.stdout}`);return r.stdout.trim();}
function evaluate(js){return JSON.parse(run('eval','-b',Buffer.from(js).toString('base64')));}
const results=[];
for(const [page,id,action,file] of [['report','r1','c.save-report','exported-care-report.png'],['gift','g1','c.save-gift','exported-avatar.jpg'],['gift','g1','c.save-gift-card','exported-gift-card.png']]){
 run('open',`http://localhost:4173/?role=customer&store=cloud&season=summer&period=day&variant=b&exportqa=${file}#customer/${page}/${id}`);
 evaluate(`document.querySelector('[data-action="${action}"]').scrollIntoView({block:'center',behavior:'instant'});true`);
 run('click',`[data-action="${action}"]`);run('wait','#export-image');
 const r=evaluate(`(async()=>{const i=document.querySelector('#export-image');await i.decode();const b=await(await fetch(i.src)).blob();const d=await new Promise(resolve=>{const r=new FileReader();r.onload=()=>resolve(r.result);r.readAsDataURL(b)});return {width:i.naturalWidth,height:i.naturalHeight,size:b.size,type:b.type,data:d.split(',')[1]}})()`);
 writeFileSync(path.join(out,file),Buffer.from(r.data,'base64'));delete r.data;
 results.push({page,action,file,...r,verification:'UI generated image, decoded and extracted exact blob; native Chrome download separately verified using Windows TEMP directory; phone save pending'});
 run('screenshot',path.join(out,`${file.replace(/\.(png|jpg)$/,'')}-preview.png`));
}
writeFileSync(path.join(out,'image-export-checks.json'),JSON.stringify({generatedAt:new Date().toISOString(),results},null,2));
console.log(JSON.stringify(results,null,2));
