import {readFileSync,writeFileSync} from 'node:fs';const read=p=>JSON.parse(readFileSync(p,'utf8'));
const report={date:'2026-10-18',scope:'老板端 / 员工端 H5 浏览器检查',environment:{browser:'Chrome 155.0.8059.80 on Windows',viewport:{width:390,height:844},url:'http://127.0.0.1:4173',store:'meadow',session:'cloud-business',physicalHardware:false},moduleChecks:{syntax:true,normalRoutes:30,emptyRoutes:30,handlerIntegrations:19,htmlTagBalance:true},flows:[
{name:'编辑话术并人工联系',status:'pass',opportunityId:'o2',detail:'修改文案后提交人工联系，未发送真实消息'},
{name:'联系关联预约并确认',status:'pass',appointmentId:'booking-da41a068',detail:'2026-10-18 14:00，p3/s1/e1，老板确认'},
{name:'员工接待到店 → 开始护理 → 完成手记',status:'pass',reportId:'report-ca34f509',detail:'实际点击3步；默认护理项保存中文记录；完成后生成待确认消费'},
{name:'礼物模拟失败 → 重试 → 双项质检 → 发布',status:'pass',giftId:'gift-7419fd0d',detail:'未勾选质检时浏览器required拦截，确认后发布到对应顾客；原照片仍保留'},
{name:'老板确认实际消费与归因',status:'pass',orderId:'order-ae5c9088',detail:'参考158元改为实际150元；总实际消费712元，归因308元；新增本次归因150元'},
{name:'提醒规则拒绝自动人工微信',status:'pass',detail:'auto+manual触发明确错误提示'},
{name:'授权订阅模拟与敏感拦截日志',status:'pass',detail:'有效对象模拟发送；离世、退订、家庭冷却、7天频次分别跳过并记录原因'},
{name:'六海报编辑与保存草稿',status:'pass',detail:'模板/标题/文案/宠物变更在DOM预览同步；草稿保存后可恢复'},
{name:'长护理手记编辑与高清导出',status:'pass',...read('work/business-long-report.json')},
{name:'正方形专属礼物图',status:'pass',...read('work/business-gift-export.json')},
{name:'品牌/服务/员工/顾客表单修改',status:'pass',detail:'编辑、保存、重新进入核对，然后恢复原演示值',evidence:read('work/business-form-browser-report.json').filter(x=>x.flow!=='dynamic slot schedule')},
{name:'营业时间联动可用时段',status:'pending-runtime-reload',detail:'UI保存10–17成功；4173旧引擎进程没有state.openingHours。源码新引擎已通过测试，待重启后浏览器复验。'}],routes:read('work/business-route-browser-report.json'),posterExports:read('work/business-export-report.json').templates,limits:[{item:'原生浏览器下载',status:'unverified',detail:'agent-browser download命令返回Download was canceled；图片Blob与高清预览已生成并保存作像素证据，不能把此替代为手机相册保存测试。'},{item:'Android实际设备',status:'pending-user-test'},{item:'iPhone实际设备',status:'pending-user-test'},{item:'剪贴板/系统分享/移动键盘与相册',status:'pending-hardware',detail:'仅浏览器页面/导出能力已核对，原生系统交互待实际设备。'}]};
for(const p of ['work/business-browser-report.json','outputs/cloud-pet-demo/docs/business-browser-report.json'])writeFileSync(p,JSON.stringify(report,null,2));
