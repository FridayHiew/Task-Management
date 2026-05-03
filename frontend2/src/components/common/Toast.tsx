'use client';

import { useToast } from '@/context/ToastContext';
import { FiCheckCircle, FiAlertCircle, FiInfo, FiXCircle, FiX } from 'react-icons/fi';

export default function Toast() {
  const { toasts, removeToast } = useToast();

  const getIcon = (type: string) => {
    switch (type) {
      case 'success':
        return <FiCheckCircle className="text-green-500" size={24} />;
      case 'error':
        return <FiAlertCircle className="text-red-500" size={24} />;
      case 'warning':
        return <FiInfo className="text-yellow-500" size={24} />;
      default:
        return <FiInfo className="text-blue-500" size={24} />;
    }
  };

  const getBgColor = (type: string) => {
    switch (type) {
      case 'success':
        return 'bg-green-50 border-green-200';
      case 'error':
        return 'bg-red-50 border-red-200';
      case 'warning':
        return 'bg-yellow-50 border-yellow-200';
      default:
        return 'bg-blue-50 border-blue-200';
    }
  };

  if (toasts.length === 0) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center pointer-events-none">
      <div className="space-y-2 pointer-events-auto">
        {toasts.map((toast) => (
          <div
            key={toast.id}
            className={`flex items-center gap-3 px-5 py-4 rounded-xl shadow-xl border ${getBgColor(toast.type)} animate-in fade-in zoom-in duration-300 min-w-[320px] max-w-[450px]`}
          >
            {getIcon(toast.type)}
            <span className="flex-1 text-sm font-medium text-gray-800">{toast.message}</span>
            <button
              onClick={() => removeToast(toast.id)}
              className="text-gray-400 hover:text-gray-600 transition-colors"
            >
              <FiX size={18} />
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}