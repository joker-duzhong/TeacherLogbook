<script setup lang="ts">
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { nextTick, watch } from 'vue';
const props = withDefaults(defineProps<{ title: string; description?: string; busy?: boolean; beforeClose?: (done: () => void) => void | Promise<void>; panelClass?: string }>(), { description: '请确认信息后继续。' });
const open = defineModel<boolean>({ required: true });
let returnFocus: HTMLElement | undefined;
watch(open, (value) => { if(value)returnFocus=document.activeElement instanceof HTMLElement?document.activeElement:undefined; }, { flush:'sync' });
async function restoreFocus(event: Event) { event.preventDefault();await nextTick();if(returnFocus?.isConnected)returnFocus.focus({preventScroll:true}); }
function change(value: boolean) {
  if(value) { open.value=true; return; }
  if(props.busy)return;
  if(props.beforeClose)void props.beforeClose(()=>{open.value=false;});
  else open.value=false;
}
</script>
<template><Dialog :open="open" @update:open="change"><DialogContent :class="['app-modal', panelClass]" :overlay-class="panelClass==='confirmation-dialog'?'confirmation-overlay':undefined" @close-auto-focus="restoreFocus" @interact-outside.prevent @escape-key-down="busy && $event.preventDefault()"><DialogHeader><DialogTitle>{{ title }}</DialogTitle><DialogDescription>{{ description }}</DialogDescription></DialogHeader><div class="modal-body"><slot/></div></DialogContent></Dialog></template>
