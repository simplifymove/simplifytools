import { useMemo, useState, useCallback } from 'react';
import { allTools } from '@/app/data/tools';

export interface SearchSuggestion {
  id: string;
  title: string;
  description: string;
  category: string;
  route?: string;
  type: 'tool' | 'category' | 'recent';
}

const STORAGE_KEY = 'simplifyconvert_search_history';

export function useSearchSuggestions(query: string, limit: number = 8) {
  const [recentSearches, setRecentSearches] = useState<string[]>(() => {
    if (typeof window === 'undefined') return [];
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      return stored ? JSON.parse(stored) : [];
    } catch {
      return [];
    }
  });

  const suggestions = useMemo(() => {
    if (!query.trim()) {
      // Return recent searches and popular categories
      return [
        ...recentSearches.slice(0, 3).map((search) => ({
          id: `recent-${search}`,
          title: search,
          description: 'Recent search',
          category: 'Recent',
          type: 'recent' as const,
        })),
      ];
    }

    const queryLower = query.toLowerCase();
    const toolMatches: SearchSuggestion[] = [];
    const categoryMatches: SearchSuggestion[] = [];

    // Search in tools
    allTools.forEach((tool) => {
      const titleMatch = tool.title.toLowerCase().includes(queryLower);
      const descMatch = tool.description.toLowerCase().includes(queryLower);
      const categoryMatch = tool.category.toLowerCase().includes(queryLower);

      if (titleMatch || descMatch || categoryMatch) {
        toolMatches.push({
          id: tool.id,
          title: tool.title,
          description: tool.description,
          category: tool.category,
          route: tool.route,
          type: 'tool',
        });
      }
    });

    // Get unique categories that match
    const uniqueCategories = new Map<string, string>();
    allTools.forEach((tool) => {
      if (tool.category.toLowerCase().includes(queryLower)) {
        uniqueCategories.set(tool.category, tool.category);
      }
    });

    categoryMatches.push(
      ...Array.from(uniqueCategories.values()).map((category) => ({
        id: `category-${category}`,
        title: category,
        description: `Browse ${category} tools`,
        category: 'Category',
        type: 'category' as const,
      }))
    );

    // Return sorted results - exact matches first, then partial matches
    const sorted = [
      ...categoryMatches.filter((m) => m.title.toLowerCase() === queryLower),
      ...toolMatches.filter((m) => m.title.toLowerCase().startsWith(queryLower)),
      ...toolMatches.filter((m) => !m.title.toLowerCase().startsWith(queryLower)),
      ...categoryMatches.filter((m) => m.title.toLowerCase() !== queryLower),
    ];

    return sorted.slice(0, limit);
  }, [query, recentSearches, limit]);

  const addRecentSearch = useCallback((search: string) => {
    if (!search.trim()) return;

    setRecentSearches((prev) => {
      const filtered = prev.filter((item) => item.toLowerCase() !== search.toLowerCase());
      const updated = [search, ...filtered].slice(0, 10);

      if (typeof window !== 'undefined') {
        try {
          localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
        } catch {
          // Storage error, ignore
        }
      }

      return updated;
    });
  }, []);

  return { suggestions, addRecentSearch, recentSearches };
}
