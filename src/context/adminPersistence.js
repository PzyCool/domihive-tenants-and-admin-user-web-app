export const ADMIN_STORAGE_KEY = "domihive_admin_data_v1";
export const ADMIN_STORAGE_BACKUP_KEY = "domihive_admin_data_v1_backup";

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
  try {
    const payload = JSON.stringify({
      ...data,
      _meta: {
        version: 1,
        updatedAt: new Date().toISOString()
      }
    });
    window.localStorage.setItem(ADMIN_STORAGE_KEY, payload);
    window.localStorage.setItem(ADMIN_STORAGE_BACKUP_KEY, payload);
  } catch (_error) {
    // ignore quota/serialization errors
  }
};
