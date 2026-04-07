import React, { useMemo, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, Download } from 'lucide-react';
import { useProperties } from '../contexts/PropertiesContext';

const formatNaira = (amt) => (amt || amt === 0 ? `₦${Number(amt).toLocaleString()}` : '—');

const PropertyPayments = () => {
  const { propertyId } = useParams();
  const navigate = useNavigate();
  const { properties } = useProperties();
  const [filter, setFilter] = useState('all');

  const property = useMemo(
    () => properties.find((p) => p.propertyId === propertyId),
    [properties, propertyId]
  );

  if (!property) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-sm text-[#64748b]">Property not found.</p>
      </div>
    );
  }

  const filteredPayments = (property.payments || []).filter((pay) => {
    if (filter === 'all') return true;
    if (filter === 'rent') return pay.type === 'rent' || pay.description?.toLowerCase().includes('rent');
    return pay.type === 'bill' || pay.description?.toLowerCase().includes('bill');
  });

  return (
    <div className="rent-overview-container min-h-screen p-4 md:p-6 property-payments-page">
      <div className="max-w-6xl mx-auto space-y-6">
        <div className="bg-white rounded-3xl border border-[#e2e8f0] p-6 shadow-sm space-y-5">
          <div className="flex items-start justify-between gap-4 flex-wrap">
            <div className="flex items-start gap-3">
              <button
                onClick={() => navigate('/dashboard/rent/my-properties')}
                className="p-2 rounded-xl status-accent hover:bg-gray-100 transition-colors"
                aria-label="Back to My Properties"
              >
                <ArrowLeft size={20} />
              </button>
              <div>
                <h1 className="text-2xl font-semibold text-[#0e1f42]">Payment History</h1>
                <p className="text-sm text-gray-500">{property.name} • {property.location}</p>
              </div>
            </div>

            {property.nextPayment && (
              <div className="bg-gray-50 border border-[#e2e8f0] rounded-xl px-4 py-3 min-w-[260px] property-payment-next">
                <p className="text-[11px] uppercase tracking-wider text-gray-500 font-semibold">Next Payment</p>
                <p className="text-base font-bold status-accent">{formatNaira(property.nextPayment.amount)}</p>
                <p className="text-xs text-gray-500">Due: {property.nextPayment.dueDate}</p>
                <p className="text-xs font-semibold status-warning mt-1">{property.nextPayment.status}</p>
              </div>
            )}
          </div>

          <div className="flex items-center justify-between gap-3 flex-wrap">
            <div className="inline-flex rounded-xl border border-[#e2e8f0] bg-gray-50 p-1">
              {['all', 'rent', 'bills'].map((tab) => (
                <button
                  key={tab}
                  onClick={() => setFilter(tab)}
                  className={`property-payment-tab px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
                    filter === tab ? 'active' : ''
                  }`}
                >
                  {tab === 'all' ? 'All Payments' : tab === 'rent' ? 'Rent' : 'Bills'}
                </button>
              ))}
            </div>

            <button className="inline-flex items-center gap-2 text-sm status-accent font-semibold hover:opacity-90 transition-colors">
              <Download size={14} />
              Download Receipts
            </button>
          </div>
        </div>

        <div className="bg-white rounded-3xl border border-[#e2e8f0] p-6 shadow-sm">
          <div className="overflow-x-auto">
            <table className="min-w-full text-sm">
              <thead>
                <tr className="border-b border-[#e2e8f0] text-left text-xs uppercase tracking-wider text-gray-500">
                  <th className="py-3 pr-4">Date</th>
                  <th className="py-3 pr-4">Description</th>
                  <th className="py-3 pr-4">Amount</th>
                  <th className="py-3 pr-4">Status</th>
                  <th className="py-3">Receipt</th>
                </tr>
              </thead>
              <tbody>
                {filteredPayments.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="py-8 text-center">
                      <p className="text-sm font-semibold text-[#0e1f42]">No payment records yet</p>
                      <p className="text-xs text-gray-500">Completed rent and bill payments will show here.</p>
                    </td>
                  </tr>
                ) : (
                  filteredPayments.map((pay) => {
                    const isPaid = String(pay.status).toLowerCase() === 'paid';
                    return (
                      <tr key={pay.id} className="border-b border-[#e2e8f0] last:border-b-0">
                        <td className="py-3 pr-4 text-gray-600">{pay.date || '—'}</td>
                        <td className="py-3 pr-4 text-[#0e1f42] font-medium">{pay.description || 'Payment'}</td>
                        <td className="py-3 pr-4 font-semibold status-accent">{formatNaira(pay.amount)}</td>
                        <td className="py-3 pr-4">
                          <span
                            className={`property-payment-status inline-flex items-center px-2 py-1 rounded-full text-[11px] font-semibold border ${
                              isPaid
                                ? 'bg-emerald-100 text-emerald-700 border-emerald-200'
                                : 'bg-red-100 text-red-700 border-red-200'
                            }`}
                          >
                            {pay.status || 'pending'}
                          </span>
                        </td>
                        <td className="py-3">
                          <button className="text-xs font-semibold status-accent hover:opacity-90">Download</button>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PropertyPayments;
