# Cloud Studio 发布说明

## 当前地址

- 预览地址：`https://my-gameserver-4gkm6efr1a71bbc1-1258142635.tcloudbaseapp.com/gameDemo/`
- 当前推荐构建目录：`build/web-mobile`
- 本地辅助脚本：`deploy-to-cloudstudio.bat`（执行后会自动上传到 CloudBase 静态托管并打开预览页）

## 标准发布流程

1. 在 `Cocos Creator 3.8.4` 中执行 Web 构建，输出到 `build/web-mobile`
2. 在项目根目录执行 `deploy-to-cloudstudio.bat`
3. 脚本会自动将 `build/web-mobile` 全部文件上传到 CloudBase 静态托管目录 `gameDemo/`
4. 上传完成后脚本会自动打开预览地址
5. 如需验证，可检查页面与资源是否正常加载

## 脚本会做什么

- 检查 `build/web-mobile` 是否存在
- 检查 `index.html` 和 `Node.js`
- 默认要求完整上传 `build/web-mobile/assets/resources/*`
- 为 `.wasm`、`.bin` 等资源生成 `.b64.txt`
- 自动生成 `server.js`
- 本地做一次 HTTP 200 启动验证
- 调用 `tcb hosting deploy` 自动上传到 CloudBase 静态托管
- 自动打开官方静态托管预览地址

## 可选参数

- `deploy-to-cloudstudio.bat` 或 `deploy-to-cloudstudio.bat --with-resources`
  默认模式，要求完整上传 `assets/resources/*`
- `deploy-to-cloudstudio.bat --skip-resources`
  跳过 `assets/resources/*` 的上传要求提示

## 发布后验证

- 页面能正常打开
- 植物图片能正常显示
- 棋盘拖拽、旋转、放置可正常操作
- 控制台没有关键资源 404

## 常见处理

- 页面还是旧版本：访问 `https://my-gameserver-4gkm6efr1a71bbc1-1258142635.tcloudbaseapp.com/gameDemo/?v=20260327`
- 页面能开但资源丢失：重新执行 `deploy-to-cloudstudio.bat`，确认 `tcb hosting deploy` 返回上传成功
- 如果使用 `tcb.qcloud.la` 地址仍有资源 404，优先改用 CloudBase 官方静态域名 `tcloudbaseapp.com`

## 维护建议

- 如果后续 Cloud Studio 域名变更，只需要同步修改 `deploy-to-cloudstudio.bat` 中的 `PREVIEW_URL`
- 如果构建目录改动，也同步修改 `deploy-to-cloudstudio.bat` 中的 `BUILD_DIR`
