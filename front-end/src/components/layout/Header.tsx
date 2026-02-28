import React from 'react';
import { UserRole } from '../../types/user';

interface HeaderProps {
  userName: string;
  userRole: UserRole;
  userAvatar?: string;
  onLogout: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  userName,
  userRole,
  userAvatar,
  onLogout,
}) => {
  return (
    <header className="bg-white border-b border-gray-200 px-6 py-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Hospital Management System</h1>
          <p className="text-sm text-gray-500 mt-1">Welcome back, {userName}</p>
        </div>

        <div className="flex items-center gap-4">
          <div className="flex items-center gap-3">
            {userAvatar ? (
              <img
                src={userAvatar}
                alt={userName}
                className="w-10 h-10 rounded-full object-cover"
              />
            ) : (
              <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center">
                <span className="text-blue-600 font-semibold">
                  {userName.charAt(0).toUpperCase()}
                </span>
              </div>
            )}
            <div>
              <p className="text-sm font-medium text-gray-900">{userName}</p>
              <p className="text-xs text-gray-500 capitalize">{userRole}</p>
            </div>
          </div>

          <button
            onClick={onLogout}
            className="px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
          >
            Logout
          </button>
        </div>
      </div>
    </header>
  );
};
