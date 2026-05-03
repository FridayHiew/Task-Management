'use client';

import { useState } from 'react';
import ConfirmDialog from '@/components/common/ConfirmDialog';

const XIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <line x1="18" y1="6" x2="6" y2="18" />
    <line x1="6" y1="6" x2="18" y2="18" />
  </svg>
);

const SaveIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z" />
    <polyline points="17 21 17 13 7 13 7 21" />
    <polyline points="7 3 7 8 15 8" />
  </svg>
);

interface EditUserModalProps {
  user: any;
  currentUserId?: number;
  onClose: () => void;
  onSave: (user: any) => Promise<void>;
  onResetPassword: (id: number, username: string) => Promise<void>;
  onToggleStatus: (user: any) => Promise<void>;
  loading: boolean;
}

export default function EditUserModal({
  user,
  currentUserId,
  onClose,
  onSave,
  onResetPassword,
  onToggleStatus,
  loading
}: EditUserModalProps) {
  const [editedUser, setEditedUser] = useState(user);
  const [isSaving, setIsSaving] = useState(false);
  const [isActionLoading, setIsActionLoading] = useState(false);
  
  // Confirmation dialogs state
  const [showSaveConfirm, setShowSaveConfirm] = useState(false);
  const [showResetConfirm, setShowResetConfirm] = useState(false);
  const [showStatusConfirm, setShowStatusConfirm] = useState(false);
  const [pendingAction, setPendingAction] = useState<'reset' | 'toggle' | null>(null);

  const hasChanges = () => {
    return editedUser.username !== user.username || editedUser.email !== user.email;
  };

  const handleSave = async () => {
    if (!hasChanges()) {
      onClose();
      return;
    }
    setShowSaveConfirm(true);
  };

  const confirmSave = async () => {
    setIsSaving(true);
    try {
      await onSave(editedUser);
      onClose();
    } catch (err) {
      // Error already handled in parent
    } finally {
      setIsSaving(false);
      setShowSaveConfirm(false);
    }
  };

  const handleResetPassword = () => {
    setShowResetConfirm(true);
  };

  const confirmResetPassword = async () => {
    setIsActionLoading(true);
    try {
      await onResetPassword(editedUser.id, editedUser.username);
      onClose();
    } catch (err) {
      // Error already handled in parent
    } finally {
      setIsActionLoading(false);
      setShowResetConfirm(false);
    }
  };

  const handleToggleStatus = () => {
    setShowStatusConfirm(true);
  };

  const confirmToggleStatus = async () => {
    setIsActionLoading(true);
    try {
      await onToggleStatus(editedUser);
      onClose();
    } catch (err) {
      // Error already handled in parent
    } finally {
      setIsActionLoading(false);
      setShowStatusConfirm(false);
    }
  };

  const isLoading = loading || isSaving || isActionLoading;

  return (
    <>
      <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
        <div className="bg-white rounded-2xl w-full max-w-md overflow-hidden shadow-2xl animate-in fade-in zoom-in duration-200">
          {/* Header */}
          <div className="px-6 py-4 border-b flex justify-between items-center bg-gradient-to-r from-blue-50 to-white">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center text-blue-600 font-bold">
                {editedUser.username?.[0]?.toUpperCase()}
              </div>
              <h3 className="font-semibold text-gray-900">Edit User</h3>
            </div>
            <button 
              onClick={onClose} 
              className="text-gray-400 hover:text-gray-600 transition-colors hover:bg-gray-100 rounded-full p-1"
            >
              <XIcon />
            </button>
          </div>

          <div className="p-6 space-y-5">
            {/* Name Field */}
            <div>
              <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1">
                Full Name
              </label>
              <input
                type="text"
                className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all bg-gray-50 focus:bg-white"
                value={editedUser.username}
                onChange={(e) => setEditedUser({ ...editedUser, username: e.target.value })}
                placeholder="Enter full name"
              />
            </div>

            {/* Email Field */}
            <div>
              <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1">
                Email Address
              </label>
              <input
                type="email"
                className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all bg-gray-50 focus:bg-white"
                value={editedUser.email}
                onChange={(e) => setEditedUser({ ...editedUser, email: e.target.value })}
                placeholder="user@example.com"
              />
            </div>

            {/* Status Display with Badge */}
            <div className="bg-gradient-to-r from-gray-50 to-white rounded-xl p-4 border border-gray-100">
              <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">
                Account Status
              </label>
              <div className="flex items-center gap-2">
                <div className={`w-2 h-2 rounded-full ${editedUser.status === 0 ? 'bg-red-500' : 'bg-green-500'} animate-pulse`}></div>
                <span className={`px-3 py-1.5 rounded-full text-xs font-semibold ${
                  editedUser.status === 0 
                    ? 'bg-red-100 text-red-700' 
                    : 'bg-green-100 text-green-700'
                }`}>
                  {editedUser.status === 0 ? 'Deactivated' : 'Active'}
                </span>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="space-y-3 pt-2">
              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={handleResetPassword}
                  disabled={isLoading}
                  className="flex-1 py-2.5 bg-amber-50 text-amber-600 rounded-xl font-medium text-sm hover:bg-amber-100 transition-all disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  🔑 Reset Password
                </button>

                {editedUser.id !== currentUserId && (
                  <button
                    type="button"
                    onClick={handleToggleStatus}
                    disabled={isLoading}
                    className={`flex-1 py-2.5 rounded-xl font-medium text-sm transition-all disabled:opacity-50 flex items-center justify-center gap-2 ${
                      editedUser.status === 0
                        ? 'bg-green-50 text-green-600 hover:bg-green-100'
                        : 'bg-red-50 text-red-600 hover:bg-red-100'
                    }`}
                  >
                    {editedUser.status === 0 ? '✅ Activate' : '🔴 Deactivate'}
                  </button>
                )}
              </div>

              {/* Save Button */}
              <button
                type="button"
                onClick={handleSave}
                disabled={isLoading || (!hasChanges())}
                className={`w-full py-3 rounded-xl font-semibold text-sm transition-all flex items-center justify-center gap-2 ${
                  hasChanges()
                    ? 'bg-blue-500 text-white hover:bg-blue-600 shadow-md shadow-blue-200'
                    : 'bg-gray-100 text-gray-400 cursor-not-allowed'
                }`}
              >
                <SaveIcon />
                {hasChanges() ? 'Save Changes' : 'No Changes'}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Save Confirmation Dialog */}
      <ConfirmDialog
        isOpen={showSaveConfirm}
        title="Save Changes"
        message={`Are you sure you want to save changes for "${editedUser.username}"?`}
        onConfirm={confirmSave}
        onCancel={() => setShowSaveConfirm(false)}
        confirmText={isSaving ? 'Saving...' : 'Save'}
        confirmVariant="primary"
      />

      {/* Reset Password Confirmation Dialog */}
      <ConfirmDialog
        isOpen={showResetConfirm}
        title="Reset Password"
        message={`Reset password for "${editedUser.username}"?\n\nNew password will be: Password123`}
        onConfirm={confirmResetPassword}
        onCancel={() => setShowResetConfirm(false)}
        confirmText={isActionLoading ? 'Resetting...' : 'Reset Password'}
        confirmVariant="primary"
      />

      {/* Status Change Confirmation Dialog */}
      <ConfirmDialog
        isOpen={showStatusConfirm}
        title={editedUser.status === 0 ? "Activate User" : "Deactivate User"}
        message={`Are you sure you want to ${editedUser.status === 0 ? 'activate' : 'deactivate'} "${editedUser.username}"?`}
        onConfirm={confirmToggleStatus}
        onCancel={() => setShowStatusConfirm(false)}
        confirmText={isActionLoading ? 'Processing...' : (editedUser.status === 0 ? 'Activate' : 'Deactivate')}
        confirmVariant={editedUser.status === 0 ? "primary" : "danger"}
      />
    </>
  );
}