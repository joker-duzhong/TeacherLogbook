<script setup lang="ts">
import { computed, ref } from 'vue';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Command, CommandEmpty, CommandInput, CommandItem, CommandList, CommandGroup } from '@/components/ui/command';
import { Check, ChevronsUpDown } from '@lucide/vue';
import AppButton from './AppButton.vue';
defineOptions({ inheritAttrs: false });
const props = withDefaults(defineProps<{ options: { value: string; label: string }[]; label: string; placeholder?: string; disabled?: boolean; clearable?: boolean }>(), { placeholder: '请选择' });
const value = defineModel<string | number | null>();
const emit = defineEmits<{ change: [value: string] }>();
const open=ref(false);
const selected=computed(()=>props.options.find(option=>option.value===String(value.value??'')));
function choose(next:string) { value.value=next;open.value=false;emit('change',next); }
</script>
<template><Popover v-model:open="open"><PopoverTrigger as-child><AppButton v-bind="$attrs" class="app-select" role="combobox" :aria-label="label" :aria-expanded="open" :disabled="disabled"><span :class="{'placeholder':!selected}">{{ selected?.label || placeholder }}</span><ChevronsUpDown :size="15"/></AppButton></PopoverTrigger><PopoverContent class="select-popover p-0" align="start"><Command><CommandInput :placeholder="'搜索'+label"/><CommandList><CommandEmpty>没有匹配项</CommandEmpty><CommandGroup><CommandItem v-if="clearable" value="清除选择" @select="choose('')">全部 / 清除选择</CommandItem><CommandItem v-for="option in options" :key="option.value" :value="option.label+' '+option.value" @select="choose(option.value)"><span>{{ option.label }}</span><Check v-if="option.value===String(value??'')" class="ml-auto" :size="16"/></CommandItem></CommandGroup></CommandList></Command></PopoverContent></Popover></template>
