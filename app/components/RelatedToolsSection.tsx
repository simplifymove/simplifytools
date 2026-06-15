import Link from 'next/link';
import {
  getRelatedTools,
  RelatedToolFamily,
  RelatedToolItem,
} from '@/app/lib/related-tools';

interface RelatedToolsSectionProps {
  family?: RelatedToolFamily;
  toolId?: string;
  tools?: RelatedToolItem[];
  title?: string;
  description?: string;
  limit?: number;
  className?: string;
}

export function RelatedToolsSection({
  family,
  toolId,
  tools,
  title = 'Related Tools',
  description = 'Explore related tools that can help with the same workflow.',
  limit = 8,
  className = '',
}: RelatedToolsSectionProps) {
  const relatedTools = tools || (family && toolId ? getRelatedTools({ family, toolId, limit }) : []);

  if (relatedTools.length === 0) {
    return null;
  }

  return (
    <section className={`bg-white rounded-xl shadow-lg border border-gray-200 p-8 ${className}`}>
      <h2 className="text-3xl font-bold text-gray-900 mb-3">{title}</h2>
      {description && <p className="text-gray-700 mb-6">{description}</p>}
      <div className="grid md:grid-cols-2 gap-4">
        {relatedTools.map((tool) => (
          <Link
            key={`${tool.family}-${tool.id}`}
            href={tool.route}
            className="group p-4 bg-gradient-to-br from-gray-50 to-gray-100 rounded-lg border border-gray-200 hover:border-blue-300 hover:shadow-md transition"
          >
            <h3 className="font-semibold text-gray-900 group-hover:text-blue-600 mb-1">
              {tool.title}
            </h3>
            <p className="text-gray-600 text-sm">{tool.description}</p>
          </Link>
        ))}
      </div>
    </section>
  );
}
