import { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { ChevronDown, ChevronRight, DoorOpen, Building2, Landmark, House, Image, Video } from "lucide-react";
import { useAdmin } from "../../../context/AdminContext";

const emptyForm = {
  unitNumber: "",
  type: "Apartment (Flat)",
  bedrooms: 1,
  bathrooms: 1,
  size: "",
  rent: "",
  caution: "",
  billsIncluded: false,
  billsNote: "",
  status: "available",
  amenities: [],
  images: [],
  video: null,
};

const AMENITIES = [
  "Parking",
  "Water Supply",
  "CCTV",
  "Security",
  "Generator",
  "Gym",
  "Fence",
  "Gate",
  "AC",
  "WiFi",
];

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

const getNextUnitCode = (property) => {
  const prefix = property.propertyCode || "A0";
  const unitCodes = (property.units || [])
    .map((unit) => String(unit.unitNumber || unit.number || ""))
    .filter((value) => value.startsWith(`${prefix}-`))
    .map((value) => Number(value.split("-")[1]))
    .filter((value) => Number.isFinite(value));
  const nextNumber = unitCodes.length ? Math.max(...unitCodes) + 1 : 0;
  return `${prefix}-${String(nextNumber).padStart(3, "0")}`;
};

const Section = ({ title, children }) => (
  <section className="rounded-md border border-gray-200 dark:border-white/5 bg-white dark:bg-[#111827] transition-colors">
    <div className="border-b border-gray-100 dark:border-white/5 px-4 py-3">
      <h3 className="text-sm font-semibold text-[#0e1f42] dark:text-white">{title}</h3>
    </div>
    <div className="p-4">{children}</div>
  </section>
);

export default function AdminAddNewUnit() {
  const navigate = useNavigate();
  const { propertyId } = useParams();
  const { properties, setProperties } = useAdmin();
  const [form, setForm] = useState(emptyForm);
  const [isUnitTypeOpen, setIsUnitTypeOpen] = useState(false);

  const property = useMemo(
    () => properties.find((item) => item.id === propertyId),
    [properties, propertyId]
  );

  const selectedUnitType =
    UNIT_TYPE_OPTIONS.find((option) => option.value === form.type) || UNIT_TYPE_OPTIONS[2];

  useEffect(() => {
    if (!property) return;
    setForm((prev) => {
      if (prev.unitNumber) return prev;
      return { ...prev, unitNumber: getNextUnitCode(property) };
    });
  }, [property]);

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

  const handleSave = () => {
    if (!property) return;
    if (!form.unitNumber.trim()) return;

    const nextUnit = {
      id: `unit-${Date.now()}`,
      unitNumber: form.unitNumber.trim(),
      number: form.unitNumber.trim(),
      type: form.type,
      bedrooms: Number(form.bedrooms) || 0,
      bathrooms: Number(form.bathrooms) || 0,
      size: form.size,
      rent: Number(form.rent) || 0,
      caution: Number(form.caution) || 0,
      billsIncluded: form.billsIncluded,
      billsNote: form.billsNote,
      status: form.status,
      tenantId: null,
      tenant: null,
      amenities: form.amenities,
      images: form.images,
      video: form.video,
      leaseStart: null,
      leaseEnd: null,
      notes: "",
      isConfigured: true,
    };

    setProperties((prev) =>
      prev.map((item) =>
        item.id === property.id
          ? { ...item, units: [nextUnit, ...(item.units || [])] }
          : item
      )
    );

    navigate(`/admin/properties/${property.id}/units`);
  };

  if (!property) {
    return <div className="text-sm text-gray-500 dark:text-gray-400">Property not found.</div>;
  }

  return (
    <div className="space-y-4">
      <div>
        <div className="flex items-center gap-2 text-xs text-gray-500 dark:text-gray-400">
          <span className="hover:text-[#9F7539] cursor-pointer" onClick={() => navigate("/admin/properties")}>
            Properties
          </span>
          <ChevronRight size={13} />
          <span
            className="hover:text-[#9F7539] cursor-pointer"
            onClick={() => navigate(`/admin/properties/${property.id}`)}
          >
            Property Details
          </span>
          <ChevronRight size={13} />
          <span
            className="hover:text-[#9F7539] cursor-pointer"
            onClick={() => navigate(`/admin/properties/${property.id}/units`)}
          >
            Units
          </span>
          <ChevronRight size={13} />
          <span className="text-gray-700 dark:text-gray-300 font-medium">Add New Unit</span>
        </div>

        <h1 className="text-2xl font-bold text-[#0e1f42] dark:text-white mt-2">Add New Unit</h1>
        <p className="text-sm text-gray-600 dark:text-gray-400">
          Create a rentable unit under <span className="font-semibold">{property.title}</span>.
        </p>
      </div>

      <div className="space-y-4">
        <Section title="Unit Information">
          <div className="space-y-3">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <div>
                <label className="text-xs font-medium text-gray-600 dark:text-gray-400">Unit Code / Number</label>
                <input
                  className="mt-1 w-full rounded-md border border-gray-200 dark:border-white/10 bg-transparent dark:text-white px-3 py-2 text-sm outline-none focus:border-[#9F7539]"
                  placeholder="Auto-generated unit code"
                  value={form.unitNumber}
                  onChange={(e) => setForm({ ...form, unitNumber: e.target.value })}
                />
              </div>
              <div>
                <label className="text-xs font-medium text-gray-600 dark:text-gray-400">Unit Type</label>
                <div className="relative mt-1">
                  <button
                    type="button"
                    onClick={() => setIsUnitTypeOpen((prev) => !prev)}
                    className="w-full rounded-md border border-gray-200 dark:border-white/10 bg-white dark:bg-[#0f172a] px-3 py-2 text-left"
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

                  {isUnitTypeOpen && (
                    <div className="absolute z-30 mt-1 w-full rounded-md border border-gray-200 dark:border-white/10 bg-white dark:bg-[#0f172a] shadow-lg max-h-72 overflow-auto">
                      {UNIT_TYPE_OPTIONS.map((option) => {
                        const Icon = option.icon;
                        const selected = form.type === option.value;
                        return (
                          <button
                            key={option.value}
                            type="button"
                            onClick={() => {
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

            <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
              <div>
                <label className="text-xs font-medium text-gray-600 dark:text-gray-400">Bedrooms</label>
                <input
                  type="number"
                  min="0"
                  className="mt-1 w-full rounded-md border border-gray-200 dark:border-white/10 bg-transparent dark:text-white px-3 py-2 text-sm outline-none focus:border-[#9F7539]"
                  value={form.bedrooms}
                  onChange={(e) => setForm({ ...form, bedrooms: Number(e.target.value) })}
                />
              </div>
              <div>
                <label className="text-xs font-medium text-gray-600 dark:text-gray-400">Bathrooms</label>
                <input
                  type="number"
                  min="0"
                  className="mt-1 w-full rounded-md border border-gray-200 dark:border-white/10 bg-transparent dark:text-white px-3 py-2 text-sm outline-none focus:border-[#9F7539]"
                  value={form.bathrooms}
                  onChange={(e) => setForm({ ...form, bathrooms: Number(e.target.value) })}
                />
              </div>
              <div>
                <label className="text-xs font-medium text-gray-600 dark:text-gray-400">Size</label>
                <input
                  className="mt-1 w-full rounded-md border border-gray-200 dark:border-white/10 bg-transparent dark:text-white px-3 py-2 text-sm outline-none focus:border-[#9F7539]"
                  placeholder="e.g. 145 sqm"
                  value={form.size}
                  onChange={(e) => setForm({ ...form, size: e.target.value })}
                />
              </div>
              <div>
                <label className="text-xs font-medium text-gray-600 dark:text-gray-400">Status</label>
                <select
                  className="mt-1 w-full rounded-md border border-gray-200 dark:border-white/10 bg-transparent dark:text-white px-3 py-2 text-sm outline-none focus:border-[#9F7539] cursor-pointer"
                  value={form.status}
                  onChange={(e) => setForm({ ...form, status: e.target.value })}
                >
                  <option value="available" className="dark:bg-[#111827]">Available</option>
                  <option value="reserved" className="dark:bg-[#111827]">Reserved</option>
                  <option value="occupied" className="dark:bg-[#111827]">Occupied</option>
                  <option value="maintenance" className="dark:bg-[#111827]">Maintenance</option>
                  <option value="vacant" className="dark:bg-[#111827]">Vacant</option>
                </select>
              </div>
            </div>
          </div>
        </Section>

        <Section title="Pricing">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            <div>
              <label className="text-xs font-medium text-gray-600 dark:text-gray-400">Annual Rent (N)</label>
              <input
                type="number"
                className="mt-1 w-full rounded-md border border-gray-200 dark:border-white/10 bg-transparent dark:text-white px-3 py-2 text-sm outline-none focus:border-[#9F7539]"
                placeholder="e.g. 2800000"
                value={form.rent}
                onChange={(e) => setForm({ ...form, rent: e.target.value })}
              />
            </div>
            <div>
              <label className="text-xs font-medium text-gray-600 dark:text-gray-400">Caution Fee (N)</label>
              <input
                type="number"
                className="mt-1 w-full rounded-md border border-gray-200 dark:border-white/10 bg-transparent dark:text-white px-3 py-2 text-sm outline-none focus:border-[#9F7539]"
                placeholder="e.g. 500000"
                value={form.caution}
                onChange={(e) => setForm({ ...form, caution: e.target.value })}
              />
            </div>
            <div className="flex items-end">
              <label className="flex items-center gap-2 text-sm text-gray-700 dark:text-gray-300 cursor-pointer">
                <input
                  type="checkbox"
                  checked={form.billsIncluded}
                  onChange={(e) => setForm({ ...form, billsIncluded: e.target.checked })}
                />
                Bills Included
              </label>
            </div>
          </div>

          {form.billsIncluded && (
            <div className="mt-3">
              <label className="text-xs font-medium text-gray-600 dark:text-gray-400">Bills Note</label>
              <input
                className="mt-1 w-full rounded-md border border-gray-200 dark:border-white/10 bg-transparent dark:text-white px-3 py-2 text-sm outline-none focus:border-[#9F7539]"
                placeholder="e.g. service charge included, utilities excluded"
                value={form.billsNote}
                onChange={(e) => setForm({ ...form, billsNote: e.target.value })}
              />
            </div>
          )}
        </Section>

        <Section title="Unit Features">
          <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
            {AMENITIES.map((amenity) => (
              <label key={amenity} className="flex items-center gap-2 text-sm text-gray-700 dark:text-gray-300 cursor-pointer">
                <input
                  type="checkbox"
                  checked={form.amenities.includes(amenity)}
                  onChange={() => toggleAmenity(amenity)}
                />
                {amenity}
              </label>
            ))}
          </div>
        </Section>

        <Section title="Unit Media (Optional)">
          <div className="space-y-4">
            <div className="rounded-md border border-dashed border-gray-300 dark:border-white/10 bg-gray-50 dark:bg-white/5 p-6 text-center">
              <div className="mx-auto flex w-10 h-10 items-center justify-center rounded-full bg-white dark:bg-gray-800 border border-gray-200 dark:border-white/10">
                <Image size={18} className="text-gray-500 dark:text-gray-400" />
              </div>
              <p className="mt-2 text-sm text-gray-600 dark:text-gray-300">Upload unit photos</p>
              <div className="mt-3 flex justify-center">
                <label className="inline-flex items-center justify-center rounded-md border border-[#9F7539] bg-white dark:bg-gray-800 px-3 py-2 text-xs font-semibold text-[#9F7539] hover:bg-gray-100 dark:hover:bg-gray-700 cursor-pointer">
                  Choose Images
                  <input
                    type="file"
                    multiple
                    className="hidden"
                    onChange={(e) => setForm({ ...form, images: Array.from(e.target.files || []) })}
                  />
                </label>
              </div>
            </div>

            <div className="rounded-md border border-dashed border-gray-300 dark:border-white/10 bg-gray-50 dark:bg-white/5 p-6 text-center">
              <div className="mx-auto flex w-10 h-10 items-center justify-center rounded-full bg-white dark:bg-gray-800 border border-gray-200 dark:border-white/10">
                <Video size={18} className="text-gray-500 dark:text-gray-400" />
              </div>
              <p className="mt-2 text-sm text-gray-600 dark:text-gray-300">Upload unit video</p>
              <div className="mt-3 flex justify-center">
                <label className="inline-flex items-center justify-center rounded-md border border-[#9F7539] bg-white dark:bg-gray-800 px-3 py-2 text-xs font-semibold text-[#9F7539] hover:bg-gray-100 dark:hover:bg-gray-700 cursor-pointer">
                  Choose Video
                  <input
                    type="file"
                    accept="video/*"
                    className="hidden"
                    onChange={(e) => setForm({ ...form, video: e.target.files?.[0] || null })}
                  />
                </label>
              </div>
            </div>
          </div>
        </Section>
      </div>

      <div className="flex items-center justify-end gap-3 pt-2">
        <button
          onClick={() => navigate(`/admin/properties/${property.id}/units`)}
          className="rounded-md border border-gray-200 dark:border-white/10 bg-white dark:bg-white/5 px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-white/10 transition-colors cursor-pointer"
        >
          Cancel
        </button>
        <button
          onClick={handleSave}
          className="rounded-md bg-[#9F7539] px-4 py-2 text-sm font-semibold text-white hover:bg-[#b58a4a] transition-colors cursor-pointer"
        >
          Create Unit
        </button>
      </div>
    </div>
  );
}

