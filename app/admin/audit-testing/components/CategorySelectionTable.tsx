'use client';

import { useState } from 'react';
import { ChevronDown, ChevronUp } from 'lucide-react';

interface Category {
  id: string;
  name: string;
  toolsCount: number;
  estimatedTests: number;
  configured?: boolean;
  lastRun?: string;
  lastStatus?: string;
}

interface Props {
  categories: Category[];
  selectedCategories: string[];
  onToggle: (categoryId: string) => void;
  onSelectAll: () => void;
  onClearAll: () => void;
}

export function CategorySelectionTable({
  categories,
  selectedCategories,
  onToggle,
  onSelectAll,
  onClearAll,
}: Props) {
  const [sortBy, setSortBy] = useState<'name' | 'tests'>('name');

  const sortedCategories = [...categories].sort((a, b) => {
    if (sortBy === 'name') {
      return a.name.localeCompare(b.name);
    } else {
      return b.estimatedTests - a.estimatedTests;
    }
  });

  return (
    <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
      {/* Header */}
      <div className="px-6 py-4 bg-gray-50 border-b border-gray-200 flex items-center justify-between">
        <h3 className="text-sm font-semibold text-gray-900">Category Selection</h3>
        <div className="flex gap-2">
          <button
            onClick={onSelectAll}
            className="text-xs px-3 py-1.5 bg-blue-50 text-blue-600 hover:bg-blue-100 rounded transition font-medium"
          >
            Select All
          </button>
          <button
            onClick={onClearAll}
            className="text-xs px-3 py-1.5 bg-gray-100 text-gray-600 hover:bg-gray-200 rounded transition font-medium"
          >
            Clear All
          </button>
        </div>
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-gray-50 border-b border-gray-200">
            <tr>
              <th className="px-6 py-3 text-left">
                <input
                  type="checkbox"
                  checked={selectedCategories.length === categories.filter((category) => category.configured !== false).length}
                  onChange={(e) => (e.target.checked ? onSelectAll() : onClearAll())}
                  className="w-4 h-4 text-blue-600 rounded"
                />
              </th>
              <th
                className="px-6 py-3 text-left text-xs font-medium text-gray-700 cursor-pointer hover:text-gray-900"
                onClick={() => setSortBy(sortBy === 'name' ? 'tests' : 'name')}
              >
                <div className="flex items-center gap-2">
                  Category
                  {sortBy === 'name' && <ChevronDown size={14} />}
                </div>
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-700">Tools</th>
              <th
                className="px-6 py-3 text-left text-xs font-medium text-gray-700 cursor-pointer hover:text-gray-900"
                onClick={() => setSortBy(sortBy === 'tests' ? 'name' : 'tests')}
              >
                <div className="flex items-center gap-2">
                  Tests
                  {sortBy === 'tests' && <ChevronDown size={14} />}
                </div>
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-700">Last Run</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-700">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {sortedCategories.map((category) => {
              const configured = category.configured !== false;
              return (
              <tr
                key={category.id}
                className={`transition ${configured ? 'hover:bg-gray-50 cursor-pointer' : 'bg-gray-50 opacity-70 cursor-not-allowed'}`}
                onClick={() => configured && onToggle(category.id)}
              >
                <td className="px-6 py-4" onClick={(e) => e.stopPropagation()}>
                  <input
                    type="checkbox"
                    checked={selectedCategories.includes(category.id)}
                    disabled={!configured}
                    onChange={() => configured && onToggle(category.id)}
                    className="w-4 h-4 text-blue-600 rounded"
                  />
                </td>
                <td className="px-6 py-4">
                  <div className="text-sm font-medium text-gray-900">{category.name}</div>
                  {!configured && <div className="text-xs text-red-600 mt-1">Not configured</div>}
                </td>
                <td className="px-6 py-4">
                  <span className="text-sm text-gray-600">{category.toolsCount}</span>
                </td>
                <td className="px-6 py-4">
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                    {category.estimatedTests} tests
                  </span>
                </td>
                <td className="px-6 py-4">
                  <span className="text-sm text-gray-600">
                    {category.lastRun ? new Date(category.lastRun).toLocaleDateString() : 'Never'}
                  </span>
                </td>
                <td className="px-6 py-4">
                  {category.lastStatus && (
                    <span
                      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                        category.lastStatus === 'PASSED'
                          ? 'bg-green-100 text-green-800'
                          : category.lastStatus === 'FAILED'
                          ? 'bg-red-100 text-red-800'
                          : 'bg-gray-100 text-gray-800'
                      }`}
                    >
                      {category.lastStatus}
                    </span>
                  )}
                </td>
              </tr>
            );
            })}
          </tbody>
        </table>
      </div>

      {/* Footer Summary */}
      <div className="px-6 py-3 bg-gray-50 border-t border-gray-200">
        <div className="text-sm text-gray-600">
          <span className="font-medium">{selectedCategories.length}</span> of{' '}
          <span className="font-medium">{categories.length}</span> categories selected •{' '}
          <span className="font-medium">
            {sortedCategories
              .filter((c) => selectedCategories.includes(c.id))
              .reduce((sum, c) => sum + c.estimatedTests, 0)}
          </span>{' '}
          total tests
        </div>
      </div>
    </div>
  );
}
