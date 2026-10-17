import {DemoEngine} from '../outputs/cloud-pet-demo/engine.mjs';
import {renderBusiness,businessRoutes} from '../outputs/cloud-pet-demo/dist/business.js';
import * as ui from '../outputs/cloud-pet-demo/dist/ui.js';
const engine=new DemoEngine();engine.apply('cloud','owner','demo.scenario',{name:'empty'});let n=0;
for(const r of businessRoutes){const role=r.role||'owner';const html=renderBusiness({state:engine.getState('cloud',role),role,page:r.page,id:r.id,draft:{},ui,theme:{season:'winter',period:'night'}});if(/undefined|NaN/.test(html))throw Error('Bad empty rendering '+r.page);n++;}
console.log(n+' routes render in empty-data scenario with production UI helpers.');
