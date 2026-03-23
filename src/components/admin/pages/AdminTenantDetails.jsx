import React, { useMemo } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useAdmin } from '../../../context/AdminContext';
import {
    ChevronLeft,
    Mail,
    Phone,
    MapPin,
    Calendar,
    Building2,
    ShieldCheck,
    DollarSign,
    FileText,
    User,
    ExternalLink,
    Clock,
    Briefcase,
    Download,
    ArrowLeft
} from 'lucide-react';

const AdminTenantDetails = () => {
    const { tenantId } = useParams();
    const navigate = useNavigate();
    const { tenants } = useAdmin();

    const tenant = useMemo(() =>
        tenants.find(t => t.id === tenantId),
        [tenants, tenantId]);

    if (!tenant) {
        return (
            <div className="p-12 text-center">
                <p className="text-gray-500 dark:text-gray-400">Tenant not found.</p>
                <button
                    onClick={() => navigate('/admin/tenants')}
                    className="mt-4 text-[#9F7539] hover:underline flex items-center gap-2 mx-auto font-bold"
                >
                    <ChevronLeft size={16} /> Back to Tenants
                </button>
            </div>
        );
    }

    const statusBadge = (status) => {
        if (status === 'Active') return 'bg-green-100 text-green-700 dark:bg-green-500/10 dark:text-green-400';
        if (status === 'Reserved') return 'bg-blue-100 text-blue-700 dark:bg-blue-500/10 dark:text-blue-400';
        return 'bg-amber-100 text-amber-700 dark:bg-amber-500/10 dark:text-amber-400';
    };

    return (
        <div className="max-w-6xl mx-auto space-y-6">
            {/* Breadcrumbs & Header */}
            <div className="flex flex-col gap-4">
                <div className="flex items-center gap-2 text-[11px] text-gray-400 dark:text-gray-500 font-medium">
                    <Link to="/admin/tenants" className="hover:text-[#9F7539] transition-colors">Tenants</Link>
                    <span className="text-gray-300 dark:text-gray-700">›</span>
                    <span className="text-gray-600 dark:text-gray-300 font-bold">Tenant Profile</span>
                </div>

                <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                    <div className="flex items-center gap-4">
                        <button
                            onClick={() => navigate('/admin/tenants')}
                            className="p-2 hover:bg-gray-100 dark:hover:bg-white/5 rounded-xl text-gray-400 dark:text-gray-600 transition-all"
                        >
                            <ChevronLeft size={24} />
                        </button>
                        <div className="flex items-center gap-4">
                            <div className="w-14 h-14 rounded-full bg-gray-100 dark:bg-gray-800 overflow-hidden border border-gray-100 dark:border-white/5 shadow-sm">
                                <img src={tenant.image} alt={tenant.name} className="w-full h-full object-cover" />
                            </div>
                            <div>
                                <h1 className="text-2xl font-bold text-[#0e1f42] dark:text-white leading-tight">{tenant.name}</h1>
                                <div className="flex items-center gap-3 mt-1">
                                    <span className={`px-2 py-0.5 rounded-full text-[10px] font-extrabold uppercase tracking-wider ${statusBadge(tenant.status)}`}>
                                        {tenant.status}
                                    </span>
                                    <span className="text-xs text-gray-400 dark:text-gray-600 font-medium">ID: {tenant.id}</span>
                                </div>
                            </div>
                        </div>
                    </div>

                    <button
                        onClick={() => navigate(-1)}
                        className="flex items-center gap-2 px-4 py-2 border cursor-pointer border-[#9F7539] text-[#9F7539] rounded-lg text-sm font-bold transition-all shadow-sm">
                        <ArrowLeft size={16} /> to Applications
                    </button>
                </div>
            </div>

            <div className="grid lg:grid-cols-3 gap-6">
                {/* Left: Profile Information */}
                <div className="lg:col-span-1 space-y-6">
                    <div className="bg-white dark:bg-[#111827] rounded-3xl border border-gray-100 dark:border-white/5 p-6 shadow-sm space-y-6">
                        <div className="flex items-center justify-between">
                            <h3 className="text-xs font-bold text-gray-400 dark:text-gray-500 uppercase tracking-widest">Personal Details</h3>
                            <div className="p-1.5 rounded-lg bg-blue-50 dark:bg-blue-500/10 text-blue-600 dark:text-blue-400">
                                <ShieldCheck size={14} />
                            </div>
                        </div>

                        <div className="space-y-4">
                            <div className="flex items-center gap-4">
                                <div className="p-2.5 rounded-xl bg-gray-50 dark:bg-gray-900 border border-gray-100 dark:border-white/5 text-gray-400">
                                    <Mail size={16} />
                                </div>
                                <div className="min-w-0">
                                    <p className="text-[10px] font-bold text-gray-400 dark:text-gray-500 uppercase tracking-wider">Email Address</p>
                                    <p className="text-sm font-bold text-[#0e1f42] dark:text-white truncate">{tenant.email}</p>
                                </div>
                            </div>

                            <div className="flex items-center gap-4">
                                <div className="p-2.5 rounded-xl bg-gray-50 dark:bg-gray-900 border border-gray-100 dark:border-white/5 text-gray-400">
                                    <Phone size={16} />
                                </div>
                                <div>
                                    <p className="text-[10px] font-bold text-gray-400 dark:text-gray-500 uppercase tracking-wider">Phone Number</p>
                                    <p className="text-sm font-bold text-[#0e1f42] dark:text-white">{tenant.phone}</p>
                                </div>
                            </div>

                            <div className="flex items-center gap-4">
                                <div className="p-2.5 rounded-xl bg-gray-50 dark:bg-gray-900 border border-gray-100 dark:border-white/5 text-gray-400">
                                    <Briefcase size={16} />
                                </div>
                                <div>
                                    <p className="text-[10px] font-bold text-gray-400 dark:text-gray-500 uppercase tracking-wider">Occupation</p>
                                    <p className="text-sm font-bold text-[#0e1f42] dark:text-white">{tenant.occupation}</p>
                                </div>
                            </div>
                        </div>

                        <div className="pt-4 border-t border-gray-50 dark:border-white/5">
                            <h4 className="text-[10px] font-bold text-gray-400 dark:text-gray-500 uppercase tracking-widest mb-4">Emergency Contact</h4>
                            <div className="flex items-start gap-4">
                                <div className="w-8 h-8 rounded-full bg-amber-50 dark:bg-amber-500/10 flex items-center justify-center text-amber-600 dark:text-amber-400">
                                    <User size={14} />
                                </div>
                                <div>
                                    <p className="text-sm font-bold text-[#0e1f42] dark:text-white">{tenant.emergencyContact.name}</p>
                                    <p className="text-[11px] text-gray-500 dark:text-gray-400">{tenant.emergencyContact.relationship} • {tenant.emergencyContact.phone}</p>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="bg-[#0e1f42] dark:bg-[#1a1f2e] rounded-3xl p-6 shadow-sm border border-gray-800 dark:border-white/5 space-y-4">
                        <div className="flex justify-between items-center text-white/50">
                            <span className="text-[10px] font-bold uppercase tracking-widest">Lease Document</span>
                            <FileText size={16} />
                        </div>
                        <div className="flex items-center gap-4">
                            <div className="p-3 rounded-2xl bg-white/5 text-white">
                                <FileText size={24} />
                            </div>
                            <div className="min-w-0">
                                <p className="text-white font-bold text-sm truncate">lease_agreement_{tenant.id}.pdf</p>
                                <p className="text-[10px] text-gray-400 mt-0.5">Signed on {tenant.leaseStart}</p>
                            </div>
                        </div>
                        <button className="w-full flex items-center justify-center gap-2 py-3 bg-white hover:bg-gray-100 text-[#0e1f42] rounded-2xl text-xs font-bold transition-all shadow-xl">
                            <Download size={14} /> Download Agreement
                        </button>
                    </div>
                </div>

                {/* Right: Lease & Billing Information */}
                <div className="lg:col-span-2 space-y-6">
                    {/* Lease Card */}
                    <div className="bg-white dark:bg-[#111827] rounded-3xl border border-gray-100 dark:border-white/5 shadow-sm overflow-hidden">
                        <div className="p-6 border-b border-gray-50 dark:border-white/5 flex items-center justify-between">
                            <h3 className="text-base font-bold text-[#0e1f42] dark:text-white">Active Lease Details</h3>
                            <div className="flex items-center gap-2 text-[#9F7539] font-bold text-xs">
                                <Building2 size={14} />
                                {tenant.unitNumber}
                            </div>
                        </div>

                        <div className="p-6 grid sm:grid-cols-2 gap-6">
                            <div className="flex gap-4">
                                <div className="p-3 rounded-2xl bg-gray-50 dark:bg-white/5 text-gray-400 flex items-center justify-center h-fit">
                                    <Building2 size={20} />
                                </div>
                                <div className="space-y-1">
                                    <p className="text-[10px] font-bold text-gray-400 dark:text-gray-500 uppercase tracking-widest">Assigned Property</p>
                                    <p className="text-sm font-bold text-[#0e1f42] dark:text-white leading-tight">{tenant.propertyTitle}</p>
                                    <Link to={`/admin/units/${tenant.unitId}`} className="text-[11px] text-[#9F7539] font-bold flex items-center gap-1 mt-1 hover:underline">
                                        Property Details <ExternalLink size={10} />
                                    </Link>
                                </div>
                            </div>

                            <div className="flex gap-4">
                                <div className="p-3 rounded-2xl bg-gray-50 dark:bg-white/5 text-gray-400 flex items-center justify-center h-fit">
                                    <DollarSign size={20} />
                                </div>
                                <div className="space-y-1">
                                    <p className="text-[10px] font-bold text-gray-400 dark:text-gray-500 uppercase tracking-widest">Monthly Rent</p>
                                    <p className="text-xl font-extrabold text-[#0e1f42] dark:text-white leading-tight">₦{tenant.rent?.toLocaleString()}</p>
                                    <div className="flex items-center gap-1.5">
                                        <span className={`w-2 h-2 rounded-full ${tenant.paymentStatus === 'Paid' ? 'bg-green-500' : 'bg-amber-500'}`} />
                                        <span className="text-[11px] text-gray-400 font-medium">Payment: {tenant.paymentStatus}</span>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="px-6 pb-6 grid sm:grid-cols-2 gap-4">
                            <div className="bg-gray-50 dark:bg-white/5 p-4 rounded-2xl space-y-1">
                                <div className="flex items-center gap-2 text-gray-400 dark:text-gray-500 mb-1">
                                    <Calendar size={12} />
                                    <span className="text-[10px] font-bold uppercase tracking-widest">Lease Period</span>
                                </div>
                                <p className="text-xs font-bold text-[#0e1f42] dark:text-white">{tenant.leaseStart} — {tenant.leaseEnd}</p>
                                <p className="text-[11px] text-gray-400">12 Months Contract</p>
                            </div>
                            <div className="bg-gray-50 dark:bg-white/5 p-4 rounded-2xl space-y-1">
                                <div className="flex items-center gap-2 text-gray-400 dark:text-gray-500 mb-1">
                                    <Clock size={12} />
                                    <span className="text-[10px] font-bold uppercase tracking-widest">Contract Status</span>
                                </div>
                                <p className="text-xs font-bold text-emerald-600">342 Days Remaining</p>
                                <p className="text-[11px] text-gray-400">Renews on Jan 15, 2026</p>
                            </div>
                        </div>
                    </div>

                    {/* Billing History Mini Table */}
                    <div className="bg-white dark:bg-[#111827] rounded-3xl border border-gray-100 dark:border-white/5 shadow-sm p-6 space-y-6">
                        <div className="flex items-center justify-between">
                            <h3 className="text-base font-bold text-[#0e1f42] dark:text-white">Recent Billing Activity</h3>
                            <Link to="/admin/payments" className="text-xs font-bold text-[#9F7539] hover:underline">View All Billing</Link>
                        </div>

                        <div className="overflow-x-auto">
                            <table className="w-full text-left">
                                <thead className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">
                                    <tr>
                                        <th className="pb-4 pr-4">Invoice ID</th>
                                        <th className="pb-4 px-4 text-center">Amount</th>
                                        <th className="pb-4 px-4">Date</th>
                                        <th className="pb-4 pl-4 text-right">Status</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-50 dark:divide-white/5">
                                    {tenant.billingHistory.map((bill) => (
                                        <tr key={bill.id} className="text-xs">
                                            <td className="py-4 pr-4">
                                                <div className="font-bold text-[#0e1f42] dark:text-white">{bill.id}</div>
                                                <div className="text-[10px] text-gray-400 font-medium">{bill.type}</div>
                                            </td>
                                            <td className="py-4 px-4 text-center">
                                                <span className="font-bold text-gray-700 dark:text-gray-300">₦{bill.amount.toLocaleString()}</span>
                                            </td>
                                            <td className="py-4 px-4 text-gray-500 dark:text-gray-400 font-medium">
                                                {bill.date}
                                            </td>
                                            <td className="py-4 pl-4 text-right">
                                                <span className={`inline-block px-2 py-0.5 rounded-full text-[9px] font-bold uppercase tracking-tighter ${bill.status === 'Paid' ? 'bg-green-50 text-green-600 dark:bg-green-500/10 dark:text-green-400' : 'bg-amber-50 text-amber-600 dark:bg-amber-500/10 dark:text-amber-400'
                                                    }`}>
                                                    {bill.status}
                                                </span>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AdminTenantDetails;
