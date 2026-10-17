# 四季真实时段延展源图

使用内置 imagegen，基于春季清晨、夏 B 白天、秋 A 夕阳和冬季夜晚四张选定母图，分别生成其余三个时段。保留场景空间层次与双宠身份，改变天空、自然光、阴影及宠物活动。母图不覆盖；输出只含场景，不含界面文字。PNG 保留生成源文件，dist/assets 的 WebP 用于网页展示。

本目录保存 12 张延展图的高清 PNG、提示词、文件记录与逐张视觉核对。清单按分工记录：

- 春夏六图：`spring-summer-generation-manifest.json`，含提示词、PNG 路径、WebP 大小与哈希、逐张核对。
- 秋冬六图：`autumn-winter-manifest.json`，含尺寸、源图哈希、母图哈希、逐张核对；完整提示词见 `autumn-winter-prompts.json`。

这些是插画资源与人工视觉核对记录，不是 Android 或 iPhone 真机测试结果。
