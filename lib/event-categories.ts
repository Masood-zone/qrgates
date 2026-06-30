type EventCategoryDefinition = {
  value: string;
  label: string;
  legacyValues?: readonly string[];
};

export const EVENT_CATEGORIES = [
  { value: "conference", label: "Conference" },
  { value: "concerts", label: "Concerts", legacyValues: ["concert"] },
  { value: "concert-party", label: "Concert-Party" },
  { value: "club-jams", label: "Club Jams", legacyValues: ["club-jam"] },
  { value: "workshop", label: "Workshop" },
] as const satisfies readonly EventCategoryDefinition[];

export type EventCategory = (typeof EVENT_CATEGORIES)[number]["value"];

const categoryByValue = new Map(
  EVENT_CATEGORIES.map((category) => [category.value, category]),
);

const legacyCategoryMap = new Map<string, EventCategory>();

EVENT_CATEGORIES.forEach((category) => {
  const legacyValues =
    "legacyValues" in category ? category.legacyValues : undefined;

  legacyValues?.forEach((legacyValue: string) => {
    legacyCategoryMap.set(legacyValue, category.value);
  });
});

export function normalizeEventCategory(value: unknown): EventCategory | null {
  if (typeof value !== "string") return null;

  const normalized = value.trim().toLowerCase();
  if (categoryByValue.has(normalized as EventCategory)) {
    return normalized as EventCategory;
  }

  return legacyCategoryMap.get(normalized) ?? null;
}

export function getCategoryFilterValues(value: unknown): string[] {
  const normalized = normalizeEventCategory(value);
  if (!normalized) return [];

  const category = categoryByValue.get(normalized);
  const legacyValues =
    category && "legacyValues" in category ? category.legacyValues : [];
  return [normalized, ...legacyValues];
}

export function getEventCategoryLabel(value: unknown) {
  const normalized = normalizeEventCategory(value);
  if (!normalized) return typeof value === "string" ? value : "";

  return categoryByValue.get(normalized)?.label ?? normalized;
}
