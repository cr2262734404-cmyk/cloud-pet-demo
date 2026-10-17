// Local, deliberately selectable demo roles. This is not production authentication.
const ACTIVE = new Set(['pending','confirmed','arrived','serving']);
const ROLES = new Set(['customer','owner','staff']);
const clone = value => structuredClone(value);
const id = prefix => `${prefix}-${globalThis.crypto?.randomUUID?.().slice(0,8)||Math.random().toString(36).slice(2,10)}`;
export const todayShanghai = (now = new Date()) => new Intl.DateTimeFormat('en-CA', {timeZone:'Asia/Shanghai',year:'numeric',month:'2-digit',day:'2-digit'}).format(now);
export const shiftDate = (day, n) => new Date(Date.parse(`${day}T12:00:00+08:00`) + n*86400000).toISOString().slice(0,10);
const timeMinutes = time => /^([01]\d|2[0-3]):[0-5]\d$/.test(String(time)) ? Number(time.slice(0,2))*60+Number(time.slice(3)) : NaN;
export function openingHours(value='09:00–18:00',strict=false) {
  const match=String(value).trim().match(/^([0-2]\d:[0-5]\d)\s*[-–—~至]\s*([0-2]\d:[0-5]\d)$/);
  const start=match?timeMinutes(match[1]):NaN,end=match?(match[2]==='24:00'?1440:timeMinutes(match[2])):NaN;
  if(!match||!Number.isFinite(start)||!Number.isFinite(end)||start>=end||start%30!==0||end%30!==0){if(strict)ERR('营业时间请填写当天起止时间（例如 09:00–18:00），使用半小时整点且结束晚于开始');return {open:'09:00',close:'18:00',start:540,end:1080};}
  return {open:match[1],close:match[2],start,end};
}
const number = (value, fallback=0) => Number.isFinite(Number(value)) ? Number(value) : fallback;
const bool = value => value === true || value === 'true' || value === 'on' || value === 1;
const text = (value,max=2000) => String(value??'').trim().slice(0,max);
const timestamp = (day,hour='10:00') => `${day}T${hour}:00+08:00`;
const ERR = (message,code='invalid',status=400) => {const error = new Error(message); error.code=code; error.status=status; throw error;};
const requireIt = (condition,message,code,status) => {if (!condition) ERR(message,code,status);};
const only = (role,allowed) => requireIt(allowed.includes(role),'此演示角色没有该操作权限','forbidden',403);
const find = (list,identifier,label='记录') => {const item = list.find(i=>i.id===identifier); requireIt(item,`${label}不存在或不属于当前门店`,'not_found',404);return item;};
const pick = (payload,keys) => Object.fromEntries(keys.filter(key=>Object.hasOwn(payload,key)).map(key=>[key,payload[key]]));
const photo = value => {const s=String(value??'').trim();requireIt(s.length<=1800000,'这张照片保存后仍过大，请选择较小的照片或降低分辨率');requireIt(!s || /^\.?\/assets\/[\w./-]+$/.test(s) || /^data:image\/(png|jpeg|webp);base64,[A-Za-z0-9+/=]+$/.test(s),'请使用本地 PNG、JPEG 或 WebP 图片');return s;};

function makeTenant(storeId,today) {
  const cloud = storeId==='cloud';
  const store={id:storeId,name:cloud?'云朵宠物':'青禾宠物',subtitle:cloud?'陪伴更美好的日常':'把每一份陪伴，照顾得刚刚好',phone:cloud?'021-5550-0726':'021-5550-0318',address:cloud?'上海市 · 云朵路 26 号（演示地址）':'上海市 · 青禾路 18 号（演示地址）',hours:'09:00–18:00',logo:'',theme:cloud?'spring':'summer'};
  const names=['林女士','张先生','陈女士','周女士','许先生','刘女士','王先生','李女士','赵女士','吴先生'];
  const customers=names.map((name,index)=>({id:`c${index+1}`,name:cloud?name:`青禾·${name}`,phone:`1380000${String(1001+index).padStart(4,'0')}`,consent:true,marketing:true,contactStatus:'available',cooldownUntil:'',notes:'演示资料，非真实顾客',visits:[12,3,8,6,2,5,7,3,4,6][index]}));
  Object.assign(customers[3],{cooldownUntil:shiftDate(today,10),contactStatus:'cooldown',notes:'家庭刚失去一只宠物，暂缓关怀与营销；冷却结束后仅恢复健在宠物'});
  Object.assign(customers[4],{marketing:false,consent:false,contactStatus:'stopped',notes:'顾客明确拒绝营销联系，请尊重选择'});
  Object.assign(customers[5],{cooldownUntil:shiftDate(today,-2),notes:'家庭敏感冷却已结束；仅小麦恢复适合的护理提醒，已离世宠物永久退出'});
  const rawPets=[['p1','c1','糯米','比熊','dog'],['p2','c1','橘子','橘猫','cat'],['p3','c2','元宝','柯基','corgi'],['p4','c3','奶油','比熊','dog'],['p5','c4','豆豆','比熊','dog'],['p6','c4','豆包','橘猫','cat'],['p7','c6','小麦','柯基','corgi'],['p8','c5','可乐','柯基','corgi'],['p9','c7','年糕','比熊','dog'],['p10','c8','布丁','比熊','dog'],['p11','c9','小满','橘猫','cat'],['p12','c10','雪球','比熊','dog'],['p13','c6','团团','橘猫','cat']];
  const pets=rawPets.map(([petId,customerId,name,breed,img],index)=>({id:petId,customerId,name,breed,species:img==='cat'?'cat':'dog',sex:index%2?'女孩':'男孩',birthday:index===3?`${Number(today.slice(0,4))-3}${today.slice(4)}`:`2022-0${index%8+1}-18`,weight:index%3+4.2,neutered:index%2===0,careNotes:index===0?'怕大风声，吹毛时请低风档并轻声安抚。':'护理过程中请温柔安抚',allergies:index===0?'对含香精洗剂敏感':'暂无已知过敏',photo:`/assets/pet-${img}.jpg`,samplePhoto:true,deceased:petId==='p5'||petId==='p13'}));
  const employees=[{id:'e1',name:'小夏',skills:['s1','s2','s3'],active:true},{id:'e2',name:'阿澄',skills:['s1','s2','s3','s4'],active:true},{id:'e3',name:'小禾',skills:['s2','s3'],active:false}];
  const services=[{id:'s1',name:'洗护造型',category:'洗护美容',description:'温和洗浴、蓬松吹护、基础造型与三项日常护理。',price:cloud?168:158,duration:90,species:'犬',employeeIds:['e1','e2'],enabled:true},{id:'s2',name:'轻柔日常洗护',category:'日常洗护',description:'低刺激洗护与温柔吹毛，适合规律护理的小可爱。',price:cloud?98:88,duration:60,species:'犬',employeeIds:['e1','e2'],enabled:true},{id:'s3',name:'爪爪与耳部护理',category:'基础护理',description:'指甲修整、耳部清洁与护理检查。',price:38,duration:30,species:'犬 / 猫',employeeIds:['e1','e2'],enabled:true},{id:'s4',name:'猫咪舒缓洗护',category:'猫咪专属',description:'独立安静环境，循序渐进的猫咪洗护体验。',price:188,duration:120,species:'猫',employeeIds:['e2'],enabled:true}];
  const appointment=(aid,c,p,s,e,date,time,status,op='')=>({id:aid,customerId:c,petId:p,serviceId:s,employeeId:e,date,time,status,notes:'',opportunityId:op,amount:services.find(x=>x.id===s).price,createdAt:timestamp(shiftDate(date,-1))});
  const appointments=[appointment('a1','c1','p1','s1','e1',today,'09:00','confirmed','o1'),appointment('a2','c7','p9','s2','e1',today,'11:00','arrived'),appointment('a3','c8','p10','s1','e2',today,'10:30','serving'),appointment('a4','c1','p2','s4','e2',shiftDate(today,1),'14:00','pending','o11'),appointment('a-h1','c1','p1','s1','e1',shiftDate(today,-35),'14:00','completed'),appointment('a-h2','c2','p3','s1','e1',shiftDate(today,-96),'10:00','completed'),appointment('a-h3','c3','p4','s2','e2',shiftDate(today,-28),'13:00','completed'),appointment('a-h4','c7','p9','s1','e1',shiftDate(today,-5),'15:00','completed','o10')];
  appointments[0].createdAt=timestamp(today,'08:00');
  const reports=appointments.filter(a=>a.status==='completed').map((a,index)=>({id:index===0?'r1':`r${index+1}`,appointmentId:a.id,petId:a.petId,customerId:a.customerId,employeeId:a.employeeId,date:a.date,items:{fur:'已完成温和洗护，毛发蓬松柔顺',ears:'已完成耳部清洁，状态良好',nails:'已修剪并磨圆'},behavior:'今天很乖，吹毛时靠着我打了个盹。',note:'每一个小小的进步，我们都认真记着。',nextAdvice:'建议 3–4 周后再次护理；日常梳毛保持毛发清爽。',viewed:index!==0,status:'completed',beforePhoto:'',afterPhoto:pets.find(p=>p.id===a.petId).photo}));
  const orders=appointments.filter(a=>a.status==='completed').map((a,index)=>({id:`ord${index+1}`,appointmentId:a.id,customerId:a.customerId,petId:a.petId,amount:a.amount,status:'confirmed',opportunityId:a.opportunityId,date:a.date,confirmedAt:timestamp(a.date,'17:00')}));
  const opportunity=(oid,c,p,s,type,title,reason,priority,status='new')=>({id:oid,customerId:c,petId:p,serviceId:s,type,title,reason,estimate:services.find(x=>x.id===s).price,priority,status,employeeId:'e1',contactedAt:'',appointmentId:'',blockedReason:'',createdAt:timestamp(shiftDate(today,-1)),events:[]});
  const opportunities=[opportunity('o1','c1','p1','s1','repurchase','糯米的蓬松日，已经约好','距离上次洗护 35 天，已按周期关怀并成功预约。',96,'booked'),opportunity('o2','c2','p3','s1','recall','元宝好久不见啦','最近一次到店为 96 天前，建议先关心近况，再邀请回店。',94),opportunity('o3','c3','p4','s2','birthday','给奶油一个生日拥抱','今天是奶油的生日，可送上祝福并邀请温柔护理。',88),opportunity('o4','c4','p5','s1','repurchase','豆豆已退出复购提醒','已离世宠物永久退出复购营销，不随家庭冷却结束恢复。',0,'blocked'),opportunity('o5','c5','p8','s1','recall','可乐主人已停止营销联系','客户明确取消营销提醒，所有渠道停止触达。',0,'blocked'),opportunity('o6','c4','p6','s4','family','豆包暂缓关怀','家庭敏感冷却期尚未结束，避免给家人造成打扰。',0,'blocked'),opportunity('o7','c6','p7','s1','family','小麦可以恢复温柔护理了','家庭冷却已结束；健在宠物恢复正常护理机会，团团仍永久排除。',82),opportunity('o8','c9','p11','s4','capacity','为小满留一个安静午后','阿澄今日 14:00 有连续 120 分钟空档，适合猫咪舒缓洗护。',79),opportunity('o9','c10','p12','s3','recommendation','雪球的爪爪该修剪啦','上次记录建议 4 周复查指甲，今日可安排 30 分钟基础护理。',75),opportunity('o10','c7','p9','s1','repurchase','一次关怀，带回一次见面','人工联系后的第 2 天完成洗护，金额已确认。',70,'completed'),opportunity('o11','c1','p2','s4','pending','确认橘子的明日预约','明日 14:00 猫咪洗护仍待确认，请提醒顾客核对时间。',90,'new')];
  Object.assign(opportunities[0],{contactedAt:timestamp(shiftDate(today,-1),'10:00'),appointmentId:'a1',events:[{type:'contacted',at:timestamp(shiftDate(today,-1))},{type:'booked',at:timestamp(today,'08:00')}]});
  Object.assign(opportunities[9],{contactedAt:timestamp(shiftDate(today,-7)),appointmentId:'a-h4',events:[{type:'contacted',at:timestamp(shiftDate(today,-7))},{type:'booked',at:timestamp(shiftDate(today,-6))},{type:'completed',at:timestamp(shiftDate(today,-5))}]});
  opportunities[10].appointmentId='a4';
  for(const op of opportunities)if(op.serviceId==='s4')op.employeeId='e2';
  const reminderRules=[{id:'rule1',name:'温柔复购关怀',mode:'manual',channel:'subscription',enabled:true,time:'10:00',frequencyDays:7,quietStart:'21:00',quietEnd:'09:00'}];
  const reminderLogs=[{id:'log1',customerId:'c1',opportunityId:'o1',channel:'manual',status:'contacted',reason:'人工联系标记；未发送任何真实消息',text:'糯米的护理时间快到了，为您留一个好时光。',date:timestamp(shiftDate(today,-1))},{id:'log2',customerId:'c7',opportunityId:'o10',channel:'subscription',status:'simulated',reason:'已授权，模拟订阅消息',text:'年糕的蓬松日该安排啦。',date:timestamp(shiftDate(today,-7))}];
  const gifts=[{id:'g1',petId:'p1',customerId:'c1',reportId:'r1',theme:'春日花园',status:'confirmed',photo:'/assets/pet-dog.jpg',note:'预设主题演示，保留原宠物照片；未调用 AI 生成'}];
  const posts=[{id:'post1',template:'洗护预约',title:'把今天的温柔，留给毛孩子',subtitle:'预约一次轻柔洗护，带一份蓬松回家',serviceId:'s1',storeName:store.name,photo:'/assets/pet-dog.jpg',date:today}];
  return {store,customers,pets,services,employees,appointments,reports,orders,opportunities,reminderRules,reminderLogs,gifts,posts,deviceTests:[],revision:1};
}

export function seedDatabase(now = new Date()) {const today=todayShanghai(now);return {version:1,stores:{cloud:makeTenant('cloud',today),meadow:makeTenant('meadow',today)}};}

function contactBlock(state,op,now,{channel='manual',frequencyDays=7,ignoreTerminal=false}={}) {
  const c=state.customers.find(c=>c.id===op.customerId),p=state.pets.find(p=>p.id===op.petId);
  if(!c || !p) return '顾客或宠物资料缺失';
  if(p.deceased) return '宠物已离世，永久退出营销';
  if(!c.marketing || c.contactStatus==='stopped') return '顾客已取消营销联系';
  if(c.cooldownUntil && c.cooldownUntil>=todayShanghai(now)) return `家庭敏感冷却至 ${c.cooldownUntil}`;
  if(!ignoreTerminal && ['completed','paused','booked'].includes(op.status)) return '机会已完成、已预约或暂停，不再重复提醒';
  if(channel!=='manual' && !c.consent) return '未取得该模拟触达渠道授权';
  const last=state.reminderLogs.filter(l=>l.customerId===c.id && ['contacted','simulated'].includes(l.status)).sort((a,b)=>Date.parse(b.date)-Date.parse(a.date))[0];
  if(last && now.getTime()-Date.parse(last.date)<frequencyDays*86400000) return `同一顾客 ${frequencyDays} 天内仅联系一次，避免重复打扰`;
  return '';
}

function decorate(state,now) {
  for(const op of state.opportunities) {
    const reason=contactBlock(state,op,now,{ignoreTerminal:true,frequencyDays:0});
    op.blockedReason=reason;
    if(reason && !['completed','booked'].includes(op.status)) op.status='blocked';
    else if(!reason && op.status==='blocked') op.status='new';
  }
  for(const order of state.orders) {
    const a=state.appointments.find(a=>a.id===order.appointmentId),op=state.opportunities.find(o=>o.id===order.opportunityId);
    const delta=a&&op?Date.parse(a.createdAt)-Date.parse(op.contactedAt):NaN;
    const eligible=order.status==='confirmed'&&a?.status==='completed'&&op?.appointmentId===a.id&&delta>=0&&delta<=7*86400000;
    order.attributedAmount=eligible?order.amount:0;
    order.attributionReason=eligible?'联系后 7 天内形成预约，服务已完成且消费金额已确认':!op?'未关联有效机会':order.status!=='confirmed'?'消费金额尚未确认':a?.status!=='completed'?'服务尚未完成':'预约时间不在联系后 7 天归因窗口内';
  }
}

function validateBooking(state,fields,now,exclude='') {
  const pet=find(state.pets,fields.petId,'宠物'), service=find(state.services,fields.serviceId,'服务');
  requireIt(!pet.deceased,'已离世宠物无法预约'); requireIt(service.enabled,'该服务暂未开放预约');
  const cat=pet.species?pet.species==='cat':/猫|布偶|暹罗|英短|美短/.test(pet.breed); requireIt(cat?/猫|cat/.test(service.species):/犬|狗|dog/.test(service.species),'此服务不适用于当前宠物，请选择适用项目');
  const parsedDate=Date.parse(`${fields.date}T12:00:00Z`);requireIt(/^\d{4}-\d{2}-\d{2}$/.test(fields.date)&&!Number.isNaN(parsedDate)&&new Date(parsedDate).toISOString().slice(0,10)===fields.date,'请选择有效日期');
  requireIt(fields.date>=todayShanghai(now)&&fields.date<=shiftDate(todayShanghai(now),90),'请选择今天起 90 天内的日期');
  const hours=openingHours(state.store.hours),start=timeMinutes(fields.time);requireIt(Number.isFinite(start)&&start>=hours.start&&start%30===0&&start+service.duration<=hours.end,`预约须在 ${hours.open}–${hours.close} 内完成，起始时间为半小时整点`);
  const matches=state.employees.filter(e=>e.active&&e.skills.includes(service.id)&&service.employeeIds.includes(e.id));
  requireIt(matches.length>0,'该服务暂无在岗且具备技能的护理师');
  const available=e=>!state.appointments.some(a=>a.id!==exclude&&ACTIVE.has(a.status)&&a.date===fields.date&&a.employeeId===e.id&&start<timeMinutes(a.time)+(state.services.find(s=>s.id===a.serviceId)?.duration||30)&&start+service.duration>timeMinutes(a.time));
  const employee=fields.employeeId?matches.find(e=>e.id===fields.employeeId):matches.find(available);
  requireIt(employee,'护理师未在岗或不具备此服务技能'); requireIt(available(employee),'这个时段刚被预约，请选择其他时间或护理师','conflict',409);
  return {...fields,employeeId:employee.id,customerId:pet.customerId,amount:service.price};
}

export class DemoEngine {
  constructor({data=null,onSave=null,now=()=>new Date()}={}) {this.now=now;this.onSave=onSave;this.db=data?clone(data):seedDatabase(now());}
  persist() {this.onSave?.(clone(this.db));}
  commit(store,next) {const previous=this.db.stores[store];this.db.stores[store]=next;try{this.persist();}catch(error){this.db.stores[store]=previous;if(error.name==='QuotaExceededError')ERR('当前浏览器演示空间已满，请减少上传照片或重置演示数据后重试','storage_full',507);throw error;}}
  tenant(store,role) {requireIt(ROLES.has(role),'未知演示角色');const s=this.db.stores[store];requireIt(s, '门店不存在','not_found',404);return s;}
  getState(store='cloud',role='customer') {
    this.tenant(store,role);const s=clone(this.db.stores[store]),now=this.now();decorate(s,now);s.today=todayShanghai(now);s.openingHours=openingHours(s.store.hours);
    s.availability=s.appointments.filter(a=>ACTIVE.has(a.status)&&a.date>=s.today&&a.date<=shiftDate(s.today,90)).map(a=>({employeeId:a.employeeId,date:a.date,time:a.time,duration:s.services.find(x=>x.id===a.serviceId)?.duration||30}));
    if(role==='owner') {s.metrics={expected:s.opportunities.filter(o=>['new','contacted'].includes(o.status)).reduce((n,o)=>n+o.estimate,0),booked:s.appointments.filter(a=>ACTIVE.has(a.status)).reduce((n,a)=>n+a.amount,0),actual:s.orders.filter(o=>o.status==='confirmed').reduce((n,o)=>n+o.amount,0),attributed:s.orders.reduce((n,o)=>n+o.attributedAmount,0)};s.attributions=s.orders.filter(o=>o.opportunityId).map(o=>({...o}));return s;}
    const customerIds=role==='customer'?new Set(['c1']):new Set(s.appointments.filter(a=>a.employeeId==='e1').map(a=>a.customerId).concat(s.opportunities.filter(o=>o.employeeId==='e1').map(o=>o.customerId)));
    const petIds=role==='customer'?new Set(s.pets.filter(p=>p.customerId==='c1').map(p=>p.id)):new Set(s.appointments.filter(a=>a.employeeId==='e1').map(a=>a.petId).concat(s.opportunities.filter(o=>o.employeeId==='e1').map(o=>o.petId)));
    s.customers=s.customers.filter(c=>customerIds.has(c.id));s.pets=s.pets.filter(p=>petIds.has(p.id));
    s.appointments=s.appointments.filter(a=>role==='customer'?a.customerId==='c1':a.employeeId==='e1');
    s.reports=s.reports.filter(r=>role==='customer'?r.customerId==='c1':r.employeeId==='e1');
    s.orders=role==='customer'?s.orders.filter(o=>o.customerId==='c1').map(o=>({...o,opportunityId:undefined,attributedAmount:undefined,attributionReason:undefined})):[];
    s.gifts=s.gifts.filter(g=>role==='customer'?g.customerId==='c1'&&g.status==='confirmed':s.reports.some(r=>r.id===g.reportId));
    s.opportunities=role==='customer'?[]:s.opportunities.filter(o=>o.employeeId==='e1').map(({estimate,...o})=>o);
    s.reminderRules=[];s.reminderLogs=s.reminderLogs.filter(l=>role==='customer'?l.customerId==='c1'&&l.status==='simulated':s.opportunities.some(o=>o.id===l.opportunityId));
    s.deviceTests=s.deviceTests.filter(record=>record.role===role);s.posts=role==='customer'?[]:s.posts;s.attributions=[];
    if(role==='staff')s.appointments=s.appointments.map(({amount,...a})=>a);
    return s;
  }
  apply(store,role,type,payload={},meta={}) {
    this.tenant(store,role);requireIt(payload&&typeof payload==='object'&&!Array.isArray(payload),'请求内容无效');
    const s=clone(this.db.stores[store]),now=this.now(),stamp=now.toISOString(),today=todayShanghai(now);decorate(s,now);
    const ownCustomer=customerId=>{if(role==='customer')requireIt(customerId==='c1','只能操作自己的资料','forbidden',403);if(role==='staff')requireIt(s.appointments.some(a=>a.customerId===customerId&&a.employeeId==='e1')||s.opportunities.some(o=>o.customerId===customerId&&o.employeeId==='e1'),'只能操作分配给自己的顾客','forbidden',403);};
    const ownAppointment=aid=>{const a=find(s.appointments,aid,'预约');if(role==='customer')requireIt(a.customerId==='c1','只能操作自己的预约','forbidden',403);if(role==='staff')requireIt(a.employeeId==='e1','只能操作分配给自己的预约','forbidden',403);return a;};
    const ownReport=rid=>{const r=find(s.reports,rid,'护理手记');if(role==='customer')requireIt(r.customerId==='c1','只能查看自己的护理手记','forbidden',403);if(role==='staff')requireIt(r.employeeId==='e1','只能操作自己的护理手记','forbidden',403);return r;};
    const ownPet=pid=>{const p=find(s.pets,pid,'宠物');ownCustomer(p.customerId);if(role==='staff')requireIt(s.appointments.some(a=>a.petId===pid&&a.employeeId==='e1')||s.opportunities.some(o=>o.petId===pid&&o.employeeId==='e1'),'只能操作自己的任务关联宠物','forbidden',403);return p;};
    const addEvent=(op,kind)=>{if(op) {op.events??=[];op.events.push({type:kind,at:stamp});}};
    let result={};
    switch(type) {
      case 'pet.save': {
        const existing=payload.id?ownPet(payload.id):null;const customerId=existing?.customerId||(role==='customer'?'c1':payload.customerId);find(s.customers,customerId,'顾客');ownCustomer(customerId);
        requireIt(text(payload.name||existing?.name),'请填写宠物名字');requireIt(text(payload.breed||existing?.breed),'请填写宠物品种');
        const p=existing||{id:id('pet'),customerId,photo:'/assets/pet-dog.jpg',deceased:false};
        for(const key of ['name','breed','sex','birthday','careNotes','allergies'])if(Object.hasOwn(payload,key))p[key]=text(payload[key]);
        if(Object.hasOwn(payload,'species')){requireIt(['dog','cat'].includes(payload.species),'请选择猫咪或狗狗');p.species=payload.species;}
        if(Object.hasOwn(payload,'birthday'))requireIt(!p.birthday||/^\d{4}-\d{2}-\d{2}$/.test(p.birthday),'生日格式应为 YYYY-MM-DD');
        if(Object.hasOwn(payload,'weight')){p.weight=number(payload.weight);requireIt(p.weight>0&&p.weight<=150,'请输入合理的体重（0–150 kg）');}
        if(existing?.deceased&&payload.deceased!==undefined)requireIt(bool(payload.deceased),'已离世宠物保持永久退出营销，请保留此敏感标记');
        for(const key of ['neutered','deceased'])if(Object.hasOwn(payload,key))p[key]=bool(payload[key]);
        if(Object.hasOwn(payload,'photo')){p.photo=photo(payload.photo);if(p.photo.startsWith('data:'))p.samplePhoto=false;}if(!existing)s.pets.push(p);result={id:p.id};break;
      }
      case 'profile.save': {
        only(role,['customer']);const c=find(s.customers,'c1');if(payload.name!==undefined)c.name=text(payload.name,80);if(payload.notes!==undefined)c.notes=text(payload.notes);requireIt(c.name,'请填写您的称呼');result={id:c.id};break;
      }
      case 'customer.save': {
        only(role,['owner']);const existing=payload.id?find(s.customers,payload.id,'顾客'):null;
        const c=existing||{id:id('customer'),consent:false,marketing:true,contactStatus:'available',cooldownUntil:'',notes:'',visits:0};
        for(const key of ['name','phone','notes','contactStatus','cooldownUntil'])if(Object.hasOwn(payload,key))c[key]=text(payload[key]);
        requireIt(c.name&&c.phone,'请填写顾客姓名和联系电话');requireIt(/^[\d+\-\s]{7,20}$/.test(c.phone),'请输入有效联系电话');
        if(c.cooldownUntil)requireIt(/^\d{4}-\d{2}-\d{2}$/.test(c.cooldownUntil),'冷却日期格式无效');
        for(const key of ['consent','marketing'])if(Object.hasOwn(payload,key))c[key]=bool(payload[key]);
        if(!c.marketing)c.contactStatus='stopped';else if(c.contactStatus==='stopped')c.contactStatus='available';
        if(!existing)s.customers.push(c);result={id:c.id};break;
      }
      case 'service.save': {
        only(role,['owner']);const previous=payload.id?find(s.services,payload.id,'服务'):null;const service=previous||{id:id('service'),enabled:true,employeeIds:[]};
        Object.assign(service,pick(payload,['name','category','description','species']));for(const key of ['name','category','description','species'])service[key]=text(service[key]);
        service.price=number(payload.price??service.price,-1);service.duration=number(payload.duration??service.duration);
        requireIt(service.name&&service.category&&service.species,'请补全服务名称、分类与适用宠物');requireIt(service.price>=0&&service.price<=10000,'服务价格无效');requireIt(service.duration>=30&&service.duration<=480&&service.duration%30===0,'服务时长须为 30 分钟的倍数');
        if(Object.hasOwn(payload,'employeeIds')){service.employeeIds=Array.isArray(payload.employeeIds)?payload.employeeIds:String(payload.employeeIds).split(',').filter(Boolean);service.employeeIds.forEach(e=>find(s.employees,e,'员工'));}
        if(Object.hasOwn(payload,'enabled'))service.enabled=bool(payload.enabled);
        if(!previous)s.services.push(service);for(const e of s.employees){if(service.employeeIds.includes(e.id)&&!e.skills.includes(service.id))e.skills.push(service.id);else if(!service.employeeIds.includes(e.id))e.skills=e.skills.filter(x=>x!==service.id);}result={id:service.id};break;
      }
      case 'employee.save': {
        only(role,['owner']);const previous=payload.id?find(s.employees,payload.id,'员工'):null;const e=previous||{id:id('employee'),skills:[],active:true};
        if(payload.name!==undefined)e.name=text(payload.name);requireIt(e.name,'请填写员工姓名');if(payload.skills!==undefined){e.skills=Array.isArray(payload.skills)?payload.skills:String(payload.skills).split(',').filter(Boolean);e.skills.forEach(k=>find(s.services,k,'服务'));}
        if(payload.active!==undefined)e.active=bool(payload.active);if(!previous)s.employees.push(e);for(const service of s.services){if(e.skills.includes(service.id)&&!service.employeeIds.includes(e.id))service.employeeIds.push(e.id);else if(!e.skills.includes(service.id))service.employeeIds=service.employeeIds.filter(x=>x!==e.id);}result={id:e.id};break;
      }
      case 'store.save': {
        only(role,['owner']);for(const key of ['name','subtitle','phone','address','hours','theme'])if(payload[key]!==undefined)s.store[key]=text(payload[key]);if(payload.hours!==undefined){const hours=openingHours(s.store.hours,true);s.store.hours=`${hours.open}–${hours.close}`;}if(payload.logo!==undefined)s.store.logo=photo(payload.logo);requireIt(s.store.name&&s.store.phone&&s.store.address,'请补全门店名称、电话和地址');result={id:store};break;
      }
      case 'booking.create': {
        const p=ownPet(payload.petId);only(role,['customer','owner']);
        const fields=validateBooking(s,{petId:p.id,serviceId:payload.serviceId,employeeId:payload.employeeId||'',date:text(payload.date),time:text(payload.time)},now);
        const a={...fields,id:id('booking'),status:'pending',notes:text(payload.notes),opportunityId:'',createdAt:stamp};
        let op=payload.opportunityId?find(s.opportunities,payload.opportunityId,'机会'):s.opportunities.find(o=>o.petId===p.id&&o.serviceId===a.serviceId&&o.status==='contacted'&&Date.parse(o.contactedAt)<=now.getTime()&&now.getTime()-Date.parse(o.contactedAt)<=7*86400000);
        if(op){requireIt(op.petId===p.id&&op.customerId===p.customerId&&op.serviceId===a.serviceId,'机会与宠物或服务不匹配');requireIt(!op.blockedReason&&!['completed','paused','booked'].includes(op.status),'该机会暂不可关联新的预约');a.opportunityId=op.id;op.appointmentId=a.id;op.status='booked';addEvent(op,'booked');}
        s.appointments.push(a);result={id:a.id,opportunityId:a.opportunityId};break;
      }
      case 'booking.update': {
        const a=ownAppointment(payload.id);only(role,['customer','owner']);requireIt(['pending','confirmed'].includes(a.status),'当前预约状态不允许调整排期');
        const fields=validateBooking(s,{...a,...pick(payload,['date','time','employeeId'])},now,a.id);Object.assign(a,fields);
        if(payload.status!==undefined){only(role,['owner']);requireIt(['pending','confirmed'].includes(payload.status),'请通过到店、开始或完成操作更新服务状态');a.status=payload.status;}
        result={id:a.id};break;
      }
      case 'booking.cancel': {
        const a=ownAppointment(payload.id);only(role,['customer','owner']);requireIt(['pending','confirmed','arrived'].includes(a.status),'当前预约不能取消');a.status='cancelled';a.cancelReason=text(payload.reason)||'演示取消';a.cancelledAt=stamp;
        const op=s.opportunities.find(o=>o.id===a.opportunityId);if(op){op.status=op.contactedAt?'contacted':'new';op.appointmentId='';addEvent(op,'cancelled');}result={id:a.id};break;
      }
      case 'booking.arrive': {
        only(role,['owner','staff']);const a=ownAppointment(payload.id);requireIt(['pending','confirmed'].includes(a.status),'只有待确认或已确认预约可以登记到店');a.status='arrived';a.arrivedAt=stamp;addEvent(s.opportunities.find(o=>o.id===a.opportunityId),'arrived');result={id:a.id};break;
      }
      case 'booking.start': {
        only(role,['owner','staff']);const a=ownAppointment(payload.id);requireIt(a.status==='arrived','请先登记顾客到店');a.status='serving';a.startedAt=stamp;result={id:a.id};break;
      }
      case 'service.complete': {
        only(role,['owner','staff']);const a=ownAppointment(payload.id);requireIt(a.status==='serving','请先开始服务，再完成护理');requireIt(!s.reports.some(r=>r.appointmentId===a.id),'该服务已经生成护理手记');
        const p=find(s.pets,a.petId),r={id:id('report'),appointmentId:a.id,petId:a.petId,customerId:a.customerId,employeeId:a.employeeId,date:today,items:{fur:'已完成毛发护理',ears:'已完成耳部清洁',nails:'已完成指甲护理'},behavior:text(payload.behavior)||'配合得很好',note:text(payload.note)||'今天的乖，我们都记住了。',nextAdvice:text(payload.nextAdvice)||'建议 3–4 周后再次护理',viewed:false,status:'completed',beforePhoto:photo(payload.beforePhoto||''),afterPhoto:photo(payload.afterPhoto||p.photo)};
        if(payload.items)for(const key of ['fur','ears','nails'])if(payload.items[key]!==undefined)r.items[key]=text(payload.items[key]);
        a.status='completed';a.completedAt=stamp;s.reports.push(r);const order={id:id('order'),appointmentId:a.id,customerId:a.customerId,petId:a.petId,amount:a.amount,status:'unconfirmed',opportunityId:a.opportunityId,date:today};s.orders.push(order);find(s.customers,a.customerId).visits++;
        const op=s.opportunities.find(o=>o.id===a.opportunityId);if(op){op.status='completed';addEvent(op,'completed');}result={id:r.id,reportId:r.id,orderId:order.id,appointmentId:a.id};break;
      }
      case 'order.confirm': {
        only(role,['owner']);const order=find(s.orders,payload.id,'消费记录');requireIt(order.status!=='confirmed','此消费金额已经确认');requireIt(find(s.appointments,order.appointmentId).status==='completed','请先完成服务');order.amount=number(payload.amount??order.amount,-1);requireIt(order.amount>=0&&order.amount<=10000,'请输入 0–10000 元的实际服务金额');order.status='confirmed';order.confirmedAt=stamp;addEvent(s.opportunities.find(o=>o.id===order.opportunityId),'amount-confirmed');result={id:order.id};break;
      }
      case 'report.save': {
        only(role,['owner','staff']);const r=ownReport(payload.id);for(const key of ['behavior','note','nextAdvice'])if(payload[key]!==undefined)r[key]=text(payload[key]);if(payload.items)for(const key of ['fur','ears','nails'])if(payload.items[key]!==undefined)r.items[key]=text(payload.items[key]);for(const key of ['beforePhoto','afterPhoto'])if(payload[key]!==undefined)r[key]=photo(payload[key]);r.updatedAt=stamp;result={id:r.id};break;
      }
      case 'report.view': {only(role,['customer']);const r=ownReport(payload.id);r.viewed=true;r.viewedAt=stamp;result={id:r.id};break;}
      case 'gift.generate': {
        only(role,['owner','staff']);const p=ownPet(payload.petId),r=ownReport(payload.reportId);requireIt(r.petId===p.id,'护理手记与宠物不匹配');requireIt(p.photo,'请先录入宠物自己的照片');const g={id:id('gift'),petId:p.id,customerId:p.customerId,reportId:r.id,theme:text(payload.theme)||'春日花园',status:bool(payload.fail)?'failed':'preview',photo:p.photo,note:'预设主题模拟；保留宠物原照片，未调用 AI 生成',createdAt:stamp};s.gifts.push(g);result={id:g.id,status:g.status};break;
      }
      case 'gift.confirm': {only(role,['owner','staff']);const g=find(s.gifts,payload.id,'礼物');ownReport(g.reportId);requireIt(g.status==='preview','只有生成成功的预览可以质检确认');g.status='confirmed';g.confirmedAt=stamp;g.qualityChecked=true;result={id:g.id};break;}
      case 'opportunity.contact': {
        only(role,['owner','staff']);const op=find(s.opportunities,payload.id,'机会');if(role==='staff')requireIt(op.employeeId==='e1','只能跟进分配给自己的机会','forbidden',403);
        const channel=payload.channel||'manual';requireIt(['manual','subscription','sms'].includes(channel),'仅支持人工联系标记、模拟订阅消息和模拟短信');const rule=s.reminderRules[0];
        const reason=contactBlock(s,op,now,{channel,frequencyDays:rule?.frequencyDays||7});requireIt(!reason,reason,'contact_blocked',409);
        const log={id:id('log'),customerId:op.customerId,opportunityId:op.id,channel,status:channel==='manual'?'contacted':'simulated',reason:channel==='manual'?'人工联系标记，未发送任何消息':'授权渠道模拟执行，未发送真实消息',text:text(payload.text)||`您好，${find(s.pets,op.petId).name}的护理时间快到了，为您留一个好时光。`,date:stamp};s.reminderLogs.push(log);op.status='contacted';op.contactedAt=stamp;addEvent(op,'contacted');result={id:op.id,logId:log.id,status:log.status};break;
      }
      case 'opportunity.update': {
        only(role,['owner','staff']);const op=find(s.opportunities,payload.id,'机会');if(role==='staff')requireIt(op.employeeId==='e1','只能处理自己的任务','forbidden',403);
        if(payload.employeeId!==undefined){only(role,['owner']);const e=find(s.employees,payload.employeeId,'员工');requireIt(e.active&&e.skills.includes(op.serviceId),'请选择在岗且具备对应技能的员工');op.employeeId=e.id;}
        if(payload.status!==undefined){requireIt(['new','paused'].includes(payload.status),'请通过实际联系、预约与服务动作推进机会');requireIt(!['booked','completed'].includes(op.status),'已预约或已完成的机会不能直接改回待跟进');op.status=payload.status;}result={id:op.id};break;
      }
      case 'reminder.rule': {
        only(role,['owner']);const rule=payload.id?find(s.reminderRules,payload.id,'提醒规则'):{id:id('rule'),name:'护理关怀',mode:'manual',channel:'subscription',enabled:false,time:'10:00',frequencyDays:7,quietStart:'21:00',quietEnd:'09:00'};
        for(const key of ['name','mode','channel','time','quietStart','quietEnd'])if(payload[key]!==undefined)rule[key]=text(payload[key]);requireIt(['manual','auto'].includes(rule.mode),'提醒模式无效');requireIt(['manual','subscription','sms'].includes(rule.channel),'渠道无效');requireIt(!(rule.mode==='auto'&&rule.channel==='manual'),'人工微信联系不能设置成自动发送');
        for(const key of ['time','quietStart','quietEnd'])requireIt(/^([01]\d|2[0-3]):[0-5]\d$/.test(rule[key]),'请输入有效时间');
        if(payload.enabled!==undefined)rule.enabled=bool(payload.enabled);rule.frequencyDays=number(payload.frequencyDays??rule.frequencyDays);requireIt(rule.frequencyDays>=1&&rule.frequencyDays<=90,'联系频率须为 1–90 天');if(!payload.id)s.reminderRules.push(rule);result={id:rule.id};break;
      }
      case 'reminder.run': {
        only(role,['owner']);const hour=Number(new Intl.DateTimeFormat('en-GB',{timeZone:'Asia/Shanghai',hour:'2-digit',minute:'2-digit',hourCycle:'h23'}).format(now).split(':')[0]);const current=timeMinutes(new Intl.DateTimeFormat('en-GB',{timeZone:'Asia/Shanghai',hour:'2-digit',minute:'2-digit',hourCycle:'h23'}).format(now));let sent=0,skipped=0;
        for(const rule of s.reminderRules)for(const op of s.opportunities.filter(o=>!['booked','completed','paused'].includes(o.status))){
          const qStart=timeMinutes(rule.quietStart),qEnd=timeMinutes(rule.quietEnd),quiet=qStart===qEnd?false:qStart>qEnd?current>=qStart||current<qEnd:current>=qStart&&current<qEnd;
          let reason=!rule.enabled?'提醒规则已暂停':rule.mode!=='auto'?'当前是人工确认模式，请查看并确认联系':quiet?'当前处于免打扰时段':current<timeMinutes(rule.time)?'尚未到达设定提醒时间':contactBlock(s,op,now,{channel:rule.channel,frequencyDays:rule.frequencyDays});
          const duplicate=s.reminderLogs.some(l=>l.ruleId===rule.id&&l.opportunityId===op.id&&l.date.slice(0,10)===stamp.slice(0,10)&&l.reason===(reason||'授权渠道模拟执行，未发送真实消息'));
          if(duplicate){skipped++;continue;}
          const log={id:id('log'),ruleId:rule.id,customerId:op.customerId,opportunityId:op.id,channel:rule.channel,status:reason?'skipped':'simulated',reason:reason||'授权渠道模拟执行，未发送真实消息',text:`您好，${find(s.pets,op.petId).name}的护理时光快到了。我们为你留一份温柔。`,date:stamp};s.reminderLogs.push(log);
          if(reason)skipped++;else{sent++;op.status='contacted';op.contactedAt=stamp;addEvent(op,'contacted');}
        }result={sent,skipped,hour,simulated:true};break;
      }
      case 'consent.update': {
        only(role,['customer']);const c=find(s.customers,'c1');if(payload.consent!==undefined)c.consent=bool(payload.consent);if(payload.marketing!==undefined)c.marketing=bool(payload.marketing);c.contactStatus=c.marketing?'available':'stopped';result={id:c.id};break;
      }
      case 'post.save': {
        only(role,['owner','staff']);const pet=payload.petId?ownPet(payload.petId):null;
        const post={id:payload.id||id('post'),template:text(payload.template)||'洗护预约',title:text(payload.title,120),subtitle:text(payload.subtitle,300),serviceId:payload.serviceId||'s1',storeName:text(payload.storeName,100)||s.store.name,petId:pet?.id||'',photo:photo(payload.photo||pet?.photo||'/assets/pet-dog.jpg'),theme:text(payload.theme,80),layout:text(payload.layout,80),date:today};requireIt(post.title,'请填写海报标题');find(s.services,post.serviceId,'服务');const previous=s.posts.findIndex(x=>x.id===post.id);if(previous>=0)s.posts[previous]=post;else s.posts.push(post);result={id:post.id};break;
      }
      case 'device.record': {
        requireIt(['Android','iPhone','iPad','Desktop','Other'].includes(payload.platform),'请选择实际测试设备平台');requireIt(['pass','fail','pending'].includes(payload.result),'请选择真实测试结果');requireIt(text(payload.device)&&text(payload.browser),'请填写设备型号和浏览器');
        const checks=Object.fromEntries(Object.entries(payload.checks||{}).slice(0,30).map(([k,v])=>[text(k,80),typeof v==='boolean'?v:text(v,200)]));const record={id:id('device'),platform:payload.platform,device:text(payload.device,100),browser:text(payload.browser,100),result:payload.result,notes:text(payload.notes),checks,role,source:'self-report',validated:false,evidence:'测试者自行提交的观察记录，未独立验证实际硬件或验收结果',userAgent:text(meta.userAgent||payload.userAgent,600),date:stamp,storeId:store};s.deviceTests.push(record);result={id:record.id};break;
      }
      case 'demo.reset': {only(role,['owner']);const fresh=makeTenant(store,today);fresh.deviceTests=s.deviceTests;this.commit(store,fresh);return {ok:true,result:{reset:true}};}
      case 'demo.scenario': {
        only(role,['owner']);requireIt(['empty','full','normal'].includes(payload.name),'未知演示场景');const fresh=makeTenant(store,today);fresh.deviceTests=s.deviceTests;
        if(payload.name==='empty')for(const key of ['pets','appointments','reports','orders','opportunities','reminderLogs','gifts','posts'])fresh[key]=[];
        if(payload.name==='full'){fresh.appointments=fresh.appointments.filter(a=>a.date!==today);for(const e of fresh.employees.filter(e=>e.active))for(let m=540;m<1080;m+=30)fresh.appointments.push({id:id('full'),customerId:'c1',petId:'p1',serviceId:'s3',employeeId:e.id,date:today,time:`${String(Math.floor(m/60)).padStart(2,'0')}:${String(m%60).padStart(2,'0')}`,status:'confirmed',notes:'满档异常场景',opportunityId:'',amount:38,createdAt:stamp});}
        this.commit(store,fresh);return {ok:true,result:{scenario:payload.name}};
      }
      default: ERR('暂不支持此演示操作','unknown_action',404);
    }
    decorate(s,now);s.revision++;this.commit(store,s);return {ok:true,result};
  }
}
