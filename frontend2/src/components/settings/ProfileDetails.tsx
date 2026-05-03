'use client';

import { useAuth } from '@/context/AuthContext';

const ChevronLeftIcon = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <polyline points="15 18 9 12 15 6" />
  </svg>
);

const UserIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
    <circle cx="12" cy="7" r="4" />
  </svg>
);

const EmailIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <rect x="2" y="4" width="20" height="16" rx="2" />
    <polyline points="22 7 12 13 2 7" />
  </svg>
);

const RoleIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
  </svg>
);

const CalendarIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
    <line x1="16" y1="2" x2="16" y2="6" />
    <line x1="8" y1="2" x2="8" y2="6" />
    <line x1="3" y1="10" x2="21" y2="10" />
  </svg>
);

const EditIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M17 3l4 4-7 7H10v-4l7-7z" />
    <path d="M4 20h16" />
  </svg>
);

interface ProfileDetailsProps {
  onBack: () => void;
}

export default function ProfileDetails({ onBack }: ProfileDetailsProps) {
  const { user } = useAuth();

  // Format date if available (example - you can add created_at/updated_at to user object)
  const getRoleBadge = (role: string) => {
    switch (role) {
      case 'admin':
        return { label: 'Administrator', color: 'bg-purple-100 text-purple-700', icon: '👑' };
      case 'user':
        return { label: 'Regular User', color: 'bg-blue-100 text-blue-700', icon: '👤' };
      default:
        return { label: role || 'User', color: 'bg-gray-100 text-gray-700', icon: '👥' };
    }
  };

  const roleInfo = getRoleBadge(user?.role || 'user');
  const joinDate = user?.created_at ? new Date(user.created_at).toLocaleDateString('en-GB', {
    day: '2-digit',
    month: 'long',
    year: 'numeric'
  }) : null;

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-gray-100 pb-20">
      {/* Header */}
      <div className="bg-white shadow-sm border-b px-4 py-4 flex items-center gap-3 sticky top-0 z-10">
        <button 
          onClick={onBack} 
          className="p-2 -ml-2 text-gray-600 hover:bg-gray-100 rounded-full transition-colors"
        >
          <ChevronLeftIcon />
        </button>
        <h1 className="text-xl font-semibold text-gray-900">Profile Details</h1>
      </div>

      <div className="p-4 max-w-md mx-auto">
        <div className="space-y-6">
          {/* Profile Card */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
            {/* Cover Image Area */}
            <div className="h-24 bg-gradient-to-r from-blue-500 to-blue-600"></div>
            
            {/* Avatar Section */}
            <div className="relative px-6 pb-6">
              <div className="flex flex-col items-center -mt-12">
                <div className="relative">
                  <div className="w-24 h-24 rounded-2xl bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center text-white text-3xl font-bold shadow-lg shadow-blue-200">
                    {user?.username?.[0]?.toUpperCase()}
                  </div>
                  <button 
                    className="absolute bottom-0 right-0 w-8 h-8 bg-white rounded-full shadow-md flex items-center justify-center text-gray-400 hover:text-blue-500 transition-colors"
                    title="Edit profile (coming soon)"
                  >
                    <EditIcon />
                  </button>
                </div>
                <h3 className="text-xl font-bold text-gray-900 mt-3">{user?.username}</h3>
                <div className="flex items-center gap-2 mt-1">
                  <div className="flex items-center gap-1 px-2 py-0.5 rounded-full bg-gray-100">
                    <span className="text-xs">{roleInfo.icon}</span>
                    <span className="text-xs font-medium text-gray-600">{roleInfo.label}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Information Cards */}
          <div className="space-y-3">
            {/* Username Card */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4 hover:shadow-md transition-shadow">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-blue-100 rounded-xl flex items-center justify-center text-blue-600">
                  <UserIcon />
                </div>
                <div className="flex-1">
                  <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wider">
                    Username
                  </label>
                  <p className="text-base font-medium text-gray-900">{user?.username}</p>
                </div>
              </div>
            </div>

            {/* Email Card */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4 hover:shadow-md transition-shadow">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-green-100 rounded-xl flex items-center justify-center text-green-600">
                  <EmailIcon />
                </div>
                <div className="flex-1">
                  <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wider">
                    Email Address
                  </label>
                  <p className="text-base font-medium text-gray-900">{user?.email}</p>
                </div>
              </div>
            </div>

            {/* Role Card */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4 hover:shadow-md transition-shadow">
              <div className="flex items-center gap-3">
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${
                  user?.role === 'admin' ? 'bg-purple-100 text-purple-600' : 'bg-gray-100 text-gray-600'
                }`}>
                  <RoleIcon />
                </div>
                <div className="flex-1">
                  <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wider">
                    Account Role
                  </label>
                  <div className="flex items-center gap-2">
                    <span className={`text-base font-medium capitalize ${
                      user?.role === 'admin' ? 'text-purple-700' : 'text-gray-900'
                    }`}>
                      {user?.role}
                    </span>
                    <span className={`text-xs px-2 py-0.5 rounded-full ${
                      user?.role === 'admin' ? 'bg-purple-100 text-purple-700' : 'bg-blue-100 text-blue-700'
                    }`}>
                      {user?.role === 'admin' ? 'Full Access' : 'Limited Access'}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Join Date Card (if available) */}
            {joinDate && (
              <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4 hover:shadow-md transition-shadow">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-orange-100 rounded-xl flex items-center justify-center text-orange-600">
                    <CalendarIcon />
                  </div>
                  <div className="flex-1">
                    <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wider">
                      Member Since
                    </label>
                    <p className="text-base font-medium text-gray-900">{joinDate}</p>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Account Stats */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4">
            <h4 className="text-sm font-semibold text-gray-700 mb-3">Account Information</h4>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between py-1">
                <span className="text-gray-500">Account ID</span>
                <span className="font-mono text-gray-900">#{user?.id}</span>
              </div>
              <div className="flex justify-between py-1">
                <span className="text-gray-500">Status</span>
                <span className="text-green-600 flex items-center gap-1">
                  <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></span>
                  Active
                </span>
              </div>
              <div className="flex justify-between py-1">
                <span className="text-gray-500">Authentication</span>
                <span className="text-gray-900">Username & Password</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Navigation */}
      <div className="fixed bottom-0 left-0 right-0 bg-white border-t flex justify-around py-3 shadow-lg">
        <button onClick={() => window.location.href = '/home'} className="text-gray-500 hover:text-blue-500 transition-colors">Home</button>
        <button onClick={() => window.location.href = '/tasks'} className="text-gray-500 hover:text-blue-500 transition-colors">Tasks</button>
        <button onClick={() => window.location.href = '/settings'} className="text-blue-500">Settings</button>
      </div>
    </div>
  );
}