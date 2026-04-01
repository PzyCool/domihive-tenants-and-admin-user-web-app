// src/components/admin/pages/AdminApplications.jsx
import React, { useMemo, useState } from "react";
import { useAdmin } from "../../../context/AdminContext";
import {
  Download,
  FilePlusCorner,
  Search,
  Eye,
  X,
  CheckCircle2,
  UserCircle2,
  BedDouble,
  Bath,
  Ruler,
  Building2,
  MapPin,
  FileText,
  CreditCard
} from "lucide-react";
import { formatDateTimeDDMMYY } from "../../shared/utils/dateFormat";

const AdminApplications = () => {
  const { applications, setApplications, tenants, setTenants } = useAdmin();

  // ===== Filters (simple) =====
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all"); // all | Submitted | Under Review | Approved | Rejected
  const [sortBy, setSortBy] = useState("newest"); // newest | oldest | sla
  const [selectedApplication, setSelectedApplication] = useState(null);
  const [isHistoryOpen, setIsHistoryOpen] = useState(false);
  const [rejectTarget, setRejectTarget] = useState(null);
  const [rejectReason, setRejectReason] = useState("");
  const [isDecisionLoading, setIsDecisionLoading] = useState(false);

  const rejectionReasons = [
    "Applicant does not meet requirements for this unit",
    "Incomplete or invalid documents submitted",
    "Identity verification was unsuccessful",
    "Payment or financial review did not pass",
    "Duplicate or conflicting application"
  ];

  const updateStatus = (id, status, extra = {}) => {
    const decisionAt = new Date().toISOString();
    let updatedRecord = null;
    setApplications((prev) =>
      prev.map((a) => {
        if (a.id !== id) return a;
        updatedRecord = {
          ...a,
          status,
          decisionAt,
          ...extra
        };
        return updatedRecord;
      })
    );

    if (status === "Approved" && updatedRecord) {
      setTenants((prev) => {
        const exists = prev.some((tenant) => String(tenant.applicationId || "") === String(id));
        if (exists) return prev;
        const leaseStart = new Date();
        const leaseEnd = new Date();
        leaseEnd.setFullYear(leaseEnd.getFullYear() + 1);
        const tenantRow = {
          id: `TEN-${Date.now().toString().slice(-6)}`,
          applicationId: id,
          name: updatedRecord.applicant || "Tenant",
          phone:
            updatedRecord?.applicantProfile?.phone ||
            updatedRecord?.contact ||
            "—",
          email:
            updatedRecord?.applicantProfile?.email ||
            "—",
          propertyTitle: updatedRecord.propertyTitle || updatedRecord?.property?.title || "Property",
          propertyId: updatedRecord.propertyId || updatedRecord?.property?.id || "",
          unitCode: updatedRecord.unitNumber || updatedRecord?.property?.unitCode || "—",
          unitNumber: updatedRecord.unitNumber || updatedRecord?.property?.unitCode || "—",
          leaseStart: leaseStart.toISOString().slice(0, 10),
          leaseEnd: leaseEnd.toISOString().slice(0, 10),
          rent: Number(updatedRecord?.property?.price || updatedRecord.rent || 0),
          rentAmount: Number(updatedRecord?.property?.price || updatedRecord.rent || 0),
          paymentStatus:
            Number(updatedRecord?.payment?.amount || 0) > 0 ||
            String(updatedRecord?.payment?.method || "").trim()
              ? "Paid"
              : "Pending",
          status: "Move-in pending"
        };
        return [tenantRow, ...prev];
      });
    }
  };

  // ===== Add SLA hoursLeft (use app.slaHours if you have it, else fallback to 72h) =====
  const rows = useMemo(() => {
    return applications.map((app) => {
      const submittedDate = new Date(app.submittedAt);
      const slaHours = Number(app.slaHours ?? 72);
      const due = new Date(submittedDate.getTime() + slaHours * 60 * 60 * 1000);
      const now = new Date();
      const hoursLeft = Math.max(0, Math.ceil((due - now) / (1000 * 60 * 60)));
      const isOverdue = due - now < 0;

      return { ...app, slaHours, hoursLeft, isOverdue, dueAt: due.toISOString() };
    });
  }, [applications]);

  // ===== Filter + sort =====
  const filteredRows = useMemo(() => {
    let list = [...rows];

    // search (applicant + property)
    if (search.trim()) {
      const q = search.toLowerCase();
      list = list.filter((a) =>
        `${a.applicant} ${a.propertyTitle} ${a.id}`
          .toLowerCase()
          .includes(q)
      );
    }

    // status
    if (statusFilter !== "all") {
      list = list.filter((a) => a.status === statusFilter);
    } else {
      // Queue view: only pending work. Approved/Rejected are moved to history drawer.
      list = list.filter((a) => ["Submitted", "Under Review"].includes(a.status));
    }

    // sort
    if (sortBy === "oldest") {
      list.sort((a, b) => new Date(a.submittedAt) - new Date(b.submittedAt));
    } else if (sortBy === "sla") {
      // priority: overdue first, then least hours left
      list.sort((a, b) => {
        if (a.isOverdue !== b.isOverdue) return a.isOverdue ? -1 : 1;
        return a.hoursLeft - b.hoursLeft;
      });
    } else {
      // newest
      list.sort((a, b) => new Date(b.submittedAt) - new Date(a.submittedAt));
    }

    return list;
  }, [rows, search, statusFilter, sortBy]);

  // ===== Summary cards =====
  const applicaionSummary = useMemo(() => {
    const total = applications.length;
    const underReview = applications.filter((a) => a.status === "Under Review").length;
    const approved = applications.filter((a) => a.status === "Approved").length;
    const rejected = applications.filter((a) => a.status === "Rejected").length;

    return [
      {
        label: "Total Applications",
        value: total,
        meta: `${total} applications`,
        icon: <FilePlusCorner size={20} />,
        color: "bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300",
      },
      {
        label: "Under Review",
        value: underReview,
        meta: `${underReview} applications`,
        icon: <FilePlusCorner size={20} />,
        color: "bg-amber-100 text-amber-700 dark:bg-amber-500/10 dark:text-amber-400",
      },
      {
        label: "Approved",
        value: approved,
        meta: `${approved} applications`,
        icon: <FilePlusCorner size={20} />,
        color: "bg-green-100 text-green-700 dark:bg-green-500/10 dark:text-green-400",
      },
      {
        label: "Rejected",
        value: rejected,
        meta: `${rejected} applications`,
        icon: <FilePlusCorner size={20} />,
        color: "bg-red-100 text-red-700 dark:bg-red-500/10 dark:text-red-400",
      },
    ];
  }, [applications]);

  const statusBadge = (status) => {
    if (status === "Approved") return "bg-green-100 text-green-700 dark:bg-green-500/10 dark:text-green-400";
    if (status === "Rejected") return "bg-red-100 text-red-700 dark:bg-red-500/10 dark:text-red-400";
    if (status === "Submitted") return "bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300";
    return "bg-amber-100 text-amber-700 dark:bg-amber-500/10 dark:text-amber-400"; // Under Review or others
  };

  const historyRows = useMemo(
    () =>
      [...applications]
        .filter((item) => ["Approved", "Rejected"].includes(item?.status))
        .sort((a, b) => new Date(b.submittedAt) - new Date(a.submittedAt)),
    [applications]
  );

  const formatNaira = (value) => {
    const amount = Number(value || 0);
    if (!Number.isFinite(amount)) return "₦0";
    return `₦${amount.toLocaleString()}`;
  };

  const amountToWords = (value) => {
    const amount = Number(value || 0);
    if (!Number.isFinite(amount) || amount <= 0) return "0 naira";
    if (amount >= 1_000_000_000) return `${(amount / 1_000_000_000).toFixed(1)} billion naira`;
    if (amount >= 1_000_000) return `${(amount / 1_000_000).toFixed(1)} million naira`;
    if (amount >= 1_000) return `${(amount / 1_000).toFixed(1)} thousand naira`;
    return `${amount.toLocaleString()} naira`;
  };

  const openReviewDrawer = (app) => {
    setSelectedApplication(app);
  };

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-[#0e1f42] dark:text-white mt-2">Application Queue</h1>
          <p className="text-sm text-gray-600 dark:text-gray-400">
            Manage tenants application and track unit status
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2 text-sm">
          <button className="flex items-center gap-2 px-4 py-2 text-(--accent-color) border border-(--accent-color)/20 hover:border-(--accent-color)/50 dark:hover:border-(--accent-color)/40 cursor-pointer transition duration-300 font-semibold rounded-lg">
            <Download size={16} /> Export List
          </button>
          <button
            onClick={() => setIsHistoryOpen(true)}
            className="flex items-center gap-2 px-4 py-2 bg-(--accent-color) text-white hover:bg-(--accent-color)/90 cursor-pointer transition duration-300 font-semibold rounded-lg"
          >
            <FileText size={16} /> Application History
          </button>
        </div>
      </div>

      {/* Summary */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-2 md:gap-4">
        {applicaionSummary.map((card) => (
          <div
            key={card.label}
            className="bg-white dark:bg-[#111827] rounded-lg p-4 shadow border border-gray-100 dark:border-white/5 flex items-center justify-between"
          >
            <div>
              <div className="text-sm text-gray-500 dark:text-gray-400">{card.label}</div>
              <div className="text-2xl font-bold text-[#0e1f42] dark:text-white">{card.value}</div>
              <div className="text-xs text-gray-600 dark:text-gray-400">{card.meta}</div>
            </div>
            <div className={`${card.color} rounded-lg p-2`}>{card.icon}</div>
          </div>
        ))}
      </div>

      {/* Filters */}
      <div className="bg-white dark:bg-[#111827] rounded-lg border border-gray-200 dark:border-white/10 p-4 flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        {/* Search */}
        <div className="relative w-full md:max-w-sm">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search applicant, property..."
            className="w-full pl-9 pr-3 py-2 rounded-md border border-gray-200 dark:border-white/10 bg-transparent dark:text-white text-sm outline-none focus:border-[#9F7539]"
          />
        </div>

        <div className="flex flex-wrap gap-3">
          {/* Status */}
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-3 py-2 rounded-md border border-gray-200 dark:border-white/10 bg-transparent dark:text-white text-sm"
          >
            <option value="all" className="dark:bg-[#111827]">All Status</option>
            <option value="Submitted" className="dark:bg-[#111827]">Submitted</option>
            <option value="Under Review" className="dark:bg-[#111827]">Under Review</option>
            <option value="Approved" className="dark:bg-[#111827]">Approved</option>
            <option value="Rejected" className="dark:bg-[#111827]">Rejected</option>
          </select>

          {/* Sort */}
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            className="px-3 py-2 rounded-md border border-gray-200 dark:border-white/10 bg-transparent dark:text-white text-sm"
          >
            <option value="newest" className="dark:bg-[#111827]">Sort: Newest</option>
            <option value="oldest" className="dark:bg-[#111827]">Sort: Oldest</option>
            <option value="sla" className="dark:bg-[#111827]">Sort: SLA (Urgent first)</option>
          </select>

          <div className="text-xs text-gray-500 dark:text-gray-400 flex items-center px-2">
            Showing <span className="font-semibold text-[#0e1f42] dark:text-white mx-1">{filteredRows.length}</span>
            applications
          </div>
        </div>
      </div>

      {/* Desktop table */}
      <div className="hidden md:block bg-white dark:bg-[#111827] border border-gray-200 dark:border-white/10 rounded-xl shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 dark:bg-gray-900/50 text-gray-600 dark:text-gray-400 text-xs uppercase tracking-wide">
              <tr>
                <th className="py-3 px-4 text-left font-semibold">Applicant</th>
                <th className="py-3 px-4 text-left font-semibold">Property</th>
                <th className="py-3 px-4 text-left font-semibold">Submitted</th>
                <th className="py-3 px-4 text-left font-semibold">SLA</th>
                <th className="py-3 px-4 text-left font-semibold">Status</th>
                <th className="py-3 px-4 text-right font-semibold">Actions</th>
              </tr>
            </thead>

            <tbody className="divide-y divide-gray-100 dark:divide-white/5">
              {filteredRows.map((app) => (
                <tr key={app.id} className="hover:bg-gray-50 dark:hover:bg-white/5 transition-colors">
                  <td className="py-3 px-4 text-xs">
                    <div className="font-semibold text-[#0e1f42] dark:text-white">{app.applicant}</div>
                    <div className="text-xs text-gray-500 dark:text-gray-400">ID: {app.id}</div>
                  </td>

                  <td className="py-3 px-4 text-gray-700 dark:text-gray-300 text-xs">{app.propertyTitle}</td>

                  <td className="py-3 px-4 text-gray-600 dark:text-gray-400 text-xs">
                    {formatDateTimeDDMMYY(app.submittedAt)}
                  </td>

                  {/* sla */}
                  <td className="py-3 px-4">
                    <span
                      className={`text-xs font-medium ${app.isOverdue
                        ? "text-red-600"
                        : app.hoursLeft <= 6
                          ? "text-amber-700"
                          : "text-gray-600"
                        }`}
                    >
                      {app.isOverdue ? "Overdue" : `Due in ${app.hoursLeft}h`}
                    </span>
                  </td>

                  {/* status */}
                  <td className="py-3 px-4">
                    <span className={`px-2.5 py-1 rounded-full text-[10px] font-semibold ${statusBadge(app.status)}`}>
                      {app.status}
                    </span>
                  </td>

                  {/* ctas */}
                  <td className="py-3 px-4">
                    <div className="flex justify-end gap-2">
                      <button
                        onClick={() => openReviewDrawer(app)}
                        className="px-3 py-1.5 rounded-md border border-gray-200 dark:border-white/10 text-gray-700 dark:text-gray-300 text-xs font-medium hover:bg-gray-50 dark:hover:bg-white/5"
                      >
                        Review
                      </button>
                    </div>
                  </td>
                </tr>
              ))}

              {filteredRows.length === 0 && (
                <tr>
                  <td colSpan={6} className="py-10 text-center text-sm text-gray-500">
                    No applications match your filters.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Mobile cards */}
      <div className="md:hidden space-y-3">
        {filteredRows.map((app) => (
          <div
            key={app.id}
            className="bg-white dark:bg-[#111827] border border-gray-200 dark:border-white/10 rounded-xl shadow-sm p-4"
          >
            {/* Top row */}
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="font-semibold text-[#0e1f42] dark:text-white">{app.applicant}</p>
                <p className="text-xs text-gray-500 dark:text-gray-400">ID: {app.id}</p>
              </div>

              <span className={`px-2.5 py-1 rounded-full text-[11px] font-semibold ${statusBadge(app.status)}`}>
                {app.status}
              </span>
            </div>

            {/* Property */}
            <div className="mt-3">
              <p className="text-xs text-gray-500 dark:text-gray-400">Property</p>
              <p className="text-sm text-gray-700 dark:text-gray-300">{app.propertyTitle}</p>
            </div>

            {/* Submitted + SLA */}
            <div className="mt-3 grid grid-cols-2 gap-3">
              <div>
                <p className="text-xs text-gray-500 dark:text-gray-400">Submitted</p>
                <p className="text-xs text-gray-700 dark:text-gray-300">
                  {formatDateTimeDDMMYY(app.submittedAt)}
                </p>
              </div>

              <div className="text-right">
                <p className="text-xs text-gray-500 dark:text-gray-400">SLA</p>
                <p
                  className={`text-xs font-medium ${app.isOverdue
                    ? "text-red-600"
                    : app.hoursLeft <= 6
                      ? "text-amber-700"
                      : "text-gray-700"
                    }`}
                >
                  {app.isOverdue ? "Overdue" : `Due in ${app.hoursLeft}h`}
                </p>
              </div>
            </div>

            {/* Actions */}
            <div className="mt-4 grid grid-cols-1 gap-2">
              <button
                onClick={() => openReviewDrawer(app)}
                className="py-2 rounded-lg border border-gray-200 dark:border-white/10 text-xs font-semibold text-gray-700 dark:text-gray-300 dark:hover:bg-white/5 transition-colors"
              >
                Review
              </button>
            </div>
          </div>
        ))}

        {filteredRows.length === 0 && (
          <div className="bg-white border border-gray-200 rounded-xl p-10 text-center text-sm text-gray-500">
            No applications match your filters.
          </div>
        )}
      </div>

      {selectedApplication && (
        <div className="fixed inset-0 z-[1300]">
          <div
            className="absolute inset-0 bg-black/35"
            onClick={() => setSelectedApplication(null)}
          />
          <aside className="absolute top-0 right-0 h-full w-full max-w-2xl bg-white dark:bg-[#0b1220] border-l border-gray-200 dark:border-white/10 shadow-2xl overflow-y-auto">
            <div className="px-6 py-4 min-h-[76px] border-b border-gray-200 dark:border-white/10 flex items-center justify-between">
              <h3 className="text-lg font-semibold text-[#0e1f42] dark:text-white">Applicant Review</h3>
              <button
                onClick={() => setSelectedApplication(null)}
                className="h-8 w-8 rounded-md border border-gray-200 dark:border-white/10 text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-white/5 flex items-center justify-center"
              >
                <X size={16} />
              </button>
            </div>

            <div className="p-5 space-y-4 text-sm">
              <section className="rounded-xl border border-gray-200 dark:border-white/10 bg-gray-50 dark:bg-white/5 p-4">
                <div className="flex items-start gap-3">
                  {selectedApplication?.applicantProfile?.profileImage ? (
                    <img
                      src={selectedApplication.applicantProfile.profileImage}
                      alt={selectedApplication.applicant || "Applicant"}
                      className="h-14 w-14 rounded-full object-cover border border-gray-200 dark:border-white/10"
                    />
                  ) : (
                    <div className="h-14 w-14 rounded-full border border-gray-200 dark:border-white/10 bg-white/70 dark:bg-white/10 flex items-center justify-center text-gray-400">
                      <UserCircle2 size={26} />
                    </div>
                  )}
                  <div className="min-w-0 flex-1">
                    <p className="text-base font-semibold text-[#0e1f42] dark:text-white">
                      {selectedApplication.applicant || "Applicant"}
                    </p>
                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                      {selectedApplication?.applicantProfile?.email || "No email submitted"}
                    </p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                      {selectedApplication?.applicantProfile?.phone || "No phone submitted"}
                    </p>
                  </div>
                  <span className={`px-2.5 py-1 rounded-full text-[10px] font-semibold ${statusBadge(selectedApplication.status)}`}>
                    {selectedApplication.status}
                  </span>
                </div>
              </section>

              <section className="rounded-xl border border-gray-200 dark:border-white/10 p-4">
                <p className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-3">Application Form</p>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
                  <div><span className="text-gray-500 dark:text-gray-400">Application ID:</span> <span className="font-medium text-[#0e1f42] dark:text-white">{selectedApplication.id}</span></div>
                  <div><span className="text-gray-500 dark:text-gray-400">Submitted:</span> <span className="font-medium text-[#0e1f42] dark:text-white">{formatDateTimeDDMMYY(selectedApplication.submittedAt)}</span></div>
                  <div><span className="text-gray-500 dark:text-gray-400">Date of Birth:</span> <span className="font-medium text-[#0e1f42] dark:text-white">{selectedApplication?.applicantProfile?.dateOfBirth || "—"}</span></div>
                  <div><span className="text-gray-500 dark:text-gray-400">Sex:</span> <span className="font-medium text-[#0e1f42] dark:text-white">{selectedApplication?.applicantProfile?.sex || "—"}</span></div>
                  <div><span className="text-gray-500 dark:text-gray-400">Occupation:</span> <span className="font-medium text-[#0e1f42] dark:text-white">{selectedApplication?.applicantProfile?.occupation || "—"}</span></div>
                  <div><span className="text-gray-500 dark:text-gray-400">Marital Status:</span> <span className="font-medium text-[#0e1f42] dark:text-white">{selectedApplication?.applicantProfile?.maritalStatus || "—"}</span></div>
                  <div><span className="text-gray-500 dark:text-gray-400">Occupants:</span> <span className="font-medium text-[#0e1f42] dark:text-white">{selectedApplication?.applicantProfile?.occupants || "—"}</span></div>
                  <div><span className="text-gray-500 dark:text-gray-400">SLA:</span> <span className={`font-medium ${selectedApplication.isOverdue ? "text-red-500" : "text-[#0e1f42] dark:text-white"}`}>{selectedApplication.isOverdue ? "Overdue" : `Due in ${selectedApplication.hoursLeft}h`}</span></div>
                </div>
                {selectedApplication?.applicantProfile?.notes && (
                  <div className="mt-3 rounded-lg border border-gray-200 dark:border-white/10 p-3 text-xs text-gray-600 dark:text-gray-300">
                    <span className="font-semibold text-[#0e1f42] dark:text-white">Additional notes:</span> {selectedApplication.applicantProfile.notes}
                  </div>
                )}
                {selectedApplication?.rejectionReason && (
                  <div className="mt-3 rounded-lg border border-red-200 dark:border-red-500/20 bg-red-50/70 dark:bg-red-500/10 p-3 text-xs text-red-700 dark:text-red-300">
                    <span className="font-semibold">Rejection reason:</span> {selectedApplication.rejectionReason}
                    {selectedApplication?.refundETA ? (
                      <span className="block mt-1">Refund ETA: {selectedApplication.refundETA}</span>
                    ) : null}
                  </div>
                )}
              </section>

              <section className="rounded-xl border border-gray-200 dark:border-white/10 p-4">
                <p className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-3 flex items-center gap-2">
                  <FileText size={14} /> Application Document
                </p>
                <div className="flex items-center justify-between rounded-lg border border-gray-200 dark:border-white/10 bg-gray-50 dark:bg-white/5 px-3 py-2">
                  <div className="min-w-0">
                    <p className="text-xs text-gray-500 dark:text-gray-400">Government ID</p>
                    <p className="text-sm font-medium text-[#0e1f42] dark:text-white truncate">
                      {selectedApplication?.applicantDocs?.governmentIdFileName || "No document uploaded"}
                    </p>
                  </div>
                  {selectedApplication?.applicantDocs?.governmentIdFileName && (
                    <span className="inline-flex items-center gap-1 rounded-full bg-emerald-500/15 px-2.5 py-1 text-xs font-semibold text-emerald-500">
                      <CheckCircle2 size={12} /> Uploaded
                    </span>
                  )}
                </div>

                {selectedApplication?.applicantDocs?.governmentIdPreview ? (
                  <div className="mt-3 rounded-lg border border-gray-200 dark:border-white/10 overflow-hidden bg-white dark:bg-[#0f1a31]">
                    {String(selectedApplication?.applicantDocs?.governmentIdMimeType || '').includes('pdf') ? (
                      <iframe
                        title="Government ID Preview"
                        src={selectedApplication.applicantDocs.governmentIdPreview}
                        className="w-full h-72"
                      />
                    ) : (
                      <img
                        src={selectedApplication.applicantDocs.governmentIdPreview}
                        alt="Government ID Preview"
                        className="w-full max-h-80 object-contain bg-gray-100 dark:bg-white/5"
                      />
                    )}
                  </div>
                ) : (
                  <p className="mt-3 text-xs text-amber-600 dark:text-amber-400">
                    Preview unavailable for this upload.
                  </p>
                )}

                {selectedApplication?.applicantDocs?.governmentIdPreview && (
                  <div className="mt-3">
                    <a
                      href={selectedApplication.applicantDocs.governmentIdPreview}
                      target="_blank"
                      rel="noreferrer"
                      className="inline-flex items-center gap-2 px-3 py-2 rounded-lg border border-gray-200 dark:border-white/10 text-xs font-semibold text-[#0e1f42] dark:text-white hover:bg-gray-50 dark:hover:bg-white/5"
                    >
                      <Eye size={14} />
                      Open Uploaded ID
                    </a>
                  </div>
                )}
              </section>

              <section className="rounded-xl border border-gray-200 dark:border-white/10 p-4">
                <p className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-3 flex items-center gap-2">
                  <CreditCard size={14} /> Amount Paid
                </p>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
                  <div><span className="text-gray-500 dark:text-gray-400">Method:</span> <span className="font-medium text-[#0e1f42] dark:text-white uppercase">{selectedApplication?.payment?.method || "—"}</span></div>
                  {selectedApplication?.payment?.receiptName ? (
                    <div><span className="text-gray-500 dark:text-gray-400">Receipt:</span> <span className="font-medium text-[#0e1f42] dark:text-white">{selectedApplication.payment.receiptName}</span></div>
                  ) : null}
                  <div><span className="text-gray-500 dark:text-gray-400">Annual Rent:</span> <span className="font-semibold text-[#0e1f42] dark:text-white">{formatNaira(selectedApplication?.property?.price || selectedApplication?.rent || 0)}</span></div>
                  <div><span className="text-gray-500 dark:text-gray-400">Caution Fee:</span> <span className="font-semibold text-[#0e1f42] dark:text-white">{formatNaira(selectedApplication?.property?.cautionFee || selectedApplication?.cautionFee || 0)}</span></div>
                  <div className="md:col-span-2"><span className="text-gray-500 dark:text-gray-400">Total Paid:</span> <span className="font-semibold text-[var(--accent-color,#9F7539)]">{formatNaira(selectedApplication?.payment?.amount || 0)}</span> <span className="text-xs text-gray-500 dark:text-gray-400">({amountToWords(selectedApplication?.payment?.amount || 0)})</span></div>
                </div>
              </section>

              <section className="rounded-xl border border-gray-200 dark:border-white/10 p-4">
                <p className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-3">Unit Details</p>
                <div className="rounded-xl overflow-hidden border border-gray-200 dark:border-white/10 bg-gray-50 dark:bg-[#0f1a31]">
                  <div className="grid grid-cols-1 md:grid-cols-[170px_minmax(0,1fr)] gap-0">
                    <div className="h-40 md:h-full bg-gray-100 dark:bg-white/5">
                      {selectedApplication?.property?.image ? (
                        <img
                          src={selectedApplication.property.image}
                          alt={selectedApplication?.property?.title || selectedApplication?.propertyTitle || "Unit"}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-gray-400">
                          <Building2 size={26} />
                        </div>
                      )}
                    </div>
                    <div className="p-4 space-y-2">
                      <p className="text-lg font-semibold text-[var(--accent-color,#9F7539)]">
                        {formatNaira(selectedApplication?.property?.price || selectedApplication?.rent || 0)}/year
                      </p>
                      <p className="text-xs text-gray-500 dark:text-gray-400 -mt-1">
                        {amountToWords(selectedApplication?.property?.price || selectedApplication?.rent || 0)} yearly
                      </p>
                      <p className="text-xl font-bold text-[#0e1f42] dark:text-white">
                        {selectedApplication?.property?.title || selectedApplication?.propertyTitle || "Property"}
                      </p>
                      <p className="text-sm text-gray-600 dark:text-gray-300 flex items-center gap-1.5">
                        <MapPin size={14} className="text-[var(--accent-color,#9F7539)]" />
                        {selectedApplication?.property?.location || "Location not available"}
                      </p>
                      <p className="text-sm text-gray-600 dark:text-gray-300">
                        Unit: <span className="font-semibold text-[#0e1f42] dark:text-white">{selectedApplication?.property?.unitCode || selectedApplication?.unitNumber || "—"}</span>
                      </p>
                      <div className="flex flex-wrap gap-4 text-sm text-[#0e1f42] dark:text-white">
                        <span className="inline-flex items-center gap-1.5"><BedDouble size={14} className="text-[var(--accent-color,#9F7539)]" /> {Number(selectedApplication?.property?.bedrooms || 0)} bed</span>
                        <span className="inline-flex items-center gap-1.5"><Bath size={14} className="text-[var(--accent-color,#9F7539)]" /> {Number(selectedApplication?.property?.bathrooms || 0)} bath</span>
                        <span className="inline-flex items-center gap-1.5"><Ruler size={14} className="text-[var(--accent-color,#9F7539)]" /> {selectedApplication?.property?.size || "—"}</span>
                        <span className="inline-flex items-center gap-1.5"><Building2 size={14} className="text-[var(--accent-color,#9F7539)]" /> {selectedApplication?.property?.unitType || "Unit"}</span>
                      </div>
                      {selectedApplication?.property?.description && (
                        <p className="text-sm text-gray-600 dark:text-gray-300">
                          {selectedApplication.property.description}
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              </section>

              <div className="sticky bottom-0 bg-white dark:bg-[#0b1220] pt-3 border-t border-gray-200 dark:border-white/10 flex flex-wrap justify-end gap-2">
                <button
                  onClick={() => {
                    updateStatus(selectedApplication.id, "Under Review");
                    setSelectedApplication((prev) => (prev ? { ...prev, status: "Under Review" } : prev));
                  }}
                  className="px-3 py-2 rounded-lg border border-amber-200 dark:border-amber-500/20 bg-amber-50 dark:bg-amber-500/10 text-amber-700 dark:text-amber-400 text-xs font-semibold"
                >
                  Mark Under Review
                </button>
                <button
                  disabled={isDecisionLoading}
                  onClick={() => {
                    setRejectTarget(selectedApplication);
                    setRejectReason("");
                  }}
                  className="px-3 py-2 rounded-lg bg-red-50 dark:bg-red-500/10 text-red-600 dark:text-red-400 text-xs font-semibold disabled:opacity-60 disabled:cursor-not-allowed"
                >
                  Reject
                </button>
                <button
                  disabled={isDecisionLoading}
                  onClick={() => {
                    setIsDecisionLoading(true);
                    window.setTimeout(() => {
                      updateStatus(selectedApplication.id, "Approved");
                      setSelectedApplication(null);
                      setIsDecisionLoading(false);
                    }, 700);
                  }}
                  className="px-3 py-2 rounded-lg bg-green-50 dark:bg-green-500/10 text-green-700 dark:text-green-400 text-xs font-semibold disabled:opacity-60 disabled:cursor-not-allowed"
                >
                  {isDecisionLoading ? "Approving..." : "Approve"}
                </button>
              </div>
            </div>
          </aside>
        </div>
      )}

      {isHistoryOpen && (
        <div className="fixed inset-0 z-[1300]">
          <div className="absolute inset-0 bg-black/35" onClick={() => setIsHistoryOpen(false)} />
          <aside className="absolute top-0 right-0 h-full w-full max-w-xl bg-white dark:bg-[#0b1220] border-l border-gray-200 dark:border-white/10 shadow-2xl overflow-y-auto">
            <div className="px-6 py-4 min-h-[76px] border-b border-gray-200 dark:border-white/10 flex items-center justify-between">
              <h3 className="text-lg font-semibold text-[#0e1f42] dark:text-white">Application History</h3>
              <button
                onClick={() => setIsHistoryOpen(false)}
                className="h-8 w-8 rounded-md border border-gray-200 dark:border-white/10 text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-white/5 flex items-center justify-center"
              >
                <X size={16} />
              </button>
            </div>
            <div className="p-5 space-y-3">
              {historyRows.length === 0 ? (
                <div className="rounded-lg border border-gray-200 dark:border-white/10 p-4 text-sm text-gray-500 dark:text-gray-400">
                  No approved/rejected applications yet.
                </div>
              ) : (
                historyRows.map((item) => (
                  <div
                    key={`history-${item.id}`}
                    className="rounded-lg border border-gray-200 dark:border-white/10 p-3 bg-gray-50 dark:bg-white/5"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="min-w-0">
                        <p className="text-sm font-semibold text-[#0e1f42] dark:text-white truncate">
                          {item.applicant || "Applicant"}
                        </p>
                        <p className="text-xs text-gray-500 dark:text-gray-400 truncate">
                          {item.propertyTitle || "Property"} • {item.id}
                        </p>
                        <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                          {formatDateTimeDDMMYY(item.submittedAt)}
                        </p>
                      </div>
                      <span className={`px-2.5 py-1 rounded-full text-[10px] font-semibold ${statusBadge(item.status)}`}>
                        {item.status}
                      </span>
                    </div>
                  </div>
                ))
              )}
            </div>
          </aside>
        </div>
      )}

      {rejectTarget && (
        <div className="fixed inset-0 z-[1350]">
          <div className="absolute inset-0 bg-black/45" onClick={() => setRejectTarget(null)} />
          <div className="absolute inset-0 flex items-center justify-center p-4">
            <div className="w-full max-w-lg rounded-2xl bg-white dark:bg-[#0b1220] border border-gray-200 dark:border-white/10 shadow-2xl">
              <div className="px-5 py-4 border-b border-gray-200 dark:border-white/10 flex items-center justify-between">
                <h4 className="text-base font-semibold text-[#0e1f42] dark:text-white">Reject Application</h4>
                <button
                  onClick={() => setRejectTarget(null)}
                  className="h-8 w-8 rounded-md border border-gray-200 dark:border-white/10 text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-white/5 flex items-center justify-center"
                >
                  <X size={14} />
                </button>
              </div>
              <div className="p-5 space-y-3">
                <p className="text-sm text-gray-600 dark:text-gray-300">
                  Select rejection reason for <span className="font-semibold text-[#0e1f42] dark:text-white">{rejectTarget?.applicant || "applicant"}</span>.
                </p>
                <select
                  value={rejectReason}
                  onChange={(e) => setRejectReason(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg border border-gray-200 dark:border-white/10 bg-transparent dark:text-white text-sm"
                >
                  <option value="" className="dark:bg-[#111827]">Choose reason</option>
                  {rejectionReasons.map((reason) => (
                    <option key={reason} value={reason} className="dark:bg-[#111827]">{reason}</option>
                  ))}
                </select>
                <div className="rounded-lg border border-amber-200 dark:border-amber-500/20 bg-amber-50/70 dark:bg-amber-500/10 p-3 text-xs text-amber-700 dark:text-amber-300">
                  Refund timeline will be set to <span className="font-semibold">5–10 business days</span>.
                </div>
              </div>
              <div className="px-5 py-4 border-t border-gray-200 dark:border-white/10 flex items-center justify-end gap-2">
                <button
                  onClick={() => setRejectTarget(null)}
                  className="px-3 py-2 rounded-lg border border-gray-200 dark:border-white/10 text-gray-700 dark:text-gray-300 text-xs font-semibold"
                >
                  Cancel
                </button>
                <button
                  disabled={!rejectReason}
                  onClick={() => {
                    setIsDecisionLoading(true);
                    window.setTimeout(() => {
                      updateStatus(rejectTarget.id, "Rejected", {
                        rejectionReason: rejectReason,
                        refundStatus: "Pending Refund",
                        refundETA: "5-10 business days"
                      });
                      setSelectedApplication(null);
                      setRejectTarget(null);
                      setRejectReason("");
                      setIsDecisionLoading(false);
                    }, 700);
                  }}
                  className="px-3 py-2 rounded-lg bg-red-600 text-white text-xs font-semibold disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isDecisionLoading ? "Rejecting..." : "Confirm Rejection"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};

export default AdminApplications;
