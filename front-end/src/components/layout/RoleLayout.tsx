import React, { ReactNode } from 'react';
import { UserRole } from '../../types/user';
import { Header } from './Header';
import { SidebarItem } from './Sidebar';

interface RoleLayoutProps {
  children: ReactNode;
  userName: string;
  userRole: UserRole;
  userAvatar?: string;
  sidebarItems: SidebarItem[];
  onLogout: () => void;
}

export const RoleLayout: React.FC<RoleLayoutProps> = ({
  children,
  userName,
  userRole,
  userAvatar,
  sidebarItems,
  onLogout,
}) => {
  return (
    <div className="flex min-h-screen bg-gray-100">
      <Sidebar items={sidebarItems} />
      <div className="flex-1 flex flex-col">
        <Header
          userName={userName}
          userRole={userRole}
          userAvatar={userAvatar}
          onLogout={onLogout}
        />
        <main className="flex-1 p-6 overflow-auto">{children}</main>
      </div>
    </div>
  );
};
