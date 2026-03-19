import React, { useMemo, useState } from 'react';
import { usePayments } from '../contexts/PaymentsContext';
import { useProperties } from '../contexts/PropertiesContext';
import PaymentTabs from '../components/payments/PaymentTabs';

const PayMethods = ['Paystack', 'Card', 'Bank Transfer'];

const PaymentsPage = () => {
  const { rents, bills, receipts, history, addReceipt, addHistory, updateRentStatus, updateBillStatus } = usePayments();
  const { properties } = useProperties();

  const activeProperties = useMemo(() => properties.filter((p) => p.tenancyStatus === 'ACTIVE'), [properties]);
  const [selectedPropertyId, setSelectedPropertyId] = useState(activeProperties[0]?.propertyId || '');
  const [mainTab, setMainTab] = useState('pay'); // pay | receipts | history
  const [subTab, setSubTab] = useState('rent'); // rent | bills
  const [payPanel, setPayPanel] = useState(null); // { type: 'rent'|'bill', item }
  const [payMethod, setPayMethod] = useState(PayMethods[0]);

  const property = properties.find((p) => p.propertyId === selectedPropertyId);
  const rentInfo = rents[selectedPropertyId];
  const propertyBills = bills[selectedPropertyId] || [];

  const isDue = (status) => status === 'Due' || status === 'Overdue';

  React.useEffect(() => {
    if (!activeProperties.length) {
      setSelectedPropertyId('');
      return;
    }
    if (!selectedPropertyId || !activeProperties.some((p) => p.propertyId === selectedPropertyId)) {
      setSelectedPropertyId(activeProperties[0].propertyId);
    }
  }, [activeProperties, selectedPropertyId]);

  const handlePay = (type, item) => {
    setPayMethod(PayMethods[0]);
    setPayPanel({ type, item });
  };

  const closePanel = () => {
    setPayPanel(null);
  };

  const submitPayment = () => {
    if (!payPanel) return;
    const isRent = payPanel.type === 'rent';
    const amount = isRent ? rentInfo?.amount : payPanel.item.amount;
    const now = new Date().toISOString().slice(0, 10);
    const receipt = {
      id: `RCT-${Date.now()}`,
      propertyId: selectedPropertyId,
      propertyName: property?.name || 'Property',
      type: isRent ? 'Rent' : 'Bill',
      amount,
      method: payMethod,
      date: now,
      status: payMethod === 'Bank Transfer' ? 'Pending Confirmation' : 'Paid'
    };
    addReceipt(receipt);
    addHistory({
      id: `HIS-${Date.now()}`,
      propertyId: selectedPropertyId,
      propertyName: property?.name || 'Property',
      title:
        payMethod === 'Bank Transfer'
          ? `${isRent ? 'Rent' : 'Bill'} bank transfer submitted`
          : `${isRent ? 'Rent' : 'Bill'} payment successful`,
      amount,
      status: receipt.status,
      date: new Date().toISOString()
    });
    if (isRent) {
      updateRentStatus(selectedPropertyId, receipt.status === 'Paid' ? 'Paid' : 'Pending Confirmation');
    } else {
      updateBillStatus(selectedPropertyId, payPanel.item.id, receipt.status === 'Paid' ? 'Paid' : 'Pending Confirmation');
    }
    closePanel();
  };

  const handleCopy = (value) => {
    if (navigator?.clipboard?.writeText) {
      navigator.clipboard.writeText(value);
    }
  };

  const payPanelContent = payPanel && (
    <div className="bg-white border border-[#e2e8f0] rounded-2xl p-6 shadow-md space-y-6">
      <div className="flex items-start justify-between">
        <div>
          <h2 className="text-2xl font-semibold text-[#0e1f42]">Select Payment Method</h2>
          <p className="text-sm text-[#64748b]">Choose your preferred payment method to complete your payment.</p>
          <div className="mt-3 text-sm text-[#475467]">
            <p className="font-semibold text-[#0e1f42]">{property?.name}</p>
            <p>{payPanel.type === 'rent' ? 'Yearly Rent' : payPanel.item.name}</p>
            <p className="text-lg font-bold text-[#0e1f42]">₦{(payPanel.type === 'rent' ? rentInfo?.amount : payPanel.item.amount)?.toLocaleString()}</p>
          </div>
        </div>
        <button onClick={closePanel} className="text-gray-500 hover:text-gray-800">
          <i className="fas fa-times"></i>
        </button>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        {PayMethods.map((m) => (
          <button
            key={m}
            onClick={() => setPayMethod(m)}
            className={`p-4 rounded-2xl border transition-all text-left hover:border-[var(--accent-color,#9F7539)] hover:shadow-md ${
              payMethod === m ? 'border-[#d97706] bg-[#fff7ed] shadow-lg' : 'border-[#e2e8f0] bg-white'
            }`}
          >
            <div className="text-sm font-semibold text-[#0e1f42]">{m}</div>
            <p className="text-xs text-[#475467] mt-1">
              {m === 'Paystack' ? 'Quick and secure payments' : m === 'Card' ? 'Pay securely with your card' : 'Transfer directly from your bank'}
            </p>
          </button>
        ))}
      </div>

      {payMethod !== 'Bank Transfer' && (
        <div className="bg-white rounded-2xl border border-[#e2e8f0] shadow-sm p-6 space-y-4">
          <h2 className="text-sm font-semibold text-[#0e1f42] border-b border-[#f1f5f9] pb-3">Card Information</h2>
          <div className="space-y-4">
            <label className="flex flex-col text-sm text-[#475467]">
              Card Number
              <input
                type="text"
                className="mt-2 border border-gray-200 rounded-xl p-3 focus:outline-none focus:ring-2 focus:ring-[#deb887]/40"
                placeholder="1234 5678 9012 3456"
              />
              <span className="text-xs text-red-500 mt-1">Valid card number is required</span>
            </label>
            <div className="grid md:grid-cols-3 gap-4">
              <label className="flex flex-col text-sm text-[#475467]">
                Card Holder Name
                <input
                  type="text"
                  className="mt-2 border border-gray-200 rounded-xl p-3 focus:outline-none focus:ring-2 focus:ring-[#deb887]/40"
                  placeholder="John Doe"
                />
              </label>
              <label className="flex flex-col text-sm text-[#475467]">
                Expiry Date
                <input
                  type="text"
                  className="mt-2 border border-gray-200 rounded-xl p-3 focus:outline-none focus:ring-2 focus:ring-[#deb887]/40"
                  placeholder="MM/YY"
                />
              </label>
              <label className="flex flex-col text-sm text-[#475467]">
                CVV
                <input
                  type="text"
                  className="mt-2 border border-gray-200 rounded-xl p-3 focus:outline-none focus:ring-2 focus:ring-[#deb887]/40"
                  placeholder="123"
                />
              </label>
            </div>
          </div>
        </div>
      )}

      {payMethod === 'Bank Transfer' && (
        <div className="bg-white rounded-2xl border border-[#e2e8f0] shadow-sm p-6 space-y-4">
          <h2 className="text-sm font-semibold text-[#0e1f42] border-b border-[#f1f5f9] pb-3">Bank Transfer Instructions</h2>
          <div className="space-y-3 text-sm text-[#475467]">
            <div className="flex items-center justify-between">
              <span className="font-semibold">Bank Name</span>
              <span className="text-[#0e1f42]">Zenith Bank</span>
            </div>
            <div className="flex items-center justify-between">
              <span>Account Number</span>
              <div className="flex items-center gap-2">
                <span className="text-[#0e1f42] font-semibold">8325001746</span>
                <button
                  onClick={() => handleCopy('8325001746')}
                  className="h-8 w-8 rounded-full flex items-center justify-center text-xs"
                  style={{ backgroundColor: 'var(--accent-color, #9F7539)', color: 'var(--white, #FFFFFF)' }}
                  aria-label="Copy account number"
                >
                  <i className="fas fa-copy"></i>
                </button>
              </div>
            </div>
            <div className="flex items-center justify-between">
              <span>Account Name</span>
              <span className="text-[#0e1f42] font-semibold">DomiHive Elite Property Solutions Ltd</span>
            </div>
            <div className="flex items-center justify-between">
              <span>Reference</span>
              <div className="flex items-center gap-2">
                <span className="text-[#0e1f42] font-semibold">DH-RENT-{selectedPropertyId}</span>
                <button
                  onClick={() => handleCopy(`DH-RENT-${selectedPropertyId}`)}
                  className="h-8 w-8 rounded-full flex items-center justify-center text-xs"
                  style={{ backgroundColor: 'var(--accent-color, #9F7539)', color: 'var(--white, #FFFFFF)' }}
                  aria-label="Copy reference"
                >
                  <i className="fas fa-copy"></i>
                </button>
              </div>
            </div>
            <div className="flex items-center justify-between">
              <span>Amount</span>
              <span className="text-[#0e1f42] font-semibold">₦{(payPanel.type === 'rent' ? rentInfo?.amount : payPanel.item.amount)?.toLocaleString()}</span>
            </div>
          </div>
          <div className="space-y-1">
            <label className="text-xs font-semibold text-[#6c757d]">Upload Transfer Receipt</label>
            <input
              type="file"
              className="w-full text-sm text-[#475467] border border-[#e2e8f0] rounded-xl p-2"
            />
            <p className="text-xs text-[#6c757d]">Upload proof of payment after transfer.</p>
          </div>
        </div>
      )}

      <div className="flex justify-end">
        <button
          onClick={submitPayment}
          className="px-4 py-2 rounded-full text-sm font-semibold text-white shadow-sm bg-gradient-to-r from-[var(--primary-color,#0e1f42)] to-[#1a2d5f] hover:from-[#1a2d5f] hover:to-[var(--primary-color,#0e1f42)] transition-colors"
        >
          {payMethod === 'Bank Transfer' ? 'Submit Transfer' : 'Continue'}
        </button>
      </div>
    </div>
  );

  const payNowSection = (
    <div className="bg-white border border-[#e2e8f0] rounded-2xl p-5 space-y-4 shadow-sm">
      <div className="flex gap-2 mb-2">
        {['rent', 'bills'].map((tab) => (
          <button
            key={tab}
            onClick={() => setSubTab(tab)}
            className={`px-3 py-2 text-sm font-semibold border rounded-lg transition-colors ${
              subTab === tab ? '' : 'hover:bg-[var(--card-bg,#ffffff)] hover:text-[var(--accent-color,#9F7539)]'
            }`}
            style={{
              borderColor: subTab === tab ? 'var(--accent-color, #9F7539)' : 'var(--text-color, #0e1f42)',
              color: subTab === tab ? '#fff' : 'var(--text-color, #0e1f42)',
              backgroundColor: subTab === tab ? 'var(--accent-color, #9F7539)' : 'transparent'
            }}
          >
            {tab === 'rent' ? 'Rent' : 'Bills'}
          </button>
        ))}
      </div>

      {subTab === 'rent' && rentInfo ? (
        <div className="border border-[#e2e8f0] rounded-2xl p-4 shadow-sm bg-white flex flex-col gap-2">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-semibold text-[#0e1f42]">Yearly Rent</p>
              <p className="text-xs text-[#475467]">{property?.unitType || ''} • {property?.location}</p>
            </div>
            <span
              className="px-3 py-1 rounded-full text-xs font-semibold border"
              style={{
                backgroundColor: '#0e1f42',
                color: '#fff',
                borderColor: '#0e1f42'
              }}
            >
              {rentInfo.status}
            </span>
          </div>
          <p className="text-2xl font-bold text-[#0e1f42]">₦{rentInfo.amount.toLocaleString()}</p>
          <p className="text-sm text-[#475467]">Next due: {rentInfo.nextDue}</p>
          <div className="flex justify-end">
            <button
              onClick={() => handlePay('rent', rentInfo)}
              className="px-4 py-2 rounded-full text-sm font-semibold text-white shadow-sm bg-gradient-to-r from-[var(--primary-color,#0e1f42)] to-[#1a2d5f] hover:from-[#1a2d5f] hover:to-[var(--primary-color,#0e1f42)] transition-colors"
              disabled={!isDue(rentInfo.status)}
            >
              Pay Rent
            </button>
          </div>
        </div>
      ) : subTab === 'rent' ? (
        <p className="text-sm text-[#6c757d]">No rent info for this property.</p>
      ) : null}

      {subTab === 'bills' && (
        <div className="space-y-3">
          {propertyBills.length === 0 ? (
            <p className="text-sm text-[#6c757d]">No bills for this property.</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full text-sm text-left">
                <thead className="text-xs text-[#6c757d]">
                  <tr>
                    <th className="py-2 pr-4">Bill</th>
                    <th className="py-2 pr-4">Amount</th>
                    <th className="py-2 pr-4">Due Date</th>
                    <th className="py-2 pr-4">Status</th>
                    <th className="py-2"></th>
                  </tr>
                </thead>
                <tbody className="text-[#475467]">
                  {propertyBills.map((bill) => (
                    <tr key={bill.id} className="border-t border-[#e2e8f0]">
                      <td className="py-2 pr-4">{bill.name}</td>
                      <td className="py-2 pr-4 font-semibold text-[#0e1f42]">₦{bill.amount.toLocaleString()}</td>
                      <td className="py-2 pr-4">{bill.dueDate}</td>
                      <td className="py-2 pr-4">
                        <span
                          className="px-2 py-1 rounded-full text-[11px] font-semibold border"
                          style={{
                            backgroundColor: '#0e1f42',
                            color: '#fff',
                            borderColor: '#0e1f42'
                          }}
                        >
                          {bill.status}
                        </span>
                      </td>
                      <td className="py-2 pr-4 text-right">
                        <button
                          onClick={() => handlePay('bill', bill)}
                          className="px-3 py-2 rounded-full text-xs font-semibold text-white shadow-sm bg-gradient-to-r from-[var(--primary-color,#0e1f42)] to-[#1a2d5f] hover:from-[#1a2d5f] hover:to-[var(--primary-color,#0e1f42)] transition-colors"
                          disabled={!isDue(bill.status)}
                        >
                          Pay Bill
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}
    </div>
  );

  const receiptsSection = (
    <div className="bg-white border border-[#e2e8f0] rounded-2xl p-5 space-y-4 shadow-sm">
      <div className="overflow-x-auto">
        <table className="min-w-full text-sm text-left">
          <thead className="text-xs text-[#6c757d]">
            <tr>
              <th className="py-2 pr-4">Receipt ID</th>
              <th className="py-2 pr-4">Property</th>
              <th className="py-2 pr-4">Type</th>
              <th className="py-2 pr-4">Amount</th>
              <th className="py-2 pr-4">Method</th>
              <th className="py-2 pr-4">Date</th>
              <th className="py-2">Status</th>
              <th className="py-2"></th>
            </tr>
          </thead>
          <tbody className="text-[#475467]">
            {receipts.map((r) => (
              <tr key={r.id} className="border-t border-[#e2e8f0]">
                <td className="py-2 pr-4">{r.id}</td>
                <td className="py-2 pr-4">{r.propertyName}</td>
                <td className="py-2 pr-4">{r.type}</td>
                <td className="py-2 pr-4 font-semibold text-[#0e1f42]">₦{r.amount.toLocaleString()}</td>
                <td className="py-2 pr-4">{r.method}</td>
                <td className="py-2 pr-4">{r.date}</td>
                <td className="py-2 pr-4">
                  <span
                    className="px-2 py-1 rounded-full text-[11px] font-semibold border"
                    style={{
                      backgroundColor: '#0e1f42',
                      color: '#fff',
                      borderColor: '#0e1f42'
                    }}
                  >
                    {r.status}
                  </span>
                </td>
                <td className="py-2 pr-4">
                  <button className="text-[var(--accent-color,#9F7539)] font-semibold text-sm">Download Receipt</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );

  const historySection = (
    <div className="bg-white border border-[#e2e8f0] rounded-2xl p-5 space-y-4 shadow-sm">
      <div className="overflow-x-auto">
        <table className="min-w-full text-sm text-left">
          <thead className="text-xs text-[#6c757d]">
            <tr>
              <th className="py-2 pr-4">Date</th>
              <th className="py-2 pr-4">Title</th>
              <th className="py-2 pr-4">Property</th>
              <th className="py-2 pr-4">Amount</th>
              <th className="py-2">Status</th>
            </tr>
          </thead>
          <tbody className="text-[#475467]">
            {history.map((h) => (
              <tr key={h.id} className="border-t border-[#e2e8f0]">
                <td className="py-2 pr-4">{h.date}</td>
                <td className="py-2 pr-4">{h.title}</td>
                <td className="py-2 pr-4">{h.propertyName}</td>
                <td className="py-2 pr-4 font-semibold text-[#0e1f42]">₦{h.amount.toLocaleString()}</td>
                <td className="py-2 pr-4">
                  <span
                    className="px-2 py-1 rounded-full text-[11px] font-semibold border"
                    style={{
                      backgroundColor: '#0e1f42',
                      color: '#fff',
                      borderColor: '#0e1f42'
                    }}
                  >
                    {h.status}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );

  return (
    <div className="rent-overview-container payments-page bg-[var(--page-bg,#f8f9fa)] min-h-screen p-4 md:p-6">
      <div className="bg-[var(--card-bg,#ffffff)] rounded-lg shadow-md border border-[var(--gray-light,#e2e8f0)] p-6 space-y-6">
        <div className="space-y-2">
          <h1 className="text-3xl font-bold text-[var(--text-color,#0e1f42)]">Payments</h1>
          <p className="text-sm text-[var(--text-muted,#64748b)]">Pay rent and bills, view receipts, and track history.</p>
        </div>

        <div className="flex flex-wrap gap-3 items-center">
          <label className="text-sm text-[var(--text-muted,#475467)]">
            Select Property
            <select
              value={selectedPropertyId}
              onChange={(e) => setSelectedPropertyId(e.target.value)}
              className="border border-[var(--gray-light,#e2e8f0)] rounded-lg px-3 py-2 text-sm ml-2 bg-[var(--card-bg,#ffffff)] text-[var(--text-color,#0e1f42)]"
            >
              <option value="">{activeProperties.length ? 'Select property' : 'No active property yet'}</option>
              {activeProperties.map((p) => (
                <option key={p.propertyId} value={p.propertyId}>{p.name}</option>
              ))}
            </select>
          </label>
        </div>

        {activeProperties.length === 0 ? (
          <div className="bg-white border border-[#e2e8f0] rounded-2xl p-6 text-center">
            <p className="text-base font-semibold text-[#0e1f42]">No active property yet</p>
            <p className="text-sm text-[#64748b] mt-1">Once your application is approved and move-in is confirmed, payment records will appear here.</p>
          </div>
        ) : (
          <>
            <PaymentTabs active={mainTab} onChange={(tab) => { setMainTab(tab); if (tab !== 'pay') setPayPanel(null); }} />

            {mainTab === 'pay' && (
              <>
                {payNowSection}
                {payPanelContent}
              </>
            )}
            {mainTab === 'receipts' && receiptsSection}
            {mainTab === 'history' && historySection}
          </>
        )}
      </div>
    </div>
  );
};

export default PaymentsPage;
