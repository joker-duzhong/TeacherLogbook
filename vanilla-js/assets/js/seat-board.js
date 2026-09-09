let templatePromise;

const seatSymbolsMarkup = `<svg class="seat-symbols" aria-hidden="true"><defs><symbol id="seatDeskIllustration" viewBox="0 0 72 64"><ellipse cx="36" cy="57" rx="25" ry="4" fill="var(--seat-shadow)"/><rect x="19" y="37" width="34" height="20" rx="7" fill="var(--seat-chair)"/><rect x="23" y="40" width="26" height="12" rx="4" fill="var(--seat-chair-detail)"/><path d="M14 34v17M58 34v17" stroke="var(--seat-frame)" stroke-width="5" stroke-linecap="round"/><rect x="4" y="4" width="64" height="38" rx="8" fill="var(--seat-edge)"/><rect x="7" y="7" width="58" height="31" rx="6" fill="var(--seat-surface)"/><path d="M12 13h48" stroke="var(--seat-highlight)" stroke-width="3" stroke-linecap="round" opacity=".72"/></symbol><symbol id="seatPodiumIllustration" viewBox="0 0 220 72"><ellipse cx="110" cy="66" rx="91" ry="5" fill="var(--seat-shadow)"/><rect x="12" y="12" width="196" height="48" rx="9" fill="var(--seat-edge)"/><rect x="17" y="8" width="186" height="43" rx="8" fill="var(--seat-surface)"/><path d="M28 18h164" stroke="var(--seat-highlight)" stroke-width="4" stroke-linecap="round" opacity=".72"/></symbol></defs></svg>`;

function loadTemplate() {
  templatePromise ||= fetch("components/seat-board.html").then((response) => {
    if (!response.ok) throw new Error("座位板组件加载失败");
    return response.text();
  });
  return templatePromise;
}

function studentLabel(student, duplicateNames) {
  if (!duplicateNames.has(student.name)) return student.name;
  const contact = String(student.contact || "").trim();
  return `${student.name} (${contact ? contact.slice(-4) : student.id.slice(0, 4)})`;
}

function escapeHtml(value = "") {
  return String(value).replace(
    /[&<>"']/g,
    (character) =>
      ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#039;" })[
        character
      ],
  );
}

function legacyColumnGroups(columns) {
  return Array.from({ length: Math.ceil(columns / 2) }, (_, index) =>
    Math.min(2, columns - index * 2),
  );
}

export function ensureSeatBoardState(data) {
  const source =
      data.seatBoard && typeof data.seatBoard === "object"
        ? data.seatBoard
        : {},
    rows = Number(source.rows),
    legacyColumns = Number(source.columns),
    fallbackColumns =
      Number.isInteger(legacyColumns) && legacyColumns >= 1 && legacyColumns <= 30
        ? legacyColumns
        : 30,
    groups = Array.isArray(source.columnGroups)
      ? source.columnGroups.map(Number)
      : [],
    validGroups =
      groups.length > 0 &&
      groups.every(
        (size) => Number.isInteger(size) && size >= 1 && size <= 10,
      ) &&
      groups.reduce((sum, size) => sum + size, 0) <= 30,
    columnGroups = validGroups ? groups : legacyColumnGroups(fallbackColumns);
  data.seatBoard = {
    ...source,
    rows: Number.isInteger(rows) && rows >= 1 && rows <= 30 ? rows : 30,
    columns: columnGroups.reduce((sum, size) => sum + size, 0),
    columnGroups,
    placements: Array.isArray(source.placements) ? source.placements : [],
  };
  return data.seatBoard;
}

function createIconsSafely() {
  try {
    globalThis.lucide?.createIcons();
  } catch (error) {
    console.warn("座位板图标渲染失败，已保留文字操作。", error);
  }
}

export async function renderSeatBoard(root, data, onChange) {
  const markup = await loadTemplate();
  if (!root.isConnected || !root.querySelector(".seat-board-loading")) return;
  root.innerHTML = markup;
  root.insertAdjacentHTML("afterbegin", seatSymbolsMarkup);
  root.querySelector(".seat-podium-art").innerHTML =
    '<svg viewBox="0 0 220 72" aria-hidden="true"><use href="#seatPodiumIllustration"></use></svg>';

  const board = ensureSeatBoardState(data),
    rowsInput = root.querySelector("[data-seat-rows]"),
    groupList = root.querySelector("[data-seat-groups]"),
    groupSummary = root.querySelector("[data-seat-group-summary]"),
    settingsDialog = root.querySelector("[data-seat-settings-dialog]"),
    clearAllButton = root.querySelector("[data-seat-clear-all]"),
    grid = root.querySelector("[data-seat-grid]"),
    list = root.querySelector("[data-seat-students]"),
    status = root.querySelector("[data-seat-status]");
  let selectedId = "",
    draftGroups = [...board.columnGroups];

  function announce(message) {
    status.textContent = message;
  }

  function commit(message) {
    onChange();
    draw();
    announce(message);
  }

  function renderGroupEditor() {
    const total = draftGroups.reduce((sum, size) => sum + size, 0),
      atLimit = total >= 30;
    groupList.innerHTML = draftGroups
      .map(
        (size, index) =>
          `<div class="seat-group-stepper"><button type="button" data-seat-group-decrease="${index}" aria-label="减少第 ${index + 1} 组列数" ${size <= 1 ? "disabled" : ""}><i data-lucide="minus"></i></button><output aria-label="第 ${index + 1} 组列数">${size}</output><button type="button" data-seat-group-increase="${index}" aria-label="增加第 ${index + 1} 组列数" ${size >= 10 || atLimit ? "disabled" : ""}><i data-lucide="plus"></i></button><button class="seat-group-remove" type="button" data-seat-group-remove="${index}" aria-label="删除第 ${index + 1} 组" title="删除该组" ${draftGroups.length <= 1 ? "disabled" : ""}><i data-lucide="trash-2"></i></button></div>`,
      )
      .join("");
    groupSummary.textContent = `共 ${total} 列 · ${Math.max(0, draftGroups.length - 1)} 条过道`;
    const addButton = root.querySelector("[data-seat-group-add]");
    addButton.disabled = atLimit;
    createIconsSafely();
  }

  function place(studentId, row, column) {
    const targetIndex = board.placements.findIndex(
        (item) => item.row === row && item.column === column,
      ),
      sourceIndex = board.placements.findIndex(
        (item) => item.studentId === studentId,
      ),
      source = sourceIndex >= 0 ? board.placements[sourceIndex] : null,
      target = targetIndex >= 0 ? board.placements[targetIndex] : null;
    if (sourceIndex >= 0) board.placements.splice(sourceIndex, 1);
    const refreshedTargetIndex = target
      ? board.placements.findIndex((item) => item.studentId === target.studentId)
      : -1;
    if (refreshedTargetIndex >= 0) board.placements.splice(refreshedTargetIndex, 1);
    board.placements.push({ studentId, row, column });
    if (source && target && target.studentId !== studentId) {
      board.placements.push({
        studentId: target.studentId,
        row: source.row,
        column: source.column,
      });
    }
    selectedId = "";
    commit(
      source && target && target.studentId !== studentId
        ? "两名学生已交换座位。"
        : target && target.studentId !== studentId
          ? "已替换该座位的学生。"
          : "学生已放置。",
    );
  }

  function draw() {
    const studentsById = new Map(data.students.map((student) => [student.id, student])),
      placements = board.placements.filter((item) => studentsById.has(item.studentId)),
      placedIds = new Set(placements.map((item) => item.studentId)),
      nameCounts = new Map();
    data.students.forEach((student) =>
      nameCounts.set(student.name, (nameCounts.get(student.name) || 0) + 1),
    );
    const duplicateNames = new Set(
        [...nameCounts].filter(([, count]) => count > 1).map(([name]) => name),
      ),
      placementByCell = new Map(
        placements.map((item) => [`${item.row}:${item.column}`, item]),
      ),
      unplaced = data.students.filter((student) => !placedIds.has(student.id));

    root.querySelector("[data-seat-count]").textContent =
      `已放置 ${placedIds.size} / ${data.students.length} 人`;
    clearAllButton.disabled = placedIds.size === 0;
    rowsInput.value = board.rows;
    renderGroupEditor();
    const tracks = [],
      aisleAfter = new Set();
    board.columnGroups.reduce((sum, size, index) => {
      const next = sum + size;
      if (index < board.columnGroups.length - 1) aisleAfter.add(next);
      return next;
    }, 0);
    for (let column = 1; column <= board.columns; column += 1) {
      tracks.push("64px");
      if (aisleAfter.has(column)) tracks.push("26px");
    }
    grid.style.gridTemplateColumns = tracks.join(" ");
    grid.setAttribute("aria-rowcount", String(board.rows));
    grid.setAttribute("aria-colcount", String(board.columns));
    grid.innerHTML = Array.from({ length: board.rows }, (_, rowIndex) =>
      Array.from({ length: board.columns }, (_, columnIndex) => {
        const row = rowIndex + 1,
          column = columnIndex + 1,
          placement = placementByCell.get(`${row}:${column}`),
          student = placement && studentsById.get(placement.studentId),
          label = student ? escapeHtml(studentLabel(student, duplicateNames)) : "",
          seatCode = `${row}-${column}`,
          seat = `<button type="button" class="seat-cell${student ? " occupied" : ""}" role="gridcell" data-row="${row}" data-column="${column}" ${student ? `data-student-id="${escapeHtml(student.id)}" draggable="true"` : ""} aria-label="第 ${row} 行第 ${column} 列${student ? `，${label}` : "，空座位"}"><svg class="seat-desk-art" viewBox="0 0 72 64" aria-hidden="true"><use href="#seatDeskIllustration"></use></svg><span class="seat-name">${label || seatCode}</span></button>`;
        return aisleAfter.has(column)
          ? `${seat}<span class="seat-aisle" aria-hidden="true"></span>`
          : seat;
      }).join(""),
    ).join("");
    list.innerHTML = unplaced.length
      ? unplaced.map((student) => `<button type="button" class="seat-student${selectedId === student.id ? " selected" : ""}" data-student-id="${escapeHtml(student.id)}" draggable="true">${escapeHtml(studentLabel(student, duplicateNames))}</button>`).join("")
      : `<div class="seat-list-empty">${data.students.length ? "全部学生均已放置" : "请先在学生管理中导入花名册"}</div>`;
  }

  root.addEventListener("click", (event) => {
    const studentButton = event.target.closest(".seat-student"),
      cell = event.target.closest(".seat-cell"),
      decrease = event.target.closest("[data-seat-group-decrease]"),
      increase = event.target.closest("[data-seat-group-increase]"),
      remove = event.target.closest("[data-seat-group-remove]"),
      add = event.target.closest("[data-seat-group-add]"),
      settings = event.target.closest("[data-seat-settings]"),
      settingsClose = event.target.closest("[data-seat-settings-close]"),
      clearAll = event.target.closest("[data-seat-clear-all]");
    if (settings) {
      draftGroups = [...board.columnGroups];
      rowsInput.value = board.rows;
      renderGroupEditor();
      settingsDialog.showModal();
      return;
    }
    if (settingsClose) {
      settingsDialog.close();
      return;
    }
    if (clearAll) {
      if (
        board.placements.length &&
        confirm("确定清空全部座位吗？所有学生将回到未放置列表。")
      ) {
        board.placements = [];
        selectedId = "";
        commit("全部座位已清空。");
      }
      return;
    }
    if (decrease) {
      const index = Number(decrease.dataset.seatGroupDecrease);
      if (draftGroups[index] > 1) draftGroups[index] -= 1;
      renderGroupEditor();
      return;
    }
    if (increase) {
      const index = Number(increase.dataset.seatGroupIncrease),
        total = draftGroups.reduce((sum, size) => sum + size, 0);
      if (draftGroups[index] < 10 && total < 30) draftGroups[index] += 1;
      renderGroupEditor();
      return;
    }
    if (remove) {
      if (draftGroups.length > 1)
        draftGroups.splice(Number(remove.dataset.seatGroupRemove), 1);
      renderGroupEditor();
      return;
    }
    if (add) {
      const total = draftGroups.reduce((sum, size) => sum + size, 0);
      if (total < 30) draftGroups.push(Math.min(2, 30 - total));
      renderGroupEditor();
      return;
    }
    if (studentButton) {
      selectedId = selectedId === studentButton.dataset.studentId ? "" : studentButton.dataset.studentId;
      draw();
      announce(selectedId ? "已选中学生，请点击空座位。" : "已取消选择。");
      return;
    }
    if (!cell) return;
    if (selectedId) place(selectedId, Number(cell.dataset.row), Number(cell.dataset.column));
    else if (cell.dataset.studentId) {
      const student = data.students.find((item) => item.id === cell.dataset.studentId);
      board.placements = board.placements.filter((item) => item.studentId !== cell.dataset.studentId);
      commit(`${student?.name || "学生"}已移回未放置列表。`);
    }
  });
  root.addEventListener("dragstart", (event) => {
    const source = event.target.closest("[data-student-id]");
    if (source) event.dataTransfer.setData("text/plain", source.dataset.studentId);
  });
  grid.addEventListener("dragover", (event) => {
    if (event.target.closest(".seat-cell")) event.preventDefault();
  });
  grid.addEventListener("drop", (event) => {
    const cell = event.target.closest(".seat-cell"),
      studentId = event.dataTransfer.getData("text/plain");
    if (cell && studentId)
      place(studentId, Number(cell.dataset.row), Number(cell.dataset.column));
  });
  root.querySelector("[data-seat-resize]").addEventListener("click", () => {
    const rows = Number(rowsInput.value),
      columns = draftGroups.reduce((sum, size) => sum + size, 0);
    if (!Number.isInteger(rows) || rows < 1 || rows > 30) {
      announce("行数必须是 1 到 30 的整数。");
      return;
    }
    const removed = board.placements.filter(
      (item) => item.row > rows || item.column > columns,
    ).length;
    board.rows = rows;
    board.columns = columns;
    board.columnGroups = [...draftGroups];
    board.placements = board.placements.filter(
      (item) => item.row <= rows && item.column <= columns,
    );
    settingsDialog.close();
    commit(removed ? `尺寸已保存，${removed} 名越界学生已移回未放置列表。` : "座位板尺寸已保存。");
  });
  settingsDialog.addEventListener("click", (event) => {
    if (event.target === settingsDialog) settingsDialog.close();
  });
  draw();
}
