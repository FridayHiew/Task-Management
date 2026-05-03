'use client';

import { useState } from 'react';
import { useToast } from '@/context/ToastContext';
import api from '@/services/api';
import ConfirmDialog from '@/components/common/ConfirmDialog';

const ChevronLeftIcon = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <polyline points="15 18 9 12 15 6" />
  </svg>
);

const EyeIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
    <circle cx="12" cy="12" r="3" />
  </svg>
);

const EyeOffIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24" />
    <line x1="1" y1="1" x2="23" y2="23" />
  </svg>
);

const CheckIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3">
    <polyline points="20 6 9 17 4 12" />
  </svg>
);

interface ChangePasswordProps {
  onBack: () => void;
}

export default function ChangePassword({ onBack }: ChangePasswordProps) {
  const { showToast } = useToast();
  const [loading, setLoading] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [showPasswords, setShowPasswords] = useState({
    current: false,
    new: false,
    confirm: false
  });
  const [passwords, setPasswords] = useState({ current: '', new: '', confirm: '' });
  const [errors, setErrors] = useState({ current: '', new: '', confirm: '' });

  // Password strength calculation
  const getPasswordStrength = (password: string) => {
    if (!password) return 0;
    let strength = 0;
    if (password.length >= 6) strength++;
    if (password.length >= 8) strength++;
    if (/[A-Z]/.test(password)) strength++;
    if (/[0-9]/.test(password)) strength++;
    if (/[^A-Za-z0-9]/.test(password)) strength++;
    return Math.min(strength, 4);
  };

  const getStrengthLabel = (strength: number) => {
    const labels = ['', 'Weak', 'Fair', 'Good', 'Strong'];
    const colors = ['', 'bg-red-500', 'bg-orange-500', 'bg-yellow-500', 'bg-green-500'];
    return { label: labels[strength], color: colors[strength] };
  };

  const passwordStrength = getPasswordStrength(passwords.new);
  const strengthInfo = getStrengthLabel(passwordStrength);

  const validateForm = () => {
    let isValid = true;
    const newErrors = { current: '', new: '', confirm: '' };

    if (!passwords.current) {
      newErrors.current = 'Current password is required';
      isValid = false;
    }

    if (!passwords.new) {
      newErrors.new = 'New password is required';
      isValid = false;
    } else if (passwords.new.length < 6) {
      newErrors.new = 'Password must be at least 6 characters';
      isValid = false;
    }

    if (!passwords.confirm) {
      newErrors.confirm = 'Please confirm your new password';
      isValid = false;
    } else if (passwords.new !== passwords.confirm) {
      newErrors.confirm = 'Passwords do not match';
      isValid = false;
    }

    setErrors(newErrors);
    return isValid;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }
    
    setShowConfirm(true);
  };

  const confirmChangePassword = async () => {
    setShowConfirm(false);
    setLoading(true);
    
    try {
      const response = await api.post('/users/change-password', {
        currentPassword: passwords.current,
        newPassword: passwords.new
      });
      
      showToast(response.data.message || 'Password updated successfully', 'success');
      setPasswords({ current: '', new: '', confirm: '' });
      setTimeout(() => onBack(), 1500);
      
    } catch (err: any) {
      const errorMessage = err.response?.data?.message || 'Failed to update password';
      showToast(errorMessage, 'error');
      
      if (err.response?.status === 401) {
        setErrors({ ...errors, current: 'Current password is incorrect' });
      }
    } finally {
      setLoading(false);
    }
  };

  const togglePasswordVisibility = (field: 'current' | 'new' | 'confirm') => {
    setShowPasswords(prev => ({ ...prev, [field]: !prev[field] }));
  };

  return (
    <>
      <div className="min-h-screen bg-gradient-to-b from-gray-50 to-gray-100 pb-20">
        {/* Header */}
        <div className="bg-white shadow-sm border-b px-4 py-4 flex items-center gap-3 sticky top-0 z-10">
          <button 
            onClick={onBack} 
            className="p-2 -ml-2 text-gray-600 hover:bg-gray-100 rounded-full transition-colors"
          >
            <ChevronLeftIcon />
          </button>
          <h1 className="text-xl font-semibold text-gray-900">Change Password</h1>
        </div>

        <div className="p-4 max-w-md mx-auto">
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
            {/* Info Banner */}
            <div className="mb-6 p-3 bg-blue-50 rounded-xl flex items-start gap-2">
              <div className="w-5 h-5 text-blue-500 mt-0.5">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <circle cx="12" cy="12" r="10" />
                  <line x1="12" y1="8" x2="12" y2="12" />
                  <line x1="12" y1="16" x2="12.01" y2="16" />
                </svg>
              </div>
              <p className="text-xs text-blue-700 flex-1">
                For security, choose a strong password that you haven't used before.
              </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-5">
              {/* Current Password */}
              <div>
                <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1">
                  Current Password *
                </label>
                <div className="relative">
                  <input
                    type={showPasswords.current ? 'text' : 'password'}
                    required
                    className={`w-full px-4 py-2.5 rounded-xl border ${
                      errors.current ? 'border-red-300 bg-red-50' : 'border-gray-200 bg-gray-50'
                    } focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent focus:bg-white transition-all pr-10`}
                    value={passwords.current}
                    onChange={(e) => {
                      setPasswords({ ...passwords, current: e.target.value });
                      setErrors({ ...errors, current: '' });
                    }}
                  />
                  <button
                    type="button"
                    onClick={() => togglePasswordVisibility('current')}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  >
                    {showPasswords.current ? <EyeOffIcon /> : <EyeIcon />}
                  </button>
                </div>
                {errors.current && (
                  <p className="mt-1 text-xs text-red-500 flex items-center gap-1">
                    <span>⚠️</span> {errors.current}
                  </p>
                )}
              </div>

              {/* New Password */}
              <div>
                <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1">
                  New Password *
                </label>
                <div className="relative">
                  <input
                    type={showPasswords.new ? 'text' : 'password'}
                    required
                    className={`w-full px-4 py-2.5 rounded-xl border ${
                      errors.new ? 'border-red-300 bg-red-50' : 'border-gray-200 bg-gray-50'
                    } focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent focus:bg-white transition-all pr-10`}
                    value={passwords.new}
                    onChange={(e) => {
                      setPasswords({ ...passwords, new: e.target.value });
                      setErrors({ ...errors, new: '' });
                    }}
                  />
                  <button
                    type="button"
                    onClick={() => togglePasswordVisibility('new')}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  >
                    {showPasswords.new ? <EyeOffIcon /> : <EyeIcon />}
                  </button>
                </div>
                
                {/* Password Strength Indicator */}
                {passwords.new && (
                  <div className="mt-2 space-y-1">
                    <div className="flex gap-1">
                      {[1, 2, 3, 4].map((level) => (
                        <div
                          key={level}
                          className={`h-1 flex-1 rounded-full transition-all ${
                            level <= passwordStrength ? strengthInfo.color : 'bg-gray-200'
                          }`}
                        />
                      ))}
                    </div>
                    <div className="flex justify-between items-center">
                      <p className="text-xs text-gray-500">
                        Password strength: <span className="font-medium">{strengthInfo.label}</span>
                      </p>
                      {passwords.new.length >= 6 && passwords.new.length < 8 && (
                        <p className="text-xs text-gray-400">Use 8+ characters for stronger password</p>
                      )}
                    </div>
                  </div>
                )}
                
                {errors.new && (
                  <p className="mt-1 text-xs text-red-500 flex items-center gap-1">
                    <span>⚠️</span> {errors.new}
                  </p>
                )}
              </div>

              {/* Confirm New Password */}
              <div>
                <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1">
                  Confirm New Password *
                </label>
                <div className="relative">
                  <input
                    type={showPasswords.confirm ? 'text' : 'password'}
                    required
                    className={`w-full px-4 py-2.5 rounded-xl border ${
                      errors.confirm ? 'border-red-300 bg-red-50' : 'border-gray-200 bg-gray-50'
                    } focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent focus:bg-white transition-all pr-10`}
                    value={passwords.confirm}
                    onChange={(e) => {
                      setPasswords({ ...passwords, confirm: e.target.value });
                      setErrors({ ...errors, confirm: '' });
                    }}
                  />
                  <button
                    type="button"
                    onClick={() => togglePasswordVisibility('confirm')}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  >
                    {showPasswords.confirm ? <EyeOffIcon /> : <EyeIcon />}
                  </button>
                </div>
                {passwords.confirm && passwords.new === passwords.confirm && passwords.new && (
                  <p className="mt-1 text-xs text-green-600 flex items-center gap-1">
                    <CheckIcon /> Passwords match
                  </p>
                )}
                {errors.confirm && (
                  <p className="mt-1 text-xs text-red-500 flex items-center gap-1">
                    <span>⚠️</span> {errors.confirm}
                  </p>
                )}
              </div>

              {/* Requirements List */}
              <div className="pt-2 space-y-1">
                <p className="text-xs font-medium text-gray-500 mb-2">Password requirements:</p>
                <div className="space-y-1">
                  <div className={`flex items-center gap-2 text-xs ${passwords.new.length >= 6 ? 'text-green-600' : 'text-gray-400'}`}>
                    <div className={`w-4 h-4 rounded-full flex items-center justify-center ${passwords.new.length >= 6 ? 'bg-green-100' : 'bg-gray-100'}`}>
                      {passwords.new.length >= 6 && <CheckIcon />}
                    </div>
                    <span>At least 6 characters</span>
                  </div>
                  <div className={`flex items-center gap-2 text-xs ${/[A-Z]/.test(passwords.new) ? 'text-green-600' : 'text-gray-400'}`}>
                    <div className={`w-4 h-4 rounded-full flex items-center justify-center ${/[A-Z]/.test(passwords.new) ? 'bg-green-100' : 'bg-gray-100'}`}>
                      {/[A-Z]/.test(passwords.new) && <CheckIcon />}
                    </div>
                    <span>At least one uppercase letter (optional)</span>
                  </div>
                  <div className={`flex items-center gap-2 text-xs ${/[0-9]/.test(passwords.new) ? 'text-green-600' : 'text-gray-400'}`}>
                    <div className={`w-4 h-4 rounded-full flex items-center justify-center ${/[0-9]/.test(passwords.new) ? 'bg-green-100' : 'bg-gray-100'}`}>
                      {/[0-9]/.test(passwords.new) && <CheckIcon />}
                    </div>
                    <span>At least one number (optional)</span>
                  </div>
                </div>
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={loading}
                className="w-full py-3 bg-blue-500 text-white rounded-xl font-semibold text-sm hover:bg-blue-600 transition-all disabled:opacity-50 flex items-center justify-center gap-2 mt-4 shadow-md shadow-blue-200"
              >
                {loading ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></div>
                    Updating...
                  </>
                ) : (
                  'Update Password'
                )}
              </button>
            </form>
          </div>
        </div>

        {/* Bottom Navigation */}
        <div className="fixed bottom-0 left-0 right-0 bg-white border-t flex justify-around py-3 shadow-lg">
          <button onClick={() => window.location.href = '/home'} className="text-gray-500 hover:text-blue-500 transition-colors">Home</button>
          <button onClick={() => window.location.href = '/tasks'} className="text-gray-500 hover:text-blue-500 transition-colors">Tasks</button>
          <button onClick={() => window.location.href = '/settings'} className="text-blue-500">Settings</button>
        </div>
      </div>

      {/* Confirmation Dialog */}
      <ConfirmDialog
        isOpen={showConfirm}
        title="Change Password"
        message="Are you sure you want to change your password? You will need to use the new password for future logins."
        onConfirm={confirmChangePassword}
        onCancel={() => setShowConfirm(false)}
        confirmText="Yes, Change Password"
        confirmVariant="primary"
      />
    </>
  );
}