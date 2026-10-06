// src/utils/skills.ts

export interface Skill {
  id?: number;
  name: string;
  category: string;
  order_index?: number;
}

/**
 * Groups any collection of skill records by their category property.
 */
export function groupSkillsByCategory<T extends { category?: string }>(
  skills: T[] | null | undefined
): Record<string, T[]> {
  const grouped: Record<string, T[]> = {};
  if (!skills) return grouped;

  for (const item of skills) {
    const category = item.category?.trim() || 'General';
    if (!grouped[category]) {
      grouped[category] = [];
    }
    grouped[category].push(item);
  }

  return grouped;
}

/**
 * Extracts and sorts unique categories from a collection of skills.
 */
export function extractUniqueCategories(
  skills: Array<{ category?: string }> | null | undefined
): string[] {
  if (!skills) return [];
  const categories = skills.map((s) => s.category?.trim()).filter(Boolean) as string[];
  return Array.from(new Set(categories)).sort();
}
