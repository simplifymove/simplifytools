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

export function useSearchSuggestions(query: string, limit: number = 20) {
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
      // Return recent searches
      return recentSearches.slice(0, 5).map((search) => ({
        id: `recent-${search}`,
        title: search,
        description: 'Recent search',
        category: 'Recent',
        type: 'recent' as const,
      }));
    }

    const queryLower = query.toLowerCase();
    const toolMatches: SearchSuggestion[] = [];
    const categoryMatches: SearchSuggestion[] = [];

    // Search in tools - match against title, description, and category
    allTools.forEach((tool) => {
      const titleLower = tool.title.toLowerCase();
      const descLower = tool.description.toLowerCase();
      const catLower = tool.category.toLowerCase();

      // Check for matches with different priority levels
      let matchScore = 0;
      
      // Exact title match gets highest priority
      if (titleLower === queryLower) matchScore = 1000;
      // Title starts with query
      else if (titleLower.startsWith(queryLower)) matchScore = 500;
      // Title contains query
      else if (titleLower.includes(queryLower)) matchScore = 300;
      // Description contains query
      else if (descLower.includes(queryLower)) matchScore = 200;
      // Category contains query (but don't add as tool match, handle separately)
      else if (catLower.includes(queryLower)) matchScore = 100;

      if (matchScore > 0) {
        toolMatches.push({
          id: tool.id,
          title: tool.title,
          description: tool.description,
          category: tool.category,
          route: tool.route,
          type: 'tool',
        });
        // Store score for sorting
        (toolMatches[toolMatches.length - 1] as any).score = matchScore;
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

    // Sort by priority: exact matches first, then by score
    const sorted = [
      // Categories that exactly match
      ...categoryMatches.filter((m) => m.title.toLowerCase() === queryLower),
      // Tools sorted by score (highest first)
      ...toolMatches.sort((a, b) => ((b as any).score || 0) - ((a as any).score || 0)),
      // Other categories
      ...categoryMatches.filter((m) => m.title.toLowerCase() !== queryLower),
    ];

    // Remove score property before returning
    return sorted.slice(0, limit).map(({ ...item }: any) => {
      const { score, ...rest } = item;
      return rest;
    });
  }, [query, recentSearches, limit]);

  const addRecentSearch = useCallback((search: string) => {
    if (!search.trim()) return;

    setRecentSearches((prev) => {
      const filtered = prev.filter((item) => item.toLowerCase() !== search.toLowerCase());
      const updated = [search, ...filtered].slice(0, 10);

      if (typeof window !== 'undefined') {
        try {
          localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));

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
