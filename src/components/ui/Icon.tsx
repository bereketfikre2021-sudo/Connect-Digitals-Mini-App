/**
 * Lightweight SVG icon set — brand-consistent, no emoji.
 * All icons are 1:1 square, stroked (2px), filled only where noted.
 * Stroke color inherits from currentColor so they respond to CSS color.
 */

import type { CSSProperties } from "react";

interface IconProps {
  size?: number;
  color?: string;
  style?: CSSProperties;
  className?: string;
}

type IconComponent = (props: IconProps) => JSX.Element;

const base = (size: number, color: string | undefined, content: JSX.Element) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    stroke={color ?? "currentColor"}
    strokeWidth="1.8"
    strokeLinecap="round"
    strokeLinejoin="round"
    style={{ display: "inline-block", flexShrink: 0 }}
  >
    {content}
  </svg>
);

// ─── Navigation ──────────────────────────────────────────────────────────────
export const HomeIcon: IconComponent = ({ size = 20, color }) =>
  base(size, color, <><path d="M3 9.5 12 3l9 6.5V20a1 1 0 0 1-1 1H5a1 1 0 0 1-1-1V9.5z"/><path d="M9 21V12h6v9"/></>);

export const GridIcon: IconComponent = ({ size = 20, color }) =>
  base(size, color, <><rect x="3" y="3" width="7" height="7" rx="1"/><rect x="14" y="3" width="7" height="7" rx="1"/><rect x="3" y="14" width="7" height="7" rx="1"/><rect x="14" y="14" width="7" height="7" rx="1"/></>);

export const ListIcon: IconComponent = ({ size = 20, color }) =>
  base(size, color, <><line x1="8" y1="6" x2="21" y2="6"/><line x1="8" y1="12" x2="21" y2="12"/><line x1="8" y1="18" x2="21" y2="18"/><line x1="3" y1="6" x2="3.01" y2="6"/><line x1="3" y1="12" x2="3.01" y2="12"/><line x1="3" y1="18" x2="3.01" y2="18"/></>);

export const WalletIcon: IconComponent = ({ size = 20, color }) =>
  base(size, color, <><rect x="2" y="5" width="20" height="14" rx="2"/><path d="M16 12h.01"/><path d="M2 10h20"/></>);

export const UserIcon: IconComponent = ({ size = 20, color }) =>
  base(size, color, <><circle cx="12" cy="8" r="4"/><path d="M4 20c0-4 3.6-7 8-7s8 3 8 7"/></>);

// ─── Actions ─────────────────────────────────────────────────────────────────
export const SearchIcon: IconComponent = ({ size = 20, color }) =>
  base(size, color, <><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></>);

export const CheckIcon: IconComponent = ({ size = 20, color }) =>
  base(size, color, <polyline points="20 6 9 17 4 12"/>);

export const XIcon: IconComponent = ({ size = 20, color }) =>
  base(size, color, <><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></>);

export const PlusIcon: IconComponent = ({ size = 20, color }) =>
  base(size, color, <><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></>);

export const ArrowRightIcon: IconComponent = ({ size = 20, color }) =>
  base(size, color, <><line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/></>);

export const ArrowLeftIcon: IconComponent = ({ size = 20, color }) =>
  base(size, color, <><line x1="19" y1="12" x2="5" y2="12"/><polyline points="12 19 5 12 12 5"/></>);

export const ChevronRightIcon: IconComponent = ({ size = 20, color }) =>
  base(size, color, <polyline points="9 18 15 12 9 6"/>);

export const ExternalLinkIcon: IconComponent = ({ size = 20, color }) =>
  base(size, color, <><path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"/><polyline points="15 3 21 3 21 9"/><line x1="10" y1="14" x2="21" y2="3"/></>);

export const CopyIcon: IconComponent = ({ size = 20, color }) =>
  base(size, color, <><rect x="9" y="9" width="13" height="13" rx="2"/><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/></>);

export const RefreshIcon: IconComponent = ({ size = 20, color }) =>
  base(size, color, <><polyline points="23 4 23 10 17 10"/><path d="M20.49 15a9 9 0 1 1-2.12-9.36L23 10"/></>);

// ─── Finance ─────────────────────────────────────────────────────────────────
export const CreditCardIcon: IconComponent = ({ size = 20, color }) =>
  base(size, color, <><rect x="1" y="4" width="22" height="16" rx="2"/><line x1="1" y1="10" x2="23" y2="10"/></>);

export const TrendUpIcon: IconComponent = ({ size = 20, color }) =>
  base(size, color, <><polyline points="23 6 13.5 15.5 8.5 10.5 1 18"/><polyline points="17 6 23 6 23 12"/></>);

export const TrendDownIcon: IconComponent = ({ size = 20, color }) =>
  base(size, color, <><polyline points="23 18 13.5 8.5 8.5 13.5 1 6"/><polyline points="17 18 23 18 23 12"/></>);

export const CoinsIcon: IconComponent = ({ size = 20, color }) =>
  base(size, color, <><circle cx="8" cy="8" r="6"/><path d="M18.09 10.37A6 6 0 1 1 10.34 18"/><path d="M7 6h1v4"/><path d="m16.71 13.88.7.71-2.82 2.82"/></>);

// ─── Status ───────────────────────────────────────────────────────────────────
export const ClockIcon: IconComponent = ({ size = 20, color }) =>
  base(size, color, <><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></>);

export const AlertIcon: IconComponent = ({ size = 20, color }) =>
  base(size, color, <><path d="m10.29 3.86-8.6 14.9A1 1 0 0 0 2.55 20h17.9a1 1 0 0 0 .86-1.51l-8.6-14.9a1 1 0 0 0-1.72 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></>);

export const InfoIcon: IconComponent = ({ size = 20, color }) =>
  base(size, color, <><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></>);

export const LockIcon: IconComponent = ({ size = 20, color }) =>
  base(size, color, <><rect x="3" y="11" width="18" height="11" rx="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></>);

export const ShieldIcon: IconComponent = ({ size = 20, color }) =>
  base(size, color, <><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></>);

export const BellIcon: IconComponent = ({ size = 20, color }) =>
  base(size, color, <><path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/><path d="M13.73 21a2 2 0 0 1-3.46 0"/></>);

// ─── Content ─────────────────────────────────────────────────────────────────
export const PackageIcon: IconComponent = ({ size = 20, color }) =>
  base(size, color, <><line x1="16.5" y1="9.4" x2="7.5" y2="4.21"/><path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"/><polyline points="3.27 6.96 12 12.01 20.73 6.96"/><line x1="12" y1="22.08" x2="12" y2="12"/></>);

export const ClipboardIcon: IconComponent = ({ size = 20, color }) =>
  base(size, color, <><path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2"/><rect x="8" y="2" width="8" height="4" rx="1"/></>);

export const FileTextIcon: IconComponent = ({ size = 20, color }) =>
  base(size, color, <><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/><polyline points="10 9 9 9 8 9"/></>);

export const ImageIcon: IconComponent = ({ size = 20, color }) =>
  base(size, color, <><rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="8.5" cy="8.5" r="1.5"/><polyline points="21 15 16 10 5 21"/></>);

export const UploadIcon: IconComponent = ({ size = 20, color }) =>
  base(size, color, <><polyline points="16 16 12 12 8 16"/><line x1="12" y1="12" x2="12" y2="21"/><path d="M20.39 18.39A5 5 0 0 0 18 9h-1.26A8 8 0 1 0 3 16.3"/></>);

export const BarChartIcon: IconComponent = ({ size = 20, color }) =>
  base(size, color, <><line x1="18" y1="20" x2="18" y2="10"/><line x1="12" y1="20" x2="12" y2="4"/><line x1="6" y1="20" x2="6" y2="14"/></>);

export const LinkIcon: IconComponent = ({ size = 20, color }) =>
  base(size, color, <><path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"/><path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"/></>);

// ─── Platforms ────────────────────────────────────────────────────────────────
export const MusicIcon: IconComponent = ({ size = 20, color }) =>
  base(size, color, <><path d="M9 18V5l12-2v13"/><circle cx="6" cy="18" r="3"/><circle cx="18" cy="16" r="3"/></>);

export const CameraIcon: IconComponent = ({ size = 20, color }) =>
  base(size, color, <><path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z"/><circle cx="12" cy="13" r="4"/></>);

export const ThumbsUpIcon: IconComponent = ({ size = 20, color }) =>
  base(size, color, <><path d="M14 9V5a3 3 0 0 0-3-3l-4 9v11h11.28a2 2 0 0 0 2-1.7l1.38-9a2 2 0 0 0-2-2.3zM7 22H4a2 2 0 0 1-2-2v-7a2 2 0 0 1 2-2h3"/></>);

export const PlayIcon: IconComponent = ({ size = 20, color }) =>
  base(size, color, <><polygon points="5 3 19 12 5 21 5 3" fill="currentColor" stroke="none"/></>);

export const SendIcon: IconComponent = ({ size = 20, color }) =>
  base(size, color, <><line x1="22" y1="2" x2="11" y2="13"/><polygon points="22 2 15 22 11 13 2 9 22 2"/></>);

export const GlobeIcon: IconComponent = ({ size = 20, color }) =>
  base(size, color, <><circle cx="12" cy="12" r="10"/><line x1="2" y1="12" x2="22" y2="12"/><path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/></>);

export const UsersIcon: IconComponent = ({ size = 20, color }) =>
  base(size, color, <><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></>);

// ─── Misc ─────────────────────────────────────────────────────────────────────
export const MessageIcon: IconComponent = ({ size = 20, color }) =>
  base(size, color, <><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></>);

export const HelpCircleIcon: IconComponent = ({ size = 20, color }) =>
  base(size, color, <><circle cx="12" cy="12" r="10"/><path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3"/><line x1="12" y1="17" x2="12.01" y2="17"/></>);

export const StarIcon: IconComponent = ({ size = 20, color }) =>
  base(size, color, <><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></>);

export const SettingsIcon: IconComponent = ({ size = 20, color }) =>
  base(size, color, <><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z"/></>);

export const LogOutIcon: IconComponent = ({ size = 20, color }) =>
  base(size, color, <><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/></>);

export const ZapIcon: IconComponent = ({ size = 20, color }) =>
  base(size, color, <><polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/></>);

export const MailIcon: IconComponent = ({ size = 20, color }) =>
  base(size, color, <><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/><polyline points="22,6 12,13 2,6"/></>);

export const InboxIcon: IconComponent = ({ size = 20, color }) =>
  base(size, color, <><polyline points="22 12 16 12 14 15 10 15 8 12 2 12"/><path d="M5.45 5.11 2 12v6a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2v-6l-3.45-6.89A2 2 0 0 0 16.76 4H7.24a2 2 0 0 0-1.79 1.11z"/></>);

// ─── Social Platform Brand Icons ──────────────────────────────────────────────
// Flat SVG brand marks — recognizable shapes, brand colors, no external deps.

interface PlatformIconProps { size?: number }

/** TikTok — dual-note wordmark shape, brand black+red+teal */
export const TikTokBrandIcon = ({ size = 24 }: PlatformIconProps) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" style={{ display: "inline-block", flexShrink: 0 }}>
    {/* Teal shadow */}
    <path d="M10 3h3v12a3 3 0 1 1-3-3V9a6 6 0 1 0 6 6V7a8 8 0 0 0 4 1V5a5 5 0 0 1-4-2h-3z" fill="#69C9D0" opacity="0.5"/>
    {/* Red shadow */}
    <path d="M10 3h3v12a3 3 0 1 1-3-3V9a6 6 0 1 0 6 6V7a8 8 0 0 0 4 1V5a5 5 0 0 1-4-2h-3z" fill="#EE1D52" transform="translate(-1.5 0)"/>
    {/* Main black */}
    <path d="M10 3h3v12a3 3 0 1 1-3-3V9a6 6 0 1 0 6 6V7a8 8 0 0 0 4 1V5a5 5 0 0 1-4-2h-3z" fill="#010101"/>
  </svg>
);

/** Instagram — gradient camera icon */
export const InstagramBrandIcon = ({ size = 24 }: PlatformIconProps) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" style={{ display: "inline-block", flexShrink: 0 }}>
    <defs>
      <linearGradient id="ig-grad" x1="0%" y1="100%" x2="100%" y2="0%">
        <stop offset="0%" stopColor="#FFDC80"/>
        <stop offset="25%" stopColor="#FCAF45"/>
        <stop offset="50%" stopColor="#F77737"/>
        <stop offset="75%" stopColor="#C13584"/>
        <stop offset="100%" stopColor="#405DE6"/>
      </linearGradient>
    </defs>
    <rect x="2" y="2" width="20" height="20" rx="6" fill="url(#ig-grad)"/>
    <rect x="2" y="2" width="20" height="20" rx="6" fill="none" stroke="none"/>
    <circle cx="12" cy="12" r="4.5" stroke="white" strokeWidth="2" fill="none"/>
    <circle cx="17.5" cy="6.5" r="1.2" fill="white"/>
  </svg>
);

/** Facebook — f logo on blue */
export const FacebookBrandIcon = ({ size = 24 }: PlatformIconProps) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" style={{ display: "inline-block", flexShrink: 0 }}>
    <rect x="0" y="0" width="24" height="24" rx="6" fill="#1877F2"/>
    <path d="M15.5 8H13V6.5C13 5.9 13.4 5.8 13.7 5.8H15.4V3h-2.3C10.9 3 10 4.5 10 6.1V8H8v2.8h2V21h3V10.8h2.3L15.5 8z" fill="white"/>
  </svg>
);

/** YouTube — play button on red */
export const YouTubeBrandIcon = ({ size = 24 }: PlatformIconProps) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" style={{ display: "inline-block", flexShrink: 0 }}>
    <rect x="0" y="4" width="24" height="16" rx="5" fill="#FF0000"/>
    <polygon points="10,8.5 10,15.5 16,12" fill="white"/>
  </svg>
);

/** Telegram — paper plane on blue */
export const TelegramBrandIcon = ({ size = 24 }: PlatformIconProps) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" style={{ display: "inline-block", flexShrink: 0 }}>
    <circle cx="12" cy="12" r="12" fill="#0088CC"/>
    <path d="M5 12 L18 6 L14 18 L11 14 L8 16 L8.5 12.5 Z" fill="white"/>
    <path d="M8.5 12.5 L11 14 L14 18 L18 6" stroke="#0088CC" strokeWidth="1" fill="none"/>
    <line x1="8.5" y1="12.5" x2="11" y2="14" stroke="rgba(0,136,204,0.6)" strokeWidth="1.5"/>
  </svg>
);

/** Website — clean globe on blue */
export const WebsiteBrandIcon = ({ size = 24 }: PlatformIconProps) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" style={{ display: "inline-block", flexShrink: 0 }}>
    <circle cx="12" cy="12" r="12" fill="#2563EB"/>
    <circle cx="12" cy="12" r="7" stroke="white" strokeWidth="1.5" fill="none"/>
    <ellipse cx="12" cy="12" rx="3.5" ry="7" stroke="white" strokeWidth="1.5" fill="none"/>
    <line x1="5.5" y1="9" x2="18.5" y2="9" stroke="white" strokeWidth="1.5"/>
    <line x1="5.5" y1="15" x2="18.5" y2="15" stroke="white" strokeWidth="1.5"/>
  </svg>
);

/** Map from platform slug to brand icon component */
export const PLATFORM_BRAND_ICONS: Record<string, (props: PlatformIconProps) => JSX.Element> = {
  tiktok:    TikTokBrandIcon,
  instagram: InstagramBrandIcon,
  facebook:  FacebookBrandIcon,
  youtube:   YouTubeBrandIcon,
  telegram:  TelegramBrandIcon,
  website:   WebsiteBrandIcon,
};

// ─── Ethiopian Payment Method Brand Icons ────────────────────────────────────

/** CBE — Commercial Bank of Ethiopia. Green shield + "CBE" lettermark */
export function CBEIcon({ size = 40 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 48 48" fill="none" style={{ display: "inline-block", flexShrink: 0 }}>
      {/* Green shield background */}
      <rect width="48" height="48" rx="10" fill="#006341" />
      {/* White "CBE" text mark */}
      <text x="24" y="30" textAnchor="middle" fontFamily="Arial, sans-serif" fontWeight="900" fontSize="14" fill="#FFFFFF" letterSpacing="0.5">CBE</text>
      {/* Small gold accent bar */}
      <rect x="14" y="33" width="20" height="2.5" rx="1.25" fill="#D4AF37" />
    </svg>
  );
}

/** Awash Bank — purple/wine brand color with "AB" lettermark */
export function AwashBankIcon({ size = 40 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 48 48" fill="none" style={{ display: "inline-block", flexShrink: 0 }}>
      {/* Wine/maroon background */}
      <rect width="48" height="48" rx="10" fill="#8B0000" />
      {/* Wave shape — represents "Awash" river */}
      <path d="M8 28 Q14 22 20 28 Q26 34 32 28 Q38 22 44 28" stroke="#FFFFFF" strokeWidth="2.5" strokeLinecap="round" fill="none" opacity="0.6" />
      {/* "AB" lettermark */}
      <text x="24" y="26" textAnchor="middle" fontFamily="Arial, sans-serif" fontWeight="900" fontSize="14" fill="#FFFFFF" letterSpacing="0.5">AB</text>
    </svg>
  );
}

/** Telebirr — Ethio Telecom's mobile money. Blue + orange brand */
export function TelebirrIcon({ size = 40 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 48 48" fill="none" style={{ display: "inline-block", flexShrink: 0 }}>
      {/* Blue background */}
      <rect width="48" height="48" rx="10" fill="#0066CC" />
      {/* Orange accent top bar */}
      <rect x="0" y="0" width="48" height="10" rx="10" fill="#FF6600" />
      <rect x="0" y="5" width="48" height="5" fill="#FF6600" />
      {/* "t/" stylized mark */}
      <text x="24" y="33" textAnchor="middle" fontFamily="Arial, sans-serif" fontWeight="900" fontSize="16" fill="#FFFFFF">t/</text>
    </svg>
  );
}

/** Map payment method name → brand icon, or render the admin-uploaded logo if provided */
export function PaymentMethodIcon({ name, size = 40, logoUrl }: { name: string; size?: number; logoUrl?: string }) {
  // If admin uploaded a custom logo, use it
  if (logoUrl) {
    return (
      <img
        src={logoUrl}
        alt={name}
        width={size}
        height={size}
        style={{ display: "inline-block", flexShrink: 0, borderRadius: 8, objectFit: "cover", width: size, height: size }}
      />
    );
  }
  const n = name.toLowerCase();
  if (n.includes("cbe") || n.includes("commercial bank"))    return <CBEIcon size={size} />;
  if (n.includes("awash"))                                   return <AwashBankIcon size={size} />;
  if (n.includes("telebirr"))                                return <TelebirrIcon size={size} />;
  // Generic fallback
  return (
    <svg width={size} height={size} viewBox="0 0 48 48" fill="none" style={{ display: "inline-block", flexShrink: 0 }}>
      <rect width="48" height="48" rx="10" fill="#EC1C24" />
      <text x="24" y="30" textAnchor="middle" fontFamily="Arial, sans-serif" fontWeight="900" fontSize="13" fill="#FFFFFF">PAY</text>
    </svg>
  );
}


export const TagIcon: IconComponent = ({ size = 20, color }) =>
  base(size, color, <><path d="M20.59 13.41l-7.17 7.17a2 2 0 0 1-2.83 0L2 12V2h10l8.59 8.59a2 2 0 0 1 0 2.82z"/><line x1="7" y1="7" x2="7.01" y2="7"/></>);
