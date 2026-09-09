<template>
  <view class="workbench">
    <text class="title">班级事务，有序记录。</text>
    <text class="description">在手机上处理日常事务，与 PC 端使用同一套班级数据。</text>
    <view class="status">
      <text class="status-title">小程序基础工程已就绪</text>
      <text class="status-copy">微信登录与业务页面将在后续批次接入。当前页面不会读取或写入班级数据。</text>
    </view>
    <text class="section-title">后续接入范围</text>
    <view class="module-row"><text>学生与班级</text><text class="pending">待接入</text></view>
    <view class="module-row"><text>请假、作业与违纪</text><text class="pending">待接入</text></view>
    <view class="module-row"><text>座位与日常台账</text><text class="pending">待接入</text></view>
  </view>
</template>

<style scoped>
.workbench { padding: 32px 24px; }
.title { display: block; font-size: 26px; font-weight: 600; line-height: 1.5; }
.description { display: block; margin-top: 14px; color: #5f685f; line-height: 1.8; }
.status { margin-top: 32px; padding: 24px; border: 1px solid #cdd2cb; border-radius: 8px; background: #ffffff; }
.status-title { display: block; font-weight: 600; color: #357266; }
.status-copy { display: block; margin-top: 12px; color: #5f685f; line-height: 1.8; }
.section-title { display: block; margin-top: 36px; margin-bottom: 12px; font-weight: 600; }
.module-row { display: flex; justify-content: space-between; padding: 18px 0; border-bottom: 1px solid #cdd2cb; }
.pending { font-size: 14px; color: #5f685f; }
</style>
