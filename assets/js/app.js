import {
  navigation,
  definitions,
  labels,
  formatLocalDate,
  normalizeCourseRecord,
  parseCsv,
} from "./data.js";
import { teacherLogbookServer } from "./server.js";
import { renderSeatBoard } from "./seat-board.js";

(() => {
  const skinSources = {
    mint: "assets/styles/mint-style.css",
    ngrok: "assets/styles/ngrok-style.css",
    apple: "assets/styles/apple-style.css",
    mr: "assets/styles/mr-style.css",
  };
  function skinSource(name) {
    return name.startsWith("custom:")
      ? `assets/styles/${name.slice(7)}-style.css`
      : skinSources[name] || skinSources.mr;
  }
  function applySkin(name) {
    const source = skinSource(name),
      stylesheet = document.querySelector("#skinStylesheet"),
      finish = () => {
        void teacherLogbookServer.setSkin(name);
        document.documentElement.dataset.skin = name;
        document
          .querySelectorAll("[data-ui-skin]")
          .forEach((option) =>
            option.setAttribute(
              "aria-checked",
              String(option.dataset.uiSkin === name),
            ),
          );
      };
    if (stylesheet.getAttribute("href") === source) {
      finish();
      return Promise.resolve();
    }
    return new Promise((resolve, reject) => {
      stylesheet.onload = () => {
        finish();
        resolve();
      };
      stylesheet.onerror = () => reject(new Error("皮肤文件无法读取"));
      stylesheet.href = source;
    });
  }
  async function selectSkin(name) {
    const custom =
      name === "custom"
        ? prompt(
            "请输入皮肤文件名，例如 modern 将加载 assets/styles/modern-style.css：",
          )
        : "";
    if (name === "custom" && !custom) return;
    const skin = name === "custom" ? `custom:${custom.trim()}` : name;
    if (!/^(mint|ngrok|apple|mr|custom:[a-zA-Z0-9_-]+)$/.test(skin)) {
      alert("皮肤文件名只能包含英文字母、数字、下划线或连字符。");
      return;
    }
    try {
      await applySkin(skin);
    } catch {
      alert("皮肤切换失败，请确认对应的 CSS 文件位于 assets/styles 目录。");
    }
  }
  const state = {
    section: "dashboard",
    pageTitle: "班级总览",
    editId: null,
    openMenus: new Set(),
    data: null,
  };
  async function save() {
    try {
      await teacherLogbookServer.saveLogbook(state.data);
      return true;
    } catch {
      alert("保存失败：本次修改未写入本地台账，请检查浏览器存储权限后重试。");
      return false;
    }
  }
  function today() {
    return formatLocalDate();
  }
  function month() {
    return new Date().toISOString().slice(0, 7);
  }
  function esc(value = "") {
    return String(value).replace(
      /[&<>"']/g,
      (char) =>
        ({
          "&": "&amp;",
          "<": "&lt;",
          ">": "&gt;",
          '"': "&quot;",
          "'": "&#039;",
        })[char],
    );
  }
  function metric(label, value, note) {
    return `<article class="metric"><div class="metric-label">${label}</div><div class="metric-value">${value}</div><div class="metric-note">${note}</div></article>`;
  }
  function nav() {
    document.querySelector("#nav").innerHTML = navigation
      .map(
        ({ group, items }) =>
          `<div class="nav-group">${group}</div>${items
            .map((item) => {
              const menuId = `${group}-${item.id}`,
                hasChildren = Boolean(item.children),
                expanded = state.openMenus.has(menuId),
                firstChild = item.children?.[0],
                parentActive =
                  state.section === item.id ||
                  item.children?.some(
                    ([, , section]) => state.section === section,
                  );
              return `<div class="nav-row"><button class="nav-item ${parentActive ? "active" : ""}" data-nav="${item.id}" data-title="${firstChild ? firstChild[0] : item.label}" ${hasChildren ? `data-menu="${menuId}" aria-expanded="${expanded}"` : ""}><i data-lucide="${item.icon}"></i>${item.label}${hasChildren ? '<i class="nav-chevron" data-lucide="chevron-right"></i>' : ""}</button></div>${hasChildren ? `<div class="nav-children ${expanded ? "open" : ""}">${item.children.map(([label, icon, section]) => `<button class="nav-child ${state.section === (section || item.id) && state.pageTitle === label ? "active" : ""}" data-nav="${section || item.id}" data-title="${label}"><i data-lucide="${icon}"></i>${label}</button>`).join("")}</div>` : ""}`;
            })
            .join("")}`,
      )
      .join("");
  }
  function animateOpenedMenu(menuId) {
    const submenu = document
      .querySelector(`[data-menu="${menuId}"]`)
      ?.closest(".nav-row")
      ?.nextElementSibling;
    if (!submenu) return;
    submenu.classList.add("opening");
    window.setTimeout(() => submenu.classList.remove("opening"), 200);
  }
  function animatePage(page) {
    page.classList.remove("page-transition");
    void page.offsetWidth;
    page.classList.add("page-transition");
  }
  function renderDashboard() {
    const d = state.data,
      activeTodos = d.todos.filter((x) => x.status !== "已完成"),
      todayLeaves = d.leave.filter((x) => x.date === today()),
      unsubmitted = d.homework.reduce(
        (sum, x) => sum + (Number(x.unsubmitted) || 0),
        0,
      ),
      workThisMonth = d.work.filter((x) => x.date?.startsWith(month())).length;
    const risks = [
      [
        "EMOTION",
        "情绪预警",
        d.alerts.filter((x) => x.type === "情绪预警").length,
      ],
      [
        "SPECIAL HEALTH",
        "特殊体质",
        d.alerts.filter((x) => x.type === "特殊体质").length,
      ],
      [
        "DROPOUT RISK",
        "辍学风险",
        d.alerts.filter((x) => x.type === "辍学风险").length,
      ],
      [
        "NOT RETURNED",
        "未返校",
        d.alerts.filter((x) => x.type === "未返校").length,
      ],
      [
        "PENDING",
        "待处理预警",
        d.alerts.filter((x) => x.level !== "低").length,
      ],
    ];
    document.querySelector("#metrics").innerHTML = [
      metric(
        "TOTAL STUDENTS",
        d.students.length,
        `男 ${d.students.filter((x) => x.gender === "男").length} · 女 ${d.students.filter((x) => x.gender === "女").length}`,
      ),
      metric("LEAVE TODAY", todayLeaves.length, "今日请假人次"),
      metric("UNSUBMITTED", unsubmitted, "作业未交人次"),
      metric("VIOLATIONS", d.violations.length, "违纪记录总数"),
      metric("WORK RECORDS", workThisMonth, "本月工作记录"),
      metric("PENDING", activeTodos.length, "待办事项"),
    ].join("");
    document.querySelector("#risks").innerHTML = risks
      .map(
        ([en, cn, count]) =>
          `<article class="risk"><span>${en}</span><strong>${count}</strong><span>${cn}人数</span></article>`,
      )
      .join("");
    const high = d.alerts.filter((x) => x.level === "高");
    document.querySelector("#riskCount").textContent = `${high.length} 项`;
    document.querySelector("#riskList").innerHTML = high.length
      ? `<ul class="list">${high
          .slice(-4)
          .map(
            (x) =>
              `<li><span><strong>${esc(x.student)}</strong><br><small>${esc(x.note || x.type)}</small></span><span class="badge danger">${esc(x.type)}</span></li>`,
          )
          .join("")}</ul>`
      : '<div class="empty">暂无风险学生</div>';
    document.querySelector("#todoCount").textContent =
      `${activeTodos.length} 项`;
    document.querySelector("#todoList").innerHTML = activeTodos.length
      ? `<ul class="list">${activeTodos
          .slice(-4)
          .map(
            (x) =>
              `<li><span><strong>${esc(x.title)}</strong><br><small>截止：${esc(x.due || "未设置")}</small></span><button class="text-btn" data-done="${x.id}">完成</button></li>`,
          )
          .join("")}</ul>`
      : '<div class="empty">暂无跟进事项</div>';
    const latestExam = d.exams.at(-1);
    document.querySelector("#examSummary").innerHTML = latestExam
      ? `<strong>${esc(latestExam.subject)} · ${esc(latestExam.name)}</strong><div class="metric-value" style="margin-top:12px">${esc(latestExam.average)}</div><small>班级平均分 · ${esc(latestExam.date || "未记录日期")}</small>`
      : '<div class="empty">暂无考试数据</div>';
    document.querySelector("#workList").innerHTML = d.work.length
      ? `<ul class="list">${d.work
          .slice(-3)
          .reverse()
          .map(
            (x) =>
              `<li><span>${esc(x.title)}</span><small>${esc(x.date || "")}</small></li>`,
          )
          .join("")}</ul>`
      : '<div class="empty">暂无工作记录</div>';
  }
  function recordsForCurrentPage() {
    const rows = state.data[state.section] || [];
    if (state.section !== "finance") return rows;
    const type =
      state.pageTitle === "收入记录"
        ? "收入"
        : state.pageTitle === "支出记录"
          ? "支出"
          : "";
    return type ? rows.filter((row) => row.type === type) : rows;
  }
  function renderRecords(section, pageTitle) {
    const def = definitions[section];
    document.querySelector("#recordDescription").textContent = def.desc;
    document.querySelector("#tableHead").innerHTML =
      `<tr>${def.cols.map((key) => `<th>${labels[key] || key}</th>`).join("")}<th>操作</th></tr>`;
    const rows = recordsForCurrentPage();
    document.querySelector("#tableBody").innerHTML = rows.length
      ? rows
          .map(
            (row) =>
              `<tr>${def.cols.map((key) => `<td>${esc(row[key] ?? "")}</td>`).join("")}<td><div class="action-row"><button class="text-btn" data-edit="${row.id}">编辑</button><button class="text-btn danger" data-delete="${row.id}">删除</button></div></td></tr>`,
          )
          .join("")
      : `<tr><td colspan="${def.cols.length + 1}"><div class="empty">暂无${pageTitle || def.title}数据</div></td></tr>`;
  }
  function closeSidebar() {
    const sidebar = document.querySelector("#sidebar");
    sidebar.classList.remove("open");
    document.querySelector("#sidebarBackdrop").classList.remove("open");
    syncSidebarAccessibility(false);
  }
  function toggleSidebar() {
    const sidebar = document.querySelector("#sidebar"),
      isOpen = sidebar.classList.toggle("open");
    document.querySelector("#sidebarBackdrop").classList.toggle("open", isOpen);
    syncSidebarAccessibility(isOpen);
  }
  function syncSidebarAccessibility(isOpen) {
    const sidebar = document.querySelector("#sidebar"),
      mobile = window.matchMedia("(max-width: 720px)").matches;
    sidebar.inert = mobile && !isOpen;
    sidebar.toggleAttribute("aria-hidden", mobile && !isOpen);
    document
      .querySelector("#menuToggle")
      .setAttribute("aria-expanded", String(mobile && isOpen));
  }
  function show(section, pageTitle) {
    state.section = section;
    state.pageTitle =
      section === "dashboard"
        ? "班级总览"
        : section === "settings"
          ? "数据管理"
          : pageTitle || definitions[section].title;
    document
      .querySelectorAll(".page")
      .forEach((el) => el.classList.remove("active"));
    const dashboard = section === "dashboard",
      settings = section === "settings";
    const activePage = document.querySelector(
      dashboard ? "#dashboard" : settings ? "#settings" : "#records",
    );
    activePage.classList.add("active");
    document.querySelector("#pageName").textContent = state.pageTitle;
    document.querySelector("#pageCode").innerHTML = dashboard
      ? "DASHBOARD / OVERVIEW"
      : `<button class="breadcrumb-home" type="button">LOGBOOK</button> / ${settings ? "DATA" : section.toUpperCase()}`;
    if (dashboard) renderDashboard();
    if (!dashboard && !settings) renderRecords(section, state.pageTitle);
    nav();
    lucide.createIcons();
    closeSidebar();
    animatePage(activePage);
  }
  function openDialog(editId = null) {
    const def = definitions[state.section],
      row = editId
        ? (state.data[state.section] || []).find((x) => x.id === editId)
        : null,
      fixedFinanceType =
        state.section === "finance"
          ? state.pageTitle === "收入记录"
            ? "收入"
            : state.pageTitle === "支出记录"
              ? "支出"
              : ""
          : "";
    state.editId = editId;
    document.querySelector("#dialogTitle").textContent = row
      ? "编辑记录"
      : `新增${state.pageTitle || def.title}`;
    document.querySelector("#recordForm").innerHTML = `${def.fields
      .map(
        ([key, label, type, options]) =>
          `<div class="field"><label>${label}</label>${
            type === "select"
              ? `<select name="${key}" required><option value="">请选择</option>${options
                  .split(",")
                  .map(
                    (x) =>
                      `<option value="${x}" ${(row?.[key] || (key === "type" ? fixedFinanceType : "")) === x ? "selected" : ""}>${x}</option>`,
                  )
                  .join("")}</select>`
              : type === "textarea"
                ? `<textarea name="${key}" required>${esc(row?.[key] || "")}</textarea>`
                : `<input name="${key}" type="${type}" ${type === "number" ? 'min="0" step="0.1"' : ""} value="${esc(row?.[key] || (type === "date" ? today() : ""))}" required />`
          }</div>`,
      )
      .join(
        "",
      )}<div class="form-actions"><button class="secondary" value="cancel">取消</button><button class="primary" value="default">保存记录</button></div>`;
    document.querySelector("#recordDialog").showModal();
  }
  function submit(e) {
    e.preventDefault();
    const values = Object.fromEntries(new FormData(e.currentTarget));
    if (state.section === "finance" && state.pageTitle === "收入记录")
      values.type = "收入";
    if (state.section === "finance" && state.pageTitle === "支出记录")
      values.type = "支出";
    const records = state.data[state.section];
    if (state.editId) {
      const index = records.findIndex((x) => x.id === state.editId);
      records[index] = { ...records[index], ...values };
    } else records.push({ id: crypto.randomUUID(), ...values });
    save();
    document.querySelector("#recordDialog").close();
    show(state.section, state.pageTitle);
  }
  function download(content, type, name) {
    const blob = new Blob([content], { type }),
      link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = name;
    link.click();
    URL.revokeObjectURL(link.href);
  }
  function exportData() {
    download(
      JSON.stringify(state.data, null, 2),
      "application/json",
      `teacher-logbook-${today()}.json`,
    );
  }
  function exportCurrent() {
    const def = definitions[state.section],
      rows = recordsForCurrentPage(),
      header = def.cols.map((key) => labels[key] || key),
      escapeCsv = (value) => `"${String(value ?? "").replace(/"/g, '""')}"`;
    const content = [
      header,
      ...rows.map((row) => def.cols.map((key) => row[key])),
    ]
      .map((row) => row.map(escapeCsv).join(","))
      .join("\n");
    download(
      `\ufeff${content}`,
      "text/csv;charset=utf-8",
      `teacher-logbook-${state.section}-${today()}.csv`,
    );
  }
  function sortByDate(rows, key = "date") {
    return [...rows].sort((a, b) =>
      String(b[key] || "").localeCompare(String(a[key] || "")),
    );
  }
  function pageFilter(rows) {
    const title = state.pageTitle;
    if (state.section === "finance" && title === "收入记录")
      return rows.filter((row) => row.type === "收入");
    if (state.section === "finance" && title === "支出记录")
      return rows.filter((row) => row.type === "支出");
    const alertTypes = {
      学生情绪预警: "情绪预警",
      特殊体质预警: "特殊体质",
      辍学风险预警: "辍学风险",
      未返校: "未返校",
    };
    if (state.section === "alerts" && alertTypes[title])
      return rows.filter((row) => row.type === alertTypes[title]);
    if (state.section === "contacts" && title === "家庭访问")
      return rows.filter((row) => row.method === "家访");
    if (state.section === "contacts" && title === "家校联系")
      return rows.filter((row) => row.method !== "家访");
    const trainingTypes = {
      培训记录: "培训",
      讲座记录: "讲座",
      活动参与: "活动",
    };
    if (state.section === "training" && trainingTypes[title])
      return rows.filter((row) => row.category === trainingTypes[title]);
    return rows;
  }
  function recordsForCurrentPage() {
    return pageFilter(state.data[state.section] || []);
  }
  function isSummaryPage() {
    return [
      "收支总览",
      "作业统计看板",
      "违纪数据看板",
      "风险预警首页",
      "单次分析",
      "学时统计",
    ].includes(state.pageTitle);
  }
  function renderSummary(rows) {
    let cards = [];
    if (state.pageTitle === "收支总览") {
      const income = rows
          .filter((x) => x.type === "收入")
          .reduce((total, x) => total + (Number(x.amount) || 0), 0),
        expense = rows
          .filter((x) => x.type === "支出")
          .reduce((total, x) => total + (Number(x.amount) || 0), 0);
      cards = [
        ["收入总额", income.toFixed(2)],
        ["支出总额", expense.toFixed(2)],
        ["当前结余", (income - expense).toFixed(2)],
      ];
    } else if (state.pageTitle === "作业统计看板") {
      const outstanding = rows.reduce(
          (total, x) => total + (Number(x.unsubmitted) || 0),
          0,
        ),
        subjects = new Set(rows.map((x) => x.subject).filter(Boolean)).size;
      cards = [
        ["作业记录", rows.length],
        ["未交人次", outstanding],
        ["涉及学科", subjects],
      ];
    } else if (state.pageTitle === "违纪数据看板") {
      const students = new Set(rows.map((x) => x.student).filter(Boolean)).size;
      cards = [
        ["违纪记录", rows.length],
        ["涉及学生", students],
        ["本月记录", rows.filter((x) => x.date?.startsWith(month())).length],
      ];
    } else if (state.pageTitle === "风险预警首页") {
      const pending = rows.filter((x) => (x.status || "待处理") !== "已关闭");
      cards = [
        ["待处理预警", pending.length],
        ["高风险", pending.filter((x) => x.level === "高").length],
        ["已关闭", rows.filter((x) => x.status === "已关闭").length],
      ];
    } else if (state.pageTitle === "单次分析") {
      const latest = sortByDate(rows).at(0);
      cards = [
        ["最近考试", latest?.name || "暂无"],
        ["学科", latest?.subject || "暂无"],
        ["班级平均分", latest?.average ?? "暂无"],
      ];
    } else {
      const total = rows.reduce((sum, x) => sum + (Number(x.hours) || 0), 0);
      cards = [
        ["总学时", total],
        ["培训记录", rows.filter((x) => x.category === "培训").length],
        ["讲座/活动", rows.filter((x) => x.category !== "培训").length],
      ];
    }
    document.querySelector("#recordContent").innerHTML =
      `<div class="summary-grid">${cards.map(([label, value]) => `<article class="summary-card"><span>${label}</span><strong>${esc(value)}</strong></article>`).join("")}</div>`;
  }
  function tableValue(section, key, value) {
    if (section === "links" && key === "url" && /^https?:\/\//i.test(value)) {
      return `<a href="${esc(value)}" target="_blank" rel="noopener noreferrer">${esc(value)}</a>`;
    }
    return esc(value);
  }
  function renderRecords(section, pageTitle) {
    const def = definitions[section],
      rows = sortByDate(recordsForCurrentPage());
    document.querySelector("#recordDescription").textContent = def.desc;
    document.querySelector("#exportCurrent").hidden =
      pageTitle === "学生导入导出";
    document.querySelector("#addRecord").hidden =
      isSummaryPage() || pageTitle === "学生导入导出";
    if (pageTitle === "学生导入导出") {
      document.querySelector("#recordContent").innerHTML =
        '<section class="import-zone"><h3>导入或导出学生名册</h3><p>导入 UTF-8 编码 CSV，表头需包含：姓名、性别、联系方式。</p><div class="toolbar" style="justify-content:center"><button class="primary" id="chooseStudentImport"><i data-lucide="upload"></i>导入 CSV</button><button class="secondary" id="exportStudents"><i data-lucide="download"></i>导出学生 CSV</button></div></section>';
      lucide.createIcons();
      return;
    }
    if (isSummaryPage()) {
      renderSummary(state.data[section] || []);
      return;
    }
    document.querySelector("#recordContent").innerHTML =
      `<section class="panel"><div class="data-table-wrap"><table class="data-table"><thead id="tableHead"><tr>${def.cols.map((key) => `<th>${labels[key] || key}</th>`).join("")}<th>操作</th></tr></thead><tbody id="tableBody">${rows.length ? rows.map((row) => `<tr>${def.cols.map((key) => `<td>${tableValue(section, key, row[key] ?? "")}</td>`).join("")}<td><div class="action-row"><button class="text-btn" data-edit="${row.id}">编辑</button><button class="text-btn danger" data-delete="${row.id}">删除</button></div></td></tr>`).join("") : `<tr><td colspan="${def.cols.length + 1}"><div class="empty">暂无${pageTitle || def.title}数据</div></td></tr>`}</tbody></table></div></section>`;
  }
  function presetForPage(key) {
    if (key === "type" && state.section === "finance")
      return state.pageTitle === "收入记录"
        ? "收入"
        : state.pageTitle === "支出记录"
          ? "支出"
          : "";
    if (
      key === "method" &&
      state.section === "contacts" &&
      state.pageTitle === "家庭访问"
    )
      return "家访";
    if (key === "category" && state.section === "training")
      return (
        { 培训记录: "培训", 讲座记录: "讲座", 活动参与: "活动" }[
          state.pageTitle
        ] || ""
      );
    if (key === "status" && state.section === "alerts") return "待处理";
    return "";
  }
  function fieldMarkup([key, label, type, options], row) {
    const value = row?.[key] || presetForPage(key),
      fieldId = `record-${key}`;
    if (key === "student" && state.data.students.length) {
      return `<div class="field"><label for="${fieldId}">${label}</label><select id="${fieldId}" name="${key}" required><option value="">请选择学生</option>${state.data.students.map((student) => `<option value="${esc(student.name)}" ${value === student.name ? "selected" : ""}>${esc(student.name)}</option>`).join("")}</select></div>`;
    }
    if (type === "select")
      return `<div class="field"><label for="${fieldId}">${label}</label><select id="${fieldId}" name="${key}" required><option value="">请选择</option>${options
        .split(",")
        .map(
          (option) =>
            `<option value="${option}" ${value === option ? "selected" : ""}>${option}</option>`,
        )
        .join("")}</select></div>`;
    if (type === "textarea")
      return `<div class="field"><label for="${fieldId}">${label}</label><textarea id="${fieldId}" name="${key}" required>${esc(value)}</textarea></div>`;
    return `<div class="field"><label for="${fieldId}">${label}</label><input id="${fieldId}" name="${key}" type="${type}" ${type === "number" ? 'min="0" step="0.1"' : ""} value="${esc(value || (type === "date" ? today() : ""))}" required /></div>`;
  }
  function openDialog(editId = null) {
    const def = definitions[state.section],
      row = editId
        ? (state.data[state.section] || []).find((x) => x.id === editId)
        : null;
    state.editId = editId;
    document.querySelector("#dialogTitle").textContent = row
      ? "编辑记录"
      : `新增${state.pageTitle || def.title}`;
    document.querySelector("#recordForm").innerHTML =
      `${def.fields.map((field) => fieldMarkup(field, row)).join("")}<div class="form-actions"><button class="secondary" type="button" data-close-dialog>取消</button><button class="primary" type="submit">保存记录</button></div>`;
    document.querySelector("#recordDialog").showModal();
  }
  function submit(e) {
    e.preventDefault();
    const values = Object.fromEntries(new FormData(e.currentTarget));
    const records = state.data[state.section];
    if (state.editId) {
      const index = records.findIndex((x) => x.id === state.editId);
      records[index] = { ...records[index], ...values };
    } else records.push({ id: crypto.randomUUID(), ...values });
    save();
    document.querySelector("#recordDialog").close();
    show(state.section, state.pageTitle);
  }
  function renderDashboard() {
    const d = state.data,
      activeTodos = d.todos.filter((x) => x.status !== "已完成"),
      todayLeaves = d.leave.filter((x) => x.date === today()),
      unsubmitted = d.homework.reduce(
        (sum, x) => sum + (Number(x.unsubmitted) || 0),
        0,
      ),
      workThisMonth = d.work.filter((x) => x.date?.startsWith(month())).length,
      pendingAlerts = d.alerts.filter(
        (x) => (x.status || "待处理") !== "已关闭",
      ),
      risks = [
        [
          "EMOTION",
          "情绪预警",
          pendingAlerts.filter((x) => x.type === "情绪预警").length,
        ],
        [
          "SPECIAL HEALTH",
          "特殊体质",
          pendingAlerts.filter((x) => x.type === "特殊体质").length,
        ],
        [
          "DROPOUT RISK",
          "辍学风险",
          pendingAlerts.filter((x) => x.type === "辍学风险").length,
        ],
        [
          "NOT RETURNED",
          "未返校",
          pendingAlerts.filter((x) => x.type === "未返校").length,
        ],
        ["PENDING", "待处理预警", pendingAlerts.length],
      ];
    document.querySelector("#metrics").innerHTML = [
      metric(
        "TOTAL STUDENTS",
        d.students.length,
        `男 ${d.students.filter((x) => x.gender === "男").length} · 女 ${d.students.filter((x) => x.gender === "女").length}`,
      ),
      metric("LEAVE TODAY", todayLeaves.length, "今日请假人次"),
      metric("UNSUBMITTED", unsubmitted, "作业未交人次"),
      metric("VIOLATIONS", d.violations.length, "违纪记录总数"),
      metric("WORK RECORDS", workThisMonth, "本月工作记录"),
      metric("PENDING", activeTodos.length, "待办事项"),
    ].join("");
    document.querySelector("#risks").innerHTML = risks
      .map(
        ([en, cn, count]) =>
          `<article class="risk"><span>${en}</span><strong>${count}</strong><span>${cn}人数</span></article>`,
      )
      .join("");
    const high = pendingAlerts.filter((x) => x.level === "高");
    document.querySelector("#riskCount").textContent = `${high.length} 项`;
    document.querySelector("#riskList").innerHTML = high.length
      ? `<ul class="list">${high
          .slice(0, 4)
          .map(
            (x) =>
              `<li><span><strong>${esc(x.student)}</strong><br><small>${esc(x.note || x.type)}</small></span><span class="badge danger">${esc(x.type)}</span></li>`,
          )
          .join("")}</ul>`
      : '<div class="empty">暂无风险学生</div>';
    document.querySelector("#todoCount").textContent =
      `${activeTodos.length} 项`;
    document.querySelector("#todoList").innerHTML = activeTodos.length
      ? `<ul class="list">${activeTodos
          .slice(-4)
          .map(
            (x) =>
              `<li><span><strong>${esc(x.title)}</strong><br><small>截止：${esc(x.due || "未设置")}</small></span><button class="text-btn" data-done="${x.id}">完成</button></li>`,
          )
          .join("")}</ul>`
      : '<div class="empty">暂无跟进事项</div>';
    const latestExam = sortByDate(d.exams).at(0);
    document.querySelector("#examSummary").innerHTML = latestExam
      ? `<strong>${esc(latestExam.subject)} · ${esc(latestExam.name)}</strong><div class="metric-value" style="margin-top:12px">${esc(latestExam.average)}</div><small>班级平均分 · ${esc(latestExam.date || "未记录日期")}</small>`
      : '<div class="empty">暂无考试数据</div>';
    const recentWork = sortByDate(d.work);
    document.querySelector("#workList").innerHTML = recentWork.length
      ? `<ul class="list">${recentWork
          .slice(0, 3)
          .map(
            (x) =>
              `<li><span>${esc(x.title)}</span><small>${esc(x.date || "")}</small></li>`,
          )
          .join("")}</ul>`
      : '<div class="empty">暂无工作记录</div>';
  }
  function importStudents(file) {
    const reader = new FileReader();
    reader.onload = async () => {
      const rows = parseCsv(reader.result),
        header = rows.shift()?.map((value) => value.trim()) || [],
        nameIndex = header.findIndex((value) =>
          ["姓名", "学生姓名", "name"].includes(value),
        ),
        genderIndex = header.findIndex((value) =>
          ["性别", "gender"].includes(value),
        ),
        contactIndex = header.findIndex((value) =>
          ["联系方式", "家长联系方式", "contact"].includes(value),
        );
      if (nameIndex < 0) {
        alert("CSV 表头必须包含“姓名”或“学生姓名”。");
        return;
      }
      const additions = rows
        .map((cells) => cells.map((value) => value.trim()))
        .filter((cells) => cells[nameIndex])
        .map((cells) => ({
          id: crypto.randomUUID(),
          name: cells[nameIndex],
          gender: cells[genderIndex] || "",
          contact: cells[contactIndex] || "",
        }));
      const known = new Set(
        state.data.students.map(
          (student) => `${student.name}\u0000${student.gender}\u0000${student.contact}`,
        ),
      );
      const imported = additions.filter(
        (student) =>
          !known.has(`${student.name}\u0000${student.gender}\u0000${student.contact}`),
      );
      state.data.students.push(...imported);
      save();
      alert(
        `成功导入 ${imported.length} 名学生，跳过 ${additions.length - imported.length} 名重复学生。`,
      );
      show("students", "学生花名册");
    };
    reader.readAsText(file, "UTF-8");
  }
  function importBackup(file) {
    const reader = new FileReader();
    reader.onload = async () => {
      try {
        const backup = JSON.parse(String(reader.result));
        if (
          !backup ||
          typeof backup !== "object" ||
          Array.isArray(backup) ||
          !Array.isArray(backup.students)
        ) {
          throw new Error("invalid");
        }
        if (!confirm("导入会覆盖本设备当前全部台账数据，确定继续吗？")) return;
        state.data = await teacherLogbookServer.replaceLogbook(backup);
        show("dashboard");
        alert("台账备份已恢复。");
      } catch {
        alert("导入失败：请选择 Teacher Logbook 导出的有效 JSON 备份文件。");
      }
    };
    reader.readAsText(file, "UTF-8");
  }
  function dashboardLink(section, title, content, className = "") {
    return `<article class="${className} dashboard-link" data-dashboard-section="${section}" data-dashboard-title="${title}" tabindex="0" role="link">${content}</article>`;
  }
  function dashboardMetric(label, value, note, section, title) {
    return dashboardLink(
      section,
      title,
      `<div class="metric-label">${label}</div><div class="metric-value">${value}</div><div class="metric-note">${note}</div>`,
      "metric",
    );
  }
  function renderDashboard() {
    const d = state.data,
      activeTodos = d.todos.filter((item) => item.status !== "已完成"),
      todayLeaves = d.leave.filter((item) => item.date === today()),
      unsubmitted = d.homework.reduce(
        (total, item) => total + (Number(item.unsubmitted) || 0),
        0,
      ),
      workThisMonth = d.work.filter((item) =>
        item.date?.startsWith(month()),
      ).length,
      pendingAlerts = d.alerts.filter(
        (item) => (item.status || "待处理") !== "已关闭",
      ),
      riskCards = [
        [
          "EMOTION",
          "情绪预警",
          pendingAlerts.filter((item) => item.type === "情绪预警").length,
          "学生情绪预警",
        ],
        [
          "SPECIAL HEALTH",
          "特殊体质",
          pendingAlerts.filter((item) => item.type === "特殊体质").length,
          "特殊体质预警",
        ],
        [
          "DROPOUT RISK",
          "辍学风险",
          pendingAlerts.filter((item) => item.type === "辍学风险").length,
          "辍学风险预警",
        ],
        [
          "NOT RETURNED",
          "未返校",
          pendingAlerts.filter((item) => item.type === "未返校").length,
          "未返校",
        ],
        ["PENDING", "待处理预警", pendingAlerts.length, "风险预警首页"],
      ];
    document.querySelector("#metrics").innerHTML = [
      dashboardMetric(
        "TOTAL STUDENTS",
        d.students.length,
        `男 ${d.students.filter((item) => item.gender === "男").length} · 女 ${d.students.filter((item) => item.gender === "女").length}`,
        "students",
        "学生花名册",
      ),
      dashboardMetric(
        "LEAVE TODAY",
        todayLeaves.length,
        "今日请假人次",
        "leave",
        "请假管理",
      ),
      dashboardMetric(
        "UNSUBMITTED",
        unsubmitted,
        "作业未交人次",
        "homework",
        "作业列表",
      ),
      dashboardMetric(
        "VIOLATIONS",
        d.violations.length,
        "违纪记录总数",
        "violations",
        "违纪记录明细",
      ),
      dashboardMetric(
        "WORK RECORDS",
        workThisMonth,
        "本月工作记录",
        "work",
        "工作简报",
      ),
      dashboardMetric(
        "PENDING",
        activeTodos.length,
        "待办事项",
        "todos",
        "待办 & 备忘录",
      ),
    ].join("");
    document.querySelector("#risks").innerHTML = riskCards
      .map(([en, label, count, title]) =>
        dashboardLink(
          "alerts",
          title,
          `<span>${en}</span><strong>${count}</strong><span>${label}人数</span>`,
          "risk",
        ),
      )
      .join("");
    const high = pendingAlerts.filter((item) => item.level === "高");
    document.querySelector("#riskCount").textContent = `${high.length} 项`;
    document
      .querySelector("#riskList")
      .parentElement.parentElement.classList.add("dashboard-link");
    document.querySelector(
      "#riskList",
    ).parentElement.parentElement.dataset.dashboardSection = "alerts";
    document.querySelector(
      "#riskList",
    ).parentElement.parentElement.dataset.dashboardTitle = "风险预警首页";
    document.querySelector("#riskList").innerHTML = high.length
      ? `<ul class="list">${high
          .slice(0, 4)
          .map(
            (item) =>
              `<li><span><strong>${esc(item.student)}</strong><br><small>${esc(item.note || item.type)}</small></span><span class="badge danger">${esc(item.type)}</span></li>`,
          )
          .join("")}</ul>`
      : '<div class="empty">暂无风险学生</div>';
    document.querySelector("#todoCount").textContent =
      `${activeTodos.length} 项`;
    document.querySelector("#todoList").innerHTML = activeTodos.length
      ? `<ul class="list">${activeTodos
          .slice(0, 4)
          .map(
            (item) =>
              `<li><span><strong>${esc(item.title)}</strong><br><small>截止：${esc(item.due || "未设置")}</small></span><button class="text-btn" data-done="${item.id}">完成</button></li>`,
          )
          .join("")}</ul>`
      : '<div class="empty">暂无跟进事项</div>';
    const latestExam = sortByDate(d.exams).at(0),
      examPanel =
        document.querySelector("#examSummary").parentElement.parentElement,
      workPanel =
        document.querySelector("#workList").parentElement.parentElement;
    examPanel.classList.add("dashboard-link");
    examPanel.dataset.dashboardSection = "exams";
    examPanel.dataset.dashboardTitle = "成绩分析";
    workPanel.classList.add("dashboard-link");
    workPanel.dataset.dashboardSection = "work";
    workPanel.dataset.dashboardTitle = "工作简报";
    document.querySelector("#examSummary").innerHTML = latestExam
      ? `<strong>${esc(latestExam.subject)} · ${esc(latestExam.name)}</strong><div class="metric-value" style="margin-top:12px">${esc(latestExam.average)}</div><small>班级平均分 · ${esc(latestExam.date || "未记录日期")}</small>`
      : '<div class="empty">暂无考试数据</div>';
    const recentWork = sortByDate(d.work);
    document.querySelector("#workList").innerHTML = recentWork.length
      ? `<ul class="list">${recentWork
          .slice(0, 3)
          .map(
            (item) =>
              `<li><span>${esc(item.title)}</span><small>${esc(item.date || "")}</small></li>`,
          )
          .join("")}</ul>`
      : '<div class="empty">暂无工作记录</div>';
  }
  function exportStudents() {
    const content = [
      "姓名,性别,联系方式",
      ...state.data.students.map((student) =>
        [student.name, student.gender, student.contact]
          .map((value) => `"${String(value || "").replace(/"/g, '""')}"`)
          .join(","),
      ),
    ].join("\n");
    download(
      `\ufeff${content}`,
      "text/csv;charset=utf-8",
      `teacher-logbook-students-${today()}.csv`,
    );
  }
  const baseRenderDashboard = renderDashboard;
  renderDashboard = function () {
    baseRenderDashboard();
    const bindings = [
      ["#riskList", "alerts", "风险预警首页"],
      ["#examSummary", "exams", "成绩分析"],
      ["#workList", "work", "工作简报"],
    ];
    bindings.forEach(([selector, section, title]) => {
      const content = document.querySelector(selector),
        panel = content.parentElement;
      panel.parentElement.removeAttribute("data-dashboard-section");
      panel.parentElement.removeAttribute("data-dashboard-title");
      panel.classList.add("dashboard-link");
      panel.dataset.dashboardSection = section;
      panel.dataset.dashboardTitle = title;
      panel.tabIndex = 0;
      panel.setAttribute("role", "link");
    });
  };
  function normalizeCourse(record) {
    return normalizeCourseRecord(record);
  }
  function renderCoursePreview() {
    const records = state.data.courses.map(normalizeCourse),
      preferredDays = ["周一", "周二", "周三", "周四", "周五", "周六", "周日"],
      days = [...new Set(records.map((record) => record.day))].sort((a, b) => {
        const delta = preferredDays.indexOf(a) - preferredDays.indexOf(b);
        return delta || a.localeCompare(b, "zh-CN");
      }),
      slots = [...new Set(records.map((record) => record.time))].sort((a, b) =>
        a.localeCompare(b, "zh-CN"),
      );
    const content = document.querySelector("#recordContent");
    if (!records.length) {
      content.innerHTML =
        '<section class="panel"><div class="empty">暂无课程数据，新增课程后将在此生成预览。</div></section>';
      return;
    }
    content.innerHTML = `<div class="schedule-wrap"><div class="schedule" style="--days:${days.length}"><div>上课时间</div>${days.map((day) => `<div>${esc(day)}</div>`).join("")}${slots
      .map(
        (slot) =>
          `<div class="schedule-slot">${esc(slot)}</div>${days
            .map(
              (day) =>
                `<div>${records
                  .filter(
                    (record) => record.day === day && record.time === slot,
                  )
                  .map(
                    (record) =>
                      `<div class="schedule-class"><strong>${esc(record.course)}</strong><small>${esc(record.teacher || "未设置教师")}</small></div>`,
                  )
                  .join("")}</div>`,
            )
            .join("")}`,
      )
      .join("")}</div></div>`;
  }
  const baseRenderRecords = renderRecords;
  renderRecords = function (section, pageTitle) {
    baseRenderRecords(section, pageTitle);
    if (section !== "courses") return;
    state.courseView = state.courseView || "list";
    const toolbar = document.querySelector("#records .view-head .toolbar");
    const switcher = document.createElement("div");
    switcher.className = "view-switch";
    switcher.id = "courseViewSwitch";
    switcher.innerHTML = `<button data-course-view="list" class="${state.courseView === "list" ? "active" : ""}"><i data-lucide="list"></i>列表</button><button data-course-view="preview" class="${state.courseView === "preview" ? "active" : ""}"><i data-lucide="calendar-days"></i>预览</button>`;
    toolbar.prepend(switcher);
    if (state.courseView === "preview") renderCoursePreview();
    lucide.createIcons();
  };
  const courseViewRenderRecords = renderRecords;
  renderRecords = function (section, pageTitle) {
    if (section !== "courses")
      document.querySelector("#courseViewSwitch")?.remove();
    courseViewRenderRecords(section, pageTitle);
  };
  function parseCourseTime(value = "") {
    const matched = String(value).match(
      /(\d{1,2})\s*[:：]\s*(\d{1,2})\s*(?:-|~|至|到)\s*(\d{1,2})\s*[:：]\s*(\d{1,2})/,
    );
    if (!matched)
      return { startHour: "", startMinute: "", endHour: "", endMinute: "" };
    return {
      startHour: matched[1].padStart(2, "0"),
      startMinute: matched[2].padStart(2, "0"),
      endHour: matched[3].padStart(2, "0"),
      endMinute: matched[4].padStart(2, "0"),
    };
  }
  function courseStartMinutes(value) {
    const { startHour, startMinute } = parseCourseTime(value);
    return Number(startHour) * 60 + Number(startMinute);
  }
  const baseNormalizeCourse = normalizeCourse;
  normalizeCourse = function (record) {
    const normalized = baseNormalizeCourse(record);
    return { ...normalized, time: normalized.time.replace(/\s+/g, "") };
  };
  renderCoursePreview = function () {
    const selected = state.courseSubject || "",
      records = (state.data.courses || [])
        .map(normalizeCourse)
        .filter((record) => !selected || record.course === selected),
      preferredDays = ["周一", "周二", "周三", "周四", "周五", "周六", "周日"],
      days = [...new Set(records.map((record) => record.day))].sort((a, b) => {
        const delta = preferredDays.indexOf(a) - preferredDays.indexOf(b);
        return delta || a.localeCompare(b, "zh-CN");
      }),
      slots = [...new Set(records.map((record) => record.time))].sort(
        (a, b) =>
          courseStartMinutes(a) - courseStartMinutes(b) ||
          a.localeCompare(b, "zh-CN"),
      ),
      content = document.querySelector("#recordContent");
    if (!records.length) {
      content.innerHTML =
        '<section class="panel"><div class="empty">暂无课程数据，新增课程后将在此生成预览。</div></section>';
      return;
    }
    content.innerHTML = `<div class="schedule-wrap"><div class="schedule" style="--days:${days.length}"><div>上课时间</div>${days.map((day) => `<div>${esc(day)}</div>`).join("")}${slots
      .map(
        (slot) =>
          `<div class="schedule-slot">${esc(slot)}</div>${days
            .map(
              (day) =>
                `<div>${records
                  .filter(
                    (record) => record.day === day && record.time === slot,
                  )
                  .map(
                    (record) =>
                      `<button type="button" class="schedule-class" data-edit="${record.id}" aria-label="编辑 ${esc(record.course)}"><strong>${esc(record.course)}</strong><small>${esc(record.teacher || "未设置教师")}</small></button>`,
                  )
                  .join("")}</div>`,
            )
            .join("")}`,
      )
      .join("")}</div></div>`;
  };
  const baseOpenDialog = openDialog;
  openDialog = function (editId = null) {
    if (state.section !== "courses") return baseOpenDialog(editId);
    const row = editId
        ? (state.data.courses || []).find((record) => record.id === editId)
        : null,
      normalizedRow = row ? normalizeCourse(row) : null,
      time = parseCourseTime(normalizedRow?.time);
    state.editId = editId;
    document.querySelector("#dialogTitle").textContent = row
      ? "编辑课程"
      : "新增课程";
    document.querySelector("#recordForm").innerHTML =
      `<div class="field"><label>课程名称</label><input name="course" type="text" value="${esc(row?.course || "")}" required /></div><div class="field"><label>任课教师</label><input name="teacher" type="text" value="${esc(row?.teacher || "")}" required /></div><div class="field"><label>上课日期/星期</label><select name="day" required><option value="">请选择</option>${"周一,周二,周三,周四,周五,周六,周日"
        .split(",")
        .map(
          (day) =>
            `<option value="${day}" ${normalizedRow?.day === day ? "selected" : ""}>${day}</option>`,
        )
        .join(
          "",
        )}</select></div><div class="field"><label>上课时间段</label><div class="time-range"><div class="time-part"><input name="startHour" type="number" min="0" max="23" placeholder="时" value="${time.startHour}" required /><input name="startMinute" type="number" min="0" max="59" placeholder="分" value="${time.startMinute}" required /></div><span class="time-separator">至</span><div class="time-part"><input name="endHour" type="number" min="0" max="23" placeholder="时" value="${time.endHour}" required /><input name="endMinute" type="number" min="0" max="59" placeholder="分" value="${time.endMinute}" required /></div></div></div><div class="form-actions"><button class="secondary" type="button" data-close-dialog>取消</button><button class="primary" type="submit">保存课程</button></div>`;
    const courseForm = document.querySelector("#recordForm");
    ["course", "teacher", "day", "startHour"].forEach((name) => {
      const control = courseForm.elements.namedItem(name),
        label = control.closest(".field")?.querySelector("label");
      control.id = `record-${name}`;
      if (label) label.htmlFor = control.id;
    });
    courseForm.elements.startMinute.setAttribute("aria-label", "开始分钟");
    courseForm.elements.endHour.setAttribute("aria-label", "结束小时");
    courseForm.elements.endMinute.setAttribute("aria-label", "结束分钟");
    document.querySelector("#recordDialog").showModal();
  };
  const baseSubmit = submit;
  submit = function (event) {
    if (state.section !== "courses") return baseSubmit(event);
    event.preventDefault();
    const values = Object.fromEntries(new FormData(event.currentTarget)),
      numbers = ["startHour", "startMinute", "endHour", "endMinute"].map(
        (key) => Number(values[key]),
      );
    if (
      numbers.some((value) => !Number.isInteger(value)) ||
      numbers[0] > 23 ||
      numbers[2] > 23 ||
      numbers[1] > 59 ||
      numbers[3] > 59 ||
      numbers[0] * 60 + numbers[1] >= numbers[2] * 60 + numbers[3]
    ) {
      alert("请填写有效的开始和结束时分，结束时间必须晚于开始时间。");
      return;
    }
    const record = {
        id: state.editId || crypto.randomUUID(),
        course: values.course,
        teacher: values.teacher,
        day: values.day,
        time: `${String(numbers[0]).padStart(2, "0")}:${String(numbers[1]).padStart(2, "0")}-${String(numbers[2]).padStart(2, "0")}:${String(numbers[3]).padStart(2, "0")}`,
      },
      index = state.data.courses.findIndex((item) => item.id === state.editId);
    if (index >= 0) state.data.courses[index] = record;
    else state.data.courses.push(record);
    save();
    document.querySelector("#recordDialog").close();
    renderRecords("courses", "我的课程表");
  };
  const baseCourseRender = renderRecords;
  renderRecords = function (section, pageTitle) {
    baseCourseRender(section, pageTitle);
    if (section !== "courses") return;
    const toolbar = document.querySelector("#records .view-head .toolbar"),
      courses = state.data.courses || [],
      selected = state.courseSubject || "";
    toolbar.querySelector("#courseSubjectFilter")?.remove();
    const filter = document.createElement("select");
    filter.id = "courseSubjectFilter";
    filter.className = "course-filter";
    filter.innerHTML = `<option value="">全部科目</option>${[
      ...new Set(courses.map((record) => record.course).filter(Boolean)),
    ]
      .sort((a, b) => a.localeCompare(b, "zh-CN"))
      .map(
        (course) =>
          `<option value="${esc(course)}" ${selected === course ? "selected" : ""}>${esc(course)}</option>`,
      )
      .join("")}`;
    toolbar.prepend(filter);
    if (state.courseView === "list" && selected) {
      document.querySelectorAll("#tableBody tr").forEach((row) => {
        if (!row.querySelector("td")) return;
        row.hidden = row.firstElementChild.textContent !== selected;
      });
    }
  };
  function committeeDuty(role) {
    return (
      (state.data.committeeRoles || []).find((item) => item.role === role)
        ?.duty || "未设置职责说明"
    );
  }
  function migrateCommitteeRoles() {
    let changed = false;
    state.data.committeeRoles = state.data.committeeRoles || [];
    (state.data.classCommittee || []).forEach((member) => {
      if (
        member.role &&
        member.duty &&
        !state.data.committeeRoles.some((item) => item.role === member.role)
      ) {
        state.data.committeeRoles.push({
          id: crypto.randomUUID(),
          role: member.role,
          duty: member.duty,
        });
        changed = true;
      }
    });
    if (changed) save();
  }
  const committeeRenderRecords = renderRecords;
  renderRecords = function (section, pageTitle) {
    const toolbar = document.querySelector("#records .view-head .toolbar");
    toolbar.querySelector("#courseViewSwitch")?.remove();
    toolbar.querySelector("#courseSubjectFilter")?.remove();
    if (section !== "classCommittee")
      return committeeRenderRecords(section, pageTitle);
    const rows = state.data.classCommittee || [],
      def = definitions.classCommittee;
    document.querySelector("#recordDescription").textContent = def.desc;
    document.querySelector("#exportCurrent").hidden = false;
    document.querySelector("#addRecord").hidden = false;
    document.querySelector("#recordContent").innerHTML =
      `<section class="panel"><div class="data-table-wrap"><table class="data-table"><thead><tr>${def.cols.map((key) => `<th>${labels[key]}</th>`).join("")}<th>操作</th></tr></thead><tbody>${rows.length ? rows.map((row) => `<tr><td>${esc(row.student || "")}</td><td>${esc(row.role || "")}</td><td>${esc(committeeDuty(row.role))}</td><td><div class="action-row"><button class="text-btn" data-edit="${row.id}">编辑</button><button class="text-btn danger" data-delete="${row.id}">删除</button></div></td></tr>`).join("") : `<tr><td colspan="4"><div class="empty">暂无班委数据，请先在职位管理中维护职位。</div></td></tr>`}</tbody></table></div></section>`;
  };
  const committeeAndSeatRenderRecords = renderRecords;
  renderRecords = function (section, pageTitle) {
    if (section !== "seats") return committeeAndSeatRenderRecords(section, pageTitle);
    document.querySelector("#recordDescription").textContent =
      "从学生花名册选择学生，在可调整尺寸的互动座位板中进行排座。";
    document.querySelector("#exportCurrent").hidden = true;
    document.querySelector("#addRecord").hidden = true;
    const content = document.querySelector("#recordContent");
    content.innerHTML = '<div class="seat-board-loading" role="status">正在加载座位板...</div>';
    renderSeatBoard(content, state.data, save).catch((error) => {
      console.error("座位板初始化失败：", error);
      if (content.isConnected)
        content.innerHTML = '<div class="seat-board-error" role="alert">座位板初始化失败，请刷新页面后重试。</div>';
    });
  };
  const committeeOpenDialog = openDialog;
  openDialog = function (editId = null) {
    if (state.section !== "classCommittee") return committeeOpenDialog(editId);
    const row = editId
        ? (state.data.classCommittee || []).find((item) => item.id === editId)
        : null,
      roles = state.data.committeeRoles || [];
    if (!roles.length) {
      alert("请先在“职位管理”中新增职位和职责说明。");
      show("committeeRoles", "职位管理");
      return;
    }
    state.editId = editId;
    document.querySelector("#dialogTitle").textContent = row
      ? "编辑班委"
      : "新增班委";
    const studentValue = row?.student || "",
      studentField = state.data.students.length
        ? `<select name="student" required><option value="">请选择学生</option>${state.data.students.map((student) => `<option value="${esc(student.name)}" ${studentValue === student.name ? "selected" : ""}>${esc(student.name)}</option>`).join("")}</select>`
        : `<input name="student" type="text" value="${esc(studentValue)}" required />`;
    document.querySelector("#recordForm").innerHTML =
      `<div class="field"><label>学生姓名</label>${studentField}</div><div class="field"><label>职位</label><select name="role" required><option value="">请选择职位</option>${roles.map((item) => `<option value="${esc(item.role)}" ${row?.role === item.role ? "selected" : ""}>${esc(item.role)}</option>`).join("")}</select></div><div class="field"><label>职责说明</label><textarea id="committeeDutyPreview" readonly>${esc(committeeDuty(row?.role))}</textarea></div><div class="form-actions"><button class="secondary" type="button" data-close-dialog>取消</button><button class="primary" type="submit">保存班委</button></div>`;
    document.querySelector("#recordDialog").showModal();
  };
  const committeeSubmit = submit;
  submit = function (event) {
    if (state.section !== "classCommittee") return committeeSubmit(event);
    event.preventDefault();
    const values = Object.fromEntries(new FormData(event.currentTarget)),
      records = state.data.classCommittee || [];
    if (state.editId) {
      const index = records.findIndex((item) => item.id === state.editId);
      records[index] = {
        ...records[index],
        student: values.student,
        role: values.role,
      };
    } else
      records.push({
        id: crypto.randomUUID(),
        student: values.student,
        role: values.role,
      });
    state.data.classCommittee = records;
    save();
    document.querySelector("#recordDialog").close();
    show("classCommittee", "班委名单");
  };
  document.addEventListener("click", (e) => {
    if (e.target.closest("[data-close-dialog]")) {
      document.querySelector("#recordDialog").close();
      return;
    }
    if (e.target.closest("#chooseStudentImport"))
      document.querySelector("#studentImport").click();
    if (e.target.closest("#exportStudents")) exportStudents();
  });
  document.addEventListener("click", (e) => {
    const view = e.target.closest("[data-course-view]")?.dataset.courseView;
    if (view) {
      state.courseView = view;
      renderRecords("courses", "我的课程表");
    }
  });
  document.addEventListener("change", (e) => {
    if (e.target.id === "courseSubjectFilter") {
      state.courseSubject = e.target.value;
      renderRecords("courses", "我的课程表");
    }
  });
  document.addEventListener("change", (e) => {
    if (e.target.name === "role" && state.section === "classCommittee") {
      document.querySelector("#committeeDutyPreview").value = committeeDuty(
        e.target.value,
      );
    }
  });
  document.querySelector("#skinToggle").addEventListener("click", () => {
    const menu = document.querySelector("#skinMenu"),
      open = menu.hidden;
    menu.hidden = !open;
    document
      .querySelector("#skinToggle")
      .setAttribute("aria-expanded", String(open));
  });
  document.addEventListener("click", (event) => {
    const option = event.target.closest("[data-ui-skin]");
    if (option) {
      selectSkin(option.dataset.uiSkin);
      document.querySelector("#skinMenu").hidden = true;
      document
        .querySelector("#skinToggle")
        .setAttribute("aria-expanded", "false");
      return;
    }
    if (!event.target.closest(".skin-picker")) {
      document.querySelector("#skinMenu").hidden = true;
      document
        .querySelector("#skinToggle")
        .setAttribute("aria-expanded", "false");
    }
  });
  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape") {
      document.querySelector("#skinMenu").hidden = true;
      document
        .querySelector("#skinToggle")
        .setAttribute("aria-expanded", "false");
    }
  });
  document.addEventListener("click", (e) => {
    const target = e.target.closest("[data-dashboard-section]");
    if (target && !e.target.closest("[data-done]"))
      show(target.dataset.dashboardSection, target.dataset.dashboardTitle);
  });
  document.addEventListener("keydown", (e) => {
    const target = e.target.closest("[data-dashboard-section]");
    if (target && (e.key === "Enter" || e.key === " ")) {
      e.preventDefault();
      show(target.dataset.dashboardSection, target.dataset.dashboardTitle);
    }
  });
  document
    .querySelector("#studentImport")
    .addEventListener("change", (event) => {
      const file = event.target.files[0];
      if (file) importStudents(file);
      event.target.value = "";
    });
  document
    .querySelector("#backupImport")
    .addEventListener("change", (event) => {
      const file = event.target.files[0];
      if (file) importBackup(file);
      event.target.value = "";
    });
  document.addEventListener("click", (e) => {
    const navTarget = e.target.closest("[data-nav]"),
      navId = navTarget?.dataset.nav,
      navTitle = navTarget?.dataset.title,
      menuId = navTarget?.dataset.menu,
      quick = e.target.closest("[data-quick]")?.dataset.quick,
      edit = e.target.closest("[data-edit]")?.dataset.edit,
      del = e.target.closest("[data-delete]")?.dataset.delete,
      done = e.target.closest("[data-done]")?.dataset.done;
    if (navId) {
      if (menuId) {
        const isOpen = state.openMenus.has(menuId);
        if (isOpen) {
          state.openMenus.delete(menuId);
          nav();
          lucide.createIcons();
        } else {
          const parentItem = navigation
            .flatMap((group) => group.items)
            .find((item) => item.id === navId);
          const isCurrentChildPage = parentItem.children.some(
            ([childTitle, , childSection]) =>
              state.section === (childSection || navId) &&
              state.pageTitle === childTitle,
          );
          state.openMenus.add(menuId);
          if (isCurrentChildPage) {
            nav();
            lucide.createIcons();
            animateOpenedMenu(menuId);
          } else {
            show(navId, navTitle);
            animateOpenedMenu(menuId);
          }
        }
      } else {
        show(navId, navTitle);
      }
    }
    if (quick) {
      show(quick);
      openDialog();
    }
    if (edit) openDialog(edit);
    if (del && confirm("确定删除这条记录吗？")) {
      state.data[state.section] = state.data[state.section].filter(
        (x) => x.id !== del,
      );
      if (state.section === "students") {
        state.data.seatBoard.placements = state.data.seatBoard.placements.filter(
          (placement) => placement.studentId !== del,
        );
      }
      save();
      show(state.section, state.pageTitle);
    }
    if (done) {
      const record = state.data.todos.find((x) => x.id === done);
      record.status = "已完成";
      save();
      renderDashboard();
    }
  });
  document
    .querySelector("#addRecord")
    .addEventListener("click", () => openDialog());
  document
    .querySelector("#exportCurrent")
    .addEventListener("click", exportCurrent);
  document.querySelector("#recordForm").addEventListener("submit", submit);
  document
    .querySelector("#closeDialog")
    .addEventListener("click", () =>
      document.querySelector("#recordDialog").close(),
    );
  document
    .querySelector("#menuToggle")
    .addEventListener("click", toggleSidebar);
  document
    .querySelector("#sidebarBackdrop")
    .addEventListener("click", closeSidebar);
  window.addEventListener("resize", () =>
    syncSidebarAccessibility(
      document.querySelector("#sidebar").classList.contains("open"),
    ),
  );
  document.querySelector("#pageCode").addEventListener("click", (event) => {
    if (event.target.closest(".breadcrumb-home")) show("dashboard");
  });
  document
    .querySelector("#openSettings")
    .addEventListener("click", () => show("settings", "数据管理"));
  document
    .querySelector("#exportSettings")
    .addEventListener("click", exportData);
  document
    .querySelector("#importBackup")
    .addEventListener("click", () =>
      document.querySelector("#backupImport").click(),
    );
  document.querySelector("#clearData").addEventListener("click", async () => {
    if (confirm("确定清空所有本地台账数据吗？")) {
      state.data = await teacherLogbookServer.clearLogbook();
      show("dashboard");
    }
  });
  function wait(milliseconds) {
    return new Promise((resolve) => window.setTimeout(resolve, milliseconds));
  }
  async function hideStartupLoader(startedAt) {
    await wait(Math.max(0, 1000 - (performance.now() - startedAt)));
    const loader = document.querySelector("#startupLoader");
    loader.classList.add("is-ready");
    await wait(260);
    loader.remove();
  }
  async function boot() {
    const startedAt = performance.now();
    try {
      state.data = await teacherLogbookServer.loadLogbook();
      migrateCommitteeRoles();
      try {
        await applySkin(await teacherLogbookServer.getSkin("mr"));
      } catch {}
      show("dashboard");
    } finally {
      await hideStartupLoader(startedAt);
    }
  }
  boot().catch(() => alert("台账数据加载失败，请稍后重试。"));
})();
