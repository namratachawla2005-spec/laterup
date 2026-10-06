// Simple line icons. Always paired with a word, and hidden from screen readers.
type P = { className?: string };
const base = {
  viewBox: "0 0 24 24",
  fill: "none",
  stroke: "currentColor",
  strokeWidth: 1.8,
  strokeLinecap: "round" as const,
  strokeLinejoin: "round" as const,
  "aria-hidden": true,
  focusable: false,
};

export const HomeIcon = ({ className = "h-6 w-6" }: P) => (
  <svg {...base} className={className}><path d="M4 10.5 12 4l8 6.5V19a1 1 0 0 1-1 1h-4.5v-5.5h-5V20H5a1 1 0 0 1-1-1z" /></svg>
);
export const TalkIcon = ({ className = "h-6 w-6" }: P) => (
  <svg {...base} className={className}><path d="M5 5h14a1 1 0 0 1 1 1v9a1 1 0 0 1-1 1h-8l-4.5 3.5V16H5a1 1 0 0 1-1-1V6a1 1 0 0 1 1-1z" /></svg>
);
export const PatternsIcon = ({ className = "h-6 w-6" }: P) => (
  <svg {...base} className={className}><path d="M3 12c2-4 4-4 6 0s4 4 6 0 4-4 6 0" /><path d="M3 18c2-2 4-2 6 0s4 2 6 0 4-2 6 0" opacity=".5" /></svg>
);
export const DoctorIcon = ({ className = "h-6 w-6" }: P) => (
  <svg {...base} className={className}><rect x="5" y="5" width="14" height="16" rx="2" /><path d="M9 5V3.5h6V5M9 11h6M9 15h4" /></svg>
);
export const GearIcon = ({ className = "h-6 w-6" }: P) => (
  <svg {...base} className={className}><circle cx="12" cy="12" r="3" /><path d="M19.4 15a1.7 1.7 0 0 0 .3 1.8l.1.1a2 2 0 1 1-2.8 2.8l-.1-.1a1.7 1.7 0 0 0-1.8-.3 1.7 1.7 0 0 0-1 1.5V21a2 2 0 1 1-4 0v-.1a1.7 1.7 0 0 0-1.1-1.5 1.7 1.7 0 0 0-1.8.3l-.1.1a2 2 0 1 1-2.8-2.8l.1-.1a1.7 1.7 0 0 0 .3-1.8 1.7 1.7 0 0 0-1.5-1H3a2 2 0 1 1 0-4h.1a1.7 1.7 0 0 0 1.5-1.1 1.7 1.7 0 0 0-.3-1.8l-.1-.1a2 2 0 1 1 2.8-2.8l.1.1a1.7 1.7 0 0 0 1.8.3H9a1.7 1.7 0 0 0 1-1.5V3a2 2 0 1 1 4 0v.1a1.7 1.7 0 0 0 1 1.5 1.7 1.7 0 0 0 1.8-.3l.1-.1a2 2 0 1 1 2.8 2.8l-.1.1a1.7 1.7 0 0 0-.3 1.8V9a1.7 1.7 0 0 0 1.5 1H21a2 2 0 1 1 0 4h-.1a1.7 1.7 0 0 0-1.5 1z" /></svg>
);
export const LockIcon = ({ className = "h-4 w-4" }: P) => (
  <svg viewBox="0 0 20 20" aria-hidden="true" focusable="false" className={className}>
    <rect x="4" y="9" width="12" height="8.5" rx="2" fill="currentColor" />
    <path d="M6.75 9V6.5a3.25 3.25 0 0 1 6.5 0V9" fill="none" stroke="currentColor" strokeWidth="1.8" />
  </svg>
);
export const BackIcon = ({ className = "h-5 w-5" }: P) => (
  <svg viewBox="0 0 20 20" aria-hidden="true" focusable="false" className={className}>
    <path d="M12.5 5 7.5 10l5 5" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

// Check-in: soft shapes, not faces
export const SunIcon = ({ className = "h-8 w-8" }: P) => (
  <svg {...base} className={className}><circle cx="12" cy="12" r="4" fill="currentColor" stroke="none" /><path d="M12 3v2M12 19v2M3 12h2M19 12h2M5.6 5.6 7 7M17 17l1.4 1.4M5.6 18.4 7 17M17 7l1.4-1.4" /></svg>
);
export const PartSunIcon = ({ className = "h-8 w-8" }: P) => (
  <svg {...base} className={className}><path d="M9 4v1.5M4.5 8.5H3M5.8 5.3l1 1M12.3 6.8a4 4 0 0 0-6.2 4.4" /><path d="M8.5 19h9a3.5 3.5 0 0 0 .3-7 5 5 0 0 0-9.6 1.2A3 3 0 0 0 8.5 19z" fill="currentColor" fillOpacity=".15" /></svg>
);
export const CloudIcon = ({ className = "h-8 w-8" }: P) => (
  <svg {...base} className={className}><path d="M7 18h10a4 4 0 0 0 .4-8 6 6 0 0 0-11.5 1.6A3.3 3.3 0 0 0 7 18z" fill="currentColor" fillOpacity=".15" /></svg>
);
