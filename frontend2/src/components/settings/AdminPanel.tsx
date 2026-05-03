'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { useToast } from '@/context/ToastContext';
import api from '@/services/api';
import EditUserModal from './EditUserModal';
import AddUserModal from './AddUserModal';

const ChevronLeftIcon = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <polyline points="15 18 9 12 15 6" />
  </svg>
);

const UserPlusIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M16 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
    <circle cx="8.5" cy="7" r="4" />
    <line x1="20" y1="8" x2="20" y2="14" />
    <line x1="23" y1="11" x2="17" y2="11" />
  </svg>
);

const RefreshIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M23 4v6h-6" />
    <path d="M1 20v-6h6" />
    <path d="M3.51 9a9 9 0 0 1 14.85-3.36L23 10" />
    <path d="M20.49 15a9 9 0 0 1-14.85 3.36L1 14" />
  </svg>
);

interface AdminPanelProps {
  onBack: () => void;
}

const adminService = {
  getUsers: async () => {
    const response = await api.get('/admin/users');
    return response.data;
  },
  createUser: async (data: any) => {
    const response = await api.post('/admin/users', data);
    return response.data;
  },
  updateUser: async (id: number, data: any) => {
    const response = await api.put(`/admin/users/${id}`, data);
    return response.data;
  },
  resetPassword: async (id: number) => {
    const response = await api.post(`/admin/users/${id}/reset-password`);
    return response.data;
  },
  toggleUserStatus: async (id: number) => {
    const response = await api.post(`/admin/users/${id}/deactivate`);
    return response.data;
  }
};

export default function AdminPanel({ onBack }: AdminPanelProps) {
  const { user } = useAuth();
  const { showToast } = useToast();
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [data, setData] = useState<any[]>([]);
  const [showAddUser, setShowAddUser] = useState(false);
  const [editingUser, setEditingUser] = useState<any>(null);
  const [searchQuery, setSearchQuery] = useState('');

  const fetchUsers = async () => {
    setRefreshing(true);
    try {
      const result = await adminService.getUsers();
      if (result.success) {
        setData(result.data);
      }
    } catch (err) {
      console.error(err);
      showToast('Failed to load users', 'error');
    } finally {
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const filteredUsers = data.filter(u => 
    u.username.toLowerCase().includes(searchQuery.toLowerCase()) ||
    u.email.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleResetPassword = async (id: number, username: string) => {
    try {
      const result = await adminService.resetPassword(id);
      showToast(result.message || 'Password reset successfully', 'success');
      await fetchUsers();
    } catch (err: any) {
      showToast(err.response?.data?.message || 'Failed to reset password', 'error');
      throw err;
    }
  };

  const handleToggleStatus = async (userData: any) => {
    try {
      const result = await adminService.toggleUserStatus(userData.id);
      showToast(result.message || `User status updated`, 'success');
      await fetchUsers();
    } catch (err: any) {
      showToast(err.response?.data?.message || 'Failed to update status', 'error');
      throw err;
    }
  };

  const handleUpdateUser = async (updatedUser: any) => {
    setLoading(true);
    try {
      await adminService.updateUser(updatedUser.id, {
        username: updatedUser.username,
        email: updatedUser.email
      });
      showToast('User updated successfully', 'success');
      await fetchUsers();
    } catch (err: any) {
      showToast(err.response?.data?.message || 'Failed to update user', 'error');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const handleAddUser = async (newUser: any) => {
    setLoading(true);
    try {
      await adminService.createUser(newUser);
      showToast('User created successfully', 'success');
      setShowAddUser(false);
      await fetchUsers();
    } catch (err: any) {
      showToast(err.response?.data?.message || 'Failed to create user', 'error');
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadge = (status: number) => {
    if (status === 0) {
      return { text: 'Deactivated', color: 'bg-red-100 text-red-700', dot: 'bg-red-500' };
    }
    return { text: 'Active', color: 'bg-green-100 text-green-700', dot: 'bg-green-500' };
  };

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
        <h1 className="text-xl font-semibold text-gray-900">Admin Panel</h1>
      </div>

      <div className="p-4 max-w-4xl mx-auto">
        <div className="space-y-5">
          {/* Header Section */}
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
            <div>
              <h2 className="text-lg font-bold text-gray-900">User Management</h2>
              <p className="text-sm text-gray-500">Manage system users and permissions</p>
            </div>
            <div className="flex gap-2">
              <button
                onClick={fetchUsers}
                disabled={refreshing}
                className="p-2 text-gray-500 hover:text-blue-500 hover:bg-blue-50 rounded-xl transition-colors disabled:opacity-50"
                title="Refresh"
              >
                <RefreshIcon />
              </button>
              <button
                onClick={() => setShowAddUser(true)}
                className="bg-blue-500 text-white px-4 py-2 rounded-xl text-sm font-medium flex items-center gap-2 hover:bg-blue-600 transition-all shadow-md shadow-blue-200"
              >
                <UserPlusIcon /> Add User
              </button>
            </div>
          </div>

          {/* Search Bar */}
          <div className="relative">
            <div className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="11" cy="11" r="8" />
                <line x1="21" y1="21" x2="16.65" y2="16.65" />
              </svg>
            </div>
            <input
              type="text"
              placeholder="Search by name or email..."
              className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>

          {/* Users List */}
          {refreshing && data.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16">
              <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-500 mb-3"></div>
              <p className="text-sm text-gray-500">Loading users...</p>
            </div>
          ) : filteredUsers.length === 0 ? (
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 text-center py-16">
              <div className="text-gray-300 mb-3">
                <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1">
                  <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
                  <circle cx="12" cy="7" r="4" />
                </svg>
              </div>
              <p className="text-gray-500">
                {searchQuery ? 'No users match your search' : 'No users found'}
              </p>
            </div>
          ) : (
            <div className="space-y-2">
              {filteredUsers.map((u) => {
                const status = getStatusBadge(u.status);
                return (
                  <div
                    key={u.id}
                    onClick={() => setEditingUser(u)}
                    className="bg-white rounded-xl border border-gray-100 p-4 cursor-pointer hover:shadow-md transition-all hover:border-blue-200 group"
                  >
                    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
                      <div className="flex items-center gap-3">
                        <div className={`w-12 h-12 rounded-xl flex items-center justify-center font-bold text-lg transition-colors ${
                          u.status === 0 ? 'bg-gray-100 text-gray-500' : 'bg-blue-100 text-blue-600 group-hover:bg-blue-200'
                        }`}>
                          {u.username?.[0]?.toUpperCase()}
                        </div>
                        <div>
                          <div className="flex items-center gap-2 flex-wrap">
                            <h4 className={`font-semibold ${u.status === 0 ? 'text-gray-500' : 'text-gray-900'}`}>
                              {u.username}
                            </h4>
                            <span className={`text-xs px-2 py-0.5 rounded-full ${status.color}`}>
                              {status.text}
                            </span>
                          </div>
                          <p className="text-sm text-gray-500">{u.email}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className={`text-xs font-medium px-2 py-1 rounded-full ${
                          u.role === 'admin' ? 'bg-purple-100 text-purple-700' : 'bg-gray-100 text-gray-600'
                        }`}>
                          {u.role === 'admin' ? '👑 Admin' : '👤 User'}
                        </span>
                        <div className={`w-2 h-2 rounded-full ${status.dot}`}></div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* Modals */}
      {editingUser && (
        <EditUserModal
          user={editingUser}
          currentUserId={user?.id}
          onClose={() => setEditingUser(null)}
          onSave={handleUpdateUser}
          onResetPassword={handleResetPassword}
          onToggleStatus={handleToggleStatus}
          loading={loading}
        />
      )}

      {showAddUser && (
        <AddUserModal
          onClose={() => setShowAddUser(false)}
          onSave={handleAddUser}
          loading={loading}
        />
      )}

      {/* Bottom Navigation */}
      <div className="fixed bottom-0 left-0 right-0 bg-white border-t flex justify-around py-3 shadow-lg">
        <button onClick={() => window.location.href = '/home'} className="text-gray-500 hover:text-blue-500 transition-colors">Home</button>
        <button onClick={() => window.location.href = '/tasks'} className="text-gray-500 hover:text-blue-500 transition-colors">Tasks</button>
        <button onClick={() => window.location.href = '/settings'} className="text-blue-500">Settings</button>
      </div>
    </div>
  );
}