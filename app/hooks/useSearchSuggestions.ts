import { useMemo, useState, useCallback } from 'react';
import { getSearchResults } from '@/app/lib/search-index';

export interface SearchSuggestion {
  id: string;
  title: string;
  description: string;
  category: string;
  href?: string;
  route?: string;
  type: 'tool' | 'category' | 'recent';
}

const STORAGE_KEY = 'simplifyconvert_search_history';

/**
 * Adaptive search hook that returns ALL matching tools
 * Results are sorted by relevance based on user query patterns
 */
export function useSearchSuggestions(query: string, limit?: number) {
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
      // Return recent searches when empty
      return recentSearches.slice(0, 5).map((search) => ({
        id: `recent-${search}`,
        title: search,
        description: 'Recent search',
        category: 'Recent',
        type: 'recent' as const,
      }));
    }

    return getSearchResults(query, limit);
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
