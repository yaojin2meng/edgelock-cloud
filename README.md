# edgelock-cloud

edgelock 云控服务端：Cloudflare Workers + D1，提供设备状态上报、远程下发指令
（lock / restore / setpass）、设备分组、按网站/整机拦截（重定向到预设拦截页）、
按分组静默更新、远程改密码、设备列表与在线统计、Web 管理面板。

客户端见配套项目 `edgelock`（Go，本地端）。

## 功能

- **设备状态**：Edge 锁定状态（已锁定/已解除）、拦截模式（未启用/按网站/整机）、正在浏览的网站（抖音/快手/b站等）、IP/地区/版本/在线状态
- **分组管理**：设备可设置分组；锁定/解除/改密码/静默更新均可按「全部 / 未分组 / 指定分组」下发
- **网站封禁**：勾选抖音、快手、b站 等预置站点或填自定义域名，设备用本地 DNS 把目标网站重定向到拦截页——**浏览器地址栏域名保持不变**，学生只看到拦截页内容
- **拦截页**：预设两页（“该网站已被教师封禁” / “您已被教师禁止使用浏览器”），可在面板自定义 HTML 并在线预览（`/blockpage/site`、`/blockpage/browser`）
- **静默更新**：全局或按分组设置最新版本号 + 下载地址（可选 SHA256），客户端自动下载替换重启

## 快速部署

**方式一：GitHub Actions 自动部署**（推荐）

1. Fork / 推送到 GitHub 后，仓库 → Settings → Secrets and variables → Actions 添加：
   - `CLOUDFLARE_API_TOKEN`（Cloudflare 面板 → My Profile → API Tokens → 创建有 Workers 部署权限的 token）
   - `CLOUDFLARE_ACCOUNT_ID`（面板右侧栏）
2. 先手动创建 D1 并执行一次迁移（见方式二第 1、2 步），把 `database_id` 填进 `wrangler.toml` 提交
3. Actions 里手动触发 **Deploy** 工作流即自动部署

**方式二：本地部署**

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

已部署过的旧库无需手工迁移：首次请求时 `src/migrate.js` 自动补列
（devices.group_name/ban/sites、commands 去 CHECK 约束）并写入默认拦截页。

发布后在 Cloudflare 面板给该 Worker 绑定自定义域名（如 `your-domain.example.com`），
并把 `wrangler.toml` 中的 `SERVER_NAME` 改成你的域名（客户端上报基址）。

## 管理面板初始化

浏览器打开你的域名：

1. 首次访问自动进入「首次使用：创建管理员账号」，设置账号密码（PBKDF2 存储）
2. 之后登录即可：设备列表（含分组、封禁状态、正在浏览）、网站封禁、拦截页、按组更新、指令历史
3. 接口 `/api/admin/setup` 仅允许初始化一次（已初始化返回 409）

## 客户端配合

```powershell
EdgeCtrl.exe install      # 注册开机自启（自动提权，静默运行 cloud）
EdgeCtrl.exe cloud        # 立即启动云控常驻
```

- 上报地址默认取部署域名；客户端可用环境变量 `EDGELOCK_SERVER` 覆盖
- Edge 锁定状态：`restricted`（已锁定）/ `restored`（已解除）/ `offline`（超时离线）
- 拦截模式：`off` / `site`（按网站）/ `all`（禁止浏览器）
- 非管理员运行时，特权操作优先走计划任务提权通道（无 UAC 弹窗），缺失时回退
  UAC；首次部署推荐教师用极域「远程命令」以 SYSTEM 执行下发的 exe，之后全程
  零弹窗

## 目录结构

```
src/
  index.js    路由入口（含拦截页预览 /blockpage/*）
  device.js   设备上报/指令下发/封禁配置下发
  admin.js    管理面板 API（登录/设备/分组/封禁/拦截页/更新/统计）
  sites.js    站点目录（域名 + 标题关键词，需与客户端 catalog.go 保持一致）
  migrate.js  旧库自动迁移 + 默认拦截页
  auth.js     PBKDF2 与会话
  panel.js    Web 面板页面
schema.sql    D1 建表语句（新装库）
wrangler.toml Worker 配置
```

## License

[MIT](./LICENSE)
