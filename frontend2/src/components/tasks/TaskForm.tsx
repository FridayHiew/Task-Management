'use client';

import { useState, useEffect } from 'react';
import { Task } from '@/types';
import SolutionSection from './SolutionSection';
import { MasterItem } from '@/services/master.service';
import { formatDateForInput, formatDateForDisplay, formatDateTime } from '@/utils/formatters';
import DatePicker from '@/components/common/DatePicker';

interface TaskFormProps {
  initialData?: Task;
  onSubmit: (data: any) => Promise<void>;
  isEditMode: boolean;
  onCancel: () => void;
  advisorOptions?: MasterItem[];
  outsourceOptions?: MasterItem[];
  businessUserOptions?: MasterItem[];
  costCenterOptions?: MasterItem[];
}

export default function TaskForm({ 
  initialData, 
  onSubmit, 
  isEditMode, 
  onCancel,
  advisorOptions = [],
  outsourceOptions = [],
  businessUserOptions = [],
  costCenterOptions = [],
}: TaskFormProps) {
  const [formData, setFormData] = useState({
    project_name: '',
    description: '',
    priority: '3',
    status: 'active',
    deadline: '',
    is_favourite: false,
    advisor_id: '',
    outsource_partner_id: '',
    business_user_id: '',
    cost_center_id: '',
  });
  
  const [solutions, setSolutions] = useState<any[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (initialData) {
      setFormData({
        project_name: initialData.project_name || '',
        description: initialData.description || '',
        priority: initialData.priority?.toString() || '3',
        status: initialData.status || 'active',
        deadline: initialData.deadline ? formatDateForInput(initialData.deadline) : '',
        is_favourite: !!initialData.is_favourite,
        advisor_id: initialData.advisor_id?.toString() || initialData.advisor?.id?.toString() || '',
        outsource_partner_id: initialData.outsource_partner_id?.toString() || initialData.outsource_partner?.id?.toString() || '',
        business_user_id: initialData.business_user_id?.toString() || initialData.business_user?.id?.toString() || '',
        cost_center_id: initialData.cost_center_id?.toString() || initialData.cost_center?.id?.toString() || '',
      });
      setSolutions(initialData.solutions || []);
    }
  }, [initialData]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const value = e.target.type === 'checkbox' ? (e.target as HTMLInputElement).checked : e.target.value;
    setFormData({
      ...formData,
      [e.target.name]: value,
    });
  };

  const handleDateChange = (date: string) => {
    setFormData({
      ...formData,
      deadline: date,
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      const submitData: any = {
        project_name: formData.project_name,
        description: formData.description,
        priority: formData.priority,
        status: formData.status,
        deadline: formData.deadline || null,
        is_favourite: formData.is_favourite ? 1 : 0,
        advisor_id: formData.advisor_id ? parseInt(formData.advisor_id as string) : null,
        outsource_partner_id: formData.outsource_partner_id ? parseInt(formData.outsource_partner_id as string) : null,
        business_user_id: formData.business_user_id ? parseInt(formData.business_user_id as string) : null,
        cost_center_id: formData.cost_center_id ? parseInt(formData.cost_center_id as string) : null,
      };
      
      if (solutions.length > 0) {
        submitData.solutions = solutions.map(sol => ({
          solution: sol.solution,
          costs: sol.costs && sol.costs.length > 0 ? sol.costs.map((c: any) => ({
            cost: parseFloat(c.cost) || 0,
            manpower: c.manpower || '',
            maintenance_cost: parseFloat(c.maintenance_cost) || 0
          })) : [],
          risks: sol.risks && sol.risks.length > 0 ? sol.risks.map((r: any) => ({
            risk: r.risk,
            mitigation: r.mitigation
          })) : []
        }));
      }
      
      await onSubmit(submitData);
    } catch (error) {
      console.error('Submit error:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const priorityOptions = [
    { value: '1', label: '1 - Highest', color: 'bg-red-100 text-red-800' },
    { value: '2', label: '2 - High', color: 'bg-orange-100 text-orange-800' },
    { value: '3', label: '3 - Medium', color: 'bg-yellow-100 text-yellow-800' },
    { value: '4', label: '4 - Low', color: 'bg-blue-100 text-blue-800' },
    { value: '5', label: '5 - Lowest', color: 'bg-green-100 text-green-800' },
  ];

  const statusOptions = [
    { value: 'active', label: 'Active', color: 'bg-green-100 text-green-700' },
    { value: 'in_progress', label: 'In Progress', color: 'bg-blue-100 text-blue-700' },
    { value: 'kiv', label: 'KIV', color: 'bg-yellow-100 text-yellow-700' },
    { value: 'completed', label: 'Completed', color: 'bg-purple-100 text-purple-700' },
  ];

  const getPriorityColor = (priority: string) => {
    return priorityOptions.find(p => p.value === priority)?.color || 'bg-gray-100 text-gray-800';
  };

  const getStatusColor = (status: string) => {
    return statusOptions.find(s => s.value === status)?.color || 'bg-gray-100 text-gray-700';
  };

  const getAdvisorName = (id: number | string) => {
    if (!id) return '-';
    const advisor = advisorOptions.find(a => a.id === parseInt(id as string));
    return advisor?.name || '-';
  };

  const getOutsourceName = (id: number | string) => {
    if (!id) return '-';
    const outsource = outsourceOptions.find(o => o.id === parseInt(id as string));
    return outsource?.name || '-';
  };

  const getBusinessUserName = (id: number | string) => {
    if (!id) return '-';
    const user = businessUserOptions.find(u => u.id === parseInt(id as string));
    return user?.name || '-';
  };

  const getCostCenterName = (id: number | string) => {
    if (!id) return '-';
    const center = costCenterOptions.find(c => c.id === parseInt(id as string));
    return center?.name || '-';
  };

  // View Mode
  if (!isEditMode && initialData) {
    return (
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 space-y-6">
        {/* Section 1: Project Info */}
        <div>
          <div className="flex items-center gap-2 mb-4 pb-2 border-b border-gray-100">
            <div className="w-1 h-6 bg-blue-500 rounded-full"></div>
            <h2 className="text-lg font-semibold text-gray-900">Project Information</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="bg-gray-50 rounded-xl p-3">
              <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1">Project Name</label>
              <p className="text-gray-900 font-medium">{initialData.project_name}</p>
            </div>
            <div className="bg-gray-50 rounded-xl p-3">
              <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1">Priority</label>
              <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${getPriorityColor(initialData.priority?.toString() || '3')}`}>
                {initialData.priority}
              </span>
            </div>
            <div className="bg-gray-50 rounded-xl p-3">
              <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1">Status</label>
              <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(initialData.status)}`}>
                {initialData.status?.replace('_', ' ')}
              </span>
            </div>
            <div className="bg-gray-50 rounded-xl p-3">
              <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1">Deadline</label>
              <p className="text-gray-900">{initialData.deadline ? formatDateForDisplay(initialData.deadline) : '-'}</p>
            </div>
            <div className="md:col-span-2 bg-gray-50 rounded-xl p-3">
              <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1">Description</label>
              <p className="text-gray-600">{initialData.description || '-'}</p>
            </div>
          </div>
        </div>

        {/* Section 2: Assignments */}
        <div>
          <div className="flex items-center gap-2 mb-4 pb-2 border-b border-gray-100">
            <div className="w-1 h-6 bg-green-500 rounded-full"></div>
            <h2 className="text-lg font-semibold text-gray-900">Assignments</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="bg-gray-50 rounded-xl p-3">
              <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1">Advisor</label>
              <p className="text-gray-900">{getAdvisorName(initialData.advisor_id || initialData.advisor?.id || '')}</p>
            </div>
            <div className="bg-gray-50 rounded-xl p-3">
              <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1">Outsource Partner</label>
              <p className="text-gray-900">{getOutsourceName(initialData.outsource_partner_id || initialData.outsource_partner?.id || '')}</p>
            </div>
            <div className="bg-gray-50 rounded-xl p-3">
              <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1">Business User</label>
              <p className="text-gray-900">{getBusinessUserName(initialData.business_user_id || initialData.business_user?.id || '')}</p>
            </div>
            <div className="bg-gray-50 rounded-xl p-3">
              <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1">Cost/Profit Center</label>
              <p className="text-gray-900">{getCostCenterName(initialData.cost_center_id || initialData.cost_center?.id || '')}</p>
            </div>
          </div>
        </div>

        {/* Section 3: Solutions */}
        {initialData.solutions && initialData.solutions.length > 0 && (
          <div>
            <div className="flex items-center gap-2 mb-4 pb-2 border-b border-gray-100">
              <div className="w-1 h-6 bg-purple-500 rounded-full"></div>
              <h2 className="text-lg font-semibold text-gray-900">Solutions</h2>
            </div>
            <div className="space-y-3">
              {initialData.solutions.map((sol, idx) => (
                <div key={idx} className="border border-gray-200 rounded-xl p-4 bg-gray-50/50">
                  <p className="font-medium text-gray-900 mb-3">{sol.solution}</p>
                  {sol.costs && sol.costs.length > 0 && (
                    <div className="mt-2 text-sm">
                      <span className="font-medium text-gray-700">Costs:</span>
                      <div className="mt-1 space-y-1">
                        {sol.costs.map((c, i) => (
                          <div key={i} className="text-gray-600 text-sm ml-4">
                            • Man Days: {c.manpower} days | Cost: RM {c.cost} | Maintenance: RM {c.maintenance_cost}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                  {sol.risks && sol.risks.length > 0 && (
                    <div className="mt-3 text-sm">
                      <span className="font-medium text-gray-700">Risks & Mitigation:</span>
                      <div className="mt-1 space-y-1">
                        {sol.risks.map((r, i) => (
                          <div key={i} className="text-gray-600 text-sm ml-4">
                            • Risk: {r.risk} → Mitigation: {r.mitigation}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Section 4: Timestamps */}
        {(initialData.created_at || initialData.updated_at) && (
          <div>
            <div className="flex items-center gap-2 mb-4 pb-2 border-b border-gray-100">
              <div className="w-1 h-6 bg-gray-400 rounded-full"></div>
              <h2 className="text-lg font-semibold text-gray-900">Timestamps</h2>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {initialData.created_at && (
                <div className="bg-gray-50 rounded-xl p-3">
                  <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1">Created Date</label>
                  <p className="text-gray-900">{formatDateTime(initialData.created_at)}</p>
                </div>
              )}
              {initialData.updated_at && (
                <div className="bg-gray-50 rounded-xl p-3">
                  <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1">Updated Date</label>
                  <p className="text-gray-900">{formatDateTime(initialData.updated_at)}</p>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    );
  }

  // Edit/Create Mode
  return (
    <form onSubmit={handleSubmit} className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 space-y-6">
      {/* Section 1: Project Info */}
      <div>
        <div className="flex items-center gap-2 mb-4 pb-2 border-b border-gray-100">
          <div className="w-1 h-6 bg-blue-500 rounded-full"></div>
          <h2 className="text-lg font-semibold text-gray-900">Project Information</h2>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Project Name <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              name="project_name"
              value={formData.project_name}
              onChange={handleChange}
              required
              className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all bg-gray-50 focus:bg-white"
              placeholder="Enter project name"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Priority <span className="text-red-500">*</span>
            </label>
            <select
              name="priority"
              value={formData.priority}
              onChange={handleChange}
              required
              className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all bg-gray-50 focus:bg-white"
            >
              {priorityOptions.map(opt => (
                <option key={opt.value} value={opt.value}>{opt.label}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Status <span className="text-red-500">*</span>
            </label>
            <select
              name="status"
              value={formData.status}
              onChange={handleChange}
              required
              className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all bg-gray-50 focus:bg-white"
            >
              {statusOptions.map(opt => (
                <option key={opt.value} value={opt.value}>{opt.label}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Deadline</label>
            <DatePicker
              value={formData.deadline}
              onChange={handleDateChange}
              placeholder="Select deadline date"
              className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white cursor-pointer"
            />
          </div>

          <div className="md:col-span-2">
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                name="is_favourite"
                checked={formData.is_favourite}
                onChange={handleChange}
                className="w-4 h-4 text-blue-500 rounded border-gray-300 focus:ring-blue-500"
              />
              <span className="text-sm text-gray-700">⭐ Add to Favourites</span>
            </label>
          </div>

          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
            <textarea
              name="description"
              value={formData.description}
              onChange={handleChange}
              rows={4}
              className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all bg-gray-50 focus:bg-white"
              placeholder="Enter task description..."
            />
          </div>
        </div>
      </div>

      {/* Section 2: Assignments */}
      <div>
        <div className="flex items-center gap-2 mb-4 pb-2 border-b border-gray-100">
          <div className="w-1 h-6 bg-green-500 rounded-full"></div>
          <h2 className="text-lg font-semibold text-gray-900">Assignments</h2>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Advisor</label>
            <select
              name="advisor_id"
              value={formData.advisor_id}
              onChange={handleChange}
              className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all bg-gray-50 focus:bg-white"
            >
              <option value="">Select Advisor</option>
              {advisorOptions.map(opt => (
                <option key={opt.id} value={opt.id.toString()}>{opt.name}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Outsource Partner</label>
            <select
              name="outsource_partner_id"
              value={formData.outsource_partner_id}
              onChange={handleChange}
              className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all bg-gray-50 focus:bg-white"
            >
              <option value="">Select Outsource Partner</option>
              {outsourceOptions.map(opt => (
                <option key={opt.id} value={opt.id.toString()}>{opt.name}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Business User</label>
            <select
              name="business_user_id"
              value={formData.business_user_id}
              onChange={handleChange}
              className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all bg-gray-50 focus:bg-white"
            >
              <option value="">Select Business User</option>
              {businessUserOptions.map(opt => (
                <option key={opt.id} value={opt.id.toString()}>{opt.name}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Cost/Profit Center</label>
            <select
              name="cost_center_id"
              value={formData.cost_center_id}
              onChange={handleChange}
              className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all bg-gray-50 focus:bg-white"
            >
              <option value="">Select Cost Center</option>
              {costCenterOptions.map(opt => (
                <option key={opt.id} value={opt.id.toString()}>{opt.name}</option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Section 3: Solutions */}
      <SolutionSection solutions={solutions} onChange={setSolutions} />

      {/* Form Buttons */}
      <div className="flex gap-3 pt-4 border-t border-gray-100">
        <button 
          type="submit" 
          disabled={isSubmitting}
          className="flex-1 bg-blue-500 hover:bg-blue-600 text-white font-semibold py-3 px-4 rounded-xl disabled:opacity-50 transition-all hover:shadow-md"
        >
          {isSubmitting ? (
            <span className="flex items-center justify-center gap-2">
              <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></div>
              Saving...
            </span>
          ) : (
            'Save Changes'
          )}
        </button>
        <button 
          type="button" 
          onClick={onCancel} 
          className="flex-1 bg-gray-100 hover:bg-gray-200 text-gray-700 font-semibold py-3 px-4 rounded-xl transition-all"
        >
          Cancel
        </button>
      </div>
    </form>
  );
}