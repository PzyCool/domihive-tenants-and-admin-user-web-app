import { useEffect, useMemo, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { ChevronRight, ChevronDown, Building2, House, Landmark, Rows3 } from "lucide-react";
import { useAdmin } from "../../../context/AdminContext";

const initialForm = {
  title: "",
  description: "",
  state: "Lagos",
  area: "",
  location: "",
  address: "",
  estateType: "Estate",
  type: "Block of Flats",
  clientId: "",
  contractId: "",
  status: "Draft",
  propertyAge: "",
  totalUnits: 1,
  petsAllowed: false,
  amenities: [],
  coverImages: ["", "", ""],
};

const PROPERTY_TYPE_OPTIONS = [
  {
    value: "Block of Flats",
    label: "Block of Flats",
    description: "One building with multiple households",
    icon: Building2,
  },
  {
    value: "Duplex",
    label: "Duplex",
    description: "Two-floor or multi-floor residential building",
    icon: Rows3,
  },
  {
    value: "Terraced House (Terrace Building)",
    label: "Terraced House (Terrace Building)",
    description: "Multiple houses in a row sharing walls, common in estates",
    icon: Landmark,
  },
  {
    value: "Bungalow",
    label: "Bungalow",
    description: "Single-floor residential building",
    icon: House,
  },
];

const PROPERTY_AGE_OPTIONS = [
  { value: "new", label: "New" },
  { value: "modern", label: "Modern" },
  { value: "established", label: "Old" },
];

const Section = ({ title, children }) => (
  <section className="rounded-md border border-gray-200 dark:border-white/5 bg-white dark:bg-[#111827] transition-colors">
    <div className="border-b border-gray-100 dark:border-white/5 px-4 py-3">
      <h3 className="text-sm font-semibold text-[#0e1f42] dark:text-white">{title}</h3>
    </div>
    <div className="p-4">{children}</div>
  </section>
);

const getNextPropertyCode = (properties = []) => {
  const used = new Set(
    properties
      .map((property) => String(property.propertyCode || "").trim().toUpperCase())
      .filter(Boolean)
  );

  let n = 0;
  while (true) {
    const block = Math.floor(n / 10);
    const digit = n % 10;
    const letterIndex = block % 26;
    const decade = Math.floor(block / 26) * 10;
    const letter = String.fromCharCode(65 + letterIndex);
    const code = `${letter}${decade + digit}`;
    if (!used.has(code)) return code;
    n += 1;
  }
};

const buildAutoUnits = (propertyCode, totalUnits) => {
  const count = Math.max(0, Number(totalUnits) || 0);
  return Array.from({ length: count }).map((_, index) => {
    const serial = String(index).padStart(3, "0");
    return {
      id: `unit-${Date.now()}-${index}`,
      unitNumber: `${propertyCode}-${serial}`,
      number: `${propertyCode}-${serial}`,
      type: "",
      bedrooms: 0,
      bathrooms: 0,
      size: "",
      rent: 0,
      caution: 0,
      billsIncluded: false,
      billsNote: "",
      status: "available",
      tenantId: null,
      tenant: null,
      amenities: [],
      images: [],
      video: null,
      leaseStart: null,
      leaseEnd: null,
      notes: "",
      isConfigured: false,
    };
  });
};

const appendAutoUnits = (propertyCode, existingUnits, additionalCount) => {
  const count = Math.max(0, Number(additionalCount) || 0);
  if (!count) return [];

  const usedNumbers = (existingUnits || [])
    .map((unit) => String(unit.unitNumber || unit.number || ""))
    .filter((code) => code.startsWith(`${propertyCode}-`))
    .map((code) => Number(code.split("-")[1]))
    .filter((value) => Number.isFinite(value));

  let next = usedNumbers.length ? Math.max(...usedNumbers) + 1 : 0;
  const generated = [];
  for (let index = 0; index < count; index += 1) {
    const serial = String(next).padStart(3, "0");
    generated.push({
      id: `unit-${Date.now()}-${index}`,
      unitNumber: `${propertyCode}-${serial}`,
      number: `${propertyCode}-${serial}`,
      type: "",
      bedrooms: 0,
      bathrooms: 0,
      size: "",
      rent: 0,
      caution: 0,
      billsIncluded: false,
      billsNote: "",
      status: "available",
      tenantId: null,
      tenant: null,
      amenities: [],
      images: [],
      video: null,
      leaseStart: null,
      leaseEnd: null,
      notes: "",
      isConfigured: false,
    });
    next += 1;
  }
  return generated;
};

export default function AdminAddNewProperty() {
  const navigate = useNavigate();
  const locationState = useLocation();
  const { properties, setProperties, locations, clients, setClients } = useAdmin();
  const [form, setForm] = useState(initialForm);
  const [isPropertyTypeOpen, setIsPropertyTypeOpen] = useState(false);
  const [slidesSaved, setSlidesSaved] = useState(false);
  const [saveError, setSaveError] = useState("");
  const editPropertyId = locationState.state?.editPropertyId || null;
  const editingProperty = useMemo(
    () => properties.find((property) => property.id === editPropertyId) || null,
    [properties, editPropertyId]
  );

  const areas = useMemo(
    () => locations?.areas?.[form.state] || [],
    [locations?.areas, form.state]
  );
  const locs = useMemo(
    () => locations?.locations?.[form.area] || [],
    [locations?.locations, form.area]
  );
  const amenities = useMemo(() => {
    const base = locations?.amenities || ["WiFi", "Parking", "Security", "Generator"];
    const filtered = base.filter((item) => {
      const normalized = String(item).trim().toLowerCase();
      return normalized !== "water" && normalized !== "ac";
    });
    if (!filtered.some((item) => String(item).toLowerCase() === "swimming pool")) {
      filtered.push("Swimming Pool");
    }
    return filtered;
  }, [locations?.amenities]);
  const selectedPropertyType =
    PROPERTY_TYPE_OPTIONS.find((option) => option.value === form.type) || PROPERTY_TYPE_OPTIONS[0];

  useEffect(() => {
    if (!editingProperty) return;
    setForm({
      title: editingProperty.title || "",
      description: editingProperty.description || "",
      state: editingProperty.state || "Lagos",
      area: editingProperty.area || "",
      location: editingProperty.location || "",
      address: editingProperty.address || "",
      estateType: editingProperty.estateType || editingProperty.tag || "Estate",
      type: editingProperty.type || "Block of Flats",
      clientId: editingProperty.clientId || "",
      contractId: editingProperty.contractId || "",
      status: editingProperty.status || "Draft",
      propertyAge: editingProperty.propertyAge || "",
      totalUnits: (editingProperty.units || []).length || 1,
      petsAllowed: Boolean(editingProperty.petsAllowed),
      amenities: Array.isArray(editingProperty.amenities) ? editingProperty.amenities : [],
      coverImages: Array.isArray(editingProperty.images) && editingProperty.images.length
        ? [...editingProperty.images.slice(0, 3), "", "", ""].slice(0, 3)
        : [editingProperty.image || "", "", ""],
    });
  }, [editingProperty]);

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

  const handleSlideUpload = (index, file) => {
    if (!file) return;
    const preview = URL.createObjectURL(file);
    setForm((prev) => {
      const nextSlides = [...prev.coverImages];
      nextSlides[index] = preview;
      return { ...prev, coverImages: nextSlides };
    });
    setSlidesSaved(false);
  };

  const handleSaveSlides = () => {
    setSlidesSaved(true);
  };

  const handleCreateProperty = () => {
    setSaveError("");
    if (!form.title.trim()) {
      setSaveError("Property name is required.");
      return;
    }

    if (editingProperty) {
      const effectiveClientId = form.clientId || editingProperty.clientId || "";
      if (!effectiveClientId) {
        setSaveError("Property owner is required.");
        return;
      }

      setProperties((prev) =>
        prev.map((property) =>
          property.id === editingProperty.id
            ? {
                ...property,
                propertyCode: property.propertyCode || getNextPropertyCode(prev),
                title: form.title.trim(),
                description: form.description.trim(),
                state: form.state,
                area: form.area,
                location: form.location,
                address: form.address,
                estateType: form.estateType,
                tag: form.estateType,
                type: form.type,
                propertyAge: form.propertyAge,
                status: form.status,
                clientId: effectiveClientId,
                contractId: form.contractId || null,
                amenities: form.amenities,
                petsAllowed: form.petsAllowed,
                images: form.coverImages.filter(Boolean),
                image:
                  form.coverImages.find(Boolean) ||
                  property.image ||
                  "https://images.unsplash.com/photo-1564013799919-ab600027ffc6?w=1400&h=800&fit=crop",
                units:
                  Number(form.totalUnits) > (property.units || []).length
                    ? [
                        ...(property.units || []),
                        ...appendAutoUnits(
                          property.propertyCode || getNextPropertyCode(prev),
                          property.units || [],
                          Number(form.totalUnits) - (property.units || []).length
                        ),
                      ]
                    : property.units || [],
              }
            : property
        )
      );
      navigate(`/admin/properties/${editingProperty.id}`);
      return;
    }

    if (!form.clientId) {
      setSaveError("Property owner is required.");
      return;
    }

    const propertyCode = getNextPropertyCode(properties);
    const generatedUnits = buildAutoUnits(propertyCode, form.totalUnits);

    const newProperty = {
      id: `prop-${Date.now()}`,
      propertyCode,
      title: form.title.trim(),
      description: form.description.trim(),
      state: form.state,
      area: form.area,
      location: form.location,
      address: form.address,
      estateType: form.estateType,
      tag: form.estateType,
      type: form.type,
      propertyAge: form.propertyAge,
      status: form.status,
      clientId: form.clientId,
      contractId: form.contractId || null,
      amenities: form.amenities,
      petsAllowed: form.petsAllowed,
      images: form.coverImages.filter(Boolean),
      image:
        form.coverImages.find(Boolean) ||
        "https://images.unsplash.com/photo-1564013799919-ab600027ffc6?w=1400&h=800&fit=crop",
      units: generatedUnits,
      bedrooms: 0,
      bathrooms: 0,
      rent: 0,
    };

    setProperties([newProperty, ...properties]);
    setClients((prev) =>
      prev.map((client) =>
        client.id === form.clientId
          ? {
              ...client,
              pendingPropertyAssignment: false,
              pendingPropertyAssignmentNote: "",
            }
          : client
      )
    );
    navigate("/admin/properties");
  };

  return (
    <div className="space-y-4">
      <div>
        <div className="flex items-center gap-2 text-xs text-gray-500 dark:text-gray-400">
          <span className="hover:text-[#9F7539] cursor-pointer" onClick={() => navigate("/admin")}>
            Admin
          </span>
          <ChevronRight size={13} />
          <span className="hover:text-[#9F7539] cursor-pointer" onClick={() => navigate("/admin/properties")}>
            Properties
          </span>
          <ChevronRight size={13} />
          <span className="text-gray-700 dark:text-gray-300 font-medium">Add New Property</span>
        </div>

        <h1 className="text-2xl font-bold text-[#0e1f42] dark:text-white mt-2">Add New Property</h1>
        <p className="text-sm text-gray-600 dark:text-gray-400">
          {editingProperty
            ? "Update this building/estate container details."
            : "Create a building/estate container. Units can be added after property creation."}
        </p>
      </div>

      <div className="space-y-4">
        {saveError && (
          <div className="rounded-md border border-red-200 dark:border-red-400/30 bg-red-50 dark:bg-red-500/10 text-red-700 dark:text-red-300 px-3 py-2 text-sm">
            {saveError}
          </div>
        )}
        <Section title="Property Basics">
          <div className="space-y-3">
            <div>
              <label className="text-xs font-medium text-gray-600 dark:text-gray-400">Property Owner</label>
              <select
                className="mt-1 w-full rounded-md border border-gray-200 dark:border-white/10 bg-transparent dark:text-white px-3 py-2 text-sm outline-none focus:border-[#9F7539] cursor-pointer"
                value={form.clientId}
                onChange={(e) => setForm({ ...form, clientId: e.target.value })}
              >
                <option value="" className="dark:bg-[#111827]">Select Property Owner</option>
                {clients.map((client) => (
                  <option key={client.id} value={client.id} className="dark:bg-[#111827]">
                    {client.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="text-xs font-medium text-gray-600 dark:text-gray-400">Property Name / Building Title</label>
              <input
                className="mt-1 w-full rounded-md border border-gray-200 dark:border-white/10 bg-transparent dark:text-white px-3 py-2 text-sm outline-none focus:border-[#9F7539]"
                placeholder="e.g. Chukwudi Gardens"
                value={form.title}
                onChange={(e) => setForm({ ...form, title: e.target.value })}
              />
            </div>

            <div>
              <label className="text-xs font-medium text-gray-600 dark:text-gray-400">Description</label>
              <textarea
                className="mt-1 w-full min-h-[100px] rounded-md border border-gray-200 dark:border-white/10 bg-transparent dark:text-white px-3 py-2 text-sm outline-none focus:border-[#9F7539]"
                placeholder="Short property summary for admin records"
                value={form.description}
                onChange={(e) => setForm({ ...form, description: e.target.value })}
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              <div>
                <label className="text-xs font-medium text-gray-600 dark:text-gray-400">Property Type</label>
                <div className="relative mt-1">
                  <button
                    type="button"
                    onClick={() => setIsPropertyTypeOpen((prev) => !prev)}
                    className="w-full rounded-md border border-gray-200 dark:border-white/10 bg-white dark:bg-[#0f172a] px-3 py-2 text-left"
                  >
                    <div className="flex items-center justify-between gap-2">
                      <div className="flex items-start gap-2 min-w-0">
                        <selectedPropertyType.icon size={16} className="mt-0.5 text-[#9F7539]" />
                        <div className="min-w-0">
                          <div className="text-sm font-medium text-gray-800 dark:text-white truncate">
                            {selectedPropertyType.label}
                          </div>
                          <div className="text-xs text-gray-500 dark:text-gray-400 truncate">
                            {selectedPropertyType.description}
                          </div>
                        </div>
                      </div>
                      <ChevronDown size={16} className="text-gray-500 dark:text-gray-300 shrink-0" />
                    </div>
                  </button>

                  {isPropertyTypeOpen && (
                    <div className="absolute z-30 mt-1 w-full rounded-md border border-gray-200 dark:border-white/10 bg-white dark:bg-[#0f172a] shadow-lg max-h-72 overflow-auto">
                      {PROPERTY_TYPE_OPTIONS.map((option) => {
                        const Icon = option.icon;
                        const selected = form.type === option.value;
                        return (
                          <button
                            key={option.value}
                            type="button"
                            onClick={() => {
                              setForm({ ...form, type: option.value });
                              setIsPropertyTypeOpen(false);
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
              <div>
                <label className="text-xs font-medium text-gray-600 dark:text-gray-400">Estate Tag</label>
                <select
                  className="mt-1 w-full rounded-md border border-gray-200 dark:border-white/10 bg-transparent dark:text-white px-3 py-2 text-sm outline-none focus:border-[#9F7539] cursor-pointer"
                  value={form.estateType}
                  onChange={(e) => setForm({ ...form, estateType: e.target.value })}
                >
                  <option value="Estate" className="dark:bg-[#111827]">Estate</option>
                  <option value="Non-estate" className="dark:bg-[#111827]">Non-estate</option>
                </select>
              </div>
              <div>
                <label className="text-xs font-medium text-gray-600 dark:text-gray-400">Property Age</label>
                <select
                  className="mt-1 w-full rounded-md border border-gray-200 dark:border-white/10 bg-transparent dark:text-white px-3 py-2 text-sm outline-none focus:border-[#9F7539] cursor-pointer"
                  value={form.propertyAge}
                  onChange={(e) => setForm({ ...form, propertyAge: e.target.value })}
                >
                  {PROPERTY_AGE_OPTIONS.map((option) => (
                    <option key={option.value || "any"} value={option.value} className="dark:bg-[#111827]">
                      {option.label}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div>
              <label className="text-xs font-medium text-gray-600 dark:text-gray-400">Total Number of Units</label>
              <input
                type="number"
                min="1"
                className="mt-1 w-full rounded-md border border-gray-200 dark:border-white/10 bg-transparent dark:text-white px-3 py-2 text-sm outline-none focus:border-[#9F7539]"
                value={form.totalUnits}
                onChange={(e) => setForm({ ...form, totalUnits: Number(e.target.value) || 1 })}
              />
            </div>
          </div>
        </Section>

        <Section title="Location">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            <div>
              <label className="text-xs font-medium text-gray-600 dark:text-gray-400">State</label>
              <select
                className="mt-1 w-full rounded-md border border-gray-200 dark:border-white/10 bg-transparent dark:text-white px-3 py-2 text-sm outline-none focus:border-[#9F7539] cursor-pointer"
                value={form.state}
                onChange={(e) => setForm({ ...form, state: e.target.value, area: "", location: "" })}
              >
                {(locations?.states || ["Lagos"]).map((state) => (
                  <option key={state} className="dark:bg-[#111827]">
                    {state}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="text-xs font-medium text-gray-600 dark:text-gray-400">Area</label>
              <select
                className="mt-1 w-full rounded-md border border-gray-200 dark:border-white/10 bg-transparent dark:text-white px-3 py-2 text-sm outline-none focus:border-[#9F7539] cursor-pointer"
                value={form.area}
                onChange={(e) => setForm({ ...form, area: e.target.value, location: "" })}
              >
                <option value="" className="dark:bg-[#111827]">Select Area</option>
                {areas.map((area) => (
                  <option key={area} className="dark:bg-[#111827]">
                    {area}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="text-xs font-medium text-gray-600 dark:text-gray-400">Location</label>
              <select
                className="mt-1 w-full rounded-md border border-gray-200 dark:border-white/10 bg-transparent dark:text-white px-3 py-2 text-sm outline-none focus:border-[#9F7539] cursor-pointer"
                value={form.location}
                onChange={(e) => setForm({ ...form, location: e.target.value })}
              >
                <option value="" className="dark:bg-[#111827]">Select Location</option>
                {locs.map((location) => (
                  <option key={location} className="dark:bg-[#111827]">
                    {location}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="mt-3">
            <label className="text-xs font-medium text-gray-600 dark:text-gray-400">Full Address</label>
            <input
              className="mt-1 w-full rounded-md border border-gray-200 dark:border-white/10 bg-transparent dark:text-white px-3 py-2 text-sm outline-none focus:border-[#9F7539]"
              placeholder="e.g. 12 Allen Avenue, Ikeja GRA"
              value={form.address}
              onChange={(e) => setForm({ ...form, address: e.target.value })}
            />
          </div>
        </Section>

        <Section title="Property Features">
          <div className="grid grid-cols-2 md:grid-cols-3 gap-3 mb-3">
            {amenities.map((amenity) => (
              <label key={amenity} className="flex items-center gap-2 text-sm text-gray-700 dark:text-gray-300 cursor-pointer">
                <input
                  type="checkbox"
                  checked={form.amenities.includes(amenity)}
                  onChange={() => toggleAmenity(amenity)}
                />
                {amenity}
              </label>
            ))}

            <div className="text-sm text-gray-700 dark:text-gray-300">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={form.petsAllowed}
                  onChange={(e) => setForm((prev) => ({ ...prev, petsAllowed: e.target.checked }))}
                />
                Pet Policy
              </label>
              <p className="text-xs text-gray-500 dark:text-gray-400 ml-6 mt-1">
                {form.petsAllowed ? "Pets allowed" : "No pets allowed"}
              </p>
            </div>
          </div>

        </Section>

        <Section title="Property Cover Slides">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            {[0, 1, 2].map((index) => (
              <div
                key={index}
                className="rounded-md border border-gray-200 dark:border-white/10 p-3 bg-white dark:bg-[#0f172a]"
              >
                <p className="text-xs font-medium text-gray-600 dark:text-gray-400 mb-2">
                  Upload Slide {index + 1}
                </p>
                <div className="h-32 rounded-md overflow-hidden border border-gray-200 dark:border-white/10 bg-gray-50 dark:bg-[#111827] mb-2 flex items-center justify-center">
                  {form.coverImages[index] ? (
                    <img
                      src={form.coverImages[index]}
                      alt={`Slide ${index + 1} preview`}
                      className="h-full w-full object-cover"
                    />
                  ) : (
                    <span className="text-xs text-gray-500 dark:text-gray-400">No preview</span>
                  )}
                </div>
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => handleSlideUpload(index, e.target.files?.[0] || null)}
                  className="w-full text-xs text-gray-600 dark:text-gray-300"
                />
              </div>
            ))}
          </div>

          <div className="mt-3 flex items-center gap-3">
            <button
              type="button"
              onClick={handleSaveSlides}
              className="rounded-md border border-[#9F7539] text-[#9F7539] px-3 py-1.5 text-sm font-medium hover:bg-[#9F7539]/10 transition-colors"
            >
              Save Slides
            </button>
            {slidesSaved && (
              <span className="text-xs text-green-600 dark:text-green-400">
                Slides saved.
              </span>
            )}
          </div>
        </Section>
      </div>

      <div className="flex items-center justify-end gap-3 pt-2">
        <button
          onClick={() => navigate("/admin/properties")}
          className="rounded-md border border-gray-200 dark:border-white/10 bg-white dark:bg-white/5 px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-white/10 transition-colors cursor-pointer"
        >
          Cancel
        </button>
        <button
          onClick={handleCreateProperty}
          className="rounded-md bg-[#9F7539] px-4 py-2 text-sm font-semibold text-white hover:bg-[#b58a4a] transition-colors cursor-pointer"
        >
          {editingProperty ? "Save Property Changes" : "Create Property"}
        </button>
      </div>
    </div>
  );
}

