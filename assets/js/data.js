export const navigation = [
  {
    group: "首页",
    items: [{ id: "dashboard", label: "仪表盘", icon: "layout-dashboard" }],
  },
  {
    group: "班级管理",
    items: [
      {
        id: "students",
        label: "学生管理",
        icon: "users",
        children: [
          ["学生花名册", "users"],
          ["学生导入导出", "file-up"],
        ],
      },
      {
        id: "classCommittee",
        label: "班级管理",
        icon: "badge-check",
        children: [
          ["班委名单", "badge-check"],
          ["职位管理", "scroll-text", "committeeRoles"],
        ],
      },
      {
        id: "hygiene",
        label: "班级卫生",
        icon: "sparkles",
        children: [["学期卫生安排表", "calendar-days"]],
      },
      { id: "seats", label: "排座位", icon: "armchair" },
      { id: "activities", label: "班级活动", icon: "calendar-days" },
      {
        id: "finance",
        label: "班级记录",
        icon: "wallet-cards",
        children: [
          ["收支总览", "landmark"],
          ["收入记录", "circle-arrow-down"],
          ["支出记录", "circle-arrow-up"],
        ],
      },
    ],
  },
  {
    group: "教学管理",
    items: [
      {
        id: "exams",
        label: "成绩分析",
        icon: "chart-no-axes-combined",
        children: [
          ["考试列表", "list"],
          ["成绩录入", "file-pen-line"],
          ["单次分析", "chart-column"],
        ],
      },
      { id: "awards", label: "个人奖惩", icon: "medal" },
      {
        id: "homework",
        label: "作业管理",
        icon: "book-open-check",
        children: [
          ["作业列表", "notebook-tabs"],
          ["作业统计看板", "chart-pie"],
        ],
      },
      { id: "courses", label: "我的课程表", icon: "calendar-clock" },
    ],
  },
  {
    group: "学生关怀",
    items: [
      {
        id: "violations",
        label: "违纪统计",
        icon: "shield-alert",
        children: [
          ["违纪数据看板", "chart-no-axes-combined"],
          ["违纪记录明细", "list"],
        ],
      },
      { id: "leave", label: "请假管理", icon: "calendar-off" },
      {
        id: "alerts",
        label: "风险预警",
        icon: "triangle-alert",
        children: [
          ["风险预警首页", "layout-dashboard"],
          ["学生情绪预警", "heart-pulse"],
          ["特殊体质预警", "stethoscope"],
          ["辍学风险预警", "school"],
          ["未返校", "map-pin-off"],
        ],
      },
      { id: "talks", label: "谈话记录", icon: "message-square-text" },
      {
        id: "contacts",
        label: "家校沟通",
        icon: "contact-round",
        children: [
          ["家校联系", "phone"],
          ["家庭访问", "house"],
        ],
      },
    ],
  },
  {
    group: "班主任工作",
    items: [
      { id: "work", label: "工作简报", icon: "clipboard-pen-line" },
      {
        id: "training",
        label: "班主任培训",
        icon: "graduation-cap",
        children: [
          ["培训记录", "notebook-pen"],
          ["讲座记录", "presentation"],
          ["活动参与", "calendar-check"],
          ["学时统计", "clock-3"],
        ],
      },
    ],
  },
  {
    group: "实用工具",
    items: [
      { id: "todos", label: "待办 & 备忘录", icon: "list-todo" },
      { id: "links", label: "常用网址", icon: "link" },
    ],
  },
  {
    group: "系统",
    items: [
      {
        id: "settings",
        label: "数据管理",
        icon: "database",
        children: [["系统设置", "settings"]],
      },
    ],
  },
];

export const definitions = {
  students: {
    title: "学生花名册",
    desc: "学生信息将作为其他台账的关联数据来源。",
    fields: [
      ["name", "学生姓名", "text"],
      ["gender", "性别", "select", "男,女"],
      ["contact", "家长联系方式", "tel"],
    ],
    cols: ["name", "gender", "contact"],
  },
  leave: {
    title: "请假管理",
    desc: "今日请假人数会自动计入仪表盘。",
    fields: [
      ["student", "学生姓名", "text"],
      ["reason", "请假原因", "select", "病假,事假,其他"],
      ["date", "请假日期", "date"],
    ],
    cols: ["student", "reason", "date"],
  },
  homework: {
    title: "作业管理",
    desc: "未交人数会自动累计到仪表盘。",
    fields: [
      ["subject", "学科", "text"],
      ["title", "作业内容", "text"],
      ["unsubmitted", "未交人数", "number"],
      ["date", "布置日期", "date"],
    ],
    cols: ["subject", "title", "unsubmitted", "date"],
  },
  violations: {
    title: "违纪记录明细",
    desc: "新增记录后，违纪次数自动更新。",
    fields: [
      ["student", "学生姓名", "text"],
      ["type", "违纪类型", "text"],
      ["date", "发生日期", "date"],
      ["note", "处理说明", "textarea"],
    ],
    cols: ["student", "type", "date", "note"],
  },
  alerts: {
    title: "风险预警",
    desc: "按预警类型和处理状态自动汇总，并显示在首页。",
    fields: [
      ["student", "学生姓名", "text"],
      ["type", "预警类型", "select", "情绪预警,特殊体质,辍学风险,未返校,其他"],
      ["level", "风险等级", "select", "高,中,低"],
      ["status", "处理状态", "select", "待处理,跟进中,已关闭"],
      ["note", "跟进情况", "textarea"],
    ],
    cols: ["student", "type", "level", "status", "note"],
  },
  todos: {
    title: "待办 & 备忘录",
    desc: "完成状态会实时同步到仪表盘待办统计。",
    fields: [
      ["title", "事项", "text"],
      ["due", "截止日期", "date"],
      ["status", "状态", "select", "待完成,已完成"],
    ],
    cols: ["title", "due", "status"],
  },
  work: {
    title: "工作简报",
    desc: "本月新增工作记录会自动统计。",
    fields: [
      ["title", "工作事项", "text"],
      ["date", "记录日期", "date"],
      ["note", "工作说明", "textarea"],
    ],
    cols: ["title", "date", "note"],
  },
  exams: {
    title: "成绩分析",
    desc: "录入各学科平均分，用于首页教学概览。",
    fields: [
      ["subject", "学科", "text"],
      ["name", "考试名称", "text"],
      ["average", "班级平均分", "number"],
      ["date", "考试日期", "date"],
    ],
    cols: ["subject", "name", "average", "date"],
  },
  classCommittee: {
    title: "班委名单",
    desc: "选择已维护的职位，职责说明会自动同步。",
    fields: [
      ["student", "学生姓名", "text"],
      ["role", "职务", "text"],
    ],
    cols: ["student", "role", "duty"],
  },
  committeeRoles: {
    title: "职位管理",
    desc: "维护班委职位及对应职责说明。",
    fields: [
      ["role", "职位名称", "text"],
      ["duty", "职责说明", "textarea"],
    ],
    cols: ["role", "duty"],
  },
  hygiene: {
    title: "学期卫生安排表",
    desc: "维护班级卫生值日安排。",
    fields: [
      ["student", "学生姓名", "text"],
      ["area", "负责区域", "text"],
      ["day", "值日时间", "text"],
    ],
    cols: ["student", "area", "day"],
  },
  seats: {
    title: "排座位",
    desc: "维护学生座位信息。",
    fields: [
      ["student", "学生姓名", "text"],
      ["seat", "座位号", "text"],
      ["note", "备注", "text"],
    ],
    cols: ["student", "seat", "note"],
  },
  activities: {
    title: "班级活动",
    desc: "记录班级活动与参与情况。",
    fields: [
      ["title", "活动名称", "text"],
      ["date", "活动日期", "date"],
      ["note", "活动记录", "textarea"],
    ],
    cols: ["title", "date", "note"],
  },
  finance: {
    title: "班级收支",
    desc: "收支明细与余额自动统计。",
    fields: [
      ["type", "类型", "select", "收入,支出"],
      ["amount", "金额", "number"],
      ["note", "说明", "text"],
      ["date", "日期", "date"],
    ],
    cols: ["type", "amount", "note", "date"],
  },
  awards: {
    title: "个人奖惩",
    desc: "记录学生的表扬或奖惩事项。",
    fields: [
      ["student", "学生姓名", "text"],
      ["type", "类型", "select", "表扬,奖励,批评,处分"],
      ["note", "事项说明", "textarea"],
      ["date", "日期", "date"],
    ],
    cols: ["student", "type", "note", "date"],
  },
  courses: {
    title: "我的课程表",
    desc: "维护班级课程安排，可切换列表和动态课表预览。",
    fields: [
      ["course", "课程名称", "text"],
      ["teacher", "任课教师", "text"],
      ["day", "上课日期/星期", "select", "周一,周二,周三,周四,周五,周六,周日"],
      ["time", "上课时间段", "text"],
    ],
    cols: ["course", "teacher", "day", "time"],
  },
  talks: {
    title: "谈话记录",
    desc: "保留学生谈话过程与后续计划。",
    fields: [
      ["student", "学生姓名", "text"],
      ["date", "谈话日期", "date"],
      ["note", "谈话内容", "textarea"],
    ],
    cols: ["student", "date", "note"],
  },
  contacts: {
    title: "家校沟通",
    desc: "记录家长联系和家访情况。",
    fields: [
      ["student", "学生姓名", "text"],
      ["method", "沟通方式", "select", "电话,微信,面谈,家访"],
      ["date", "沟通日期", "date"],
      ["note", "沟通内容", "textarea"],
    ],
    cols: ["student", "method", "date", "note"],
  },
  training: {
    title: "班主任培训",
    desc: "记录培训、讲座与活动参与。",
    fields: [
      ["category", "记录类型", "select", "培训,讲座,活动"],
      ["title", "培训主题", "text"],
      ["hours", "学时", "number"],
      ["date", "培训日期", "date"],
    ],
    cols: ["category", "title", "hours", "date"],
  },
  links: {
    title: "常用网址",
    desc: "保存常用的教学与班级管理链接。",
    fields: [
      ["title", "名称", "text"],
      ["url", "网址", "url"],
    ],
    cols: ["title", "url"],
  },
};

export const labels = {
  name: "姓名",
  gender: "性别",
  contact: "联系方式",
  student: "学生",
  reason: "请假原因",
  date: "日期",
  subject: "学科",
  title: "事项",
  unsubmitted: "未交人数",
  type: "类型",
  note: "说明",
  level: "风险等级",
  due: "截止日期",
  status: "状态",
  average: "平均分",
  role: "职位",
  duty: "职责说明",
  area: "区域",
  day: "上课日期/星期",
  seat: "座位",
  amount: "金额",
  course: "课程",
  teacher: "教师",
  time: "上课时间段",
  method: "沟通方式",
  hours: "学时",
  url: "网址",
  category: "记录类型",
};

export function createInitialData() {
  return {
    students: [],
    leave: [],
    homework: [],
    violations: [],
    alerts: [],
    todos: [],
    work: [],
    exams: [],
    classCommittee: [],
    committeeRoles: [],
    hygiene: [],
    seats: [],
    activities: [],
    finance: [],
    awards: [],
    courses: [],
    talks: [],
    contacts: [],
    training: [],
    links: [],
    seatBoard: {
      rows: 30,
      columns: 30,
      columnGroups: Array.from({ length: 15 }, () => 2),
      placements: [],
    },
  };
}

const collectionKeys = Object.keys(createInitialData()).filter(
  (key) => Array.isArray(createInitialData()[key]),
);

function createRecordId() {
  return globalThis.crypto?.randomUUID?.() ||
    `student-${Date.now()}-${Math.random().toString(16).slice(2)}`;
}

export function normalizeLogbookData(data) {
  if (!data || typeof data !== "object" || Array.isArray(data)) {
    throw new TypeError("台账数据必须是对象。");
  }
  const normalized = createInitialData();
  collectionKeys.forEach((key) => {
    if (key in data && !Array.isArray(data[key])) {
      throw new TypeError(`台账字段“${key}”必须是数组。`);
    }
    normalized[key] = Array.isArray(data[key])
      ? data[key].filter(
          (record) => record && typeof record === "object" && !Array.isArray(record),
        )
      : [];
  });
  normalized.students = normalized.students.map((student) => ({
    ...student,
    id: student.id || createRecordId(),
  }));
  const studentIds = new Set(normalized.students.map((student) => student.id)),
    sourceBoard = data.seatBoard && typeof data.seatBoard === "object"
      ? data.seatBoard
      : {},
    rows = Number(sourceBoard.rows),
    columns = Number(sourceBoard.columns),
    boardRows = Number.isInteger(rows) && rows >= 1 && rows <= 30 ? rows : 30,
    legacyColumns = Number.isInteger(columns) && columns >= 1 && columns <= 30
      ? columns
      : 30,
    sourceGroups = Array.isArray(sourceBoard.columnGroups)
      ? sourceBoard.columnGroups.map(Number)
      : [],
    validGroups =
      sourceGroups.length > 0 &&
      sourceGroups.every(
        (size) => Number.isInteger(size) && size >= 1 && size <= 10,
      ) &&
      sourceGroups.reduce((sum, size) => sum + size, 0) <= 30,
    columnGroups = validGroups
      ? sourceGroups
      : Array.from({ length: Math.ceil(legacyColumns / 2) }, (_, index) =>
          Math.min(2, legacyColumns - index * 2),
        ),
    boardColumns = columnGroups.reduce((sum, size) => sum + size, 0),
    occupiedStudents = new Set(),
    occupiedCells = new Set();
  normalized.seatBoard = {
    rows: boardRows,
    columns: boardColumns,
    columnGroups,
    placements: (Array.isArray(sourceBoard.placements)
      ? sourceBoard.placements
      : []
    ).filter((placement) => {
      if (!placement || typeof placement !== "object") return false;
      const row = Number(placement.row),
        column = Number(placement.column),
        cell = `${row}:${column}`;
      if (
        !studentIds.has(placement.studentId) ||
        occupiedStudents.has(placement.studentId) ||
        occupiedCells.has(cell) ||
        !Number.isInteger(row) ||
        !Number.isInteger(column) ||
        row < 1 || column < 1 || row > boardRows || column > boardColumns
      ) return false;
      occupiedStudents.add(placement.studentId);
      occupiedCells.add(cell);
      placement.row = row;
      placement.column = column;
      return true;
    }),
  };
  normalized.courses = normalized.courses.map(normalizeCourseRecord);
  return normalized;
}

export function normalizeCourseRecord(record) {
  const legacyTime = String(record.time || ""),
    matchedDay = legacyTime.match(/(?:星期|周)[一二三四五六日天]/)?.[0] || "",
    day =
      record.day ||
      matchedDay.replace("星期", "周").replace("周天", "周日") ||
      "",
    time = (record.day
      ? legacyTime
      : legacyTime.replace(/(?:星期|周)[一二三四五六日天]/, "").trim()
    ).replace(/\s+/g, "");
  return { ...record, day, time };
}

export function parseCsv(content) {
  const rows = [[]];
  let field = "",
    quoted = false;
  const text = String(content).replace(/^\uFEFF/, "");
  for (let index = 0; index < text.length; index += 1) {
    const character = text[index];
    if (character === '"') {
      if (quoted && text[index + 1] === '"') {
        field += '"';
        index += 1;
      } else quoted = !quoted;
    } else if (character === "," && !quoted) {
      rows.at(-1).push(field);
      field = "";
    } else if ((character === "\n" || character === "\r") && !quoted) {
      if (character === "\r" && text[index + 1] === "\n") index += 1;
      rows.at(-1).push(field);
      field = "";
      rows.push([]);
    } else field += character;
  }
  rows.at(-1).push(field);
  return rows.filter((row) => row.some((value) => value.trim()));
}

export function formatLocalDate(date = new Date()) {
  const year = date.getFullYear(),
    month = String(date.getMonth() + 1).padStart(2, "0"),
    day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}
