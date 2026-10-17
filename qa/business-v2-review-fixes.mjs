import fs from 'node:fs';
const file='outputs/cloud-pet-demo/dist/business.js';let src=fs.readFileSync(file,'utf8');
src=src.replace("${pending[0]?`${dateLabel(c,pending[0].date)} ${pending[0].time} · ${pet(s,pending[0].petId).name}`:'可在排期中查看今日到店与空档'}", "${pending[0]?E(c,`${dateLabel(c,pending[0].date)} ${pending[0].time} · ${pet(s,pending[0].petId).name}`):'可在排期中查看今日到店与空档'}");
// Make list predicates explicit: a scope changes what records are displayed, not authority.
src=src.replace("(type==='all'||type==='protected'?type!=='protected'||p.deceased:!p.deceased&&(type==='active'||p.species===type))", "(type==='all'||(type==='protected'?p.deceased:!p.deceased&&(type==='active'||p.species===type)))");
src=src.replace("(scope==='all'||scope==='upcoming'?scope!=='upcoming'||a.date>s.today:a.date===s.today)&&(status==='all'||status==='waiting'?status!=='waiting'||['pending','confirmed','arrived'].includes(a.status):a.status===status)", "(scope==='all'||(scope==='upcoming'?a.date>s.today:a.date===s.today))&&(status==='all'||(status==='waiting'?['pending','confirmed','arrived'].includes(a.status):a.status===status))");
fs.writeFileSync(file,src);
