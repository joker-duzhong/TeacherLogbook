# 双端骨架第一批：执行与暂停记录

日期：2026-09-09。

## 当前状态：PC 扫码接入完成，双端骨架构建通过

- 登录页已删除 PC 标识、迁移提示、公用设备会话说明和页脚存储说明。二维码下方只保留“使用微信扫码登录”，不显示二维码过期倒计时或常驻刷新按钮；手机号验证码发送倒计时不受影响。
- 已扫码及登录处理中在原二维码上显示淡化模糊遮罩；过期、取消、已使用、失败时在遮罩内显示状态和刷新按钮。刷新过程保持旧图，生成成功后替换；终止状态仍清理轮询及会话凭据，离开后清空图片。
- 本次界面修订验证：新版 63 项测试通过（扫码专项 25 项），PC 类型检查与生产构建通过。浏览器隔离检查遮罩状态、过期停止轮询、刷新新会话、取消/错误重试及手机号入口；1366/320 宽度无水平溢出，状态切换二维码尺寸稳定，无页面运行错误。本次没有重复真实账号扫码确认。
- 本次修改文件：apps/web/src/views/LoginView.vue、apps/web/src/views/ScanLogin.vue、apps/web/src/styles.css、apps/web/src/lib/scan-login.ts、apps/web/src/lib/scan-login.test.ts、CHANGELOG.md、docs/scaffold-status.md。
- PC 微信扫码为第一个标签且默认选中，手机号验证码为第二个标签，原有手机号登录流程保留。
- 真实接口流程：GET /auth/scan/apps → POST /auth/scan/sessions → GET /auth/scan/sessions/{transaction_id} → CONFIRMED 后 POST /auth/scan/exchange。扫码 app_key 默认为 hope_teacher_logbook。
- 二维码使用 qrcode 在浏览器内生成，手机页面为 http://192.168.31.93:5173/scan，拼接真实 transaction_id；显式配置的 env=local 会保留在事务参数之后。无环境参数时由手机页面默认使用正式环境；环境缓存由手机页面负责，PC 不新增本地存储。
- 未配置 VITE_SCAN_PAGE_URL 时，本地开发使用带 env=local 的扫码地址，正式构建不带 env；生产部署仍应配置真实 HTTPS 地址。仅允许单个 env=local，拒绝其他环境值、重复项及预置凭据或事务参数。
- 轮询遵循后端间隔且不并发；支持已扫码、取消、过期、已消费、失败重试。切换标签、刷新或卸载时清理定时器并忽略旧请求响应，兑换失败不自动重试。
- 共享契约生成扩展至 12 条路径，schema.ts 已从真实本地 OpenAPI 生成。未实现手机端登录确认页面，该页面继续使用用户提供的独立服务。
- 上次中断前的修复已纳入验证：小程序入口不再是无效空脚本；小程序 Vue 类型固定解析自身版本；小程序 PATCH 在请求前显式拒绝，等待后端兼容契约。PC 为兼容 Element Plus 声明仅关闭 exactOptionalPropertyTypes，保留 strict。
- 前次环境参数修订：npm test 为 6 个文件、62 项通过（扫码专项 24 项）；PC 类型检查及生产构建通过。此前接入验证的旧版 11 项测试、四工作区类型检查和小程序构建通过，本次未重复执行未受影响的旧版及小程序检查。
- 构建警告仍有 PC 主包超过 500 kB 和小程序第三方循环依赖提示，不影响本次构建完成，未通过关闭警告掩盖问题。
- 浏览器检查：真实后端创建会话和二维码正常，默认扫码第一位，切换手机号后停止轮询；1366 桌面截图、390 手机截图及 320 窄屏无水平溢出，二维码像素非空且保留白色边距。
- 隔离浏览器响应验证：扫码确认后带正确头部兑换一次并进入工作台；刷新清除内存会话；取消后停止轮询，过期可刷新；无页面运行错误、无 localStorage/sessionStorage 登录数据。
- 当前 npm audit 为 41 项（高危 13、中危 13、低危 15）；报告未列出新增 qrcode 依赖链为风险来源，其他框架和工具风险不在本次接入中自动修复。
- 已复用本项目运行中的 http://127.0.0.1:5173/login；额外后台服务启动被环境拒绝，没有绕过限制。没有调用真实手机确认、取消或兑换接口，没有发送短信或创建真实账号。
- 环境参数修订时，5173 已为独立 Hope 通行证服务，本工作台当前运行在 http://127.0.0.1:5174/login。浏览器使用隔离响应确认实际二维码同时包含 transaction_id 和 env=local，PC 存储仍为空。
- 本次完成的是 PC 登录及骨架验证，不是原版全部业务迁移；真实手机扫码及账号权限验收仍需用户完成。

### 本次扫码接入文件

```text
apps/web/package.json
apps/web/.env.example
apps/web/src/lib/scan-login.ts
apps/web/src/lib/scan-login.test.ts
apps/web/src/views/ScanLogin.vue
apps/web/src/views/LoginView.vue
apps/web/src/views/WorkspaceView.vue
apps/web/src/styles.css
packages/api-client/src/index.ts
packages/api-client/src/index.test.ts
packages/api-client/src/scan.test.ts
packages/api-client/src/schema.ts
scripts/generate-api-types.mjs
package-lock.json
README.md
CHANGELOG.md
docs/scaffold-status.md
```

### 上次中断保留并验证的文件

```text
apps/miniapp/src/App.vue
apps/miniapp/src/lib/transport.ts
apps/miniapp/src/lib/transport.test.ts
apps/miniapp/tsconfig.json
apps/web/tsconfig.json
vitest.config.ts
packages/api-client/src/index.test.ts
packages/api-client/src/schema.ts
```

## 历史状态：依赖定点修复完成，小程序构建发现独立问题

- 用户要求直接完成本次依赖修复，不再为同一问题逐步确认。
- 依赖图表明 overrides 已要求 PostCSS 8.5.28，但旧的嵌套 8.5.6 锁条目仍被标记为 INVALID；额外的工作区定向更新没有解决。
- 最小修复：仅移除 package-lock.json 中嵌套 PostCSS 的失效条目，然后执行 npm install --ignore-scripts。npm 自动去除旧 PostCSS 及其多余的 picocolors 副本，父包改为复用根目录 8.5.28。手动目录清理被运行环境拒绝，未执行；没有换工具手动删除目录。
- package.json、现有 overrides、DCloud / Vue / Vite 版本和业务源码均未变化；最终锁文件仅减少两个旧副本条目，其余包条目完全一致。
- 独立 Node 进程从父包位置验证：uni-nvue-styler 使用 postcss@8.5.28，uni-mp-weixin 使用 ws@8.21.3，实际安装、根锁文件及内部锁文件一致。PostCSS 解析冒烟测试与 npm ls postcss ws --all 通过。
- 再次执行 npm install --ignore-scripts 为 up to date，根锁文件不变。
- npm test：3 个测试文件、19 项测试通过；npm run test:legacy：11 项测试通过。
- 安装自动审计剩余 37 项（高危 11、中危 11、低危 15），未重新执行排除开发依赖的审计；不能据此认定其余风险已消除。
- npm run build:miniapp 失败：apps/miniapp/src/App.vue 只有空 script setup 和样式，Vue 编译器报 At least one <template> or <script> is required；同时出现第三方循环依赖警告。这是本次验证发现的独立构建问题，没有擅自修改应用源码。
- 因独立构建问题停止后续工作，PC 构建、接口类型生成、全量类型检查未执行；packages/api-client/src/schema.ts 尚未生成。依赖修复已完成不等于双端项目已通过全量验收。
- 未发送短信、创建账号或写入后端业务数据。

本轮修改：package-lock.json、CHANGELOG.md、docs/scaffold-status.md；npm 同步了 node_modules 和内部锁文件，构建过程可能留下被忽略的产物。

## 历史状态：ws 更新完成，PostCSS 未更新，已暂停

- 经用户确认，仅删除 node_modules/.package-lock.json 内部锁缓存，未删除根 package-lock.json 或依赖目录。
- 执行 npm update ws postcss @dcloudio/uni-nvue-styler --ignore-scripts，退出码 0；更新 1 个包、审计 715 个包。
- 父包实际模块解析、根锁文件与重新生成的内部锁文件一致：uni-mp-weixin 使用 ws@8.21.3，uni-nvue-styler 仍使用嵌套 postcss@8.5.6，未达到目标 8.5.28。
- 根 package.json 未变化，根锁文件包条目仅 ws 从 8.18.0 更新到 8.21.3；两个 DCloud 父包版本保持 3.0.0-5020420260813003。
- 自动审计为 39 项（高危 12、中危 12、低危 15）；这是本次安装汇总，不代表全部风险已修复，排除开发依赖的结果尚未重新检查。
- 清理内部缓存并定向更新未解决嵌套 PostCSS，原先 overrides 未生效的完整原因仍未确认。
- 按约定停止后续依赖操作、接口类型生成、测试、类型检查和双端构建；仅更新本状态文件及 CHANGELOG.md，不扩大覆盖范围、不强制升级。
- 未发送短信、创建账号或写入后端业务数据。

本轮修改：package-lock.json、CHANGELOG.md、docs/scaffold-status.md；node_modules 中 ws 和内部锁文件由 npm 更新。

## 历史状态：overrides 未生效，已暂停

- 用户已确认本批只处理两个依赖，其他已知风险不在本批自动修复范围。
- 根 package.json 添加带父包版本限定的 overrides：@dcloudio/uni-mp-weixin@3.0.0-5020420260813003 → ws@8.21.3；@dcloudio/uni-nvue-styler@3.0.0-5020420260813003 → postcss@8.5.28。
- 本批基线来自已完成的只读审计：全部依赖 40 项（高危 13、中危 12、低危 15），排除开发依赖后 31 项（高危 10、中危 9、低危 12）。
- 不单独升级 uni-app 要求的 Vite 5.2.8，不套用审计建议的 DCloud 0.x 版本替换。
- 已执行 npm install，退出码 0；安装结果为 up to date，自动审计仍为全部 40 项（高危 13、中危 12、低危 15）。
- 已只读核对 package.json、package-lock.json 以及从两个父包执行的模块解析：配置中的目标版本正确，但实际仍解析到 ws@8.18.0 和 postcss@8.5.6。锁文件所有包的版本均未变化。
- 这证明本次安装没有应用目标升级，不证明原因一定是 npm 缺陷；现有锁定状态或依赖树未重新解析仅是待验证假设。
- 按约定停止，没有运行额外 npm update、删除锁文件、扩大 overrides 或升级框架；接口类型生成、新旧测试、类型检查和双端构建均未执行。
- 建议下一步先用 npm explain ws 与 npm explain postcss 进行只读诊断，再确定最小修复命令，等待用户确认。
- 未发送短信、创建账号或写入后端业务数据。

本批配置及文档修改：package.json、CHANGELOG.md、docs/scaffold-status.md。package-lock.json 中目标版本未更新；packages/api-client/src/schema.ts 尚未生成。

## 历史状态：npm 安装成功后因安全审计暂停

- 继续前已确认根目录与 apps/web、apps/miniapp、packages/api-client、packages/shared 的旧 node_modules 均不存在。
- 执行 npm install 成功，退出码为 0；新增 710 个包、审计 715 个包，根 package-lock.json 已生成。
- 安装时出现与此前相同的 vue-i18n / phin 弃用提醒，随后自动安全审计报告 40 项依赖漏洞：15 项低危、12 项中危、13 项高危。
- 当前只掌握 npm 的汇总结果，尚未执行详细 npm audit，不能判定具体依赖链、生产与开发依赖分布、可利用条件或修复是否需要破坏性升级。
- 按用户要求立即暂停后续开发与验证；未执行 npm audit fix，也未强制升级或忽略冲突。接口类型生成、新旧测试、类型检查和双端构建均未执行。
- 未发送短信、创建账号、调用扫码接口或写入后端业务数据。npm 安装成功不代表业务代码已经通过验证。
- 建议下一步仅执行 npm audit --json 和 npm audit --omit=dev --json，区分风险来源后提出最小修复方案；等待用户确认，不自动修改依赖。

本轮文件变更：新增 package-lock.json；更新 CHANGELOG.md、docs/scaffold-status.md。

## 历史状态：切换 npm workspaces 时清理命令被拒绝

用户已确认切换 npm。工作区配置、启动命令与本地共享包引用已调整，框架依赖版本未升级。

- 新的暂停原因：清理项目 node_modules 的 PowerShell 命令被运行环境安全策略在进程启动前拒绝，未执行目录删除。这不是 npm 安装报错，也不能据此判定依赖是否兼容。
- 旧依赖目录仍保留；未使用其他工具绕过删除限制。npm install、接口类型生成、测试和双端构建均未执行。
- 需要用户手动清理根目录及 apps/web、apps/miniapp、packages/api-client、packages/shared 下的 node_modules，之后再继续已确认的 npm 安装与验证流程。不要删除这些工作区本身。

本次修改文件：package.json、apps/web/package.json、apps/miniapp/package.json、README.md、CHANGELOG.md、docs/scaffold-status.md。

本次删除文件：pnpm-workspace.yaml、pnpm-lock.yaml。成功安装后将由 npm 生成 package-lock.json；目前尚未生成。

## 历史状态：pnpm 安装失败

代码已写入但尚未通过验证，不能视为可交付的运行版本。原版 vanilla-js 目录未修改。

- 已执行：只读接口契约检查、官方模板与包元数据核对、骨架和登录 UI 编写、pnpm install。
- 安装失败：ERR_PNPM_IGNORED_BUILDS；core-js-pure@3.50.0、core-js@3.50.0、esbuild@0.20.2、esbuild@0.28.2、vue-demi@0.14.10 的构建脚本未获执行。
- 另有未展开的 peer dependency 警告；尚未执行 pnpm peers check，不能认定冲突来源。
- 弃用警告：vue-i18n@9.14.5、间接依赖 phin@2.9.3 和 phin@3.7.1。弃用本身不等于已确认运行故障或安全漏洞。
- pnpm-lock.yaml 已生成，node_modules 有安装产物，但安装命令以失败状态退出。未删除这些产物，也未自动批准构建脚本。
- 未执行：API 类型生成、新旧测试、类型检查、双端构建、浏览器视觉验证及真机联调。packages/api-client/src/schema.ts 尚未生成。
- 没有发送短信、创建账号、调用扫码接口或写入后端业务数据。
- 已按用户要求停止。下一步建议仅诊断 pnpm peer / 构建脚本配置，不直接升级 uni-app 固定依赖，待用户确认。

## 历史文件清单（首次骨架写入时）

本批修改：CHANGELOG.md。此前的 docs/refactor-research.md 与原版归档不在本批修改范围。

本批新增（含失败安装生成的锁文件）：

```text
.gitignore
.node-version
README.md
apps/miniapp/.env.example
apps/miniapp/package.json
apps/miniapp/src/App.vue
apps/miniapp/src/lib/api.ts
apps/miniapp/src/lib/transport.ts
apps/miniapp/src/main.ts
apps/miniapp/src/manifest.json
apps/miniapp/src/pages.json
apps/miniapp/src/pages/index/index.vue
apps/miniapp/tsconfig.json
apps/miniapp/vite.config.ts
apps/web/.env.example
apps/web/index.html
apps/web/package.json
apps/web/src/App.vue
apps/web/src/lib/transport.test.ts
apps/web/src/lib/transport.ts
apps/web/src/main.ts
apps/web/src/router.ts
apps/web/src/stores/auth.ts
apps/web/src/styles.css
apps/web/src/views/LoginView.vue
apps/web/src/views/WorkspaceView.vue
apps/web/tsconfig.json
apps/web/vite.config.ts
docs/scaffold-status.md
package.json
packages/api-client/package.json
packages/api-client/src/index.test.ts
packages/api-client/src/index.ts
packages/api-client/tsconfig.json
packages/shared/package.json
packages/shared/src/index.test.ts
packages/shared/src/index.ts
packages/shared/tsconfig.json
pnpm-lock.yaml
pnpm-workspace.yaml
scripts/generate-api-types.mjs
tsconfig.base.json
vitest.config.ts
```
