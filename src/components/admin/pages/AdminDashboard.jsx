import React, { useMemo } from "react";
import { useNavigate } from "react-router-dom";
import {
  Building2,
  Calendar,
  Eye,
  FileText,
  Plus,
  User,
  UserPlus,
} from "lucide-react";
import { useAdmin } from "../../../context/AdminContext";
import { formatDateTimeDDMMYY } from "../../shared/utils/dateFormat";

const statusStyles = {
  approved: "bg-green-100 text-green-700 dark:bg-green-500/10 dark:text-green-400",
  verified: "bg-blue-100 text-blue-700 dark:bg-blue-500/10 dark:text-blue-400",
  completed: "bg-emerald-100 text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-400",
  "in progress": "bg-yellow-100 text-yellow-700 dark:bg-yellow-500/10 dark:text-yellow-400",
  new: "bg-purple-100 text-purple-700 dark:bg-purple-500/10 dark:text-purple-400",
  pending: "bg-orange-100 text-orange-700 dark:bg-orange-500/10 dark:text-orange-400",
};

const toTimeLabel = (raw) => {
  if (!raw) return "just now";
  const date = new Date(raw);
  if (Number.isNaN(date.getTime())) return "just now";
  return formatDateTimeDDMMYY(date);
};

const AdminDashboard = () => {
  const navigate = useNavigate();
  const {
    properties,
    inspections,
    applications,
    tenants,
    maintenanceRequests,
    payments,
  } = useAdmin();

  const publishedCount = properties.filter((item) => item.status === "Published").length;
  const draftCount = properties.filter((item) => item.status !== "Published").length;

  const occupiedCount = tenants.filter((item) => item.status === "Active").length;
  const occupancyPct = tenants.length ? Math.round((occupiedCount / tenants.length) * 100) : 0;

  const scheduledInspections = inspections.filter((item) => item.status === "Scheduled");
  const submittedApps = applications.filter((item) => item.status === "Submitted");
  const pendingReviewApps = applications.filter((item) => item.status === "Under Review");

  const summaryCards = [
    {
      label: "Active Properties",
      value: properties.length,
      meta: `${publishedCount} published / ${draftCount} draft`,
      icon: <Building2 />,
      color: "bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300",
    },
    {
      label: "Occupied Units",
      value: `${occupancyPct}%`,
      meta: `${occupiedCount} of ${tenants.length} units`,
      icon: <User />,
      color: "bg-green-100 text-green-700 dark:bg-green-500/10 dark:text-green-400",
    },
    {
      label: "Pending Applications",
      value: pendingReviewApps.length,
      meta: `${submittedApps.length} application submitted`,
      icon: <FileText />,
      color: "bg-yellow-100 text-yellow-700 dark:bg-yellow-500/10 dark:text-yellow-400",
    },
    {
      label: "Today's Inspections",
      value: scheduledInspections.length,
      meta: scheduledInspections.length ? "Upcoming" : "No upcoming inspections",
      icon: <Calendar />,
      color: "bg-blue-100 text-blue-700 dark:bg-blue-500/10 dark:text-blue-400",
    },
  ];

  const recentActivity = useMemo(() => {
    const fromApplications = applications.map((app) => ({
      id: `app-${app.id}`,
      title: `Application ${app.status || "Updated"}`,
      details: `${app.applicant || "Applicant"} • ${app.propertyTitle || "Property"}`,
      status: String(app.status || "new").toLowerCase(),
      time: toTimeLabel(app.submittedAt),
      ts: new Date(app.submittedAt || 0).getTime() || 0,
    }));

    const fromInspections = inspections.map((inspection) => ({
      id: `insp-${inspection.id}`,
      title: `Inspection ${inspection.status || "Updated"}`,
      details: `${inspection.tenant || "Tenant"} • ${inspection.propertyTitle || "Property"}`,
      status:
        String(inspection.status || "pending").toLowerCase() === "scheduled"
          ? "pending"
          : String(inspection.status || "pending").toLowerCase(),
      time: toTimeLabel(inspection.date),
      ts: new Date(inspection.date || 0).getTime() || 0,
    }));

    const fromMaintenance = (maintenanceRequests || []).map((request) => ({
      id: `mnt-${request.id}`,
      title: `Maintenance ${request.status || "Updated"}`,
      details: `${request.propertyTitle || "Property"} • ${request.title || "Request"}`,
      status: String(request.status || "in progress").toLowerCase(),
      time: toTimeLabel(request.createdAt || request.updatedAt),
      ts: new Date(request.createdAt || request.updatedAt || 0).getTime() || 0,
    }));

    const fromPayments = (payments || []).map((payment) => ({
      id: `pay-${payment.id}`,
      title: `Payment ${payment.status || "Updated"}`,
      details: `${payment.tenant || "Tenant"} • ${payment.propertyTitle || "Property"}`,
      status: String(payment.status || "pending").toLowerCase(),
      time: toTimeLabel(payment.date),
      ts: new Date(payment.date || 0).getTime() || 0,
    }));

    return [...fromApplications, ...fromInspections, ...fromMaintenance, ...fromPayments]
      .sort((a, b) => b.ts - a.ts)
      .slice(0, 8);
  }, [applications, inspections, maintenanceRequests, payments]);

  return (
    <div>
      <h1 className="text-2xl font-bold text-[#0e1f42] dark:text-white mb-2">Dashboard Overview</h1>
      <p className="text-xs md:text-sm text-gray-600 dark:text-gray-400 mb-8">
        Live operational snapshot across clients, contracts, properties and units.
      </p>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-2 md:gap-4 mb-8">
        {summaryCards.map((card) => (
          <div
            key={card.label}
            className="bg-white dark:bg-[#111827] rounded-lg p-4 shadow border border-gray-100 dark:border-white/10 flex items-center justify-between"
          >
            <div>
              <div className="text-xs md:text-sm text-gray-500 dark:text-gray-400">{card.label}</div>
              <div className="text-2xl font-bold text-[#0e1f42] dark:text-white">{card.value}</div>
              <div className="text-xs text-gray-600 dark:text-gray-400">{card.meta}</div>
            </div>
            <div className={`${card.color} rounded-lg p-2`}>
              <div className="text-2xl font-bold">{card.icon}</div>
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-[3.5fr_6.5fr] items-start gap-6">
        <div className="bg-white dark:bg-[#111827] rounded-lg p-4 shadow border border-gray-100 dark:border-white/10">
          <h3 className="font-semibold text-[#0e1f42] dark:text-white mb-4">Quick Actions</h3>
          <div className="flex flex-col gap-4">
            <button
              onClick={() => navigate("/admin/add-property")}
              className="bg-[#9F7539] text-sm text-white w-full hover:bg-[#b58a4a] p-3 rounded-lg cursor-pointer transition duration-300 flex items-center gap-2 font-semibold"
            >
              <Plus size={20} />
              Add Property
            </button>
            <button
              onClick={() => navigate("/admin/clients/contracts/new")}
              className="text-[#9F7539] text-sm bg-white dark:bg-[#111827] w-full border border-gray-100 dark:border-white/10 p-3 rounded-lg cursor-pointer transition duration-300 flex items-center gap-2 font-semibold"
            >
              <UserPlus size={20} />
              Create Client
            </button>
            <button
              onClick={() => navigate("/admin/applications")}
              className="border border-gray-200 dark:border-white/10 text-sm hover:border-gray-500 dark:hover:border-gray-400 cursor-pointer text-gray-600 dark:text-gray-400 w-full rounded-lg p-3 transition duration-300 flex items-center gap-2 font-semibold"
            >
              <Eye size={20} />
              View Applications
            </button>
          </div>
        </div>

        <div
          className="bg-white dark:bg-[#111827] rounded-lg p-4 shadow border border-gray-100 dark:border-white/10 max-h-[600px] overflow-auto"
          style={{ scrollbarWidth: "thin", scrollbarColor: "#9f7539 transparent" }}
        >
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold text-[#0e1f42] dark:text-white">Recent Activity</h3>
          </div>

          {recentActivity.length === 0 ? (
            <div className="text-sm text-gray-500 dark:text-gray-400 py-8">
              No recent activity yet.
            </div>
          ) : (
            <ul className="space-y-4">
              {recentActivity.map((item) => (
                <li
                  key={item.id}
                  className="flex items-start justify-between gap-4 border-b border-gray-100 dark:border-white/5 pb-3"
                >
                  <div className="flex flex-col">
                    <span className="text-sm font-medium text-[#0e1f42] dark:text-white">{item.title}</span>
                    <span className="text-xs text-gray-500 dark:text-gray-400">{item.details}</span>
                  </div>

                  <div className="flex flex-col items-end gap-1">
                    <span
                      className={`text-[10px] whitespace-nowrap capitalize px-2 py-0.5 rounded-full font-medium ${
                        statusStyles[item.status] ||
                        "bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300"
                      }`}
                    >
                      {item.status}
                    </span>
                    <span className="text-[10px] text-gray-400 dark:text-gray-500">{item.time}</span>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
