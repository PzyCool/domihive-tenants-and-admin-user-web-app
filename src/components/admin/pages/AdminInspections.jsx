import React, { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Search,
  Calendar,
  Clock,
  User,
  Building2,
  CheckCircle2,
  XCircle,
  Download,
  Eye,
  History
} from 'lucide-react';
import {
  readInspectionBookings,
  toInspectionRow,
  updateInspectionBookingStatus,
  ACTIVE_INSPECTION_BOOKING_STATUSES,
  FINAL_INSPECTION_BOOKING_STATUSES,
  INSPECTION_BOOKING_STATUSES
} from '../../shared/utils/inspectionBookings';

const ACTIVE_STATUSES = ACTIVE_INSPECTION_BOOKING_STATUSES;
const FINAL_STATUSES = FINAL_INSPECTION_BOOKING_STATUSES;
const TEST_MODE_KEY = 'domihive_testing_mode_inspections';

const parseInspectionDateTime = (dateNumeric, timeRange) => {
  if (!dateNumeric || !timeRange) return null;
  const startTime = String(timeRange).split(' - ')[0]?.trim() || '';
  const match = startTime.match(/^(\d{1,2}):(\d{2})(AM|PM)$/i);
  if (!match) return null;

  let hour = Number(match[1]);
  const minute = Number(match[2]);
  const meridian = match[3].toUpperCase();

  if (meridian === 'PM' && hour < 12) hour += 12;
  if (meridian === 'AM' && hour === 12) hour = 0;

  const date = new Date(`${dateNumeric}T00:00:00`);
  if (Number.isNaN(date.getTime())) return null;
  date.setHours(hour, minute, 0, 0);
  return date;
};

const formatCountdown = (targetDate) => {
  if (!targetDate) return 'Waiting';
  const diff = targetDate.getTime() - Date.now();
  if (diff <= 0) return 'Inspection time reached';

  const totalSeconds = Math.floor(diff / 1000);
  const days = Math.floor(totalSeconds / (24 * 60 * 60));
  const hours = Math.floor((totalSeconds % (24 * 60 * 60)) / (60 * 60));
  const minutes = Math.floor((totalSeconds % (60 * 60)) / 60);
  const seconds = totalSeconds % 60;

  if (days > 0) return `${days}d ${hours}h ${minutes}m ${seconds}s left`;
  return `${hours}h ${minutes}m ${seconds}s left`;
};

const AdminInspections = () => {
  const navigate = useNavigate();
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [sortBy, setSortBy] = useState('newest');
  const [rows, setRows] = useState([]);
  const [selectedRow, setSelectedRow] = useState(null);
  const [showHistoryDrawer, setShowHistoryDrawer] = useState(false);
  const [nowTick, setNowTick] = useState(Date.now());
  const [isTestingMode, setIsTestingMode] = useState(() => {
    try {
      return window.localStorage.getItem(TEST_MODE_KEY) === 'true';
    } catch (_error) {
      return false;
    }
  });

  const reloadRows = () => {
    const bookings = readInspectionBookings();
    setRows(bookings.map(toInspectionRow));
  };

  useEffect(() => {
    reloadRows();
    const timer = setInterval(reloadRows, 2500);
    const onStorage = (event) => {
      if (event.key === 'domihive_inspection_bookings') reloadRows();
    };
    window.addEventListener('storage', onStorage);
    return () => {
      clearInterval(timer);
      window.removeEventListener('storage', onStorage);
    };
  }, []);

  useEffect(() => {
    const timer = setInterval(() => setNowTick(Date.now()), 1000);
    return () => clearInterval(timer);
  }, []);

  const updateStatus = (bookingId, status) => {
    const changed = updateInspectionBookingStatus(bookingId, status);
    if (changed) reloadRows();
  };

  useEffect(() => {
    try {
      window.localStorage.setItem(TEST_MODE_KEY, isTestingMode ? 'true' : 'false');
    } catch (_error) {
      // ignore
    }
  }, [isTestingMode]);

  const activeRows = useMemo(
    () => rows.filter((row) => ACTIVE_STATUSES.includes(row.status)),
    [rows]
  );

  const historyRows = useMemo(
    () => rows.filter((row) => FINAL_STATUSES.includes(row.status)),
    [rows]
  );

  const filteredRows = useMemo(() => {
    let list = [...activeRows];

    if (search.trim()) {
      const q = search.toLowerCase();
      list = list.filter((a) =>
        `${a.applicantName} ${a.propertyTitle} ${a.unitCode}`.toLowerCase().includes(q)
      );
    }

    if (statusFilter !== 'all') {
      list = list.filter((a) => a.status === statusFilter);
    }

    if (sortBy === 'oldest') {
      list.sort(
        (a, b) =>
          new Date(a.bookedAtISO || a.dateNumeric).getTime() -
          new Date(b.bookedAtISO || b.dateNumeric).getTime()
      );
    } else {
      list.sort(
        (a, b) =>
          new Date(b.bookedAtISO || b.dateNumeric).getTime() -
          new Date(a.bookedAtISO || a.dateNumeric).getTime()
      );
    }

    return list;
  }, [activeRows, search, statusFilter, sortBy]);

  const inspectionSummary = useMemo(() => {
    const total = rows.length;
    const pending = rows.filter((a) => a.status === INSPECTION_BOOKING_STATUSES.PENDING_CONFIRMATION).length;
    const scheduled = rows.filter((a) => a.status === INSPECTION_BOOKING_STATUSES.SCHEDULED).length;
    const noShow = rows.filter((a) => a.status === INSPECTION_BOOKING_STATUSES.NO_SHOW).length;
    const completed = rows.filter((a) => a.status === INSPECTION_BOOKING_STATUSES.INSPECTION_COMPLETED).length;

    return [
      {
        label: 'Total Inspections',
        value: total,
        meta: `${total} bookings`,
        icon: <Calendar size={20} />,
        color: 'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300'
      },
      {
        label: 'Pending',
        value: pending,
        meta: `${pending} awaiting confirmation`,
        icon: <Clock size={20} />,
        color: 'bg-amber-100 text-amber-700 dark:bg-amber-500/10 dark:text-amber-400'
      },
      {
        label: 'Scheduled',
        value: scheduled,
        meta: `${scheduled} approved`,
        icon: <CheckCircle2 size={20} />,
        color: 'bg-green-100 text-green-700 dark:bg-green-500/10 dark:text-green-400'
      },
      {
        label: 'No-show',
        value: noShow,
        meta: `${noShow} missed`,
        icon: <XCircle size={20} />,
        color: 'bg-red-100 text-red-700 dark:bg-red-500/10 dark:text-red-400'
      },
      {
        label: 'Completed',
        value: completed,
        meta: `${completed} done`,
        icon: <CheckCircle2 size={20} />,
        color: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-400'
      }
    ];
  }, [rows]);

  const statusBadge = (status) => {
    if (status === INSPECTION_BOOKING_STATUSES.SCHEDULED) return 'bg-green-100 text-green-700 dark:bg-green-500/10 dark:text-green-400';
    if (status === INSPECTION_BOOKING_STATUSES.NO_SHOW) return 'bg-red-100 text-red-700 dark:bg-red-500/10 dark:text-red-400';
    if (status === INSPECTION_BOOKING_STATUSES.INSPECTION_COMPLETED) {
      return 'bg-emerald-100 text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-400';
    }
    if (status === INSPECTION_BOOKING_STATUSES.PENDING_CONFIRMATION) {
      return 'bg-amber-100 text-amber-700 dark:bg-amber-500/10 dark:text-amber-400';
    }
    return 'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300';
  };

  const canFinalize = (row) => {
    if (isTestingMode) return true;
    if (row.status !== INSPECTION_BOOKING_STATUSES.SCHEDULED) return false;
    const target = parseInspectionDateTime(row.dateNumeric, row.time);
    if (!target) return false;
    return target.getTime() <= nowTick;
  };

  const renderActionCell = (row, mobile = false) => {
    if (row.status === INSPECTION_BOOKING_STATUSES.SCHEDULED) {
      const target = parseInspectionDateTime(row.dateNumeric, row.time);
      const countdown = formatCountdown(target);
      const showFinalize = canFinalize(row);

      return (
        <div className={mobile ? 'flex-1 space-y-2' : 'flex justify-end whitespace-nowrap gap-2'}>
          <span className="inline-flex items-center px-3 py-1.5 rounded-md text-xs font-semibold border border-[#9F7539]/30 text-[#9F7539]">
            {isTestingMode ? `${countdown} (Test Override ON)` : countdown}
          </span>
          {showFinalize ? (
            <>
              <button
                onClick={() => updateStatus(row.bookingId, INSPECTION_BOOKING_STATUSES.NO_SHOW)}
                className="px-3 py-1.5 rounded-md bg-red-50 dark:bg-red-500/10 text-red-600 dark:text-red-400 text-xs font-semibold hover:bg-red-100 dark:hover:bg-red-500/20"
              >
                No-show
              </button>
              <button
                onClick={() => updateStatus(row.bookingId, INSPECTION_BOOKING_STATUSES.INSPECTION_COMPLETED)}
                className="px-3 py-1.5 rounded-md bg-emerald-50 dark:bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 text-xs font-semibold hover:bg-emerald-100 dark:hover:bg-emerald-500/20"
              >
                Inspection Completed
              </button>
            </>
          ) : null}
        </div>
      );
    }

    return null;
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-[#0e1f42] dark:text-white mt-2">Inspection Bookings</h1>
          <p className="text-sm text-gray-600 dark:text-gray-400">
            Track and verify unit inspection bookings from applicants
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2 text-sm">
          <button
            onClick={() => setIsTestingMode((prev) => !prev)}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg border font-semibold transition duration-300 ${
              isTestingMode
                ? 'border-amber-300 bg-amber-50 text-amber-700 dark:border-amber-500/40 dark:bg-amber-500/10 dark:text-amber-300'
                : 'border-gray-200 text-gray-700 dark:border-white/15 dark:text-gray-200'
            }`}
            title="Toggle inspection test override"
          >
            <Clock size={16} />
            {isTestingMode ? 'Testing Mode ON' : 'Testing Mode OFF'}
          </button>
          <button
            onClick={() => navigate('/admin/inspection-slots')}
            className="flex items-center gap-2 px-4 py-2 text-[#9F7539] border border-[#9F7539]/20 hover:border-[#9F7539]/50 dark:hover:border-[#9F7539]/40 cursor-pointer transition duration-300 font-semibold rounded-lg"
          >
            <Calendar size={16} /> Manage Slots
          </button>
          <button
            onClick={() => setShowHistoryDrawer(true)}
            className="flex items-center gap-2 px-4 py-2 text-[#0e1f42] dark:text-white border border-gray-200 dark:border-white/15 hover:border-[#9F7539]/40 cursor-pointer transition duration-300 font-semibold rounded-lg"
          >
            <History size={16} /> Booking History
          </button>
          <button className="flex items-center gap-2 px-4 py-2 text-[#9F7539] border border-[#9F7539]/20 hover:border-[#9F7539]/50 dark:hover:border-[#9F7539]/40 cursor-pointer transition duration-300 font-semibold rounded-lg">
            <Download size={16} /> Export List
          </button>
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-5 gap-2 md:gap-4">
        {inspectionSummary.map((card) => (
          <div
            key={card.label}
            className="bg-white dark:bg-[#111827] rounded-lg p-4 shadow-sm border border-gray-100 dark:border-white/5 flex items-center justify-between"
          >
            <div>
              <div className="text-xs text-gray-500 dark:text-gray-400 mb-0.5">{card.label}</div>
              <div className="text-xl font-bold text-[#0e1f42] dark:text-white">{card.value}</div>
              <div className="text-[10px] text-gray-400 dark:text-gray-500">{card.meta}</div>
            </div>
            <div className={`${card.color} rounded-lg p-2`}>{card.icon}</div>
          </div>
        ))}
      </div>

      <div className="bg-white dark:bg-[#111827] rounded-lg border border-gray-200 dark:border-white/10 p-4 flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <div className="relative w-full md:max-w-sm">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search applicant, property or unit..."
            className="w-full pl-9 pr-3 py-2 rounded-md border border-gray-200 dark:border-white/10 bg-transparent dark:text-white text-sm outline-none focus:border-[#9F7539]"
          />
        </div>

        <div className="flex flex-wrap gap-3">
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-3 py-2 rounded-md border border-gray-200 dark:border-white/10 bg-transparent dark:text-white text-sm outline-none cursor-pointer"
          >
            <option value="all" className="dark:bg-[#111827]">All Status</option>
            {ACTIVE_STATUSES.map((status) => (
              <option key={status} value={status} className="dark:bg-[#111827]">
                {status}
              </option>
            ))}
          </select>

          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            className="px-3 py-2 rounded-md border border-gray-200 dark:border-white/10 bg-transparent dark:text-white text-sm outline-none cursor-pointer"
          >
            <option value="newest" className="dark:bg-[#111827]">Sort: Newest</option>
            <option value="oldest" className="dark:bg-[#111827]">Sort: Oldest</option>
          </select>

          <div className="text-xs text-gray-500 dark:text-gray-400 flex items-center px-2">
            Showing <span className="font-semibold text-[#0e1f42] dark:text-white mx-1">{filteredRows.length}</span>
            inspections
          </div>
        </div>
      </div>

      <div className="hidden md:block bg-white dark:bg-[#111827] border border-gray-200 dark:border-white/10 rounded-xl shadow-sm overflow-x-auto">
        <table className="w-full text-sm text-left">
          <thead className="bg-gray-50 dark:bg-gray-900/50 text-gray-600 dark:text-gray-400 text-xs uppercase tracking-wide">
            <tr>
              <th className="py-3 px-6 font-semibold">Applicant</th>
              <th className="py-3 px-6 font-semibold">Property / Unit</th>
              <th className="py-3 px-6 font-semibold">Date & Time</th>
              <th className="py-3 px-6 font-semibold">Status</th>
              <th className="py-3 px-6 text-right font-semibold">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100 dark:divide-white/5">
            {filteredRows.map((insp) => (
              <tr key={insp.id} className="hover:bg-gray-50 dark:hover:bg-white/5 transition-colors">
                <td className="py-4 px-6">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-gray-100 dark:bg-gray-800 flex items-center justify-center">
                      <User size={14} className="text-gray-500" />
                    </div>
                    <div>
                      <div className="font-semibold text-[#0e1f42] dark:text-white whitespace-nowrap text-sm">
                        {insp.applicantName}
                      </div>
                      <div className="text-[11px] text-gray-500 dark:text-gray-400">
                        {insp.applicantPhone || insp.applicantEmail || 'No contact'}
                      </div>
                    </div>
                  </div>
                </td>
                <td className="py-4 px-6">
                  <div className="flex items-center gap-2 text-gray-700 dark:text-gray-300 text-xs">
                    <Building2 size={12} className="text-gray-400 shrink-0" />
                    <div>
                      <div className="font-semibold text-[#0e1f42] dark:text-white">{insp.propertyTitle}</div>
                      <div className="text-[11px] text-gray-500 dark:text-gray-400">Unit: {insp.unitCode}</div>
                    </div>
                  </div>
                </td>
                <td className="py-4 px-6 text-gray-600 dark:text-gray-400 text-xs font-medium">
                  <div>{insp.dateNumeric}</div>
                  <div className="text-[11px]">{insp.dateWords}</div>
                  <div className="text-[11px] font-semibold text-[#9F7539] mt-1">{insp.time}</div>
                </td>
                <td className="py-4 px-6">
                  <span className={`inline-flex px-2.5 py-1 rounded-full text-[10px] font-bold ${statusBadge(insp.status)}`}>
                    {insp.status}
                  </span>
                </td>
                <td className="py-4 px-6">
                  <div className="flex justify-end whitespace-nowrap gap-2 items-center mr-4">
                    {insp.status === INSPECTION_BOOKING_STATUSES.PENDING_CONFIRMATION ? (
                      <button
                        onClick={() => updateStatus(insp.bookingId, INSPECTION_BOOKING_STATUSES.SCHEDULED)}
                        className="mr-4 px-3 py-1.5 rounded-md bg-green-50 dark:bg-green-500/10 text-green-700 dark:text-green-400 text-xs font-semibold hover:bg-green-100 dark:hover:bg-green-500/20 animate-pulse"
                      >
                        Schedule
                      </button>
                    ) : (
                      renderActionCell(insp)
                    )}
                    <button
                      onClick={() => setSelectedRow(insp)}
                      className="h-8 w-8 rounded-md border border-gray-200 dark:border-white/15 hover:bg-gray-100 dark:hover:bg-white/10 text-gray-700 dark:text-gray-300 flex items-center justify-center"
                      title="View booking details"
                    >
                      <Eye size={14} />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="md:hidden space-y-3">
        {filteredRows.map((insp) => (
          <div key={insp.id} className="bg-white dark:bg-[#111827] border border-gray-200 dark:border-white/10 rounded-xl shadow-sm p-4">
            <div className="flex items-start justify-between gap-3 px-1">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-gray-50 dark:bg-gray-800 flex items-center justify-center">
                  <User size={18} className="text-gray-400" />
                </div>
                <div>
                  <p className="font-semibold text-[#0e1f42] dark:text-white text-sm">{insp.applicantName}</p>
                  <p className="text-[10px] text-gray-500 dark:text-gray-400 flex items-center gap-1">
                    <Building2 size={10} /> {insp.propertyTitle} - {insp.unitCode}
                  </p>
                </div>
              </div>
              <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold ${statusBadge(insp.status)}`}>
                {insp.status}
              </span>
            </div>

            <div className="mt-4 grid grid-cols-1 gap-2 pb-4 border-b border-gray-50 dark:border-white/5 text-[11px] text-gray-600 dark:text-gray-400">
              <div className="flex items-center gap-2 px-1">
                <Calendar size={12} className="text-gray-400" /> {insp.dateWords}
              </div>
              <div className="flex items-center gap-2 px-1">
                <Clock size={12} className="text-gray-400" /> {insp.time}
              </div>
            </div>

            <div className="mt-4 flex gap-2 items-start">
              <button
                onClick={() => setSelectedRow(insp)}
                className="py-2 px-3 border border-gray-200 dark:border-white/10 rounded-lg text-xs font-semibold"
              >
                <Eye size={14} />
              </button>
              {insp.status === INSPECTION_BOOKING_STATUSES.PENDING_CONFIRMATION ? (
                <button
                  onClick={() => updateStatus(insp.bookingId, INSPECTION_BOOKING_STATUSES.SCHEDULED)}
                  className="flex-1 py-2 px-3 rounded-lg bg-green-50 dark:bg-green-500/10 text-green-700 dark:text-green-400 text-xs font-semibold animate-pulse"
                >
                  Schedule
                </button>
              ) : (
                <div className="flex-1 space-y-2">
                  <span className="block py-2 px-3 rounded-lg border border-[#9F7539]/30 text-[#9F7539] text-xs font-semibold text-center">
                    {formatCountdown(parseInspectionDateTime(insp.dateNumeric, insp.time))}
                  </span>
                  {canFinalize(insp) ? (
                    <div className="flex gap-2">
                      <button
                        onClick={() => updateStatus(insp.bookingId, INSPECTION_BOOKING_STATUSES.NO_SHOW)}
                        className="flex-1 py-2 px-3 rounded-lg bg-red-50 dark:bg-red-500/10 text-red-600 dark:text-red-400 text-xs font-semibold"
                      >
                        No-show
                      </button>
                      <button
                        onClick={() => updateStatus(insp.bookingId, INSPECTION_BOOKING_STATUSES.INSPECTION_COMPLETED)}
                        className="flex-1 py-2 px-3 rounded-lg bg-emerald-50 dark:bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 text-xs font-semibold"
                      >
                        Completed
                      </button>
                    </div>
                  ) : null}
                </div>
              )}
            </div>
          </div>
        ))}
      </div>

      {selectedRow && (
        <div className="fixed inset-0 z-[1300] bg-black/40">
          <div className="absolute inset-y-0 right-0 w-full max-w-lg bg-white dark:bg-[#111827] border-l border-gray-200 dark:border-white/10 shadow-xl overflow-y-auto">
            <div className="px-6 py-4 min-h-[76px] border-b border-gray-100 dark:border-white/10 flex items-center justify-between">
              <h3 className="text-base font-semibold text-[#0e1f42] dark:text-white">Inspection Booking Details</h3>
              <button onClick={() => setSelectedRow(null)} className="text-gray-500 hover:text-gray-700 dark:text-gray-300">✕</button>
            </div>
            <div className="p-4 space-y-3 text-sm">
              <div><span className="text-gray-500 dark:text-gray-400">Applicant:</span> <span className="font-semibold text-[#0e1f42] dark:text-white">{selectedRow.applicantName}</span></div>
              <div><span className="text-gray-500 dark:text-gray-400">Phone:</span> <span className="text-[#0e1f42] dark:text-white">{selectedRow.applicantPhone || 'N/A'}</span></div>
              <div><span className="text-gray-500 dark:text-gray-400">Email:</span> <span className="text-[#0e1f42] dark:text-white">{selectedRow.applicantEmail || 'N/A'}</span></div>
              <div><span className="text-gray-500 dark:text-gray-400">Property:</span> <span className="text-[#0e1f42] dark:text-white">{selectedRow.propertyTitle}</span></div>
              <div><span className="text-gray-500 dark:text-gray-400">Unit:</span> <span className="text-[#0e1f42] dark:text-white">{selectedRow.unitCode}</span></div>
              <div><span className="text-gray-500 dark:text-gray-400">Date:</span> <span className="text-[#0e1f42] dark:text-white">{selectedRow.dateWords} ({selectedRow.dateNumeric})</span></div>
              <div><span className="text-gray-500 dark:text-gray-400">Time:</span> <span className="text-[#0e1f42] dark:text-white">{selectedRow.time}</span></div>
              <div><span className="text-gray-500 dark:text-gray-400">Attendees:</span> <span className="text-[#0e1f42] dark:text-white">{selectedRow.attendees}</span></div>
              <div><span className="text-gray-500 dark:text-gray-400">Status:</span> <span className={`px-2 py-0.5 rounded-full text-xs font-semibold ${statusBadge(selectedRow.status)}`}>{selectedRow.status}</span></div>
              {selectedRow.notes ? (
                <div><span className="text-gray-500 dark:text-gray-400">Notes:</span> <span className="text-[#0e1f42] dark:text-white">{selectedRow.notes}</span></div>
              ) : null}
            </div>
          </div>
        </div>
      )}

      {showHistoryDrawer && (
        <div className="fixed inset-0 z-[1290] bg-black/40">
          <div className="absolute inset-y-0 right-0 w-full max-w-xl bg-white dark:bg-[#111827] border-l border-gray-200 dark:border-white/10 shadow-xl overflow-y-auto">
            <div className="px-6 py-4 min-h-[76px] border-b border-gray-100 dark:border-white/10 flex items-center justify-between">
              <h3 className="text-base font-semibold text-[#0e1f42] dark:text-white">Booking History</h3>
              <button onClick={() => setShowHistoryDrawer(false)} className="text-gray-500 hover:text-gray-700 dark:text-gray-300">✕</button>
            </div>
            <div className="p-4 space-y-3">
              {!historyRows.length ? (
                <div className="rounded-lg border border-dashed border-gray-300 dark:border-white/20 p-6 text-center text-sm text-gray-500 dark:text-gray-400">
                  No booking history yet.
                </div>
              ) : (
                historyRows.map((row) => (
                  <div key={`hist-${row.id}`} className="rounded-lg border border-gray-200 dark:border-white/10 p-3 bg-gray-50/60 dark:bg-white/5">
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <p className="font-semibold text-[#0e1f42] dark:text-white text-sm">{row.applicantName}</p>
                        <p className="text-xs text-gray-500 dark:text-gray-400">{row.propertyTitle} - Unit {row.unitCode}</p>
                        <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">{row.dateWords} - {row.time}</p>
                      </div>
                      <span className={`px-2 py-0.5 rounded-full text-[10px] font-semibold ${statusBadge(row.status)}`}>{row.status}</span>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminInspections;
