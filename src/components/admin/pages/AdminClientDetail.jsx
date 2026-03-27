import React, { useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Download, Plus, Pencil, Eye, MessageCircle } from "lucide-react";
import { useAdmin } from "../../../context/AdminContext";

const AdminClientDetail = () => {
  const { clientId } = useParams();
  const navigate = useNavigate();
  const { clients, properties } = useAdmin();
  const [activeTab, setActiveTab] = useState("overview");

  const client = clients.find((item) => item.id === clientId);

  const portfolio = useMemo(
    () => properties.filter((property) => property.clientId === clientId),
    [properties, clientId]
  );

  const portfolioStats = useMemo(() => {
    const totalUnits = portfolio.reduce((sum, property) => sum + (property.units?.length || 0), 0);
    const occupiedUnits = portfolio.reduce(
      (sum, property) =>
        sum +
        (property.units?.filter((unit) => String(unit.status || "").toLowerCase() === "occupied").length || 0),
      0
    );
    const occupancyPct = totalUnits ? Math.round((occupiedUnits / totalUnits) * 100) : 0;
    const totalRevenueYtd = portfolio.reduce((sum, property) => {
      const occupiedAnnual = (property.units || [])
        .filter((unit) => String(unit.status || "").toLowerCase() === "occupied")
        .reduce((acc, unit) => acc + Number(unit.rent || property.rent || 0), 0);
      return sum + occupiedAnnual;
    }, 0);

    return { totalUnits, occupiedUnits, occupancyPct, totalRevenueYtd };
  }, [portfolio]);

  const managementFeePct = Number(client?.managementFeePercent || 0);
  const managementFeesEarnedYtd = Math.round((portfolioStats.totalRevenueYtd * managementFeePct) / 100);
  const hasLinkedProperties = portfolio.length > 0;
  const hasUnitsInPortfolio = portfolioStats.totalUnits > 0;
  const isPendingPropertyAssignment = !hasLinkedProperties;

  const contractRows = useMemo(() => {
    if (!client) return [];
    return [
      {
        id: client.contractId || "CTR-PENDING",
        type: client.contractType || "Full Management",
        duration: client.contractDuration || "Not set",
        status: client.contractStatus || "Draft",
        remaining: isPendingPropertyAssignment ? "Pending activation" : "In progress",
        fee: `${client.managementFeePercent ?? 0}% of rent`,
      },
    ];
  }, [client, isPendingPropertyAssignment]);

  const financeRows = [
    {
      label: "Maintenance Wallet Balance",
      amount: client?.maintenanceWallet || "N0",
      sub: isPendingPropertyAssignment
        ? "Pending: create and link first property"
        : "Based on linked property operations",
    },
    {
      label: "Total Maintenance Spend (YTD)",
      amount: "N0",
      sub: "No maintenance records yet",
    },
    {
      label: "Management Fees Earned (YTD)",
      amount: `N${managementFeesEarnedYtd.toLocaleString()}`,
      sub: `${managementFeePct}% of linked occupied unit rent`,
    },
  ];

  const comms = isPendingPropertyAssignment
    ? [
        {
          id: "msg-1",
          title: "Property assignment pending",
          detail: "Create and link a property to activate this contract lifecycle.",
          time: "Just now",
        },
      ]
    : [];

  if (!client) return <div className="text-sm text-gray-500">Client not found.</div>;

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <div className="text-xs text-gray-500 dark:text-gray-400 mb-1">
            <a href="/admin/clients" className="hover:text-[#9F7539]">Clients</a>
            <span className="px-1">&gt;</span>
            <span>Client Details</span>
          </div>
          <h1 className="text-xl font-semibold text-[#0e1f42] dark:text-white">{client.name}</h1>
          <p className="text-sm text-gray-500 dark:text-gray-400">{client.description}</p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <button className="inline-flex items-center gap-2 px-3 py-2 text-xs border border-gray-200 dark:border-white/10 rounded-md text-gray-600 dark:text-gray-200 bg-white dark:bg-[#0f172a]">
            <Download size={14} /> Generate Report
          </button>
          <button
            className="inline-flex items-center gap-2 px-3 py-2 text-xs border border-[#9F7539] rounded-md text-[#9F7539] bg-transparent"
            onClick={() => navigate(`/admin/clients/contracts/new?mode=renew&clientId=${client.id}`)}
          >
            <Plus size={14} /> Renew Client Contract
          </button>
          <button className="inline-flex items-center gap-2 px-3 py-2 text-xs rounded-md text-white bg-[#9F7539]">
            <Pencil size={14} /> Edit Client
          </button>
        </div>
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        <div className="bg-white dark:bg-[#111827] border border-gray-100 dark:border-white/10 rounded-xl p-5">
          <div className="flex items-center gap-4 mb-4">
            <img src={client.avatar} alt={client.name} className="h-14 w-14 rounded-full object-cover" />
            <div>
              <div className="font-semibold text-[#0e1f42] dark:text-white">{client.name}</div>
              <div className="text-xs text-gray-500 dark:text-gray-400">Property Owner • Client since {client.clientSince}</div>
              <div className="mt-2 inline-flex items-center gap-2">
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-green-100 text-green-700">ID Verified</span>
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-green-100 text-green-700">{client.contractStatus || "Draft"}</span>
              </div>
            </div>
          </div>

          <div className="space-y-4 text-sm">
            <div>
              <div className="text-xs font-semibold text-[#0e1f42] dark:text-white mb-2">Contact Information</div>
              <div className="text-gray-600 dark:text-gray-300">{client.email}</div>
              <div className="text-gray-600 dark:text-gray-300">{client.phone}</div>
              <div className="text-gray-500 dark:text-gray-400">{client.location}</div>
            </div>
            <div>
              <div className="text-xs font-semibold text-[#0e1f42] dark:text-white mb-2">Bank Details</div>
              <div className="text-gray-600 dark:text-gray-300">{client.bankName}</div>
              <div className="text-gray-600 dark:text-gray-300">{client.accountNumber}</div>
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-[#111827] border border-gray-100 dark:border-white/10 rounded-xl p-5">
          <div className="flex items-center justify-between mb-4">
            <div className="text-sm font-semibold text-[#0e1f42] dark:text-white">Contract Summary</div>
            <span className="text-[10px] px-2 py-0.5 rounded-full bg-green-100 text-green-700">{client.contractStatus || "Draft"}</span>
          </div>
          <div className="space-y-3 text-sm text-gray-600 dark:text-gray-300">
            <div>
              <div className="text-xs text-gray-500 dark:text-gray-400">Contract Type</div>
              <div className="font-medium">{client.contractType || "Full Management"}</div>
            </div>
            <div>
              <div className="text-xs text-gray-500 dark:text-gray-400">Contract Duration</div>
              <div className="font-medium">{client.contractDuration || "Not set"}</div>
            </div>
            <div>
              <div className="text-xs text-gray-500 dark:text-gray-400">Management Fee</div>
              <div className="font-medium">{client.managementFeePercent || 0}% of rent</div>
            </div>
            <div>
              <div className="text-xs text-gray-500 dark:text-gray-400">Maintenance Wallet</div>
              <div className="font-medium">{client.maintenanceWallet || "N0"}</div>
            </div>
            <div>
              <div className="text-xs text-gray-500 dark:text-gray-400">Rent Increment</div>
              <div className="font-medium">{client.rentIncrement || "Pending"}</div>
              <div className="text-xs text-gray-500 dark:text-gray-400">Next increment: {client.nextIncrement || "Pending"}</div>
            </div>
          </div>
        </div>
      </div>

      <div>
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-sm font-semibold text-[#0e1f42] dark:text-white">Properties Portfolio</h3>
          <span className="text-xs text-gray-500 dark:text-gray-400">
            {portfolio.length} Properties • {portfolioStats.totalUnits} Total Units
          </span>
        </div>
        {portfolio.length === 0 ? (
          <div className="bg-white dark:bg-[#111827] border border-gray-100 dark:border-white/10 rounded-xl p-6 text-sm text-gray-500 dark:text-gray-400">
            No properties linked yet for this client.
            <button
              onClick={() => navigate("/admin/add-property")}
              className="ml-2 text-[#9F7539] font-semibold hover:underline"
            >
              Create Property
            </button>
          </div>
        ) : (
          <div className="grid md:grid-cols-2 gap-4">
            {portfolio.map((prop) => {
              const totalUnits = prop.units?.length || 0;
              const occupied = (prop.units || []).filter(
                (unit) => String(unit.status || "").toLowerCase() === "occupied"
              ).length;
              const monthlyRevenue = (prop.units || [])
                .filter((unit) => String(unit.status || "").toLowerCase() === "occupied")
                .reduce((sum, unit) => sum + Math.round(Number(unit.rent || prop.rent || 0) / 12), 0);
              const occPct = totalUnits ? Math.round((occupied / totalUnits) * 100) : 0;

              return (
                <div key={prop.id} className="bg-white dark:bg-[#111827] border border-gray-100 dark:border-white/10 rounded-xl overflow-hidden">
                  <img src={prop.image} alt={prop.title} className="h-60 w-full object-cover" />
                  <div className="p-4 space-y-2 min-h-[190px] relative">
                    <div className="font-semibold text-[#0e1f42] dark:text-white">{prop.title}</div>
                    <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">{prop.location}, {prop.area}</div>
                    <div className="grid grid-cols-3 text-xs text-gray-500 dark:text-gray-400 pt-4 gap-y-2">
                      <div><div className="font-semibold text-[#0e1f42] dark:text-white">{totalUnits}</div>Total Units</div>
                      <div><div className="font-semibold text-[#0e1f42] dark:text-white">{occupied}</div>Occupied</div>
                      <div><div className="font-semibold text-[#0e1f42] dark:text-white">N{monthlyRevenue.toLocaleString()}</div>Monthly Revenue</div>
                    </div>
                    <div className="flex items-center justify-between pt-4">
                      <span className="inline-flex text-[10px] px-2 py-0.5 rounded-full bg-green-100 text-green-700">{occPct}% Occupied</span>
                      <button
                        className="text-[#9F7539] hover:text-[#7a5a2c]"
                        aria-label="View property details"
                        onClick={() => navigate(`/admin/clients/${clientId}/portfolio`)}
                      >
                        <Eye size={16} />
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      <div className="border-b border-gray-200 dark:border-white/10 flex items-center gap-6 text-sm">
        {[
          { key: "overview", label: "Overview" },
          { key: "contracts", label: "Contracts" },
          { key: "finance", label: "Financial History" },
          { key: "communications", label: "Communications" },
        ].map((tab) => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key)}
            className={`pb-3 border-b-2 text-sm transition-colors ${
              activeTab === tab.key
                ? "border-[#9F7539] text-[#9F7539] font-medium"
                : "border-transparent text-gray-500 dark:text-gray-400 hover:text-[#0e1f42] dark:hover:text-white"
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {activeTab === "overview" && (
        <div className="grid lg:grid-cols-3 gap-4">
          <div className="bg-white dark:bg-[#111827] border border-gray-100 dark:border-white/10 rounded-xl p-4">
            <div className="text-sm font-semibold text-[#0e1f42] dark:text-white mb-3">Key Metrics</div>
            <div className="space-y-3 text-sm text-gray-600 dark:text-gray-300">
              <div className="flex items-center justify-between"><span>Total Revenue (YTD)</span><span className="font-semibold text-[#0e1f42] dark:text-white">N{portfolioStats.totalRevenueYtd.toLocaleString()}</span></div>
              <div className="flex items-center justify-between"><span>Management Fees Earned</span><span className="font-semibold text-[#0e1f42] dark:text-white">N{managementFeesEarnedYtd.toLocaleString()}</span></div>
              <div className="flex items-center justify-between"><span>Maintenance Spend</span><span className="font-semibold text-[#0e1f42] dark:text-white">N0</span></div>
              <div className="flex items-center justify-between"><span>Average Occupancy</span><span className="font-semibold text-green-600">{portfolioStats.occupancyPct}%</span></div>
            </div>
          </div>
          <div className="bg-white dark:bg-[#111827] border border-gray-100 dark:border-white/10 rounded-xl p-4">
            <div className="text-sm font-semibold text-[#0e1f42] dark:text-white mb-3">Recent Activity</div>
            {portfolio.length === 0 ? (
              <div className="text-sm text-gray-500 dark:text-gray-400">No activity yet for this client.</div>
            ) : (
              <div className="space-y-3 text-sm text-gray-600 dark:text-gray-300">
                <div>
                  <div className="font-medium text-[#0e1f42] dark:text-white">Properties Linked</div>
                  <div className="text-xs text-gray-500 dark:text-gray-400">{portfolio.length} properties currently linked</div>
                </div>
                <div>
                  <div className="font-medium text-[#0e1f42] dark:text-white">Occupied Units</div>
                  <div className="text-xs text-gray-500 dark:text-gray-400">{portfolioStats.occupiedUnits} occupied units</div>
                </div>
              </div>
            )}
          </div>
          <div className="bg-white dark:bg-[#111827] border border-gray-100 dark:border-white/10 rounded-xl p-4">
            <div className="text-sm font-semibold text-[#0e1f42] dark:text-white mb-3">Next Actions</div>
            <div className="space-y-3 text-sm">
              {isPendingPropertyAssignment ? (
                <div className="p-3 rounded-lg bg-amber-50 dark:bg-amber-500/10 text-amber-700 dark:text-amber-300">
                  <div className="font-medium">Property Assignment Pending</div>
                  <div className="text-xs">Create a property and link it to this client.</div>
                </div>
              ) : !hasUnitsInPortfolio ? (
                <div className="p-3 rounded-lg bg-amber-50 dark:bg-amber-500/10 text-amber-700 dark:text-amber-300">
                  <div className="font-medium">No Units Added Yet</div>
                  <div className="text-xs">Add units to the linked property to start occupancy tracking.</div>
                </div>
              ) : (
                <div className="p-3 rounded-lg bg-sky-50 dark:bg-sky-500/10 text-sky-700 dark:text-sky-300">
                  <div className="font-medium">Monitor Contract Operations</div>
                  <div className="text-xs">Track occupancy, revenue and maintenance flow.</div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {activeTab === "contracts" && (
        <div className="bg-white dark:bg-[#111827] border border-gray-100 dark:border-white/10 rounded-xl p-4">
          <div className="flex items-center justify-between mb-4">
            <div className="text-sm font-semibold text-[#0e1f42] dark:text-white">Client Contracts</div>
            <button
              onClick={() => navigate("/admin/clients/contracts")}
              className="inline-flex items-center gap-2 text-xs border border-gray-200 dark:border-white/10 px-3 py-1.5 rounded-md text-gray-700 dark:text-gray-200"
            >
              <Eye size={14} />
              View All Contracts
            </button>
          </div>
          <div className="space-y-3">
            {contractRows.map((contract) => (
              <div key={contract.id} className="border border-gray-100 dark:border-white/10 rounded-lg p-3 flex flex-col md:flex-row md:items-center md:justify-between gap-3">
                <div>
                  <div className="text-sm font-medium text-[#0e1f42] dark:text-white">{contract.id} • {contract.type}</div>
                  <div className="text-xs text-gray-500 dark:text-gray-400">{contract.duration}</div>
                  <div className="text-xs text-gray-500 dark:text-gray-400">Fee: {contract.fee}</div>
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-xs px-2 py-1 rounded-full bg-gray-100 dark:bg-white/10 text-gray-600 dark:text-gray-300">{contract.remaining}</span>
                  <span className={`text-xs px-2 py-1 rounded-full ${contract.status === "Active" ? "bg-green-100 text-green-700" : contract.status === "Expires Soon" ? "bg-amber-100 text-amber-700" : "bg-red-100 text-red-700"}`}>
                    {contract.status}
                  </span>
                  <button className="text-[#9F7539] hover:text-[#7a5a2c]" aria-label="View Contract">
                    <Eye size={16} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {activeTab === "finance" && (
        <div className="bg-white dark:bg-[#111827] border border-gray-100 dark:border-white/10 rounded-xl p-4">
          <div className="text-sm font-semibold text-[#0e1f42] dark:text-white mb-4">Financial History</div>
          <div className="grid md:grid-cols-3 gap-4">
            {financeRows.map((row) => (
              <div key={row.label} className="border border-gray-100 dark:border-white/10 rounded-lg p-4">
                <div className="text-xs text-gray-500 dark:text-gray-400">{row.label}</div>
                <div className="text-lg font-semibold text-[#0e1f42] dark:text-white">{row.amount}</div>
                <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">{row.sub}</div>
              </div>
            ))}
          </div>
        </div>
      )}

      {activeTab === "communications" && (
        <div className="bg-white dark:bg-[#111827] border border-gray-100 dark:border-white/10 rounded-xl p-4">
          <div className="text-sm font-semibold text-[#0e1f42] dark:text-white mb-4">Communications</div>
          {comms.length === 0 ? (
            <div className="text-sm text-gray-500 dark:text-gray-400">No communications yet for this client.</div>
          ) : (
            <div className="space-y-3">
              {comms.map((msg) => (
                <div key={msg.id} className="border border-gray-100 dark:border-white/10 rounded-lg p-3 flex items-start gap-3">
                  <div className="h-9 w-9 rounded-full bg-[#9F7539]/10 text-[#9F7539] flex items-center justify-center">
                    <MessageCircle size={16} />
                  </div>
                  <div className="flex-1">
                    <div className="text-sm font-medium text-[#0e1f42] dark:text-white">{msg.title}</div>
                    <div className="text-xs text-gray-500 dark:text-gray-400">{msg.detail}</div>
                  </div>
                  <div className="text-xs text-gray-400">{msg.time}</div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default AdminClientDetail;
