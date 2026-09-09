# Changelog

## 2026-09-09 · 精简登录页与二维码状态遮罩

- 删除登录页 PC 标识、迁移说明、公用设备会话说明及页脚存储说明；保留品牌、手机号登录和原有页面布局。
- 二维码下方仅显示“使用微信扫码登录”，移除可见过期倒计时和常驻刷新按钮，不改变后台过期判定。
- 已扫码和登录处理中显示二维码遮罩；过期、取消、已使用或失败时在遮罩内显示状态及刷新按钮，错误详情仍可查看。
- 保留失效二维码图片作为淡化模糊背景，轮询及会话凭据仍按原逻辑清理；刷新生成期间保持图片，完成后替换，离开时清空图片。
- 验证：全部新版 63 项测试通过，PC 类型检查及生产构建通过；浏览器隔离验证默认文案、已扫码遮罩、过期停止轮询、刷新新事务、取消和失败重试，1366/320 宽度无溢出、二维码尺寸稳定、无运行错误。保留现有构建大包警告。
- 修改文件：apps/web/src/views/LoginView.vue、apps/web/src/views/ScanLogin.vue、apps/web/src/styles.css、apps/web/src/lib/scan-login.ts、apps/web/src/lib/scan-login.test.ts、docs/scaffold-status.md、CHANGELOG.md。

## 2026-09-09 · 扫码链接支持本地环境参数

- 保留用户调整后的扫码页面端口 5173，在真实 transaction_id 后保留显式 env=local；无环境参数的链接保持不变，由手机页面默认使用正式环境。
- 未显式配置扫码地址时，本地开发附加 env=local，正式构建不附加；更新 .env.example，生产部署使用自己的正式 HTTPS 扫码页面地址。
- 只放行单个 env=local，拒绝重复环境、未知参数和任何预置事务或凭据参数；不新增 PC 本地存储，环境缓存仍由手机页面负责。
- 补充 URL 规则及二维码渲染回归测试，保留用户原有调试日志。修改文件：apps/web/src/lib/scan-login.ts、apps/web/src/lib/scan-login.test.ts、apps/web/src/views/ScanLogin.vue、apps/web/.env.example、README.md、docs/scaffold-status.md、CHANGELOG.md。
- 验证：扫码专项 24 项、全部新版 62 项测试通过，PC 类型检查及生产构建通过；浏览器在现有 5174 工作台服务上使用隔离响应验证二维码实际包含 transaction_id 和 env=local，未新增 localStorage/sessionStorage 数据。

## 2026-09-09 · PC 微信扫码真实接入，默认优先

- 将微信扫码标签移到手机号验证码前并默认选中，替换原占位区为本地生成的真实二维码；保留已有布局及手机号登录。
- 从真实 OpenAPI 生成 12 条路径的类型；接入扫码应用列表、创建事务、携带 X-Scan-Token 的串行轮询及一次性兑换，确认后复用内存登录态进入工作台。
- 手机页面默认使用 http://192.168.31.93:5173/scan，二维码只包含 transaction_id；新增公开配置示例，任何令牌不进入 URL、二维码或本地存储。
- 新增扫码生命周期模块与回归测试，覆盖过期、取消、已消费、刷新、切换离开、慢请求、旧响应、失败不重复兑换和契约异常。
- PC 增加 qrcode 1.5.4 和 @types/qrcode 1.5.6；没有升级框架或扩大覆盖规则。当前 npm audit 报告 41 项（高危 13、中危 13、低危 15），未列出 qrcode 及其依赖为漏洞来源，其他风险没有自动修复。
- 同步上次被中断的骨架修复记录：小程序 App.vue 空脚本、Vue 类型解析隔离、小程序 PATCH 显式拒绝及回归测试；PC 针对 Element Plus 类型兼容关闭 exactOptionalPropertyTypes，strict 仍开启。
- 验证：新版 51 项测试、旧版 11 项测试、四工作区类型检查、PC 和微信小程序生产构建通过；保留 PC 大包提示及小程序第三方循环依赖警告，未隐藏警告。
- 浏览器验证真实后端创建会话、二维码像素与默认标签、切换停止轮询、320/390/1366 宽度布局；用隔离响应验证确认兑换一次、工作台跳转、刷新清除登录、取消和过期，无页面运行错误。
- 未在真实账号上执行手机确认或兑换、未发送短信；完整真机登录由用户本地验证。更新 README 和 docs/scaffold-status.md 的当前状态及修改文件清单。

## 2026-09-09 · PostCSS 定点修复完成

- 依赖图确认覆盖规则已将 uni-nvue-styler 的 PostCSS 要求改为 8.5.28，但锁定的嵌套 8.5.6 条目仍被标记为 INVALID；工作区定向更新未改变该状态。
- 仅移除根锁文件中失效的嵌套 PostCSS 条目，再执行 npm install --ignore-scripts；npm 自动移除旧 PostCSS 与其多余的 picocolors 副本，复用根目录 PostCSS 8.5.28。手动目录清理命令被运行环境拒绝，未执行。
- 未修改 package.json、覆盖范围、框架版本或业务源码；最终根锁文件仅减少上述两个条目，其余包条目保持不变。
- 独立 Node 进程验证父包实际解析与两份锁文件一致：PostCSS 8.5.28、ws 8.21.3；PostCSS 解析冒烟测试、npm ls postcss ws --all 均通过。
- 重复 npm install --ignore-scripts 后锁文件保持不变；npm test 的 19 项测试和 npm run test:legacy 的 11 项测试全部通过。
- 自动审计剩余 37 项（高危 11、中危 11、低危 15），本次不扩大到其他依赖风险。
- 小程序构建另发现原有 apps/miniapp/src/App.vue 的空 script setup 被编译器视为无有效模板或脚本，并出现第三方循环依赖警告；按约定记录独立问题，不混入依赖修复。PC 构建、接口类型生成及全量类型检查未执行，双端骨架尚未完成构建验收。

## 2026-09-09 · 定向更新部分完成，PostCSS 仍待处理

- 经确认仅删除 node_modules/.package-lock.json 内部锁缓存，保留根锁文件和现有依赖目录。
- 执行 npm update ws postcss @dcloudio/uni-nvue-styler --ignore-scripts，退出码 0，更新 1 个包。
- 核对父包实际解析、根锁文件和重新生成的内部锁文件：ws 均为 8.21.3；uni-nvue-styler 的嵌套 PostCSS 均仍为 8.5.6，未达到目标 8.5.28。
- 根 package.json 未变化；根锁文件包条目仅 ws 变化，两个 DCloud 父包版本均保持不变。
- 安装自动审计为 39 项（高危 12、中危 12、低危 15）；未重新执行排除开发依赖的审计。
- 因 PostCSS 未完成升级，按约定停止后续安装、开发和测试，仅同步暂停记录；不将部分成功视为整体修复完成。

## 2026-09-08 · ws 与 PostCSS 定点修复

- 经确认添加限定父包及版本的 overrides：uni-mp-weixin 的 ws 使用 8.21.3，uni-nvue-styler 的 PostCSS 使用 8.5.28。
- 不更改 Vue、Vite 或 DCloud 主包版本，不执行 audit fix、force 或 legacy-peer-deps。
- npm install 成功退出，但自动审计仍为 40 项（高危 13、中危 12、低危 15）；目标依赖没有完成升级。
- 只读核对父包实际解析和锁文件：uni-mp-weixin 仍使用 ws@8.18.0，uni-nvue-styler 仍使用 postcss@8.5.6，锁文件中所有包的版本与执行前一致。
- overrides 未生效原因尚未定位；按约定暂停，不扩大覆盖范围、不删除锁文件、不追加安装或强制更新，类型生成、测试和双端构建均未执行。
- 更新 docs/scaffold-status.md，保留之前的审计和暂停历史。

## 2026-09-08 · npm 安装完成，安全审计暂停

- 继续前确认根目录和四个工作区的旧 node_modules 均已清理。
- npm install 成功退出，新增 710 个包并生成根 package-lock.json；没有使用 force 或 legacy-peer-deps。
- 安装后的自动审计报告 40 项依赖漏洞：15 项低危、12 项中危、13 项高危；具体依赖路径与实际运行影响尚未分析。
- 按约定暂停后续开发与验证，没有执行 npm audit fix、依赖升级、接口类型生成、测试或双端构建。
- 更新 docs/scaffold-status.md 记录本轮实际结果与待确认的只读审计步骤；未修改业务源码。

## 2026-09-08 · 切换 npm workspaces

- 按确认方案改用 npm 10.9.4 和根 package.json 的 workspaces，调整双端命令及本地共享包引用。
- 删除 pnpm-workspace.yaml、pnpm-lock.yaml；框架与业务依赖版本保持不变，不使用 force 或 legacy-peer-deps 绕过冲突。
- 更新 README 和状态记录，保留之前安装失败的历史。
- npm 配置切换已写入；清理项目 node_modules 的 PowerShell 命令在进程启动前被运行环境安全策略拒绝，未执行删除。
- 按用户要求暂停，不换工具绕过限制；npm install、接口类型生成、测试和双端构建均未开始，package-lock.json 尚未生成。

## 2026-09-08 · 双端骨架第一批

- 新增 pnpm 工作区、PC Vue 3 应用和 uni-app 微信小程序基础工程，保留 vanilla-js 归档不动。
- 新增共享接口类型生成脚本、班级和学生业务方法、两端传输适配及手机号登录相关校验。
- PC 登录页提供手机号验证码登录及微信扫码 UI；扫码区域仅标记待接入，不生成二维码、不轮询接口。
- PC 登录信息只保存在内存中，刷新后重新登录；不自动续期、不使用本地持久化或产品运行时模拟数据。
- 新增隔离的请求层和校验测试，以及 README 启动、配置、构建和当前功能边界说明。
- 执行 pnpm install 时出现弃用、peer dependency 警告，最终以 ERR_PNPM_IGNORED_BUILDS 失败退出；未自行批准脚本、升级依赖或继续修复。
- 按用户要求暂停；类型生成、新旧测试、类型检查及双端构建均未执行。当前代码不是已验证的可运行交付。
- 新增 docs/scaffold-status.md，记录安装失败、未执行的验证以及本批完整文件清单。

## 2026-09-08

- 将原项目全部 19 个现存文件移入英文目录 `vanilla-js/`，保留内部结构和文件内容，根目录保留 `.git/`。
- 旧版变更历史保存在 `vanilla-js/CHANGELOG.md`；保留操作前已有的三张台账截图删除状态。
- 完成归档前后 19 个文件的 SHA-256 一致性校验，旧版 11 项 Node.js 测试全部通过。
- 新增 `docs/refactor-research.md`，记录微信小程序与 PC 网页端的架构建议，以及本地真实 OpenAPI 的接口覆盖、契约缺口和分阶段迁移计划。
- 本次仅完成归档与技术调研，未创建新应用、修改旧版业务逻辑或写入后端业务数据。
