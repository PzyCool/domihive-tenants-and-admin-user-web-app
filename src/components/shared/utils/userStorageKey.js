export const getUserStorageKey = (user) => {
  if (user?.id) return String(user.id);
  if (user?.phone) return `phone_${String(user.phone)}`;
  if (user?.email) return `email_${String(user.email).toLowerCase()}`;
  if (user?.username) return `username_${String(user.username).toLowerCase()}`;
  return "guest";
};

