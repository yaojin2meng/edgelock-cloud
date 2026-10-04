# edgelock-cloud

edgelock 云控服务端：Cloudflare Workers + D1，提供设备状态上报、远程下发指令
（lock / restore / setpass）、远程改密码、设备列表与在线统计、Web 管理面板。

客户端见配套项目 `edgelock`（Go，本地端）。

## 快速部署

```powershell
npm install
npx wrangler login

# 1. 创建 D1 数据库，把返回的 database_id 填进 wrangler.toml
npx wrangler d1 create edgelock

# 2. 建表
npm run migrate

# 3. 设备共享密钥（可选，客户端默认相同；修改后需同时改客户端）
npx wrangler secret put DEVICE_KEY

# 4. 发布
npm run deploy
```

发布后在 Cloudflare 面板给该 Worker 绑定自定义域名（如 `sbtx.yaojin.online`），
并把 `wrangler.toml` 中的 `SERVER_NAME` 改成你的域名（客户端上报基址）。

## 管理面板初始化

浏览器打开你的域名：

1. 首次访问自动进入「首次使用：创建管理员账号」，设置账号密码（PBKDF2 存储）
2. 之后登录即可：设备列表、远程指令、在线统计、改解除密码
3. 接口 `/api/admin/setup` 仅允许初始化一次（已初始化返回 409）

## 客户端配合

```powershell
EdgeCtrl.exe install      # 注册开机自启（静默运行 cloud，首次注册后自动上报）
EdgeCtrl.exe cloud        # 立即启动云控常驻
```

- 上报地址默认取部署域名；客户端可用环境变量 `EDGELOCK_SERVER` 覆盖
- 状态：`restricted`（已锁定）/ `restored`（已解除）/ `offline`（超时离线）

## 目录结构

```
src/
  index.js    路由入口
  device.js   设备上报与指令下发
  admin.js    管理面板 API（初始化/登录/设备/指令/密码/统计）
  auth.js     PBKDF2 与会话
  panel.js    Web 面板页面
schema.sql    D1 建表语句（npm run migrate）
wrangler.toml Worker 配置
```

## License

[MIT](./LICENSE)
