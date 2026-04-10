export const getUserStorageKey = (user) => {
  if (user?.id) return String(user.id);
  if (user?.phone) return `phone_${String(user.phone)}`;
  if (user?.email) return `email_${String(user.email).toLowerCase()}`;
  if (user?.username) return `username_${String(user.username).toLowerCase()}`;
  try {
    const persisted = localStorage.getItem('domihive_user_key');
    if (persisted) return String(persisted);
    const rawUser = localStorage.getItem('domihive_user');
    if (rawUser) {
      const parsed = JSON.parse(rawUser);
      if (parsed?.id) return String(parsed.id);
      if (parsed?.phone) return `user_phone_${String(parsed.phone)}`;
      if (parsed?.email) return `user_email_${String(parsed.email).toLowerCase()}`;
      if (parsed?.username) return `user_username_${String(parsed.username).toLowerCase()}`;
    }
  } catch (_error) {
    // no-op fallback to guest below
  }
  return "guest";
};
