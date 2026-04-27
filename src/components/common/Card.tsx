import React from 'react';

interface CardProps {
  children: React.ReactNode;
  header?: React.ReactNode;
  footer?: React.ReactNode;
  className?: string;
}

export function Card({ children, header, footer, className = '' }: CardProps) {
  return (
    <div className={`
      bg-white dark:bg-slate-800
      rounded-lg shadow-md
      overflow-hidden
      transition-colors
      ${className}
    `}>
      {header && (
        <div className="px-6 py-4 border-b border-gray-200 dark:border-slate-700">
          {header}
        </div>
      )}
      <div className="px-6 py-4">
        {children}
      </div>
      {footer && (
        <div className="px-6 py-4 border-t border-gray-200 dark:border-slate-700 bg-gray-50 dark:bg-slate-900">
          {footer}
        </div>
      )}
    </div>
  );
}
