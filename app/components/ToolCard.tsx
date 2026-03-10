import React from 'react';
import { LucideIcon } from 'lucide-react';
import Link from 'next/link';

interface ToolCardProps {
  icon: LucideIcon;
  title: string;
  description: string;
  category: string;
  href: string;
}

export const ToolCard: React.FC<ToolCardProps> = ({
  icon: Icon,
  title,
  description,
  category,
  href,
}) => {
  return (
    <Link href={href}>
      <div className="group cursor-pointer bg-white border border-gray-200 rounded-lg p-5 hover:shadow-md transition-shadow duration-200">
        <div className="flex items-start gap-3">
          <div className="flex-shrink-0">
            <Icon className="w-8 h-8 text-blue-500" />
          </div>
          <div className="flex-1">
            <h3 className="text-sm font-semibold text-gray-900 mb-1 group-hover:text-blue-600 transition-colors">
              {title}
            </h3>
            <p className="text-xs text-red-500 font-medium mb-2">Image Tools</p>
            <p className="text-xs text-gray-600 leading-relaxed">{description}</p>
          </div>
        </div>
      </div>
    </Link>
  );
};
