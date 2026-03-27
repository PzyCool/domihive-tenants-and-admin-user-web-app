import React, { useEffect, useMemo, useState } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { Loader2, UserCircle2 } from "lucide-react";
import { useAdmin } from "../../../context/AdminContext";

const cardClass =
  "bg-white dark:bg-[#111827] border border-gray-100 dark:border-white/10 rounded-xl p-4";
const inputClass =
  "mt-1 w-full border border-gray-200 dark:border-white/10 dark:bg-[#0f172a] rounded-md px-3 py-2 text-sm text-gray-700 dark:text-gray-200 outline-none focus:border-[#9F7539]";
const labelClass = "text-xs font-medium text-gray-600 dark:text-gray-400";

const generateContractId = () => {
  const year = new Date().getFullYear();
  const random = Math.floor(100 + Math.random() * 900);
  return `CTR-${year}-${random}`;
};

const addYearsToDate = (dateValue, years) => {
  if (!dateValue) return "";
  const date = new Date(dateValue);
  date.setFullYear(date.getFullYear() + Number(years || 0));
  return date.toISOString().slice(0, 10);
};

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

export default function AdminCreateContract() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { clients, setClients } = useAdmin();
  const mode = searchParams.get("mode");
  const renewalClientId = searchParams.get("clientId");
  const isRenewalMode = mode === "renew" && Boolean(renewalClientId);
  const renewalClient = useMemo(
    () => clients.find((c) => c.id === renewalClientId) || null,
    [clients, renewalClientId]
  );
  const [errors, setErrors] = useState({});
  const [isDraftSaved, setIsDraftSaved] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [form, setForm] = useState({
    newClientName: "",
    newClientEmail: "",
    newClientPhone: "",
    profileImageFile: null,
    profileImagePreview: "",
    bankName: "",
    accountName: "",
    accountNumber: "",
    contractType: "Full Management",
    durationYears: "5",
    startDate: "",
    endDate: "",
    managementFeeType: "Percentage of Rent",
    managementFeeValue: "10",
    autoDeductFee: true,
    enableMaintenanceWallet: false,
    walletBalance: "",
    maintenanceMarkup: "",
    monthlyReports: true,
    quarterlyInspection: true,
    contractSigned: false,
    signedContractFile: null,
    contractId: generateContractId(),
    notes: "",
  });

  useEffect(() => {
    if (!isRenewalMode || !renewalClient) return;

    const feePercent = Number(renewalClient.managementFeePercent || 10);
    const durationYearsMatch = String(renewalClient.contractDuration || "").match(/^(\d+)/);
    const durationYears = durationYearsMatch ? durationYearsMatch[1] : "5";
    const currentEnd = String(renewalClient.contractDuration || "").match(/-\s*([0-9]{4}-[0-9]{2}-[0-9]{2})\)/)?.[1] || "";
    const suggestedStart = currentEnd
      ? (() => {
          const d = new Date(currentEnd);
          d.setDate(d.getDate() + 1);
          return d.toISOString().slice(0, 10);
        })()
      : "";

    setForm((prev) => ({
      ...prev,
      newClientName: renewalClient.name || "",
      newClientEmail: renewalClient.email || "",
      newClientPhone: renewalClient.phone || "",
      profileImagePreview: renewalClient.avatar || "",
      bankName: renewalClient.bankName || "",
      accountName: renewalClient.accountName || renewalClient.name || "",
      accountNumber: renewalClient.accountNumber || "",
      contractType: renewalClient.contractType || "Full Management",
      durationYears,
      startDate: suggestedStart || prev.startDate,
      endDate: addYearsToDate(suggestedStart || prev.startDate, durationYears),
      managementFeeValue: String(feePercent || 10),
      contractId: generateContractId(),
      notes: `Renewal for ${renewalClient.name}${renewalClient.contractId ? ` (Previous: ${renewalClient.contractId})` : ""}`,
    }));
  }, [isRenewalMode, renewalClient]);

  const setField = (name, value) => {
    setForm((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: "" }));
    }
  };

  const handleDurationChange = (years) => {
    setForm((prev) => ({
      ...prev,
      durationYears: years,
      endDate: addYearsToDate(prev.startDate, years),
    }));
  };

  const handleStartDateChange = (startDate) => {
    setForm((prev) => ({
      ...prev,
      startDate,
      endDate: addYearsToDate(startDate, prev.durationYears),
    }));
  };

  const handleProfileUpload = (file) => {
    if (!file) return;
    const preview = URL.createObjectURL(file);
    setForm((prev) => ({
      ...prev,
      profileImageFile: file,
      profileImagePreview: preview,
    }));
  };

  const validate = () => {
    const nextErrors = {};
    if (!form.newClientName.trim()) nextErrors.newClientName = "Full name is required.";
    if (!form.newClientEmail.trim()) nextErrors.newClientEmail = "Email is required.";
    if (!form.newClientPhone.trim()) nextErrors.newClientPhone = "Phone is required.";
    if (!form.bankName.trim()) nextErrors.bankName = "Bank name is required.";
    if (!form.accountName.trim()) nextErrors.accountName = "Account name is required.";
    if (!form.accountNumber.trim()) nextErrors.accountNumber = "Account number is required.";
    if (!form.startDate) nextErrors.startDate = "Start date is required.";
    if (!form.endDate) nextErrors.endDate = "End date is required.";
    if (!form.managementFeeValue) nextErrors.managementFeeValue = "Fee value is required.";

    if (form.enableMaintenanceWallet) {
      if (!form.walletBalance) nextErrors.walletBalance = "Initial wallet balance is required.";
      if (!form.maintenanceMarkup) nextErrors.maintenanceMarkup = "Maintenance markup is required.";
    }

    if (form.contractSigned && !form.signedContractFile) {
      nextErrors.signedContractFile = "Upload signed contract PDF.";
    }

    setErrors(nextErrors);
    return Object.keys(nextErrors).length === 0;
  };

  const buildClientPayload = (statusLabel, existingClient = null) => ({
    id: existingClient?.id || `client-${Date.now()}`,
    name: form.newClientName.trim(),
    avatar:
      form.profileImagePreview || "https://randomuser.me/api/portraits/lego/1.jpg",
    email: form.newClientEmail.trim(),
    phone: form.newClientPhone.trim(),
    clientSince: new Date().toLocaleDateString("en-US", { month: "short", year: "numeric" }),
    location: "Lagos, Nigeria",
    description: "Newly onboarded property client",
    bankName: form.bankName.trim(),
    accountName: form.accountName.trim(),
    accountNumber: form.accountNumber.trim(),
    totalProperties: 0,
    occupiedUnits: 0,
    occupancyPct: 0,
    contractStatus: statusLabel,
    managementFeePercent: Number(form.managementFeeValue) || 0,
    managementFeeValue: `N${Math.round(
      Number(form.managementFeeValue || 0) * 1000
    ).toLocaleString()}/month avg`,
    contractType: form.contractType,
    contractDuration: `${form.durationYears} year${
      Number(form.durationYears) > 1 ? "s" : ""
    } (${form.startDate || "N/A"} - ${form.endDate || "N/A"})`,
    maintenanceWallet: form.enableMaintenanceWallet
      ? `N${Number(form.walletBalance || 0).toLocaleString()}`
      : "Disabled",
    rentIncrement: "Every 1 year",
    nextIncrement: "Pending",
    pendingPropertyAssignment: true,
    pendingPropertyAssignmentNote:
      "Pending: create a property for this client and link it.",
    contractId: form.contractId,
    previousContracts: [
      ...(Array.isArray(existingClient?.previousContracts) ? existingClient.previousContracts : []),
      ...(existingClient?.contractId
        ? [
            {
              contractId: existingClient.contractId,
              contractStatus: existingClient.contractStatus || "Active",
              contractType: existingClient.contractType || "Full Management",
              contractDuration: existingClient.contractDuration || "",
              managementFeePercent: Number(existingClient.managementFeePercent || 0),
              renewedAt: new Date().toISOString(),
            },
          ]
        : []),
    ],
  });

  const handleSaveDraft = () => {
    if (isRenewalMode && renewalClient) {
      const payload = buildClientPayload("Draft", renewalClient);
      setClients((prev) => prev.map((c) => (c.id === renewalClient.id ? payload : c)));
    } else {
      const payload = buildClientPayload("Draft");
      setClients((prev) => [payload, ...prev]);
    }
    setIsDraftSaved(true);
  };

  const handleCreateContract = async (e) => {
    e.preventDefault();
    setIsDraftSaved(false);
    if (!validate()) return;
    setIsSubmitting(true);

    await sleep(1200);

    if (isRenewalMode && renewalClient) {
      const payload = buildClientPayload("Active", renewalClient);
      setClients((prev) => prev.map((c) => (c.id === renewalClient.id ? payload : c)));
    } else {
      const payload = buildClientPayload("Active");
      setClients((prev) => [payload, ...prev]);
    }
    navigate("/admin/clients", {
      state: {
        infoBanner: isRenewalMode
          ? "Contract renewed successfully."
          : "Contract created. Pending: please create a property for this client and link it.",
      },
    });
  };

  return (
    <form className="space-y-6" onSubmit={handleCreateContract}>
      <div>
        <div className="text-xs text-gray-500 dark:text-gray-400">
          <Link to="/admin" className="hover:text-[#9F7539]">Admin</Link>
          <span className="px-1">&gt;</span>
          <Link to="/admin/clients" className="hover:text-[#9F7539]">Clients</Link>
          <span className="px-1">&gt;</span>
          <span>{isRenewalMode ? "Renew Client Contract" : "Create New Contract"}</span>
        </div>
        <h1 className="text-xl sm:text-2xl font-bold text-[#0e1f42] dark:text-white mt-2">
          {isRenewalMode ? "Renew Client Contract" : "Create New Contract"}
        </h1>
        <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400">
          {isRenewalMode
            ? "Review and renew this client contract with updated terms."
            : "Set up a new property management contract and link it to a client and property."}
        </p>
      </div>

      <section className={cardClass}>
        <h3 className="text-sm font-semibold text-[#0e1f42] dark:text-white mb-3">Client Information</h3>
        <div className="mb-3 flex items-center gap-3">
          <div className="h-14 w-14 rounded-full border border-gray-200 dark:border-white/10 bg-gray-50 dark:bg-[#0f172a] flex items-center justify-center overflow-hidden">
            {form.profileImagePreview ? (
              <img
                src={form.profileImagePreview}
                alt="Client preview"
                className="h-full w-full object-cover"
              />
            ) : (
              <UserCircle2 size={34} className="text-gray-400 dark:text-gray-500" />
            )}
          </div>
          <div className="text-xs text-gray-500 dark:text-gray-400">
            Client profile preview
          </div>
        </div>
        <div className="grid md:grid-cols-3 gap-3">
          <div>
            <label className={labelClass}>Full Name</label>
            <input className={inputClass} value={form.newClientName} onChange={(e) => setField("newClientName", e.target.value)} />
            {errors.newClientName && <p className="text-[11px] text-red-500 mt-1">{errors.newClientName}</p>}
          </div>
          <div>
            <label className={labelClass}>Email Address</label>
            <input className={inputClass} value={form.newClientEmail} onChange={(e) => setField("newClientEmail", e.target.value)} />
            {errors.newClientEmail && <p className="text-[11px] text-red-500 mt-1">{errors.newClientEmail}</p>}
          </div>
          <div>
            <label className={labelClass}>Phone Number</label>
            <input className={inputClass} value={form.newClientPhone} onChange={(e) => setField("newClientPhone", e.target.value)} />
            {errors.newClientPhone && <p className="text-[11px] text-red-500 mt-1">{errors.newClientPhone}</p>}
          </div>
        </div>
        <div className="mt-3">
          <label className={labelClass}>Client Profile Upload</label>
          <input
            type="file"
            accept="image/*"
            className={inputClass}
            onChange={(e) => handleProfileUpload(e.target.files?.[0] || null)}
          />
        </div>
      </section>

      <section className={cardClass}>
        <h3 className="text-sm font-semibold text-[#0e1f42] dark:text-white mb-3">Client Payout Details</h3>
        <div className="grid md:grid-cols-3 gap-3">
          <div>
            <label className={labelClass}>Bank Name</label>
            <input className={inputClass} value={form.bankName} onChange={(e) => setField("bankName", e.target.value)} />
            {errors.bankName && <p className="text-[11px] text-red-500 mt-1">{errors.bankName}</p>}
          </div>
          <div>
            <label className={labelClass}>Account Name</label>
            <input className={inputClass} value={form.accountName} onChange={(e) => setField("accountName", e.target.value)} />
            {errors.accountName && <p className="text-[11px] text-red-500 mt-1">{errors.accountName}</p>}
          </div>
          <div>
            <label className={labelClass}>Account Number</label>
            <input className={inputClass} value={form.accountNumber} onChange={(e) => setField("accountNumber", e.target.value)} />
            {errors.accountNumber && <p className="text-[11px] text-red-500 mt-1">{errors.accountNumber}</p>}
          </div>
        </div>
      </section>

      <section className={cardClass}>
        <h3 className="text-sm font-semibold text-[#0e1f42] dark:text-white mb-3">Contract Configuration</h3>
        <div className="grid md:grid-cols-2 gap-3">
          <div>
            <label className={labelClass}>Contract Type</label>
            <select className={inputClass} value={form.contractType} onChange={(e) => setField("contractType", e.target.value)}>
              <option value="Full Management">Full Management</option>
            </select>
          </div>
          <div>
            <label className={labelClass}>Contract Duration</label>
            <select className={inputClass} value={form.durationYears} onChange={(e) => handleDurationChange(e.target.value)}>
              <option value="1">1 Year</option>
              <option value="2">2 Years</option>
              <option value="3">3 Years</option>
              <option value="5">5 Years</option>
            </select>
          </div>
          <div>
            <label className={labelClass}>Start Date</label>
            <input type="date" className={inputClass} value={form.startDate} onChange={(e) => handleStartDateChange(e.target.value)} />
            {errors.startDate && <p className="text-[11px] text-red-500 mt-1">{errors.startDate}</p>}
          </div>
          <div>
            <label className={labelClass}>End Date</label>
            <input type="date" className={inputClass} value={form.endDate} onChange={(e) => setField("endDate", e.target.value)} />
            {errors.endDate && <p className="text-[11px] text-red-500 mt-1">{errors.endDate}</p>}
          </div>
        </div>
      </section>

      <section className={cardClass}>
        <h3 className="text-sm font-semibold text-[#0e1f42] dark:text-white mb-3">Management Fee Settings</h3>
        <div className="grid md:grid-cols-2 gap-3">
          <div>
            <label className={labelClass}>Management Fee Type</label>
            <select className={inputClass} value={form.managementFeeType} onChange={(e) => setField("managementFeeType", e.target.value)}>
              <option value="Percentage of Rent">Percentage of Rent</option>
            </select>
          </div>
          <div>
            <label className={labelClass}>Management Fee Value (%)</label>
            <div className="relative">
              <input type="number" className={`${inputClass} pr-8`} value={form.managementFeeValue} onChange={(e) => setField("managementFeeValue", e.target.value)} />
              <span className="absolute right-3 top-1/2 -translate-y-1/2 text-sm text-gray-500">%</span>
            </div>
            {errors.managementFeeValue && <p className="text-[11px] text-red-500 mt-1">{errors.managementFeeValue}</p>}
          </div>
        </div>
        <label className="mt-3 inline-flex items-center gap-2 text-sm text-gray-700 dark:text-gray-200">
          <input type="checkbox" checked={form.autoDeductFee} onChange={(e) => setField("autoDeductFee", e.target.checked)} />
          Automatically deduct management fee before landlord payout
        </label>
      </section>

      <section className={cardClass}>
        <h3 className="text-sm font-semibold text-[#0e1f42] dark:text-white mb-3">Maintenance Settings</h3>
        <label className="inline-flex items-center gap-2 text-sm text-gray-700 dark:text-gray-200">
          <input
            type="checkbox"
            checked={form.enableMaintenanceWallet}
            onChange={(e) => setField("enableMaintenanceWallet", e.target.checked)}
          />
          Enable Maintenance Wallet
        </label>
        {form.enableMaintenanceWallet && (
          <div className="grid md:grid-cols-2 gap-3 mt-3">
            <div>
              <label className={labelClass}>Initial Wallet Balance (N)</label>
              <input type="number" className={inputClass} value={form.walletBalance} onChange={(e) => setField("walletBalance", e.target.value)} />
              {errors.walletBalance && <p className="text-[11px] text-red-500 mt-1">{errors.walletBalance}</p>}
            </div>
            <div>
              <label className={labelClass}>Maintenance Markup (%)</label>
              <input type="number" className={inputClass} value={form.maintenanceMarkup} onChange={(e) => setField("maintenanceMarkup", e.target.value)} />
              {errors.maintenanceMarkup && <p className="text-[11px] text-red-500 mt-1">{errors.maintenanceMarkup}</p>}
            </div>
          </div>
        )}
      </section>

      <section className={cardClass}>
        <h3 className="text-sm font-semibold text-[#0e1f42] dark:text-white mb-3">Reporting & Operations</h3>
        <div className="space-y-2">
          <label className="inline-flex items-center gap-2 text-sm text-gray-700 dark:text-gray-200">
            <input type="checkbox" checked={form.monthlyReports} onChange={(e) => setField("monthlyReports", e.target.checked)} />
            Monthly Financial Reports
          </label>
          <label className="inline-flex items-center gap-2 text-sm text-gray-700 dark:text-gray-200">
            <input type="checkbox" checked={form.quarterlyInspection} onChange={(e) => setField("quarterlyInspection", e.target.checked)} />
            Quarterly Property Inspection
          </label>
        </div>
      </section>

      <section className={cardClass}>
        <h3 className="text-sm font-semibold text-[#0e1f42] dark:text-white mb-3">Contract Document</h3>
        <label className="inline-flex items-center gap-2 text-sm text-gray-700 dark:text-gray-200">
          <input type="checkbox" checked={form.contractSigned} onChange={(e) => setField("contractSigned", e.target.checked)} />
          Contract Signed
        </label>
        <div className="mt-3">
          <label className={labelClass}>Upload Signed Contract (PDF)</label>
          <input
            type="file"
            accept=".pdf,application/pdf"
            className={inputClass}
            onChange={(e) => setField("signedContractFile", e.target.files?.[0] || null)}
          />
          {errors.signedContractFile && <p className="text-[11px] text-red-500 mt-1">{errors.signedContractFile}</p>}
        </div>
      </section>

      <section className={cardClass}>
        <h3 className="text-sm font-semibold text-[#0e1f42] dark:text-white mb-3">Contract Details</h3>
        <div className="grid md:grid-cols-2 gap-3">
          <div>
            <label className={labelClass}>Contract ID</label>
            <input className={inputClass} value={form.contractId} readOnly />
          </div>
          <div>
            <label className={labelClass}>Notes</label>
            <textarea rows={3} className={inputClass} value={form.notes} onChange={(e) => setField("notes", e.target.value)} />
          </div>
        </div>
      </section>

      {isDraftSaved && <p className="text-sm text-green-600 dark:text-green-400">Draft saved successfully.</p>}

      <div className="flex flex-wrap items-center justify-end gap-3 pt-2">
        <button
          type="button"
          onClick={() => navigate(-1)}
          className="px-4 py-2 text-sm border border-gray-200 dark:border-white/10 rounded-md text-gray-600 dark:text-gray-300 bg-white dark:bg-[#0f172a]"
          disabled={isSubmitting}
        >
          Cancel
        </button>
        <button
          type="button"
          onClick={handleSaveDraft}
          className="px-4 py-2 text-sm border border-[#9F7539] rounded-md text-[#9F7539] bg-transparent"
          disabled={isSubmitting}
        >
          Save as Draft
        </button>
        <button
          type="submit"
          className="px-4 py-2 text-sm rounded-md text-white bg-[#9F7539] inline-flex items-center gap-2"
          disabled={isSubmitting}
        >
          {isSubmitting ? (
            <>
              <Loader2 size={14} className="animate-spin" />
              Creating Contract...
            </>
          ) : (
            isRenewalMode ? "Renew Contract" : "Create Contract"
          )}
        </button>
      </div>
    </form>
  );
}
