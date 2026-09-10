import { computed, ref } from 'vue';
import { defineStore } from 'pinia';
import type { BusinessRecord, ClassRecord } from '@teacher-logbook/api-client';
import { themes } from '@teacher-logbook/shared';
import { useAuthStore } from './auth';

export const useWorkspaceStore = defineStore('workspace', () => {
  const auth = useAuthStore();
  const classes = ref<ClassRecord[]>([]);
  const classId = ref('');
  const students = ref<BusinessRecord[]>([]);
  const roles = ref<BusinessRecord[]>([]);
  const skin = ref('mr');
  const busy = ref(false);
  const error = ref('');
  let revision = 0;
  let referenceRevision = 0;
  const currentClass = computed(() => classes.value.find(item => item.id === classId.value));
  function message(cause: unknown) { return cause instanceof Error ? cause.message : '请求未完成，请重试。'; }
  async function reloadReferences() {
    const current = ++referenceRevision;
    const selected = classId.value;
    if (!selected) return;
    try {
      const [people, positions] = await Promise.all([auth.api.allRecords(selected, 'students'), auth.api.allRecords(selected, 'committee-roles')]);
      if (selected !== classId.value || current !== referenceRevision) return;
      students.value = people;
      roles.value = positions;
    } catch (cause) {
      if (selected === classId.value && current === referenceRevision) throw cause;
    }
  }
  async function selectClass(id: string) {
    classId.value = id;
    students.value = [];
    roles.value = [];
    error.value = '';
    try { await reloadReferences(); } catch (cause) { if (id === classId.value) error.value = message(cause); }
  }
  async function load() {
    const current = ++revision;
    busy.value = true;
    error.value = '';
    try {
      const list = await auth.api.listClasses();
      if (current !== revision) return;
      classes.value = list;
      await selectClass(list.some(item => item.id === classId.value) ? classId.value : list[0]?.id ?? '');
      if (current !== revision) return;
      const preference = await auth.api.getSkin();
      if (current === revision) skin.value = themes.some(theme => theme.id === preference) ? preference : 'mr';
    } catch (cause) { if (current === revision) error.value = message(cause); }
    finally { if (current === revision) busy.value = false; }
  }
  function reset() { revision++; referenceRevision++; classes.value = []; students.value = []; roles.value = []; classId.value = ''; skin.value = 'mr'; busy.value = false; error.value = ''; }
  function studentName(id: unknown) { return String(students.value.find(item => item.id === id)?.name ?? id ?? ''); }
  return { classes, classId, currentClass, students, roles, skin, busy, error, load, reset, selectClass, reloadReferences, studentName, message };
});
