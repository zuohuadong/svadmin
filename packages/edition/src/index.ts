/**
 * @svadmin/edition
 *
 * 多版本/多租户白标配置层。
 * 允许运行时从服务端加载品牌配置 (标题、Logo、导航标签、技能列表等)。
 */

export type EditionName = "oss" | "cnb" | string;

export type NavRoute = string;

export interface EditionSkill {
  id: string;
  name: string;
  description?: string;
  category?: string;
  path?: string;
  enabled: boolean;
}

export interface EditionConfig {
  edition: EditionName;
  appTitle: string;
  appSubtitle: string;
  loginTitle: string;
  loginSubtitle: string;
  logoText: string;
  logoUrl: string;
  footerNote: string;
  navLabels: Partial<Record<NavRoute, string>>;
  skills: EditionSkill[];
  /** 自定义扩展字段 */
  extra?: Record<string, unknown>;
}

export const defaultEditionConfig: EditionConfig = {
  edition: "oss",
  appTitle: "SvAdmin",
  appSubtitle: "Headless Admin Framework",
  loginTitle: "SvAdmin",
  loginSubtitle: "Svelte 5 Headless Admin",
  logoText: "S",
  logoUrl: "",
  footerNote: "",
  navLabels: {},
  skills: [],
};

function stringValue(value: unknown, fallback: string): string {
  return typeof value === "string" && value.trim() ? value : fallback;
}

function normalizeSkill(value: unknown): EditionSkill | null {
  if (!value || typeof value !== "object") return null;
  const item = value as Record<string, unknown>;
  const id = stringValue(item.id, "");
  const name = stringValue(item.name, id);
  if (!id || !name) return null;
  return {
    id,
    name,
    description: typeof item.description === "string" ? item.description : undefined,
    category: typeof item.category === "string" ? item.category : undefined,
    path: typeof item.path === "string" ? item.path : undefined,
    enabled: item.enabled === undefined ? true : item.enabled !== false,
  };
}

function normalizeNavLabels(
  value: unknown,
  knownRoutes?: readonly NavRoute[],
): Partial<Record<NavRoute, string>> {
  if (!value || typeof value !== "object") return {};
  const source = value as Record<string, unknown>;
  const labels: Partial<Record<NavRoute, string>> = {};
  if (knownRoutes) {
    for (const route of knownRoutes) {
      if (typeof source[route] === "string") labels[route] = source[route];
    }
  } else {
    for (const [key, val] of Object.entries(source)) {
      if (typeof val === "string") labels[key] = val;
    }
  }
  return labels;
}

/**
 * 防御性解析任意输入为 EditionConfig。
 * 缺失字段自动 fallback，非法值安全忽略。
 */
export function normalizeEditionConfig(
  input: unknown,
  fallback: EditionConfig = defaultEditionConfig,
  knownRoutes?: readonly NavRoute[],
): EditionConfig {
  const source = input && typeof input === "object" ? input as Record<string, unknown> : {};
  const skills = Array.isArray(source.skills)
    ? source.skills.map(normalizeSkill).filter((s): s is EditionSkill => Boolean(s))
    : fallback.skills;

  return {
    edition: stringValue(source.edition, fallback.edition),
    appTitle: stringValue(source.appTitle, fallback.appTitle),
    appSubtitle: stringValue(source.appSubtitle, fallback.appSubtitle),
    loginTitle: stringValue(source.loginTitle, fallback.loginTitle),
    loginSubtitle: stringValue(source.loginSubtitle, fallback.loginSubtitle),
    logoText: stringValue(source.logoText, fallback.logoText),
    logoUrl: typeof source.logoUrl === "string" ? source.logoUrl : fallback.logoUrl,
    footerNote: stringValue(source.footerNote, fallback.footerNote),
    navLabels: { ...fallback.navLabels, ...normalizeNavLabels(source.navLabels, knownRoutes) },
    skills,
    extra: typeof source.extra === "object" && source.extra !== null
      ? source.extra as Record<string, unknown>
      : fallback.extra,
  };
}

/**
 * 从服务端 API 获取 edition 配置。
 * 默认请求 /api/edition 端点。
 */
export async function fetchEditionConfig(
  endpoint = "/api/edition",
): Promise<EditionConfig> {
  try {
    const res = await fetch(endpoint, {
      headers: { Accept: "application/json" },
    });
    if (!res.ok) return defaultEditionConfig;
    return normalizeEditionConfig(await res.json());
  } catch {
    return defaultEditionConfig;
  }
}
