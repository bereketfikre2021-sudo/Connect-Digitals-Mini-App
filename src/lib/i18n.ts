/**
 * i18n setup — English (default) + Amharic
 *
 * Detects language from:
 * 1. localStorage  ("cd_lang")
 * 2. Telegram user language_code
 * 3. Browser navigator.language
 * 4. Fallback: English
 */

import i18n from "i18next";
import { initReactI18next } from "react-i18next";

const en = {
  translation: {
    // Navigation
    home:          "Home",
    services:      "Services",
    orders:        "Orders",
    wallet:        "Wallet",
    profile:       "Profile",
    notifications: "Notifications",
    support:       "Support",

    // Auth
    authRequired:  "Authentication Required",
    authMessage:   "Please open this app through the Connect Digitals Telegram Bot.",

    // Common
    back:          "Back",
    cancel:        "Cancel",
    confirm:       "Confirm",
    save:          "Save",
    loading:       "Loading…",
    retry:         "Retry",
    error:         "Something went wrong",
    noResults:     "No results found",
    close:         "Close",

    // Order
    placeOrder:      "Place Order",
    reviewOrder:     "Review Order",
    orderPlaced:     "Order Placed",
    orderDetails:    "Order Details",
    orderNumber:     "Order #",
    quantity:        "Quantity",
    deliveryDays:    "Delivery",
    totalAmount:     "Total",
    targetUrl:       "Target URL",
    completePayment: "Complete Payment",
    resubmitPayment: "Re-submit Payment",
    cancelOrder:     "Cancel Order",
    reorder:         "Re-order this service",

    // Payment
    paymentMethod:   "Payment Method",
    paymentProof:    "Payment Screenshot",
    tapToUpload:     "Tap to upload",
    submitPayment:   "Submit Payment",
    transferDate:    "Transfer Date",
    payWithWallet:   "Pay with Wallet",
    depositFunds:    "Deposit Funds",

    // Wallet
    availableBalance: "Available Balance",
    transactions:     "Transactions",
    noTransactions:   "No transactions yet.",
    pendingDeposit:   "Pending Deposit",

    // Promo
    promoCode:       "Promo Code",
    enterCode:       "Enter code (optional)",
    apply:           "Apply",
    promoApplied:    "{{percent}}% off — saving {{amount}} ETB",
    promoInvalid:    "Invalid or inactive promo code",

    // Status
    PENDING_PAYMENT:   "Awaiting Payment",
    PAYMENT_SUBMITTED: "Payment Submitted",
    PAYMENT_APPROVED:  "Payment Approved",
    PAYMENT_REJECTED:  "Payment Rejected",
    PROCESSING:        "Processing",
    IN_PROGRESS:       "In Progress",
    COMPLETED:         "Completed",
    CANCELLED:         "Cancelled",
    REFUNDED:          "Refunded",

    // Profile
    myProfile:   "My Profile",
    memberSince: "Member since",
    totalOrders: "Total Orders",
    totalSpent:  "Total Spent",
  },
};

const am: typeof en = {
  translation: {
    // Navigation
    home:          "ዋና ገጽ",
    services:      "አገልግሎቶች",
    orders:        "ትዕዛዞች",
    wallet:        "ቦርሳ",
    profile:       "መገለጫ",
    notifications: "ማሳወቂያዎች",
    support:       "ድጋፍ",

    // Auth
    authRequired:  "ማረጋገጫ ያስፈልጋል",
    authMessage:   "እባክዎ ይህን መተግበሪያ በ Connect Digitals Telegram Bot ይክፈቱ።",

    // Common
    back:          "ተመለስ",
    cancel:        "ሰርዝ",
    confirm:       "አረጋግጥ",
    save:          "አስቀምጥ",
    loading:       "በመጫን ላይ…",
    retry:         "እንደገና ሞክር",
    error:         "ስህተት ተፈጥሯል",
    noResults:     "ምንም ውጤት አልተገኘም",
    close:         "ዝጋ",

    // Order
    placeOrder:      "ትዕዛዝ ስጥ",
    reviewOrder:     "ትዕዛዝ ይገምግሙ",
    orderPlaced:     "ትዕዛዝ ተሰጥቷል",
    orderDetails:    "የትዕዛዝ ዝርዝሮች",
    orderNumber:     "ቁጥር #",
    quantity:        "ብዛት",
    deliveryDays:    "ማድረሻ",
    totalAmount:     "ጠቅላላ",
    targetUrl:       "ዒላማ URL",
    completePayment: "ክፍያ ጨርስ",
    resubmitPayment: "ክፍያ እንደገና ላክ",
    cancelOrder:     "ትዕዛዝ ሰርዝ",
    reorder:         "ይህን አገልግሎት እንደገና ዘዝ",

    // Payment
    paymentMethod:   "የክፍያ ዘዴ",
    paymentProof:    "የክፍያ ቅጂ",
    tapToUpload:     "ለመጫን ጫን",
    submitPayment:   "ክፍያ ላክ",
    transferDate:    "የዝውውር ቀን",
    payWithWallet:   "በቦርሳ ክፈል",
    depositFunds:    "ገንዘብ ጨምር",

    // Wallet
    availableBalance: "ያለ ሂሳብ",
    transactions:     "ግብይቶች",
    noTransactions:   "ምንም ግብይት የለም።",
    pendingDeposit:   "በመጠባበቅ ላይ ያለ ክፍያ",

    // Promo
    promoCode:       "ፕሮሞ ኮድ",
    enterCode:       "ኮድ ያስገቡ (አማራጭ)",
    apply:           "ተጠቀም",
    promoApplied:    "{{percent}}% ቅናሽ — {{amount}} ETB ቆጥቧል",
    promoInvalid:    "ልክ ያልሆነ ወይም ያልሰራ ኮድ",

    // Status
    PENDING_PAYMENT:   "ክፍያ በመጠበቅ",
    PAYMENT_SUBMITTED: "ክፍያ ቀርቧል",
    PAYMENT_APPROVED:  "ክፍያ ፀድቋል",
    PAYMENT_REJECTED:  "ክፍያ ተከልክሏል",
    PROCESSING:        "በሂደት ላይ",
    IN_PROGRESS:       "ሥራ ላይ",
    COMPLETED:         "ተጠናቋል",
    CANCELLED:         "ተሰርዟል",
    REFUNDED:          "ተመልሷል",

    // Profile
    myProfile:   "የኔ መገለጫ",
    memberSince: "አባል የሆኑበት ቀን",
    totalOrders: "ጠቅላላ ትዕዛዞች",
    totalSpent:  "ጠቅላላ ወጪ",
  },
};

// Detect preferred language
function detectLang(): string {
  const stored = localStorage.getItem("cd_lang");
  if (stored) return stored;
  const telegramLang = (window as unknown as { Telegram?: { WebApp?: { initDataUnsafe?: { user?: { language_code?: string } } } } })
    ?.Telegram?.WebApp?.initDataUnsafe?.user?.language_code;
  if (telegramLang?.startsWith("am")) return "am";
  const browserLang = navigator.language;
  if (browserLang.startsWith("am")) return "am";
  return "en";
}

i18n
  .use(initReactI18next)
  .init({
    resources: { en, am },
    lng: detectLang(),
    fallbackLng: "en",
    interpolation: { escapeValue: false },
  });

export default i18n;

/** Persist language choice */
export function setLanguage(lang: "en" | "am") {
  localStorage.setItem("cd_lang", lang);
  i18n.changeLanguage(lang);
}
