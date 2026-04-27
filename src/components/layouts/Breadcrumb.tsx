'use client';

import { usePathname } from 'next/navigation';
import Link from 'next/link';

export function Breadcrumb() {
  const pathname = usePathname();

  // Parse breadcrumbs from pathname
  const segments = pathname
    .split('/')
    .filter(Boolean)
    .map((segment, index, array) => ({
      label: segment.charAt(0).toUpperCase() + segment.slice(1),
      href: '/' + array.slice(0, index + 1).join('/'),
      isLast: index === array.length - 1,
    }));

  if (segments.length === 0) {
    return null;
  }

  return (
    <nav className="flex items-center gap-2 text-sm px-6 py-3 border-b border-gray-200 dark:border-slate-700 bg-white dark:bg-slate-800">
      <Link href="/" className="text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white">
        Home
      </Link>

      {segments.map((segment) => (
        <div key={segment.href} className="flex items-center gap-2">
          <span className="text-gray-400 dark:text-gray-600">/</span>
          {segment.isLast ? (
            <span className="text-gray-900 dark:text-white font-medium">
              {segment.label}
            </span>
          ) : (
            <Link
              href={segment.href}
              className="text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white"
            >
              {segment.label}
            </Link>
          )}
        </div>
      ))}
    </nav>
  );
}
