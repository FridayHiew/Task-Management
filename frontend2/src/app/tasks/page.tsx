'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { useToast } from '@/context/ToastContext';
import { taskService } from '@/services/task.service';
import { masterService, MasterItem } from '@/services/master.service';
import TaskTable from '@/components/tasks/TaskTable';
import TaskForm from '@/components/tasks/TaskForm';
import ConfirmDialog from '@/components/common/ConfirmDialog';
import { Task } from '@/types';
import { FiSearch, FiPlus, FiArrowLeft, FiX } from 'react-icons/fi';

export default function TaskListScreen() {
  const router = useRouter();
  const { user } = useAuth();
  const { showToast } = useToast();
  const [tasks, setTasks] = useState<Task[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [priorityFilter, setPriorityFilter] = useState<number | null>(null);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [taskToDelete, setTaskToDelete] = useState<Task | null>(null);
  
  const [advisorOptions, setAdvisorOptions] = useState<MasterItem[]>([]);
  const [outsourceOptions, setOutsourceOptions] = useState<MasterItem[]>([]);
  const [businessUserOptions, setBusinessUserOptions] = useState<MasterItem[]>([]);
  const [costCenterOptions, setCostCenterOptions] = useState<MasterItem[]>([]);
  const [isLoadingDropdowns, setIsLoadingDropdowns] = useState(true);

  useEffect(() => {
    loadTasks();
  }, []);

  useEffect(() => {
    const fetchDropdownData = async () => {
      setIsLoadingDropdowns(true);
      try {
        const [advisors, outsource, businessUsers, costCenters] = await Promise.all([
          masterService.getAdvisors(),
          masterService.getOutsourcePartners(),
          masterService.getBusinessUsers(),
          masterService.getCostCenters(),
        ]);
        setAdvisorOptions(advisors);
        setOutsourceOptions(outsource);
        setBusinessUserOptions(businessUsers);
        setCostCenterOptions(costCenters);
      } catch (error) {
        console.error('Failed to fetch dropdown data:', error);
      } finally {
        setIsLoadingDropdowns(false);
      }
    };
    
    fetchDropdownData();
  }, []);

  const loadTasks = async () => {
    try {
      setIsLoading(true);
      const data = await taskService.getTasks({});
      const sortedTasks = (data || []).sort((a, b) => Number(a.priority) - Number(b.priority));
      setTasks(sortedTasks);
    } catch (error) {
      console.error('Load tasks error:', error);
      showToast('Failed to load tasks', 'error');
      setTasks([]);
    } finally {
      setIsLoading(false);
    }
  };

  // Priority card configuration
  const priorityCards = [
    { priority: 1, label: 'Highest', color: 'bg-red-100', textColor: 'text-red-600'},
    { priority: 2, label: 'High', color: 'bg-orange-100', textColor: 'text-orange-600'},
    { priority: 3, label: 'Medium', color: 'bg-yellow-100', textColor: 'text-yellow-600'},
    { priority: 4, label: 'Low', color: 'bg-blue-100', textColor: 'text-blue-600'},
    { priority: 5, label: 'Lowest', color: 'bg-green-100', textColor: 'text-green-600'},
  ];

  // Count tasks by priority
  const getPriorityCount = (priority: number) => {
    return tasks.filter(t => Number(t.priority) === priority).length;
  };

  const totalTasks = tasks.length;
  const filteredTasks = tasks.filter(task => {
    // Apply priority filter
    if (priorityFilter !== null && Number(task.priority) !== priorityFilter) {
      return false;
    }
    // Apply search filter
    if (!searchQuery) return true;
    const query = searchQuery.toLowerCase();
    return task.project_name?.toLowerCase().includes(query) ||
           task.description?.toLowerCase().includes(query);
  });

  const handleToggleFavourite = async (task: Task) => {
    try {
      await taskService.toggleFavourite(task.id, !task.is_favourite);
      setTasks(prev => prev.map(t =>
        t.id === task.id ? { ...t, is_favourite: !t.is_favourite } : t
      ));
      showToast(task.is_favourite ? 'Removed from favourites' : 'Added to favourites', 'success');
    } catch (error) {
      showToast('Failed to update', 'error');
    }
  };

  const handleTaskClick = (task: Task) => {
    router.push(`/tasks/byId?id=${task.id}`);
  };

  const handleCreateTask = async (data: any) => {
    try {
      const newTask = await taskService.createTask(data);
      if (newTask) {
        showToast('Task created successfully', 'success');
        setShowCreateForm(false);
        loadTasks();
      } else {
        showToast('Failed to create task', 'error');
      }
    } catch (error: any) {
      showToast(error?.response?.data?.message || 'Failed to create task', 'error');
    }
  };

  const handleDeleteTask = async () => {
    if (!taskToDelete) return;
    try {
      await taskService.deleteTask(taskToDelete.id);
      showToast('Task deleted successfully', 'success');
      setTaskToDelete(null);
      loadTasks();
    } catch (error) {
      showToast('Failed to delete task', 'error');
    }
  };

  const getPriorityLabel = (priority: number) => {
    return priorityCards.find(p => p.priority === priority)?.label || 'Unknown';
  };

  const clearAllFilters = () => {
    setPriorityFilter(null);
    setSearchQuery('');
  };

  const hasActiveFilters = priorityFilter !== null || searchQuery !== '';

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-gray-100 pb-20">
      {/* Header */}
      <div className="bg-white border-b border-gray-100 px-4 pt-8 pb-4">
        {showCreateForm ? (
          <div className="flex items-center gap-3">
            <button 
              onClick={() => setShowCreateForm(false)} 
              className="p-2 -ml-2 text-gray-600 hover:bg-gray-100 rounded-full transition-colors"
            >
              <FiArrowLeft className="text-xl" />
            </button>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Create New Task</h1>
              <p className="text-sm text-gray-400 mt-1">Add a new task to your list</p>
            </div>
          </div>
        ) : (
          <div>
            <h1 className="text-2xl font-bold text-gray-900">All Tasks</h1>
            <p className="text-sm text-gray-400 mt-1">Manage and track your tasks</p>
          </div>
        )}
      </div>

      <div className="p-4">
        {showCreateForm ? (
          <TaskForm
            onSubmit={handleCreateTask}
            isEditMode={true}
            onCancel={() => setShowCreateForm(false)}
            advisorOptions={advisorOptions}
            outsourceOptions={outsourceOptions}
            businessUserOptions={businessUserOptions}
            costCenterOptions={costCenterOptions}
          />
        ) : (
          <>
            {/* Stats Bar - Responsive with wrapping */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4 mb-4">
              <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-3">
                {/* Left side - Stats and filters */}
                <div className="flex flex-wrap items-center gap-x-3 gap-y-2">
                  <div className="flex items-baseline gap-1">
                    <span className="text-2xl font-bold text-blue-600">{totalTasks}</span>
                    <span className="text-gray-500 text-sm">total tasks</span>
                  </div>
                  
                  {priorityFilter && (
                    <span className="inline-flex items-center gap-1 text-xs bg-blue-50 text-blue-700 px-2 py-1 rounded-full">
                      <span className="font-medium">Priority:</span>
                      {getPriorityLabel(priorityFilter)}
                      <button
                        onClick={() => setPriorityFilter(null)}
                        className="ml-1 hover:text-blue-900"
                      >
                        <FiX size={12} />
                      </button>
                    </span>
                  )}
                  
                  {searchQuery && (
                    <span className="inline-flex items-center gap-1 text-xs bg-gray-100 text-gray-700 px-2 py-1 rounded-full max-w-[200px]">
                      <span className="font-medium">Search:</span>
                      <span className="truncate">{searchQuery}</span>
                      <button
                        onClick={() => setSearchQuery('')}
                        className="ml-1 hover:text-gray-900"
                      >
                        <FiX size={12} />
                      </button>
                    </span>
                  )}
                  
                  {hasActiveFilters && (
                    <button
                      onClick={clearAllFilters}
                      className="text-xs text-red-500 hover:text-red-600 hover:underline ml-1"
                    >
                      Clear all
                    </button>
                  )}
                </div>
                
                {/* Right side - New Task button */}
                <button 
                  onClick={() => setShowCreateForm(true)} 
                  className="flex items-center justify-center gap-2 bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-xl font-medium transition-all shadow-sm whitespace-nowrap"
                >
                  <FiPlus size={18} />
                  New Task
                </button>
              </div>
            </div>

            {/* Priority Filter Cards */}
            <div className="mb-4">
              <div className="flex items-center justify-between mb-2">
                <h3 className="text-sm font-medium text-gray-500">Filter by Priority</h3>
                {priorityFilter && (
                  <button
                    onClick={() => setPriorityFilter(null)}
                    className="text-xs text-blue-500 hover:text-blue-600"
                  >
                    Clear
                  </button>
                )}
              </div>
              <div className="grid grid-cols-5 gap-2">
                {priorityCards.map((card) => {
                  const count = getPriorityCount(card.priority);
                  const isActive = priorityFilter === card.priority;
                  return (
                    <button
                      key={card.priority}
                      onClick={() => setPriorityFilter(isActive ? null : card.priority)}
                      className={`
                        relative py-2 px-1 rounded-xl text-center transition-all
                        ${card.color}
                        ${isActive ? 'ring-2 ring-offset-1 ring-blue-500 shadow-md' : 'hover:opacity-80'}
                      `}
                    >
                      <div className={`text-xs font-semibold ${card.textColor}`}>
                        {card.label}
                      </div>
                      <div className="text-sm font-bold text-gray-700 mt-0.5">
                        {count}
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Search Bar */}
            <div className="mb-4">
              <div className="relative">
                <FiSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search by project name or description..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-10 py-2.5 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all bg-white"
                />
                {searchQuery && (
                  <button
                    onClick={() => setSearchQuery('')}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  >
                    <FiX size={16} />
                  </button>
                )}
              </div>
            </div>

            {/* Results Summary */}
            {!isLoading && filteredTasks.length > 0 && (
              <div className="flex justify-between items-center mb-3">
                <h2 className="text-sm font-medium text-gray-500">Task List</h2>
                <span className="text-xs text-gray-400">{filteredTasks.length} tasks shown</span>
              </div>
            )}

            {/* Task List */}
            {isLoading ? (
              <div className="flex flex-col items-center justify-center py-16">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mb-4"></div>
                <p className="text-gray-500 text-sm">Loading tasks...</p>
              </div>
            ) : filteredTasks.length === 0 ? (
              <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-12 text-center">
                <div className="w-20 h-20 mx-auto mb-4 bg-gray-100 rounded-full flex items-center justify-center">
                  <span className="text-3xl">📋</span>
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">No Tasks Found</h3>
                <p className="text-gray-500 text-sm mb-6 max-w-xs mx-auto">
                  {searchQuery 
                    ? `No tasks match "${searchQuery}"` 
                    : priorityFilter 
                      ? `No tasks with ${getPriorityLabel(priorityFilter)} priority` 
                      : 'Create your first task to get started'}
                </p>
                {!searchQuery && !priorityFilter && (
                  <button 
                    onClick={() => setShowCreateForm(true)} 
                    className="inline-flex items-center gap-2 bg-blue-500 hover:bg-blue-600 text-white px-6 py-2.5 rounded-xl font-medium transition-all shadow-sm"
                  >
                    <FiPlus size={18} />
                    Create Task
                  </button>
                )}
              </div>
            ) : (
              <TaskTable
                tasks={filteredTasks}
                onToggleFavourite={handleToggleFavourite}
                onRowClick={handleTaskClick}
              />
            )}
          </>
        )}
      </div>

      {/* Bottom Navigation */}
      <div className="fixed bottom-0 left-0 right-0 bg-white border-t flex justify-around py-3 shadow-lg">
        <button onClick={() => router.push('/home')} className="flex flex-col items-center gap-1 text-gray-400 hover:text-gray-600 transition-colors">
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
          </svg>
          <span className="text-xs">Home</span>
        </button>
        <button onClick={() => router.push('/tasks')} className="flex flex-col items-center gap-1 text-blue-500">
          <svg className="w-5 h-5" fill="currentColor" stroke="none" viewBox="0 0 24 24">
            <path d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
          </svg>
          <span className="text-xs">Tasks</span>
        </button>
        <button onClick={() => router.push('/settings')} className="flex flex-col items-center gap-1 text-gray-400 hover:text-gray-600 transition-colors">
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
            <circle cx="12" cy="12" r="3" />
          </svg>
          <span className="text-xs">Settings</span>
        </button>
      </div>

      {/* Delete Confirmation Dialog */}
      <ConfirmDialog
        isOpen={!!taskToDelete}
        title="Delete Task"
        message={`Are you sure you want to delete "${taskToDelete?.project_name}"?`}
        onConfirm={handleDeleteTask}
        onCancel={() => setTaskToDelete(null)}
        confirmText="Delete"
        confirmVariant="danger"
      />
    </div>
  );
}