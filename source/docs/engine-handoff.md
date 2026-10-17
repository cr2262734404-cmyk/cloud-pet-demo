# 云朵宠物 Demo 引擎交接

本文描述可运行的演示代码，不代表已接入微信、支付、正式认证或生产数据库。

## 运行与构建

```powershell
node server.mjs
node --test test-engine.mjs
node build-pages.mjs
```

Node 服务监听 `0.0.0.0:4173`，可用 `PORT` 环境变量改变端口。`/api/network` 返回当前主机 IPv4 局域网地址。手机和电脑需能互通；代码不会自动修改 Windows 防火墙或路由器。服务数据保存为 `data/demo.json`，先写临时文件，再原子重命名。多个 API 操作在单个 Node 进程中同步校验并提交，第二个冲突预约会收到 HTTP 409。

`build-pages.mjs` 将最新纯引擎复制到 `dist/engine.mjs`，从 `dist` 生成旁边的 `outputs/github-pages-site`。发布副本的资源路径变成 `./…`，可放在 GitHub Pages 仓库子路径。包含 `.nojekyll`、`404.html` 和构建信息；此脚本本身不部署。`node build-pages.mjs --url https://example.github.io/repository/` 可记录预计地址，仍不代表地址已上线。

## 两种数据模式

| 模式 | 数据位置 | 三角色联动 | 多设备联动 |
| --- | --- | --- | --- |
| Node 局域网 H5 | 同一 Node 服务的 JSON 文件 | 支持 | 连接同一服务才支持 |
| GitHub Pages 静态 H5 | 当前浏览器 localStorage，由主应用适配 | 同一浏览器支持 | 不支持；每个浏览器独立演示 |

两个模式使用同一业务引擎。静态版的模拟权限只是 UI/演示业务约束，完整样例数据在浏览器中，不是安全边界。局域网 API 同样允许主动选择演示角色，不能当成认证系统。正式版本须将身份、租户、权限和所有业务校验放到可信后端。

静态适配器每次提交前重新读取 `cloud-demo-db`；支持 `navigator.locks` 时以 `cloud-pet-demo-write` 锁串行写入，避免多个标签的旧内存快照覆盖。隔离 Chrome 已复验弹层期间漏通知后再提交，以及两个独立应用上下文同时保存不同字段均保留（`storage-validation.json`）。旧浏览器回退为写前重读，未验证缺少 Web Locks 时严格同时写入的原子性；此机制不提供跨设备同步。

## 纯引擎导出

```js
import { DemoEngine, seedDatabase, todayShanghai, shiftDate, openingHours } from './engine.mjs';
const engine = new DemoEngine({
  data: savedDatabaseOrNull,
  onSave: database => saveToDiskOrLocalStorage(database),
  now: () => new Date(),
});
const state = engine.getState('cloud', 'customer');
const outcome = engine.apply('cloud', 'customer', 'booking.create', {
  petId: 'p1', serviceId: 's1', employeeId: 'e1',
  date: state.today, time: '14:00', notes: '请使用低风档',
});
```

`engine.db` 是完整可序列化数据库；不要在正式系统返回给未授权客户端。`seedDatabase()` 产生两个隔离租户；`todayShanghai()` 固定使用 `Asia/Shanghai`，不受宿主系统时区影响；`shiftDate(day, numberOfDays)` 返回日期字符串；`openingHours(hours, strict=false)` 返回 `{open,close,start,end}`。`onSave` 在提交时调用，存储失败会回滚内存；localStorage 配额不足有明确错误。成功结果为 `{ok:true,result:{…}}`；错误是包含 `message`、`code`、`status` 的 Error。

## HTTP 接口

| 接口 | 内容 |
| --- | --- |
| `GET /api/state?store=cloud&role=customer` | 返回当前租户和演示角色过滤后的共享状态 |
| `POST /api/action` | JSON `{store,role,type,payload}`；运行引擎动作 |
| `GET /api/health` | 当前共享演示模式，明确真实消息/支付未接入 |
| `GET /api/network` | 本机回环和局域网 H5 地址 |

请求体限制为 5 MB；非 JSON、错误 JSON、越权角色动作、跨来源 POST、文件路径穿越有明确错误。照片限本地静态资源或 PNG/JPEG/WebP data URL。静态服务只读取 `dist`，不暴露 `data`。这些基础防护不代替正式上线的安全评审。

## 数据模型

数据库根为 `{version:1, stores:{cloud:tenant, meadow:tenant}}`。每个 tenant 有独立的 `store`、`customers`、`pets`、`services`、`employees`、`appointments`、`reports`、`orders`、`opportunities`、`reminderRules`、`reminderLogs`、`gifts`、`posts`、`deviceTests` 和 `revision`。状态返回增加 `today`、`openingHours:{open,close,start,end}` 和无姓名的 `availability` 忙碌区间，三角色都可读取预约所需的营业时段。

老板状态另含 `metrics:{expected,booked,actual,attributed}` 和 `attributions`。这四个指标不可简单相加：它们分别是可跟进机会预估额、当前有效预约标价、已确认消费额、满足规则的归因消费额。订单增加 `attributedAmount` 与 `attributionReason`，用于可解释结果。

种子使用 `c1` 林女士、`p1` 糯米、`p2` 橘子、`e1` 小夏、`s1` 洗护造型、`a1` 糯米当前预约、`r1` 既往护理报告、`g1` 已确认礼物。两家门店可使用相同局部 ID，所有查找均在指定租户内完成。主样例有犬、猫、柯基三种照片；额外同品种示例复用示例照片并标记 `samplePhoto:true`，上传自己的照片后置为 false。

## 权限和动作

| 动作 | 顾客 | 老板 | 员工 |
| --- | --- | --- | --- |
| `pet.save` | 自己宠物 | 本店 | 自己任务关联宠物 |
| `profile.save` | 固定 c1，仅 name/notes | — | — |
| `customer.save`、`service.save`、`employee.save`、`store.save` | — | 本店 | — |
| `booking.create/update/cancel` | 自己预约 | 本店 | — |
| `booking.arrive/start`、`service.complete` | — | 本店 | 分配给 e1 的预约 |
| `order.confirm` | — | 本店 | — |
| `report.save` | — | 本店 | 自己报告 |
| `report.view` | 自己报告 | — | — |
| `gift.generate/confirm` | — | 本店 | 自己报告对应宠物 |
| `opportunity.contact/update` | — | 本店 | 分配给 e1 的机会 |
| `reminder.rule/run` | — | 本店 | — |
| `consent.update` | 固定 c1 的营销/渠道授权 | — | — |
| `post.save` | — | 本店 | 本店模板和自己可见宠物 |
| `device.record` | 可提交/看本角色提交 | 可提交/看本店记录 | 可提交/看本角色提交 |
| `demo.reset/scenario` | — | 当前门店 | — |

顾客只读取自己的顾客、宠物、预约、消费、护理报告、已确认礼物和已模拟发送消息。员工只读取自己分配数据，`orders` 与 `attributions` 为空、预约金额与机会预估金额移除，不返回经营汇总。服务列表可显示对客售价。

预约创建校验：宠物状态、犬猫适用性、开放服务、员工在岗与技能、90 天范围、当前门店可配置营业时间（默认 09:00–18:00）、半小时起始刻度、服务时长与同员工重叠。营业设置为每天统一起止且不得跨天，允许关门时间 24:00；既有预约不会被配置变更自动删除。取消释放时段。当前预约流为 `pending → confirmed → arrived → serving → completed`，可从 pending/confirmed 直接登记 arrived；pending/confirmed/arrived 可取消。顾客和老板只能直接调整 pending/confirmed 排期。服务收尾一次动作同时写报告和未确认消费记录。

`service.complete` 返回 `{id:reportId,reportId,orderId,appointmentId}`。报告 `items` 使用 `{fur,ears,nails}` 文本记录。`gift.generate` 产生 `preview` 或模拟 `failed`；只有成功预览可 `gift.confirm` 成 `confirmed` 后对顾客可见。礼物保留宠物原照片，是预设主题演示，不宣称 AI 外貌重建已实现。

`post.save` 支持模板、标题、副标题、服务、展示店名、所选宠物、照片、theme、layout。保存数据与图片导出由不同层负责：引擎存储编辑内容，UI 在本地绘制并下载。

## 提醒和敏感状态

- 所有触达都是模拟记录；人工模式仅标记已联系，系统不操作个人微信。
- `subscription` 和 `sms` 模拟渠道必须有 consent；所有渠道必须允许 marketing，且不能为 stopped。
- 已离世宠物永久排除，已置 true 的 deceased 标记不能在 Demo 中反转；家庭冷却结束只恢复健在宠物。
- 同一客户跨机会和渠道执行频率限制，默认 7 天，规则可在 1–90 天间调整。
- 完成、已预约、暂停机会停止继续提醒；无授权、冷却、退订、免打扰、规则暂停、未到设定时间写 skipped 原因。
- 自动模式不得选择 manual 渠道。只有规则 auto/enabled、时间满足、非免打扰且资格满足时写 simulated。
- `reminder.run` 返回 `{sent,skipped,simulated:true}`，sent 指模拟成功条数，不是真实发送量。

当前机会为可解释的种子任务与实际动作联动：复购、召回、生日、家庭恢复、空档、衍生护理、待确认预约。没有假装复原未提供的历史 27 条具体算法，也没有实现生产定时任务扫描器。

## 归因规则

1. 机会已有有效联系时间。
2. 联系后的 7 天内创建匹配同客户、宠物、服务的预约。
3. 预约和机会保存双向关联。
4. 预约完成服务，并生成消费记录。
5. 老板确认实际金额后，使用该实际金额计入归因。

无联系、超窗、未完成服务、未确认消费均不归因。顾客预约可自动关联同宠物同服务、7 天内已联系的机会。已取消预约解除当前机会关联。演示金额不是支付到账数据。

## 真机验收记录

`device.record` 接收 `{platform,device,browser,result,notes,checks}`。platform 为 Android/iPhone/iPad/Desktop/Other，result 为 pass/fail/pending。记录来源明确是 `self-report`，`validated:false`，附说明“测试者自行提交的观察记录，未独立验证实际硬件或验收结果”。记录保存提交角色，顾客/员工只看本角色提交，老板可看本店所有记录。Node 服务附请求 userAgent，静态模式可保存浏览器自报值。引擎初始没有任何真机通过记录，重置演示保留已提交设备记录。必须在实际硬件完成操作后，才可据实提交 pass；模拟视口截图不可替代此验收。

## 验证及后续边界

自动化测试覆盖租户隔离、过滤权限、跨角色数据联动、时长重叠与重复提交、员工技能和犬猫适用、状态流、归因及过期、冷却/离世/退订/频控、渠道授权/免打扰/暂停、礼物确认、照片输入、海报编辑、资料编辑、空态/满档、设备记录诚实性、持久化、HTTP 请求和静态路径保护。实际通过数量以 `node --test test-engine.mjs` 当前输出为准。

后续正式开发仍需：认证与员工账号、服务端租户隔离、数据库事务与并发锁、渠道独立授权、平台消息能力、真实资料上传与访问控制、真实 AI 生成与外貌质检、多端同步、审计与备份、生产 HTTPS 与隐私安全评审、微信主体/AppID/审核。当前 Node 版及 GitHub Pages 版均为 H5 演示。
