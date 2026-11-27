export interface RepoFeatureItem {
  tag: string;
  title: string;
  desc: string;
}

export interface RepoSkinData {
  owner: string;
  name: string;
  version: string;
  tagline: string;
  language: string;
  license: string;
  stars: number;
  forks: number;
  homepage: string;
  htmlUrl: string;
  topics: string[];
  installLabel: string;
  installCommand: string;
  installHint: string;
  features: RepoFeatureItem[];
  architecture: string;
  isDemo?: boolean;
}

export type FetchRepoErrorCode = "invalid" | "not-found" | "rate-limit" | "network";

export class GitHubRepoError extends Error {
  code: FetchRepoErrorCode;
  constructor(code: FetchRepoErrorCode, message: string) {
    super(message);
    this.code = code;
  }
}

export function createDefaultRepoData(): RepoSkinData {
  return {
    owner: "Furina-he",
    name: "gitskins",
    version: "v0.8.0",
    tagline:
      "11 Light & Dark SVG theme systems, 22 Bento & Zero-503 live widgets, Repo Skins, Agent SKILL.md, and zero-dep CLI.",
    language: "TypeScript",
    license: "MIT",
    stars: 148,
    forks: 24,
    homepage: "https://gitskins.blessc.com",
    htmlUrl: "https://github.com/Furina-he/gitskins",
    topics: ["svg-themes", "github-readme", "ai-agents", "bento-grid"],
    installLabel: "CLI QUICKSTART",
    installCommand: "node cli/gitskins.mjs init --mode repo --theme swiss-bauhaus-pixel",
    installHint: "NODE 18+ · ZERO DEPS",
    features: [
      {
        tag: "TOKENS",
        title: "11 Curated Aesthetic Systems",
        desc: "Swiss-Bauhaus, Blueprint, Zine, CRT, RPG, Seal Ink, Synth, PCB, Boarding Pass, Classic OS & Risograph.",
      },
      {
        tag: "XML-SAFE",
        title: "Strict Static SVG Output",
        desc: "Zero <script>, zero external web fonts, and prefers-reduced-motion built into every module.",
      },
      {
        tag: "BENTO",
        title: "4-Column 846px Grid Engine",
        desc: "Pixel-exact 204/418/632/846px blocks that compose seamlessly without GitHub line-wrap drift.",
      },
      {
        tag: "AGENT",
        title: "Native SKILL.md & CLI",
        desc: "Works out of the box with Claude Code, Codex, Cursor, Antigravity, and zero-dependency local scripts.",
      },
    ],
    architecture:
      "Repo Metadata | git / GitHub API -> Theme Tokens | Light + Dark JSON -> SVG Compiler | Strict XML 846px -> README.md | Zero-Runtime Assets",
    isDemo: true,
  };
}

export function parseRepoSlug(raw: string): { owner: string; repo: string } | null {
  const cleaned = raw
    .trim()
    .replace(/^https?:\/\/(www\.)?github\.com\//i, "")
    .replace(/^github\.com\//i, "")
    .replace(/\.git$/i, "")
    .replace(/^\/+|\/+$/g, "");
  const parts = cleaned.split("/").filter(Boolean);
  if (parts.length < 2) return null;
  const owner = parts[0];
  const repo = parts[1];
  const segRe = /^[A-Za-z0-9_.-]{1,100}$/;
  if (!segRe.test(owner) || !segRe.test(repo)) return null;
  return { owner, repo };
}

function inferInstall(
  owner: string,
  repo: string,
  language: string
): { label: string; command: string; hint: string } {
  const lang = language.toLowerCase();
  if (lang === "rust") {
    return { label: "CARGO", command: `cargo add ${repo}`, hint: "RUST · CRATES.IO" };
  }
  if (lang === "python") {
    return { label: "PIP", command: `pip install ${repo}`, hint: "PYTHON 3.10+" };
  }
  if (lang === "go") {
    return {
      label: "GO MODULE",
      command: `go get github.com/${owner}/${repo}`,
      hint: "GO 1.22+",
    };
  }
  if (lang === "typescript" || lang === "javascript") {
    return { label: "NPM / PNPM", command: `npm install ${repo}`, hint: "NODE 18+ · ESM" };
  }
  return {
    label: "GIT CLONE",
    command: `git clone https://github.com/${owner}/${repo}.git`,
    hint: `${language.toUpperCase() || "OSS"} · SOURCE`,
  };
}

export async function fetchGitHubRepo(rawInput: string): Promise<RepoSkinData> {
  const parsed = parseRepoSlug(rawInput);
  if (!parsed) {
    throw new GitHubRepoError("invalid", "Invalid owner/repo format.");
  }

  let res: Response;
  try {
    res = await fetch(`https://api.github.com/repos/${parsed.owner}/${parsed.repo}`, {
      headers: { Accept: "application/vnd.github+json" },
    });
  } catch {
    throw new GitHubRepoError("network", "Network error reaching GitHub API.");
  }

  if (res.status === 404) {
    throw new GitHubRepoError("not-found", "Repository not found.");
  }
  if (res.status === 403 || res.status === 429) {
    throw new GitHubRepoError("rate-limit", "GitHub API rate limit exceeded.");
  }
  if (!res.ok) {
    throw new GitHubRepoError("network", `GitHub API error (${res.status}).`);
  }

  const data = (await res.json()) as {
    name?: string;
    owner?: { login?: string };
    description?: string | null;
    language?: string | null;
    stargazers_count?: number;
    forks_count?: number;
    license?: { spdx_id?: string | null } | null;
    homepage?: string | null;
    html_url?: string;
    topics?: string[];
    default_branch?: string;
  };

  const owner = data.owner?.login || parsed.owner;
  const name = data.name || parsed.repo;
  const language = data.language || "Code";
  const license =
    data.license?.spdx_id && data.license.spdx_id !== "NOASSERTION"
      ? data.license.spdx_id
      : "OSS";
  const topics = Array.isArray(data.topics) && data.topics.length > 0
    ? data.topics.slice(0, 4)
    : [language.toLowerCase(), "open-source", license.toLowerCase()];
  const inferred = inferInstall(owner, name, language);
  const tagline =
    (data.description || "").trim() ||
    `Open-source ${language} repository maintained by @${owner}.`;

  return {
    owner,
    name,
    version: data.default_branch ? `${data.default_branch}` : "main",
    tagline,
    language,
    license,
    stars: data.stargazers_count ?? 0,
    forks: data.forks_count ?? 0,
    homepage: (data.homepage || "").trim(),
    htmlUrl: data.html_url || `https://github.com/${owner}/${name}`,
    topics,
    installLabel: inferred.label,
    installCommand: inferred.command,
    installHint: inferred.hint,
    features: [
      {
        tag: language.slice(0, 10).toUpperCase(),
        title: `Built with ${language}`,
        desc: `Clean, idiomatic ${language} core engineered for reliability and clarity.`,
      },
      {
        tag: topics[0] ? topics[0].slice(0, 10).toUpperCase() : "MODULAR",
        title: topics[0] ? `${topics[0]} Ready` : "Modular Architecture",
        desc: `Composable building blocks tailored around ${topics.slice(0, 2).join(" & ")}.`,
      },
      {
        tag: license.slice(0, 10).toUpperCase(),
        title: `${license} Open Source`,
        desc: `Community-friendly ${license} licensing with transparent source and issue tracking.`,
      },
      {
        tag: "DX",
        title: "Fast Local Onboarding",
        desc: `Start in seconds via "${inferred.command}" with minimal configuration overhead.`,
      },
    ],
    architecture: `Input | CLI / API -> ${name} Core | ${language} Engine -> Validation | Tests & Checks -> Output | Artifacts & Docs`,
    isDemo: false,
  };
}
