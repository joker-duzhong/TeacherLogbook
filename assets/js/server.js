import { createInitialData, normalizeLogbookData } from "./data.js";
import {
  createLocalStorageRepository,
  createPreferenceRepository,
} from "./storage.js";

export function createTeacherLogbookServer(adapter) {
  return {
    async loadLogbook() {
      return normalizeLogbookData(await adapter.loadLogbook());
    },

    async saveLogbook(data) {
      await adapter.saveLogbook(normalizeLogbookData(data));
    },

    async replaceLogbook(data) {
      const normalized = normalizeLogbookData(data);
      await adapter.saveLogbook(normalized);
      return normalized;
    },

    async clearLogbook() {
      await adapter.clearLogbook();
      return createInitialData();
    },

    async getSkin(fallback) {
      return adapter.getPreference("skin", fallback);
    },

    async setSkin(name) {
      await adapter.setPreference("skin", name);
    },
  };
}

export function createLocalStorageAdapter() {
  const logbookRepository = createLocalStorageRepository(
    "teacher-logbook-v1",
    createInitialData,
    normalizeLogbookData,
  );
  const skinRepository = createPreferenceRepository("teacher-logbook-skin");

  return {
    loadLogbook: () => logbookRepository.load(),
    saveLogbook: (data) => logbookRepository.save(data),
    clearLogbook: () => logbookRepository.clear(),
    getPreference: (key, fallback) =>
      key === "skin" ? skinRepository.get(fallback) : fallback,
    setPreference: (key, value) => {
      if (key === "skin") skinRepository.set(value);
    },
  };
}

export function createHttpApiAdapter({ baseUrl, fetchImpl = fetch }) {
  async function request(path, options) {
    const response = await fetchImpl(`${baseUrl}${path}`, options);
    if (!response.ok) throw new Error(`请求失败：${response.status}`);
    return response.status === 204 ? null : response.json();
  }

  return {
    loadLogbook: () => request("/logbook"),
    saveLogbook: (data) =>
      request("/logbook", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      }),
    clearLogbook: () => request("/logbook", { method: "DELETE" }),
    getPreference: (key, fallback) =>
      request(`/preferences/${encodeURIComponent(key)}`).then(
        (result) => result?.value ?? fallback,
      ),
    setPreference: (key, value) =>
      request(`/preferences/${encodeURIComponent(key)}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ value }),
      }),
  };
}

export const teacherLogbookServer = createTeacherLogbookServer(
  createLocalStorageAdapter(),
);