export const colors = {
  primary: "#1EB980",        // accent / action color (green)
  secondary: "#7C5CFF",      // accent 2 (purple)
  accent: "#06D6A0",         // supporting accent
  textDark: "#ffffffff",       // primary text on dark bg
  textMuted: "#94A3B8",      // secondary/muted text
  bgPrimary: "#000000ff",
  bgSec: "#130e0eff",      // secondary background (dark)
  surface: "#0F1724",        // card / overlay surface
  border: "rgba(255,255,255,0.06)",
  borderLight: "rgba(255,255,255,0.03)",
  tintPrimary: "rgba(30,185,128,0.12)",
  tintSecondary: "rgba(124,92,255,0.10)",
  tintAccent: "rgba(6,214,160,0.10)",
};

export const buttons = {
  primary: {
    background: colors.primary,
    text: "#031017",
    hover: "#5a16c7ff",
  },
  secondary: {
    background: colors.secondary,
    text: "#FFFFFF",
    hover: "#6950E6",
  },
  accent: {
    background: colors.accent,
    text: "#031017",
    hover: "#05C196",
  },
  outline: {
    background: "transparent",
    text: colors.textDark,
    border: colors.border,
    hover: colors.primary,
  },
};

export const iconBackgrounds = {
  primary: colors.tintPrimary,
  secondary: colors.tintSecondary,
  accent: colors.tintAccent,
};
