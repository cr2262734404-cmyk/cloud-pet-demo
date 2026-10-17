import { copyFileSync, cpSync, existsSync, mkdirSync, readFileSync, readdirSync, writeFileSync, unlinkSync } from 'node:fs';
import { dirname, extname, join, resolve, relative, sep } from 'node:path';
import { fileURLToPath } from 'node:url';

// Run after the UI has been saved. No deploy, Git mutation, network request or secret is needed.
const PROJECT=dirname(fileURLToPath(import.meta.url));
const DIST=join(PROJECT,'dist');
const OUTPUT=resolve(PROJECT,'../github-pages-site');
const OUTPUTS=resolve(PROJECT,'..');
const RELEASE='world16-v2';
if(!OUTPUT.startsWith(OUTPUTS+sep)||OUTPUT===DIST)throw new Error('Published copy must stay in the intended outputs folder.');
mkdirSync(DIST,{recursive:true});
copyFileSync(join(PROJECT,'engine.mjs'),join(DIST,'engine.mjs'));
const required=['index.html','main.js','styles.css','ui.js','customer.js','business.js','engine.mjs'];
const missing=required.filter(name=>!existsSync(join(DIST,name)));
if(missing.length)throw new Error(`UI files are not ready yet: ${missing.join(', ')}. Pure engine was copied to dist/engine.mjs; rerun this build after the files are saved.`);
const core=readFileSync(join(DIST,'engine.mjs'),'utf8');
if(/(?:from\s*['"]node:|require\s*\()/.test(core))throw new Error('Browser engine must remain independent of Node libraries.');
mkdirSync(OUTPUT,{recursive:true});
const excluded=new Set(['scenes.webp','icons.webp','pet-poodle.jpg','locked-icon-review.png','locked-scene-review.jpg','locked-manifest.json']);
for(const name of readdirSync(join(DIST,'assets')))if(excluded.has(name)||name.endsWith('-repair-mask.png')){const stale=join(OUTPUT,'assets',name);if(existsSync(stale))unlinkSync(stale);}
cpSync(DIST,OUTPUT,{recursive:true,filter:source=>!excluded.has(source.split(/[\\/]/).at(-1))&&!source.endsWith('-repair-mask.png')});
let rewritten=0;
const rewrite=(file)=>{
  const ext=extname(file).toLowerCase();if(!['.html','.js','.mjs','.css','.json','.webmanifest'].includes(ext))return;
  let source=readFileSync(file,'utf8');
  // Assets are relative to the repository base. Keep /api routes unchanged for runtime capability detection.
  // Rewrite concrete asset URLs only. Prefix checks such as startsWith('/assets/')
  // must stay unchanged or their normalizer turns ./assets/x into ../assets/x.
  source=source.replace(/(['"`])\/assets\/(?=[^'"`])/g,'$1./assets/');
  if(ext==='.html')source=source.replace(/\b(href|src)=(['"])\/(?!\/)/g,'$1=$2./');
  if(ext==='.css')source=source.replace(/url\(\s*(['"]?)\/(?!\/)/g,'url($1./');
  if(['.js','.mjs'].includes(ext))source=source.replace(/\b(from\s*|import\s*\(\s*)(['"])\/(?!\/)/g,'$1$2./');
  if(['.js','.mjs'].includes(ext))source=source.replace(/(\bfrom\s*['"]|\bimport\s*\(\s*['"])(\.\/[^'"?]+\.(?:js|mjs))(['"])/g,`$1$2?v=${RELEASE}$3`);
  if(ext==='.html')source=source.replace(/((?:src|href)=['"]\.\/[^'"?]+\.(?:js|css))(['"])/g,`$1?v=${RELEASE}$2`);
  if(ext==='.html')source=source.replace(/同一 Wi-Fi 下，用手机打开<br>[^<]+/g,'用手机打开当前 HTTPS 链接<br>浏览器即可体验 H5 演示');
  if(ext==='.html'&&!source.includes('name="cloud-demo-mode"'))source=source.replace('<head>','<head><meta name="cloud-demo-mode" content="static">');
  writeFileSync(file,source);rewritten++;
};
const walk=dir=>{for(const entry of readdirSync(dir,{withFileTypes:true})){const path=join(dir,entry.name);if(entry.isDirectory())walk(path);else rewrite(path);}};
walk(OUTPUT);
writeFileSync(join(OUTPUT,'.nojekyll'),'');
copyFileSync(join(OUTPUT,'index.html'),join(OUTPUT,'404.html'));
const urlIndex=process.argv.indexOf('--url');
const publicUrl=urlIndex>=0?process.argv[urlIndex+1]||'':'';
if(publicUrl&&!/^https:\/\/[^\s]+\/?$/.test(publicUrl))throw new Error('--url must be a safe HTTPS demo URL.');
writeFileSync(join(OUTPUT,'build-info.json'),JSON.stringify({name:'云朵宠物 H5 交互演示',builtAt:new Date().toISOString(),publicUrl,mode:'static-localStorage',crossDeviceSync:false,realMessaging:false,realPayments:false,wechatMiniProgram:false},null,2));
writeFileSync(join(OUTPUT,'DEPLOYMENT.md'),`# 云朵宠物 · 静态 H5 发布包\n\n这是 GitHub Pages 可发布静态目录，可在 Android 和 iPhone 手机浏览器打开。${publicUrl?`\n\n预期演示地址：${publicUrl}`:''}\n\n- 把此目录的**内容**放在目标仓库的 Pages 发布分支根目录或配置的发布文件夹。\n- GitHub 仓库 Settings → Pages 选择对应发布分支和目录。发布成功后使用 GitHub 给出的 HTTPS 地址。\n- 本构建仅准备文件，没有创建仓库、推送、部署或申请微信审核。\n- 路由采用应用自身的 hash 导航；404.html 是同一入口的回退副本。\n- 静态版使用当前浏览器 localStorage，共享当前设备上的三角色数据。不同设备、不同浏览器之间不会自动同步。\n- 局域网 Node 服务版本另见 cloud-pet-demo/server.mjs；其 API 数据才可在同一服务连接下跨设备同步。\n- 演示角色可以自由切换。这不是正式登录、权限隔离或生产数据库。\n- 真实设备测试必须由对应设备实际操作并提交；构建不会自动标记 Android 或 iPhone 验收通过。\n- 发布前检查二维码指向最终 HTTPS 地址；不要沿用局域网二维码冒充公网入口。\n\n构建来源：${relative(OUTPUT,PROJECT).replaceAll('\\','/')}\n`);
console.log(JSON.stringify({ok:true,directory:OUTPUT,rewritten,publicUrl:publicUrl||null,mode:'static-localStorage',deployed:false},null,2));
