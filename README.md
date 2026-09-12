# TeacherLogbook

班主任工作台。原生 JavaScript 版本完整保存在 `vanilla-js/`；新版本采用 PC 网页端和微信小程序两个独立应用，共享 TypeScript 接口及业务工具。

## 当前功能

- 网页端：桌面微信扫码默认优先、普通移动网页手机号登录、微信内自动前往 Passport 并在确认后返回；支持登录态持久化、刷新恢复、路由守卫及完整工作台。
- PC 微信扫码：真实创建会话、二维码生成、状态轮询与一次性凭据兑换；支持已扫码、取消、过期、失败及刷新。
- 两端均提供 7 组导航、39 个业务视图、19 类记录的增删改查，包含学生、班委、卫生、活动、收支、考试、奖惩、作业、课程、请假、违纪、预警、谈话、家校联系、工作、培训、待办和网址。
- 班级总览、统计看板、排座位、班级管理、CSV 导入导出、备份恢复及旧版 JSON 迁移均已接入 API，不向运行中的应用注入模拟业务数据。
- 小程序实现微信登录、手机号登录及首次绑定手机号；菜单与表单按触摸操作单独实现。真机使用前需要配置自己的 AppID 和合法请求域名。
- 保留 MR、薄荷、ngrok、Apple 四套皮肤，偏好保存至后端；共享层集中定义接口类型、业务目录、表单校验、统计、CSV 和皮肤变量。
- 功能清单、验证边界及全部修改文件见 `docs/full-migration-checklist.md`。自动化隔离测试不能替代真实账号和小程序真机验收。

## 工作区

使用 npm workspaces 管理本地共享包，根目录 `package-lock.json` 为唯一安装锁文件。首次成功安装并提交锁文件后，后续可用 `npm ci` 复现依赖。

```text
apps/web/                 Vue 3 + Vite + shadcn-vue + Tailwind CSS 4
apps/miniapp/             uni-app Vue 3，微信小程序目标
packages/api-client/      生成类型、请求契约、业务 API
packages/shared/          业务目录、校验、统计、CSV、皮肤及纯工具
scripts/                  OpenAPI 类型生成
tests/web/                Playwright 隔离浏览器回归
vanilla-js/               未改动的旧版归档
```

两端独立 UI，通过后端共享业务数据。网页端只持久化 access token，业务状态仍驻留内存；小程序保持原有内存登录态。PC 与 uni-app 各自固定 Vue / Vite 版本，不能把小程序依赖统一升级到 PC 版本。

## Web 界面开发

Web 已迁移至 shadcn-vue（Reka UI），生成的组件源码保存在 `apps/web/src/components/ui/`，项目级表单、通知、确认和搜索选择器位于 `apps/web/src/components/`。采用系统字体，不需要在线字体服务。设计规则见 `apps/web/DESIGN.md`。

PC 使用分组导航和表格，760px 以下切换为抽屉、常用底栏、记录卡片与底部筛选。原四种皮肤在 Web 中映射为统一的语义变量；原有登录、接口和路由协议继续使用。

需要添加组件时，在 `apps/web` 内运行 `npx shadcn-vue add <组件名>`。组件生成器与 Tailwind 属于开发依赖；已生成的 Vue 组件随应用构建。自动化测试使用隔离接口，运行 `npm run test:web` 前启动 `npm run dev:web`。

## 安装与运行

使用 Node.js 24.14.0 和 npm 10.9.4（已在 `.node-version`、`package.json` 中固定）。在仓库根目录执行：

```powershell
npm install
npm run dev:web
```

PC 开发入口为 `http://127.0.0.1:5174`。默认将 `/api` 代理到 `http://192.168.31.93:8000`，必须启动真实后端。5173 保留给独立手机扫码页面。

环境配置位于 `apps/web/`：`npm run dev:web` 读取 `.env.development`，`npm run build:web` 读取 `.env.production`；两份配置已在当前工作区填写。它们按仓库现有规则被 Git 忽略，更换电脑或 CI 打包时需另行提供。

各环境分别提供 API 前缀及 Passport 地址，台账业务标识为 `hope_teacher_logbook`。本地授权中心入口附带 `env=local`，正式入口不附加环境参数。API 使用同源 `/api/v1` 时由网站服务器代理到真实后端；使用独立 API 域名时需配置相应 CORS。

按模式配置优先于通用 `.env`；已有 shell 环境变量及对应的 `.env.development.local` / `.env.production.local` 可覆盖它们。环境文件在构建时读取，修改线上配置后需要重新打包，只上传 `dist/` 内容，不上传环境文件。配置项如下：

- `VITE_API_BASE_URL`：公开的 API 前缀，默认 `/api/v1`。
- `API_PROXY_TARGET`：仅供 Vite 开发代理使用，默认 `http://192.168.31.93:8000`。
- `VITE_SCAN_APP_KEY`：桌面扫码业务标识，默认 `hope_teacher_logbook`，须与台账登录范围一致，不是微信 AppID。
- `VITE_SCAN_PAGE_URL`：必填的授权中心扫码页面地址，由环境配置提供；业务代码不再按开发/正式模式选择硬编码地址。可配置本地 Passport 的 `/passport/scan?env=local` 或线上 Passport 的 `/passport/scan`。基础配置仅允许一个 `env=local` 查询参数，不接受其他参数、片段或用户名密码。事务 ID 和完整 `back` 在发起登录时动态生成，勿预填到配置中；缺失配置会明确报错。

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

- 微信内置浏览器自动走 Passport 授权往返：台账创建扫码事务，在当前标签页的 sessionStorage 暂存事务、poll_token、随机 state、原工作台路径及过期时间，然后进入授权中心。用户确认后自动回到 `/auth/passport/callback`，校验本地上下文、查询状态并一次性兑换台账 Token，恢复原页面并清除临时事务。
- 台账用当前 `window.location.origin` 加 `/auth/passport/callback` 生成完整返回地址，并将事务 ID 和随机 state 放在其 fragment 中，通过 `URLSearchParams` 编码为授权中心 URL 的单个 `back` 参数。Passport 校验域名后返回该完整地址，不拼接或限定台账路径。Token、poll_token、exchange_code 不进入网址。正式服务器须让回调路径回退到 Web 的 index.html。
- 发布时先更新 HopePassport，再更新台账 Web；旧版授权中心不会自动返回应用。两项目各自重新构建部署，本次无需修改后端接口。
- Passport 的域名白名单放行 `lxyy.fun` 及其子域名，以及 localhost、回环、私有和链路本地 IP；域名使用 HTTPS，本地允许 HTTP，不限制端口、路径、查询参数和片段。更换本地 IP/端口无需修改回跳代码。手机真机可用 `npm run dev:web -- --host 0.0.0.0` 启动，再从电脑的可达局域网地址访问；手机上的 localhost 不是开发电脑。
- `back` 只决定返回地址；授权中心 API 仍由现有环境配置及入口 `env=local` 决定。有 `back` 时采用入口的显式环境选择，不继承以前缓存的本地环境；无 `back` 的普通扫码沿用原规则。公众号授权域名、OAuth 回调地址与 API 配置须匹配，局域网访问仍需满足微信平台的授权要求。
- 微信内台账只保留授权中心登录入口，失败可重新授权，主动退出后停留在登录按钮，不自动循环登录；旧 `method=phone` 链接也不会显示短信表单。首次手机号绑定及授权中心自己的账号恢复仍在 Passport 完成。普通移动浏览器保留短信登录，桌面保留扫码及短信登录。
- 台账前往 Passport、Passport 发起 OAuth、确认后的结果与返回均使用 replace，避免本次受控跳转新增历史记录。回跳事务绑定发起源地址、授权中心配置和随机 state；同一标签页返回或刷新不会重复兑换，兑换响应丢失须重新发起授权。
- 手机号验证码登录使用现有 `/auth/sms/send` 和 `/auth/phone/login`；验证码按契约为四位数字。
- 台账手机号登录携带 `app_key=hope_teacher_logbook`，扫码/回跳兑换返回同一 `app_scope`；Web 接受新登录时验证所属应用，不使用 Passport Token 访问台账接口。
- 只有用户点击获取验证码或登录才会触发请求；后端说明未注册手机号验证后会自动创建账号。
- 发送成功后的 60 秒是前端防重复点击间隔，不代表后端承诺的验证码有效期或限流规则。
- 桌面普通浏览器默认选中第一个“微信扫码”标签：先查询 `/auth/scan/apps` 确认应用可用，再向 `/auth/scan/sessions` 提交业务 app_key。
- 二维码在浏览器内生成，内容为扫码页面地址加真实 `transaction_id`；本地配置额外保留 `&env=local`，未指定环境时不附加 `env`，由手机页面使用正式环境。环境缓存由手机扫码页面负责，PC 不新增缓存，也不使用第三方二维码生成服务。
- 按后端 `poll_interval_seconds` 串行轮询 `/auth/scan/sessions/{transaction_id}`，poll_token 仅通过 `X-Scan-Token` 请求头传递；确认后向 `/auth/scan/exchange` 一次性兑换，并复用现有登录态与工作台跳转。
- 切换手机号、刷新二维码或离开页面会清理定时器和当前会话引用；已发出的请求可能完成，但旧响应不会兑换或覆盖新登录。兑换网络失败不自动重试，避免重复消费。
- 过期、取消、已使用及错误状态需手动刷新二维码；不把手机端确认或取消接口放到 PC 发起端调用。
- 网页端扫码和手机号登录统一将 access token 写入 localStorage，键名按 API 前缀区分。刷新、关闭后重新打开时先调用 `/auth/me` 验证，成功后恢复登录；不把本地缓存当作已通过认证。
- 网页端不保存 refresh token、用户资料或班级与学生数据，不自动续期、不自行延长后端有效期。Token 是否有效以服务端校验为准；401 和主动退出清除登录缓存与内存状态，不自动重放写请求。
- 验证遇到网络故障或服务端暂不可用时保留缓存，但不开放工作台，登录页提供“重新验证登录”；存储读取、写入或清除失败会明确提示，不静默宣称持久化成功。
- localStorage 中的 Token 可被同源 JavaScript 读取，存在 XSS 泄露风险。公共设备使用后应主动退出；更安全的 HttpOnly Cookie 需要独立的后端配套，本次未修改后端或 common。
- 小程序登录态仍只保存在内存，本次网页持久化改动不影响小程序；登录前主题选择也仍只保存在页面内存。
- 登录后读取账号的班级、皮肤偏好及当前班级的业务数据。没有班级时提供创建入口；接口失败显示错误，不用假数据补位。401 清除网页登录缓存和内存状态并退回登录页。

## 接口契约

默认类型来源：`http://192.168.31.93:8000/api/v1/openapi.json`。

```powershell
npm run api:generate
```

也可以通过 `OPENAPI_URL` 环境变量指定来源，例如用户提供的本机 `http://localhost:8000/api/v1/openapi.json`。脚本只读 OpenAPI 并生成 `packages/api-client/src/schema.ts`，不调用业务写接口。目前选取登录、扫码及全部 Teacher Logbook 业务共 67 条路径和关联模型，不把其他产品接口引入共享包。

类型生成不等于运行时验证。请求层检查响应封装、记录、分页、仪表盘和座位基础结构，业务表单提供共享校验，最终以服务端校验及权限为准。导出会读取全部分页，并拒绝总数变化或重复 ID 的不一致结果。

真实台账前缀为 `/api/v1/teacher-logbook`。历史 `vanilla-js/docs/backend-api.md` 仅供参考，不覆盖当前 OpenAPI。

## 检查命令

```powershell
npm test
npm run test:web
npm run test:legacy
npm run typecheck
npm run build:web
npm run build:miniapp
```

- `npm test`：隔离测试登录验证、响应封装、401 / 422、分页、双端传输、扫码契约和轮询竞态，不访问真实后端。
- `npm run test:web`：先启动 `npm run dev:web`，使用本机 Edge 运行页面、表单、皮肤、座位、文件和会话失效回归；所有 API 响应仅在测试浏览器内隔离替换，不调用真实业务写接口。可通过 `WEB_TEST_URL` 指定其他本地端口。
- `tests/web/passport.spec.ts` 跨项目回归还要求 HopePassport 的 5173 开发服务及两个项目的最新生产构建；默认读取相邻的 `../HopePassport`，也可用 `PASSPORT_TEST_DIR` 指定该项目路径。正式域名页面由测试浏览器使用本地产物响应，微信/OAuth/短信/API 全部隔离，不访问正式账号。可用 `npm run test:web -- tests/web/passport.spec.ts` 单独执行。
- `npm run test:legacy`：保留原版 11 项测试。
- `npm run typecheck`：检查共享包和双端 TypeScript。
- 两个 build 命令分别验证 PC 和微信小程序产物。编译成功不能代替真机登录与域名验证。

## 本地扫码联调

1. 启动真实后端和独立的手机扫码页面服务，确保手机能够访问 `http://192.168.31.93:5173/passport/scan`；正式扫码页面为 `https://tool.lxyy.fun/passport/scan`。
2. 打开 PC 登录页，默认展示微信二维码，用手机扫码并在手机页面完成登录及确认。后端要求确认用户先绑定手机号。
3. PC 自动兑换并进入工作台。二维码失效时点击“刷新二维码”，手机号标签仍可独立使用。
4. PC 使用 5174；端口被其他应用占用时，可执行 `npm run dev:web -- --port 5175`。

## 后端配套与数据

配套修改位于 `E:/code/hope/hope-service/apps/teacher_logbook/`，没有修改 common、core 或共享认证代码。部署新前端前需同步该业务模块：新双端更新使用 OpenAPI 中已注册的 POST 兼容入口，原有 PATCH 保留；座位操作携带 If-Match，版本冲突时由用户刷新，不自动覆盖。

在后端仓库运行 `./.venv/Scripts/python.exe -m pytest apps/teacher_logbook/tests -q` 可执行模块回归。既有根 tests 目录被忽略，新测试放在业务模块内，未改公共忽略配置。

- 旧版数据先在 `vanilla-js` 导出 JSON，再在新建空班级的数据管理中检查并导入；不自动读取旧浏览器存储。不明确的同名学生或旧文字座位记录会拒绝迁移，防止错误关联。
- 新版备份只恢复到原班级。替换恢复和清空均要求输入班级名称确认；服务端验证结构与引用，失败回滚。
- 主动导出的文件属于用户数据副本；小程序只为文件分享生成临时文件，分享完成后清理，不用文件或本地 Storage 保存日常台账。
- 增加自定义皮肤时，在共享 `themes.ts` 中通过 `registerTheme` 注册，重新构建双端；不加载未经验证的远程 CSS。
