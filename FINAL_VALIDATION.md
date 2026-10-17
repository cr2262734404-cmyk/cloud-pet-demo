# 云朵宠物商业 V1 H5 · 最新交接与验收边界

更新：2026-10-18（Asia/Shanghai）。仓库：`cr2262734404-cmyk/cloud-pet-demo`。固定地址：<https://cr2262734404-cmyk.github.io/cloud-pet-demo/>。

## 已锁定的设计决定

- 春季与冬季保留用户锁定的母图；正式夏季为 B「树荫湖岸」，正式秋季为 A「夕阳坡地」。不重新设计四季世界观。
- 16 个场景由 4 张锁定母图及 12 张独立时段延展组成，映射见 `worlds.js`。春蓝、夏绿、秋金、冬冰蓝的玻璃与强调色贯穿三端。
- 春夏秋冬三枚首页主功能插画从用户提供的参考图独立提取，UI 使用 `feature-{season}-{bath|book|store}.png`；来源 SHA 与裁切坐标见 `assets/feature-icon-manifest.json`。春季为蓝白立体图标。用户参考原图未覆盖。
- 场景、文字、预约卡片、按钮、入口和导航均为独立 DOM。三端首页分别侧重顾客预约、老板经营机会、员工当日护理任务，并共享品牌与季节系统。

## 页面与业务

- 顾客端 18 路由：服务、详情、选宠、预约、确认、预约列表与详情、宠物档案编辑、护理手记与详情、礼物、门店、个人中心、订阅。
- 老板端 27 路由：工作台、订单、全店宠物、数据趋势、机会雷达与跟进、提醒规则/日志、排期、客户/项目/员工管理、海报、护理报告、结果归因、设置。
- 员工端 9 路由：工作台、服务单与任务、到店/护理/完成、手记、授权跟进、工作资料与本机偏好；部分报告和礼物页面复用业务路由。
- 一套 `engine.mjs` 管理预约容量、角色权限、资料、履约、手记、消费、机会归因、提醒保护、礼物与海报。双模拟门店隔离。GitHub Pages 使用当前浏览器 localStorage 实现三端数据联动，不提供跨设备实时同步。

## 本轮验证

| 项目 | 结果 |
| --- | --- |
| Node 业务、HTTP、持久化及 Pages 构建 | 39/39 通过，`node --test test-engine.mjs`。 |
| 54 个业务路由 | 390×844、DPR2 的 Chrome 移动模拟逐页载入；0 JS 错误、0 横向溢出、0 破图。见 `source/docs/final-route-audit.json`。 |
| 16 状态 × 3 手机宽度 | 320/390/430px 共 48 组；16 个不同场景文件与四季插画载入；0 横向溢出。见 `source/docs/final-theme-audit.json`。 |
| 新增经营/员工操作 | 订单与宠物筛选、趋势切换与月份、员工服务筛选、偏好保存刷新与重置，7/7 通过。见 `source/docs/final-business-actions.json`。 |
| 历史业务闭环 | 预约→履约→手记/礼物→消费/归因已有浏览器与引擎验证；证据在 `source/docs/`。 |
| 真机 | **Android 与 iPhone 均未由本环境实际操作。** Chrome 移动模拟不能代替真机验收。 |

## 部署与恢复

- GitHub Pages 使用公开仓库 `main / (root)`，网址路径固定为 `/cloud-pet-demo/`。根目录为静态站，`source/` 为可维护源码，`qa/` 为辅助审计脚本。
- 本地源码启动：Node 20+，进入 `source/`，运行 `node server.mjs`。同一局域网中 Node 服务模式可共享模拟数据；电脑需保持运行。
- 构建：在 `source/` 执行 `node build-pages.mjs --url https://cr2262734404-cmyk.github.io/cloud-pet-demo/`。本机项目原目录为 `outputs/cloud-pet-demo/`，构建结果为 `outputs/github-pages-site/`。
- 测试：`node --test test-engine.mjs`。真实设备需要分别在 Android Chrome 与 iPhone Safari 打开固定地址，切换三端和 16 主题，完成预约、履约、报告、导航检查，并记录观察。
- 全部演示资料为模拟样本。不得上传 `.env`、私钥、认证状态、`node_modules` 或运行期 `data/demo.json`。

## 未完成与边界

1. Android/iPhone 物理设备逐项验收和实际性能记录待真实设备操作。
2. 静态版没有跨设备同步、真实微信小程序审核、真实发送消息、支付或正式账号认证；这些不在当前静态 Demo 实现范围。
3. 截图回归为桌面 Chrome 移动模拟，不作为真机证据。
