import assert from 'node:assert/strict';
import {DemoEngine} from '../outputs/cloud-pet-demo/engine.mjs';
import {handleBusiness} from '../outputs/cloud-pet-demo/dist/business.js';
const e=new DemoEngine({now:()=>new Date('2026-10-18T06:00:00Z')});
const savedFormData=globalThis.FormData;
class FakeFormData {constructor(el){this.data=el.values;}*[Symbol.iterator](){for(const [k,v] of Object.entries(this.data))for(const value of (Array.isArray(v)?v:[v]))yield [k,value];}getAll(k){const v=this.data[k];return Array.isArray(v)?v:v===undefined?[]:[v];}}
globalThis.FormData=FakeFormData;
const ctx={role:'owner',draft:{},theme:{season:'spring',period:'day'},get state(){return e.getState('cloud',this.role)},mutate:async(type,d)=>e.apply('cloud',ctx.role,type,d),toast:()=>{},refresh:()=>{},closeModal:()=>{},go:(page,id)=>{ctx.lastGo={page,id};}};
const form=(values,checks={})=>({dataset:{},values,elements:{namedItem:n=>({checked:!!checks[n]}),photoFile:{files:[]},logoFile:{files:[]},beforeFile:{files:[]},afterFile:{files:[]},posterFile:{files:[]}}});
let actions=0;async function action(name,el){assert.equal(await handleBusiness('biz:'+name,el,ctx),true);actions++;}
await action('customer-save',form({name:'测试顾客',phone:'13800008888',contactStatus:'available',notes:'偏好下午'},{consent:true,marketing:true}));const cid=ctx.lastGo.id;assert.ok(ctx.state.customers.some(c=>c.id===cid));
await action('pet-save',form({customerId:cid,name:'小白',breed:'比熊',species:'dog',weight:'4.5',sex:'男孩',birthday:'2022-01-01',photo:'/assets/pet-dog.jpg',careNotes:'怕风',allergies:'无'},{neutered:true}));assert.equal(ctx.lastGo.id,cid);
await action('service-save',form({name:'舒缓梳毛',category:'日常护理',description:'耐心梳毛',species:'犬',price:'68',duration:'30',employees:['e1']},{enabled:true}));const newService=ctx.state.services.find(s=>s.name==='舒缓梳毛');assert.ok(ctx.state.employees.find(e=>e.id==='e1').skills.includes(newService.id));
await action('employee-save',form({name:'小冬',skills:['s1','s3']},{active:true}));assert.ok(ctx.state.employees.find(e=>e.name==='小冬').skills.includes('s1'));
await action('opportunity-save',form({id:'o2',employeeId:'e1',status:'keep'}));
await action('contact-submit',form({id:'o2',text:'您好，元宝很久没来了，有空可以安排护理。',channel:'manual'}));assert.equal(ctx.state.opportunities.find(o=>o.id==='o2').status,'contacted');
await action('booking-create',form({petId:'p3',serviceId:'s1',employeeId:'e1',date:'2026-10-19',time:'09:00',notes:'安静接待',opportunityId:'o2'}));const aid=ctx.lastGo.id;assert.ok(aid);
await action('confirm-booking',{dataset:{id:aid}});
ctx.role='staff';await action('arrive',{dataset:{id:aid}});await action('start',{dataset:{id:aid}});
await action('complete',form({id:aid,behavior:'很配合',note:'今天很乖',nextAdvice:'3 周后',furNote:'毛发蓬松',earsNote:'耳朵干净',nailsNote:'指甲修剪'},{fur:true,ears:true,nails:false}));const rid=ctx.lastGo.id;let report=ctx.state.reports.find(r=>r.id===rid);assert.equal(report.items.fur,'毛发蓬松');assert.equal(report.items.nails,'本次未进行指甲护理');assert.ok(e.getState('cloud','owner').orders.find(o=>o.appointmentId===aid));
await action('report-save',form({id:rid,behavior:'很配合',note:'已更新寄语',nextAdvice:'3 周后',furNote:'毛发蓬松',earsNote:'耳朵干净',nailsNote:'指甲修剪'},{fur:true,ears:true,nails:true}));
await action('gift-generate',form({petId:'p3',reportId:rid,theme:'云朵来信',source:'p3'}));const gid=ctx.state.gifts.at(-1).id;assert.equal(ctx.state.gifts.at(-1).status,'preview');
await action('gift-confirm',form({id:gid},{quality:true,quality2:true}));assert.equal(ctx.state.gifts.find(g=>g.id===gid).status,'confirmed');
ctx.role='owner';const order=ctx.state.orders.find(o=>o.appointmentId===aid);await action('order-confirm',form({id:order.id,amount:'168'}));assert.equal(ctx.state.orders.find(o=>o.id===order.id).attributedAmount,168);
await action('rule-save',form({name:'测试规则',mode:'auto',channel:'subscription',time:'09:00',frequencyDays:'7',quietStart:'21:00',quietEnd:'09:00'},{enabled:true}));await action('reminder-run',{dataset:{}});assert.ok(ctx.state.reminderLogs.length>2);
await action('store-save',form({name:'测试门店',subtitle:'暖心陪伴',phone:'13800001111',address:'演示路',hours:'09:00–18:00',theme:'summer',logo:''}));assert.equal(ctx.state.store.name,'测试门店');
await action('poster-save',form({template:'生日祝福',title:'生日快乐',subtitle:'被爱着的每一天',storeName:'海报门店名',serviceId:'s1',petId:'p3',photo:''}));assert.equal(ctx.state.posts.at(-1).petId,'p3');assert.equal(ctx.state.posts.at(-1).storeName,'海报门店名');
globalThis.FormData=savedFormData;
console.log(`${actions} business UI action handlers passed with actual DemoEngine, including contact → booking → staff care → report → gift → amount attribution.`);
