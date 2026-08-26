import assert from "node:assert/strict";
import test from "node:test";
import { readFile } from "node:fs/promises";

import {
  createInitialData,
  formatLocalDate,
  normalizeCourseRecord,
  normalizeLogbookData,
  parseCsv,
} from "../assets/js/data.js";
import { createTeacherLogbookServer } from "../assets/js/server.js";
import { createLocalStorageRepository } from "../assets/js/storage.js";
import { ensureSeatBoardState } from "../assets/js/seat-board.js";

test("CSV parser supports quoted commas, quotes, and newlines", () => {
  const csv = 'name,contact\n"Li, Ming","Parent ""A""\n010"';
  assert.deepEqual(parseCsv(csv), [
    ["name", "contact"],
    ["Li, Ming", 'Parent "A"\n010'],
  ]);
});

test("logbook normalization rejects malformed collections and migrates courses", () => {
  assert.throws(
    () => normalizeLogbookData({ students: [], todos: {} }),
    /todos.*必须是数组/,
  );
  const normalized = normalizeLogbookData({
    students: [],
    courses: [{ id: "course-1", time: "周一 08:00-08:45" }],
  });
  assert.deepEqual(normalized.courses[0], {
    id: "course-1",
    day: "周一",
    time: "08:00-08:45",
  });
  assert.deepEqual(normalizeCourseRecord({ day: "周二", time: "08:00 - 08:45" }), {
    day: "周二",
    time: "08:00-08:45",
  });
});

test("local storage recovery returns defaults when persisted data is malformed", () => {
  const previous = globalThis.localStorage;
  const values = new Map([["logbook", JSON.stringify({ students: [], todos: null })]]);
  globalThis.localStorage = {
    getItem: (key) => values.get(key) || null,
    setItem: (key, value) => values.set(key, value),
    removeItem: (key) => values.delete(key),
  };
  try {
    const repository = createLocalStorageRepository(
      "logbook",
      createInitialData,
      normalizeLogbookData,
    );
    assert.deepEqual(repository.load(), createInitialData());
  } finally {
    if (previous === undefined) delete globalThis.localStorage;
    else globalThis.localStorage = previous;
  }
});

test("backup replacement and persistence failures do not silently save invalid data", async () => {
  let saved = false;
  const server = createTeacherLogbookServer({
    saveLogbook: async () => {
      saved = true;
    },
  });
  await assert.rejects(
    server.replaceLogbook({ students: [], alerts: null }),
    /alerts.*必须是数组/,
  );
  assert.equal(saved, false);

  const failingServer = createTeacherLogbookServer({
    saveLogbook: async () => {
      throw new Error("storage quota exceeded");
    },
  });
  await assert.rejects(
    failingServer.saveLogbook(createInitialData()),
    /storage quota exceeded/,
  );
});

test("local date formatting uses the user's calendar date", () => {
  assert.equal(formatLocalDate(new Date(2026, 0, 2)), "2026-01-02");
});

test("keyboard navigation contracts remain in the application bundle", async () => {
  const source = await readFile(
    new URL("../assets/js/app.js", import.meta.url),
    "utf8",
  );
  assert.match(source, /sidebar\.inert = mobile && !isOpen/);
  assert.match(source, /<button type="button" class="schedule-class"/);
});

test("seat board persists dimensions and identifies duplicate names by student id", () => {
  const normalized = normalizeLogbookData({
    students: [
      { id: "student-a", name: "张伟" },
      { id: "student-b", name: "张伟" },
    ],
    seatBoard: {
      rows: 12,
      columns: 18,
      columnGroups: [2, 4, 2],
      placements: [
        { studentId: "student-a", row: 1, column: 1 },
        { studentId: "student-b", row: 1, column: 2 },
        { studentId: "student-a", row: 2, column: 2 },
      ],
    },
  });
  assert.equal(normalized.seatBoard.rows, 12);
  assert.equal(normalized.seatBoard.columns, 8);
  assert.deepEqual(normalized.seatBoard.columnGroups, [2, 4, 2]);
  assert.deepEqual(normalized.seatBoard.placements, [
    { studentId: "student-a", row: 1, column: 1 },
    { studentId: "student-b", row: 1, column: 2 },
  ]);
});

test("seat board defaults to 30 by 30 and migrates missing student ids", () => {
  const normalized = normalizeLogbookData({ students: [{ name: "李明" }] });
  assert.equal(normalized.seatBoard.rows, 30);
  assert.equal(normalized.seatBoard.columns, 30);
  assert.deepEqual(normalized.seatBoard.columnGroups, Array.from({ length: 15 }, () => 2));
  assert.equal(typeof normalized.students[0].id, "string");
  assert.ok(normalized.students[0].id.length > 0);
});

test("legacy seat board columns migrate into structured column groups", () => {
  const normalized = normalizeLogbookData({
    students: [],
    seatBoard: { rows: 8, columns: 7, placements: [] },
  });
  assert.equal(normalized.seatBoard.columns, 7);
  assert.deepEqual(normalized.seatBoard.columnGroups, [2, 2, 2, 1]);
});

test("seat board keeps low-frequency layout controls in a dialog", async () => {
  const markup = await readFile(
      new URL("../components/seat-board.html", import.meta.url),
      "utf8",
    ),
    source = await readFile(
      new URL("../assets/js/seat-board.js", import.meta.url),
      "utf8",
    );
  assert.match(markup, /<dialog[^>]+data-seat-settings-dialog/);
  assert.doesNotMatch(markup, /<svg\b/i);
  assert.match(markup, /data-seat-clear-all/);
  assert.match(markup, />保存<\/button>/);
  assert.match(source, /board\.placements = \[\]/);
  assert.match(source, /settingsDialog\.showModal\(\)/);
  assert.match(source, /insertAdjacentHTML\("afterbegin", seatSymbolsMarkup\)/);
});

test("seat board renderer repairs legacy in-memory state before rendering", () => {
  const data = {
    seatBoard: {
      rows: 8,
      columns: 7,
      placements: [{ studentId: "student-a", row: 1, column: 1 }],
    },
  };
  const board = ensureSeatBoardState(data);
  assert.equal(board.rows, 8);
  assert.equal(board.columns, 7);
  assert.deepEqual(board.columnGroups, [2, 2, 2, 1]);
  assert.equal(board.placements.length, 1);

  const empty = {};
  assert.doesNotThrow(() => ensureSeatBoardState(empty));
  assert.equal(empty.seatBoard.columns, 30);
});
