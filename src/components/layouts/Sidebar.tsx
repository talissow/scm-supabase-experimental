'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useState } from 'react';

const navigationLinks = [
  { href: '/', label: 'Dashboard', icon: '📊' },
  { href: '/products', label: 'Produtos', icon: '📦' },
  { href: '/movements', label: 'Movimentos', icon: '📤' },
  { href: '/admin', label: 'Admin', icon: '⚙️' },
];

export function Sidebar() {
  const pathname = usePathname();
  const [isOpen, setIsOpen] = useState(true);

  return (
    <>
      {/* Toggle Button (mobile) */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="md:hidden fixed bottom-4 left-4 z-30 bg-primary-600 text-white p-3 rounded-full shadow-lg hover:bg-primary-700 transition-colors"
        title="Toggle sidebar"
      >
        ☰
      </button>

      {/* Sidebar */}
      <aside
        className={`
          fixed md:static top-16 left-0 h-[calc(100vh-4rem)]
          w-64 bg-white dark:bg-slate-800 shadow-lg
          transform transition-transform duration-300
          ${isOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}
          md:translate-x-0 md:h-[calc(100vh-4rem)]
          z-20 md:z-0
        `}
      >
        <nav className="p-4 space-y-2 h-full overflow-y-auto">
          {navigationLinks.map((link) => {
            const isActive = pathname === link.href;
            return (
              <Link
                key={link.href}
                href={link.href}
                className={`
                  flex items-center gap-3 px-4 py-3 rounded-lg
                  transition-all duration-200
                  ${isActive
                    ? 'bg-primary-100 dark:bg-primary-900 text-primary-700 dark:text-primary-300 font-medium'
                    : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-slate-700'
                  }
                `}
                onClick={() => setIsOpen(false)}
              >
                <span className="text-xl">{link.icon}</span>
                <span>{link.label}</span>
                {isActive && (
                  <span className="ml-auto w-2 h-2 bg-primary-600 rounded-full"></span>
                )}
              </Link>
            );
          })}
        </nav>
      </aside>

      {/* Overlay (mobile) */}
      {isOpen && (
        <div
          className="md:hidden fixed inset-0 bg-black bg-opacity-50 z-10 top-16"
          onClick={() => setIsOpen(false)}
        />
      )}
    </>
  );
}
