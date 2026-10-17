const fs=require('node:fs'),path=require('node:path'),crypto=require('node:crypto');
const sharp=require('C:/Users/Administrator/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/sharp');
const root=path.resolve('outputs/cloud-pet-demo'),dir=path.join(root,'references/time-extensions'),assets=path.join(root,'dist/assets');
const {records}=JSON.parse(fs.readFileSync(path.join(dir,'autumn-winter-prompts.json'),'utf8'));
const observations={
 'world-autumn-morning':'低位晨阳、蓝色天空与湖面薄雾；无月亮星空；白狗低头闻落叶、猫沿路径走来。',
 'world-autumn-day':'太阳升高、明亮蓝天白云、蓝色湖面与短阴影；无月亮星空；狗回头轻步行走、猫抬爪玩落叶。',
 'world-autumn-night':'新绘靛蓝星空与上方弯月、湖面银光及远村灯光；狗坐着望湖、猫安静趴在后侧；无太阳。',
 'world-winter-morning':'左侧低位晨阳、山湖薄雾与长柔影；彻底去掉月亮和天上星点；狗睡醒抬头、猫半睁眼休息。',
 'world-winter-day':'清亮蓝天白云与自然日照、清晰蓝色雪影；彻底去掉月亮和天上星点；狗醒着望窗外、猫伸懒腰。',
 'world-winter-sunset':'左侧低太阳、玫瑰晚霞与雪地长影、窗内暖灯；无月亮星空；狗舒适伏卧、猫坐看远景。'
};
(async()=>{const manifest={createdAt:new Date().toISOString(),tool:'built-in image_gen.imagegen',assets:[]};for(const r of records){
 const mother=r.name.includes('winter')?'locked-winter.webp':'locked-autumn-a.webp';
 const source=path.join(dir,r.name+'.png'),webp=path.join(assets,r.name+'.webp');
 if(fs.existsSync(source)||fs.existsSync(webp))throw Error('Refuse to overwrite existing '+r.name);
 fs.copyFileSync(r.sourcePath,source);
 const m=await sharp(source).metadata();await sharp(source).webp({quality:92,effort:6}).toFile(webp);const w=await sharp(webp).metadata();
 manifest.assets.push({name:r.name,mother:'dist/assets/'+mother,source:'references/time-extensions/'+r.name+'.png',webp:'dist/assets/'+r.name+'.webp',width:m.width,height:m.height,webpWidth:w.width,webpHeight:w.height,sourceBytes:fs.statSync(source).size,webpBytes:fs.statSync(webp).size,sourceSha256:crypto.createHash('sha256').update(fs.readFileSync(source)).digest('hex'),motherSha256:crypto.createHash('sha256').update(fs.readFileSync(path.join(assets,mother))).digest('hex'),formatConversionOnly:true,visualCheck:{reviewed:true,timeLogic:observations[r.name],preserved:'保留天空/远山/湖泊/左侧树/路径的空间层次；冬季右侧原小屋位置保持；两只宠物身份及画面尺度延续；无新增大型建筑或宠物，无UI/文字。'}});
 console.log(r.name,m.width+'x'+m.height,fs.statSync(webp).size+' bytes');
}fs.writeFileSync(path.join(dir,'autumn-winter-manifest.json'),JSON.stringify(manifest,null,2));})();
