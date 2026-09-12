<script setup lang="ts">
import { computed, ref, watch } from 'vue';
import { confirmation, confirmationState as state, acceptConfirmation } from '@/lib/confirmation';
import { Input } from '@/components/ui/input';
import AppModal from './AppModal.vue';
import AppButton from './AppButton.vue';
const value=ref('');const error=ref('');
const open=computed({get:()=>Boolean(state.value),set:(next:boolean)=>{if(!next)confirmation.close();}});
watch(state,()=>{value.value=state.value?.options.inputValue??'';error.value='';});
function submit(){const result=state.value?.options.inputValidator?.(value.value);if(typeof result==='string'){error.value=result;return;}acceptConfirmation(value.value);}
</script>
<template><AppModal v-model="open" :title="state?.title??'确认操作'" :description="state?.message" panel-class="confirmation-dialog"><form @submit.prevent="submit"><label v-if="state?.input" class="form-field"><span>{{ state.title==='修改班级'?'班级名称':'确认内容' }}</span><Input v-model="value" :aria-invalid="!!error" :disabled="!state" @input="error=''"/><small v-if="error" role="alert" class="field-error">{{ error }}</small></label><div class="form-actions"><AppButton @click="confirmation.close">{{ state?.options.cancelButtonText??'取消' }}</AppButton><AppButton :variant="state?.options.type==='warning'?'destructive':'default'" type="submit">{{ state?.options.confirmButtonText??'确定' }}</AppButton></div></form></AppModal></template>
