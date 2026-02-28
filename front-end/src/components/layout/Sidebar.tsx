import React from 'react';

export interface SidebarItem {
  icon: React.ReactNode;
  label: string;
  active?: boolean;
  onClick?: () => void;
}

export interface SidebarProps {
  items: SidebarItem[];
  title?: string;
  className?: string;
}

export const Sidebar: React.FC<SidebarProps> = ({ items, title, className = '' }) => {
  return (
    <aside className={`w-64 bg-gray-900 min-h-screen ${className}`}>
      {title && (
        <div className="px-4 py-6 border-b border-gray-800">
          <h2 className="text-xl font-bold text-white">{title}</h2>
        </div>
      )}
      <nav className="p-4">
        <ul className="space-y-2">
          {items.map((item, index) => (
            <li key={index}>
              <button
                onClick={item.onClick}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
                  item.active
                    ? 'bg-blue-600 text-white'
                    : 'text-gray-400 hover:bg-gray-800 hover:text-white'
                }`}
              >
                {item.icon}
                <span className="font-medium">{item.label}</span>
              </button>
            </li>
          ))}
        </ul>
      </nav>
    </aside>
  );
};
