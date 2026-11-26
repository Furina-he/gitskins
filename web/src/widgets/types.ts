import type { PreviewMode, ThemeTokens } from "../types";

export type WidgetId =
  | "pixel-companion"
  | "now-playing"
  | "dev-badge"
  | "skill-dock"
  | "quote-banner"
  | "hero-sticker"
  | "pixel-runway"
  | "mini-tile";

/** 4-column 846px Bento grid: 1=204px, 2=418px, 3=632px, 4=846px (10px gaps) */
export type BentoColSpan = 1 | 2 | 3 | 4;

export type WidgetPlacement =
  | "top"
  | "hero-overlay"
  | "under-hero"
  | "under-cards"
  | "bottom";

export type HeroAnchor = "top-right" | "bottom-right" | "top-left" | "bottom-left";

export type PetKind = "cat" | "bot" | "slime" | "ghost";
export type PetMood = "coding" | "coffee" | "debugging" | "afking";
export type MediaKind = "cassette" | "vinyl";
export type DevStatus = "shipping" | "open" | "focus" | "hiring";
export type StickerMotif = "peeker" | "stamp" | "coffee" | "radar";
export type RunwayMode = "patrol" | "ticker" | "wave";
export type RunwaySpeed = "calm" | "normal" | "brisk";
export type MiniTileScene = "coffee" | "weather" | "hourglass" | "pulse";
export type WeatherKind = "rain" | "snow" | "sunny";

export interface PixelCompanionConfig {
  pet: PetKind;
  name: string;
  mood: PetMood;
  message: string;
  footerTag: string;
}

export interface NowPlayingConfig {
  media: MediaKind;
  track: string;
  artist: string;
  note: string;
  progress: number;
}

export interface DevBadgeConfig {
  handle: string;
  role: string;
  focus: string;
  location: string;
  status: DevStatus;
  meterLabel: string;
  meterValue: number;
}

export interface SkillDockConfig {
  title: string;
  subtitle: string;
  skills: string;
}

export interface QuoteBannerConfig {
  quote: string;
  author: string;
  tag: string;
}

export interface HeroStickerConfig {
  motif: StickerMotif;
  label: string;
  sublabel: string;
  anchor: HeroAnchor;
}

export interface PixelRunwayConfig {
  mode: RunwayMode;
  runner: "cat" | "bot" | "slime";
  tag: string;
  text: string;
  speed: RunwaySpeed;
}

export interface MiniTileConfig {
  scene: MiniTileScene;
  weather: WeatherKind;
  title: string;
  subtitle: string;
}

export type WidgetConfigMap = {
  "pixel-companion": PixelCompanionConfig;
  "now-playing": NowPlayingConfig;
  "dev-badge": DevBadgeConfig;
  "skill-dock": SkillDockConfig;
  "quote-banner": QuoteBannerConfig;
  "hero-sticker": HeroStickerConfig;
  "pixel-runway": PixelRunwayConfig;
  "mini-tile": MiniTileConfig;
};

export type AnyWidgetConfig = WidgetConfigMap[WidgetId];

export interface WidgetInstance<K extends WidgetId = WidgetId> {
  uid: string;
  widgetId: K;
  colSpan: BentoColSpan;
  placement: WidgetPlacement;
  accentOverride: string;
  animated: boolean;
  config: WidgetConfigMap[K];
}

export interface WidgetRenderOptions {
  themeId: string;
  mode: PreviewMode;
  tokens: ThemeTokens;
  colSpan: BentoColSpan;
  targetHeight?: number;
  inBentoRow?: boolean;
  accentOverride?: string;
  animated: boolean;
  instanceId?: string;
}

export interface WidgetCatalogEntry<K extends WidgetId = WidgetId> {
  id: K;
  code: string;
  name: string;
  nameZh: string;
  desc: string;
  descZh: string;
  defaultColSpan: BentoColSpan;
  supportedColSpans: BentoColSpan[];
  isStrip?: boolean;
  isSticker?: boolean;
  defaultPlacement: WidgetPlacement;
  supportedPlacements: WidgetPlacement[];
  defaultConfig: WidgetConfigMap[K];
}

export interface BentoRow {
  items: WidgetInstance[];
  usedCols: number;
  remainingCols: number;
  rowHeight: number;
  isStrip: boolean;
}
