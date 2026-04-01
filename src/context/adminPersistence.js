export const ADMIN_STORAGE_KEY = "domihive_admin_data_v1";
export const ADMIN_STORAGE_BACKUP_KEY = "domihive_admin_data_v1_backup";
const MAX_INLINE_STRING = 220000;

const safeParse = (raw) => {
  if (!raw) return null;
  try {
    const parsed = JSON.parse(raw);
    return parsed && typeof parsed === "object" ? parsed : null;
  } catch (_error) {
    return null;
  }
};

export const readAdminStorage = () => {
  if (typeof window === "undefined") return null;
  try {
    const primaryRaw = window.localStorage.getItem(ADMIN_STORAGE_KEY);
    const backupRaw = window.localStorage.getItem(ADMIN_STORAGE_BACKUP_KEY);
    const primary = safeParse(primaryRaw);
    if (primary) return primary;

    const backup = safeParse(backupRaw);
    if (backup) {
      // self-heal primary if backup is valid
      window.localStorage.setItem(ADMIN_STORAGE_KEY, JSON.stringify(backup));
      return backup;
    }
    return null;
  } catch (_error) {
    return null;
  }
};

export const writeAdminStorage = (data) => {
  if (typeof window === "undefined") return;
  const stripInlineData = (value, mode = "soft") => {
    if (Array.isArray(value)) return value.map((item) => stripInlineData(item, mode));
    if (value && typeof value === "object") {
      return Object.fromEntries(
        Object.entries(value).map(([key, next]) => [key, stripInlineData(next, mode)])
      );
    }
    if (typeof value === "string" && value.startsWith("data:")) {
      if (mode === "hard") return "";
      if (value.length > MAX_INLINE_STRING) return "";
    }
    return value;
  };

  const buildPayload = (next) =>
    JSON.stringify({
      ...next,
      _meta: {
        version: 1,
        updatedAt: new Date().toISOString()
      }
    });

  try {
    // 1) Try full payload first.
    const fullPayload = buildPayload(data);
    window.localStorage.setItem(ADMIN_STORAGE_KEY, fullPayload);
    window.localStorage.setItem(ADMIN_STORAGE_BACKUP_KEY, fullPayload);
    return;
  } catch (_fullWriteError) {
    // Fall through to compact modes.
  }

  try {
    // 2) Soft compact: remove very large data URLs only.
    const compactSoft = stripInlineData(data, "soft");
    const softPayload = buildPayload(compactSoft);
    window.localStorage.setItem(ADMIN_STORAGE_KEY, softPayload);
    window.localStorage.setItem(ADMIN_STORAGE_BACKUP_KEY, softPayload);
    return;
  } catch (_softWriteError) {
    // Fall through to hard compact mode.
  }

  try {
    // 3) Hard compact: remove all inline data URLs, keep all business records.
    const compactHard = stripInlineData(data, "hard");
    const hardPayload = buildPayload(compactHard);
    window.localStorage.setItem(ADMIN_STORAGE_KEY, hardPayload);
    window.localStorage.setItem(ADMIN_STORAGE_BACKUP_KEY, hardPayload);
  } catch (_hardWriteError) {
    // Final fallback: keep app running; data stays in-memory until user trims media volume.
  }
};
