export interface GitHubRepoSummary {
  id: string;
  name: string;
  description: string;
  htmlUrl: string;
  homepage: string;
  language: string;
  stars: number;
  forks: number;
  license: string;
  updatedAt: string;
  isFork: boolean;
}

export interface PixelAvatarVector {
  size: number;
  paths: { color: string; d: string }[];
}

export interface LiveProfileData {
  username: string;
  displayName: string;
  bio: string;
  avatarUrl: string;
  pixelAvatar: PixelAvatarVector | null;
  htmlUrl: string;
  blog: string;
  location: string;
  followers: number;
  publicRepos: number;
  totalStars: number;
  topLanguages: string[];
  repos: GitHubRepoSummary[];
  isDemo?: boolean;
}

export type FetchProfileErrorCode = "invalid" | "not-found" | "rate-limit" | "network";

export class GitHubProfileError extends Error {
  code: FetchProfileErrorCode;
  constructor(code: FetchProfileErrorCode, message: string) {
    super(message);
    this.code = code;
  }
}

const HANDLE_RE = /^[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,37}[a-zA-Z0-9])?$/;
const profileCache = new Map<string, LiveProfileData>();

export function normalizeUrl(raw?: string | null): string {
  const s = (raw ?? "").trim();
  if (!s) return "";
  if (/^https?:\/\//i.test(s)) return s;
  return `https://${s}`;
}

export function stripProtocol(url: string): string {
  return url.replace(/^https?:\/\//i, "").replace(/\/$/, "");
}

function toHexByte(n: number): string {
  return Math.max(0, Math.min(255, n)).toString(16).padStart(2, "0");
}

function quantizeChannel(v: number): number {
  return Math.min(255, Math.round(v / 28) * 28);
}

/**
 * Sample a GitHub avatar URL onto an offscreen 24x24 canvas and encode it as
 * pure crisp-edge vector SVG paths (zero external <image> links, 100% GitHub Camo safe).
 */
export async function samplePixelAvatar(
  avatarUrl: string,
  size = 24
): Promise<PixelAvatarVector | null> {
  if (typeof window === "undefined" || typeof document === "undefined" || !avatarUrl) {
    return null;
  }
  return new Promise((resolve) => {
    const img = new Image();
    img.crossOrigin = "anonymous";
    const timer = window.setTimeout(() => resolve(null), 4000);

    img.onload = () => {
      window.clearTimeout(timer);
      try {
        const canvas = document.createElement("canvas");
        canvas.width = size;
        canvas.height = size;
        const ctx = canvas.getContext("2d");
        if (!ctx) {
          resolve(null);
          return;
        }
        ctx.imageSmoothingEnabled = true;
        ctx.drawImage(img, 0, 0, size, size);
        const { data } = ctx.getImageData(0, 0, size, size);

        const byColor = new Map<string, string[]>();
        for (let y = 0; y < size; y++) {
          let x = 0;
          while (x < size) {
            const idx = (y * size + x) * 4;
            const alpha = data[idx + 3];
            if (alpha < 40) {
              x++;
              continue;
            }
            const color = `#${toHexByte(quantizeChannel(data[idx]))}${toHexByte(quantizeChannel(data[idx + 1]))}${toHexByte(quantizeChannel(data[idx + 2]))}`;
            const start = x;
            x++;
            while (x < size) {
              const nIdx = (y * size + x) * 4;
              if (data[nIdx + 3] < 40) break;
              const nColor = `#${toHexByte(quantizeChannel(data[nIdx]))}${toHexByte(quantizeChannel(data[nIdx + 1]))}${toHexByte(quantizeChannel(data[nIdx + 2]))}`;
              if (nColor !== color) break;
              x++;
            }
            const seg = `M${start} ${y}h${x - start}v1h-${x - start}z`;
            const list = byColor.get(color);
            if (list) list.push(seg);
            else byColor.set(color, [seg]);
          }
        }

        const paths: { color: string; d: string }[] = [];
        byColor.forEach((segs, color) => {
          paths.push({ color, d: segs.join("") });
        });
        resolve(paths.length > 0 ? { size, paths } : null);
      } catch {
        resolve(null);
      }
    };

    img.onerror = () => {
      window.clearTimeout(timer);
      resolve(null);
    };

    const sep = avatarUrl.includes("?") ? "&" : "?";
    img.src = `${avatarUrl}${sep}s=96`;
  });
}

interface RawGitHubUser {
  login: string;
  name?: string | null;
  bio?: string | null;
  avatar_url?: string | null;
  html_url?: string | null;
  blog?: string | null;
  location?: string | null;
  followers?: number;
  public_repos?: number;
}

interface RawGitHubRepo {
  id: number;
  name: string;
  description?: string | null;
  html_url: string;
  homepage?: string | null;
  language?: string | null;
  stargazers_count?: number;
  forks_count?: number;
  license?: { spdx_id?: string | null } | null;
  updated_at?: string;
  fork?: boolean;
  archived?: boolean;
}

export async function fetchGitHubProfile(rawInput: string): Promise<LiveProfileData> {
  const handle = rawInput.trim().replace(/^@+/, "");
  if (!HANDLE_RE.test(handle)) {
    throw new GitHubProfileError("invalid", "Invalid GitHub username format.");
  }

  const key = handle.toLowerCase();
  const cached = profileCache.get(key);
  if (cached) return cached;

  let userRes: Response;
  let reposRes: Response;
  try {
    [userRes, reposRes] = await Promise.all([
      fetch(`https://api.github.com/users/${encodeURIComponent(handle)}`, {
        headers: { Accept: "application/vnd.github+json" },
      }),
      fetch(
        `https://api.github.com/users/${encodeURIComponent(handle)}/repos?per_page=30&sort=updated`,
        { headers: { Accept: "application/vnd.github+json" } }
      ),
    ]);
  } catch {
    throw new GitHubProfileError("network", "Network request to GitHub API failed.");
  }

  if (userRes.status === 404) {
    throw new GitHubProfileError("not-found", `GitHub user @${handle} not found.`);
  }
  if (userRes.status === 403 || reposRes.status === 403) {
    throw new GitHubProfileError("rate-limit", "GitHub public API rate limit reached.");
  }
  if (!userRes.ok) {
    throw new GitHubProfileError("network", `GitHub API responded with ${userRes.status}.`);
  }

  const user = (await userRes.json()) as RawGitHubUser;
  const rawRepos = reposRes.ok ? ((await reposRes.json()) as RawGitHubRepo[]) : [];

  const nonSelf = rawRepos.filter((r) => r.name.toLowerCase() !== user.login.toLowerCase());
  const originals = nonSelf.filter((r) => !r.fork && !r.archived);
  const pool = originals.length >= 2 ? originals : nonSelf.length > 0 ? nonSelf : rawRepos;

  const ranked = [...pool].sort((a, b) => {
    const scoreA = (a.stargazers_count ?? 0) * 10 + (a.forks_count ?? 0) * 3;
    const scoreB = (b.stargazers_count ?? 0) * 10 + (b.forks_count ?? 0) * 3;
    if (scoreB !== scoreA) return scoreB - scoreA;
    return (b.updated_at ?? "").localeCompare(a.updated_at ?? "");
  });

  const totalStars = rawRepos.reduce((sum, r) => sum + (r.stargazers_count ?? 0), 0);

  const langCounts = new Map<string, number>();
  for (const r of pool) {
    if (r.language) {
      langCounts.set(r.language, (langCounts.get(r.language) ?? 0) + 1 + Math.min(5, r.stargazers_count ?? 0));
    }
  }
  const topLanguages = Array.from(langCounts.entries())
    .sort((a, b) => b[1] - a[1])
    .slice(0, 3)
    .map(([lang]) => lang);

  const repos: GitHubRepoSummary[] = ranked.slice(0, 6).map((r) => ({
    id: r.name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "") || `repo-${r.id}`,
    name: r.name,
    description:
      (r.description ?? "").trim() ||
      `Open-source ${r.language || "software"} repository by @${user.login}.`,
    htmlUrl: r.html_url,
    homepage: normalizeUrl(r.homepage),
    language: r.language || "Code",
    stars: r.stargazers_count ?? 0,
    forks: r.forks_count ?? 0,
    license:
      r.license?.spdx_id && r.license.spdx_id !== "NOASSERTION" ? r.license.spdx_id : "OSS",
    updatedAt: r.updated_at ?? "",
    isFork: Boolean(r.fork),
  }));

  const avatarUrl = user.avatar_url ?? "";
  const pixelAvatar = await samplePixelAvatar(avatarUrl, 24);

  const profile: LiveProfileData = {
    username: user.login,
    displayName: (user.name ?? "").trim() || user.login,
    bio: (user.bio ?? "").trim() || "Software engineer & open-source builder on GitHub.",
    avatarUrl,
    pixelAvatar,
    htmlUrl: user.html_url || `https://github.com/${user.login}`,
    blog: normalizeUrl(user.blog),
    location: (user.location ?? "").trim() || "GitHub",
    followers: user.followers ?? 0,
    publicRepos: user.public_repos ?? rawRepos.length,
    totalStars,
    topLanguages: topLanguages.length ? topLanguages : ["TypeScript", "Python", "Rust"],
    repos,
    isDemo: false,
  };

  profileCache.set(key, profile);
  return profile;
}

export function createDemoProfileData(): LiveProfileData {
  return {
    username: "Furina-he",
    displayName: "NeverGiveUp",
    bio: "Indie Developer · AI Agent Guardrails, Desktop Companions & Interactive Systems",
    avatarUrl: "",
    pixelAvatar: null,
    htmlUrl: "https://github.com/Furina-he",
    blog: "https://cloudlink.blessc.com",
    location: "Local-First",
    followers: 42,
    publicRepos: 13,
    totalStars: 128,
    topLanguages: ["Rust", "TypeScript", "Python"],
    isDemo: true,
    repos: [
      {
        id: "cloudlink",
        name: "cloudlink",
        description: "Local infrastructure switchboard & guardrail for 20+ AI coding agents.",
        htmlUrl: "https://github.com/Furina-he/cloudlink",
        homepage: "https://cloudlink.blessc.com",
        language: "Rust",
        stars: 64,
        forks: 8,
        license: "MIT",
        updatedAt: "2026-11-20",
        isFork: false,
      },
      {
        id: "openpet",
        name: "OpenPet",
        description: "Resident desktop AI character companion with extensible skills & voice.",
        htmlUrl: "https://github.com/Furina-he/OpenPet",
        homepage: "https://openpet.myfurina.top",
        language: "TypeScript",
        stars: 41,
        forks: 5,
        license: "MIT",
        updatedAt: "2026-11-18",
        isFork: false,
      },
      {
        id: "gitskins",
        name: "gitskins",
        description: "Curated Light & Dark GitHub Profile SVG themes and DIY widgets for AI agents.",
        htmlUrl: "https://github.com/Furina-he/gitskins",
        homepage: "https://gitskins.blessc.com",
        language: "TypeScript",
        stars: 15,
        forks: 2,
        license: "MIT",
        updatedAt: "2026-11-26",
        isFork: false,
      },
      {
        id: "virtual",
        name: "virtual",
        description: "Offline 3D electrical & electronics circuit simulator with real-time analysis.",
        htmlUrl: "https://github.com/Furina-he/virtual",
        homepage: "",
        language: "TypeScript",
        stars: 8,
        forks: 1,
        license: "MIT",
        updatedAt: "2026-11-10",
        isFork: false,
      },
      {
        id: "openpet-market",
        name: "openpet-market",
        description: "Community registry and catalog for OpenPet character packs and plugins.",
        htmlUrl: "https://github.com/Furina-he/openpet-market",
        homepage: "",
        language: "TypeScript",
        stars: 4,
        forks: 0,
        license: "MIT",
        updatedAt: "2026-11-02",
        isFork: false,
      },
      {
        id: "carview",
        name: "carview",
        description: "Interactive real-time vehicle telemetry & 3D showcase workbench.",
        htmlUrl: "https://github.com/Furina-he/carview",
        homepage: "",
        language: "Python",
        stars: 3,
        forks: 0,
        license: "MIT",
        updatedAt: "2026-10-25",
        isFork: false,
      },
    ],
  };
}
