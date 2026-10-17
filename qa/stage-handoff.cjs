const fs=require('node:fs'),path=require('node:path');
const stage=path.resolve('work/handoff');fs.mkdirSync(stage,{recursive:true});const source=path.resolve('outputs/cloud-pet-demo');
fs.cpSync(source,path.join(stage,'cloud-pet-demo'),{recursive:true,filter:p=>path.relative(source,p).split(path.sep)[0]!=='data'});
fs.cpSync('outputs/screenshots',path.join(stage,'screenshots'),{recursive:true});
for(const n of ['交付导航.html','手机体验二维码.png','手机验收与访问.md'])fs.copyFileSync('outputs/'+n,path.join(stage,n));
fs.writeFileSync(path.join(stage,'打开说明.txt'),'先打开「交付导航.html」查看网址、二维码、源码文档和高清截图。\r\n公网 H5：https://cr2262734404-cmyk.github.io/cloud-pet-demo/\r\n本地共享版：进入 cloud-pet-demo，运行 启动演示.cmd（需 Node.js 20 或更高版本）。\r\n包内不含运行时测试数据库，首次启动会生成干净的模拟数据。\r\nAndroid 与 iPhone 真机验收仍需用户实际操作并反馈。\r\n');
console.log(JSON.stringify({staging:stage,runtimeDatabaseIncluded:false}));
