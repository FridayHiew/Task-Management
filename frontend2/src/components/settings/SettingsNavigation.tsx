'use client';

import { useAuth } from '@/context/AuthContext';
import { useToast } from '@/context/ToastContext';

// Icons
const UserIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
    <circle cx="12" cy="7" r="4" />
  </svg>
);

const KeyIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M21 2l-2 2m-7.61 7.61a5.5 5.5 0 1 1-7.778 7.778 5.5 5.5 0 0 1 7.777-7.777zm0 0L15.5 7.5m0 0l3 3L22 7l-3-3m-3.5 3.5L19 4" />
  </svg>
);

const DatabaseIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <ellipse cx="12" cy="5" rx="9" ry="3" />
    <path d="M21 12c0 1.66-4 3-9 3s-9-1.34-9-3" />
    <path d="M3 5v14c0 1.66 4 3 9 3s9-1.34 9-3V5" />
  </svg>
);

const ShieldIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
  </svg>
);

const LogOutIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
    <polyline points="16 17 21 12 16 7" />
    <line x1="21" y1="12" x2="9" y2="12" />
  </svg>
);

const ChevronRightIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <polyline points="9 18 15 12 9 6" />
  </svg>
);

const InfoIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <circle cx="12" cy="12" r="10" />
    <line x1="12" y1="16" x2="12" y2="12" />
    <line x1="12" y1="8" x2="12.01" y2="8" />
  </svg>
);

// User Avatar Icon Component
const UserAvatarIcon = () => (
  <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
    <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
    <circle cx="12" cy="7" r="4" />
  </svg>
);

interface SettingsNavigationProps {
  onNavigate: (view: string) => void;
}

export default function SettingsNavigation({ onNavigate }: SettingsNavigationProps) {
  const { user, logout } = useAuth();
  const { showToast } = useToast();

  const handleLogout = async () => {
    await logout();
    showToast('Signed out successfully', 'success');
    window.location.href = '/login';
  };

  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      <div className="p-4 space-y-6">
        {/* User Header Section - Icon on left, username/email on right */}
        <div className="space-y-2">
          <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider px-2">Account</h3>
          <div className="bg-white rounded-xl border border-gray-100 overflow-hidden shadow-sm">
            <div className="flex items-center gap-4 p-4">
              <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center text-blue-600">
                <UserAvatarIcon />
              </div>
              <div className="flex-1">
                <h2 className="text-base font-bold text-gray-900">{user?.username}</h2>
                <p className="text-sm text-gray-500">{user?.email}</p>
              </div>
            </div>
          </div>
        </div>

        {/* My Profile Section */}
        <div className="space-y-2">
          <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider px-2">My Profile</h3>
          <div className="bg-white rounded-xl border border-gray-100 overflow-hidden shadow-sm">
            <button
              onClick={() => onNavigate('profile')}
              className="w-full flex items-center justify-between p-4 hover:bg-gray-50 transition-colors border-b border-gray-50"
            >
              <div className="flex items-center gap-3">
                <UserIcon />
                <div className="text-left">
                  <div className="text-sm font-medium text-gray-900">Profile Details</div>
                  <div className="text-xs text-gray-500">View your personal information</div>
                </div>
              </div>
              <ChevronRightIcon />
            </button>
            <button
              onClick={() => onNavigate('password')}
              className="w-full flex items-center justify-between p-4 hover:bg-gray-50 transition-colors"
            >
              <div className="flex items-center gap-3">
                <KeyIcon />
                <div className="text-left">
                  <div className="text-sm font-medium text-gray-900">Change Password</div>
                  <div className="text-xs text-gray-500">Update your password</div>
                </div>
              </div>
              <ChevronRightIcon />
            </button>
          </div>
        </div>

        {/* System Section - Admin Only */}
        {user?.role === 'admin' && (
          <div className="space-y-2">
            <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider px-2">System</h3>
            <div className="bg-white rounded-xl border border-gray-100 overflow-hidden shadow-sm">
              <button
                onClick={() => onNavigate('master')}
                className="w-full flex items-center justify-between p-4 hover:bg-gray-50 transition-colors border-b border-gray-50"
              >
                <div className="flex items-center gap-3">
                  <DatabaseIcon />
                  <div className="text-left">
                    <div className="text-sm font-medium text-gray-900">Master Data Management</div>
                    <div className="text-xs text-gray-500">Manage advisors, partners, cost centers</div>
                  </div>
                </div>
                <ChevronRightIcon />
              </button>
              <button
                onClick={() => onNavigate('admin')}
                className="w-full flex items-center justify-between p-4 hover:bg-gray-50 transition-colors"
              >
                <div className="flex items-center gap-3">
                  <ShieldIcon />
                  <div className="text-left">
                    <div className="text-sm font-medium text-gray-900">Admin Panel</div>
                    <div className="text-xs text-gray-500">User management and permissions</div>
                  </div>
                </div>
                <ChevronRightIcon />
              </button>
            </div>
          </div>
        )}

        {/* About Section */}
        <div className="space-y-2">
          <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider px-2">About</h3>
          <div className="bg-white rounded-xl border border-gray-100 overflow-hidden shadow-sm">
            <button
              onClick={() => onNavigate('info')}
              className="w-full flex items-center justify-between p-4 hover:bg-gray-50 transition-colors"
            >
              <div className="flex items-center gap-3">
                <InfoIcon />
                <div className="text-left">
                  <div className="text-sm font-medium text-gray-900">App Info</div>
                  <div className="text-xs text-gray-500">Version 1.0.0</div>
                </div>
              </div>
              <ChevronRightIcon />
            </button>
          </div>
        </div>

        {/* Sign Out Button */}
        <button
          onClick={handleLogout}
          className="w-full flex items-center justify-center gap-2 py-3 bg-red-50 text-red-600 rounded-xl font-medium hover:bg-red-100 transition-colors"
        >
          <LogOutIcon />
          Sign Out
        </button>
      </div>

      {/* Bottom Navigation */}
      <div className="fixed bottom-0 left-0 right-0 bg-white border-t flex justify-around py-3">
        <button onClick={() => window.location.href = '/home'} className="text-gray-500">Home</button>
        <button onClick={() => window.location.href = '/tasks'} className="text-gray-500">Tasks</button>
        <button onClick={() => window.location.href = '/settings'} className="text-blue-500">Settings</button>
      </div>
    </div>
  );
}