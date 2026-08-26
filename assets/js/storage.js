export function createLocalStorageRepository(
  storageKey,
  createDefaultData,
  normalizeData = (data) => data,
) {
  return {
    load() {
      try {
        return normalizeData(
          JSON.parse(localStorage.getItem(storageKey)) || createDefaultData(),
        );
      } catch {
        return createDefaultData();
      }
    },

    save(data) {
      localStorage.setItem(storageKey, JSON.stringify(data));
    },

    clear() {
      localStorage.removeItem(storageKey);
    },
  };
}

export function createPreferenceRepository(storageKey) {
  return {
    get(fallback = null) {
      return localStorage.getItem(storageKey) || fallback;
    },

    set(value) {
      localStorage.setItem(storageKey, value);
    },
  };
}