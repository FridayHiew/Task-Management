'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { useToast } from '@/context/ToastContext';
import { taskService } from '@/services/task.service';
import TaskTable from '@/components/tasks/TaskTable';
import { Task } from '@/types';

export default function HomeScreen() {
  const router = useRouter();
  const { logout, user } = useAuth();
  const { showToast } = useToast();
  const [tasks, setTasks] = useState<Task[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [greeting, setGreeting] = useState('');

  useEffect(() => {
    loadFavouriteTasks();
    setGreeting(getGreeting());
  }, []);

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good morning';
    if (hour < 18) return 'Good afternoon';
    return 'Good evening';
  };

  const loadFavouriteTasks = async () => {
    try {
      setIsLoading(true);
      const data = await taskService.getTasks({ favourite: 'true' });
      
      const sortedTasks = (data || []).sort((a, b) => Number(a.priority) - Number(b.priority));
      
      setTasks(sortedTasks);
    } catch (error) {
      console.error('Load favourite tasks error:', error);
      setTasks([]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleToggleFavourite = async (task: Task) => {
    try {
      await taskService.toggleFavourite(task.id, false);
      setTasks(prev => prev.filter(t => t.id !== task.id));
      showToast('Removed from favourites', 'success');
    } catch (error) {
      console.error('Toggle favourite error:', error);
      showToast('Failed to update', 'error');
    }
  };

  const handleTaskClick = (task: Task) => {
    router.push(`/tasks/byId?id=${task.id}`);
  };

  const handleLogout = async () => {
    await logout();
    showToast('Logged out successfully', 'success');
    router.push('/login');
  };

  const totalTasks = tasks.length;
  const highPriorityCount = tasks.filter(t => Number(t.priority) <= 2).length;
  const urgentTasks = tasks.filter(t => {
    if (!t.deadline) return false;
    const deadline = new Date(t.deadline);
    const today = new Date();
    const diffDays = Math.ceil((deadline.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
    return diffDays <= 3 && diffDays >= 0;
  }).length;

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-gray-100 pb-20">
      {/* Simple Header */}
      <div className="bg-white border-b border-gray-100 px-4 pt-8 pb-4">
        <div>
          <p className="text-sm text-gray-500">{greeting}</p>
          <h1 className="text-2xl font-bold text-gray-900 mt-1">Favourite Tasks</h1>
          <br/>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="px-4 -mt-4 mb-6">
        <div className="grid grid-cols-3 gap-3">
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-3 text-center">
            <div className="text-2xl font-bold text-blue-600">{totalTasks}</div>
            <div className="text-xs text-gray-500 mt-1">Total Favourites</div>
          </div>
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-3 text-center">
            <div className="text-2xl font-bold text-orange-600">{highPriorityCount}</div>
            <div className="text-xs text-gray-500 mt-1">High Priority</div>
          </div>
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-3 text-center">
            <div className="text-2xl font-bold text-red-600">{urgentTasks}</div>
            <div className="text-xs text-gray-500 mt-1">Urgent</div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="px-4">
        {isLoading ? (
          <div className="flex flex-col items-center justify-center py-16">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mb-4"></div>
            <p className="text-gray-500 text-sm">Loading your favourites...</p>
          </div>
        ) : tasks.length === 0 ? (
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-12 text-center">
            <div className="w-20 h-20 mx-auto mb-4 bg-yellow-50 rounded-full flex items-center justify-center">
              <span className="text-3xl">⭐</span>
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">No Favourite Tasks</h3>
            <p className="text-gray-500 text-sm mb-6 max-w-xs mx-auto">
              Click the star icon on any task to add it to your favourites list
            </p>
            <button 
              onClick={() => router.push('/tasks')}
              className="inline-flex items-center gap-2 bg-blue-500 hover:bg-blue-600 text-white px-6 py-2.5 rounded-xl font-medium transition-all shadow-sm"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
              </svg>
              Browse All Tasks
            </button>
          </div>
        ) : (
          <div className="space-y-4">
            {/* Header with count */}
            <div className="flex justify-between items-center">
              <h2 className="text-lg font-semibold text-gray-900">⭐ Your Favourites</h2>
              <span className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded-full">
                {tasks.length} tasks
              </span>
            </div>
            
            {/* Task Table */}
            <TaskTable
              tasks={tasks}
              onToggleFavourite={handleToggleFavourite}
              onRowClick={handleTaskClick}
            />
          </div>
        )}
      </div>

      {/* Bottom Navigation */}
      <div className="fixed bottom-0 left-0 right-0 bg-white border-t flex justify-around py-3 shadow-lg">
        <button 
          onClick={() => router.push('/home')} 
          className="flex flex-col items-center gap-1 text-blue-500"
        >
          <svg className="w-5 h-5" fill="currentColor" stroke="none" viewBox="0 0 24 24">
            <path d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
          </svg>
          <span className="text-xs">Home</span>
        </button>
        <button 
          onClick={() => router.push('/tasks')} 
          className="flex flex-col items-center gap-1 text-gray-400 hover:text-gray-600 transition-colors"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
          </svg>
          <span className="text-xs">Tasks</span>
        </button>
        <button 
          onClick={() => router.push('/settings')} 
          className="flex flex-col items-center gap-1 text-gray-400 hover:text-gray-600 transition-colors"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
            <circle cx="12" cy="12" r="3" />
          </svg>
          <span className="text-xs">Settings</span>
        </button>
      </div>
    </div>
  );
}