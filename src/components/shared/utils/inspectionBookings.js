import { applyInspectionLifecycleToUnit } from "./unitLifecycle";
import { formatDateDDMMYY } from "./dateFormat";
export const INSPECTION_BOOKINGS_KEY = "domihive_inspection_bookings";

export const INSPECTION_BOOKING_STATUSES = {
  PENDING_CONFIRMATION: "Pending Confirmation",
  SCHEDULED: "Scheduled",
  NO_SHOW: "No-show",
  INSPECTION_COMPLETED: "Inspection Completed"
};

export const ACTIVE_INSPECTION_BOOKING_STATUSES = [
  INSPECTION_BOOKING_STATUSES.PENDING_CONFIRMATION,
  INSPECTION_BOOKING_STATUSES.SCHEDULED
];

export const FINAL_INSPECTION_BOOKING_STATUSES = [
  INSPECTION_BOOKING_STATUSES.NO_SHOW,
  INSPECTION_BOOKING_STATUSES.INSPECTION_COMPLETED
];

const safeParse = (raw, fallback = []) => {
  try {
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : fallback;
  } catch (_error) {
    return fallback;
  }
};

export const readInspectionBookings = () => {
  if (typeof window === "undefined") return [];
  const raw = window.localStorage.getItem(INSPECTION_BOOKINGS_KEY);
  const parsed = safeParse(raw, []);
  // Auto-clean duplicate bookings from older test flows.
  const deduped = dedupeInspectionBookings(parsed);
  if (deduped.length !== parsed.length) {
    writeInspectionBookings(deduped);
  }
  return deduped;
};

export const writeInspectionBookings = (bookings) => {
  if (typeof window === "undefined") return;
  const normalized = Array.isArray(bookings) ? bookings : [];
  window.localStorage.setItem(INSPECTION_BOOKINGS_KEY, JSON.stringify(normalized));
};

const normalizeIdentityPart = (value) => String(value || "").trim().toLowerCase();

export const getBookingIdentityKey = (booking) => {
  const applicant = normalizeIdentityPart(booking?.applicantName);
  const phone = normalizeIdentityPart(booking?.applicantPhone);
  const email = normalizeIdentityPart(booking?.applicantEmail);
  const unit = normalizeIdentityPart(booking?.unitCode || booking?.unitNumber);
  const propertyId = normalizeIdentityPart(booking?.propertyId);
  // Keep one active booking per applicant + property + unit.
  // Date/time changes should overwrite the old booking (reschedule behavior).
  return [applicant || phone || email, propertyId, unit].join('|');
};

export const getApplicationIdentityKey = (application) => {
  const applicant = normalizeIdentityPart(application?.applicantName);
  const propertyId = normalizeIdentityPart(application?.property?.id || application?.propertyId);
  const unit = normalizeIdentityPart(application?.property?.unitCode || application?.unitCode);
  return [applicant, propertyId, unit].join("|");
};

export const dedupeInspectionBookings = (bookings = []) => {
  const latestByKey = new Map();
  bookings.forEach((booking) => {
    const key = getBookingIdentityKey(booking);
    const current = latestByKey.get(key);
    const currentTs = new Date(current?.adminUpdatedAt || current?.bookingDate || current?.createdAt || 0).getTime();
    const nextTs = new Date(booking?.adminUpdatedAt || booking?.bookingDate || booking?.createdAt || 0).getTime();
    if (!current || nextTs >= currentTs) {
      latestByKey.set(key, booking);
    }
  });

  return Array.from(latestByKey.values()).sort((a, b) => {
    const aTs = new Date(a?.bookingDate || a?.createdAt || 0).getTime();
    const bTs = new Date(b?.bookingDate || b?.createdAt || 0).getTime();
    return bTs - aTs;
  });
};

const formatDateWords = (dateISO) => {
  return formatDateDDMMYY(dateISO);
};

export const toInspectionRow = (booking) => {
  const numericDate = booking?.inspectionDate || "";
  const wordsDate = formatDateWords(`${numericDate}T00:00:00`);
  return {
    id: booking?.bookingId || booking?.id || `insp-${Date.now()}`,
    bookingId: booking?.bookingId || booking?.id || "",
    applicantName: booking?.applicantName || "Applicant",
    applicantPhone: booking?.applicantPhone || "",
    applicantEmail: booking?.applicantEmail || "",
    propertyId: booking?.propertyId || "",
    propertyTitle: booking?.propertyTitle || "Property",
    unitCode: booking?.unitCode || "—",
    location: booking?.location || "",
    dateNumeric: numericDate,
    dateWords: wordsDate,
    time: booking?.inspectionTime || "",
    attendees: Number(booking?.numberOfPeople || 1),
    notes: booking?.inspectionNotes || "",
    bookedAtISO: booking?.bookingDate || booking?.createdAt || "",
    status:
      booking?.inspectionStatus ||
      booking?.status ||
      INSPECTION_BOOKING_STATUSES.PENDING_CONFIRMATION
  };
};

export const updateInspectionBookingStatus = (bookingId, nextStatus) => {
  if (typeof window === "undefined") return false;
  const bookings = readInspectionBookings();
  let changed = false;
  let changedBooking = null;
  const updatedBookings = bookings.map((booking) => {
    if (String(booking?.bookingId || booking?.id) !== String(bookingId)) return booking;
    changed = true;
    changedBooking = {
      ...booking,
      inspectionStatus: nextStatus,
      status: nextStatus,
      adminUpdatedAt: new Date().toISOString()
    };
    return changedBooking;
  });

  if (!changed) return false;
  writeInspectionBookings(updatedBookings);
  if (changedBooking) {
    applyInspectionLifecycleToUnit({
      booking: changedBooking,
      inspectionStatus: nextStatus
    });
  }

  // Reflect to all user-specific application stores.
  Object.keys(window.localStorage).forEach((key) => {
    if (!key.startsWith("domihive_applications_state_")) return;
    const raw = window.localStorage.getItem(key);
    const apps = safeParse(raw, null);
    if (!Array.isArray(apps)) return;

    let appChanged = false;
    const nextApps = apps.map((app) => {
      if (String(app?.bookingId) !== String(bookingId)) return app;
      appChanged = true;
      return {
        ...app,
        inspectionStatus: nextStatus,
        updatedAtISO: new Date().toISOString(),
        updatedAt: "Just now"
      };
    });
    if (appChanged) {
      window.localStorage.setItem(key, JSON.stringify(nextApps));
    }
  });

  return true;
};
