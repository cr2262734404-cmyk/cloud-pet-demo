const sharp=require('C:/Users/Administrator/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/sharp');
const path=require('path');
const fs=require('fs');
const source='C:/Users/Administrator/.codex/generated_images/01a14b23-3ade-7570-9e8f-a90803b6841c';
const out=path.resolve('outputs/cloud-pet-demo/dist/assets');
const assets={scenes:'exec-fe1caa88-a3fd-49cd-87bd-9a6d442cb0da.png',icons:'exec-07626f4c-ba81-461a-a63a-d5e5b6e50125.png','pet-dog':'exec-61b5de35-e4a1-4ad4-92ea-212d7366fbc7.png','pet-cat':'exec-90c8875d-2b89-4b01-90fc-ab22e1169a65.png','pet-corgi':'exec-23b33422-3cf7-46f6-84e4-519e0d36768a.png'};
(async()=>{for(const [name,file] of Object.entries(assets)){const src=path.join(source,file);const m=await sharp(src).metadata();if(name.startsWith('pet'))await sharp(src).resize(800).jpeg({quality:88}).toFile(path.join(out,name+'.jpg'));else await sharp(src).webp({quality:91}).toFile(path.join(out,name+'.webp'));console.log(name,m.width,m.height);}fs.copyFileSync(path.join(out,'pet-corgi.jpg'),path.join(out,'pet-poodle.jpg'));})();
