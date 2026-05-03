import api from './api';

export interface MasterItem {
  id: number;
  name: string;
  user_id?: number;
}

export const masterService = {
  // 获取 Advisor 列表
  async getAdvisors(): Promise<MasterItem[]> {
    try {
      const response = await api.get('/master/advisors');
      // 后端返回格式: { success: true, data: [...] }
      const data = response.data.data || response.data;
      return Array.isArray(data) ? data : [];
    } catch (error) {
      console.error('Failed to fetch advisors:', error);
      return [];
    }
  },

  // 获取 Outsource Partner 列表
  async getOutsourcePartners(): Promise<MasterItem[]> {
    try {
      const response = await api.get('/master/outsource_partners');
      const data = response.data.data || response.data;
      return Array.isArray(data) ? data : [];
    } catch (error) {
      console.error('Failed to fetch outsource partners:', error);
      return [];
    }
  },

  // 获取 Business User 列表
  async getBusinessUsers(): Promise<MasterItem[]> {
    try {
      const response = await api.get('/master/business_users');
      const data = response.data.data || response.data;
      return Array.isArray(data) ? data : [];
    } catch (error) {
      console.error('Failed to fetch business users:', error);
      return [];
    }
  },

  // 获取 Cost Center 列表
  async getCostCenters(): Promise<MasterItem[]> {
    try {
      const response = await api.get('/master/cost_centers');
      const data = response.data.data || response.data;
      return Array.isArray(data) ? data : [];
    } catch (error) {
      console.error('Failed to fetch cost centers:', error);
      return [];
    }
  },

  // ========== NEW METHODS (不影响现有功能) ==========
  
  // 获取 Categories 列表
  async getCategories(): Promise<MasterItem[]> {
    try {
      const response = await api.get('/master/categories');
      const data = response.data.data || response.data;
      return Array.isArray(data) ? data : [];
    } catch (error) {
      console.error('Failed to fetch categories:', error);
      return [];
    }
  },

  // 创建新的 Master Item
  async create(type: string, data: { name: string }): Promise<MasterItem | null> {
    try {
      let endpoint = '';
      switch (type) {
        case 'advisors':
          endpoint = '/master/advisors';
          break;
        case 'business_users':
          endpoint = '/master/business_users';
          break;
        case 'cost_centers':
          endpoint = '/master/cost_centers';
          break;
        case 'outsource_partners':
          endpoint = '/master/outsource_partners';
          break;
        case 'categories':
          endpoint = '/master/categories';
          break;
        default:
          throw new Error('Invalid master type');
      }

      const response = await api.post(endpoint, data);
      return response.data.data || response.data;
    } catch (error) {
      console.error('Failed to create master item:', error);
      throw error;
    }
  },

  // 删除 Master Item
  async delete(type: string, id: number): Promise<boolean> {
    try {
      let endpoint = '';
      switch (type) {
        case 'advisors':
          endpoint = `/master/advisors/${id}`;
          break;
        case 'business_users':
          endpoint = `/master/business_users/${id}`;
          break;
        case 'cost_centers':
          endpoint = `/master/cost_centers/${id}`;
          break;
        case 'outsource_partners':
          endpoint = `/master/outsource_partners/${id}`;
          break;
        case 'categories':
          endpoint = `/master/categories/${id}`;
          break;
        default:
          throw new Error('Invalid master type');
      }

      await api.delete(endpoint);
      return true;
    } catch (error) {
      console.error('Failed to delete master item:', error);
      throw error;
    }
  },

  // 更新 Master Item
  async update(type: string, id: number, data: { name: string }): Promise<MasterItem | null> {
    try {
      let endpoint = '';
      switch (type) {
        case 'advisors':
          endpoint = `/master/advisors/${id}`;
          break;
        case 'business_users':
          endpoint = `/master/business_users/${id}`;
          break;
        case 'cost_centers':
          endpoint = `/master/cost_centers/${id}`;
          break;
        case 'outsource_partners':
          endpoint = `/master/outsource_partners/${id}`;
          break;
        case 'categories':
          endpoint = `/master/categories/${id}`;
          break;
        default:
          throw new Error('Invalid master type');
      }

      const response = await api.put(endpoint, data);
      return response.data.data || response.data;
    } catch (error) {
      console.error('Failed to update master item:', error);
      throw error;
    }
  },
};