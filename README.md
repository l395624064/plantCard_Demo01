# Card Demo

一个基于 `Cocos Creator 3.8.4` 的卡牌放置 Demo。

## 当前内容

- 手牌拖拽与悬停表现
- 棋盘预放置、旋转、放置确认
- 时间轮盘信息栏布局
- 植物图片版手牌与棋盘显示
- 无限牌库与测试用 GM 工具

## 项目结构

- `assets/src`：主要游戏逻辑与视图代码
- `assets/res`：图片等资源
- `assets/src/managers`：预留的管理器结构

## 运行与构建

1. 使用 `Cocos Creator 3.8.4` 打开项目
2. 进入编辑器后运行预览
3. Web 构建产物可输出到对应的网页目录

## Cloud Studio 预览

- 当前预览地址：`https://my-gameserver-4gkm6efr1a71bbc1-1258142635.tcloudbaseapp.com/gameDemo/`
- 推荐发布目录：`build/web-mobile`
- 执行 `deploy-to-cloudstudio.bat` 后会自动上传 `build/web-mobile` 到 CloudBase 静态托管目录 `gameDemo/`
- 详细发布步骤见：`CLOUDSTUDIO.md`
- 如果静态资源有缓存，可在地址后追加查询参数强制刷新，例如：
  `https://my-gameserver-4gkm6efr1a71bbc1-1258142635.tcloudbaseapp.com/gameDemo/?v=20260327`

## 说明

当前仓库以 Demo 可运行和迭代验证为优先，后续功能会继续在保持可运行的前提下逐步优化。
