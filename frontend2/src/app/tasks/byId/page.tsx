'use client';

import { Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { useToast } from '@/context/ToastContext';
import { taskService } from '@/services/task.service';
import { masterService, MasterItem } from '@/services/master.service';
import TaskForm from '@/components/tasks/TaskForm';
import ConfirmDialog from '@/components/common/ConfirmDialog';
import { Task, UpdateTaskRequest } from '@/types';
import { FiArrowLeft, FiEdit2, FiTrash2, FiStar, FiStar as FiStarOutline } from 'react-icons/fi';
import { useEffect, useState } from 'react';

// Separate component that uses useSearchParams
function TaskDetailContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const id = searchParams.get('id');
  
  const { user } = useAuth();
  const { showToast } = useToast();
  const [task, setTask] = useState<Task | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isEditMode, setIsEditMode] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  
  // Dropdown data states
  const [advisorOptions, setAdvisorOptions] = useState<MasterItem[]>([]);
  const [outsourceOptions, setOutsourceOptions] = useState<MasterItem[]>([]);
  const [businessUserOptions, setBusinessUserOptions] = useState<MasterItem[]>([]);
  const [costCenterOptions, setCostCenterOptions] = useState<MasterItem[]>([]);
  const [isLoadingDropdowns, setIsLoadingDropdowns] = useState(true);

  // Fetch dropdown data from API
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

  useEffect(() => {
    if (!id) {
      showToast('No task ID provided', 'error');
      router.push('/tasks');
      return;
    }
    
    const taskId = parseInt(id, 10);
    if (isNaN(taskId)) {
      showToast('Invalid task ID', 'error');
      router.push('/tasks');
      return;
    }
    
    loadTask(taskId);
  }, [id]);

  const formatDate = (date: string) => {
    if (!date) return '-';
    const d = new Date(date);
    return d.toLocaleDateString('en-GB', {
      day: '2-digit',
      month: 'short',
      year: 'numeric'
    });
  };

  const loadTask = async (taskId: number) => {
    try {
      setIsLoading(true);
      const data = await taskService.getTaskById(taskId);
      if (!data) {
        showToast('Task not found', 'error');
        router.push('/tasks');
        return;
      }
      setTask(data);
    } catch (error) {
      console.error('Load task error:', error);
      showToast('Failed to load task', 'error');
      router.push('/tasks');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSave = async (updatedTask: UpdateTaskRequest) => {
    if (!task) return;
    
    try {
      console.log('Saving updated task:', updatedTask);
      const result = await taskService.updateTask(task.id, updatedTask);
      console.log('Update result:', result);
      
      if (result) {
        showToast('Task updated successfully', 'success');
        setIsEditMode(false);
        setTask(result);
        router.push('/tasks');
      } else {
        showToast('Failed to update task', 'error');
      }
    } catch (error: any) {
      console.error('Update error:', error);
      const errorMessage = error?.response?.data?.message || error?.message || 'Failed to update task';
      showToast(errorMessage, 'error');
    }
  };

  const handleDelete = async () => {
    if (!task) return;
    
    try {
      await taskService.deleteTask(task.id);
      showToast('Task deleted successfully', 'success');
      router.push('/tasks');
    } catch (error: any) {
      console.error('Delete error:', error);
      showToast(error?.response?.data?.message || 'Failed to delete task', 'error');
    }
  };

  const handleToggleFavourite = async () => {
    if (!task) return;
    
    try {
      const result = await taskService.toggleFavourite(task.id, !task.is_favourite);
      if (result) {
        setTask({ ...task, is_favourite: !task.is_favourite });
        showToast(task.is_favourite ? 'Removed from favourites' : 'Added to favourites', 'success');
      }
    } catch (error) {
      showToast('Failed to update', 'error');
    }
  };

  if (isLoading || isLoadingDropdowns) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (!task) return null;

  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      {/* Header */}
      <div className="bg-white shadow-sm border-b px-4 py-3">
        <div className="flex items-center gap-3">
          <button onClick={() => router.back()} className="p-1 hover:bg-gray-100 rounded-full">
            <FiArrowLeft className="text-xl" />
          </button>
          <h1 className="text-xl font-semibold flex-1">
            {isEditMode ? 'Edit Task' : 'Task Details'}
          </h1>
          {!isEditMode && (
            <div className="flex gap-2">
              <button onClick={handleToggleFavourite} className="p-2 hover:bg-gray-100 rounded-full">
                {task.is_favourite ? (
                  <FiStar className="text-yellow-500 fill-yellow-500" size={20} />
                ) : (
                  <FiStarOutline size={20} />
                )}
              </button>
              <button onClick={() => setIsEditMode(true)} className="p-2 hover:bg-gray-100 rounded-full">
                <FiEdit2 className="text-blue-500" size={20} />
              </button>
              <button onClick={() => setShowDeleteDialog(true)} className="p-2 hover:bg-gray-100 rounded-full">
                <FiTrash2 className="text-red-500" size={20} />
              </button>
            </div>
          )}
        </div>
      </div>

      <div className="p-4">
        <TaskForm
          initialData={task}
          onSubmit={handleSave}
          isEditMode={isEditMode}
          onCancel={() => setIsEditMode(false)}
          advisorOptions={advisorOptions}
          outsourceOptions={outsourceOptions}
          businessUserOptions={businessUserOptions}
          costCenterOptions={costCenterOptions}
        />
      </div>

      {/* Bottom Navigation */}
      <div className="fixed bottom-0 left-0 right-0 bg-white border-t flex justify-around py-3">
        <button onClick={() => router.push('/home')} className="text-gray-500">Home</button>
        <button onClick={() => router.push('/tasks')} className="text-blue-500">Tasks</button>
        <button onClick={() => router.push('/settings')} className="text-gray-500">Settings</button>
      </div>

      {/* Delete Confirmation */}
      <ConfirmDialog
        isOpen={showDeleteDialog}
        title="Delete Task"
        message={`Are you sure you want to delete "${task.project_name}"? This action cannot be undone.`}
        onConfirm={handleDelete}
        onCancel={() => setShowDeleteDialog(false)}
        confirmText="Delete"
        confirmVariant="danger"
      />
    </div>
  );
}

// Main page component with Suspense boundary
export default function TaskDetailScreen() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
      </div>
    }>
      <TaskDetailContent />
    </Suspense>
  );
}