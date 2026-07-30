import { cn } from "@/lib/utils";
import type { SVGProps } from "react";

type IconProps = SVGProps<SVGSVGElement> & { size?: number };

function Icon({ size = 20, className, children, ...props }: IconProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.75}
      strokeLinecap="round"
      strokeLinejoin="round"
      className={cn("shrink-0", className)}
      aria-hidden
      {...props}
    >
      {children}
    </svg>
  );
}

export function IconOverview(props: IconProps) {
  return (
    <Icon {...props}>
      <rect x="3" y="3" width="7" height="7" rx="1.5" />
      <rect x="14" y="3" width="7" height="7" rx="1.5" />
      <rect x="3" y="14" width="7" height="7" rx="1.5" />
      <rect x="14" y="14" width="7" height="7" rx="1.5" />
    </Icon>
  );
}

export function IconCompetitors(props: IconProps) {
  return (
    <Icon {...props}>
      <path d="M4 20V11" />
      <path d="M10 20V5" />
      <path d="M16 20v-8" />
      <path d="M20 20H3" />
    </Icon>
  );
}

export function IconPrompts(props: IconProps) {
  return (
    <Icon {...props}>
      <path d="M20 4H4a1 1 0 0 0-1 1v10a1 1 0 0 0 1 1h4v4l5-4h7a1 1 0 0 0 1-1V5a1 1 0 0 0-1-1Z" />
    </Icon>
  );
}

export function IconCitations(props: IconProps) {
  return (
    <Icon {...props}>
      <path d="M10 13a4 4 0 0 0 5.66 0l3-3a4 4 0 0 0-5.66-5.66l-1.1 1.1" />
      <path d="M14 11a4 4 0 0 0-5.66 0l-3 3A4 4 0 0 0 11 19.66l1.1-1.1" />
    </Icon>
  );
}

export function IconAlerts(props: IconProps) {
  return (
    <Icon {...props}>
      <path d="M6 9a6 6 0 0 1 12 0c0 5 2 6 2 6H4s2-1 2-6" />
      <path d="M10.5 20a2 2 0 0 0 3 0" />
    </Icon>
  );
}

export function IconSettings(props: IconProps) {
  return (
    <Icon {...props}>
      <path d="M4 7h10" />
      <path d="M18 7h2" />
      <circle cx="16" cy="7" r="2" />
      <path d="M4 17h6" />
      <path d="M14 17h6" />
      <circle cx="12" cy="17" r="2" />
    </Icon>
  );
}

export function IconAdmin(props: IconProps) {
  return (
    <Icon {...props}>
      <path d="M12 3 5 6v5c0 4 3 7 7 9 4-2 7-5 7-9V6l-7-3Z" />
      <path d="m9 12 2 2 4-4" />
    </Icon>
  );
}

export function IconAdd(props: IconProps) {
  return (
    <Icon {...props}>
      <path d="M12 5v14M5 12h14" />
    </Icon>
  );
}

export function IconCheck(props: IconProps) {
  return (
    <Icon {...props}>
      <path d="m4 12 5 5L20 6" />
    </Icon>
  );
}

export function IconClose(props: IconProps) {
  return (
    <Icon {...props}>
      <path d="M6 6l12 12M18 6 6 18" />
    </Icon>
  );
}

export function IconChevron(props: IconProps) {
  return (
    <Icon {...props}>
      <path d="m6 9 6 6 6-6" />
    </Icon>
  );
}

export function IconDownload(props: IconProps) {
  return (
    <Icon {...props}>
      <path d="M12 3v12" />
      <path d="m7 10 5 5 5-5" />
      <path d="M5 21h14" />
    </Icon>
  );
}

export function IconEmail(props: IconProps) {
  return (
    <Icon {...props}>
      <rect x="3" y="5" width="18" height="14" rx="2" />
      <path d="m3 7 9 6 9-6" />
    </Icon>
  );
}

export function IconShare(props: IconProps) {
  return (
    <Icon {...props}>
      <circle cx="6" cy="12" r="2.5" />
      <circle cx="17" cy="6" r="2.5" />
      <circle cx="17" cy="18" r="2.5" />
      <path d="m8.2 10.8 6.6-3.6M8.2 13.2l6.6 3.6" />
    </Icon>
  );
}

export function IconSearch(props: IconProps) {
  return (
    <Icon {...props}>
      <circle cx="11" cy="11" r="7" />
      <path d="m20 20-4-4" />
    </Icon>
  );
}

export function IconWin(props: IconProps) {
  return (
    <Icon {...props}>
      <path d="M6 17 14 9" />
      <path d="M9 8h6v6" />
    </Icon>
  );
}

export function IconLose(props: IconProps) {
  return (
    <Icon {...props}>
      <path d="M6 8 14 16" />
      <path d="M15 16H9v-6" />
    </Icon>
  );
}

export function IconSignificant(props: IconProps) {
  return (
    <Icon {...props}>
      <path d="M12 4v16M4 12h16M6.3 6.3l11.4 11.4M17.7 6.3 6.3 17.7" />
    </Icon>
  );
}

export function IconPresent(props: IconProps) {
  return (
    <Icon {...props}>
      <path d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7-10-7-10-7Z" />
      <circle cx="12" cy="12" r="2.5" fill="currentColor" stroke="none" />
    </Icon>
  );
}

export function IconAbsent(props: IconProps) {
  return (
    <Icon {...props}>
      <circle cx="12" cy="12" r="8" strokeDasharray="2 3" />
    </Icon>
  );
}

export function IconSuppressed(props: IconProps) {
  return (
    <Icon {...props}>
      <path d="M4 4 20 20" />
      <path d="M9.5 5.4A9.8 9.8 0 0 1 12 5c6.5 0 10 7 10 7a15 15 0 0 1-2.4 3.2" />
      <path d="M6.2 7.2A15 15 0 0 0 2 12s3.5 7 10 7a9.7 9.7 0 0 0 3.3-.6" />
    </Icon>
  );
}

export function IconContent(props: IconProps) {
  return (
    <Icon {...props}>
      <path d="M7 4h8l4 4v12a1 1 0 0 1-1 1H7a1 1 0 0 1-1-1V5a1 1 0 0 1 1-1Z" />
      <path d="M15 4v4h4M9 13h6M9 17h4" />
    </Icon>
  );
}

export const NAV_ICONS = {
  Insights: IconOverview,
  Content: IconContent,
  Overview: IconOverview,
  Competitors: IconCompetitors,
  Prompts: IconPrompts,
  Citations: IconCitations,
  Alerts: IconAlerts,
  Settings: IconSettings,
  Admin: IconAdmin,
} as const;
