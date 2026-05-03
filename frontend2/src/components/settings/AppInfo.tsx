'use client';

const ChevronLeftIcon = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <polyline points="15 18 9 12 15 6" />
  </svg>
);

const AppIcon = () => (
  <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
    <rect x="3" y="3" width="18" height="18" rx="2" ry="2" />
    <line x1="9" y1="9" x2="15" y2="15" />
    <line x1="15" y1="9" x2="9" y2="15" />
  </svg>
);

const DeveloperIcon = () => (
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

const VersionIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <circle cx="12" cy="12" r="10" />
    <polyline points="12 6 12 12 16 14" />
  </svg>
);

interface AppInfoProps {
  onBack: () => void;
}

export default function AppInfo({ onBack }: AppInfoProps) {
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
        <h1 className="text-xl font-semibold text-gray-900">App Info</h1>
      </div>

      <div className="p-4 max-w-md mx-auto">
        <div className="space-y-6">
          {/* App Logo & Name */}
          <div className="text-center py-8 bg-white rounded-2xl shadow-sm border border-gray-100">
            <div className="w-24 h-24 bg-gradient-to-br from-blue-500 to-blue-600 rounded-3xl flex items-center justify-center text-white mx-auto mb-4 shadow-lg shadow-blue-200">
              <AppIcon />
            </div>
            <h3 className="text-2xl font-bold text-gray-900">TaskMaster</h3>
            <div className="flex items-center justify-center gap-2 mt-2">
              <VersionIcon />
              <p className="text-gray-500">Version 1.0.0</p>
            </div>
          </div>

          {/* Info Cards */}
          <div className="space-y-3">
            {/* Developer Card */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5 hover:shadow-md transition-shadow">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-blue-100 rounded-xl flex items-center justify-center text-blue-600">
                  <DeveloperIcon />
                </div>
                <div>
                  <h4 className="text-sm font-semibold text-gray-500 uppercase tracking-wider">Developer</h4>
                  <p className="text-base font-medium text-gray-900">Ken Hiew</p>
                </div>
              </div>
            </div>

            {/* Email Card */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5 hover:shadow-md transition-shadow">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-green-100 rounded-xl flex items-center justify-center text-green-600">
                  <EmailIcon />
                </div>
                <div>
                  <h4 className="text-sm font-semibold text-gray-500 uppercase tracking-wider">Email</h4>
                  <p className="text-base font-medium text-gray-900">kenhiew03@gmail.com</p>
                </div>
              </div>
            </div>
          </div>

          {/* Footer Note */}
          <div className="text-center pt-4">
            <p className="text-xs text-gray-400">© 2024 TaskMaster. All rights reserved.</p>
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