<script setup lang="ts">
import { computed, onBeforeUnmount, onMounted, ref } from 'vue';
import { confirmation } from '@/lib/confirmation';
import AppButton from '@/components/AppButton.vue';
import AppNotice from '@/components/AppNotice.vue';
import AppModal from '@/components/AppModal.vue';
import { Input } from '@/components/ui/input';
import { Search, RefreshCw, Settings2, Armchair } from '@lucide/vue';
import type { SeatBoard } from '@teacher-logbook/api-client';
import { useAuthStore } from '../../stores/auth';
import { useWorkspaceStore } from '../../stores/workspace';
const auth=useAuthStore();const workspace=useWorkspaceStore();const board=ref<SeatBoard>();const busy=ref(false);const error=ref('');const selected=ref('');const settings=ref(false);const rows=ref(6);const columns=ref('2,2,2');
const selectedClass=workspace.classId;const confirming=ref(false);const layoutError=ref('');
let disposed=false;
const active=()=>!disposed&&workspace.classId===selectedClass;
onBeforeUnmount(()=>{disposed=true;if(confirming.value)confirmation.close();});
const studentSearch=ref('');
const selectedName=computed(()=>workspace.studentName(selected.value));
const cells=computed(()=>board.value?Array.from({length:board.value.layout.rows*board.value.layout.columns},(_,index)=>({row:Math.floor(index/board.value!.layout.columns)+1,column:index%board.value!.layout.columns+1,assignment:board.value!.assignments.find(item=>item.row===Math.floor(index/board.value!.layout.columns)+1&&item.column===index%board.value!.layout.columns+1)})):[]);
const unplaced=computed(()=>workspace.students.filter(student=>!board.value?.assignments.some(item=>item.studentId===student.id)&&String(student.name).includes(studentSearch.value)));
const groupEnds=computed(()=>{let total=0;return (board.value?.layout.columnGroups??[]).slice(0,-1).map(size=>total+=size);});
async function load(){
  if(!active()||busy.value||confirming.value)return;
  busy.value=true;error.value='';
  try{const value=await auth.api.getSeatBoard(selectedClass);if(active()){board.value=value;selected.value='';}}
  catch(cause){if(active())error.value=workspace.message(cause);}finally{busy.value=false;}
}
async function change(action:()=>Promise<unknown>){
  if(!active()||busy.value)return false;
  busy.value=true;error.value='';
  try{await action();if(!active())return false;const value=await auth.api.getSeatBoard(selectedClass);if(!active())return false;board.value=value;selected.value='';return true;}
  catch(cause){if(active())error.value=workspace.message(cause);return false;}finally{busy.value=false;}
}
function choose(row:number,column:number,studentId?:string){if(busy.value||confirming.value||!board.value)return;if(!selected.value){selected.value=studentId??'';return;}if(studentId===selected.value){selected.value='';return;}void change(()=>auth.api.moveSeat(selectedClass,board.value!.version,selected.value,row,column));}
async function clear(){
  if(!board.value||busy.value||confirming.value||!active())return;
  const version=board.value.version;confirming.value=true;
  try{await confirmation.confirm('所有学生将回到未安排列表，确认清空？','清空座位',{type:'warning'});if(active())await change(()=>auth.api.removeSeat(selectedClass,version));}
  catch(cause){if(active()&&cause!=='cancel'&&cause!=='close')error.value=workspace.message(cause);}finally{confirming.value=false;}
}
function openSettings(){rows.value=board.value?.layout.rows??6;columns.value=board.value?.layout.columnGroups.join(',')??'2,2,2';layoutError.value='';settings.value=true;}
async function saveLayout(){
  if(!board.value||busy.value||confirming.value||!active())return;
  layoutError.value='';
  const groups=columns.value.split(/[,，\s]+/).filter(Boolean).map(Number);const nextRows=rows.value;const version=board.value.version;
  if(!Number.isInteger(nextRows)||nextRows<1||nextRows>30||!groups.length||groups.some(size=>!Number.isInteger(size)||size<1||size>10)||groups.reduce((sum,size)=>sum+size,0)>30){layoutError.value='行数须为 1–30，每组 1–10 列，总列数不超过 30。';return;}
  const removed=board.value.assignments.filter(item=>item.row>nextRows||item.column>groups.reduce((sum,size)=>sum+size,0)).length;
  if(removed){confirming.value=true;try{await confirmation.confirm(`${removed} 名学生超出新布局，将回到未安排列表。`,'调整布局',{type:'warning'});}catch{return;}finally{confirming.value=false;}}
  if(!active())return;
  if(await change(()=>auth.api.saveSeatLayout(selectedClass,version,nextRows,groups)))settings.value=false;
  else if(active())layoutError.value=error.value;
}
function closeSettings(done:()=>void){if(!busy.value&&!confirming.value)done();}
onMounted(load);
</script>
<template>
 <div class="business-toolbar seat-toolbar"><AppButton :loading="busy" @click="load"><RefreshCw/>刷新</AppButton><AppButton :disabled="!board||busy||confirming" @click="openSettings"><Settings2/>布局设置</AppButton><AppButton variant="ghost" class="danger-text" :disabled="!board||busy||confirming" @click="clear">清空座位</AppButton><span v-if="board" class="muted">已安排 {{ board.assignments.length }} / {{ workspace.students.length }} 人</span></div>
 <AppNotice :message="error"/><p class="seat-help"><Armchair :size="18"/>{{ selected ? '已选择 '+selectedName+'，点击目标座位完成安排；点击已占用座位可交换。' : '先选择学生，再点击座位；已安排的学生也可以交换位置。' }}</p>
 <div v-if="board" class="seat-workspace"><aside class="seat-students"><h2>未安排学生 <span>{{ workspace.students.length-board.assignments.length }}</span></h2><Input v-model="studentSearch" aria-label="查找未安排学生" placeholder="搜索姓名"/><p v-if="!unplaced.length" class="muted">{{ studentSearch?'没有匹配的学生':'全部已安排' }}</p><div class="seat-student-list"><button v-for="student in unplaced" :key="student.id" :disabled="busy||confirming" :aria-pressed="selected===student.id" draggable="true" @dragstart="selected=student.id" @click="selected=selected===student.id?'':student.id"><span class="record-avatar">{{ String(student.name).slice(0,1) }}</span>{{ student.name }}</button></div></aside><div class="seat-scroll" tabindex="0" aria-label="座位图，可横向滚动"><div class="seat-podium">讲 台</div><div class="seat-grid" role="group" aria-label="班级座位" :style="{gridTemplateColumns:`repeat(${board.layout.columns}, 88px)`}"><button v-for="cell in cells" :key="cell.row+'-'+cell.column" :disabled="busy||confirming" :class="{aisle:groupEnds.includes(cell.column),occupied:cell.assignment,selected:selected&&selected===cell.assignment?.studentId}" :aria-pressed="!!selected&&selected===cell.assignment?.studentId" :aria-label="`${cell.row}行${cell.column}列 ${cell.assignment?workspace.studentName(cell.assignment.studentId):'空座位'}`" :draggable="Boolean(cell.assignment)" @dragstart="selected=cell.assignment?.studentId??''" @dragover.prevent @drop.prevent="choose(cell.row,cell.column,cell.assignment?.studentId)" @click="choose(cell.row,cell.column,cell.assignment?.studentId)"><small>{{ cell.row }}-{{ cell.column }}</small><strong>{{ cell.assignment?workspace.studentName(cell.assignment.studentId):'空位' }}</strong></button></div></div></div>
 <div v-if="selected" class="seat-selection" role="status"><strong>已选：{{ selectedName }}</strong><AppButton @click="selected=''">取消选择</AppButton><AppButton v-if="board?.assignments.some(item=>item.studentId===selected)" :disabled="busy||confirming" @click="change(()=>auth.api.removeSeat(selectedClass,board!.version,selected))">移回未安排</AppButton></div>
 <AppModal v-model="settings" title="座位布局" description="按教室实际排列设置行数和各组列数。" :busy="busy||confirming" :before-close="closeSettings"><AppNotice :message="layoutError"/><form @submit.prevent="saveLayout"><label class="form-field"><span>行数</span><Input v-model="rows" type="number" :disabled="busy||confirming" min="1" max="30"/></label><label class="form-field"><span>各组列数</span><Input v-model="columns" :disabled="busy||confirming" placeholder="2,2,2"/><small>用逗号分隔。例如 2,2,2 表示三组，每组两列。</small></label><div class="form-actions"><AppButton :disabled="busy||confirming" @click="settings=false">取消</AppButton><AppButton variant="default" type="submit" :loading="busy">保存布局</AppButton></div></form></AppModal>
</template>
