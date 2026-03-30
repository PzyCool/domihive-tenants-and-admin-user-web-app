const START_MINUTES = 9 * 60; // 09:00
const END_MINUTES = 17 * 60; // 17:00
const SLOT_DURATION = 90; // 1h30m

const pad = (value) => String(value).padStart(2, "0");

const to12Hour = (totalMinutes) => {
  const hours24 = Math.floor(totalMinutes / 60);
  const minutes = totalMinutes % 60;
  const meridian = hours24 >= 12 ? "PM" : "AM";
  const hours12 = hours24 % 12 || 12;
  return `${hours12}:${pad(minutes)}${meridian}`;
};

const toMinutesFromLabel = (label = "") => {
  const first = String(label).split(" - ")[0]?.trim() || "";
  const match = first.match(/^(\d{1,2}):(\d{2})(AM|PM)$/i);
  if (!match) return Number.MAX_SAFE_INTEGER;
  let hour = Number(match[1]);
  const minute = Number(match[2]);
  const meridian = match[3].toUpperCase();
  if (meridian === "PM" && hour < 12) hour += 12;
  if (meridian === "AM" && hour === 12) hour = 0;
  return hour * 60 + minute;
};

export const buildDailySlotLabels = () => {
  const labels = [];
  for (let start = START_MINUTES; start + SLOT_DURATION <= END_MINUTES; start += SLOT_DURATION) {
    const end = start + SLOT_DURATION;
    labels.push(`${to12Hour(start)} - ${to12Hour(end)}`);
  }
  return labels;
};

export const getNextWorkingDates = (count = 5, now = new Date()) => {
  const dates = [];
  const cursor = new Date(now);
  cursor.setHours(0, 0, 0, 0);

  while (dates.length < count) {
    const day = cursor.getDay(); // 0 Sun, 6 Sat
    if (day !== 0 && day !== 6) {
      const iso = `${cursor.getFullYear()}-${pad(cursor.getMonth() + 1)}-${pad(cursor.getDate())}`;
      dates.push({ date: iso, dateObj: new Date(cursor) });
    }
    cursor.setDate(cursor.getDate() + 1);
  }
  return dates;
};

export const buildAutoRowsForProperty = (propertyId, count = 5, now = new Date()) => {
  const dates = getNextWorkingDates(count, now);
  const slotLabels = buildDailySlotLabels();
  const rows = [];
  dates.forEach((item) => {
    slotLabels.forEach((label) => {
      rows.push({
        id: `auto-${propertyId}-${item.date}-${label}`,
        propertyId,
        date: item.date,
        time: label,
        status: "available",
        source: "auto"
      });
    });
  });
  return rows;
};

export const normalizeAdminSlots = (slots = []) => {
  const normalized = [];
  slots.forEach((slot, slotIndex) => {
    if (!slot || !slot.propertyId || !slot.date) return;

    if (slot.time) {
      normalized.push({
        id: slot.id || `slot-${slot.propertyId}-${slot.date}-${slot.time}-${slotIndex}`,
        propertyId: slot.propertyId,
        date: slot.date,
        time: slot.time,
        status: slot.status || "available",
        source: "admin",
        createdAt: slot.createdAt || null
      });
      return;
    }

    if (Array.isArray(slot.times)) {
      slot.times.forEach((time, timeIndex) => {
        if (!time) return;
        normalized.push({
          id: `legacy-${slot.propertyId}-${slot.date}-${time}-${slotIndex}-${timeIndex}`,
          propertyId: slot.propertyId,
          date: slot.date,
          time,
          status: "available",
          source: "admin",
          createdAt: null
        });
      });
    }
  });
  return normalized;
};

export const mergePropertySchedule = (propertyId, slots = []) => {
  const autoRows = buildAutoRowsForProperty(propertyId);
  const adminRows = normalizeAdminSlots(slots).filter(
    (row) => String(row.propertyId) === String(propertyId)
  );

  const map = new Map();
  const baseKeys = new Set();
  autoRows.forEach((row) => {
    const key = `${row.date}|${row.time}`;
    map.set(key, row);
    baseKeys.add(key);
  });

  adminRows.forEach((row) => {
    const key = `${row.date}|${row.time}`;
    // Keep schedule strictly within next 5 working-day template.
    if (!baseKeys.has(key)) return;
    if (String(row.status).toLowerCase() === "deleted") {
      map.delete(key);
      return;
    }
    map.set(key, { ...row, source: "admin" });
  });

  const rows = Array.from(map.values()).sort((a, b) => {
    const byDate = String(a.date).localeCompare(String(b.date));
    if (byDate !== 0) return byDate;
    return toMinutesFromLabel(a.time) - toMinutesFromLabel(b.time);
  });

  return rows;
};

export const isAutoBaseSlot = (propertyId, date, time) => {
  const autoRows = buildAutoRowsForProperty(propertyId);
  return autoRows.some(
    (row) => String(row.date) === String(date) && String(row.time) === String(time)
  );
};
