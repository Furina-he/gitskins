export type Lang = "en" | "zh";
export type PreviewMode = "light" | "dark";
export type PromptKind = "quick" | "full";

export interface ThemeButton {
  id: string;
  label: string;
  url: string;
}

export interface ThemeCard {
  id: string;
  title: string;
  url: string;
}

export interface ThemeSubLinkGroup {
  group: string;
  items: { label: string; url: string }[];
}

export interface ThemeTokens {
  bg: string;
  surface: string;
  ink: string;
  sub: string;
  muted: string;
  border: string;
  borderSoft: string;
  accent: string;
  accentFg: string;
  secondary: string;
  tertiary: string;
  highlight: string;
  patternBg: string;
  patternFg: string;
}

export interface SkinTheme {
  id: string;
  order: number;
  name: string;
  nameZh: string;
  category: string;
  categoryZh: string;
  tagline: string;
  taglineZh: string;
  bestFor: string[];
  bestForZh: string[];
  author: string;
  inspiredBy?: string;
  accent: string;
  svgCount: number;
  palette: {
    light: string[];
    dark: string[];
  };
  tokens: {
    light: ThemeTokens;
    dark: ThemeTokens;
  };
  features: string[];
  featuresZh: string[];
  buttons: ThemeButton[];
  cards: ThemeCard[];
  sections: string[];
  subLinks: ThemeSubLinkGroup[];
  prompts: {
    full: { en: string; zh: string };
    quick: { en: string; zh: string };
  };
  specMarkdown: string;
  links: {
    spec: string;
    generator: string;
    promptRaw: string;
    folder: string;
  };
}
