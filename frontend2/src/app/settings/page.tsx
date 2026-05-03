'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { useToast } from '@/context/ToastContext';
import SettingsNavigation from '@/components/settings/SettingsNavigation';
import ProfileDetails from '@/components/settings/ProfileDetails';
import ChangePassword from '@/components/settings/ChangePassword';
import MasterDataManagement from '@/components/settings/MasterDataManagement';
import AdminPanel from '@/components/settings/AdminPanel';
import AppInfo from '@/components/settings/AppInfo';

export default function SettingsPage() {
  const router = useRouter();
  const { user, logout } = useAuth();
  const { showToast } = useToast();
  const [activeView, setActiveView] = useState<string | null>(null);

  const handleLogout = async () => {
    await logout();
    showToast('Logged out successfully', 'success');
    router.push('/login');
  };

  // If a sub-page is selected, show it
  if (activeView) {
    switch (activeView) {
      case 'profile':
        return <ProfileDetails onBack={() => setActiveView(null)} />;
      case 'password':
        return <ChangePassword onBack={() => setActiveView(null)} />;
      case 'master':
        return <MasterDataManagement onBack={() => setActiveView(null)} />;
      case 'admin':
        return <AdminPanel onBack={() => setActiveView(null)} />;
      case 'info':
        return <AppInfo onBack={() => setActiveView(null)} />;
      default:
        return <SettingsNavigation onNavigate={setActiveView} />;
    }
  }

  // Main settings menu
  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-gray-100 pb-20">
      {/* Header */}
      <div className="bg-white border-b border-gray-100 px-4 pt-8 pb-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Settings</h1>
          <p className="text-sm text-gray-400 mt-1">Manage your account and preferences</p>
        </div>
      </div>

      <div className="p-4">
        {/* Settings Navigation */}
        <SettingsNavigation onNavigate={setActiveView} />
      </div>

      {/* Bottom Navigation */}
      <div className="fixed bottom-0 left-0 right-0 bg-white border-t flex justify-around py-3 shadow-lg">
        <button onClick={() => router.push('/home')} className="flex flex-col items-center gap-1 text-gray-400 hover:text-gray-600 transition-colors">
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
          </svg>
          <span className="text-xs">Home</span>
        </button>
        <button onClick={() => router.push('/tasks')} className="flex flex-col items-center gap-1 text-gray-400 hover:text-gray-600 transition-colors">
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
          </svg>
          <span className="text-xs">Tasks</span>
        </button>
        <button onClick={() => router.push('/settings')} className="flex flex-col items-center gap-1 text-blue-500">
          <svg className="w-5 h-5" fill="currentColor" stroke="none" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
            <circle cx="12" cy="12" r="3" />
          </svg>
          <span className="text-xs">Settings</span>
        </button>
      </div>
    </div>
  );
}