import type { PreviewMode, ThemeTokens } from "../types";

export type WidgetId =
  | "pixel-companion"
  | "now-playing"
  | "dev-badge"
  | "skill-dock"
  | "quote-banner"
  | "hero-sticker"
  | "pixel-runway"
  | "mini-tile"
  | "keycap-rig"
  | "split-flap"
  | "skill-radar"
  | "qr-pass"
  | "github-stats"
  | "coding-rhythm"
  | "rss-feed"
  | "live-weather"
  | "wakatime-weekly"
  | "spotify-recent"
  | "contribution-snake"
  | "contrib-skyline"
  | "commit-streak"
  | "recent-activity";

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
export type LiveWeatherCondition = "sunny" | "cloudy" | "rain" | "snow";
export type RhythmPersona = "early" | "day" | "evening" | "night";

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

export interface GitHubStatsConfig {
  username: string;
  stars: number;
  repos: number;
  followers: number;
  prs: number;
  languages: string; // e.g. "Rust:42, TypeScript:31, Python:19, Shell:8"
}

export interface CodingRhythmConfig {
  tzOffset: number;
  persona: RhythmPersona;
  schedule: "6h" | "daily";
}

export interface RssFeedConfig {
  feedUrl: string;
  source: string;
  post1: string;
  post2: string;
  post3: string;
}

export interface LiveWeatherConfig {
  city: string;
  unit: "C" | "F";
  condition: LiveWeatherCondition;
  temp: number;
  humidity: number;
}

export interface WakaTimeWeeklyConfig {
  totalHours: string;
  dailyAvg: string;
  editor: string;
  languages: string; // e.g. "TypeScript:44, Rust:28, Python:18, CSS:10"
}

export interface SpotifyRecentConfig {
  track: string;
  artist: string;
  album: string;
  status: "NOW PLAYING" | "RECENTLY PLAYED" | "PAUSED";
  progress: number;
  duration: string;
}

export type SnakeEngine = "platane-snk" | "gitskins-svg";

export interface ContributionSnakeConfig {
  username: string;
  engine: SnakeEngine;
  speed: RunwaySpeed;
  schedule: "daily" | "6h";
}

export interface KeycapRigConfig {
  title: string;
  keys: string;
  accentKeys: string;
  hardware: string;
}

export interface SplitFlapConfig {
  header: string;
  line1: string;
  line2: string;
  code: string;
}

export interface SkillRadarConfig {
  title: string;
  subtitle: string;
  axes: string; // e.g. "SYS:88, AI:92, UI:84, INFRA:78, OSS:95, HW:72"
}

export interface QrPassConfig {
  url: string;
  title: string;
  subtitle: string;
  badge: string;
}

export interface ContribSkylineConfig {
  username: string;
  totalCommits: number;
  weeks: number;
  schedule: "daily" | "6h";
}

export interface CommitStreakConfig {
  username: string;
  currentStreak: number;
  longestStreak: number;
  totalCommits: number;
}

export interface RecentActivityConfig {
  username: string;
  event1: string;
  event2: string;
  event3: string;
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
  "keycap-rig": KeycapRigConfig;
  "split-flap": SplitFlapConfig;
  "skill-radar": SkillRadarConfig;
  "qr-pass": QrPassConfig;
  "github-stats": GitHubStatsConfig;
  "coding-rhythm": CodingRhythmConfig;
  "rss-feed": RssFeedConfig;
  "live-weather": LiveWeatherConfig;
  "wakatime-weekly": WakaTimeWeeklyConfig;
  "spotify-recent": SpotifyRecentConfig;
  "contribution-snake": ContributionSnakeConfig;
  "contrib-skyline": ContribSkylineConfig;
  "commit-streak": CommitStreakConfig;
  "recent-activity": RecentActivityConfig;
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
  isLive?: boolean;
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
