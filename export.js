const palettes={spring:['#c9e7ff','#f7fcff','#164b7c'],summer:['#d4eed7','#f8fff4','#285b40'],autumn:['#ffe7b4','#fffaf0','#78531c'],winter:['#d1eaff','#f5faff','#204d79']};
const resolve=s=>s?.startsWith('/assets/')?'.'+s:s;
const load=src=>new Promise((yes,no)=>{const im=new Image();im.onload=()=>yes(im);im.onerror=()=>no(new Error('照片还没有加载完成，请重试'));im.src=resolve(src);});
export async function downloadPoster({title='云朵宠物',subtitle='',pet,footer='',theme={},kind='poster',template='新客欢迎',themeName='四季花园',storeName='云朵宠物'}){
 const c=document.createElement('canvas');c.width=1080;let g=c.getContext('2d');
 const wrap=(text,font,width)=>{g.font=font;const lines=[];for(const paragraph of String(text||'').split('\n')){let line='';for(const ch of paragraph){if(g.measureText(line+ch).width>width&&line){lines.push(line);line=ch;}else line+=ch;}lines.push(line);}return lines;};
 const titleLines=wrap(title,'bold 62px sans-serif',920),subLines=wrap(subtitle,'32px sans-serif',920),footLines=wrap(footer,'31px sans-serif',920);
 const circle=kind==='gift'||/生日/.test(template),minimal=/服务介绍/.test(template),photoHeight=circle?790:minimal?470:640;
 const image=pet?.photo?await load(pet.photo):null;
 if(kind==='gift'){
  c.height=1080;g=c.getContext('2d');const colors=palettes[theme.season]||palettes.spring;
  const bg=g.createLinearGradient(0,0,1080,1080);bg.addColorStop(0,colors[0]);bg.addColorStop(1,colors[1]);g.fillStyle=bg;g.fillRect(0,0,1080,1080);
  g.fillStyle=colors[2];g.font='bold 32px sans-serif';g.textAlign='center';g.fillText(storeName+' · 专属小礼物',540,72,940);
  g.save();g.beginPath();g.roundRect(112,112,856,800,90);g.clip();g.fillStyle='#ffffff';g.fillRect(112,112,856,800);
  if(image){const ratio=Math.min(856/image.width,800/image.height);g.drawImage(image,112+(856-image.width*ratio)/2,112+(800-image.height*ratio)/2,image.width*ratio,image.height*ratio);}g.restore();
  g.strokeStyle='#ffffffcc';g.lineWidth=14;g.beginPath();g.roundRect(112,112,856,800,90);g.stroke();g.fillStyle=colors[2];g.font='bold 37px sans-serif';g.fillText(String(pet?.name||'小可爱').slice(0,16)+' · '+String(themeName).slice(0,12),540,978);g.font='25px sans-serif';g.fillText('原照片保真 · 模拟主题画框',540,1030);
  const blob=await new Promise(r=>c.toBlob(r,'image/png'));if(!blob)throw new Error('图片导出失败，请重试');const url=URL.createObjectURL(blob);window.dispatchEvent(new CustomEvent('image-export',{detail:{url,name:`云朵宠物-${pet?.name||'宠物'}-头像礼物.png`}}));return {url,blob,width:1080,height:1080};
 }
 c.height=Math.max(kind==='gift'?1410:1450,260+titleLines.length*80+subLines.length*48+(image?photoHeight+90:50)+footLines.length*49+165);
 g=c.getContext('2d');let colors=palettes[theme.season]||palettes.spring;
 if(kind==='poster'){if(/节日/.test(template))colors=palettes.autumn;if(/老客/.test(template))colors=palettes.summer;if(/生日/.test(template))colors=['#fbe1df','#fff9f4','#824c4a'];}
 const bg=g.createLinearGradient(0,0,1080,c.height);bg.addColorStop(0,colors[0]);bg.addColorStop(1,colors[1]);g.fillStyle=bg;g.fillRect(0,0,1080,c.height);
 const drawLines=(lines,x,y,font,lineHeight)=>{g.font=font;g.fillStyle=colors[2];for(const line of lines){g.fillText(line,x,y);y+=lineHeight;}return y;};
 g.fillStyle='#ffffff88';g.beginPath();g.arc(1050,60,310,0,Math.PI*2);g.fill();g.fillStyle=colors[2];g.font='bold 32px sans-serif';g.fillText(kind==='report'?storeName+'  /  护理手记':kind==='gift'?storeName+'  /  送给你的小心意':storeName+'  /  '+template,76,100);
 let y=drawLines(titleLines,76,215,'bold 62px sans-serif',80);y=drawLines(subLines,76,y+12,'32px sans-serif',48);
 if(image){y+=35;g.save();g.beginPath();if(circle)g.arc(540,y+395,395,0,Math.PI*2);else g.roundRect(76,y,928,photoHeight,/洗护/.test(template)?80:28);g.clip();const w=circle?790:928,h=photoHeight,x=circle?145:76,ratio=Math.max(w/image.width,h/image.height);g.drawImage(image,x+(w-image.width*ratio)/2,y+(h-image.height*ratio)/2,image.width*ratio,image.height*ratio);g.restore();if(circle){g.strokeStyle='#ffffff';g.lineWidth=14;g.beginPath();g.arc(540,y+395,395,0,Math.PI*2);g.stroke();}y+=photoHeight+70;}
 if(kind==='gift'){g.font='bold 29px sans-serif';g.fillStyle=colors[2];g.fillText(themeName+' · 保留它独一无二的样子',76,y);y+=65;}
 y=drawLines(footLines,76,y,'31px sans-serif',49);
 if(kind==='poster'&&/新客|老客/.test(template)){g.strokeStyle=colors[2]+'66';g.lineWidth=2;g.setLineDash([9,9]);g.strokeRect(50,145,980,c.height-245);g.setLineDash([]);}
 g.fillStyle=colors[2];g.globalAlpha=.66;g.font='25px sans-serif';g.fillText(kind==='gift'?'模拟主题画框 · 原照片保真展示':'H5 演示 · 模拟记录，非真实服务凭证',76,c.height-65);
 const blob=await new Promise(r=>c.toBlob(r,'image/png'));if(!blob)throw new Error('图片导出失败，请稍后重试');const url=URL.createObjectURL(blob);window.dispatchEvent(new CustomEvent('image-export',{detail:{url,name:`云朵宠物-${title}.png`}}));return {url,blob,width:c.width,height:c.height};
}

