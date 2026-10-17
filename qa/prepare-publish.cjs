const fs=require('node:fs'),path=require('node:path');
const sharp=require('C:/Users/Administrator/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/sharp');
const QR=require('./tools/node_modules/qrcode');
(async()=>{const root='outputs/github-pages-site';for(const name of fs.readdirSync(root+'/assets').filter(n=>/^locked-(spring|winter|summer-[ab]|autumn-[ab])\.webp$/.test(n))){const p=root+'/assets/'+name;const source=fs.readFileSync('outputs/cloud-pet-demo/dist/assets/'+name);const b=await sharp(source).webp({quality:92,effort:6}).toBuffer();fs.writeFileSync(p,b);console.log(name+' '+b.length);}
await QR.toFile(root+'/assets/access-qr.png','https://cr2262734404-cmyk.github.io/cloud-pet-demo/',{width:800,margin:3,color:{dark:'#163b59',light:'#ffffff'}});
fs.copyFileSync(root+'/assets/access-qr.png','outputs/手机体验二维码.png');
})();
