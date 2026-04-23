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

    const queryLower = query.toLowerCase();
    const queryWords = queryLower.split(/\s+/).filter(Boolean);
    const toolMatches: (SearchSuggestion & { score: number })[] = [];
    const categoryMatches: (SearchSuggestion & { score: number })[] = [];

    // Adaptive search: analyze query to determine search strategy
    const isToolName = query.length > 2 && !queryLower.includes('how') && !queryLower.includes('what');
    const isActionBased = queryLower.includes('to ') || queryLower.includes('convert') || queryLower.includes('remove') || queryLower.includes('compress') || queryLower.includes('resize');

    // Search ALL tools with comprehensive matching
    allTools.forEach((tool) => {
      const titleLower = tool.title.toLowerCase();
      const descLower = tool.description.toLowerCase();
      const catLower = tool.category.toLowerCase();

      let score = 0;

      // ===== TITLE MATCHING (Highest Priority) =====
      if (titleLower === queryLower) {
        score = 10000; // Exact match
      } else if (titleLower.startsWith(queryLower)) {
        score = 5000; // Starts with
      } else if (queryWords.length > 1 && queryWords.every(w => titleLower.includes(w))) {
        score = 4000; // All words in title
      } else if (titleLower.includes(queryLower)) {
        score = 3000; // Contains query
      }

      // ===== WORD-BY-WORD MATCHING =====
      if (score === 0 && queryWords.length > 0) {
        const titleWords = titleLower.split(/\s+/);
        const matchedWords = queryWords.filter(qw => titleWords.some(tw => tw.includes(qw)));
        if (matchedWords.length > 0) {
          score = 2500 + (matchedWords.length * 100);
        }
      }

      // ===== DESCRIPTION MATCHING =====
      if (score < 2000) {
        if (queryWords.length > 0 && queryWords.every(w => descLower.includes(w))) {
          score = Math.max(score, 1500);
        } else if (descLower.includes(queryLower)) {
          score = Math.max(score, 1000);
        } else if (queryWords.some(w => descLower.includes(w))) {
          const matchedDesc = queryWords.filter(w => descLower.includes(w));
          score = Math.max(score, 800 + (matchedDesc.length * 50));
        }
      }

      // ===== CATEGORY MATCHING =====
      if (catLower === queryLower) {
        score = Math.max(score, 500);
      } else if (catLower.includes(queryLower)) {
        score = Math.max(score, 200);
      }

      // ===== ACTION-BASED ADAPTIVE SEARCH =====
      if (isActionBased) {
        // User searching for actions like "convert jpg", "remove background", etc.
        const actionWords = queryLower.split(/\s+/).slice(1); // Get words after first word
        if (actionWords.some(w => titleLower.includes(w) || descLower.includes(w))) {
          score = Math.max(score, 2200);
        }
      }

      if (score > 0) {
        toolMatches.push({
          id: tool.id,
          title: tool.title,
          description: tool.description,
          category: tool.category,
          route: tool.route,
          type: 'tool',
          score,
        });
      }
    });

    // Get unique categories that match
    const uniqueCategories = new Map<string, number>();
    allTools.forEach((tool) => {
      if (tool.category.toLowerCase().includes(queryLower)) {
        const catLower = tool.category.toLowerCase();
        const score = catLower === queryLower ? 1000 : 500;
        if (!uniqueCategories.has(tool.category) || uniqueCategories.get(tool.category)! < score) {
          uniqueCategories.set(tool.category, score);
        }
      }
    });

    categoryMatches.push(
      ...Array.from(uniqueCategories.entries()).map(([category, score]) => ({
        id: `category-${category}`,
        title: category,
        description: `Browse ${category} tools`,
        category: 'Category',
        type: 'category' as const,
        score,
      }))
    );

    // Sort by score (highest first) - this ensures best matches appear first
    const sorted = [
      ...categoryMatches.sort((a, b) => b.score - a.score),
      ...toolMatches.sort((a, b) => b.score - a.score),
    ];

    // Remove score before returning and apply limit if provided
    const result = sorted.slice(0, limit || sorted.length).map(({ score, ...item }) => item);
    return result;
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
