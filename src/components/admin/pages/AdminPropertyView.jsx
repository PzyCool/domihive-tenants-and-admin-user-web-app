import React, { useMemo, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { ChevronLeft, ChevronRight, Eye, X } from "lucide-react";
import { useAdmin } from "../../../context/AdminContext";

export default function AdminPropertyView() {
  const { propertyId } = useParams();
  const navigate = useNavigate();
  const { properties, clients, tenants } = useAdmin();
  const [imageIndex, setImageIndex] = useState(0);
  const [isPayoutDrawerOpen, setIsPayoutDrawerOpen] = useState(false);

  const property = properties.find((item) => item.id === propertyId);

  const details = useMemo(() => {
    if (!property) return null;
    const owner = clients.find((client) => client.id === property.clientId);
    const units = property.units || [];
    const occupied = units.filter((unit) => String(unit.status || "").toLowerCase() === "occupied").length;
    const available = units.filter((unit) =>
      ["available", "vacant"].includes(String(unit.status || "").toLowerCase())
    ).length;
    const maintenance = units.filter((unit) => String(unit.status || "").toLowerCase() === "maintenance").length;
    const occupancyRate = units.length ? Math.round((occupied / units.length) * 100) : 0;

    const tenantsCount = tenants.filter((tenant) => tenant.propertyId === property.id).length;
    const managementFeePercent = Number(owner?.managementFeePercent || 0);
    const unitsWithCalc = units.map((unit) => {
      const rent = Number(unit.rent || property.rent || 0);
      const normalizedStatus = String(unit.tenantStatus || unit.status || "vacant").toLowerCase();
      const domihiveShare = (rent * managementFeePercent) / 100;
      const clientShare = Math.max(0, rent - domihiveShare);
      return {
        ...unit,
        normalizedStatus,
        rent,
        domihiveShare,
        clientShare,
      };
    });
    const occupiedUnits = unitsWithCalc.filter((unit) => unit.normalizedStatus === "occupied");
    const occupiedAnnualRent = occupiedUnits.reduce((sum, unit) => sum + unit.rent, 0);
    const allUnitsAnnualRent = unitsWithCalc.reduce((sum, unit) => sum + unit.rent, 0);
    const domihiveOccupied = occupiedUnits.reduce((sum, unit) => sum + unit.domihiveShare, 0);
    const domihiveAll = unitsWithCalc.reduce((sum, unit) => sum + unit.domihiveShare, 0);
    const clientOccupied = occupiedUnits.reduce((sum, unit) => sum + unit.clientShare, 0);
    const clientAll = unitsWithCalc.reduce((sum, unit) => sum + unit.clientShare, 0);

    return {
      owner,
      ownerName: owner?.name || "Unassigned client",
      contractLength: owner?.contractDuration || "Not linked",
      units,
      unitsWithCalc,
      occupied,
      available,
      maintenance,
      occupancyRate,
      tenantsCount,
      managementFeePercent,
      occupiedAnnualRent,
      allUnitsAnnualRent,
      domihiveOccupied,
      domihiveAll,
      clientOccupied,
      clientAll,
    };
  }, [property, clients, tenants]);

  const slides = useMemo(() => {
    if (!property) return [];
    const fromSlides = Array.isArray(property.images) ? property.images.filter(Boolean) : [];
    if (fromSlides.length > 0) return fromSlides;
    return property.image ? [property.image] : [];
  }, [property]);

  const currentSlide = slides.length
    ? slides[((imageIndex % slides.length) + slides.length) % slides.length]
    : "";

  if (!property || !details) {
    return <div className="text-sm text-gray-500 dark:text-gray-400">Property not found.</div>;
  }

  return (
    <div className="space-y-5">
      <div className="text-xs text-gray-500 dark:text-gray-400 flex items-center gap-2">
        <Link to="/admin/properties" className="hover:text-[#9F7539]">Properties</Link>
        <ChevronRight size={13} />
        <span className="text-gray-700 dark:text-gray-300 font-medium">Property Details</span>
      </div>

      <div className="bg-white dark:bg-[#111827] rounded-xl border border-gray-100 dark:border-white/10 overflow-hidden">
        <div className="relative h-72 w-full">
          <img src={currentSlide} alt={property.title} className="h-72 w-full object-cover" />
          {slides.length > 1 && (
            <>
              <button
                type="button"
                onClick={() => setImageIndex((prev) => (prev - 1 + slides.length) % slides.length)}
                className="absolute left-4 top-1/2 -translate-y-1/2 h-10 w-10 rounded-full bg-black/45 hover:bg-black/60 text-white flex items-center justify-center"
                aria-label="Previous image"
              >
                <ChevronLeft size={18} />
              </button>
              <button
                type="button"
                onClick={() => setImageIndex((prev) => (prev + 1) % slides.length)}
                className="absolute right-4 top-1/2 -translate-y-1/2 h-10 w-10 rounded-full bg-black/45 hover:bg-black/60 text-white flex items-center justify-center"
                aria-label="Next image"
              >
                <ChevronRight size={18} />
              </button>
            </>
          )}
        </div>
        <div className="p-5 space-y-5">
          <div className="flex items-start justify-between gap-3">
            <div>
              <h1 className="text-2xl font-bold text-[#0e1f42] dark:text-white">{property.title}</h1>
              <div className="text-xs font-semibold text-[#9F7539] mt-1">
                Property Code: {property.propertyCode || "No Code"}
              </div>
              <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                {property.address || property.location}, {property.area}, {property.state}
              </p>
              <p className="text-sm text-gray-600 dark:text-gray-300 mt-3">
                {property.description || "No building description yet."}
              </p>
            </div>
            <button
              onClick={() => setIsPayoutDrawerOpen(true)}
              className="border border-[#9F7539] text-[#9F7539] px-4 py-2 rounded-md text-sm font-semibold hover:bg-[#9F7539]/10 whitespace-nowrap"
            >
              Portfolio Payout
            </button>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
            <div className="rounded-lg border border-gray-100 dark:border-white/10 p-3">
              <div className="text-xs text-gray-500 dark:text-gray-400">Total Units</div>
              <div className="text-xl font-bold text-[#0e1f42] dark:text-white">{details.units.length}</div>
            </div>
            <div className="rounded-lg border border-gray-100 dark:border-white/10 p-3">
              <div className="text-xs text-gray-500 dark:text-gray-400">Occupied</div>
              <div className="text-xl font-bold text-green-600">{details.occupied}</div>
            </div>
            <div className="rounded-lg border border-gray-100 dark:border-white/10 p-3">
              <div className="text-xs text-gray-500 dark:text-gray-400">Available</div>
              <div className="text-xl font-bold text-sky-600">{details.available}</div>
            </div>
            <div className="rounded-lg border border-gray-100 dark:border-white/10 p-3">
              <div className="text-xs text-gray-500 dark:text-gray-400">Maintenance</div>
              <div className="text-xl font-bold text-amber-600">{details.maintenance}</div>
            </div>
            <div className="rounded-lg border border-gray-100 dark:border-white/10 p-3">
              <div className="text-xs text-gray-500 dark:text-gray-400">Occupancy Rate</div>
              <div className="text-xl font-bold text-[#0e1f42] dark:text-white">{details.occupancyRate}%</div>
            </div>
          </div>

          <div className="grid md:grid-cols-2 gap-3">
            <div className="rounded-lg border border-gray-100 dark:border-white/10 p-3">
              <div className="text-xs text-gray-500 dark:text-gray-400">Property Owner</div>
              <div className="font-semibold text-[#0e1f42] dark:text-white">{details.ownerName}</div>
            </div>
            <div className="rounded-lg border border-gray-100 dark:border-white/10 p-3">
              <div className="text-xs text-gray-500 dark:text-gray-400">Contract Length</div>
              <div className="font-semibold text-[#0e1f42] dark:text-white">{details.contractLength}</div>
            </div>
          </div>

          <div className="rounded-lg border border-gray-100 dark:border-white/10 p-3">
            <div className="text-xs text-gray-500 dark:text-gray-400 mb-2">
              Unit room numbers & prices ({details.units.length} units)
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
              {details.units.map((unit) => (
                <div key={unit.id} className="flex items-center justify-between rounded-md border border-gray-100 dark:border-white/10 px-3 py-2">
                  <div className="text-sm text-[#0e1f42] dark:text-white font-medium">
                    {unit.unitNumber || unit.number || unit.id}
                  </div>
                  <div className="text-sm text-gray-600 dark:text-gray-300">
                    ₦{Number(unit.rent || property.rent || 0).toLocaleString()}
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="flex items-center justify-between gap-2">
            <div className="flex items-center gap-2">
              <button
                onClick={() => navigate(`/admin/add-property`, { state: { editPropertyId: property.id } })}
                className="border border-gray-200 dark:border-white/10 px-4 py-2 rounded-md text-sm font-semibold text-gray-700 dark:text-gray-300"
              >
                Edit Property
              </button>
              <button
                onClick={() => navigate(`/admin/properties/${property.id}/units`)}
                className="bg-[#9F7539] text-white px-4 py-2 rounded-md text-sm font-semibold"
              >
                View Units
              </button>
            </div>
            <button
              onClick={() => navigate("/admin/properties")}
              className="border border-gray-200 dark:border-white/10 px-4 py-2 rounded-md text-sm font-semibold text-gray-700 dark:text-gray-300"
            >
              Back to Properties
            </button>
          </div>
        </div>
      </div>

      <div className="bg-white dark:bg-[#111827] rounded-xl border border-gray-100 dark:border-white/10 p-4">
        <div className="flex items-center justify-between">
          <div className="text-sm font-semibold text-[#0e1f42] dark:text-white">
            Current tenants in this property: {details.tenantsCount}
          </div>
          <button
            onClick={() => navigate(`/admin/properties/${property.id}/units`)}
            className="inline-flex items-center gap-2 text-[#9F7539] text-xs font-semibold"
          >
            <Eye size={14} />
            Open units board
          </button>
        </div>
      </div>

      {isPayoutDrawerOpen && (
        <div className="fixed inset-0 z-[120]">
          <div className="absolute inset-0 bg-black/40" onClick={() => setIsPayoutDrawerOpen(false)} />
          <aside className="absolute top-0 right-0 h-full w-full max-w-2xl bg-white dark:bg-[#0b1220] border-l border-gray-200 dark:border-white/10 shadow-2xl overflow-y-auto">
            <div className="flex items-center justify-between px-5 py-4 border-b border-gray-200 dark:border-white/10">
              <div>
                <h3 className="text-base font-bold text-[#0e1f42] dark:text-white">Portfolio Payout Breakdown</h3>
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  {property.title} • Fee {details.managementFeePercent || 0}%
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
              {details.managementFeePercent <= 0 && (
                <div className="rounded-md border border-amber-300/60 dark:border-amber-400/30 bg-amber-50 dark:bg-amber-500/10 px-3 py-2 text-sm text-amber-700 dark:text-amber-300">
                  No management fee percentage configured for this property owner yet.
                </div>
              )}

              <div className="grid md:grid-cols-2 gap-3">
                <div className="rounded-lg border border-gray-200 dark:border-white/10 p-3">
                  <div className="text-xs text-gray-500 dark:text-gray-400">Occupied Units Revenue</div>
                  <div className="text-lg font-bold text-[#0e1f42] dark:text-white">₦{Math.round(details.occupiedAnnualRent).toLocaleString()}</div>
                  <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">{details.occupied} occupied units</div>
                  <div className="mt-2 text-xs text-green-700 dark:text-green-300">
                    DomiHive: ₦{Math.round(details.domihiveOccupied).toLocaleString()}
                  </div>
                  <div className="text-xs text-blue-700 dark:text-blue-300">
                    Client: ₦{Math.round(details.clientOccupied).toLocaleString()}
                  </div>
                </div>

                <div className="rounded-lg border border-gray-200 dark:border-white/10 p-3">
                  <div className="text-xs text-gray-500 dark:text-gray-400">All Units Potential Revenue</div>
                  <div className="text-lg font-bold text-[#0e1f42] dark:text-white">₦{Math.round(details.allUnitsAnnualRent).toLocaleString()}</div>
                  <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">{details.units.length} total units</div>
                  <div className="mt-2 text-xs text-green-700 dark:text-green-300">
                    DomiHive: ₦{Math.round(details.domihiveAll).toLocaleString()}
                  </div>
                  <div className="text-xs text-blue-700 dark:text-blue-300">
                    Client: ₦{Math.round(details.clientAll).toLocaleString()}
                  </div>
                </div>
              </div>

              <div className="rounded-lg border border-gray-200 dark:border-white/10 p-3">
                <div className="text-sm font-semibold text-[#0e1f42] dark:text-white mb-2">Per-Unit Breakdown</div>
                <div className="space-y-2">
                  {details.unitsWithCalc.map((unit) => (
                    <div
                      key={unit.id}
                      className="grid grid-cols-[1.2fr_1fr_0.9fr_0.9fr_0.9fr] gap-2 items-center rounded-md border border-gray-100 dark:border-white/10 px-3 py-2 text-xs"
                    >
                      <div className="font-semibold text-[#0e1f42] dark:text-white">
                        {unit.unitNumber || unit.number || unit.id}
                      </div>
                      <div className="text-gray-500 dark:text-gray-400 capitalize">{unit.normalizedStatus}</div>
                      <div className="text-[#0e1f42] dark:text-white">₦{Math.round(unit.rent).toLocaleString()}</div>
                      <div className="text-green-700 dark:text-green-300">₦{Math.round(unit.domihiveShare).toLocaleString()}</div>
                      <div className="text-blue-700 dark:text-blue-300">₦{Math.round(unit.clientShare).toLocaleString()}</div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="rounded-lg border border-gray-200 dark:border-white/10 p-3 space-y-2">
                <div className="text-sm font-semibold text-[#0e1f42] dark:text-white">Contract & Payout Source</div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-500 dark:text-gray-400">Client</span>
                  <span className="font-medium text-[#0e1f42] dark:text-white">{details.ownerName}</span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-500 dark:text-gray-400">Payout Account</span>
                  <span className="font-medium text-[#0e1f42] dark:text-white">
                    {details.owner?.bankName && details.owner?.accountNumber
                      ? `${details.owner.bankName} • ${details.owner.accountNumber}`
                      : "Not configured"}
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

