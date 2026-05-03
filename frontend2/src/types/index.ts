export interface User {
  id: number;
  username: string;
  email: string;
  role: 'admin' | 'user';
  is_active: boolean;
  created_at?: string;
  updated_at?: string;
}

export interface MasterDataItem {
  id: number;
  name: string;
  user_id?: number;
}

export interface Task {
  id: number;
  project_name: string;
  description: string;
  priority: string;  // '1', '2', '3', '4', '5'
  status: 'active' | 'in_progress' | 'kiv' | 'completed';
  deadline: string;
  is_favourite: number | boolean;
  created_at?: string;
  updated_at?: string;
  
  // ID 字段（用于表单）
  advisor_id?: number | null;
  business_user_id?: number | null;
  cost_center_id?: number | null;
  outsource_partner_id?: number | null;
  
  // 对象字段（后端返回的完整对象，用于显示）
  advisor?: MasterDataItem | null;
  business_user?: MasterDataItem | null;
  cost_center?: MasterDataItem | null;
  outsource_partner?: MasterDataItem | null;
  
  solutions?: Solution[];
}

export interface Solution {
  id?: number;
  task_id?: number;
  solution: string;
  created_at?: string;
  costs?: Cost[];
  risks?: Risk[];
}

export interface Cost {
  id?: number;
  solution_id?: number;
  cost: number;
  manpower: string;
  maintenance_cost: number;
}

export interface Risk {
  id?: number;
  solution_id?: number;
  risk: string;
  mitigation: string;
}

export interface LoginRequest {
  username: string;
  password: string;
}

export interface LoginResponse {
  token: string;
  refreshToken: string;
  user: User;
}

export interface CreateTaskRequest {
  project_name: string;
  description?: string;
  priority: string;
  status: string;
  deadline?: string;
  is_favourite?: boolean;
  advisor_id?: number | null;
  outsource_partner_id?: number | null;
  business_user_id?: number | null;
  cost_center_id?: number | null;
  solutions?: Array<{
    solution: string;
    costs?: Array<{
      cost: number;
      manpower: string;
      maintenance_cost: number;
    }>;
    risks?: Array<{
      risk: string;
      mitigation: string;
    }>;
  }>;
}

export interface UpdateTaskRequest {
  project_name?: string;
  description?: string;
  priority?: string;
  status?: string;
  deadline?: string | null;
  is_favourite?: number;
  advisor_id?: number | null;
  outsource_partner_id?: number | null;
  business_user_id?: number | null;
  cost_center_id?: number | null;
}

export interface TaskFilters {
  status?: string;
  favourite?: string;
  search?: string;
}

export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  message?: string;
  error?: string;
}