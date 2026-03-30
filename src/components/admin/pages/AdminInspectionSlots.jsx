import React, { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { CalendarDays, Clock3, ShieldBan, ShieldCheck, Trash2 } from "lucide-react";
import { useAdmin } from "../../../context/AdminContext";
import {
  mergePropertySchedule,
  isAutoBaseSlot
} from "../../shared/utils/inspectionSchedule";
import { readInspectionBookings } from "../../shared/utils/inspectionBookings";

const getOrdinal = (day) => {
  const mod10 = day % 10;
  const mod100 = day % 100;
  if (mod10 === 1 && mod100 !== 11) return `${day}st`;
  if (mod10 === 2 && mod100 !== 12) return `${day}nd`;
  if (mod10 === 3 && mod100 !== 13) return `${day}rd`;
  return `${day}th`;
};

const formatDisplayDate = (dateStr) => {
  const date = new Date(dateStr);
  if (Number.isNaN(date.getTime())) return dateStr;
  const weekday = date.toLocaleDateString("en-US", { weekday: "long" });
  const month = date.toLocaleDateString("en-US", { month: "long" });
  const year = date.getFullYear();
  return `${weekday}, ${getOrdinal(date.getDate())} of ${month} ${year}`;
};

const AdminInspectionSlots = () => {
  const navigate = useNavigate();
  const { properties, setProperties, slots, setSlots } = useAdmin();
  const [selectedProperty, setSelectedProperty] = useState(properties[0]?.id || "");

  const scheduleRows = useMemo(
    () => mergePropertySchedule(selectedProperty, slots),
    [selectedProperty, slots]
  );

  const groupedByDate = useMemo(() => {
    const grouped = {};
    scheduleRows.forEach((row) => {
      if (!grouped[row.date]) grouped[row.date] = [];
      grouped[row.date].push(row);
    });
    return grouped;
  }, [scheduleRows]);

  const bookedSlotKeySet = useMemo(() => {
    const bookings = readInspectionBookings();
    const toKey = (propertyId, date, time) =>
      `${String(propertyId)}__${String(date)}__${String(time).trim().toLowerCase()}`;

    const activeBookings = bookings.filter(
      (booking) => String(booking?.inspectionStatus || "").toLowerCase() !== "no-show"
    );

    return new Set(
      activeBookings.map((booking) =>
        toKey(booking?.propertyId, booking?.inspectionDate, booking?.inspectionTime)
      )
    );
  }, [slots, selectedProperty]);

  const upsertOverride = (propertyId, date, time, status) => {
    setSlots((prev) => {
      const existingIndex = prev.findIndex(
        (slot) =>
          String(slot.propertyId) === String(propertyId) &&
          String(slot.date) === String(date) &&
          String(slot.time) === String(time)
      );

      if (existingIndex >= 0) {
        const next = [...prev];
        next[existingIndex] = { ...next[existingIndex], status };
        return next;
      }

      return [
        ...prev,
        {
          id: `slot-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
          propertyId,
          date,
          time,
          status,
          createdAt: new Date().toISOString()
        }
      ];
    });
  };

  const getSlotKey = (propertyId, date, time) =>
    `${String(propertyId)}__${String(date)}__${String(time).trim().toLowerCase()}`;

  const isBookedRow = (row) => bookedSlotKeySet.has(getSlotKey(selectedProperty, row.date, row.time));

  const removeOverride = (propertyId, date, time) => {
    setSlots((prev) =>
      prev.filter(
        (slot) =>
          !(
            String(slot.propertyId) === String(propertyId) &&
            String(slot.date) === String(date) &&
            String(slot.time) === String(time)
          )
      )
    );
  };

  const toggleSlotBlocked = (row) => {
    if (isBookedRow(row)) return;
    const currentlyBlocked = String(row.status).toLowerCase() === "blocked";
    if (currentlyBlocked) {
      if (isAutoBaseSlot(selectedProperty, row.date, row.time)) {
        removeOverride(selectedProperty, row.date, row.time);
      } else {
        upsertOverride(selectedProperty, row.date, row.time, "available");
      }
      return;
    }
    upsertOverride(selectedProperty, row.date, row.time, "blocked");
  };

  const deleteSlot = (row) => {
    if (isBookedRow(row)) return;
    if (isAutoBaseSlot(selectedProperty, row.date, row.time)) {
      upsertOverride(selectedProperty, row.date, row.time, "deleted");
      return;
    }
    removeOverride(selectedProperty, row.date, row.time);
  };

  const toggleDateBlocked = (date) => {
    const rows = (groupedByDate[date] || []).filter((row) => !isBookedRow(row));
    if (!rows.length) return;
    const allBlocked = rows.every((row) => String(row.status).toLowerCase() === "blocked");

    rows.forEach((row) => {
      if (allBlocked) {
        if (isAutoBaseSlot(selectedProperty, row.date, row.time)) {
          removeOverride(selectedProperty, row.date, row.time);
        } else {
          upsertOverride(selectedProperty, row.date, row.time, "available");
        }
      } else {
        upsertOverride(selectedProperty, row.date, row.time, "blocked");
      }
    });
  };

  const deleteDate = (date) => {
    const rows = (groupedByDate[date] || []).filter((row) => !isBookedRow(row));
    rows.forEach((row) => deleteSlot(row));
  };

  const selectedTitle =
    properties.find((property) => String(property.id) === String(selectedProperty))?.title ||
    "Property";
  const selectedPropertyObj = properties.find(
    (property) => String(property.id) === String(selectedProperty)
  );
  const maxPeopleAllowed = Number(selectedPropertyObj?.inspectionMaxPeople) || 3;

  const todayLabel = new Date().toLocaleDateString("en-US", {
    weekday: "long",
    month: "long",
    day: "numeric",
    year: "numeric"
  });

  const handleMaxPeopleChange = (value) => {
    const parsed = Number(value);
    const safeValue = Number.isFinite(parsed) && parsed > 0 ? parsed : 3;
    setProperties((prev) =>
      prev.map((property) =>
        String(property.id) === String(selectedProperty)
          ? { ...property, inspectionMaxPeople: safeValue }
          : property
      )
    );
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-[#0e1f42] dark:text-white mt-2">Inspection Slots</h1>
          <p className="text-sm text-gray-600 dark:text-gray-400">
            Auto schedule: next 5 working days, 9:00 AM - 5:00 PM, slots of 1 hour 30 min.
          </p>
        </div>
        <button
          onClick={() => navigate('/admin/inspections')}
          className="inline-flex items-center gap-2 px-4 py-2 text-[#9F7539] border border-[#9F7539]/20 hover:border-[#9F7539]/50 dark:hover:border-[#9F7539]/40 cursor-pointer transition duration-300 font-semibold rounded-lg"
        >
          View Bookings
        </button>
      </div>

      <section className="bg-white dark:bg-[#111827] rounded-xl border border-gray-100 dark:border-white/5 shadow-sm p-4 transition-colors">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3 items-end">
          <div>
            <label className="text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase tracking-wide mb-1 block">
              Select Property
            </label>
            <select
              value={selectedProperty}
              onChange={(event) => setSelectedProperty(event.target.value)}
              className="w-full border dark:border-white/10 rounded-lg p-2.5 text-sm bg-transparent dark:text-white outline-none cursor-pointer"
            >
              {properties.map((property) => (
                <option key={property.id} value={property.id} className="dark:bg-[#111827]">
                  {property.title}
                </option>
              ))}
            </select>
          </div>

          <div className="rounded-lg border border-[#9F7539]/30 bg-[#f8f3ed] dark:bg-[#9f7539]/10 px-3 py-2">
            <div className="text-[11px] font-semibold uppercase tracking-wide text-[#9F7539]">
              Today
            </div>
            <div className="text-sm font-semibold text-[#0e1f42] dark:text-white mt-0.5">
              {todayLabel}
            </div>
          </div>

          <div>
            <label className="text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase tracking-wide mb-1 block">
              Max People Allowed
            </label>
            <input
              type="number"
              min={1}
              max={12}
              value={maxPeopleAllowed}
              onChange={(event) => handleMaxPeopleChange(event.target.value)}
              className="w-full border dark:border-white/10 rounded-lg p-2.5 text-sm bg-transparent dark:text-white outline-none"
            />
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
              Default is 3 attendees per inspection booking.
            </p>
          </div>
        </div>
      </section>

      <section className="bg-white dark:bg-[#111827] rounded-xl border border-gray-100 dark:border-white/5 shadow-sm p-4 md:p-5 transition-colors">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-base font-semibold text-[#0e1f42] dark:text-white">
            {selectedTitle} Availability (Next 5 Working Days)
          </h2>
          <span className="text-xs text-gray-500 dark:text-gray-400">
            {scheduleRows.length} slot{scheduleRows.length === 1 ? "" : "s"}
          </span>
        </div>

        {scheduleRows.length === 0 ? (
          <div className="rounded-lg border border-dashed border-gray-300 dark:border-white/15 p-8 text-center text-sm text-gray-600 dark:text-gray-400">
            No schedule generated.
          </div>
        ) : (
          <div className="space-y-4">
            {Object.entries(groupedByDate).map(([date, rows]) => {
              const hasBookedOnDate = rows.some((row) => isBookedRow(row));
              const allBlocked = rows.every((row) => String(row.status).toLowerCase() === "blocked");

              return (
                <article
                  key={date}
                  className="rounded-lg border border-gray-200 dark:border-white/10 bg-gray-50/60 dark:bg-white/5 p-3"
                >
                  <div className="flex items-center justify-between gap-3 mb-3">
                    <div className="flex items-center gap-2 text-sm font-semibold text-[#0e1f42] dark:text-white">
                      <CalendarDays size={15} className="text-[#9F7539]" />
                      {formatDisplayDate(date)}
                    </div>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => toggleDateBlocked(date)}
                        disabled={hasBookedOnDate}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md border border-gray-200 dark:border-white/15 text-xs font-semibold text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-white/10 disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:bg-transparent"
                        title={hasBookedOnDate ? "This date has booked slots and cannot be changed" : undefined}
                      >
                        {allBlocked ? <ShieldCheck size={13} /> : <ShieldBan size={13} />}
                        {allBlocked ? "Unblock date" : "Block date"}
                      </button>
                      <button
                        onClick={() => deleteDate(date)}
                        disabled={hasBookedOnDate}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md border border-red-200 dark:border-red-500/30 text-xs font-semibold text-red-600 dark:text-red-300 hover:bg-red-50 dark:hover:bg-red-500/10 disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:bg-transparent"
                        title={hasBookedOnDate ? "This date has booked slots and cannot be deleted" : undefined}
                      >
                        <Trash2 size={13} />
                        Delete date
                      </button>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-2">
                    {rows.map((row) => {
                      const booked = isBookedRow(row);
                      const blocked = String(row.status).toLowerCase() === "blocked";
                      return (
                        <div
                          key={`${row.date}-${row.time}`}
                          className={`rounded-lg border border-gray-200 dark:border-white/10 bg-white dark:bg-[#0b1220] px-3 py-2 flex items-center justify-between gap-3 ${
                            booked ? "opacity-65 blur-[0.4px] select-none" : ""
                          }`}
                        >
                          <div>
                            <div className="flex items-center gap-2 text-sm font-semibold text-[#0e1f42] dark:text-white">
                              <Clock3 size={14} className="text-[#9F7539]" />
                              {row.time}
                            </div>
                            <div className="text-xs mt-1">
                              {booked ? (
                                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-red-100 text-red-700 dark:bg-red-500/10 dark:text-red-300">
                                  Booked
                                </span>
                              ) : blocked ? (
                                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-red-100 text-red-700 dark:bg-red-500/10 dark:text-red-300">
                                  Blocked
                                </span>
                              ) : (
                                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-green-100 text-green-700 dark:bg-green-500/10 dark:text-green-300">
                                  Available
                                </span>
                              )}
                            </div>
                          </div>
                          <div className="flex items-center gap-1">
                            <button
                              onClick={() => toggleSlotBlocked(row)}
                              disabled={booked}
                              className="h-8 w-8 rounded-md border border-gray-200 dark:border-white/15 hover:bg-gray-100 dark:hover:bg-white/10 text-gray-700 dark:text-gray-300 flex items-center justify-center disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:bg-transparent"
                              title={booked ? "Booked slot cannot be edited" : blocked ? "Unblock slot" : "Block slot"}
                            >
                              {blocked ? <ShieldCheck size={14} /> : <ShieldBan size={14} />}
                            </button>
                            <button
                              onClick={() => deleteSlot(row)}
                              disabled={booked}
                              className="h-8 w-8 rounded-md border border-red-200 dark:border-red-500/30 hover:bg-red-50 dark:hover:bg-red-500/10 text-red-600 dark:text-red-300 flex items-center justify-center disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:bg-transparent"
                              title={booked ? "Booked slot cannot be deleted" : "Delete slot"}
                            >
                              <Trash2 size={14} />
                            </button>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </article>
              );
            })}
          </div>
        )}
      </section>
    </div>
  );
};

export default AdminInspectionSlots;
