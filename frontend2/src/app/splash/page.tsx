'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

export default function SplashScreen() {
  const router = useRouter();
  const [progress, setProgress] = useState(0);
  
  useEffect(() => {
    // Progress animation
    const progressInterval = setInterval(() => {
      setProgress(prev => {
        if (prev >= 100) {
          clearInterval(progressInterval);
          return 100;
        }
        return prev + 2;
      });
    }, 40);
    
    // Redirect after animation
    const timer = setTimeout(() => {
      router.push('/login');
    }, 2000);
    
    return () => {
      clearTimeout(timer);
      clearInterval(progressInterval);
    };
  }, [router]);
  
  return (
    <div className="relative flex flex-col items-center justify-center min-h-screen bg-gradient-to-br from-blue-600 via-blue-500 to-purple-600 overflow-hidden">
      {/* Animated Background Circles */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-white/10 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-white/10 rounded-full blur-3xl animate-pulse delay-700"></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-white/5 rounded-full blur-3xl"></div>
      </div>

      {/* Main Content */}
      <div className="relative z-10 text-center px-4">
        {/* Logo Container with Animation */}
        <div className="relative mb-6">
          <div className="absolute inset-0 bg-white/20 rounded-3xl blur-xl animate-ping"></div>
          <div className="relative w-28 h-28 mx-auto bg-white rounded-3xl flex items-center justify-center shadow-2xl transform transition-all duration-500 animate-bounce-slow">
            <svg className="w-14 h-14 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
            </svg>
          </div>
          
          {/* Decorative rings */}
          <div className="absolute -top-2 -left-2 w-32 h-32 border-2 border-white/20 rounded-3xl animate-ping"></div>
          <div className="absolute -bottom-2 -right-2 w-32 h-32 border-2 border-white/20 rounded-3xl animate-ping delay-300"></div>
        </div>

        {/* App Name */}
        <h1 className="text-4xl font-bold text-white mb-2 tracking-tight animate-fade-in-up">
          TaskMaster
        </h1>
        
        {/* Tagline */}
        <p className="text-white/80 text-lg mb-8 animate-fade-in-up animation-delay-200">
          Manage Your Tasks Efficiently
        </p>

        {/* Loading Progress Bar */}
        <div className="w-64 mx-auto mb-4">
          <div className="h-1 bg-white/20 rounded-full overflow-hidden">
            <div 
              className="h-full bg-white rounded-full transition-all duration-100 ease-out"
              style={{ width: `${progress}%` }}
            ></div>
          </div>
        </div>

        {/* Loading Text */}
        <p className="text-white/60 text-sm animate-pulse">
          Loading...
        </p>
      </div>

      {/* Footer */}
      <div className="absolute bottom-8 left-0 right-0 text-center">
        <p className="text-white/40 text-xs">
          TaskMaster v1.0.0
        </p>
      </div>

      <style jsx>{`
        @keyframes fade-in-up {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        
        @keyframes bounce-slow {
          0%, 100% {
            transform: translateY(0);
          }
          50% {
            transform: translateY(-10px);
          }
        }
        
        .animate-fade-in-up {
          animation: fade-in-up 0.6s ease-out forwards;
        }
        
        .animate-bounce-slow {
          animation: bounce-slow 2s ease-in-out infinite;
        }
        
        .animation-delay-200 {
          animation-delay: 0.2s;
        }
        
        .delay-700 {
          animation-delay: 0.7s;
        }
        
        .delay-300 {
          animation-delay: 0.3s;
        }
      `}</style>
    </div>
  );
}