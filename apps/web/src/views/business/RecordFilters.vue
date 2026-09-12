<script setup lang="ts">
import { Input } from '@/components/ui/input';
import AppSelect from '@/components/AppSelect.vue';
defineProps<{ statuses?: string[] | undefined; dates: boolean; disabled: boolean }>();
const status=defineModel<string>('status',{required:true});const from=defineModel<string>('from',{required:true});const to=defineModel<string>('to',{required:true});
</script>
<template><div class="record-filter-fields"><div v-if="statuses" class="form-field"><span>状态</span><AppSelect v-model="status" :options="statuses.map(value=>({value,label:value}))" label="记录状态" placeholder="全部状态" clearable :disabled="disabled"/></div><template v-if="dates"><label class="form-field"><span>开始日期</span><Input v-model="from" type="date" aria-label="开始日期" placeholder="开始日期" :disabled="disabled"/></label><label class="form-field"><span>结束日期</span><Input v-model="to" type="date" aria-label="结束日期" placeholder="结束日期" :disabled="disabled"/></label></template></div></template>
