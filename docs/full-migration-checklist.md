# 全量业务迁移与验收清单

日期：2026-09-09。

## 交付范围

- 已完成代码层面的原版业务迁移：npm Monorepo，PC Vue 3 与微信小程序 uni-app，共享接口、业务规则与皮肤变量。
- 原版 `vanilla-js/` 保持不变。新端没有本地台账存储，不内置模拟业务数据，不再停留在登录占位页。
- PC 和小程序均实现下表 39 个业务视图，覆盖 19 类记录。PC 使用独立路由；小程序在同一页面内按目录切换原生组件，不是将 PC 网页嵌入小程序。
- MR、薄荷、ngrok、Apple 四套皮肤在两端共用变量和后端偏好，各自保留平台适配布局。自定义皮肤通过构建时注册，不执行远程 CSS。
- 小程序编辑使用业务模块已公开的 POST 兼容接口，未改造公共请求中间件，也未伪造 PATCH 覆盖头。
- 成绩录入沿用原版的“班级考试科目平均分”模型，不宣称新增学生个人成绩系统。

## 功能矩阵

下列内容均有实际业务实现；PC 已进行浏览器隔离回归，小程序已通过类型检查及微信目标编译。小程序真机状态不能由此表推定为通过。

| 导航与视图 | PC 路径 | API 资源 | 两端实现 |
| --- | --- | --- | --- |
| 首页 / 班级总览 | `/workspace/dashboard` | 专用接口 | 后端统计、风险与近期事项 |
| 班级管理 / 学生花名册 | `/workspace/students` | `students` | 搜索、分页、增改删、导出 |
| 班级管理 / 学生导入导出 | `/workspace/student-files` | `students` | CSV 模板、预检查、导入、导出 |
| 班级管理 / 班委名单 | `/workspace/committee` | `committee-members` | 搜索、分页、增改删、导出 |
| 班级管理 / 职位与职责 | `/workspace/roles` | `committee-roles` | 搜索、分页、增改删、导出 |
| 班级管理 / 卫生安排 | `/workspace/hygiene` | `hygiene-assignments` | 搜索、分页、增改删、导出 |
| 班级管理 / 排座位 | `/workspace/seats` | 专用接口 | 布局、放置、交换、移回、清空 |
| 班级管理 / 班级活动 | `/workspace/activities` | `activities` | 搜索、分页、增改删、导出 |
| 班级管理 / 收支总览 | `/workspace/finance` | `finance-records` | 统计、筛选、明细、增改删、导出 |
| 班级管理 / 收入记录 | `/workspace/income` | `finance-records` | 搜索、分页、增改删、导出 |
| 班级管理 / 支出记录 | `/workspace/expenses` | `finance-records` | 搜索、分页、增改删、导出 |
| 教学管理 / 考试列表 | `/workspace/exams` | `exams` | 搜索、分页、增改删、导出 |
| 教学管理 / 成绩录入 | `/workspace/grades` | `exams` | 搜索、分页、增改删、导出 |
| 教学管理 / 单次分析 | `/workspace/exam-analysis` | `exams` | 统计、筛选、明细、增改删、导出 |
| 教学管理 / 个人奖惩 | `/workspace/awards` | `awards` | 搜索、分页、增改删、导出 |
| 教学管理 / 作业列表 | `/workspace/homework` | `homework-records` | 搜索、分页、增改删、导出 |
| 教学管理 / 作业统计看板 | `/workspace/homework-summary` | `homework-records` | 统计、筛选、明细、增改删、导出 |
| 教学管理 / 我的课程表 | `/workspace/courses` | `courses` | 周课表、列表、课程增改删 |
| 学生关怀 / 违纪数据看板 | `/workspace/violation-summary` | `violations` | 统计、筛选、明细、增改删、导出 |
| 学生关怀 / 违纪记录明细 | `/workspace/violations` | `violations` | 搜索、分页、增改删、导出 |
| 学生关怀 / 请假管理 | `/workspace/leave` | `leave-requests` | 搜索、分页、增改删、导出 |
| 学生关怀 / 风险预警总览 | `/workspace/alerts` | `alerts` | 统计、筛选、明细、增改删、导出 |
| 学生关怀 / 情绪预警 | `/workspace/emotion` | `alerts` | 搜索、分页、增改删、导出 |
| 学生关怀 / 特殊体质 | `/workspace/health` | `alerts` | 搜索、分页、增改删、导出 |
| 学生关怀 / 辍学风险 | `/workspace/dropout` | `alerts` | 搜索、分页、增改删、导出 |
| 学生关怀 / 未返校 | `/workspace/not-returned` | `alerts` | 搜索、分页、增改删、导出 |
| 学生关怀 / 谈话记录 | `/workspace/talks` | `talks` | 搜索、分页、增改删、导出 |
| 学生关怀 / 家校联系 | `/workspace/contacts` | `contacts` | 搜索、分页、增改删、导出 |
| 学生关怀 / 家庭访问 | `/workspace/visits` | `contacts` | 搜索、分页、增改删、导出 |
| 班主任工作 / 工作简报 | `/workspace/work` | `work-records` | 搜索、分页、增改删、导出 |
| 班主任工作 / 培训记录 | `/workspace/training` | `training-records` | 搜索、分页、增改删、导出 |
| 班主任工作 / 讲座记录 | `/workspace/lectures` | `training-records` | 搜索、分页、增改删、导出 |
| 班主任工作 / 活动参与 | `/workspace/participation` | `training-records` | 搜索、分页、增改删、导出 |
| 班主任工作 / 学时统计 | `/workspace/hours` | `training-records` | 统计、筛选、明细、增改删、导出 |
| 实用工具 / 待办与备忘录 | `/workspace/todos` | `todos` | 搜索、分页、增改删、导出 |
| 实用工具 / 常用网址 | `/workspace/links` | `links` | 搜索、分页、增改删、导出 |
| 系统 / 班级管理 | `/workspace/classes` | 专用接口 | 新建、切换、重命名、删除 |
| 系统 / 数据管理 | `/workspace/data` | 专用接口 | 导入导出、备份、恢复、清空、旧版迁移 |
| 系统 / 系统设置 | `/workspace/settings` | 专用接口 | 四套皮肤与服务端偏好 |

## 共享与平台边界

- `packages/api-client`：真实 OpenAPI 生成的类型、认证与业务请求、分页、服务端错误、文件接口、座位版本头。生成范围为 67 条路径。
- `packages/shared`：目录与字段定义、枚举、必填与金额等校验、统计计算、CSV 编码、日期工具、四套皮肤变量和注册规则。
- PC：Element Plus 表格与表单、侧栏、快捷入口、图标、鼠标拖放、浏览器文件下载。
- 小程序：原生 picker、触摸列表与座位操作、微信登录、首次手机号绑定、文件选择和分享。
- 业务数据与皮肤偏好在后端保存。网页端按后续确认需求仅持久化 access token，刷新和重新打开后经 `/auth/me` 校验再恢复登录；401 或退出清除缓存，不保存 refresh token、不自动续期。小程序登录仍只驻留内存，旧请求不会恢复退出前的学生列表。
- 导出会遍历全部分页并检查总数和重复 ID；文件是用户主动生成的副本，不是本地存储数据库。
- 财务采用分单位累加，培训学时、作业及风险统计由共享函数计算。两端不重复维护相同统计公式。

## 后端配套

仓库：`E:/code/hope/hope-service`。

- 修改限定在 `apps/teacher_logbook/`、该模块测试及 `CHANGELOG.md`；没有修改 common、core、共享认证、公共数据库或后端根配置。
- 新增有类型的记录、仪表盘、座位及校验响应；保留 PATCH 并注册 POST 更新兼容入口。
- 学生导出不再限于前 100 人；仪表盘读取真实近期记录；修复日期、关键词筛选和分页稳定排序。
- 座位交换在重新分配前释放原唯一位置；清空后的座位板复用原记录；备份恢复后的版本保持递增。
- 备份先验证结构、字段、时间、学生和职位引用、座位布局与重复项；错误回滚，不以部分成功覆盖旧数据。
- 旧版 JSON 先预检查，只允许正式迁入空班级。重新生成 UUID 并映射关系，遇到无法区分的同名学生、缺失引用或旧文字座位记录明确拒绝，不猜测映射。
- 后端原有忽略规则覆盖测试路径；新增模块内 `.gitignore` 精确放行模块测试，没有修改根忽略规则。

## 验证结果

下表记录业务迁移时的验收结果；后续登录界面和登录态修订的最新验证结果及文件清单以 `CHANGELOG.md` 为准。

| 检查 | 结果 | 边界 |
| --- | --- | --- |
| 前端单元测试 | 84 项通过 | 请求、鉴权、分页、文件、统计、皮肤、班级切换与扫码竞态 |
| 旧版测试 | 11 项通过 | 归档未修改 |
| Playwright | 6 组通过 | 39 个桌面页面、19 类新增表单、学生编辑删除、四套皮肤、座位操作、文件导入迁移恢复、401 |
| 响应式检查 | 通过 | 390px 遍历 39 页；320px 核对总览、学生、座位、皮肤、班级、数据页面，无页面水平溢出 |
| TypeScript | 四工作区通过 | PC、小程序与两个共享包 |
| PC 构建 | 通过 | 仍有既有主包体积提示 |
| 微信小程序构建 | 通过 | 仍有第三方循环依赖提示 |
| 后端模块测试 | 43 项通过 | 18 类通用资源的 HTTP CRUD 契约与 PATCH/POST、学生导出、筛选、仪表盘、迁移、座位与备份安全 |

浏览器测试全部响应在测试上下文中替换；后端测试替换数据库会话或业务服务，不调用真实业务写接口。没有发送真实短信、创建真实账号、恢复或清空用户数据库。本轮没有重新让用户执行真实扫码确认。

## 复测与运行

PC 当前运行：`http://127.0.0.1:5174/login`。5173 是独立的手机扫码页面，不占用该服务。

在前端根目录执行：

```powershell
npm run dev:web
npm test -- --silent
npm run test:web
npm run test:legacy
npm run typecheck
npm run build:web
npm run build:miniapp
```

浏览器回归需要本机 Edge，先保持 PC 开发服务运行。测试目录为 `tests/web`，截图及失败轨迹输出到已忽略的 `test-results/`。不要对真实生产站点设置 `WEB_TEST_URL`。

在后端仓库执行：

```powershell
./.venv/Scripts/python.exe -m pytest apps/teacher_logbook/tests -q
```

## 尚待真实验收

- 在微信开发者工具中导入 `apps/miniapp/dist/build/mp-weixin`；填写真实公开 AppID，配置真实可访问的 HTTPS 合法域名后进行真机登录、选择文件、分享与业务操作验证。
- 使用授权测试账号及专用测试班级验证真实短信、微信身份绑定、班级权限隔离、双端数据同步、数据库约束与并发。没有账号授权时不把模拟通过写成真实通过。
- 对旧版数据先导出备份，再在新建空班级预检查，出现引用歧义时先人工核对原数据，不自动丢弃或改名。
- 新前端上线前同步部署本次后端业务模块。公共模块无需修改；如后续确实需要改 common，必须先报告。
- 现有依赖审计仍报告 41 项（15 低、13 中、13 高）；后端有 4 条既有 Pydantic 弃用提示。本次没有强制升级框架或修改公共代码来消除这些提示。

## 全部修改文件

### TeacherLogbook

```text
.gitignore
CHANGELOG.md
README.md
apps/miniapp/src/components/MiniApp.vue
apps/miniapp/src/components/MiniDashboard.vue
apps/miniapp/src/components/MiniData.vue
apps/miniapp/src/components/MiniRecords.vue
apps/miniapp/src/components/MiniSeats.vue
apps/miniapp/src/components/MiniSettings.vue
apps/miniapp/src/lib/files.ts
apps/miniapp/src/lib/transport.test.ts
apps/miniapp/src/lib/transport.ts
apps/miniapp/src/lib/workspace.ts
apps/miniapp/src/miniapp.css
apps/miniapp/src/pages/index/index.vue
apps/web/package.json
apps/web/src/lib/files.ts
apps/web/src/lib/transport.test.ts
apps/web/src/lib/transport.ts
apps/web/src/router.ts
apps/web/src/stores/auth.test.ts
apps/web/src/stores/auth.ts
apps/web/src/stores/workspace.test.ts
apps/web/src/stores/workspace.ts
apps/web/src/views/BusinessPage.vue
apps/web/src/views/WorkspaceShell.vue
apps/web/src/views/WorkspaceView.vue
apps/web/src/views/business/DashboardView.vue
apps/web/src/views/business/DataView.vue
apps/web/src/views/business/RecordsView.vue
apps/web/src/views/business/SeatBoardView.vue
apps/web/src/views/business/SettingsView.vue
apps/web/src/views/workspace.css
docs/full-migration-checklist.md
docs/scaffold-status.md
package-lock.json
package.json
packages/api-client/src/index.ts
packages/api-client/src/logbook.test.ts
packages/api-client/src/logbook.ts
packages/api-client/src/schema.ts
packages/shared/src/catalog.test.ts
packages/shared/src/catalog.ts
packages/shared/src/index.ts
packages/shared/src/summary.test.ts
packages/shared/src/summary.ts
packages/shared/src/themes.ts
playwright.config.ts
scripts/generate-api-types.mjs
tests/web/workspace.spec.ts
tests/web/auth.spec.ts
```

其中 `apps/web/src/views/WorkspaceView.vue` 为删除的旧占位组件，其余为新增或修改。

### hope-service

```text
CHANGELOG.md
apps/teacher_logbook/.gitignore
apps/teacher_logbook/migration.py
apps/teacher_logbook/router.py
apps/teacher_logbook/schemas.py
apps/teacher_logbook/services.py
apps/teacher_logbook/tests/test_contract.py
apps/teacher_logbook/tests/test_migration.py
apps/teacher_logbook/tests/test_routes.py
apps/teacher_logbook/tests/test_safety.py
apps/teacher_logbook/tests/test_schemas.py
tests/test_teacher_logbook.py
```

最后一项是既有、被根规则忽略的本地测试文件，仅同步了严格备份校验所需的测试数据。可版本管理的完整业务测试已位于 `apps/teacher_logbook/tests/`。
