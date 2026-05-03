import api from './api';
import { Task, CreateTaskRequest, UpdateTaskRequest, TaskFilters } from '@/types';

export const taskService = {
  // 获取所有任务
 async getTasks(filters?: TaskFilters): Promise<Task[]> {
  try {
    const params: any = {};
    if (filters?.status && filters.status !== 'all') params.status = filters.status;
    if (filters?.favourite) params.favourite = filters.favourite;
    
    console.log('Fetching tasks with params:', params);
    const response = await api.get('/tasks', { params });
    console.log('Tasks response:', response.data);
    
    let tasks = [];
    
    // Handle array response
    if (Array.isArray(response.data)) {
      tasks = response.data;
    } 
    // Handle object response with data property
    else if (response.data && response.data.data && Array.isArray(response.data.data)) {
      tasks = response.data.data;
    }
    // Handle single task object (your current issue)
    else if (response.data && typeof response.data === 'object' && response.data.id) {
      console.warn('API returned single task instead of array, converting to array');
      tasks = [response.data];
    }
    // Handle error response
    else if (response.data && response.data.success === false) {
      console.error('API returned error:', response.data.message);
      return [];
    }
    // For any other case, return empty array
    else {
      console.warn('Unexpected response format:', response.data);
      tasks = [];
    }
    
    // Client-side search filtering
    if (filters?.search && tasks.length > 0) {
      const searchLower = filters.search.toLowerCase();
      tasks = tasks.filter((task: Task) => 
        task.project_name?.toLowerCase().includes(searchLower) ||
        task.description?.toLowerCase().includes(searchLower)
      );
    }
    
    return tasks;
    
  } catch (error) {
    console.error('getTasks error:', error);
    return [];
  }
  },

  // 获取单个任务详情
  async getTaskById(id: number): Promise<Task | null> {
    try {
      console.log('Fetching task with id:', id);
      const response = await api.get(`/tasks/${id}`);
      console.log('Task response:', response.data);
      
      // ✅ FIX 2: Check for error response
      if (response.data && response.data.success === false) {
        console.error('API returned error:', response.data.message);
        return null;
      }
      
      return response.data;
    } catch (error) {
      console.error('getTaskById error:', error);
      return null;
    }
  },

  // 创建任务
  async createTask(data: CreateTaskRequest): Promise<Task | null> {
    try {
      console.log('Creating task with data:', data);
      const response = await api.post('/tasks', data);
      console.log('Create task response:', response.data);
      
      // ✅ FIX 3: Check for error response
      if (response.data && response.data.success === false) {
        console.error('API returned error:', response.data.message);
        throw new Error(response.data.message);
      }
      
      return response.data;
    } catch (error: any) {
      console.error('createTask error:', error);
      console.error('Error response:', error.response?.data);
      throw error;
    }
  },
  
  // 更新任务
  async updateTask(id: number, data: UpdateTaskRequest): Promise<Task | null> {
    try {
      console.log('Updating task:', id, data);
      const response = await api.put(`/tasks/${id}`, data);
      console.log('Update response:', response.data);
      
      // ✅ FIX 4: Check for error response
      if (response.data && response.data.success === false) {
        console.error('API returned error:', response.data.message);
        throw new Error(response.data.message);
      }
      
      return response.data;
    } catch (error: any) {
      console.error('updateTask error:', error);
      throw error;
    }
  },

  // 删除任务
  async deleteTask(id: number): Promise<boolean> {
    try {
      const response = await api.delete(`/tasks/${id}`);
      
      // ✅ FIX 5: Check for success response
      if (response.data && response.data.success === false) {
        console.error('API returned error:', response.data.message);
        throw new Error(response.data.message);
      }
      
      return true;
    } catch (error) {
      console.error('deleteTask error:', error);
      throw error;
    }
  },

  // 切换收藏状态
  async toggleFavourite(id: number, isFavourite: boolean): Promise<Task | null> {
    // 将 boolean 转换为 number (1 或 0)
    return this.updateTask(id, { is_favourite: isFavourite ? 1 : 0 });
  },
}