'use client';

import React, { useRef, useEffect, useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { Search, Clock, Sparkles, X } from 'lucide-react';
import { useSearchSuggestions } from '@/app/hooks/useSearchSuggestions';
import { getBestSearchResult } from '@/app/lib/search-index';
import { motion, AnimatePresence } from 'framer-motion';

function getSuggestionHref(suggestion: any) {
  return suggestion.href || suggestion.route;
}

function getSuggestionDedupeKey(suggestion: any) {
  return getSuggestionHref(suggestion) || `${suggestion.type}-${suggestion.id}`;
}

function dedupeSuggestions<T extends { type: string; id: string; href?: string; route?: string }>(
  suggestions: T[]
) {
  const seen = new Set<string>();
  const deduped: T[] = [];

  suggestions.forEach((suggestion) => {
    const key = getSuggestionDedupeKey(suggestion);
    if (seen.has(key)) return;

    seen.add(key);
    deduped.push(suggestion);
  });

  return deduped;
}

interface SearchBoxProps {
  onSearch: (query: string) => void;
  placeholder?: string;
  className?: string;
  showSuggestions?: boolean;
  variant?: 'header' | 'hero';
  onClose?: () => void;
  limit?: number;
}

export function SearchBox({
  onSearch,
  placeholder = 'Search tools...',
  className = '',
  showSuggestions = true,
  variant = 'header',
  onClose,
  limit,
}: SearchBoxProps) {
  const router = useRouter();
  const [query, setQuery] = useState('');
  const [isOpen, setIsOpen] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(-1);
  const inputRef = useRef<HTMLInputElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  // For header: show 8 in dropdown, for all-tools: show more
  const displayLimit = limit || (variant === 'header' ? 8 : undefined);
  const { suggestions, addRecentSearch } = useSearchSuggestions(query, displayLimit);
  const displayedSuggestions = React.useMemo(
    () => (showSuggestions ? dedupeSuggestions(suggestions) : []),
    [showSuggestions, suggestions]
  );

  // Close on outside click
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
        setSelectedIndex(-1);
      }
    }

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Keyboard navigation
  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent<HTMLInputElement>) => {
      if (!isOpen || displayedSuggestions.length === 0) {
        if (e.key === 'Enter') {
          e.preventDefault();
          handleSearch(query);
        }
        return;
      }

      switch (e.key) {
        case 'ArrowDown':
          e.preventDefault();
          setSelectedIndex((prev) => (prev < displayedSuggestions.length - 1 ? prev + 1 : prev));
          break;
        case 'ArrowUp':
          e.preventDefault();
          setSelectedIndex((prev) => (prev > 0 ? prev - 1 : -1));
          break;
        case 'Enter':
          e.preventDefault();
          if (selectedIndex >= 0) {
            handleSelectSuggestion(displayedSuggestions[selectedIndex]);
          } else {
            handleSearch(query);
          }
          break;
        case 'Escape':
          e.preventDefault();
          setIsOpen(false);
          setSelectedIndex(-1);
          break;
      }
    },
    [isOpen, displayedSuggestions, selectedIndex, query]
  );

  const handleSearch = (searchQuery: string) => {
    if (searchQuery.trim()) {
      addRecentSearch(searchQuery);
      const bestMatch = getBestSearchResult(searchQuery);
      if (bestMatch?.route) {
        router.push(bestMatch.route);
        onClose?.();
        setQuery('');
        setIsOpen(false);
        setSelectedIndex(-1);
        return;
      }

      onSearch(searchQuery);
      setQuery('');
      setIsOpen(false);
      setSelectedIndex(-1);
      onClose?.();
    }
  };

  const handleSelectSuggestion = (suggestion: any) => {
    const href = getSuggestionHref(suggestion);

    if (href) {
      addRecentSearch(suggestion.title);
      router.push(href);
      onClose?.();
    } else if (suggestion.type === 'tool') {
      addRecentSearch(suggestion.title);
      handleSearch(suggestion.title);
    } else if (suggestion.type === 'category') {
      handleSearch(suggestion.title);
    } else if (suggestion.type === 'recent') {
      handleSearch(suggestion.title);
    }
    setQuery('');
    setIsOpen(false);
    setSelectedIndex(-1);
  };

  const handleClear = () => {
    setQuery('');
    inputRef.current?.focus();
  };

  const containerClass =
    variant === 'hero'
      ? 'flex items-center gap-3 px-6 py-4 bg-white rounded-full shadow-lg border border-gray-200'
      : 'flex items-center gap-2 px-4 py-2 rounded-full bg-gray-50 border border-gray-200 hover:border-gray-300';

  return (
    <div ref={containerRef} className={`relative w-full ${className}`}>
      <div className={containerClass}>
        <Search size={variant === 'hero' ? 20 : 18} className="text-gray-400 shrink-0" />
        <input
          ref={inputRef}
          type="text"
          placeholder={placeholder}
          value={query}
          onChange={(e) => {
            setQuery(e.target.value);
            setIsOpen(true);
            setSelectedIndex(-1);
          }}
          onFocus={() => {
            setIsOpen(true);
            setSelectedIndex(-1);
          }}
          onKeyDown={handleKeyDown}
          className={`flex-1 bg-transparent outline-none text-gray-900 placeholder-gray-500 ${
            variant === 'hero' ? 'text-base font-medium' : 'text-sm'
          }`}
        />
        {query && (
          <button
            onClick={handleClear}
            className="text-gray-400 hover:text-gray-600 transition shrink-0"
            aria-label="Clear search"
          >
            <X size={18} />
          </button>
        )}
      </div>

      {/* Suggestions Dropdown */}
      <AnimatePresence>
        {isOpen && displayedSuggestions.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.15 }}
            className={`absolute left-0 top-full mt-2 bg-white rounded-xl shadow-xl border border-gray-200 z-50 overflow-hidden ${
              variant === 'hero' ? 'w-96 md:w-full' : 'w-96'
            }`}
          >
            <div className="max-h-96 overflow-y-auto">
              {/* Group by type */}
              {displayedSuggestions.length > 0 && (
                <div className="py-1">
                  {displayedSuggestions.map((suggestion, index) => (
                    <motion.button
                      key={`${suggestion.type}-${suggestion.id}-${suggestion.href ?? 'no-href'}`}
                      onClick={() => handleSelectSuggestion(suggestion)}
                      onMouseEnter={() => setSelectedIndex(index)}
                      disabled={suggestion.type !== 'recent' && !getSuggestionHref(suggestion)}
                      className={`w-full px-4 py-3 text-left transition-colors ${
                        selectedIndex === index
                          ? 'bg-orange-50 border-l-4 border-orange-500'
                          : suggestion.type !== 'recent' && !getSuggestionHref(suggestion)
                            ? 'cursor-default opacity-70'
                            : 'hover:bg-gray-50'
                      }`}
                      whileHover={{ x: 4 }}
                    >
                      <div className="flex items-start gap-3">
                        <div className="mt-1 shrink-0">
                          {suggestion.type === 'recent' && (
                            <Clock size={16} className="text-gray-400" />
                          )}
                          {suggestion.type === 'category' && (
                            <Sparkles size={16} className="text-orange-500" />
                          )}
                          {suggestion.type === 'tool' && (
                            <Search size={16} className="text-blue-500" />
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="text-sm font-medium text-gray-900 line-clamp-1">
                            {suggestion.title}
                          </div>
                          <div className="text-xs text-gray-500 line-clamp-1">
                            {suggestion.description}
                          </div>
                        </div>
                        <div className="shrink-0">
                          <span className="text-xs font-medium px-2 py-1 bg-gray-100 text-gray-600 rounded">
                            {suggestion.category}
                          </span>
                        </div>
                      </div>
                    </motion.button>
                  ))}
                </div>
              )}

              {query.trim() && displayedSuggestions.length > 0 && (
                <div className="px-4 py-3 border-t border-gray-100 bg-gray-50 space-y-2">
                  <button
                    onClick={() => handleSearch(query)}
                    className="w-full text-sm font-semibold text-orange-600 hover:text-orange-700 transition py-1.5"
                  >
                    🔍 See all results for "{query}"
                  </button>
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Empty State */}
      {isOpen && query.trim() && displayedSuggestions.length === 0 && (
        <motion.div
          initial={{ opacity: 0, y: -8 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -8 }}
          className="absolute left-0 right-0 top-full mt-2 bg-white rounded-xl shadow-xl border border-gray-200 z-50 p-4"
        >
          <div className="text-center">
            <p className="text-sm text-gray-600">No results found for "{query}"</p>
            <p className="text-xs text-gray-500 mt-1">Try searching for a different tool or category</p>
          </div>
        </motion.div>
      )}
    </div>
  );
}
