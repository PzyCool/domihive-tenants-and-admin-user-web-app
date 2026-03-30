import React, { useEffect, useMemo, useState } from "react";
import {
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  DoorOpen,
  Building2,
  Landmark,
  House,
  X,
  Video,
} from "lucide-react";
import { useAdmin } from "../../../context/AdminContext";
import { useNavigate, useParams } from "react-router-dom";

const UNIT_TYPE_OPTIONS = [
  {
    value: "Self-Contain (Studio)",
    label: "Self-Contain (Studio)",
    description: "Single open space with private bathroom",
    icon: DoorOpen,
  },
  {
    value: "Mini Flat",
    label: "Mini Flat",
    description: "Separate bedroom, living area, kitchen and bathroom",
    icon: House,
  },
  {
    value: "Apartment (Flat)",
    label: "Apartment (Flat)",
    description: "Standard residential unit with separate rooms",
    icon: Building2,
  },
  {
    value: "Penthouse",
    label: "Penthouse",
    description: "Luxury top-floor unit with premium features",
    icon: Landmark,
  },
];

const AMENITIES = [
  "WiFi",
  "A/C",
  "Jacuzzi",
  "Central Water Heater System",
  "POP Ceilings",
];

const formatAmountInWords = (value) => {
  if (value === "" || value === null || value === undefined) return "";
  const amount = Number(value) || 0;
  if (amount <= 0) return "0";
  if (amount > 0 && amount < 1000 && !Number.isInteger(amount)) {
    return `${Number(amount.toFixed(2)).toLocaleString()} million`;
  }
  if (amount >= 1_000_000_000) {
    const n = amount / 1_000_000_000;
    return `${Number(n.toFixed(1)).toLocaleString()} billion`;
  }
  if (amount >= 1_000_000) {
    const n = amount / 1_000_000;
    return `${Number(n.toFixed(1)).toLocaleString()} million`;
  }
  if (amount >= 1_000) {
    const n = amount / 1_000;
    return `${Number(n.toFixed(1)).toLocaleString()} thousand`;
  }
  return amount.toLocaleString();
};

const Section = ({ title, children }) => (
  <section className="rounded-md border border-gray-200 dark:border-white/5 bg-white dark:bg-[#111827] transition-colors">
    <div className="border-b border-gray-100 dark:border-white/5 px-4 py-3">
      <h3 className="text-sm font-semibold text-[#0e1f42] dark:text-white">{title}</h3>
    </div>
    <div className="p-4">{children}</div>
  </section>
);

const fileToDataUrl = (file) =>
  new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result || ""));
    reader.onerror = () => reject(new Error("Failed to read file"));
    reader.readAsDataURL(file);
  });

export default function AdminPropertyDetails() {
  const { properties, setProperties, tenants, clients } = useAdmin();
  const navigate = useNavigate();
  const { unitId } = useParams();

  const unitLookup = useMemo(() => {
    for (const property of properties) {
      const unit = (property.units || []).find((item) => item.id === unitId);
      if (unit) {
        const tenant = tenants?.find((t) => t.id === unit.tenantId) || null;
        return { property, unit, tenant };
      }
    }
    return null;
  }, [properties, tenants, unitId]);

  const [form, setForm] = useState({
    unitNumber: "",
    type: "Apartment (Flat)",
    description: "",
    bedrooms: 0,
    bathrooms: 0,
    size: "",
    rent: "",
    caution: "",
    billsIncluded: false,
    billsNote: "",
    furnishingEnabled: false,
    furnishingOptions: [],
    publishedStatus: "unpublished",
    tenantStatus: "vacant",
    amenities: [],
    coverImages: ["", "", ""],
    videoWalkthrough: "",
  });
  const [isUnitTypeOpen, setIsUnitTypeOpen] = useState(false);
  const [activeSlide, setActiveSlide] = useState(0);
  const [slidesSaved, setSlidesSaved] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [isPayoutDrawerOpen, setIsPayoutDrawerOpen] = useState(false);

  useEffect(() => {
    if (!unitLookup) return;
    const { unit } = unitLookup;
    const unitSlides = Array.isArray(unit.images) && unit.images.length
      ? [...unit.images.slice(0, 3), "", "", ""].slice(0, 3)
      : ["", "", ""];

    setForm({
      unitNumber: unit.unitNumber || unit.number || "",
      type: unit.type || "Apartment (Flat)",
      description: unit.description || unit.notes || "",
      bedrooms: Number(unit.bedrooms) || 0,
      bathrooms: Number(unit.bathrooms) || 0,
      size: unit.size || "",
      rent: unit.rent ?? "",
      caution: unit.caution ?? "",
      billsIncluded: Boolean(unit.billsIncluded),
      billsNote: unit.billsNote || "",
      furnishingEnabled: Boolean(unit.furnishingEnabled),
      furnishingOptions: Array.isArray(unit.furnishingOptions)
        ? unit.furnishingOptions
        : unit.furnishing && unit.furnishing !== "none"
          ? [String(unit.furnishing).toLowerCase() === "full" ? "Full" : "Semi"]
          : [],
      publishedStatus: unit.publishedStatus || "unpublished",
      tenantStatus: unit.tenantStatus || unit.status || "vacant",
      amenities: Array.isArray(unit.amenities) ? unit.amenities : [],
      coverImages: unitSlides,
      videoWalkthrough: unit.videoWalkthrough || (typeof unit.video === "string" ? unit.video : ""),
    });
    setSlidesSaved(false);
    setActiveSlide(0);
    setIsEditMode(false);
    setIsUnitTypeOpen(false);
  }, [unitLookup]);

  if (!unitLookup) {
    return <div className="text-sm text-gray-500 dark:text-gray-400">Unit not found.</div>;
  }

  const { property, unit, tenant } = unitLookup;
  const propertyImage = (Array.isArray(property.images) && property.images[0]) || property.image;
  const selectedUnitType =
    UNIT_TYPE_OPTIONS.find((option) => option.value === form.type) || UNIT_TYPE_OPTIONS[2];
  const linkedClient = useMemo(
    () => clients.find((client) => client.id === property.clientId),
    [clients, property.clientId]
  );
  const managementFeePercent = Number(linkedClient?.managementFeePercent || 0);
  const annualRent = Number(form.rent || unit.rent || 0);
  const domihiveAnnual = Math.max(0, (annualRent * managementFeePercent) / 100);
  const clientAnnual = Math.max(0, annualRent - domihiveAnnual);
  const domihiveMonthly = domihiveAnnual / 12;
  const clientMonthly = clientAnnual / 12;
  const hasPayoutConfig = Boolean(linkedClient) && managementFeePercent > 0;

  const toggleAmenity = (name) => {
    setForm((prev) => {
      const hasAmenity = prev.amenities.includes(name);
      return {
        ...prev,
        amenities: hasAmenity
          ? prev.amenities.filter((item) => item !== name)
          : [...prev.amenities, name],
      };
    });
  };

  const toggleFurnishingOption = (option) => {
    setForm((prev) => {
      const hasOption = prev.furnishingOptions.includes(option);
      return {
        ...prev,
        furnishingOptions: hasOption
          ? prev.furnishingOptions.filter((item) => item !== option)
          : [...prev.furnishingOptions, option],
      };
    });
  };

  const moveSlide = (direction) => {
    setActiveSlide((prev) => (prev + direction + 3) % 3);
  };

  const handleSlideUpload = async (index, file) => {
    if (!file) return;
    let preview = "";
    try {
      preview = await fileToDataUrl(file);
    } catch (_error) {
      return;
    }
    setForm((prev) => {
      const nextSlides = [...prev.coverImages];
      nextSlides[index] = preview;
      return { ...prev, coverImages: nextSlides };
    });
    setSlidesSaved(false);
  };

  const handleSaveSlides = () => {
    const slideImages = form.coverImages.filter(Boolean);
    const walkthrough = form.videoWalkthrough?.trim() || "";

    setProperties((prev) =>
      prev.map((item) => {
        if (item.id !== property.id) return item;
        return {
          ...item,
          units: (item.units || []).map((existing) =>
            existing.id === unit.id
              ? {
                  ...existing,
                  images: slideImages,
                  videoWalkthrough: walkthrough,
                  video: walkthrough,
                }
              : existing
          ),
        };
      })
    );

    setSlidesSaved(true);
  };

  const handleSave = () => {
    const walkthrough = form.videoWalkthrough?.trim() || "";

    setProperties((prev) =>
      prev.map((item) => {
        if (item.id !== property.id) return item;
        return {
          ...item,
          units: (item.units || []).map((existing) =>
            existing.id === unit.id
              ? {
                  ...existing,
                  unitNumber: form.unitNumber,
                  number: form.unitNumber,
                  type: form.type,
                  description: form.description?.trim() || "",
                  bedrooms: Number(form.bedrooms) || 0,
                  bathrooms: Number(form.bathrooms) || 0,
                  size: form.size,
                  rent: Number(form.rent) || 0,
                  caution: Number(form.caution) || 0,
                  billsIncluded: form.billsIncluded,
                  billsNote: form.billsNote,
                  furnishingEnabled: Boolean(form.furnishingEnabled),
                  furnishingOptions: form.furnishingEnabled ? form.furnishingOptions : [],
                  publishedStatus: form.publishedStatus,
                  tenantStatus: form.tenantStatus,
                  status: form.tenantStatus,
                  amenities: form.amenities,
                  notes: form.description?.trim() || "",
                  images: form.coverImages.filter(Boolean),
                  videoWalkthrough: walkthrough,
                  video: walkthrough,
                  isConfigured: true,
                }
              : existing
          ),
        };
      })
    );
    navigate(`/admin/properties/${property.id}/units`);
  };

  return (
    <div className="space-y-6">
      <div>
        <div className="flex items-center gap-2 text-xs text-gray-500 dark:text-gray-400">
          <span
            className="hover:text-gray-700 dark:hover:text-gray-200 cursor-pointer"
            onClick={() => navigate(`/admin/properties/${property.id}/units`)}
          >
            Units
          </span>
          <ChevronRight size={14} />
          <span className="text-gray-700 dark:text-gray-300 font-medium">Unit Details</span>
        </div>

        <div className="mt-2 flex items-start justify-between gap-3">
          <div>
            <h1 className="text-2xl font-bold text-[#0e1f42] dark:text-white">
              {form.unitNumber || "Unit"} - {property.title}
            </h1>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Complete and update this unit details record.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setIsPayoutDrawerOpen(true)}
              className="px-3.5 py-2 rounded-md text-sm font-semibold border border-[#9F7539] text-[#9F7539] hover:bg-[#9F7539]/10 transition-colors whitespace-nowrap"
            >
              Payout Breakdown
            </button>
            <button
              type="button"
              onClick={() => setIsEditMode((prev) => !prev)}
              className={`px-3.5 py-2 rounded-md text-sm font-semibold border transition-colors whitespace-nowrap ${
                isEditMode
                  ? "border-red-300 text-red-700 dark:border-red-400/30 dark:text-red-300"
                  : "border-[#9F7539] text-[#9F7539] hover:bg-[#9F7539]/10"
              }`}
            >
              {isEditMode ? "Disable Editing" : "Enable Editing"}
            </button>
          </div>
        </div>
      </div>

      <div className="bg-white dark:bg-[#111827] rounded-2xl border border-gray-200 dark:border-white/5 overflow-hidden shadow-sm transition-colors">
        <div className="h-56 w-full overflow-hidden">
          <img src={propertyImage} alt={property.title} className="w-full h-full object-cover" />
        </div>
      </div>

      <div className="space-y-4">
        <Section title="Unit Information">
          <div className="space-y-3">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <div>
                <label className="text-xs font-medium text-gray-600 dark:text-gray-400">Unit Code</label>
                <input
                  className="mt-1 w-full rounded-md border border-gray-200 dark:border-white/10 bg-transparent dark:text-white px-3 py-2 text-sm outline-none"
                  value={form.unitNumber}
                  readOnly
                />
              </div>

              <div>
                <label className="text-xs font-medium text-gray-600 dark:text-gray-400">Unit Type</label>
                <div className="relative mt-1">
                  <button
                    type="button"
                    onClick={() => isEditMode && setIsUnitTypeOpen((prev) => !prev)}
                    className={`w-full rounded-md border border-gray-200 dark:border-white/10 bg-white dark:bg-[#0f172a] px-3 py-2 text-left ${
                      isEditMode ? "" : "opacity-70 cursor-not-allowed"
                    }`}
                    disabled={!isEditMode}
                  >
                    <div className="flex items-center justify-between gap-2">
                      <div className="flex items-start gap-2 min-w-0">
                        <selectedUnitType.icon size={16} className="mt-0.5 text-[#9F7539]" />
                        <div className="min-w-0">
                          <div className="text-sm font-medium text-gray-800 dark:text-white truncate">
                            {selectedUnitType.label}
                          </div>
                          <div className="text-xs text-gray-500 dark:text-gray-400 truncate">
                            {selectedUnitType.description}
                          </div>
                        </div>
                      </div>
                      <ChevronDown size={16} className="text-gray-500 dark:text-gray-300 shrink-0" />
                    </div>
                  </button>

                  {isUnitTypeOpen && isEditMode && (
                    <div className="absolute z-30 mt-1 w-full rounded-md border border-gray-200 dark:border-white/10 bg-white dark:bg-[#0f172a] shadow-lg max-h-72 overflow-auto">
                      {UNIT_TYPE_OPTIONS.map((option) => {
                        const Icon = option.icon;
                        const selected = form.type === option.value;
                        return (
                          <button
                            key={option.value}
                            type="button"
                            onClick={() => {
                              if (!isEditMode) return;
                              setForm({ ...form, type: option.value });
                              setIsUnitTypeOpen(false);
                            }}
                            className={`w-full text-left p-2.5 border-b last:border-b-0 border-gray-100 dark:border-white/10 transition-colors ${
                              selected ? "bg-[#9F7539]/10" : "hover:bg-gray-50 dark:hover:bg-white/5"
                            }`}
                          >
                            <div className="flex items-start gap-2">
                              <Icon size={16} className={`mt-0.5 ${selected ? "text-[#9F7539]" : "text-gray-500 dark:text-gray-300"}`} />
                              <div className="min-w-0">
                                <div className={`text-sm font-medium ${selected ? "text-[#9F7539]" : "text-gray-800 dark:text-white"}`}>
                                  {option.label}
                                </div>
                                <div className="text-xs text-gray-500 dark:text-gray-400">
                                  {option.description}
                                </div>
                              </div>
                            </div>
                          </button>
                        );
                      })}
                    </div>
                  )}
                </div>
              </div>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              <div>
                <label className="text-xs font-medium text-gray-600 dark:text-gray-400">Bedrooms</label>
                <input
                  type="number"
                  min="0"
                  className="mt-1 w-full rounded-md border border-gray-200 dark:border-white/10 bg-transparent dark:text-white px-3 py-2 text-sm outline-none focus:border-[#9F7539]"
                  value={form.bedrooms}
                  onChange={(e) => setForm({ ...form, bedrooms: Number(e.target.value) || 0 })}
                  disabled={!isEditMode}
                />
              </div>
              <div>
                <label className="text-xs font-medium text-gray-600 dark:text-gray-400">Bathrooms</label>
                <input
                  type="number"
                  min="0"
                  className="mt-1 w-full rounded-md border border-gray-200 dark:border-white/10 bg-transparent dark:text-white px-3 py-2 text-sm outline-none focus:border-[#9F7539]"
                  value={form.bathrooms}
                  onChange={(e) => setForm({ ...form, bathrooms: Number(e.target.value) || 0 })}
                  disabled={!isEditMode}
                />
              </div>
              <div>
                <label className="text-xs font-medium text-gray-600 dark:text-gray-400">Size</label>
                <input
                  className="mt-1 w-full rounded-md border border-gray-200 dark:border-white/10 bg-transparent dark:text-white px-3 py-2 text-sm outline-none focus:border-[#9F7539]"
                  placeholder="e.g. 120 sqm"
                  value={form.size}
                  onChange={(e) => setForm({ ...form, size: e.target.value })}
                  disabled={!isEditMode}
                />
              </div>
              <div className="md:col-span-2">
                <label className="text-xs font-medium text-gray-600 dark:text-gray-400">Published Status</label>
                <div className="mt-2 flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => isEditMode && setForm({ ...form, publishedStatus: "unpublished" })}
                    className={`px-3 py-1.5 rounded-full text-xs font-semibold border ${
                      form.publishedStatus === "unpublished"
                        ? "bg-red-100 text-red-700 border-red-200 dark:bg-red-500/10 dark:text-red-300 dark:border-red-400/30"
                        : "bg-white text-gray-600 border-gray-200 dark:bg-white/5 dark:text-gray-300 dark:border-white/10"
                    } ${isEditMode ? "" : "opacity-60 cursor-not-allowed"}`}
                    disabled={!isEditMode}
                  >
                    Unpublished
                  </button>
                  <button
                    type="button"
                    onClick={() => isEditMode && setForm({ ...form, publishedStatus: "published" })}
                    className={`px-3 py-1.5 rounded-full text-xs font-semibold border ${
                      form.publishedStatus === "published"
                        ? "bg-green-100 text-green-700 border-green-200 dark:bg-green-500/10 dark:text-green-300 dark:border-green-400/30"
                        : "bg-white text-gray-600 border-gray-200 dark:bg-white/5 dark:text-gray-300 dark:border-white/10"
                    } ${isEditMode ? "" : "opacity-60 cursor-not-allowed"}`}
                    disabled={!isEditMode}
                  >
                    Published
                  </button>
                </div>
              </div>

              <div className="md:col-span-2">
                <label className="text-xs font-medium text-gray-600 dark:text-gray-400">Tenant Status</label>
                <div className="mt-2 flex items-center gap-2 flex-wrap">
                  <button
                    type="button"
                    onClick={() => isEditMode && setForm({ ...form, tenantStatus: "occupied" })}
                    className={`px-3 py-1.5 rounded-full text-xs font-semibold border ${
                      form.tenantStatus === "occupied"
                        ? "bg-green-100 text-green-700 border-green-200 dark:bg-green-500/10 dark:text-green-300 dark:border-green-400/30"
                        : "bg-white text-gray-600 border-gray-200 dark:bg-white/5 dark:text-gray-300 dark:border-white/10"
                    } ${isEditMode ? "" : "opacity-60 cursor-not-allowed"}`}
                    disabled={!isEditMode}
                  >
                    Occupied
                  </button>
                  <button
                    type="button"
                    onClick={() => isEditMode && setForm({ ...form, tenantStatus: "vacant" })}
                    className={`px-3 py-1.5 rounded-full text-xs font-semibold border ${
                      form.tenantStatus === "vacant"
                        ? "bg-red-100 text-red-700 border-red-200 dark:bg-red-500/10 dark:text-red-300 dark:border-red-400/30"
                        : "bg-white text-gray-600 border-gray-200 dark:bg-white/5 dark:text-gray-300 dark:border-white/10"
                    } ${isEditMode ? "" : "opacity-60 cursor-not-allowed"}`}
                    disabled={!isEditMode}
                  >
                    Vacant
                  </button>
                  <button
                    type="button"
                    onClick={() => isEditMode && setForm({ ...form, tenantStatus: "reserved" })}
                    className={`px-3 py-1.5 rounded-full text-xs font-semibold border ${
                      form.tenantStatus === "reserved"
                        ? "bg-blue-100 text-blue-700 border-blue-200 dark:bg-blue-500/10 dark:text-blue-300 dark:border-blue-400/30"
                        : "bg-white text-gray-600 border-gray-200 dark:bg-white/5 dark:text-gray-300 dark:border-white/10"
                    } ${isEditMode ? "" : "opacity-60 cursor-not-allowed"}`}
                    disabled={!isEditMode}
                  >
                    Reserved
                  </button>
                </div>
              </div>
            </div>

            <div>
              <label className="text-xs font-medium text-gray-600 dark:text-gray-400">Unit Description</label>
              <textarea
                className="mt-1 w-full min-h-[90px] rounded-md border border-gray-200 dark:border-white/10 bg-transparent dark:text-white px-3 py-2 text-sm outline-none focus:border-[#9F7539]"
                placeholder="Describe this unit. This will show to users as the property description."
                value={form.description}
                onChange={(e) => setForm({ ...form, description: e.target.value })}
                disabled={!isEditMode}
              />
            </div>
          </div>
        </Section>

        <Section title="Pricing">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-medium text-gray-600 dark:text-gray-400">Annual Rent (₦)</label>
              <input
                type="number"
                className="mt-1 w-full rounded-md border border-gray-200 dark:border-white/10 bg-transparent dark:text-white px-3 py-2 text-sm outline-none focus:border-[#9F7539]"
                value={form.rent}
                onChange={(e) => setForm({ ...form, rent: e.target.value })}
                disabled={!isEditMode}
              />
              <p className="mt-1 text-[11px] text-gray-500 dark:text-gray-400">{formatAmountInWords(form.rent)}</p>
            </div>
            <div>
              <label className="text-xs font-medium text-gray-600 dark:text-gray-400">Caution Fee (₦)</label>
              <input
                type="number"
                className="mt-1 w-full rounded-md border border-gray-200 dark:border-white/10 bg-transparent dark:text-white px-3 py-2 text-sm outline-none focus:border-[#9F7539]"
                value={form.caution}
                onChange={(e) => setForm({ ...form, caution: e.target.value })}
                disabled={!isEditMode}
              />
              <p className="mt-1 text-[11px] text-gray-500 dark:text-gray-400">{formatAmountInWords(form.caution)}</p>
            </div>
          </div>

          <div className="mt-3 flex items-center gap-2">
            <input
              id="unit-bills-included"
              type="checkbox"
              checked={form.billsIncluded}
              onChange={(e) => setForm({ ...form, billsIncluded: e.target.checked })}
              disabled={!isEditMode}
            />
            <label htmlFor="unit-bills-included" className="text-sm text-gray-700 dark:text-gray-300">
              Bills included
            </label>
          </div>

          {form.billsIncluded && (
            <div className="mt-3">
              <label className="text-xs font-medium text-gray-600 dark:text-gray-400">Bills Note</label>
              <input
                className="mt-1 w-full rounded-md border border-gray-200 dark:border-white/10 bg-transparent dark:text-white px-3 py-2 text-sm outline-none focus:border-[#9F7539]"
                value={form.billsNote}
                onChange={(e) => setForm({ ...form, billsNote: e.target.value })}
                disabled={!isEditMode}
              />
            </div>
          )}
        </Section>

        <Section title="Unit Features">
          <div className="space-y-3">
            <div className="rounded-md border border-gray-200 dark:border-white/10 bg-gray-50 dark:bg-white/5 p-3">
              <div className="flex items-center justify-between">
                <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                  Furnishing
                </label>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    className="sr-only peer"
                    checked={form.furnishingEnabled}
                    onChange={(e) =>
                      setForm((prev) => ({
                        ...prev,
                        furnishingEnabled: e.target.checked,
                        furnishingOptions: e.target.checked ? prev.furnishingOptions : [],
                      }))
                    }
                    disabled={!isEditMode}
                  />
                  <div className="w-10 h-6 bg-gray-300 dark:bg-white/20 rounded-full peer peer-checked:bg-[#9F7539] transition-colors" />
                  <div className="absolute left-1 top-1 w-4 h-4 bg-white rounded-full peer-checked:translate-x-4 transition-transform" />
                </label>
              </div>

              {form.furnishingEnabled && (
                <div className="mt-3 flex items-center gap-4">
                  <label className="flex items-center gap-2 text-sm text-gray-700 dark:text-gray-300 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={form.furnishingOptions.includes("Full")}
                      onChange={() => toggleFurnishingOption("Full")}
                      disabled={!isEditMode}
                    />
                    Full
                  </label>
                  <label className="flex items-center gap-2 text-sm text-gray-700 dark:text-gray-300 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={form.furnishingOptions.includes("Semi")}
                      onChange={() => toggleFurnishingOption("Semi")}
                      disabled={!isEditMode}
                    />
                    Semi
                  </label>
                </div>
              )}
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
              {AMENITIES.map((amenity) => (
                <label key={amenity} className="text-sm text-gray-700 dark:text-gray-300 flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={form.amenities.includes(amenity)}
                    onChange={() => toggleAmenity(amenity)}
                    disabled={!isEditMode}
                  />
                  {amenity}
                </label>
              ))}
            </div>
          </div>
        </Section>

        <Section title="Unit Media">
          <div className="space-y-4">
            <div className="rounded-md border border-gray-200 dark:border-white/10 bg-gray-50 dark:bg-white/5 p-3">
              <div className="flex items-center justify-between mb-2">
                <div className="text-sm font-medium text-gray-700 dark:text-gray-300">Unit Cover Slides</div>
                <div className="text-xs text-gray-500 dark:text-gray-400">Slide {activeSlide + 1} of 3</div>
              </div>

              <div className="relative h-48 rounded-md overflow-hidden border border-gray-200 dark:border-white/10 bg-white dark:bg-[#111827]">
                {form.coverImages[activeSlide] ? (
                  <img
                    src={form.coverImages[activeSlide]}
                    alt={`Unit slide ${activeSlide + 1}`}
                    className="h-full w-full object-cover"
                  />
                ) : (
                  <div className="h-full w-full flex items-center justify-center text-sm text-gray-500 dark:text-gray-400">
                    No preview for slide {activeSlide + 1}
                  </div>
                )}

                <button
                  type="button"
                  onClick={() => isEditMode && moveSlide(-1)}
                  className="absolute left-2 top-1/2 -translate-y-1/2 h-8 w-8 rounded-full bg-black/40 text-white flex items-center justify-center hover:bg-black/55"
                  aria-label="Previous slide"
                  disabled={!isEditMode}
                >
                  <ChevronLeft size={16} />
                </button>
                <button
                  type="button"
                  onClick={() => isEditMode && moveSlide(1)}
                  className="absolute right-2 top-1/2 -translate-y-1/2 h-8 w-8 rounded-full bg-black/40 text-white flex items-center justify-center hover:bg-black/55"
                  aria-label="Next slide"
                  disabled={!isEditMode}
                >
                  <ChevronRight size={16} />
                </button>
              </div>

              <div className="mt-3 grid grid-cols-1 md:grid-cols-3 gap-3">
                {[0, 1, 2].map((index) => (
                  <div
                    key={index}
                    className="rounded-md border border-gray-200 dark:border-white/10 bg-white dark:bg-[#111827] p-2.5"
                  >
                    <p className="text-xs font-medium text-gray-600 dark:text-gray-400 mb-2">Upload Slide {index + 1}</p>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={(e) => handleSlideUpload(index, e.target.files?.[0] || null)}
                      className="w-full text-xs text-gray-600 dark:text-gray-300"
                      disabled={!isEditMode}
                    />
                  </div>
                ))}
              </div>

              <div className="mt-3 flex items-center gap-3">
                <button
                  type="button"
                  onClick={() => isEditMode && handleSaveSlides()}
                  className="rounded-md border border-[#9F7539] text-[#9F7539] px-3 py-1.5 text-sm font-medium hover:bg-[#9F7539]/10 transition-colors"
                  disabled={!isEditMode}
                >
                  Save Slide Images
                </button>
                {slidesSaved && <span className="text-xs text-green-600 dark:text-green-400">Slides saved.</span>}
              </div>
            </div>

            <div className="rounded-md border border-gray-200 dark:border-white/10 bg-gray-50 dark:bg-white/5 p-3">
              <div className="flex items-center gap-2 text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                <Video size={15} />
                Unit Walkthrough Video Link
              </div>
              <input
                type="url"
                className="w-full rounded-md border border-gray-200 dark:border-white/10 bg-transparent dark:text-white px-3 py-2 text-sm outline-none focus:border-[#9F7539]"
                placeholder="https://..."
                value={form.videoWalkthrough}
                onChange={(e) => {
                  setForm({ ...form, videoWalkthrough: e.target.value });
                  setSlidesSaved(false);
                }}
                disabled={!isEditMode}
              />
              <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                Paste the unit walkthrough URL (YouTube, Vimeo, Drive, etc).
              </p>
            </div>
          </div>
        </Section>

      </div>

      <div className="bg-white dark:bg-[#111827] rounded-2xl border border-gray-200 dark:border-white/5 p-5">
        <h3 className="text-sm font-semibold text-[#0e1f42] dark:text-white mb-2">Tenant Information</h3>
        {tenant ? (
          <div className="text-sm text-gray-700 dark:text-gray-300">
            {tenant.name} ({tenant.status})
          </div>
        ) : (
          <div className="text-sm text-gray-500 dark:text-gray-400">No tenant assigned</div>
        )}
      </div>

      <div className="flex gap-3">
        <button
          onClick={() => isEditMode && handleSave()}
          className={`px-4 py-2 rounded-md text-sm font-semibold transition-colors ${
            isEditMode
              ? "bg-[#9F7539] text-white cursor-pointer hover:bg-[#866230]"
              : "bg-gray-300 dark:bg-white/10 text-gray-500 dark:text-gray-400 cursor-not-allowed"
          }`}
          disabled={!isEditMode}
        >
          Save Unit
        </button>
        <button
          onClick={() => navigate(`/admin/properties/${property.id}/units`)}
          className="border border-gray-200 dark:border-white/10 px-4 py-2 rounded-md text-sm font-semibold text-gray-700 dark:text-gray-300 cursor-pointer hover:bg-gray-50 dark:hover:bg-white/5 transition-colors"
        >
          Cancel
        </button>
      </div>

      {isPayoutDrawerOpen && (
        <div className="fixed inset-0 z-[120]">
          <div
            className="absolute inset-0 bg-black/40"
            onClick={() => setIsPayoutDrawerOpen(false)}
          />
          <aside className="absolute top-0 right-0 h-full w-full max-w-md bg-white dark:bg-[#0b1220] border-l border-gray-200 dark:border-white/10 shadow-2xl overflow-y-auto">
            <div className="flex items-center justify-between px-6 py-4 min-h-[76px] border-b border-gray-200 dark:border-white/10">
              <div>
                <h3 className="text-base font-bold text-[#0e1f42] dark:text-white">Unit Payout Breakdown</h3>
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  {form.unitNumber || unit.unitNumber || "Unit"} - {property.title}
                </p>
              </div>
              <button
                type="button"
                onClick={() => setIsPayoutDrawerOpen(false)}
                className="h-8 w-8 rounded-md border border-gray-200 dark:border-white/10 flex items-center justify-center text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-white/10"
              >
                <X size={16} />
              </button>
            </div>

            <div className="p-5 space-y-4">
              {!hasPayoutConfig && (
                <div className="rounded-md border border-amber-300/60 dark:border-amber-400/30 bg-amber-50 dark:bg-amber-500/10 px-3 py-2 text-sm text-amber-700 dark:text-amber-300">
                  No active management fee configured for this property/client yet.
                </div>
              )}

              <div className="grid grid-cols-2 gap-3">
                <div className="rounded-lg border border-gray-200 dark:border-white/10 p-3">
                  <div className="text-xs text-gray-500 dark:text-gray-400">Annual Rent</div>
                  <div className="text-lg font-bold text-[#0e1f42] dark:text-white">₦{annualRent.toLocaleString()}</div>
                </div>
                <div className="rounded-lg border border-gray-200 dark:border-white/10 p-3">
                  <div className="text-xs text-gray-500 dark:text-gray-400">Management Fee %</div>
                  <div className="text-lg font-bold text-[#0e1f42] dark:text-white">{managementFeePercent || 0}%</div>
                </div>
              </div>

              <div className="rounded-lg border border-green-200 dark:border-green-400/20 bg-green-50/60 dark:bg-green-500/10 p-3">
                <div className="text-xs text-green-700 dark:text-green-300">DomiHive Share (Annual)</div>
                <div className="text-xl font-bold text-green-700 dark:text-green-300">₦{Math.round(domihiveAnnual).toLocaleString()}</div>
                <div className="text-xs text-green-600 dark:text-green-400 mt-1">
                  Monthly avg: ₦{Math.round(domihiveMonthly).toLocaleString()}
                </div>
              </div>

              <div className="rounded-lg border border-blue-200 dark:border-blue-400/20 bg-blue-50/60 dark:bg-blue-500/10 p-3">
                <div className="text-xs text-blue-700 dark:text-blue-300">Client Payout (Annual)</div>
                <div className="text-xl font-bold text-blue-700 dark:text-blue-300">₦{Math.round(clientAnnual).toLocaleString()}</div>
                <div className="text-xs text-blue-600 dark:text-blue-400 mt-1">
                  Monthly avg: ₦{Math.round(clientMonthly).toLocaleString()}
                </div>
              </div>

              <div className="rounded-lg border border-gray-200 dark:border-white/10 p-3 space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-500 dark:text-gray-400">Client</span>
                  <span className="font-semibold text-[#0e1f42] dark:text-white">{linkedClient?.name || "Not linked"}</span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-500 dark:text-gray-400">Payout Account</span>
                  <span className="font-semibold text-[#0e1f42] dark:text-white">
                    {linkedClient?.bankName && linkedClient?.accountNumber
                      ? `${linkedClient.bankName} • ${linkedClient.accountNumber}`
                      : "Not configured"}
                  </span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-500 dark:text-gray-400">Source</span>
                  <span className="font-semibold text-[#0e1f42] dark:text-white">
                    {property.contractId || "Client fee profile"}
                  </span>
                </div>
              </div>
            </div>
          </aside>
        </div>
      )}
    </div>
  );
}
