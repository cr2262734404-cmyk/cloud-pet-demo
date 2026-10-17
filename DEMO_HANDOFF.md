# 云朵宠物 H5 Demo — 开发进度与恢复交接

存档日期：2026-10-18（Asia/Shanghai）。状态：**按用户低额度保护指令暂停，不是最终完工交付。**

用户明确要求：安全保存后停止本轮；下次得到继续开发指令才恢复。不要自动继续，不安排定时任务。可由 GPT-6.1 Sol Medium 接续，已确认的视觉、功能和状态以本文件为入口，不能从零重做。

## 1. 稳定线上版与存档版必须区分

- 仓库：https://github.com/cr2262734404-cmyk/cloud-pet-demo
- 稳定手机 H5：https://cr2262734404-cmyk.github.io/cloud-pet-demo/
- 稳定 `main` 提交：`14f25630e4dc9c0300b3812d0412e33d14b47a92`。
- 稳定 Pages 运行：`39064222074`，completed / success。本次存档只读检查首页 HTTP 200，包含正确标题和 main.js 入口。
- 本轮新增进度保存到独立分支：`archive/progress-2026-10-18-world16`。最终提交号和回读核验见同目录 `ARCHIVE_RECEIPT.json`。
- **未合并 main，未把16独立场景和6个新增经营页面发布到稳定网址。** Pages 仍为 main / (root)，无需电脑常开。不要因看到稳定链接可访问便宣布新版已发布。
- 当前任务文件夹不是本地 Git checkout；`git status` / `git rev-parse` 均返回 not a git repository。此前及本次通过已授权 GitHub 连接器的 Git blob/tree/commit/ref API 保存真实 Git 提交，不是伪造本地 commit。

## 2. 文件位置与存档范围

本机工作区：`D:\codex\NO project tasks\2026-10-18\files-mentioned-by-the-user-exec-2`。

| 路径 | 内容 |
| --- | --- |
| `outputs/cloud-pet-demo/` | 完整可维护源码、Node共享版、测试、文档、原始参考图 |
| `outputs/cloud-pet-demo/dist/` | 当前新版界面源文件及资源；不是整张图贴透明热区 |
| `outputs/github-pages-site/` | 本次停止前重建的静态候选包；尚未发布到main |
| `outputs/screenshots/` | 所有既有和新增截图；旧截图不可冒充新版本验收 |
| `outputs/DEMO_HANDOFF.md` | 本交接主入口，优先于旧文档中的过时状态 |
| `outputs/云朵宠物_进度存档_2026-10-18.zip` | 本地完整进度包，含参考原图、高清新素材、截图、测试脚本与本交接 |
| `work/` | QA、构建辅助、存档与图像加工脚本；不要盲目重复执行一次性改写脚本 |

远端存档分支根目录保留可预览的静态候选站；`source/` 保存原始模块、Node服务、核心测试及说明；`qa/` 保存辅助脚本；`reference-manifests/` 保存生成来源和SHA清单。大型原始PNG、历史参考图片和所有截图完整保存在本地ZIP，未重复上传到GitHub。网页实际使用的全部四季WebP与图标已进入远端存档。

没有上传 `.env`、密钥、认证浏览器状态、node_modules 或运行时 `data/demo.json`。本机运行时模拟数据原文件仍留在项目目录，交接ZIP和远端源码包排除它，首次启动生成干净样本。

## 3. 必须保留的产品与视觉决定

1. 移动H5 + GitHub Pages；不是已审核微信小程序。三端一套代码、一套组件、一套模拟引擎。
2. 世界开阔、有天空、远山、湖泊/雪原、前中远景；猫狗自然融入，不能换成拥挤宠物大头海报。
3. 春季原图锁定；冬季原图锁定。夏季用户选 **B · 树荫湖岸**；秋季选 **A · 夕阳坡地**。夏A和秋B仅保留回看，不再重新询问选型。
4. 春蓝、夏清新绿、秋金黄、冬冰蓝液态玻璃；保留参考图提取的可爱图标。功能卡、文字、按钮、导航都是真实DOM组件。
5. 最新全文要求16种时段必须是真实延展，不能只压暗，也不能白天留月亮。最新实现为4张保留母图 + 12张独立延展；禁止退回旧滤镜方案。
6. 宠物保留原场景薄荷项圈白色卷毛狗与橘白猫。新增时段改变自然动作与光照，保持地形、建筑和宠物身份；生成细节并非逐像素相同。
7. 用户已取消中途手机检查。不要重复请用户逐页验收；当前无可控制的Android/iPhone真机，不得虚构已测试。
8. 延期范围继续延期：完整会员/储值、寄养、库存、商城、正式收银、高级生产营销引擎；不要扩张范围。

## 4. 页面与业务完成情况

当前路由清单：`docs/page-list.json`；源码导出 `customerRoutes` / `businessRoutes`。**共54个登记业务路由：顾客18、老板27、员工9**，另外有共享演示说明、手机测试记录和弹层。路由数量不等于每条交互均已验收。

### 顾客18页

`home` 首页；`services` 项目；`service/s1` 详情；`select-pet` 选宠；`booking` 时段；`confirm` 确认；`success/a1` 成功；`appointments` 预约列表；`appointment/a1` 预约详情；`pets` 宠物；`pet/p1` 档案；`pet-edit/p1` 编辑；`reports` 手记；`report/r1` 手记详情；`gift/g1` 礼物；`contact` 门店；`profile` 我的；`messages` 消息订阅。

### 老板27页

`today` 经营首页；`orders` 订单管理（新）；`pet-overview` 全店宠物（新）；`analytics` 数据与复购趋势（新）；`radar` 机会雷达；`tasks` Top5；`opportunity/o1` 机会详情；`contact/o2` 跟进；`reminders` 提醒；`reminder-rule/new` 规则；`reminder-logs` 日志；`schedule` 排期；`business-appointment/a1` 预约详情；`customers` 客户；`customer-detail/c1` 客户详情；`posters` 海报；`reports` 报告；`results` 归因；`catalog` 服务与员工；`settings` 门店；`business-booking/o2` 代客预约；`customer-edit/c1` 客户编辑；`business-pet-edit/p1` 宠物编辑；`service-edit/s1` 项目编辑；`employee-edit/e1` 员工编辑；`business-report/r1` 报告审核；`gift/r1` 礼物制作。

### 员工9页

`work` 工作台；`my-services` 我的服务单（新）；`staff-profile` 个人中心（新）；`staff-settings` 本机设置（新）；`task/a1` 任务；`complete/a2` 收尾；`history` 已完成；`tools` 工具；`followups` 授权跟进。任务档案、礼物/海报/报告等复用页面另有入口。

### 已有核心流程

- 顾客预约 → 老板确认/分配 → 员工到店、开始、完成 → 护理报告和待确认消费 → 顾客查看报告/礼物 → 老板确认金额及归因。
- 时间容量、项目时长、员工技能、猫狗物种、营业时间、冲突和状态转换均由统一引擎校验。
- 机会雷达、任务跟进、人工联系标记、授权模拟渠道、频控/冷却/免打扰/退订/已离世保护、7天归因已实现。
- 六种可编辑导出海报；宠物原照主题礼物含失败重试、双项质检和发布；护理报告支持长文本导出。
- 客户/宠物/服务/员工管理、照片上传、简单消费、两店数据范围、角色演示权限、空数据/满档/重置。
- 新老板首页增加到店待服务、当日金额订单、顾客、员工进度与提醒。新员工首页增加任务状态、备注档案、操作入口。两者共用季节场景窗口，信息结构不同。
- 新趋势从已确认消费和顾客去重计算，不补造空月份；员工基础设置仅当前浏览器/门店偏好，预填新手记，不是正式账号设置或考勤。

## 5. 四季素材状态

`dist/worlds.js` 是唯一16时段映射：

| 季节 | 保留母图 | 新增真实时段 |
| --- | --- | --- |
| 春 | `locked-spring.webp` 清晨 | `world-spring-day/sunset/night.webp` |
| 夏 | `locked-summer-b.webp` 白天 | `world-summer-morning/sunset/night.webp` |
| 秋 | `locked-autumn-a.webp` 夕阳 | `world-autumn-morning/day/night.webp` |
| 冬 | `locked-winter.webp` 夜晚 | `world-winter-morning/day/sunset.webp` |

12张图已使用母图参考编辑生成，代理与根代理都逐张查看：白天/清晨无月亮星空，夜景有真实天体与环境光，宠物动作有变化。春夜亮地平线已单点修正；冬晨/昼彻底移除原夜景月亮。当前CSS已移除整幅亮度滤镜与旧时段叠色。原图从未覆盖。

春夏WebP为853×912，约201–278KB；秋冬约1212/1213×1297，约372–449KB。高清PNG、完整提示词、源图SHA和视觉核对分别在 `references/time-extensions/spring-summer-generation-manifest.json`、`autumn-winter-manifest.json`、`autumn-winter-prompts.json`。

## 6. 测试事实与证据边界

| 检查 | 已有结果 | 证据 |
| --- | --- | --- |
| 核心/HTTP/持久化/静态构建 | 39/39通过；本轮已重跑 | `test-engine.mjs` |
| 新顾客布局 | 18路由×320/390/430，共54项通过 | `docs/customer-v2-regression.json`、`screenshots/customer-v2/` |
| 新顾客交互 | 创建→取消→刷新仍取消；实际下载1080×1577报告；无JS/HTTP/破图 | 同上 |
| 新16主题布局 | 16×3宽度共48组通过；390宽实际点击季节/时段按钮，DPR2截图；无横溢出、文字截断、破图、按钮遮挡 | `docs/theme-validation.json`、`screenshots/themes-v2/` |
| 业务新增逻辑 | 36正常路由+36空路由渲染、19原动作、15趋势/偏好测试通过 | `docs/business-v2-validation.json` |
| 新经营浏览器 | 390宽老板首页、到店筛选、员工进度筛选、复购切换已操作 | 同上、`screenshots/business-v2/owner-home-390.png` |
| 旧版完整业务 | 已完成联系→预约→履约→礼物→消费归因及公网闭环 | `business-browser-report.json`、`public-flow-validation.json`；仅原版本证据 |
| 旧版存储竞争 | 写前重读+Web Locks；两独立上下文保存保留修改 | `docs/storage-validation.json` |
| 新54页高清全图 | **尚未运行**；脚本已准备，不能称完成 | `work/capture-hd-v2.mjs` |
| Android/iPhone硬件 | **未执行**；没有可控制的设备 | 不以桌面Chrome代替 |

经营端最新转义/表达式小修已经在本次存档前重建到静态候选包；未追加全套重复测试。已有业务交接中“需再构建”的描述是之前停止点，本主交接更新其状态。

## 7. 已知未完成与风险

1. 本轮新16场景、6新增页面尚未发布稳定main。所有当前公网证据对应旧稳定提交。
2. 新员工页面完整交互（保存/刷新/恢复偏好、任务筛选、护理预填）、新订单/宠物筛选、趋势月份明细和服务量页签仍需浏览器检查；320/430新经营页面尚未跑。
3. 新54页DPR2截图未拍，现有 `screenshots/hd/` 是旧48页；不要混写。
4. `coverage-matrix.csv`、项目旧README、旧 `交付导航.html` 等还含“16滤镜/冬白天月亮/48页”历史文字，需最终统一。当前权威是本文件、v2验证JSON和新源码。
5. 手机键盘、安全区、相册上传保存、系统分享、触摸和性能无真实硬件验收；新全页视觉检查仍未完。
6. GitHub Pages是浏览器localStorage演示，不跨手机同步。角色切换不是生产身份认证；支付、消息、AI头像服务、真实多租户后端均未接入。礼物是原照主题合成，机会发现是可解释预置数据联动。
7. 低版本浏览器无Web Locks时仅写前重读，未保证真正并发原子性。分享功能按浏览器能力降级为长按/下载。
8. `work/finalize-docs.cjs`、`prepare-handoff.cjs`、`stage-handoff.cjs`、`verify-public.mjs` 中部分文案/提交号属于旧版，恢复时先读后改，不能直接当最终发布脚本运行。**不要再执行** `apply-business-v2*.mjs` 或 `integrate-worlds.cjs` 等已执行的一次性改写脚本，会重复插入。

## 8. 开发环境与运行方式

Windows / PowerShell；本轮Node `v24.19.0`，项目要求Node≥20。应用本身仅Node标准库，无npm依赖；无编译框架。

本机源码运行：

```powershell
cd 'D:\codex\NO project tasks\2026-10-18\files-mentioned-by-the-user-exec-2\outputs\cloud-pet-demo'
node server.mjs
# 浏览器 http://127.0.0.1:4173/；PORT可改端口
node --test test-engine.mjs
node build-pages.mjs --url https://cr2262734404-cmyk.github.io/cloud-pet-demo/
```

Node服务绑定0.0.0.0，`/api/network`给出实际局域网地址；同服务多手机共享模拟JSON，电脑要开机。静态包写到项目相邻 `github-pages-site/`，保留main分支根路径兼容、hash路由和 `.nojekyll`。`?v=world16-v2` 用于本轮CSS/模块缓存更新。安全存档结束后测试服务器停止，不依赖本地服务访问稳定公网。

静态预览（工作区根）：`node work/serve-static.mjs`，地址 `http://127.0.0.1:4174/cloud-pet-demo/`。从ZIP恢复后保持目录层级；若只克隆存档分支，先运行下面源码恢复脚本。

测试工具：agent-browser 0.39.1，现装在 `work/tools/node_modules/agent-browser`；Chrome位于 `C:\Program Files\Google\Chrome\Application\chrome.exe`。工具依赖不装入ZIP/远端，可另建 `work/tools` 并安装 `agent-browser@0.39.1 qrcode@1.5.4`。先读本机技能 `C:\Users\Administrator\.agents\skills\agent-browser\SKILL.md` 并执行 `agent-browser skills get core`；使用独立会话。Windows本环境浏览器和HTTP测试需要工具沙箱升级权限，PowerShell `@e1` 引用须加引号。

图像转换用bundled sharp/Python Pillow，路径可能因机器变更而不同。正常运行H5不需要这些工具，也不需要重新生成已有图片。

## 9. 从GitHub恢复（不要直接改main）

```powershell
git clone --branch archive/progress-2026-10-18-world16 --single-branch https://github.com/cr2262734404-cmyk/cloud-pet-demo.git cloud-pet-resume
cd cloud-pet-resume
node RESTORE_SOURCE.mjs
cd source
node server.mjs
```

`source/dist` 保存原始JS/HTML/CSS；恢复脚本只把仓库根 `assets/` 复制到 `source/dist/assets`（已存在的不覆盖）。因此远端不重复保存相同网页图片。`source/engine.mjs`、`server.mjs`、测试和构建脚本完整保留。使用本地ZIP时源码目录已含所有图片，无需恢复脚本。高清图与参考原稿请从本地ZIP取回，不重新生成。

## 10. 下次明确继续后的顺序

1. 先读本交接、存档收据、`business-v2-handoff.md` 和两份v2验证报告；核对稳定main仍未改变。
2. 从本地项目或存档分支恢复，复用已选四季和既有功能。先完成第7节的新增经营页面浏览器检查，发现问题才做定向修复。
3. 检查新老板/员工首页在夜间的对比与三宽度布局；保持顾客最新已通过结果，不无理由重跑全部历史场景。
4. 使用 `capture-hd-v2.mjs` 生成54页新高清图，包含CSS背景加载等待。汇总页面清单、功能矩阵、README与本轮交付说明，清理旧的滤镜叙述。
5. 完成必要构建/回归后，再按后续授权决定合并/发布main。本次低额度指令明确不覆盖稳定版，不得在暂停期间发布。
6. 发布时用期望head校验更新引用，禁止force覆盖；验证Pages成功、固定网址和所有新资源HTTP/内容一致，再运行一次同浏览器三端闭环。
7. 最终报告真实硬件测试缺口和Demo能力边界，不把尚未完成的设备检查、真实后端或审核状态写成完成。

## 11. 后续模型启动提示

“请先读取 DEMO_HANDOFF.md 和 ARCHIVE_RECEIPT.json，从 archive/progress-2026-10-18-world16 恢复云朵宠物。保留春冬锁定、夏B树荫湖岸、秋A夕阳坡地以及16真实时段。不要重做已完成素材和流程。优先补齐经营新增页面测试与54页高清截图，再统一文档和发布。不得把旧线上版本当作新版本已发布，也不得伪造真机验收。”

本轮只执行安全存档，完成后停止，等待用户再次明确要求继续。
