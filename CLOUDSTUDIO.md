# Cloud Studio 发布说明

## 当前地址

- 预览地址：`http://5ed886311638440282d2323ab9766d3e.ap-singapore.myide.io`
- 当前推荐构建目录：`build/web-mobile`
- 本地辅助脚本：`deploy-to-cloudstudio.bat`

## 标准发布流程

1. 在 `Cocos Creator 3.8.4` 中执行 Web 构建，输出到 `build/web-mobile`
2. 在项目根目录执行 `deploy-to-cloudstudio.bat`
3. 将 `build/web-mobile` 目录中的全部文件上传到 Cloud Studio 对应运行目录
4. 在 Cloud Studio 的该目录下执行 `node server.js`
5. 打开预览地址进行验证

## 脚本会做什么

- 检查 `build/web-mobile` 是否存在
- 检查 `index.html` 和 `Node.js`
- 默认要求完整上传 `build/web-mobile/assets/resources/*`
- 为 `.wasm`、`.bin` 等资源生成 `.b64.txt`
- 自动生成 `server.js`
- 本地做一次 HTTP 200 启动验证

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

- 页面还是旧版本：访问 `http://5ed886311638440282d2323ab9766d3e.ap-singapore.myide.io/?v=20260327`
- 页面能开但资源丢失：确认上传的是 `build/web-mobile` 目录内的全部文件，而不是只上传 `index.html`
- 启动失败：确认 Cloud Studio 环境中可执行 `node server.js`

## 维护建议

- 如果后续 Cloud Studio 域名变更，只需要同步修改 `deploy-to-cloudstudio.bat` 中的 `PREVIEW_URL`
- 如果构建目录改动，也同步修改 `deploy-to-cloudstudio.bat` 中的 `BUILD_DIR`
