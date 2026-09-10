export type FieldKind = 'text' | 'textarea' | 'number' | 'money' | 'date' | 'time' | 'select' | 'student' | 'role' | 'url';
export interface Field { key: string; label: string; kind: FieldKind; required: boolean; options?: string[] }
export interface Module { resource: string; name: string; fields: Field[] }
const field = (key: string, label: string, kind: FieldKind = 'text', required = true, options?: string[]): Field => ({ key, label, kind, required, ...(options ? { options } : {}) });
const student = field('studentId', '学生', 'student');
const date = field('date', '日期', 'date');
const note = field('note', '记录内容', 'textarea', false);
const choice = (key: string, label: string, options: string[]) => field(key, label, 'select', true, options);
export const modules: Module[] = [
  { resource: 'students', name: '学生花名册', fields: [field('name', '姓名'), choice('gender', '性别', ['男', '女', '其他']), field('contact', '家长联系方式', 'text', false)] },
  { resource: 'leave-requests', name: '请假管理', fields: [student, choice('reason', '原因', ['病假', '事假', '其他']), date] },
  { resource: 'homework-records', name: '作业列表', fields: [field('subject', '学科'), field('title', '作业内容'), field('unsubmitted', '未交人数', 'number'), date] },
  { resource: 'violations', name: '违纪记录', fields: [student, field('type', '违纪类型'), date, note] },
  { resource: 'alerts', name: '风险预警', fields: [student, choice('type', '预警类型', ['情绪预警', '特殊体质', '辍学风险', '未返校', '其他']), choice('level', '风险等级', ['高', '中', '低']), choice('status', '处理状态', ['待处理', '跟进中', '已关闭']), note] },
  { resource: 'todos', name: '待办与备忘录', fields: [field('title', '事项'), field('due', '截止日期', 'date', false), choice('status', '状态', ['待完成', '已完成'])] },
  { resource: 'work-records', name: '工作简报', fields: [field('title', '工作事项'), date, note] },
  { resource: 'exams', name: '考试列表', fields: [field('subject', '学科'), field('name', '考试名称'), field('average', '班级平均分', 'money'), date] },
  { resource: 'committee-roles', name: '职位与职责', fields: [field('role', '职位'), field('duty', '职责', 'textarea')] },
  { resource: 'committee-members', name: '班委名单', fields: [student, field('roleId', '职位', 'role')] },
  { resource: 'hygiene-assignments', name: '卫生安排', fields: [student, field('area', '负责区域'), field('day', '值日时间')] },
  { resource: 'activities', name: '班级活动', fields: [field('title', '活动名称'), date, note] },
  { resource: 'finance-records', name: '班级收支', fields: [choice('type', '类型', ['收入', '支出']), field('amount', '金额', 'money'), field('note', '说明', 'textarea'), date] },
  { resource: 'awards', name: '个人奖惩', fields: [student, choice('type', '类型', ['表扬', '奖励', '批评', '处分']), field('note', '事项说明', 'textarea'), date] },
  { resource: 'courses', name: '我的课程表', fields: [field('course', '课程名称'), field('teacher', '任课教师'), choice('day', '星期', ['周一', '周二', '周三', '周四', '周五', '周六', '周日']), field('startTime', '开始时间', 'time'), field('endTime', '结束时间', 'time')] },
  { resource: 'talks', name: '谈话记录', fields: [student, date, field('note', '谈话内容', 'textarea')] },
  { resource: 'contacts', name: '家校沟通', fields: [student, choice('method', '沟通方式', ['电话', '微信', '面谈', '家访']), date, field('note', '沟通内容', 'textarea')] },
  { resource: 'training-records', name: '培训记录', fields: [choice('category', '记录类型', ['培训', '讲座', '活动']), field('title', '主题'), field('hours', '学时', 'money'), date] },
  { resource: 'links', name: '常用网址', fields: [field('title', '名称'), field('url', '网址', 'url')] },
];
export interface PageDefinition { id: string; group: string; name: string; resource?: string; mode?: 'summary' | 'import' | 'schedule'; filters?: Record<string, string> }
const page = (id: string, group: string, name: string, resource?: string, mode?: PageDefinition['mode'], filters?: Record<string, string>): PageDefinition => ({ id, group, name, ...(resource ? { resource } : {}), ...(mode ? { mode } : {}), ...(filters ? { filters } : {}) });
export const pages: PageDefinition[] = [
  page('dashboard', '首页', '班级总览'),
  page('students', '班级管理', '学生花名册', 'students'), page('student-files', '班级管理', '学生导入导出', 'students', 'import'),
  page('committee', '班级管理', '班委名单', 'committee-members'), page('roles', '班级管理', '职位与职责', 'committee-roles'),
  page('hygiene', '班级管理', '卫生安排', 'hygiene-assignments'), page('seats', '班级管理', '排座位'), page('activities', '班级管理', '班级活动', 'activities'),
  page('finance', '班级管理', '收支总览', 'finance-records', 'summary'), page('income', '班级管理', '收入记录', 'finance-records', undefined, { type: '收入' }), page('expenses', '班级管理', '支出记录', 'finance-records', undefined, { type: '支出' }),
  page('exams', '教学管理', '考试列表', 'exams'), page('grades', '教学管理', '成绩录入', 'exams'), page('exam-analysis', '教学管理', '单次分析', 'exams', 'summary'),
  page('awards', '教学管理', '个人奖惩', 'awards'), page('homework', '教学管理', '作业列表', 'homework-records'), page('homework-summary', '教学管理', '作业统计看板', 'homework-records', 'summary'), page('courses', '教学管理', '我的课程表', 'courses', 'schedule'),
  page('violation-summary', '学生关怀', '违纪数据看板', 'violations', 'summary'), page('violations', '学生关怀', '违纪记录明细', 'violations'), page('leave', '学生关怀', '请假管理', 'leave-requests'),
  page('alerts', '学生关怀', '风险预警总览', 'alerts', 'summary'),
  ...[['emotion', '情绪预警'], ['health', '特殊体质'], ['dropout', '辍学风险'], ['not-returned', '未返校']].map(([id, type]) => page(id!, '学生关怀', type!, 'alerts', undefined, { type: type! })),
  page('talks', '学生关怀', '谈话记录', 'talks'), page('contacts', '学生关怀', '家校联系', 'contacts'), page('visits', '学生关怀', '家庭访问', 'contacts', undefined, { method: '家访' }),
  page('work', '班主任工作', '工作简报', 'work-records'), page('training', '班主任工作', '培训记录', 'training-records', undefined, { category: '培训' }), page('lectures', '班主任工作', '讲座记录', 'training-records', undefined, { category: '讲座' }), page('participation', '班主任工作', '活动参与', 'training-records', undefined, { category: '活动' }), page('hours', '班主任工作', '学时统计', 'training-records', 'summary'),
  page('todos', '实用工具', '待办与备忘录', 'todos'), page('links', '实用工具', '常用网址', 'links'),
  page('classes', '系统', '班级管理'), page('data', '系统', '数据管理'), page('settings', '系统', '系统设置'),
];
export const groups = [...new Set(pages.map(item => item.group))];
export function moduleFor(resource: string) {
  const found = modules.find(item => item.resource === resource);
  if (!found) throw new Error('未知台账类型');
  return found;
}
export function localDate(now = new Date()) {
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;
}
export function validateRecord(module: Module, values: Record<string, string | number | null>): Record<string, string> {
  const errors: Record<string, string> = {};
  for (const field of module.fields) {
    const value = values[field.key];
    if (value === null || value === undefined || String(value).trim() === '') { if (field.required) errors[field.key] = `请填写${field.label}`; continue; }
    if (field.options && !field.options.includes(String(value))) errors[field.key] = `请选择有效的${field.label}`;
    if (field.kind === 'number' && (!Number.isSafeInteger(Number(value)) || Number(value) < 0)) errors[field.key] = '请输入非负整数';
    if (field.kind === 'money' && (!/^\d+(\.\d{1,2})?$/.test(String(value)) || Number(value) < 0 || (['amount', 'hours'].includes(field.key) && Number(value) === 0))) errors[field.key] = '请输入有效数值，最多两位小数';
    if (field.kind === 'url') { try { if (!['http:', 'https:'].includes(new URL(String(value)).protocol)) errors[field.key] = '仅支持 HTTP/HTTPS 网址'; } catch { errors[field.key] = '请输入完整网址'; } }
  }
  if (module.resource === 'courses' && String(values.endTime) <= String(values.startTime)) errors.endTime = '结束时间必须晚于开始时间';
  return errors;
}
export function csvText(headers: string[], rows: unknown[][]) {
  const cell = (value: unknown) => {
    const raw = value == null ? '' : String(value);
    const safe = /^[=+@\-\t\r]/.test(raw) ? `'${raw}` : raw;
    return `"${safe.replace(/"/g, '""')}"`;
  };
  return '\ufeff' + [headers, ...rows].map(row => row.map(cell).join(',')).join('\r\n');
}
