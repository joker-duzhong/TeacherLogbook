import { reactive } from 'vue';
import { createApi } from '@teacher-logbook/api-client';
import type { BusinessRecord, ClassRecord, LoginResult, UserRecord } from '@teacher-logbook/api-client';
import { miniappTransport } from './transport';
export const state = reactive({ user: null as UserRecord | null, token: '', classes: [] as ClassRecord[], classId: '', students: [] as BusinessRecord[], roles: [] as BusinessRecord[], skin: 'mr', page: 'dashboard' });
let revision = 0;
let referenceRevision = 0;
export function logout() { revision++;referenceRevision++;state.user=null;state.token='';state.classes=[];state.classId='';state.students=[];state.roles=[];state.skin='mr';state.page='dashboard'; }
export const api=createApi({baseUrl:import.meta.env.VITE_API_BASE_URL||'http://192.168.31.93:8000/api/v1',transport:miniappTransport,getAccessToken:()=>state.token||null,onUnauthorized:logout});
export function acceptLogin(result:LoginResult){state.token=result.access_token;state.user=result.user;}
export async function references(){const current=++referenceRevision;const id=state.classId;if(!id)return;const [students,roles]=await Promise.all([api.allRecords(id,'students'),api.allRecords(id,'committee-roles')]);if(id!==state.classId||current!==referenceRevision)return;state.students=students;state.roles=roles;}
export async function selectClass(id:string){state.classId=id;state.students=[];state.roles=[];await references();}
export async function loadWorkspace(){const current=++revision;const [classes,skin]=await Promise.all([api.listClasses(),api.getSkin()]);if(current!==revision||!state.token)return;state.classes=classes;if(!classes.some(item=>item.id===state.classId))state.classId=classes[0]?.id??'';state.skin=skin;await references();}
export function studentName(id:unknown){return String(state.students.find(item=>item.id===id)?.name??id??'');}
export function errorMessage(error:unknown){return error instanceof Error?error.message:'请求未完成，请重试。';}
export function confirm(title:string,content:string){return new Promise<boolean>(resolve=>uni.showModal({title,content,success:result=>resolve(result.confirm),fail:()=>resolve(false)}));}
