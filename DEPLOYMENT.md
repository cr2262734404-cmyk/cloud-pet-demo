# 云朵宠物 · 静态 H5 发布包

这是 GitHub Pages 可发布静态目录，可在 Android 和 iPhone 手机浏览器打开。

预期演示地址：https://cr2262734404-cmyk.github.io/cloud-pet-demo/

- 把此目录的**内容**放在目标仓库的 Pages 发布分支根目录或配置的发布文件夹。
- GitHub 仓库 Settings → Pages 选择对应发布分支和目录。发布成功后使用 GitHub 给出的 HTTPS 地址。
- 本构建仅准备文件，没有创建仓库、推送、部署或申请微信审核。
- 路由采用应用自身的 hash 导航；404.html 是同一入口的回退副本。
- 静态版使用当前浏览器 localStorage，共享当前设备上的三角色数据。不同设备、不同浏览器之间不会自动同步。
- 局域网 Node 服务版本另见 cloud-pet-demo/server.mjs；其 API 数据才可在同一服务连接下跨设备同步。
- 演示角色可以自由切换。这不是正式登录、权限隔离或生产数据库。
- 真实设备测试必须由对应设备实际操作并提交；构建不会自动标记 Android 或 iPhone 验收通过。
- 发布前检查二维码指向最终 HTTPS 地址；不要沿用局域网二维码冒充公网入口。

构建来源：../cloud-pet-demo
