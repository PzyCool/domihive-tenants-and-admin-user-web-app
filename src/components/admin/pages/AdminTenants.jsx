import { useMemo, useState } from 'react';
import { useAdmin } from '../../../context/AdminContext';
import { Users, Search, Download, UserPlus, Eye } from 'lucide-react';
import { Link } from 'react-router-dom';

const AdminTenants = () => {
  const { tenants } = useAdmin();
  const getTenantRent = (tenant) => Number(tenant?.rent ?? tenant?.rentAmount ?? 0);
  const getTenantPaymentStatus = (tenant) =>
    tenant?.paymentStatus || (getTenantRent(tenant) > 0 ? 'Paid' : 'Pending');

  // Filters
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [sortBy, setSortBy] = useState("newest");

  // Summary Data
  const summaryStats = useMemo(() => {
    const total = tenants.length;
    const active = tenants.filter(t => t.status === 'Active').length;
    const pending = tenants.filter(t => t.status === 'Move-in pending').length;
    const reserved = tenants.filter(t => t.status === 'Reserved').length;

    return [
      {
        label: "Total Tenants",
        value: total,
        meta: `${total} total`,
        icon: <Users size={20} />,
        color: "bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300",
      },
      {
        label: "Active Tenants",
        value: active,
        meta: `${active} active`,
        icon: <Users size={20} />,
        color: "bg-green-100 text-green-700 dark:bg-green-500/10 dark:text-green-400",
      },
      {
        label: "Move-in Pending",
        value: pending,
        meta: `${pending} pending`,
        icon: <Users size={20} />,
        color: "bg-amber-100 text-amber-700 dark:bg-amber-500/10 dark:text-amber-400",
      },
      {
        label: "Reserved",
        value: reserved,
        meta: `${reserved} reserved`,
        icon: <Users size={20} />,
        color: "bg-blue-100 text-blue-700 dark:bg-blue-500/10 dark:text-blue-400",
      },
    ];
  }, [tenants]);

  // Filter + Sort Logic
  const filteredTenants = useMemo(() => {
    let list = [...tenants];

    if (search.trim()) {
      const q = search.toLowerCase();
      list = list.filter(t =>
        `${t.name} ${t.propertyTitle} ${t.email}`.toLowerCase().includes(q)
      );
    }

    if (statusFilter !== "all") {
      list = list.filter(t => t.status === statusFilter);
    }

    if (sortBy === "rent-desc") {
      list.sort((a, b) => getTenantRent(b) - getTenantRent(a));
    } else if (sortBy === "rent-asc") {
      list.sort((a, b) => getTenantRent(a) - getTenantRent(b));
    } else {
      // newest by id for mock
      list.sort((a, b) => b.id.localeCompare(a.id));
    }

    return list;
  }, [tenants, search, statusFilter, sortBy]);

  const statusBadge = (status) => {
    if (status === 'Active') return 'bg-green-100 text-green-700 dark:bg-green-500/10 dark:text-green-400';
    if (status === 'Reserved') return 'bg-blue-100 text-blue-700 dark:bg-blue-500/10 dark:text-blue-400';
    return 'bg-amber-100 text-amber-700 dark:bg-amber-500/10 dark:text-amber-400';
  };

  const paymentBadge = (status) => {
    if (status === 'Paid') return 'bg-green-100 text-green-700 dark:bg-green-500/10 dark:text-green-400';
    if (status === 'Pending') return 'bg-amber-100 text-amber-700 dark:bg-amber-500/10 dark:text-amber-400';
    return 'bg-red-100 text-red-700 dark:bg-red-500/10 dark:text-red-400';
  };

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-[#0e1f42] dark:text-white">Tenants Management</h1>
          <p className="text-sm text-gray-600 dark:text-gray-400">
            View and manage all active and pending tenants
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <button className="flex items-center gap-2 px-4 py-2 text-[#9F7539] border border-[#9F7539]/20 hover:border-[#9F7539]/50 dark:hover:border-[#9F7539]/40 font-semibold rounded-lg text-sm transition-all cursor-pointer">
            <Download size={16} /> Export
          </button>
          <button className="flex items-center gap-2 px-4 py-2 bg-[#9F7539] text-white font-semibold rounded-lg text-sm hover:bg-[#866230] transition-all cursor-pointer">
            <UserPlus size={16} /> Add Tenant
          </button>
        </div>
      </div>

      {/* SummaryCards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-2 md:gap-4">
        {summaryStats.map((card) => (
          <div
            key={card.label}
            className="bg-white dark:bg-[#111827] rounded-lg p-4 shadow border border-gray-100 dark:border-white/5 flex items-center justify-between"
          >
            <div className="min-w-0">
              <div className="text-xs sm:text-sm text-gray-500 dark:text-gray-400 truncate">{card.label}</div>
              <div className="text-lg sm:text-2xl font-bold text-[#0e1f42] dark:text-white">{card.value}</div>
              <div className="text-[10px] sm:text-xs text-gray-600 dark:text-gray-400 truncate">{card.meta}</div>
            </div>
            <div className={`${card.color} rounded-lg p-2 shrink-0 ml-2`}>{card.icon}</div>
          </div>
        ))}
      </div>

      {/* Filters */}
      <div className="bg-white dark:bg-[#111827] rounded-lg border border-gray-100 dark:border-white/5 p-4 flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
        <div className="relative w-full lg:max-w-sm">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search tenant, property..."
            className="w-full pl-9 pr-3 py-2 rounded-md border border-gray-200 dark:border-white/10 bg-transparent dark:text-white text-sm outline-none focus:border-[#9F7539]"
          />
        </div>

        <div className="flex flex-wrap gap-2">
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-3 py-2 rounded-md border border-gray-200 dark:border-white/10 bg-transparent dark:text-white text-sm outline-none cursor-pointer"
          >
            <option value="all" className="dark:bg-[#111827]">All Status</option>
            <option value="Active" className="dark:bg-[#111827]">Active</option>
            <option value="Move-in pending" className="dark:bg-[#111827]">Move-in Pending</option>
            <option value="Reserved" className="dark:bg-[#111827]">Reserved</option>
          </select>

          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            className="px-3 py-2 rounded-md border border-gray-200 dark:border-white/10 bg-transparent dark:text-white text-sm outline-none cursor-pointer"
          >
            <option value="newest" className="dark:bg-[#111827]">Sort: Newest</option>
            <option value="rent-desc" className="dark:bg-[#111827]">Rent: High to Low</option>
            <option value="rent-asc" className="dark:bg-[#111827]">Rent: Low to High</option>
          </select>
        </div>
      </div>

      {/* Desktop Table */}
      <div className="hidden lg:block bg-white dark:bg-[#111827] border border-gray-100 dark:border-white/5 rounded-xl shadow-sm overflow-hidden transition-colors">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 dark:bg-gray-900/50 text-gray-600 dark:text-gray-400 text-[11px] ">
            <tr>
              <th className="px-4 py-3 font-semibold text-gray-500 dark:text-gray-400 uppercase text-[10px] tracking-wider text-left">Tenant</th>
              <th className="px-4 py-3 font-semibold text-gray-500 dark:text-gray-400 uppercase text-[10px] tracking-wider text-left">Property & Unit</th>
              <th className="px-4 py-3 font-semibold text-gray-500 dark:text-gray-400 uppercase text-[10px] tracking-wider text-left">Rent</th>
              <th className="px-4 py-3 font-semibold text-gray-500 dark:text-gray-400 uppercase text-[10px] tracking-wider whitespace-nowrap text-left">Lease Period</th>
              <th className="px-4 py-3 font-semibold text-gray-500 dark:text-gray-400 uppercase text-[10px] tracking-wider text-left">Status</th>
              <th className="px-4 py-3 font-semibold text-gray-500 dark:text-gray-400 uppercase text-[10px] tracking-wider text-left">Payment</th>
              <th className="px-4 py-3 font-semibold text-gray-500 dark:text-gray-400 uppercase text-[10px] tracking-wider text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100 dark:divide-white/5">
            {filteredTenants.map((tenant) => (
              <tr key={tenant.id} className="hover:bg-gray-50 dark:hover:bg-white/5 transition-colors">
                <td className="py-4 px-4">
                  <div className="font-semibold text-[#0e1f42] dark:text-white">{tenant.name}</div>
                  <div className="text-[11px] text-gray-500 dark:text-gray-400">{tenant.email}</div>
                </td>
                <td className="py-4 px-4">
                  <div className="text-gray-700 dark:text-gray-300 font-medium line-clamp-1">{tenant.propertyTitle}</div>
                  <div className="text-[11px] text-gray-500 dark:text-gray-400">Unit {tenant.unitNumber || tenant.unitCode || "—"}</div>
                </td>
                <td className="py-4 px-4 font-medium text-xs text-gray-700 dark:text-gray-300">
                  ₦{getTenantRent(tenant).toLocaleString()}
                </td>
                <td className="py-4 px-4 text-xs text-gray-600 dark:text-gray-400 whitespace-nowrap">
                  <div>{tenant.leaseStart}</div>
                  <div className="text-gray-400 dark:text-gray-500">to {tenant.leaseEnd}</div>
                </td>
                <td className="py-4 px-4">
                  <span className={`px-2.5 py-1 whitespace-nowrap rounded-full text-[10px] font-bold ${statusBadge(tenant.status)}`}>
                    {tenant.status}
                  </span>
                </td>
                <td className="py-4 px-4">
                  <span className={`px-2.5 py-1 whitespace-nowrap rounded-full text-[10px] font-bold ${paymentBadge(getTenantPaymentStatus(tenant))}`}>
                    {getTenantPaymentStatus(tenant)}
                  </span>
                </td>
                <td className="py-4 px-4 text-right">
                  <div className="flex justify-end items-center gap-2">
                    <Link
                      to={`/admin/tenants/${tenant.id}`}
                      className="p-2 hover:bg-gray-100 dark:hover:bg-white/5 rounded-lg text-gray-400 dark:text-gray-500 hover:text-[#9F7539] transition-all cursor-pointer"
                    >
                      <Eye size={18} />
                    </Link>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Mobile/Tablet Card View */}
      <div className="lg:hidden space-y-3">
        {filteredTenants.map((tenant) => (
          <div key={tenant.id} className="bg-white dark:bg-[#111827] p-4 rounded-xl border border-gray-100 dark:border-white/5 shadow-sm space-y-4">
            <div className="flex justify-between items-start">
              <div>
                <h3 className="font-bold text-[#0e1f42] dark:text-white">{tenant.name}</h3>
                <p className="text-xs text-gray-500 dark:text-gray-400">{tenant.email}</p>
              </div>
              <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${statusBadge(tenant.status)}`}>
                {tenant.status}
              </span>
            </div>

            <div className="grid grid-cols-2 gap-3 text-xs">
              <div className="p-2 bg-gray-50 dark:bg-gray-900/50 rounded-lg border border-gray-100 dark:border-white/5">
                <p className="text-gray-400 dark:text-gray-500 mb-1">Property</p>
                <p className="font-semibold text-gray-700 dark:text-gray-300 truncate">{tenant.propertyTitle}</p>
                <p className="text-[10px] text-gray-500 dark:text-gray-400">Unit {tenant.unitNumber || tenant.unitCode || "—"}</p>
              </div>
              <div className="p-2 bg-gray-50 dark:bg-gray-900/50 rounded-lg border border-gray-100 dark:border-white/5">
                <p className="text-gray-400 dark:text-gray-500 mb-1">Rent</p>
                <p className="font-semibold text-gray-700 dark:text-gray-300">₦{getTenantRent(tenant).toLocaleString()}</p>
                <span className={`text-[9px] font-bold ${getTenantPaymentStatus(tenant) === 'Paid' ? 'text-green-600 dark:text-green-400' : 'text-amber-600 dark:text-amber-400'}`}>
                  {getTenantPaymentStatus(tenant)}
                </span>
              </div>
            </div>

            <div className="flex items-center justify-between text-xs pt-1 border-t border-gray-50 dark:border-white/5">
              <div className="text-gray-500 dark:text-gray-400">
                Lease: <span className="font-medium dark:text-gray-300">{tenant.leaseStart}</span> → <span className="font-medium dark:text-gray-300">{tenant.leaseEnd}</span>
              </div>
              <div className="flex gap-2">
                <Link
                  to={`/admin/tenants/${tenant.id}`}
                  className="p-2 border border-gray-100 dark:border-white/10 rounded-lg text-gray-400 dark:text-gray-500 hover:text-[#9F7539] transition-all cursor-pointer"
                >
                  <Eye size={16} />
                </Link>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default AdminTenants;
