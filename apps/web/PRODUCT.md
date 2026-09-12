# 教师台账

<!-- impeccable:product-schema 1 -->

## Platform

web

## Users

班主任和教师；桌面集中整理班级资料，手机完成查询与日常记录。

## Product Purpose

按班级管理学生、教学、学生关怀、班主任工作和待办。保持既有 39 个页面与 19 类记录的业务能力。

## Capabilities and Constraints

Vue 3、Pinia、Vue Router；复用现有接口与认证协议。手机号、桌面扫码、微信内 Passport 登录行为必须保留。此次仅重构 Web，uni-app 不迁移组件库。

## Brand Commitments

用户指定暖白纸张、低饱和绿色、墨色文字，保留本地小鸟 Logo。采用 shadcn-vue 组件；交互借鉴腾讯 TDesign、字节 Arco 的企业工具模式。

## Product Principles

- 页面首先呈现当前班级、所处功能与主操作。
- 数据操作提供明确反馈，失败保留输入，危险操作明确确认。
- PC 表格与手机列表共享业务能力，手机不依赖悬停操作。
- 空白、加载、失败均提供可理解的状态和下一步。
