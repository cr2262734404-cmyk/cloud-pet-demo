import {DemoEngine} from '../outputs/cloud-pet-demo/engine.mjs';
import {renderBusiness,businessRoutes} from '../outputs/cloud-pet-demo/dist/business.js';
const e=new DemoEngine();
const esc=x=>String(x??'').replaceAll('&','&amp;').replaceAll('<','&lt;').replaceAll('"','&quot;');
const ui={esc,icon:()=>'<svg></svg>',tag:(t)=>`<span>${t}</span>`,section:t=>`<h2>${t}</h2>`,empty:(a,b,button='')=>`<section>${a}${b}${button}</section>`,petAvatar:p=>`<img src="${esc(p.photo)}">`,money:n=>'¥'+Number(n||0).toFixed(2),date:d=>d};
let count=0;
for(const r of businessRoutes){const role=r.role||'owner';const html=renderBusiness({state:e.getState('cloud',role),role,page:r.page,id:r.id,draft:{},ui,theme:{season:'spring',period:'day'}});if(!html.includes('page'))throw new Error('No rendered root '+r.page);if(/undefined|NaN/.test(html))throw new Error('Bad value '+r.page);count++;}
console.log(`${count} business routes rendered from actual engine seed without missing values.`);
