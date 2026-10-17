import fs from 'node:fs';
import {pathToFileURL} from 'node:url';
import path from 'node:path';
const root='outputs/cloud-pet-demo',docs=root+'/docs',site='outputs/github-pages-site';
const {customerRoutes}=await import(pathToFileURL(path.resolve(root+'/dist/customer.js')));
const {businessRoutes}=await import(pathToFileURL(path.resolve(root+'/dist/business.js')));
fs.writeFileSync(docs+'/page-list.json',JSON.stringify({updatedAt:new Date().toISOString(),customer:customerRoutes,business:businessRoutes,note:'主要业务路由；全局角色/主题面板、演示说明和设备记录页另计。'},null,2));
let s=fs.readFileSync(docs+'/设计与主题规范.md','utf8');
const a=s.indexOf('当前实现使用每季一张锁定场景'),b=s.indexOf('## 液态玻璃',a);
if(a>=0&&b>=0)s=s.slice(0,a)+`当前由 worlds.js 显式映射16张场景资源：4张基准母图保持不变，另外12张是以对应母图为参考的独立时段延展。夏季固定B树荫湖岸，秋季固定A夕阳坡地；备选原稿仅在回看面板展示，不混入正式时段。

| 时段 | 场景变化 |
| --- | --- |
| 清晨 | 柔和低角度晨光、湖谷薄雾、舒展或探索的宠物 |
| 白天 | 通透蓝天与明确日光，没有明显月亮或星空 |
| 夕阳 | 暖色霞光、低太阳、长阴影和湖面暖反光 |
| 夜晚 | 独立星空月光、环境冷光与已有灯火，宠物休息或望景 |

已移除旧的整幅亮度滤镜和时段叠色。界面玻璃/文字仍随季节与夜间可读性切换，这是UI主题变化，不用于冒充场景变化。新图保持世界的相对布局、地形、已有建筑与猫狗身份；属于生成式时段延展，像素细节与宠物姿态会变化。全部原始参考图独立保留，高清生成源图及逐张核对记录保存在 references/time-extensions。

`+s.slice(b);
s=s.replace(/当前已留存 48 组首页主题[\s\S]*$/,'新版主题与视口验证见 theme-validation.json；逐张源图核对见 world-scene-validation.json。所有截图为桌面浏览器重新渲染，未宣称真实Android/iPhone硬件测试。\n');
s=s.replace('最终依据为实际截图、操作记录与用户真机验收。','真实硬件尚未接入，本轮不再安排用户中途检查。');
fs.writeFileSync(docs+'/设计与主题规范.md',s);
s=fs.readFileSync(docs+'/验收与使用说明.md','utf8');
s=s.replaceAll('待用户实际操作并提交结果','未执行：当前没有可控制的真实设备').replaceAll('Android 和 iPhone 仍待用户实测，不提前作通过声明。','当前未执行 Android/iPhone 真实设备测试；不安排用户中途检查，也不以模拟器冒充通过。');
s=s.replace('16 状态截图，不等同独立 16 幅插画','16 张独立资源的实际页面截图与日月/宠物活动核对');
s=s.replace('四季有 16 个切换状态，但时段目前是同原场景的光照参数；冬季白天仍有夜景元素。','四季采用4张保留母图和12张独立时段延展；冬季清晨与白天的月亮星空已移除。');
s=s.replace(/\| 公网部署与可达性 \|[^\n]+/,'| 公网部署与可达性 | 当前发布内容与运行任务见 public-deployment-validation.json |');
s=s.replace(/本次公网核验对应提交[^\n]+/,'当前发布提交、GitHub Pages运行结果、逐文件HTTP与内容核验以 public-deployment-validation.json 为准。没有将公网可达性等同真实硬件验收。');
s=s.replace('最终 48 组截图取自明确刷新后的修复版本。','新版48组主题截图取自独立时段素材与刷新后的构建。');
s+='\n## 本轮补充\n\n新版继续保留完整预约、员工履约、护理报告、头像礼物、营销海报、提醒与消费归因流程；补齐老板独立订单/全店宠物/数据趋势和员工个人中心/本机设置等入口。页面完整清单见 page-list.json；新增流程证据见 business-v2-validation.json（以实际产出报告名为准）。\n\n本轮遵循用户要求取消中途手机检查。设备记录页仍作为可选工具保留，未自动填入任何Android/iPhone通过结果。\n';
fs.writeFileSync(docs+'/验收与使用说明.md',s);
console.log('Design, acceptance and route inventory updated.');
