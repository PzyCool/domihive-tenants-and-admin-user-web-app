import { readAdminStorage } from "../../../../../../context/adminPersistence";
import { mergePropertySchedule } from "../../../../../shared/utils/inspectionSchedule";
import { readInspectionBookings } from "../../../../../shared/utils/inspectionBookings";

const toMinutes = (label = "") => {
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

export const getPropertySlotAvailability = (propertyId) => {
  const data = readAdminStorage();
  const sourceSlots = Array.isArray(data?.slots) ? data.slots : [];
  const properties = Array.isArray(data?.properties) ? data.properties : [];
  const bookings = readInspectionBookings();
  const targetProperty = properties.find(
    (property) => String(property?.id) === String(propertyId)
  );
  const maxPeopleAllowed = Number(targetProperty?.inspectionMaxPeople) || 3;

  const merged = mergePropertySchedule(propertyId, sourceSlots);
  const availableRows = merged.filter(
    (row) =>
      String(row.status || "").toLowerCase() === "available" &&
      !bookings.some(
        (booking) =>
          String(booking?.propertyId) === String(row.propertyId) &&
          String(booking?.inspectionDate) === String(row.date) &&
          String(booking?.inspectionTime) === String(row.time)
      )
  );

  const grouped = availableRows.reduce((acc, row) => {
    if (!acc[row.date]) acc[row.date] = [];
    acc[row.date].push(row.time);
    return acc;
  }, {});

  const dates = Object.keys(grouped)
    .sort((a, b) => new Date(a).getTime() - new Date(b).getTime())
    .map((date, idx) => ({
      date,
      dateObj: new Date(date),
      availableSlots: grouped[date].length,
      isNextDay: idx === 0
    }));

  const timesByDate = {};
  dates.forEach((entry) => {
    timesByDate[entry.date] = Array.from(new Set(grouped[entry.date])).sort(
      (a, b) => toMinutes(a) - toMinutes(b)
    );
  });

  return { dates, timesByDate, maxPeopleAllowed };
};
