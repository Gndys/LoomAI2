export type ImageHistoryFeature =
  | "imageGenerate"
  | "clothesSplit"
  | "clothesSketch"
  | "clothesNanoRetouch"
  | "clothesPromo"
  | "patternMaking";

export type ImageHistoryEntry = {
  id: string;
  imageUrl: string;
  prompt: string;
  model: string;
  provider?: string;
  feature?: ImageHistoryFeature;
  createdAt: string;
};

const HISTORY_KEY = "loomai.imageHistory";
const HISTORY_LIMIT = 20;

const isBrowser = () => typeof window !== "undefined";

const buildId = () => {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) {
    return crypto.randomUUID();
  }
  return `img_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 8)}`;
};

const isValidEntry = (value: unknown): value is ImageHistoryEntry => {
  if (!value || typeof value !== "object") return false;
  const entry = value as ImageHistoryEntry;
  if (typeof entry.id !== "string") return false;
  if (typeof entry.imageUrl !== "string") return false;
  if (typeof entry.prompt !== "string") return false;
  if (typeof entry.model !== "string") return false;
  if (typeof entry.createdAt !== "string") return false;
  if (entry.provider && typeof entry.provider !== "string") return false;
  if (entry.feature && typeof entry.feature !== "string") return false;
  return true;
};

const persistHistory = (items: ImageHistoryEntry[]) => {
  if (!isBrowser()) return;
  let trimmed = items;
  while (trimmed.length > 0) {
    try {
      localStorage.setItem(HISTORY_KEY, JSON.stringify(trimmed));
      return;
    } catch {
      trimmed = trimmed.slice(0, trimmed.length - 1);
    }
  }
  try {
    localStorage.removeItem(HISTORY_KEY);
  } catch {
    // Ignore storage errors
  }
};

export const getImageHistory = (): ImageHistoryEntry[] => {
  if (!isBrowser()) return [];
  try {
    const raw = localStorage.getItem(HISTORY_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];
    return parsed.filter(isValidEntry);
  } catch {
    return [];
  }
};

export const addImageHistoryEntry = (entry: {
  imageUrl: string;
  prompt: string;
  model: string;
  provider?: string;
  feature?: ImageHistoryFeature;
  createdAt?: string;
}): ImageHistoryEntry | null => {
  if (!isBrowser()) return null;
  const prompt = entry.prompt?.trim();
  if (!entry.imageUrl || !prompt || !entry.model) return null;

  const nextEntry: ImageHistoryEntry = {
    id: buildId(),
    imageUrl: entry.imageUrl,
    prompt,
    model: entry.model,
    provider: entry.provider,
    feature: entry.feature,
    createdAt: entry.createdAt || new Date().toISOString(),
  };

  const current = getImageHistory();
  const deduped = current.filter((item) => item.imageUrl !== nextEntry.imageUrl);
  const next = [nextEntry, ...deduped].slice(0, HISTORY_LIMIT);
  persistHistory(next);
  return nextEntry;
};

export const clearImageHistory = () => {
  if (!isBrowser()) return;
  try {
    localStorage.removeItem(HISTORY_KEY);
  } catch {
    // Ignore storage errors
  }
};
