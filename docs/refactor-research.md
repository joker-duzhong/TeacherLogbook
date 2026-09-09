# TeacherLogbook 双端重构技术调研

调研日期：2026-09-08。

状态：旧版归档已完成；本文件是待确认的技术方案，不代表双端应用已实现或真实业务接口已联调通过。

## 1. 本次范围与验证

- 原有 19 个现存文件全部移入 `vanilla-js/`，内容和相对目录结构不变，旧版入口为 `vanilla-js/index.html`。
- `.git/` 保留在根目录；操作前已有的 `台账1.png`、`台账2.png`、`台账3.png` 删除状态保持不变。
- 移动前后逐文件计算 SHA-256，19 个文件全部一致。
- 执行 `node --test vanilla-js/tests/logbook.test.mjs`，11 项测试全部通过。
- 读取本地 OpenAPI；只额外请求了未认证班级列表 GET 和 CORS OPTIONS。没有发送短信、登录、创建记录、恢复备份或清空数据。
- 本机 Node.js 为 v24.14.0、npm 为 10.9.4。检查 pnpm 时 Corepack 自动下载了 pnpm 12.3.4；没有给项目安装依赖。未来应按选定模板的兼容矩阵固定工具链，不直接采用浮动版本。
- 本次没有进行浏览器视觉回归或微信开发者工具真机测试。

## 2. 结论与推荐架构

**推荐：一个 Monorepo、两个独立应用、共享 TypeScript 业务与接口层，不强求两个端共用整套 UI。**

| 层级 | 建议 | 选择理由 |
| --- | --- | --- |
| PC 网页端 | Vue 3 + TypeScript + Vite + Vue Router + Element Plus | 适合现有密集表格、筛选、批量录入、导入导出和座位编辑场景；Element Plus 是 Vue 3 组件库 [4] |
| 微信小程序 | uni-app Vue 3 + TypeScript，独立小程序界面 | 官方提供 Vue 3 / TypeScript 模板；使用平台组件与请求适配，不移植 DOM 代码 [1][2] |
| 工作区 | pnpm workspace | 建议集中管理依赖、共享包与两端构建；实际版本在脚手架验证后固定 |
| 共享包 | API 类型、无平台依赖的业务服务、校验规则、日期工具、设计变量 | 复用数据契约和业务规则，不依赖平台全局变量或 UI 库 |
| 状态 | 两端各自使用 Pinia 管理会话及内存页面状态 | Pinia 提供 Vue 状态共享与 TypeScript 支持；不启用持久化插件 [5] |
| 类型生成 | openapi-typescript | 支持 OpenAPI 3.0 / 3.1；只生成类型，不等于运行时校验或完整请求客户端 [6] |
| 数据源 | 已有真实后端 API | 不再使用本地台账数据库、演示 JSON 或整包本地保存机制 |

这是结合当前项目功能作出的工程判断，不是框架性能测试结论。PC 保留完整表格与批量操作；小程序采用列表、详情和分步表单，核心功能范围不擅自删减。

### 备选方案

| 方案 | 优点 | 本项目取舍 |
| --- | --- | --- |
| 单个 uni-app 工程输出 Web 和微信小程序 | 框架支持响应式 Web 与多种小程序，页面复用空间更大 [1] | 可以实现，但密集 PC 表格、浏览器文件下载和座位拖放需要较多端差异；不是首选 |
| React PC + Taro React 小程序 | Taro 支持 React、Vue 和微信小程序 / H5 等目标 [3] | 若维护者熟悉 React，这是合理替代；当前项目没有必须继承的 React 技术栈 |
| Vue PC + 原生微信小程序 | 平台边界直接，可独立优化 | 共享 TS 规则仍可行，但需要维护两套页面开发范式和组件体系 |

建议目录如下，**尚未创建**：

```text
TeacherLogbook/
  vanilla-js/                  原项目完整归档
  apps/
    web/                       PC 网页端
    miniapp/                   微信小程序
  packages/
    api-client/                生成类型、业务 API、传输接口
    shared/                    无平台依赖的业务规则与工具
    design-tokens/             色彩、间距等设计变量
  docs/
    refactor-research.md
  CHANGELOG.md
```

## 3. 旧项目现状与可复用范围

核对文件：`vanilla-js/prd.md`、`vanilla-js/assets/js/data.js`、`vanilla-js/assets/js/app.js`、`vanilla-js/assets/js/server.js`、`vanilla-js/assets/js/storage.js`、`vanilla-js/assets/js/seat-board.js` 和 `vanilla-js/docs/backend-api.md`。

- `server.js` 最终实例化 `createLocalStorageAdapter()`，业务数据和皮肤都使用浏览器本地存储。
- 已有 `createHttpApiAdapter()`，但它假设存在 `/logbook` 整包接口和 `/preferences/{key}`；本次真实 OpenAPI 没有这套台账端点。不能仅切换 `baseUrl` 就完成接入。
- `app.js` 把 DOM 渲染、统计和整包保存放在同一层，使用 `document`、弹窗、FileReader 和 Blob 下载。
- 座位板依赖异步 HTML 模板和浏览器交互；保留需求与算法参考，两个端分别实现视图和交互。小程序逻辑层不支持浏览器专用 DOM / window API [2]。
- 可复用：菜单和字段定义、日期与 CSV 解析规则、座位布局规则、既有测试场景、主题色和可用素材；迁移前仍需对照真实接口校验。
- 不直接复用：本地存储适配器、整包 `saveLogbook` 流程、DOM 渲染和浏览器专有文件操作。
- `vanilla-js/docs/backend-api.md` 是历史设计，不是当前后端契约；保留参考，不修改归档来伪装一致。

## 4. 真实 OpenAPI 核查

### 4.1 核查基线

- 来源：`http://192.168.31.93:8000/api/v1/openapi.json`。
- 文档声明 OpenAPI `3.1.0`，服务名 `hope-service`，版本 `1.0.0`。
- 台账真实前缀为 `/api/v1/teacher-logbook`，不是历史设计中的 `/api/v1/classes`。
- 此业务前缀下共 **56 个路径、118 个 HTTP 操作**；不包含服务中的其他产品业务。
- 下表路径相对于台账业务前缀。路径参数沿用契约中的 `{class_id}`、`{student_id}` 和 `{item_id}`，不擅自改名。
- 接口出现在 OpenAPI 中只说明契约声明存在，不能保证运行行为、权限和数据一致性已经验证。

### 4.2 功能覆盖

| 功能 | 真实路径或资源名 | 说明 |
| --- | --- | --- |
| 班级 | `/classes`、`/classes/{class_id}` | 列出、新建、修改、删除班级 |
| 学生 | `/classes/{class_id}/students` | 列表、单条读写、`/import`、`/export` |
| 仪表盘 | `/classes/{class_id}/dashboard` | 聚合查询，避免下载全部记录后自行统计 |
| 排座位 | `/classes/{class_id}/seat-board` | 另有 `/layout`、`/assignments` 和 `/assignments/{student_id}` |
| 请假、作业、违纪 | `leave-requests`、`homework-records`、`violations` | 班级作用域下的独立 CRUD |
| 风险、待办、工作 | `alerts`、`todos`、`work-records` | 风险和待办另有 `/{item_id}/status` PATCH |
| 考试 | `exams` | 当前请求模型是科目、考试名称、平均分、日期 |
| 班委与卫生 | `committee-roles`、`committee-members`、`hygiene-assignments` | 班级作用域下的独立 CRUD |
| 活动、收支、奖惩 | `activities`、`finance-records`、`awards` | 另有 `/classes/{class_id}/finance-summary` |
| 课程、谈话、家校沟通 | `courses`、`talks`、`contacts` | 班级作用域下的独立 CRUD |
| 培训、网址 | `training-records`、`links` | 另有 `/classes/{class_id}/training-summary` |
| 皮肤偏好 | `/users/me/preferences/ui` | GET / PATCH；当前模型只声明 `skin` |
| 备份 | `/classes/{class_id}/backup` | GET 导出，另有 `/validate`、`/restore` POST |
| 清空 | `/classes/{class_id}/data/clear` | POST；必须单独设计危险操作确认 |

### 4.3 与历史设计的重要差异

1. **响应封装**：类型化单条接口为 `{ code, message, data }`，不是旧文档的 `{ data, requestId }`。
2. **分页**：学生列表为 `data.items`、`data.total`、`data.page`、`data.page_size`、`data.total_pages`；请求参数仍是 `page`、`pageSize`，其中 `pageSize` 最大 100。不能对未知响应强行套用该结构。
3. **认证**：台账接口声明 HTTP Bearer。未认证班级列表 GET 实际返回 HTTP 401，正文的 `code` 为 401、`message` 为 `Not authenticated`、`data` 为 null。
4. **错误**：OpenAPI 的 422 响应为 `detail` 校验错误数组；其他运行时错误仍需验证。客户端兼容两种已知形状，对未知错误显式降级。
5. **座位**：布局请求为 `rows`、`columnGroups`；批量安排为 `mode`、`assignments`，不是旧状态中的 `placements`。`rows` 范围 1–30，批量数组最大 900 项，单个移动的行列从 1 开始。
6. **并发**：座位修改声明可选 `If-Match`。版本从响应头还是正文取得、冲突状态码和处理方式尚未在完整成功响应模型中确定，不能猜测。
7. **文件**：学生导入、备份校验和恢复声明 `multipart/form-data`，不是把旧版整个 JSON 对象 PUT 到 `/logbook`。
8. **清空**：请求模型要求 `confirmation` 为固定字符串 `CLEAR_CLASS_DATA`。这不能替代前端二次确认和权限验证；本次未调用。

### 4.4 契约缺口与联调风险

| 优先级 | 已发现问题 | 实施前处理 |
| --- | --- | --- |
| P0 | 118 个操作中，88 个操作至少有一个成功 JSON 响应的 schema 为 `{}`，包括多类台账、座位和聚合接口 | 优先请后端补全响应 DTO 与错误模型；暂不能补齐时，只能用经授权取得的脱敏样例建立适配和运行时校验，不能用 `any` 猜结构 |
| P0 | PC 和小程序登录方式不同，OpenAPI 不能证明两端一定归属同一业务账户 | 验证手机号绑定、微信身份和账户合并规则，确保同一老师在两端访问同一班级 |
| P0 | 小程序不能将本机 localhost 当作线上接口域名 | 准备可达 HTTPS 域名、证书及合法域名配置，真机验证 [7] |
| P1 | `ExamData` 只包含 `subject`、`name`、`average`、`date`，未发现学生逐科成绩录入或详细成绩分析接口 | 确认成绩录入是班级平均分台账还是学生明细；明细需要后端扩展，不能宣称已有 API 全覆盖 |
| P1 | 仅明确发现学生专用导出和整班备份，未发现每类台账专用导出 | 明确新增后端导出，或在权限及数据量允许时按分页取完整结果后导出；不能仅导出当前页冒充全部 |
| P1 | 座位版本、导出 MIME / 文件名、备份恢复语义和批量失败行为尚未充分类型化 | 补文档与契约测试，重点验证座位冲突和恢复前校验 |
| P1 | 旧版整包数据的学生 ID 和关联需转换 | 显式导出旧数据、建立 ID 映射并校验；禁止默认上传或自动覆盖已有班级 |

### 4.5 CORS 实测边界

对班级列表发送来源为 `http://localhost:5173` 的 OPTIONS，请求方法 GET、请求头 `authorization,content-type`，返回 HTTP 200，允许该来源、上述请求头和常用 HTTP 方法。

这只验证一个开发来源的预检，不证明生产来源、文件下载头、ETag 暴露或所有接口均配置正确。PC 开发可配置 Vite 代理，生产优先采用同源反向代理，或由后端设置精确 CORS 白名单；小程序还需单独配置服务器域名。

## 5. 登录与“不再使用本地存储”

### 登录契约

- 普通 PC 用户优先使用现有 `POST /api/v1/auth/sms/send` 与 `POST /api/v1/auth/phone/login`。短信登录模型要求手机号和四位验证码；本次没有触发短信。
- `POST /api/v1/auth/login` 的描述明确限定为已有超级管理员密码登录，不应成为普通老师的默认入口。
- 小程序使用 `wx.login()` 获取临时 code，再调用 `POST /api/v1/auth/miniapp/login`，请求字段为 `appid`、`code`。AppID 为公开配置，AppSecret 必须留在服务端。
- 登录响应声明 `access_token`、`refresh_token`、`user`；刷新接口为 `POST /api/v1/auth/refresh`，请求 `refresh_token`。
- 后端还声明微信二维码、状态查询、兑换登录和手机号绑定接口，但二维码所属微信产品、AppID 配置与身份打通需要单独联调，不能保证 PC 扫码即用。

### 默认数据与会话策略

按当前要求先采用严格解释：**新应用不使用 localStorage、sessionStorage、IndexedDB 或 wx.setStorage 持久化业务数据或令牌，也不启用离线数据库。**

- 业务数据全部由 API 读取和写入；皮肤通过现有用户偏好 API 保存，其他无接口的偏好只保留内存状态。
- Pinia 仅保存会话、当前班级和必要内存结果；切换班级或退出时清理，避免账户和班级数据串用。
- 令牌默认仅放内存：PC 刷新后重新登录，小程序进程重启后重新走登录流程。进入前台或写操作后重新查询相关数据，实现两端最终一致；不承诺实时推送。
- 网络失败显示错误并支持用户重试，不静默切回 mock、本地存储或假保存成功；避免自动重试非幂等写请求。
- 多请求遇到 401 时合并刷新流程，失败后清理会话；能否重放原请求按幂等性和后端规则决定。
- 如需 PC 持久登录，另行评估服务端 HttpOnly Cookie / BFF；当前契约不能证明支持，属于新增后端工作。小程序持久令牌也需明确确认本地会话存储例外。
- 自动化测试可使用隔离接口替身，但产品运行时不得回退为模拟数据源。

## 6. 请求层与平台差异

- 共享业务服务通过传输接口接收方法、路径、请求体和认证信息；Web 使用 fetch，小程序使用 uni.request，共享包不直接依赖平台全局变量。
- 生成类型保留后端字段原名，DTO 与页面模型差异在边界转换；空 schema 暂不伪造类型。
- 显式处理 HTTP 错误、业务 code、204 无正文、超时、取消和字段错误；业务成功码规则仍须联调验证。
- 文件操作单独平台适配：PC 处理文件选择与浏览器下载，小程序使用平台文件 API，不把浏览器 Blob / FormData 实现塞入共享层。
- 学生、分页、日期、班级权限和座位是首批契约测试重点；数字 / 字符串联合字段按真实契约转换，不默认全部视为普通浮点数。
- 敏感凭据仅由运行环境提供；日志不输出老师或学生真实数据、令牌。前端构建变量不能承载服务端密钥。

## 7. 分阶段实施计划（需确认后开始）

1. **契约与边界**：确认技术栈、严格无本地存储的登录体验、账户互通和成绩范围；补响应模型、座位版本与文件协议。
2. **最小双端骨架**：建立 workspace、两端项目、共享 API 类型和传输适配；固定依赖与 Node 版本，同时验证 PC 构建与小程序编译。
3. **首个纵向闭环**：登录 → 班级选择 / 创建 → 学生分页与增删改 → 仪表盘。用获准的测试账户和班级验证跨端可见、刷新后数据从后端读取。
4. **高频台账**：请假、作业、违纪、风险、待办；再迁移座位、班委、课程等模块。每批同步补功能测试、更新根目录 CHANGELOG。
5. **复杂模块与迁移**：确认考试需求后实现；完成文件导入导出、备份、危险操作确认和用户主动触发的旧数据迁移。
6. **双端验收**：覆盖弱网、401 / 403 / 422、班级隔离、分页边界、重复提交、座位冲突、小程序真机域名与文件操作、PC 键盘和宽屏操作。

首批新代码文件应在技术方案确认、模板实际生成后确定，不提前虚构现有脚本或配置。保留旧版 11 项测试，在新 workspace 建立共享逻辑和请求契约测试；本次不安装框架、不生成脚手架。

### 联调前置条件

- 可用微信小程序 AppID 和开发者工具权限；服务端配置对应密钥，不向前端或日志发送。
- 测试账户、班级权限和完整契约；必须提供测试令牌时，通过环境变量提供，不在聊天中粘贴。
- 真机可访问的 HTTPS 测试 API 域名与合法域名配置。OpenAPI 虽列出生产 server，本次未请求生产环境，不据此认定其可用。
- 确认无本地存储导致的重新登录体验、成绩范围和接口缺口处理方式。

## 8. 本次文件变更清单

以下 19 个文件仅移动，未修改内容：

```text
vanilla-js/CHANGELOG.md
vanilla-js/index.html
vanilla-js/prd.md
vanilla-js/assets/lucide.min.js
vanilla-js/assets/js/app.js
vanilla-js/assets/js/data.js
vanilla-js/assets/js/seat-board.js
vanilla-js/assets/js/server.js
vanilla-js/assets/js/storage.js
vanilla-js/assets/styles/apple-style.css
vanilla-js/assets/styles/common.css
vanilla-js/assets/styles/mint-style.css
vanilla-js/assets/styles/mr-style.css
vanilla-js/assets/styles/ngrok-style.css
vanilla-js/components/seat-board.html
vanilla-js/docs/backend-api.md
vanilla-js/mock/students-template.csv
vanilla-js/mock/teacher-logbook-demo.json
vanilla-js/tests/logbook.test.mjs
```

新增文件：根目录 `CHANGELOG.md`、`docs/refactor-research.md`。

## 9. 官方资料与证据来源

下列资料于 2026-09-08 直接读取官方页面。只引用能力说明，不以页面版本标签推定依赖版本；安装前仍需用实际模板验证兼容性。

1. uni-app 官方介绍与 CLI 模板：`https://uniapp.dcloud.net.cn/`、`https://uniapp.dcloud.net.cn/quickstart-cli.html`。
2. uni-app 跨端原理与 Vue 3：`https://uniapp.dcloud.net.cn/tutorial/`、`https://uniapp.dcloud.net.cn/tutorial/vue3-basics.html`。
3. Taro 官方介绍：`https://docs.taro.zone/docs/`。
4. Element Plus 官方站：`https://element-plus.org/en-US/`。
5. Pinia 官方介绍：`https://pinia.vuejs.org/introduction.html`。
6. openapi-typescript 官方介绍：`https://openapi-ts.dev/introduction`。
7. 微信小程序网络规则：`https://developers.weixin.qq.com/miniprogram/dev/framework/ability/network.html`。线上请求使用配置的 HTTPS 合法域名，localhost 不能作为合法服务器域名；开发调试豁免不等于发布可用。
8. Vite 官方入门：`https://vite.dev/guide/`。工具链按选定模板核对，不直接给 uni-app 单独升级 Vite。
9. 本地接口证据：`http://192.168.31.93:8000/api/v1/openapi.json`，及本文记录的未认证 GET、开发来源 OPTIONS；未读取后端源码，也未完成带认证业务调用。
