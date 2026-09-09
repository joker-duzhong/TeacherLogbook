# TeacherLogbook

班主任工作台。原生 JavaScript 版本完整保存在 `vanilla-js/`；新版本采用 PC 网页端和微信小程序两个独立应用，共享 TypeScript 接口及业务工具。

## 当前范围

- PC：微信扫码默认优先、手机号验证码登录、内存会话、路由守卫、登录后的基础页面。
- PC 微信扫码：真实创建会话、二维码生成、状态轮询与一次性凭据兑换；支持已扫码、取消、过期、失败及刷新。
- 小程序：可配置的基础工程、介绍页面和独立请求适配；尚未接入实际微信登录及业务页面。
- 共享层：真实契约生成类型；手机号登录、短信、令牌刷新、当前用户、班级及学生业务方法；基础响应校验与错误处理。
- 班级、学生等方法目前没有对应完整操作页面，仪表盘及其他业务模块未迁移。本批不等于全量功能交付。
- 验证状态以 `CHANGELOG.md` 和本次交付说明为准；自动化测试使用隔离替身，不能替代真实短信、账号权限及小程序真机联调。

## 工作区

使用 npm workspaces 管理本地共享包，根目录 `package-lock.json` 为唯一安装锁文件。首次成功安装并提交锁文件后，后续可用 `npm ci` 复现依赖。

```text
apps/web/                 Vue 3 + Vite + Element Plus
apps/miniapp/             uni-app Vue 3，微信小程序目标
packages/api-client/      生成类型、请求契约、业务 API
packages/shared/          手机号、验证码、时间计算等纯工具
scripts/                  OpenAPI 类型生成
vanilla-js/               未改动的旧版归档
```

两端独立 UI、独立内存状态，通过后端共享业务数据。PC 与 uni-app 各自固定 Vue / Vite 版本，不能把小程序依赖统一升级到 PC 版本。

## 安装与运行

使用 Node.js 24.14.0 和 npm 10.9.4（已在 `.node-version`、`package.json` 中固定）。在仓库根目录执行：

```powershell
npm install
npm run dev:web
```

PC 开发入口为 `http://127.0.0.1:5173`。默认将 `/api` 代理到本机 `http://192.168.31.93:8000`，必须启动真实后端。

可将 `apps/web/.env.example` 复制为同目录 `.env.local`：

- `VITE_API_BASE_URL`：公开的 API 前缀，默认 `/api/v1`。
- `API_PROXY_TARGET`：仅供 Vite 开发代理使用，默认 `http://192.168.31.93:8000`。
- `VITE_SCAN_APP_KEY`：扫码业务标识，默认 `hope_teacher_logbook`，不是微信 AppID。
- `VITE_SCAN_PAGE_URL`：独立手机扫码页面。未配置时，本地开发使用 `http://192.168.31.93:5173/scan?env=local`，正式构建不附加 `env`；显式配置优先。仅允许一个 `env=local` 查询参数，不接受其他参数、片段或用户名密码；生产部署应设置真实 HTTPS 地址且不带 `env`。

生产部署应将 PC 的 `dist/` 作为静态站点部署，对 `/api` 配置后端反向代理，并对前端路由配置回退到 `index.html`。Vite 开发代理不会自动出现在生产环境中。

### 微信小程序

```powershell
npm run dev:miniapp
```

在微信开发者工具中导入 `apps/miniapp/dist/dev/mp-weixin`。实际预览与真机联调前：

1. 在 `apps/miniapp/src/manifest.json` 的 `mp-weixin.appid` 填写自己的公开 AppID；当前为空，不使用虚构值。
2. 将 `apps/miniapp/.env.example` 复制为 `.env.local`，设置真机可访问的 `VITE_API_BASE_URL`。
3. 正式请求使用已配置的 HTTPS 合法域名。手机上的 localhost 不是开发电脑；当前示例地址只供电脑开发参考。
4. 保持合法域名检查开启。统计功能在 manifest 中显式关闭；没有新增 uniCloud 或统计调用。

AppSecret 和服务端凭据必须由后端环境管理，不能放进任何 `VITE_*` 变量、前端源码或日志。

## 登录行为

- 手机号验证码登录使用现有 `/auth/sms/send` 和 `/auth/phone/login`；验证码按契约为四位数字。
- 只有用户点击获取验证码或登录才会触发请求；后端说明未注册手机号验证后会自动创建账号。
- 发送成功后的 60 秒是前端防重复点击间隔，不代表后端承诺的验证码有效期或限流规则。
- 默认选中第一个“微信扫码”标签：先查询 `/auth/scan/apps` 确认应用可用，再向 `/auth/scan/sessions` 提交业务 app_key。
- 二维码在浏览器内生成，内容为扫码页面地址加真实 `transaction_id`；本地配置额外保留 `&env=local`，未指定环境时不附加 `env`，由手机页面使用正式环境。环境缓存由手机扫码页面负责，PC 不新增缓存，也不使用第三方二维码生成服务。
- 按后端 `poll_interval_seconds` 串行轮询 `/auth/scan/sessions/{transaction_id}`，poll_token 仅通过 `X-Scan-Token` 请求头传递；确认后向 `/auth/scan/exchange` 一次性兑换，并复用现有登录态与工作台跳转。
- 切换手机号、刷新二维码或离开页面会清理定时器和当前会话引用；已发出的请求可能完成，但旧响应不会兑换或覆盖新登录。兑换网络失败不自动重试，避免重复消费。
- 过期、取消、已使用及错误状态需手动刷新二维码；不把手机端确认或取消接口放到 PC 发起端调用。
- 登录令牌只在内存中保存，不使用 localStorage、sessionStorage、IndexedDB 或小程序 Storage 持久化。刷新页面、关闭页面或重启应用后重新登录。
- 当前 PC 不保留 refresh token、不自动续期；共享包仅提供显式刷新方法，后续续期策略另行实现。401 会清理内存登录态，不自动重放写请求。
- 登录后的基础页面不显示模拟班级、学生或统计值，也不会在后台自动访问这些业务接口。

## 接口契约

默认类型来源：`http://192.168.31.93:8000/api/v1/openapi.json`。

```powershell
npm run api:generate
```

也可以通过 `OPENAPI_URL` 环境变量指定来源。脚本只读 OpenAPI 并生成 `packages/api-client/src/schema.ts`，不调用业务写接口。只选取本批使用的登录、PC 扫码、班级、学生共 12 条路径及关联模型，不把其他产品接口引入共享包。

类型生成不等于运行时验证。当前响应检查覆盖登录必要字段、班级和学生基础结构及分页结构，不替代后端完整校验。未知接口结构不会通过猜测补全。

真实台账前缀为 `/api/v1/teacher-logbook`。历史 `vanilla-js/docs/backend-api.md` 仅供参考，不覆盖当前 OpenAPI。

## 检查命令

```powershell
npm test
npm run test:legacy
npm run typecheck
npm run build:web
npm run build:miniapp
```

- `npm test`：隔离测试登录验证、响应封装、401 / 422、分页、双端传输、扫码契约和轮询竞态，不访问真实后端。
- `npm run test:legacy`：保留原版 11 项测试。
- `npm run typecheck`：检查共享包和双端 TypeScript。
- 两个 build 命令分别验证 PC 和微信小程序产物。编译成功不能代替真机登录与域名验证。

## 本地扫码联调

1. 启动真实后端和独立的手机扫码页面服务，确保手机能够访问 `192.168.31.93:5173`。
2. 打开 PC 登录页，默认展示微信二维码，用手机扫码并在手机页面完成登录及确认。后端要求确认用户先绑定手机号。
3. PC 自动兑换并进入工作台。二维码失效时点击“刷新二维码”，手机号标签仍可独立使用。
4. 若 5173 已运行本项目，直接使用现有服务；端口被其他应用占用时可执行 `npm run dev:web -- --port 5174`。

当前微信小程序传输层不支持 PATCH，学生编辑会在发出请求前明确报错，需要后端提供兼容契约；不会伪造 POST 替代接口。手机号和真实手机扫码确认仍需人工联调，单元测试或编译成功不代表全量业务已迁移。
