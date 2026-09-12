# Web UI / UX 重构交付记录

日期：2026-09-12。范围：教师台账 Web；已确认使用 shadcn 生态重构并兼容 PC 与移动端。

## 实现结果

- 当前项目采用 Vue 3，因此接入 shadcn-vue、Reka UI 和 Tailwind CSS 4。Web 已移除 Element Plus；生成的组件源码纳入仓库，后续可直接维护。
- 重建登录、工作台导航、班级总览、通用记录、座位、班级设置和数据管理页面。39 个导航页面及 19 类记录沿用现有接口和业务模型。
- PC 使用分组侧栏、可检索班级切换、独立筛选和表格操作；手机使用可搜索导航、底部快捷入口、记录卡片、底部筛选抽屉和单列表单。
- 编辑失败保留内容，字段错误就近提示并聚焦；未保存关闭和浏览器返回需要确认；保存期间防重复提交；弹窗关闭恢复焦点。文件或导入策略改变时必须重新预检。
- 使用暖白纸张、灰绿导航、墨色文本与克制的强调色。保留四个主题 ID 和用户偏好，以 Web 自有语义变量实现一致视觉。字体使用系统本地字体，不加载远程字体。
- 使用 Impeccable、UI UX Pro Max 和 frontend-design 技能，结合用户提供的参考梳理视觉层级和交互。腾讯 TDesign、字节 Arco 作为企业工具设计参考，采用清晰导航、主次操作、就近反馈等通用模式。
- 本轮未修改后端协议；uni-app 未迁移组件库。此前已确认的共享薄荷主题调整保留在本次工作区改动中。

## 组件来源与维护入口

- [shadcn/ui](https://ui.shadcn.com/)：用户指定的组件设计方向。
- [shadcn-vue Vite 安装文档](https://www.shadcn-vue.com/docs/installation/vite)：当前 Vue 项目的适配实现。
- [腾讯 TDesign](https://tdesign.tencent.com/) 与 [字节 Arco Design](https://arco.design/)：交互参考。
- [Web 产品背景](../apps/web/PRODUCT.md)、[Web 设计规范](../apps/web/DESIGN.md)、[组件生成配置](../apps/web/components.json)。
- 组件生成器版本为 shadcn-vue 2.8.2；Tailwind CSS 4.3.3。生成器提供构建使用的 CSS 文件，因此保留为开发依赖。生产构建按实际使用的组件打包。
- 官方生成的组件集中在 apps/web/src/components/ui；AppButton、AppModal、AppSelect、AppNotice 和 ConfirmationHost 封装项目业务交互。DialogContent 补充确认层遮罩样式透传，弹窗/抽屉关闭文案已中文化。

## 验证

| 检查 | 结果 |
| --- | --- |
| 单元测试 `npm test` | 126 项通过 |
| Web 类型检查 | 通过 |
| 完整浏览器回归 `npm run test:web -- --max-failures 3 --output test-results/final-review` | 45 项通过 |
| 最后移动端与组件微调后针对性回归 | 6 项通过 |
| 生产构建 `npm run build:web` | 通过 |
| Impeccable 检测 | 返回空问题列表 |
| 补丁格式 `git diff --check` | 通过 |

针对性回归命令：

```powershell
npm run test:web -- tests/web/ui.spec.ts tests/web/workspace.spec.ts --grep 'mobile records|mobile filters|import preview|visual review|all 19|file import' --output test-results/delivery-review
```

覆盖班级增删改、19 类资源增删改、座位、筛选/分页/搜索、接口失败、导入/迁移/恢复、登录/Passport、四套皮肤、移动端导航焦点与触摸滚动、未保存返回确认。截图覆盖 1440px 桌面及 390px 手机的总览、学生、座位、班级、数据与皮肤；另外验证 320px 窄屏和 640px 横屏导航。

构建主入口 JS 为 **234.87 kB，gzip 83.68 kB**；该数字仅为主入口文件，不代表全部懒加载资源。与迁移前约 1062.6 kB 的主入口相比明显缩小，构建不再报告主包超过 500 kB。

浏览器测试使用隔离 API 夹具及 Edge 触摸模拟。截图中的人员、手机号和记录均为测试数据。尚未进行微信真机与真实账号业务写入验收；没有发布到服务器。

## 预览

下列文件由浏览器测试生成，未纳入 Git，重新清理测试输出后需要重新生成。

- [PC 学生页](../test-results/delivery-review/ui-visual-review-covers-pr-a510d-and-phone-with-long-content/students-1440.png)
- [手机学生页](../test-results/delivery-review/ui-visual-review-covers-pr-a510d-and-phone-with-long-content/students-390.png)
- [PC 班级总览](../test-results/delivery-review/ui-visual-review-covers-pr-a510d-and-phone-with-long-content/dashboard-1440.png)
- [手机班级总览](../test-results/delivery-review/ui-visual-review-covers-pr-a510d-and-phone-with-long-content/dashboard-390.png)

手机图片是整页截图，固定底栏显示在采集时的视口底部；实际页面滚动时底栏固定在屏幕底部。

## 依赖审计说明

执行 `npm audit --workspace @teacher-logbook/web --omit=dev --json` 后，npm 报告 **5 项：1 低风险、4 中风险，0 高风险、0 严重风险**。涉及 @babel/core、css、decode-uri-component、source-map-resolve、stylus 等依赖链。未使用可能引入不兼容变更的强制自动修复；该结果不等同于应用已经没有依赖风险。

组件生成器安装时，间接依赖 validate-npm-package-name 提示需要 Node >=24.15.0，当前环境为 24.14.0；实际安装、类型检查与生产构建均成功。本轮没有修改 Node 运行版本。

## 全部改动文件

以下列出本次 UI 重构及此前已确认、仍在工作区内的 UI/技能记录改动，共 143 个文件；其中 102 个为 shadcn-vue 组件源码及导出文件。

### 项目代码、配置、测试与文档（41 个）

- [CHANGELOG.md](../CHANGELOG.md)
- [README.md](../README.md)
- [apps/web/DESIGN.md](../apps/web/DESIGN.md)
- [apps/web/PRODUCT.md](../apps/web/PRODUCT.md)
- [apps/web/components.json](../apps/web/components.json)
- [apps/web/package.json](../apps/web/package.json)
- [apps/web/src/App.vue](../apps/web/src/App.vue)
- [apps/web/src/components/AppButton.vue](../apps/web/src/components/AppButton.vue)
- [apps/web/src/components/AppModal.vue](../apps/web/src/components/AppModal.vue)
- [apps/web/src/components/AppNotice.vue](../apps/web/src/components/AppNotice.vue)
- [apps/web/src/components/AppSelect.vue](../apps/web/src/components/AppSelect.vue)
- [apps/web/src/components/ConfirmationHost.vue](../apps/web/src/components/ConfirmationHost.vue)
- [apps/web/src/lib/confirmation.ts](../apps/web/src/lib/confirmation.ts)
- [apps/web/src/lib/theme.ts](../apps/web/src/lib/theme.ts)
- [apps/web/src/lib/utils.ts](../apps/web/src/lib/utils.ts)
- [apps/web/src/lib/viewport.ts](../apps/web/src/lib/viewport.ts)
- [apps/web/src/main.ts](../apps/web/src/main.ts)
- [apps/web/src/styles.css](../apps/web/src/styles.css)
- [apps/web/src/views/LoginView.vue](../apps/web/src/views/LoginView.vue)
- [apps/web/src/views/PassportCallbackView.vue](../apps/web/src/views/PassportCallbackView.vue)
- [apps/web/src/views/ScanLogin.vue](../apps/web/src/views/ScanLogin.vue)
- [apps/web/src/views/WorkspaceShell.vue](../apps/web/src/views/WorkspaceShell.vue)
- [apps/web/src/views/business/DashboardView.vue](../apps/web/src/views/business/DashboardView.vue)
- [apps/web/src/views/business/DataView.vue](../apps/web/src/views/business/DataView.vue)
- [apps/web/src/views/business/RecordFilters.vue](../apps/web/src/views/business/RecordFilters.vue)
- [apps/web/src/views/business/RecordsView.vue](../apps/web/src/views/business/RecordsView.vue)
- [apps/web/src/views/business/SeatBoardView.vue](../apps/web/src/views/business/SeatBoardView.vue)
- [apps/web/src/views/business/SettingsView.vue](../apps/web/src/views/business/SettingsView.vue)
- [apps/web/src/views/workspace.css](../apps/web/src/views/workspace.css)
- [apps/web/tsconfig.json](../apps/web/tsconfig.json)
- [apps/web/vite.config.ts](../apps/web/vite.config.ts)
- [design-system/teacher-logbook/MASTER.md](../design-system/teacher-logbook/MASTER.md)
- [docs/web-ui-refactor.md](../docs/web-ui-refactor.md)
- [package-lock.json](../package-lock.json)
- [packages/shared/src/themes.ts](../packages/shared/src/themes.ts)
- [tests/web/auth.spec.ts](../tests/web/auth.spec.ts)
- [tests/web/fixtures/workspace.ts](../tests/web/fixtures/workspace.ts)
- [tests/web/login.spec.ts](../tests/web/login.spec.ts)
- [tests/web/passport.spec.ts](../tests/web/passport.spec.ts)
- [tests/web/ui.spec.ts](../tests/web/ui.spec.ts)
- [tests/web/workspace.spec.ts](../tests/web/workspace.spec.ts)

### shadcn-vue 组件（102 个）

- [apps/web/src/components/ui/badge/Badge.vue](../apps/web/src/components/ui/badge/Badge.vue)
- [apps/web/src/components/ui/badge/index.ts](../apps/web/src/components/ui/badge/index.ts)
- [apps/web/src/components/ui/button/Button.vue](../apps/web/src/components/ui/button/Button.vue)
- [apps/web/src/components/ui/button/index.ts](../apps/web/src/components/ui/button/index.ts)
- [apps/web/src/components/ui/command/Command.vue](../apps/web/src/components/ui/command/Command.vue)
- [apps/web/src/components/ui/command/CommandDialog.vue](../apps/web/src/components/ui/command/CommandDialog.vue)
- [apps/web/src/components/ui/command/CommandEmpty.vue](../apps/web/src/components/ui/command/CommandEmpty.vue)
- [apps/web/src/components/ui/command/CommandGroup.vue](../apps/web/src/components/ui/command/CommandGroup.vue)
- [apps/web/src/components/ui/command/CommandInput.vue](../apps/web/src/components/ui/command/CommandInput.vue)
- [apps/web/src/components/ui/command/CommandItem.vue](../apps/web/src/components/ui/command/CommandItem.vue)
- [apps/web/src/components/ui/command/CommandList.vue](../apps/web/src/components/ui/command/CommandList.vue)
- [apps/web/src/components/ui/command/CommandSeparator.vue](../apps/web/src/components/ui/command/CommandSeparator.vue)
- [apps/web/src/components/ui/command/CommandShortcut.vue](../apps/web/src/components/ui/command/CommandShortcut.vue)
- [apps/web/src/components/ui/command/index.ts](../apps/web/src/components/ui/command/index.ts)
- [apps/web/src/components/ui/dialog/Dialog.vue](../apps/web/src/components/ui/dialog/Dialog.vue)
- [apps/web/src/components/ui/dialog/DialogClose.vue](../apps/web/src/components/ui/dialog/DialogClose.vue)
- [apps/web/src/components/ui/dialog/DialogContent.vue](../apps/web/src/components/ui/dialog/DialogContent.vue)
- [apps/web/src/components/ui/dialog/DialogDescription.vue](../apps/web/src/components/ui/dialog/DialogDescription.vue)
- [apps/web/src/components/ui/dialog/DialogFooter.vue](../apps/web/src/components/ui/dialog/DialogFooter.vue)
- [apps/web/src/components/ui/dialog/DialogHeader.vue](../apps/web/src/components/ui/dialog/DialogHeader.vue)
- [apps/web/src/components/ui/dialog/DialogOverlay.vue](../apps/web/src/components/ui/dialog/DialogOverlay.vue)
- [apps/web/src/components/ui/dialog/DialogScrollContent.vue](../apps/web/src/components/ui/dialog/DialogScrollContent.vue)
- [apps/web/src/components/ui/dialog/DialogTitle.vue](../apps/web/src/components/ui/dialog/DialogTitle.vue)
- [apps/web/src/components/ui/dialog/DialogTrigger.vue](../apps/web/src/components/ui/dialog/DialogTrigger.vue)
- [apps/web/src/components/ui/dialog/index.ts](../apps/web/src/components/ui/dialog/index.ts)
- [apps/web/src/components/ui/dropdown-menu/DropdownMenu.vue](../apps/web/src/components/ui/dropdown-menu/DropdownMenu.vue)
- [apps/web/src/components/ui/dropdown-menu/DropdownMenuCheckboxItem.vue](../apps/web/src/components/ui/dropdown-menu/DropdownMenuCheckboxItem.vue)
- [apps/web/src/components/ui/dropdown-menu/DropdownMenuContent.vue](../apps/web/src/components/ui/dropdown-menu/DropdownMenuContent.vue)
- [apps/web/src/components/ui/dropdown-menu/DropdownMenuGroup.vue](../apps/web/src/components/ui/dropdown-menu/DropdownMenuGroup.vue)
- [apps/web/src/components/ui/dropdown-menu/DropdownMenuItem.vue](../apps/web/src/components/ui/dropdown-menu/DropdownMenuItem.vue)
- [apps/web/src/components/ui/dropdown-menu/DropdownMenuLabel.vue](../apps/web/src/components/ui/dropdown-menu/DropdownMenuLabel.vue)
- [apps/web/src/components/ui/dropdown-menu/DropdownMenuRadioGroup.vue](../apps/web/src/components/ui/dropdown-menu/DropdownMenuRadioGroup.vue)
- [apps/web/src/components/ui/dropdown-menu/DropdownMenuRadioItem.vue](../apps/web/src/components/ui/dropdown-menu/DropdownMenuRadioItem.vue)
- [apps/web/src/components/ui/dropdown-menu/DropdownMenuSeparator.vue](../apps/web/src/components/ui/dropdown-menu/DropdownMenuSeparator.vue)
- [apps/web/src/components/ui/dropdown-menu/DropdownMenuShortcut.vue](../apps/web/src/components/ui/dropdown-menu/DropdownMenuShortcut.vue)
- [apps/web/src/components/ui/dropdown-menu/DropdownMenuSub.vue](../apps/web/src/components/ui/dropdown-menu/DropdownMenuSub.vue)
- [apps/web/src/components/ui/dropdown-menu/DropdownMenuSubContent.vue](../apps/web/src/components/ui/dropdown-menu/DropdownMenuSubContent.vue)
- [apps/web/src/components/ui/dropdown-menu/DropdownMenuSubTrigger.vue](../apps/web/src/components/ui/dropdown-menu/DropdownMenuSubTrigger.vue)
- [apps/web/src/components/ui/dropdown-menu/DropdownMenuTrigger.vue](../apps/web/src/components/ui/dropdown-menu/DropdownMenuTrigger.vue)
- [apps/web/src/components/ui/dropdown-menu/index.ts](../apps/web/src/components/ui/dropdown-menu/index.ts)
- [apps/web/src/components/ui/input-group/InputGroup.vue](../apps/web/src/components/ui/input-group/InputGroup.vue)
- [apps/web/src/components/ui/input-group/InputGroupAddon.vue](../apps/web/src/components/ui/input-group/InputGroupAddon.vue)
- [apps/web/src/components/ui/input-group/InputGroupButton.vue](../apps/web/src/components/ui/input-group/InputGroupButton.vue)
- [apps/web/src/components/ui/input-group/InputGroupInput.vue](../apps/web/src/components/ui/input-group/InputGroupInput.vue)
- [apps/web/src/components/ui/input-group/InputGroupText.vue](../apps/web/src/components/ui/input-group/InputGroupText.vue)
- [apps/web/src/components/ui/input-group/InputGroupTextarea.vue](../apps/web/src/components/ui/input-group/InputGroupTextarea.vue)
- [apps/web/src/components/ui/input-group/index.ts](../apps/web/src/components/ui/input-group/index.ts)
- [apps/web/src/components/ui/input/Input.vue](../apps/web/src/components/ui/input/Input.vue)
- [apps/web/src/components/ui/input/index.ts](../apps/web/src/components/ui/input/index.ts)
- [apps/web/src/components/ui/label/Label.vue](../apps/web/src/components/ui/label/Label.vue)
- [apps/web/src/components/ui/label/index.ts](../apps/web/src/components/ui/label/index.ts)
- [apps/web/src/components/ui/popover/Popover.vue](../apps/web/src/components/ui/popover/Popover.vue)
- [apps/web/src/components/ui/popover/PopoverAnchor.vue](../apps/web/src/components/ui/popover/PopoverAnchor.vue)
- [apps/web/src/components/ui/popover/PopoverContent.vue](../apps/web/src/components/ui/popover/PopoverContent.vue)
- [apps/web/src/components/ui/popover/PopoverDescription.vue](../apps/web/src/components/ui/popover/PopoverDescription.vue)
- [apps/web/src/components/ui/popover/PopoverHeader.vue](../apps/web/src/components/ui/popover/PopoverHeader.vue)
- [apps/web/src/components/ui/popover/PopoverTitle.vue](../apps/web/src/components/ui/popover/PopoverTitle.vue)
- [apps/web/src/components/ui/popover/PopoverTrigger.vue](../apps/web/src/components/ui/popover/PopoverTrigger.vue)
- [apps/web/src/components/ui/popover/index.ts](../apps/web/src/components/ui/popover/index.ts)
- [apps/web/src/components/ui/select/Select.vue](../apps/web/src/components/ui/select/Select.vue)
- [apps/web/src/components/ui/select/SelectContent.vue](../apps/web/src/components/ui/select/SelectContent.vue)
- [apps/web/src/components/ui/select/SelectGroup.vue](../apps/web/src/components/ui/select/SelectGroup.vue)
- [apps/web/src/components/ui/select/SelectItem.vue](../apps/web/src/components/ui/select/SelectItem.vue)
- [apps/web/src/components/ui/select/SelectItemText.vue](../apps/web/src/components/ui/select/SelectItemText.vue)
- [apps/web/src/components/ui/select/SelectLabel.vue](../apps/web/src/components/ui/select/SelectLabel.vue)
- [apps/web/src/components/ui/select/SelectScrollDownButton.vue](../apps/web/src/components/ui/select/SelectScrollDownButton.vue)
- [apps/web/src/components/ui/select/SelectScrollUpButton.vue](../apps/web/src/components/ui/select/SelectScrollUpButton.vue)
- [apps/web/src/components/ui/select/SelectSeparator.vue](../apps/web/src/components/ui/select/SelectSeparator.vue)
- [apps/web/src/components/ui/select/SelectTrigger.vue](../apps/web/src/components/ui/select/SelectTrigger.vue)
- [apps/web/src/components/ui/select/SelectValue.vue](../apps/web/src/components/ui/select/SelectValue.vue)
- [apps/web/src/components/ui/select/index.ts](../apps/web/src/components/ui/select/index.ts)
- [apps/web/src/components/ui/sheet/Sheet.vue](../apps/web/src/components/ui/sheet/Sheet.vue)
- [apps/web/src/components/ui/sheet/SheetClose.vue](../apps/web/src/components/ui/sheet/SheetClose.vue)
- [apps/web/src/components/ui/sheet/SheetContent.vue](../apps/web/src/components/ui/sheet/SheetContent.vue)
- [apps/web/src/components/ui/sheet/SheetDescription.vue](../apps/web/src/components/ui/sheet/SheetDescription.vue)
- [apps/web/src/components/ui/sheet/SheetFooter.vue](../apps/web/src/components/ui/sheet/SheetFooter.vue)
- [apps/web/src/components/ui/sheet/SheetHeader.vue](../apps/web/src/components/ui/sheet/SheetHeader.vue)
- [apps/web/src/components/ui/sheet/SheetOverlay.vue](../apps/web/src/components/ui/sheet/SheetOverlay.vue)
- [apps/web/src/components/ui/sheet/SheetTitle.vue](../apps/web/src/components/ui/sheet/SheetTitle.vue)
- [apps/web/src/components/ui/sheet/SheetTrigger.vue](../apps/web/src/components/ui/sheet/SheetTrigger.vue)
- [apps/web/src/components/ui/sheet/index.ts](../apps/web/src/components/ui/sheet/index.ts)
- [apps/web/src/components/ui/skeleton/Skeleton.vue](../apps/web/src/components/ui/skeleton/Skeleton.vue)
- [apps/web/src/components/ui/skeleton/index.ts](../apps/web/src/components/ui/skeleton/index.ts)
- [apps/web/src/components/ui/sonner/Sonner.vue](../apps/web/src/components/ui/sonner/Sonner.vue)
- [apps/web/src/components/ui/sonner/index.ts](../apps/web/src/components/ui/sonner/index.ts)
- [apps/web/src/components/ui/table/Table.vue](../apps/web/src/components/ui/table/Table.vue)
- [apps/web/src/components/ui/table/TableBody.vue](../apps/web/src/components/ui/table/TableBody.vue)
- [apps/web/src/components/ui/table/TableCaption.vue](../apps/web/src/components/ui/table/TableCaption.vue)
- [apps/web/src/components/ui/table/TableCell.vue](../apps/web/src/components/ui/table/TableCell.vue)
- [apps/web/src/components/ui/table/TableEmpty.vue](../apps/web/src/components/ui/table/TableEmpty.vue)
- [apps/web/src/components/ui/table/TableFooter.vue](../apps/web/src/components/ui/table/TableFooter.vue)
- [apps/web/src/components/ui/table/TableHead.vue](../apps/web/src/components/ui/table/TableHead.vue)
- [apps/web/src/components/ui/table/TableHeader.vue](../apps/web/src/components/ui/table/TableHeader.vue)
- [apps/web/src/components/ui/table/TableRow.vue](../apps/web/src/components/ui/table/TableRow.vue)
- [apps/web/src/components/ui/table/index.ts](../apps/web/src/components/ui/table/index.ts)
- [apps/web/src/components/ui/tabs/Tabs.vue](../apps/web/src/components/ui/tabs/Tabs.vue)
- [apps/web/src/components/ui/tabs/TabsContent.vue](../apps/web/src/components/ui/tabs/TabsContent.vue)
- [apps/web/src/components/ui/tabs/TabsList.vue](../apps/web/src/components/ui/tabs/TabsList.vue)
- [apps/web/src/components/ui/tabs/TabsTrigger.vue](../apps/web/src/components/ui/tabs/TabsTrigger.vue)
- [apps/web/src/components/ui/tabs/index.ts](../apps/web/src/components/ui/tabs/index.ts)
- [apps/web/src/components/ui/textarea/Textarea.vue](../apps/web/src/components/ui/textarea/Textarea.vue)
- [apps/web/src/components/ui/textarea/index.ts](../apps/web/src/components/ui/textarea/index.ts)
