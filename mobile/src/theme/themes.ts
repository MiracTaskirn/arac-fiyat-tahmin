export type ThemeName = "neo" | "emerald" | "midnight";

export type AppTheme = {
  name: ThemeName;
  colors: {
    background: string;
    backgroundSecondary: string;
    card: string;
    text: string;
    muted: string;
    border: string;
    primary: string;
    primarySoft: string;
    success: string;
    warning: string;
    danger: string;
  };
};

export const themes: Record<ThemeName, AppTheme> = {
  neo: {
    name: "neo",
    colors: {
      background: "#f7f8fb",
      backgroundSecondary: "#ffffff",
      card: "#ffffff",
      text: "#111827",
      muted: "#6b7280",
      border: "#e5e7eb",
      primary: "#2563eb",
      primarySoft: "#dbeafe",
      success: "#16a34a",
      warning: "#d97706",
      danger: "#dc2626",
    },
  },
  emerald: {
    name: "emerald",
    colors: {
      background: "#f2fbf7",
      backgroundSecondary: "#ffffff",
      card: "#ffffff",
      text: "#0f172a",
      muted: "#64748b",
      border: "#d1fae5",
      primary: "#059669",
      primarySoft: "#d1fae5",
      success: "#16a34a",
      warning: "#ca8a04",
      danger: "#dc2626",
    },
  },
  midnight: {
    name: "midnight",
    colors: {
      background: "#0b1120",
      backgroundSecondary: "#111827",
      card: "#111827",
      text: "#f9fafb",
      muted: "#9ca3af",
      border: "#243041",
      primary: "#60a5fa",
      primarySoft: "#1e3a8a",
      success: "#4ade80",
      warning: "#fbbf24",
      danger: "#f87171",
    },
  },
};