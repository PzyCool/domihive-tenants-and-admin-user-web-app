import React, { useMemo, useState } from "react";
import { AlertTriangle, ChevronLeft, ChevronRight, Eye, Image as ImageIcon } from "lucide-react";
import { useNavigate } from "react-router-dom";

const UnitCard = ({ unit, onPublishAction, unpublishTapCount = 0 }) => {
  const navigate = useNavigate();
  const [slideIndex, setSlideIndex] = useState(0);

  const formatAmountInWords = (value) => {
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

  const displayPropertyTitle =
    String(unit.propertyTitle || "")
      .replace(/^\s*\d+\s*bed(?:room)?\s*/i, "")
      .trim() ||
    unit.propertyTitle ||
    "Property";

  const statusStyles = {
    occupied: "bg-green-100 text-green-700 dark:bg-green-500/10 dark:text-green-400",
    available: "bg-green-100 text-green-700 dark:bg-green-500/10 dark:text-green-400",
    reserved: "bg-blue-100 text-blue-700 dark:bg-blue-500/10 dark:text-blue-400",
    maintenance: "bg-amber-100 text-amber-700 dark:bg-amber-500/10 dark:text-amber-400",
    vacant: "bg-red-100 text-red-700 dark:bg-red-500/10 dark:text-red-400",
    published: "bg-green-100 text-green-700 dark:bg-green-500/10 dark:text-green-400",
    unpublished: "bg-red-100 text-red-700 dark:bg-red-500/10 dark:text-red-400",
  };
  const statusPalette = {
    occupied: { bg: "#dcfce7", color: "#15803d" },
    available: { bg: "#dcfce7", color: "#15803d" },
    reserved: { bg: "#dbeafe", color: "#1d4ed8" },
    maintenance: { bg: "#fef3c7", color: "#b45309" },
    vacant: { bg: "#fee2e2", color: "#b91c1c" },
    published: { bg: "#dcfce7", color: "#15803d" },
    unpublished: { bg: "#fee2e2", color: "#b91c1c" },
    default: { bg: "#e5e7eb", color: "#374151" },
  };

  const unitCode = unit.unitNumber || unit.number || "—";
  const isConfigured = Boolean(unit.isConfigured);
  const slides = useMemo(
    () => (Array.isArray(unit.images) ? unit.images.filter(Boolean) : []),
    [unit.images]
  );
  const hasSlides = slides.length > 0;
  const currentSlide = hasSlides
    ? slides[((slideIndex % slides.length) + slides.length) % slides.length]
    : null;

  return (
    <div
      key={unit.id}
      onClick={() => navigate(`/admin/units/${unit.id}`)}
      className="bg-white dark:bg-[#111827] rounded-2xl border border-gray-200 dark:border-white/5 shadow-sm overflow-hidden transition-colors cursor-pointer"
    >
      <div className="relative h-40 w-full overflow-hidden">
        {hasSlides ? (
          <img src={currentSlide} alt={unit.propertyTitle} className="w-full h-full object-cover" />
        ) : (
          <div className="w-full h-full bg-linear-to-br from-[#0f172a] to-[#1e293b] flex items-center justify-center">
            <div className="flex flex-col items-center gap-1.5 text-white/75">
              <ImageIcon size={18} />
              <span className="text-[11px] font-medium">No Unit Slide</span>
            </div>
          </div>
        )}

        <span
          className={`absolute z-20 top-3 right-3 text-[10px] px-2 py-1 rounded-full font-semibold ${
            statusStyles[unit.status] || "bg-gray-100 text-gray-700"
          }`}
          style={{
            backgroundColor: (statusPalette[unit.status] || statusPalette.default).bg,
            color: (statusPalette[unit.status] || statusPalette.default).color,
          }}
        >
          {unit.status}
        </span>

        <div className="absolute inset-0 bg-linear-to-t from-black/40 to-transparent" />

        <div className="absolute z-20 bottom-3 left-3">
          <span className="text-xs font-semibold text-white bg-black/40 px-2 py-1 rounded-md">{unitCode}</span>
        </div>

        {slides.length > 1 && (
          <>
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                setSlideIndex((prev) => (prev - 1 + slides.length) % slides.length);
              }}
              className="absolute z-20 left-3 top-1/2 -translate-y-1/2 h-7 w-7 rounded-full bg-black/45 hover:bg-black/60 text-white flex items-center justify-center"
              aria-label="Previous slide"
            >
              <ChevronLeft size={14} />
            </button>
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                setSlideIndex((prev) => (prev + 1) % slides.length);
              }}
              className="absolute z-20 right-3 top-1/2 -translate-y-1/2 h-7 w-7 rounded-full bg-black/45 hover:bg-black/60 text-white flex items-center justify-center"
              aria-label="Next slide"
            >
              <ChevronRight size={14} />
            </button>
          </>
        )}
      </div>

      <div className="p-4 space-y-3">
        <div>
          <h3 className="font-semibold text-[#0e1f42] dark:text-white text-sm">{displayPropertyTitle}</h3>
          <p className="text-[11px] text-[#9F7539] font-semibold mt-0.5">Unit Code: {unitCode}</p>
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">{unit.propertyLocation}</p>
        </div>

        {!isConfigured && (
          <div className="rounded-lg border border-amber-300/60 dark:border-amber-400/30 bg-amber-50 dark:bg-amber-500/10 px-3 py-2 flex items-start gap-2">
            <AlertTriangle size={14} className="text-amber-600 dark:text-amber-400 mt-0.5 shrink-0" />
            <p className="text-[11px] text-amber-700 dark:text-amber-300 font-medium">
              Please complete unit details
            </p>
          </div>
        )}

        <div className="flex items-center justify-between rounded-xl border border-gray-100 dark:border-white/5 bg-gray-50 dark:bg-white/5 px-3 py-2">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-full bg-[#9F7539] text-white flex items-center justify-center text-xs font-semibold">
              {(unit.tenantName || "X")
                .split(" ")
                .slice(0, 2)
                .map((w) => w[0])
                .join("")}
            </div>
            <div>
              <p className="text-xs font-semibold text-[#0e1f42] dark:text-white">
                {unit.tenantName || "Vacant"}
              </p>
              <p className="text-[11px] text-gray-500 dark:text-gray-400">
                {unit.tenantName ? "Current Tenant" : "No tenant assigned"}
              </p>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-[7fr_3fr] gap-3 pt-1">
          <div className="rounded-xl border border-gray-100 dark:border-white/5 p-3 text-center">
            <p className="text-sm font-semibold text-[#0e1f42] dark:text-white">
              ₦{Number(unit.rent || 0).toLocaleString()}
            </p>
            <p className="text-[10px] text-gray-500 dark:text-gray-400 mt-0.5">
              {formatAmountInWords(unit.rent)}
            </p>
            <p className="text-[11px] text-gray-500 dark:text-gray-400 mt-1">Rent</p>
          </div>

          <div className="rounded-xl border border-gray-100 dark:border-white/5 p-3 text-center">
            <p className="text-sm font-semibold text-[#0e1f42] dark:text-white">{unit.bedrooms ?? "—"}</p>
            <p className="text-[11px] text-gray-500 dark:text-gray-400 mt-1">Beds</p>
          </div>
        </div>

        <div className="w-full grid grid-cols-1 text-center">
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              navigate(`/admin/units/${unit.id}`);
            }}
            className="bg-[#9F7539] mt-2 w-full text-white text-xs flex items-center justify-center gap-2 font-semibold py-2 rounded-lg"
          >
            <Eye size={16} /> View Unit
          </button>

          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              onPublishAction?.();
            }}
            className={`mt-2 w-full text-xs flex items-center justify-center gap-2 font-semibold py-2 rounded-lg border transition-colors ${
              String(unit.publishedStatus || "unpublished").toLowerCase() === "published"
                ? "border-green-500/50 text-green-700 dark:text-green-300 bg-green-50 dark:bg-green-500/10"
                : "border-red-500/40 text-red-700 dark:text-red-300 bg-red-50 dark:bg-red-500/10"
            }`}
          >
            {String(unit.publishedStatus || "unpublished").toLowerCase() === "published"
              ? `Click 3 times to unpublish (${unpublishTapCount}/3)`
              : "Click to publish to marketplace"}
          </button>

          <p
            className={`mt-1 text-[11px] font-medium ${
              String(unit.publishedStatus || "unpublished").toLowerCase() === "published"
                ? "text-green-700 dark:text-green-300"
                : "text-red-700 dark:text-red-300"
            }`}
          >
            {String(unit.publishedStatus || "unpublished").toLowerCase() === "published"
              ? "Unit is currently published"
              : "Unit is currently unpublished"}
          </p>
        </div>
      </div>
    </div>
  );
};

export default UnitCard;
