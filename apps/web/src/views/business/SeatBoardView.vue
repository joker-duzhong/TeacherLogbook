<script setup lang="ts">
import { computed, onBeforeUnmount, onMounted, ref } from 'vue';
import { ElMessageBox } from 'element-plus';
import type { SeatBoard } from '@teacher-logbook/api-client';
import { useAuthStore } from '../../stores/auth';
import { useWorkspaceStore } from '../../stores/workspace';
const auth=useAuthStore();const workspace=useWorkspaceStore();const board=ref<SeatBoard>();const busy=ref(false);const error=ref('');const selected=ref('');const settings=ref(false);const rows=ref(6);const columns=ref('2,2,2');
const selectedClass=workspace.classId;const confirming=ref(false);const layoutError=ref('');
let disposed=false;
const active=()=>!disposed&&workspace.classId===selectedClass;
onBeforeUnmount(()=>{disposed=true;if(confirming.value)ElMessageBox.close();});
const selectedName=computed(()=>workspace.studentName(selected.value));
const cells=computed(()=>board.value?Array.from({length:board.value.layout.rows*board.value.layout.columns},(_,index)=>({row:Math.floor(index/board.value!.layout.columns)+1,column:index%board.value!.layout.columns+1,assignment:board.value!.assignments.find(item=>item.row===Math.floor(index/board.value!.layout.columns)+1&&item.column===index%board.value!.layout.columns+1)})):[]);
const unplaced=computed(()=>workspace.students.filter(student=>!board.value?.assignments.some(item=>item.studentId===student.id)));
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
function choose(row:number,column:number,studentId?:string){if(busy.value||confirming.value||!board.value)return;if(!selected.value){selected.value=studentId??'';return;}void change(()=>auth.api.moveSeat(selectedClass,board.value!.version,selected.value,row,column));}
async function clear(){
  if(!board.value||busy.value||confirming.value||!active())return;
  const version=board.value.version;confirming.value=true;
  try{await ElMessageBox.confirm('所有学生将回到未安排列表，确认清空？','清空座位',{type:'warning'});if(active())await change(()=>auth.api.removeSeat(selectedClass,version));}
  catch(cause){if(active()&&cause!=='cancel'&&cause!=='close')error.value=workspace.message(cause);}finally{confirming.value=false;}
}
function openSettings(){rows.value=board.value?.layout.rows??6;columns.value=board.value?.layout.columnGroups.join(',')??'2,2,2';layoutError.value='';settings.value=true;}
async function saveLayout(){
  if(!board.value||busy.value||confirming.value||!active())return;
  layoutError.value='';
  const groups=columns.value.split(/[,，\s]+/).filter(Boolean).map(Number);const nextRows=rows.value;const version=board.value.version;
  if(!Number.isInteger(nextRows)||nextRows<1||nextRows>30||!groups.length||groups.some(size=>!Number.isInteger(size)||size<1||size>10)||groups.reduce((sum,size)=>sum+size,0)>30){layoutError.value='行数须为 1–30，每组 1–10 列，总列数不超过 30。';return;}
  const removed=board.value.assignments.filter(item=>item.row>nextRows||item.column>groups.reduce((sum,size)=>sum+size,0)).length;
  if(removed){confirming.value=true;try{await ElMessageBox.confirm(`${removed} 名学生超出新布局，将回到未安排列表。`,'调整布局',{type:'warning'});}catch{return;}finally{confirming.value=false;}}
  if(!active())return;
  if(await change(()=>auth.api.saveSeatLayout(selectedClass,version,nextRows,groups)))settings.value=false;
  else if(active())layoutError.value=error.value;
}
function closeSettings(done:()=>void){if(!busy.value&&!confirming.value)done();}
onMounted(load);
</script>
<template>
  <div class="business-toolbar"><el-button :loading="busy" @click="load">刷新</el-button><el-button :disabled="!board||busy||confirming" @click="openSettings">布局设置</el-button><el-button type="danger" plain :disabled="!board||busy||confirming" @click="clear">清空座位</el-button><span v-if="board" class="muted">已安排 {{ board.assignments.length }} / {{ workspace.students.length }}</span></div>
  <el-alert v-if="error" :title="error" type="error" :closable="false" />
  <div v-if="board" class="seat-workspace"><aside class="seat-students"><h2>未安排学生</h2><p v-if="!unplaced.length" class="muted">全部已安排</p><button v-for="student in unplaced" :key="student.id" :disabled="busy||confirming" :aria-pressed="selected===student.id" draggable="true" @dragstart="selected=student.id" @click="selected=selected===student.id?'':student.id">{{ student.name }} <small>{{ student.id.slice(0,6) }}</small></button></aside><div class="seat-scroll"><div class="seat-podium">讲台</div><div class="seat-grid" role="grid" aria-label="班级座位" :style="{gridTemplateColumns:`repeat(${board.layout.columns}, 88px)`}"><button v-for="cell in cells" :key="cell.row+'-'+cell.column" role="gridcell" :disabled="busy||confirming" :class="{aisle:groupEnds.includes(cell.column),selected:selected&&selected===cell.assignment?.studentId}" :aria-label="`${cell.row}行${cell.column}列 ${cell.assignment?workspace.studentName(cell.assignment.studentId):'空座位'}`" :draggable="Boolean(cell.assignment)" @dragstart="selected=cell.assignment?.studentId??''" @dragover.prevent @drop.prevent="choose(cell.row,cell.column,cell.assignment?.studentId)" @click="choose(cell.row,cell.column,cell.assignment?.studentId)"><small>{{ cell.row }}-{{ cell.column }}</small><strong>{{ cell.assignment?workspace.studentName(cell.assignment.studentId):'空位' }}</strong></button></div></div></div>
  <div v-if="selected" class="seat-selection" role="status"><strong>{{ selectedName }}</strong><el-button @click="selected=''">取消选择</el-button><el-button v-if="board?.assignments.some(item=>item.studentId===selected)" :disabled="busy||confirming" @click="change(()=>auth.api.removeSeat(selectedClass,board!.version,selected))">移回未安排</el-button></div>
  <el-dialog v-model="settings" title="座位布局" width="440px" :before-close="closeSettings" :close-on-click-modal="false"><el-alert v-if="layoutError" :title="layoutError" type="error" :closable="false" /><el-form label-position="top" @submit.prevent="saveLayout"><el-form-item label="行数"><el-input-number v-model="rows" :disabled="busy||confirming" :min="1" :max="30"/></el-form-item><el-form-item label="各组列数"><el-input v-model="columns" :disabled="busy||confirming" placeholder="2,2,2"/></el-form-item><el-button type="primary" native-type="submit" :loading="busy">保存布局</el-button></el-form></el-dialog>
</template>
