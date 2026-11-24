import shopCatDigitalImg from "../assets/images/shop_cat_digital_1795260865616.jpg";
import shopCatPhysicalImg from "../assets/images/shop_cat_physical_1795260865350.jpg";
import shopCatSmmImg from "../assets/images/shop_cat_smm_1795260865505.jpg";
import shopCyberCarromImg from "../assets/images/shop_cyber_carrom_1795260865122.jpg";
import shopCyberFreefireImg from "../assets/images/shop_cyber_freefire_1795260864836.jpg";
import shopSpinBundleImg from "../assets/images/shop_spin_bundle_1795260048460.jpg";
import shopSpinSingleImg from "../assets/images/shop_spin_single_1795260049274.jpg";
import shopTicketFastImg from "../assets/images/shop_ticket_fast_1795260048465.jpg";
import shopTicketMegaImg from "../assets/images/shop_ticket_mega_1795260047602.jpg";
import type { ShopCategory, ShopDeliveryMode, ShopItem } from "../types/lottery";

const IMAGE_KEY_MAP: Record<string, string> = {
  digital: shopCatDigitalImg,
  physical: shopCatPhysicalImg,
  smm: shopCatSmmImg,
  cyber_carrom: shopCyberCarromImg,
  cyber_freefire: shopCyberFreefireImg,
  spin_single: shopSpinSingleImg,
  spin_bundle: shopSpinBundleImg,
  ticket_fast: shopTicketFastImg,
  ticket_mega: shopTicketMegaImg,
};

const PRODUCT_ID_MAP: Record<string, string> = {
  shop_spin_1: shopSpinSingleImg,
  shop_spin_5: shopSpinBundleImg,
  shop_tkt_fast10: shopTicketFastImg,
  shop_tkt_mega: shopTicketMegaImg,
  shop_dig_canva: shopCatDigitalImg,
  shop_dig_win11: shopCatDigitalImg,
  shop_phys_headset: shopCatPhysicalImg,
  shop_phys_watch: shopCatPhysicalImg,
  shop_phys_carrom: shopCyberCarromImg,
  shop_smm_yt: shopCatSmmImg,
  shop_smm_fb: shopCatSmmImg,
  shop_smm_tiktok: shopCatSmmImg,
  shop_cyber_carrom: shopCyberCarromImg,
  shop_cyber_ff_1080: shopCyberFreefireImg,
  shop_cyber_ff_evo: shopCyberFreefireImg,
  shop_cyber_pubg: shopCyberFreefireImg,
  shop_ond_logo: shopCatDigitalImg,
  shop_ond_sourcing: shopCatPhysicalImg,
};

export function resolveShopCategory(item: Pick<ShopItem, "category" | "kind">): ShopCategory {
  if (item.category) return item.category;
  return "digital";
}

export function resolveDeliveryMode(
  item: Pick<ShopItem, "deliveryMode" | "category" | "kind">
): ShopDeliveryMode {
  if (item.deliveryMode) return item.deliveryMode;
  const cat = resolveShopCategory(item);
  return cat === "digital" ? "auto_email" : "manual_admin";
}

export function getShopCategoryLabel(category: ShopCategory): string {
  switch (category) {
    case "digital":
      return "Digital Product";
    case "physical":
      return "Physical Product";
    case "smm":
      return "SMM Service";
    case "cyber_pack":
      return "Cyber Pack";
    case "on_demand":
      return "On-Demand";
    default:
      return "Digital Product";
  }
}

export function getDeliveryModeLabel(mode: ShopDeliveryMode): string {
  return mode === "auto_email" ? "Auto-Send to Email" : "Admin Manual Check & Send";
}

export function getFulfillmentStatusLabel(status?: string | null): string {
  switch (status) {
    case "auto_delivered":
      return "Auto-Emailed";
    case "confirmed":
      return "Order Confirmed";
    case "processing":
      return "In Progress";
    case "packed":
      return "Packed & Ready";
    case "shipped":
      return "Shipped via Courier";
    case "out_for_delivery":
      return "Out for Delivery";
    case "partial":
      return "Partially Completed";
    case "delivered":
      return "Delivered / Completed";
    case "cancelled":
      return "Cancelled";
    case "pending_admin":
    default:
      return "Pending Admin Review";
  }
}

export function getShopProductImage(
  item: Pick<ShopItem, "id" | "kind" | "category" | "imageKey" | "customImageUrl" | "spinsGranted">
): string {
  if (
    item.customImageUrl &&
    (item.customImageUrl.startsWith("/api/shop/media/") ||
      item.customImageUrl.startsWith("data:image/"))
  ) {
    return item.customImageUrl;
  }
  if (item.imageKey && IMAGE_KEY_MAP[item.imageKey]) {
    return IMAGE_KEY_MAP[item.imageKey];
  }
  if (PRODUCT_ID_MAP[item.id]) {
    return PRODUCT_ID_MAP[item.id];
  }
  const cat = resolveShopCategory(item);
  if (cat === "cyber_pack") return shopCyberFreefireImg;
  if (cat === "physical") return shopCatPhysicalImg;
  if (cat === "smm") return shopCatSmmImg;
  if (cat === "on_demand") return shopCatDigitalImg;
  if (item.kind === "ticket_entry") {
    return item.spinsGranted > 0 ? shopTicketMegaImg : shopTicketFastImg;
  }
  if (item.kind === "spin_pack") {
    return item.spinsGranted > 1 ? shopSpinBundleImg : shopSpinSingleImg;
  }
  return shopCatDigitalImg;
}

export function getShopProductSpecs(item: ShopItem): Array<{ label: string; value: string }> {
  const cat = resolveShopCategory(item);
  const mode = resolveDeliveryMode(item);

  const specs: Array<{ label: string; value: string }> = [
    { label: "Catalog Category", value: getShopCategoryLabel(cat) },
    { label: "Delivery Workflow", value: getDeliveryModeLabel(mode) },
    {
      label: "Accepted Payments",
      value: "Store Wallet, bKash, Nagad, Rocket & Upay",
    },
    {
      label: "Fulfillment Speed",
      value:
        mode === "auto_email"
          ? "Automatic Instant Email Dispatch (Wallet Paid)"
          : cat === "physical"
          ? "Admin Verified & Courier Dispatched (1–3 Days)"
          : "Admin Manual Verification & Email Delivery (15–60 Mins)",
    },
  ];

  if (cat === "cyber_pack") {
    specs.push({
      label: "Required at Checkout",
      value: "Your Delivery Email + Optional Game UID / Account ID",
    });
  } else if (cat === "physical") {
    specs.push({
      label: "Required at Checkout",
      value: "Delivery Email, Mobile Phone & Full Shipping Address",
    });
  } else if (cat === "smm") {
    specs.push({
      label: "Required at Checkout",
      value: "Target Channel / Page / Post URL + Contact Email",
    });
  } else if (cat === "on_demand") {
    specs.push({
      label: "Required at Checkout",
      value: "Delivery Email + Your Custom Product / Service Brief",
    });
  } else {
    specs.push({
      label: "Required at Checkout",
      value: "Email Address for Instant Auto-Delivery",
    });
  }

  return specs;
}
