import http from 'node:http';
import { existsSync, mkdirSync, readFileSync, renameSync, writeFileSync } from 'node:fs';
import { readFile, stat } from 'node:fs/promises';
import { dirname, extname, resolve, sep } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { networkInterfaces } from 'node:os';
import { DemoEngine } from './engine.mjs';

const ROOT=dirname(fileURLToPath(import.meta.url));
const TYPES={'.html':'text/html; charset=utf-8','.js':'text/javascript; charset=utf-8','.mjs':'text/javascript; charset=utf-8','.css':'text/css; charset=utf-8','.json':'application/json; charset=utf-8','.svg':'image/svg+xml','.png':'image/png','.jpg':'image/jpeg','.jpeg':'image/jpeg','.webp':'image/webp','.ico':'image/x-icon','.woff2':'font/woff2','.webmanifest':'application/manifest+json; charset=utf-8'};
const MAX_BODY=5*1024*1024;

export function networkAddresses(port) {
  const addresses=Object.values(networkInterfaces()).flat().filter(a=>a&&a.family==='IPv4'&&!a.internal).map(a=>a.address);
  return {port,localhost:`http://127.0.0.1:${port}`,lan:addresses.map(address=>`http://${address}:${port}`),scope:'局域网共享数据版，需要手机和电脑处于同一 Wi-Fi；这是 H5 演示，非审核后的小程序。'};
}

export function createDemoServer({dataFile=resolve(ROOT,'data/demo.json'),distDir=resolve(ROOT,'dist'),engine:providedEngine}={}) {
  const persist=db=>{mkdirSync(dirname(dataFile),{recursive:true});const temp=`${dataFile}.tmp`;writeFileSync(temp,JSON.stringify(db,null,2));renameSync(temp,dataFile);};
  const engine=providedEngine||new DemoEngine({data:existsSync(dataFile)?JSON.parse(readFileSync(dataFile,'utf8')):null,onSave:persist});
  if(!providedEngine&&!existsSync(dataFile))engine.persist();
  const send=(res,status,value)=>{res.writeHead(status,{'Content-Type':'application/json; charset=utf-8','Cache-Control':'no-store'});res.end(JSON.stringify(value));};
  const server=http.createServer(async(req,res)=>{
    res.setHeader('X-Content-Type-Options','nosniff');res.setHeader('Referrer-Policy','same-origin');res.setHeader('X-Frame-Options','SAMEORIGIN');
    try {
      const url=new URL(req.url,'http://localhost');
      if(req.method==='GET'&&url.pathname==='/api/health')return send(res,200,{ok:true,mode:'shared-lan-demo',authentication:'selectable-demo-roles',realMessaging:false,realPayments:false});
      if(req.method==='GET'&&url.pathname==='/api/network')return send(res,200,networkAddresses(server.address()?.port||4173));
      if(req.method==='GET'&&url.pathname==='/api/state')return send(res,200,engine.getState(url.searchParams.get('store')||'cloud',url.searchParams.get('role')||'customer'));
      if(req.method==='POST'&&url.pathname==='/api/action') {
        if(req.headers.origin&&new URL(req.headers.origin).host!==req.headers.host)return send(res,403,{error:'origin',message:'请从本演示页面提交操作'});
        if(!String(req.headers['content-type']||'').startsWith('application/json'))return send(res,415,{error:'content_type',message:'请求必须为 JSON'});
        if(Number(req.headers['content-length']||0)>MAX_BODY)return send(res,413,{error:'too_large',message:'图片或请求过大，请压缩至 5 MB 以内'});
        const chunks=[];let length=0;
        for await(const chunk of req){length+=chunk.length;if(length>MAX_BODY){send(res,413,{error:'too_large',message:'请求超过 5 MB 限制'});return;}chunks.push(chunk);}
        let body;try{body=JSON.parse(Buffer.concat(chunks).toString('utf8'));}catch{return send(res,400,{error:'json',message:'JSON 请求格式无效'});}
        const {store='cloud',role='customer',type,payload={}}=body;
        return send(res,200,engine.apply(store,role,type,payload,{userAgent:req.headers['user-agent']||''}));
      }
      if(url.pathname.startsWith('/api/'))return send(res,404,{error:'not_found',message:'API 不存在'});
      if(!['GET','HEAD'].includes(req.method))return send(res,405,{error:'method',message:'不支持此请求方法'});
      let pathname;try{pathname=decodeURIComponent(url.pathname);}catch{return send(res,400,{error:'path',message:'无效路径'});}
      if(pathname.includes('\0')||pathname.includes('\\')||pathname.split('/').some(segment=>segment==='..'))return send(res,400,{error:'path',message:'无效文件路径'});
      const base=resolve(distDir);let file=resolve(base,`.${pathname==='/'?'/index.html':pathname}`);
      if(file!==base&&!file.startsWith(base+sep))return send(res,403,{error:'path',message:'禁止访问此路径'});
      try{if(!(await stat(file)).isFile())file=resolve(base,'index.html');}catch{if(extname(pathname))return send(res,404,{error:'not_found',message:'静态资源不存在'});file=resolve(base,'index.html');}
      const data=await readFile(file);res.writeHead(200,{'Content-Type':TYPES[extname(file)]||'application/octet-stream','Cache-Control':'no-cache','Content-Length':data.length});res.end(req.method==='HEAD'?undefined:data);
    }catch(error){if(!res.headersSent)send(res,error.status||500,{error:error.code||'server',message:error.status?error.message:'演示服务暂时出错，请刷新重试'});else res.end();if(!error.status)console.error(error);}
  });
  server.requestTimeout=15000;server.headersTimeout=10000;
  return {server,engine};
}

if(process.argv[1]&&pathToFileURL(resolve(process.argv[1])).href===import.meta.url) {
  const port=Number(process.env.PORT||4173);const {server}=createDemoServer();
  server.on('error',error=>{console.error(`无法启动演示服务：${error.message}`);process.exitCode=1;});
  server.listen(port,'0.0.0.0',()=>{console.log('云朵宠物 H5 · 局域网共享演示');console.log(JSON.stringify(networkAddresses(port),null,2));});
}
