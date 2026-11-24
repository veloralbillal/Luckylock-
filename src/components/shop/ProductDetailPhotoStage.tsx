import {
  Expand,
  Heart,
  Maximize2,
  ScanSearch,
  ShieldCheck,
  ShoppingBag,
  Tag,
  X,
  ZoomIn,
  ZoomOut,
} from "lucide-react";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import { useEffect, useRef, useState } from "react";
import {
  getDeliveryModeLabel,
  getShopCategoryLabel,
  getShopProductImage,
  resolveDeliveryMode,
  resolveShopCategory,
} from "../../lib/shopMedia";
import type { PublicShopCoupon, ShopItem } from "../../types/lottery";
import { formatTaka } from "../LotteryVisuals";

type PhotoViewMode = "studio" | "full" | "macro";

interface ProductDetailPhotoStageProps {
  product: ShopItem;
  currencySymbol: string;
  activeCoupons: PublicShopCoupon[];
  isSaved: boolean;
  onToggleWishlist: () => void;
}

const VIEW_MODES: Array<{
  id: PhotoViewMode;
  label: string;
  shortDesc: string;
}> = [
  { id: "studio", label: "Studio View", shortDesc: "Editorial crop" },
  { id: "full", label: "Full Frame", shortDesc: "Uncropped fit" },
  { id: "macro", label: "Detail Zoom", shortDesc: "Close-up focus" },
];

export function ProductDetailPhotoStage({
  product,
  currencySymbol,
  activeCoupons,
  isSaved,
  onToggleWishlist,
}: ProductDetailPhotoStageProps) {
  const prefersReducedMotion = useReducedMotion();
  const [imgFailed, setImgFailed] = useState(false);
  const [viewMode, setViewMode] = useState<PhotoViewMode>("studio");
  const [zoomActive, setZoomActive] = useState(false);
  const [zoomOrigin, setZoomOrigin] = useState<{ x: number; y: number }>({ x: 50, y: 50 });
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [lightboxZoom, setLightboxZoom] = useState<1 | 1.75 | 2.5>(1);
  const stageRef = useRef<HTMLDivElement | null>(null);

  const imageSrc = getShopProductImage(product);
  const category = resolveShopCategory(product);
  const deliveryMode = resolveDeliveryMode(product);
  const topCoupon = activeCoupons[0] || null;

  // Reset state cleanly when navigating between products
  useEffect(() => {
    setImgFailed(false);
    setViewMode("studio");
    setZoomActive(false);
    setZoomOrigin({ x: 50, y: 50 });
    setLightboxOpen(false);
    setLightboxZoom(1);
  }, [product.id]);

  // Keyboard Escape handler for fullscreen lightbox
  useEffect(() => {
    if (!lightboxOpen) return;
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setLightboxOpen(false);
        setLightboxZoom(1);
      }
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [lightboxOpen]);

  const handlePointerMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!zoomActive || !stageRef.current) return;
    const rect = stageRef.current.getBoundingClientRect();
    const x = Math.max(0, Math.min(100, ((e.clientX - rect.left) / rect.width) * 100));
    const y = Math.max(0, Math.min(100, ((e.clientY - rect.top) / rect.height) * 100));
    setZoomOrigin({ x, y });
  };

  const getStageImageStyle = () => {
    if (zoomActive) {
      return {
        transformOrigin: `${zoomOrigin.x}% ${zoomOrigin.y}%`,
        transform: "scale(2.15)",
      };
    }
    if (viewMode === "macro") {
      return {
        transformOrigin: "50% 48%",
        transform: "scale(1.42)",
      };
    }
    return {
      transformOrigin: "50% 50%",
      transform: "scale(1)",
    };
  };

  return (
    <div className="space-y-3.5">
      {/* Main Studio Frame */}
      <motion.div
        key={product.id}
        initial={prefersReducedMotion ? { opacity: 0 } : { opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
        className="rounded-2xl border border-slate-200/90 bg-white p-2.5 sm:p-3.5 shadow-[0_12px_34px_-18px_rgba(12,17,29,0.14)]"
      >
        <div
          ref={stageRef}
          onMouseMove={handlePointerMove}
          onMouseLeave={() => {
            if (zoomActive) setZoomOrigin({ x: 50, y: 50 });
          }}
          onClick={() => {
            if (imgFailed) return;
            setZoomActive((prev) => !prev);
          }}
          role="button"
          tabIndex={0}
          onKeyDown={(e) => {
            if (e.key === "Enter" || e.key === " ") {
              e.preventDefault();
              if (!imgFailed) setZoomActive((prev) => !prev);
            }
          }}
          aria-label={
            zoomActive
              ? `Zoom out on ${product.title}`
              : `Inspect ${product.title} photo at 2x magnification`
          }
          className={`group relative w-full aspect-[4/3] sm:aspect-[16/11] rounded-xl overflow-hidden bg-[radial-gradient(circle_at_50%_38%,#ffffff_0%,#EFECE5_100%)] border border-slate-200/70 select-none ${
            imgFailed
              ? "cursor-default"
              : zoomActive
              ? "cursor-zoom-out"
              : "cursor-zoom-in"
          }`}
        >
          {!imgFailed ? (
            <AnimatePresence mode="wait">
              <motion.div
                key={viewMode}
                initial={prefersReducedMotion ? { opacity: 0 } : { opacity: 0.35, scale: 0.99 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={prefersReducedMotion ? { opacity: 0 } : { opacity: 0.35 }}
                transition={{ duration: 0.24, ease: [0.16, 1, 0.3, 1] }}
                className={`w-full h-full flex items-center justify-center ${
                  viewMode === "full" ? "p-4 sm:p-7" : ""
                }`}
              >
                <img
                  src={imageSrc}
                  alt={product.title}
                  referrerPolicy="no-referrer"
                  onError={() => setImgFailed(true)}
                  style={getStageImageStyle()}
                  className={`${
                    viewMode === "full"
                      ? "max-w-full max-h-full object-contain rounded-lg shadow-md"
                      : "w-full h-full object-cover"
                  } transition-transform duration-300 ease-[cubic-bezier(0.16,1,0.3,1)] will-change-transform`}
                />
              </motion.div>
            </AnimatePresence>
          ) : (
            <div className="w-full h-full bg-gradient-to-br from-slate-800 via-slate-900 to-slate-950 flex flex-col items-center justify-center p-8 text-center text-white">
              <ShoppingBag className="w-12 h-12 text-amber-300 mb-3" />
              <p className="text-base font-semibold">{product.title}</p>
              <p className="mt-1 text-xs text-slate-400">
                {getShopCategoryLabel(category)} · {getDeliveryModeLabel(deliveryMode)}
              </p>
            </div>
          )}

          {/* Subtle Architectural Corner Offer Tag (Max 1, only when coupon exists) */}
          {topCoupon && !zoomActive && (
            <div className="pointer-events-none absolute top-3 left-3 z-10 px-2.5 py-1 rounded-md bg-[#0C111D]/90 backdrop-blur-xs text-white text-[11px] font-mono font-semibold tracking-tight flex items-center gap-1.5 shadow-sm">
              <Tag className="w-3 h-3 text-emerald-400" />
              <span>
                {topCoupon.discountType === "percent"
                  ? `${topCoupon.discountValue}% OFF`
                  : `${formatTaka(topCoupon.discountValue, currencySymbol)} OFF`}
              </span>
            </div>
          )}

          {/* Top-Right Studio Controls: Save, Zoom, Fullscreen */}
          <div
            className="absolute top-3 right-3 z-10 flex items-center gap-1.5"
            onClick={(e) => e.stopPropagation()}
          >
            <motion.button
              type="button"
              whileHover={prefersReducedMotion ? undefined : { scale: 1.06 }}
              whileTap={prefersReducedMotion ? undefined : { scale: 0.9 }}
              onClick={onToggleWishlist}
              aria-label={isSaved ? "Remove from saved products" : "Save product to wishlist"}
              title={isSaved ? "Saved" : "Save to Wishlist"}
              className="w-9 h-9 rounded-lg bg-white/92 hover:bg-white border border-slate-200/80 shadow-xs backdrop-blur-xs flex items-center justify-center cursor-pointer transition-colors"
            >
              <Heart
                className={`w-4 h-4 transition-colors ${
                  isSaved ? "fill-rose-500 text-rose-500" : "text-slate-700 hover:text-rose-500"
                }`}
              />
            </motion.button>

            {!imgFailed && (
              <>
                <motion.button
                  type="button"
                  whileHover={prefersReducedMotion ? undefined : { scale: 1.06 }}
                  whileTap={prefersReducedMotion ? undefined : { scale: 0.9 }}
                  onClick={() => setZoomActive((prev) => !prev)}
                  aria-label={zoomActive ? "Reset zoom" : "Zoom in product photo"}
                  title={zoomActive ? "Reset Zoom" : "2x Magnifier Zoom"}
                  className={`w-9 h-9 rounded-lg border shadow-xs backdrop-blur-xs flex items-center justify-center cursor-pointer transition-colors ${
                    zoomActive
                      ? "bg-[#0C111D] border-[#0C111D] text-white"
                      : "bg-white/92 hover:bg-white border-slate-200/80 text-slate-700 hover:text-slate-950"
                  }`}
                >
                  {zoomActive ? (
                    <ZoomOut className="w-4 h-4" />
                  ) : (
                    <ZoomIn className="w-4 h-4" />
                  )}
                </motion.button>

                <motion.button
                  type="button"
                  whileHover={prefersReducedMotion ? undefined : { scale: 1.06 }}
                  whileTap={prefersReducedMotion ? undefined : { scale: 0.9 }}
                  onClick={() => {
                    setZoomActive(false);
                    setLightboxZoom(1);
                    setLightboxOpen(true);
                  }}
                  aria-label="Open fullscreen product viewer"
                  title="Fullscreen View"
                  className="w-9 h-9 rounded-lg bg-white/92 hover:bg-white border border-slate-200/80 text-slate-700 hover:text-slate-950 shadow-xs backdrop-blur-xs flex items-center justify-center cursor-pointer transition-colors"
                >
                  <Maximize2 className="w-4 h-4" />
                </motion.button>
              </>
            )}
          </div>

          {/* Bottom Interactive Lens Caption */}
          {!imgFailed && (
            <div className="pointer-events-none absolute bottom-3 left-3 right-3 flex items-center justify-between gap-2">
              <span className="px-2.5 py-1 rounded-md bg-slate-950/70 backdrop-blur-xs text-[11px] font-medium text-white/95 inline-flex items-center gap-1.5 opacity-90 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity duration-200">
                <ScanSearch className="w-3.5 h-3.5 text-emerald-300" />
                {zoomActive
                  ? "Move cursor to inspect · Click to reset"
                  : "Click image to inspect 2×"}
              </span>
              <span className="hidden sm:inline-flex px-2.5 py-1 rounded-md bg-white/88 backdrop-blur-xs text-[11px] font-medium text-slate-700 border border-slate-200/70">
                {VIEW_MODES.find((m) => m.id === viewMode)?.label}
              </span>
            </div>
          )}
        </div>

        {/* Interactive Framing Thumbnail Switcher */}
        {!imgFailed && (
          <div className="mt-3 grid grid-cols-3 gap-2.5">
            {VIEW_MODES.map((modeOption) => {
              const active = viewMode === modeOption.id && !zoomActive;
              return (
                <button
                  key={modeOption.id}
                  type="button"
                  onClick={() => {
                    setZoomActive(false);
                    setViewMode(modeOption.id);
                  }}
                  className={`relative group/thumb rounded-xl border p-1.5 text-left transition-all cursor-pointer flex items-center gap-2.5 ${
                    active
                      ? "border-slate-900 bg-slate-50 shadow-xs"
                      : "border-slate-200/80 bg-white hover:border-slate-300 hover:bg-slate-50/70"
                  }`}
                >
                  <div className="w-12 h-10 sm:w-14 sm:h-11 rounded-lg overflow-hidden bg-[#EFECE5] shrink-0 border border-slate-200/60 flex items-center justify-center">
                    <img
                      src={imageSrc}
                      alt={`${product.title} — ${modeOption.label}`}
                      referrerPolicy="no-referrer"
                      className={
                        modeOption.id === "full"
                          ? "w-full h-full object-contain p-1"
                          : modeOption.id === "macro"
                          ? "w-full h-full object-cover scale-150"
                          : "w-full h-full object-cover"
                      }
                    />
                  </div>
                  <div className="min-w-0 flex-1 pr-1">
                    <p
                      className={`text-[11px] sm:text-xs font-semibold truncate ${
                        active ? "text-slate-950" : "text-slate-700"
                      }`}
                    >
                      {modeOption.label}
                    </p>
                    <p className="text-[10px] text-slate-500 truncate hidden sm:block">
                      {modeOption.shortDesc}
                    </p>
                  </div>
                  {active && (
                    <motion.span
                      layoutId="pdp-photo-view-indicator"
                      transition={{ type: "spring", stiffness: 420, damping: 32 }}
                      className="absolute bottom-0 inset-x-3 h-0.5 rounded-full bg-slate-950"
                    />
                  )}
                </button>
              );
            })}
          </div>
        )}

        {/* Quiet Editorial Metadata Strip (Unboxed, Zero Pill Clutter) */}
        <div className="mt-3 pt-3 border-t border-slate-100 px-1 flex flex-wrap items-center justify-between gap-x-4 gap-y-1.5 text-[11px] text-slate-500">
          <div className="flex flex-wrap items-center gap-x-2.5 gap-y-1">
            <span className="inline-flex items-center gap-1 font-medium text-slate-700">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
              Verified Catalog Item
            </span>
            <span aria-hidden="true">·</span>
            <span>
              {deliveryMode === "auto_email" ? "Instant Email Delivery" : "Tracked Fulfillment"}
            </span>
            <span aria-hidden="true">·</span>
            <span>Store Wallet 0% Fee</span>
          </div>
          {!imgFailed && (
            <button
              type="button"
              onClick={() => {
                setZoomActive(false);
                setLightboxZoom(1);
                setLightboxOpen(true);
              }}
              className="inline-flex items-center gap-1 font-semibold text-slate-700 hover:text-slate-950 cursor-pointer whitespace-nowrap"
            >
              <Expand className="w-3 h-3" />
              HD Preview
            </button>
          )}
        </div>
      </motion.div>

      {/* Fullscreen Interactive Studio Lightbox */}
      <AnimatePresence>
        {lightboxOpen && !imgFailed && (
          <motion.div
            key="pdp-lightbox-overlay"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            onClick={() => {
              setLightboxOpen(false);
              setLightboxZoom(1);
            }}
            className="fixed inset-0 z-50 bg-slate-950/92 backdrop-blur-md flex flex-col p-4 sm:p-6"
          >
            {/* Lightbox Header */}
            <div
              onClick={(e) => e.stopPropagation()}
              className="max-w-6xl w-full mx-auto flex items-center justify-between gap-4 text-white pb-3 border-b border-white/10"
            >
              <div className="min-w-0">
                <p className="text-[11px] uppercase tracking-wider text-slate-400">
                  {getShopCategoryLabel(category)} · Fullscreen Preview
                </p>
                <p className="text-sm sm:text-base font-semibold text-white truncate">
                  {product.title}{" "}
                  <span className="text-emerald-400 font-mono ml-1.5 tabular-nums">
                    {formatTaka(product.price, currencySymbol)}
                  </span>
                </p>
              </div>

              <div className="flex items-center gap-2 shrink-0">
                <div className="hidden sm:flex items-center gap-1 p-1 rounded-lg bg-white/10 border border-white/10">
                  {([1, 1.75, 2.5] as const).map((level) => (
                    <button
                      key={level}
                      type="button"
                      onClick={() => setLightboxZoom(level)}
                      className={`px-2.5 py-1 rounded-md text-xs font-mono font-semibold transition-colors cursor-pointer ${
                        lightboxZoom === level
                          ? "bg-white text-slate-950"
                          : "text-slate-300 hover:text-white"
                      }`}
                    >
                      {level}×
                    </button>
                  ))}
                </div>

                <button
                  type="button"
                  onClick={() => {
                    setLightboxOpen(false);
                    setLightboxZoom(1);
                  }}
                  aria-label="Close fullscreen viewer"
                  className="w-10 h-10 rounded-lg bg-white/10 hover:bg-white/20 text-white flex items-center justify-center cursor-pointer transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Lightbox Canvas */}
            <div
              onClick={(e) => e.stopPropagation()}
              className="flex-1 min-h-0 flex items-center justify-center overflow-auto py-4"
            >
              <motion.img
                src={imageSrc}
                alt={product.title}
                referrerPolicy="no-referrer"
                initial={prefersReducedMotion ? { opacity: 0 } : { opacity: 0, scale: 0.94 }}
                animate={{ opacity: 1, scale: lightboxZoom }}
                exit={prefersReducedMotion ? { opacity: 0 } : { opacity: 0, scale: 0.96 }}
                transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
                onClick={() =>
                  setLightboxZoom((z) => (z === 1 ? 1.75 : z === 1.75 ? 2.5 : 1))
                }
                className={`max-h-[78vh] max-w-[92vw] object-contain rounded-xl shadow-2xl ${
                  lightboxZoom > 1 ? "cursor-zoom-out" : "cursor-zoom-in"
                }`}
              />
            </div>

            <div className="text-center text-xs text-slate-400">
              Click image to cycle magnification · Press Esc to close
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
