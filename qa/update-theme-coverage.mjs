import {readFileSync,writeFileSync} from 'node:fs';
const p='outputs/cloud-pet-demo/docs/coverage-matrix.csv';
const rows=readFileSync(p,'utf8').replace(/^\uFEFF/,'').trim().split(/\r?\n/).map(line=>line.split(/,(?=(?:[^"]*"[^"]*")*[^"]*$)/).map(cell=>cell.slice(1,-1).replaceAll('""','"')));
for(const r of rows){
 if(['V01','V02','V03','V04'].includes(r[0])){r[8]='theme-validation.json:本季4时段×3视口截图与DOM检查';r[9]='12组Chrome模拟截图;无受检溢出/破图';}
 if(r[0]==='V05'){r[8]='theme-validation.json:48组主题/尺寸DOM检查无异常';r[9]='首页48截图完成;非真机;自动北京时间/弹层切换另验';}
 if(r[0]==='V06'){r[8]='首页48组:主按钮/导航命中与末操作留白通过';r[9]='首页3宽度通过;全路由/性能/系统安全区待设备验';}
 if(r[0]==='C01')r[9]='Chrome 48主题/尺寸截图;布局与主要命中检查通过';
 if(r[0]==='F04')r[7]=r[7].replace('ui.js downloadPoster','export.js downloadPoster');
 if(r[0]==='Q06'){r[6]='首页48组主题/尺寸截图已生成;三端路由截图由各端QA记录';r[8]='docs/theme-validation.json; outputs/screenshots/themes';r[9]='首页48组已生成;全量路由见各端检查记录';}
}
writeFileSync(p,'\uFEFF'+rows.map(r=>r.map(s=>'"'+s.replaceAll('"','""')+'"').join(',')).join('\r\n')+'\r\n');
