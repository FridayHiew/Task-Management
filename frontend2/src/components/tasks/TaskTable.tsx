'use client';

import { Task } from '@/types';
import { FiStar, FiStar as FiStarOutline, FiAlertCircle, FiCheckCircle, FiClock } from 'react-icons/fi';

interface TaskTableProps {
  tasks: Task[];
  onToggleFavourite: (task: Task) => void;
  onRowClick: (task: Task) => void;
  showFavouriteAction?: boolean;
}

export default function TaskTable({ 
  tasks, 
  onToggleFavourite, 
  onRowClick, 
  showFavouriteAction = true 
}: TaskTableProps) {
  
  // Helper function to check if deadline is passed
  const isDeadlinePassed = (deadline: string) => {
    if (!deadline) return false;
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const deadlineDate = new Date(deadline);
    deadlineDate.setHours(0, 0, 0, 0);
    return deadlineDate < today;
  };

  // Helper function to check if deadline is today
  const isDeadlineToday = (deadline: string) => {
    if (!deadline) return false;
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const deadlineDate = new Date(deadline);
    deadlineDate.setHours(0, 0, 0, 0);
    return deadlineDate.getTime() === today.getTime();
  };

  // Helper function to check if deadline is approaching (within 3 days)
  const isDeadlineApproaching = (deadline: string) => {
    if (!deadline) return false;
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const deadlineDate = new Date(deadline);
    deadlineDate.setHours(0, 0, 0, 0);
    const diffDays = Math.ceil((deadlineDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
    return diffDays > 0 && diffDays <= 3;
  };

  const getPriorityInfo = (priority: number) => {
    switch (priority) {
      case 1:
        return { bg: 'bg-red-100', text: 'text-red-800', icon: '🔴', label: 'Highest' };
      case 2:
        return { bg: 'bg-orange-100', text: 'text-orange-800', icon: '🟠', label: 'High' };
      case 3:
        return { bg: 'bg-yellow-100', text: 'text-yellow-800', icon: '🟡', label: 'Medium' };
      case 4:
        return { bg: 'bg-blue-100', text: 'text-blue-800', icon: '🔵', label: 'Low' };
      case 5:
        return { bg: 'bg-green-100', text: 'text-green-800', icon: '🟢', label: 'Lowest' };
      default:
        return { bg: 'bg-gray-100', text: 'text-gray-800', icon: '⚪', label: 'Medium' };
    }
  };

  const getStatusInfo = (status: string) => {
    const formattedStatus = status.charAt(0).toUpperCase() + status.slice(1).replace('_', ' ');
    switch (status) {
      case 'active':
        return { bg: 'bg-green-100', text: 'text-green-700', icon: <FiCheckCircle size={12} />, label: formattedStatus };
      case 'in_progress':
        return { bg: 'bg-blue-100', text: 'text-blue-700', icon: <FiClock size={12} />, label: 'In Progress' };
      case 'completed':
        return { bg: 'bg-purple-100', text: 'text-purple-700', icon: <FiCheckCircle size={12} />, label: formattedStatus };
      case 'kiv':
        return { bg: 'bg-yellow-100', text: 'text-yellow-700', icon: <FiAlertCircle size={12} />, label: 'KIV' };
      default:
        return { bg: 'bg-gray-100', text: 'text-gray-700', icon: null, label: formattedStatus };
    }
  };

  const formatDate = (date: string) => {
    if (!date) return '-';
    const d = new Date(date);
    return d.toLocaleDateString('en-GB', {
      day: '2-digit',
      month: 'short',
      year: 'numeric'
    });
  };

  const getDeadlineStyle = (deadline: string) => {
    if (isDeadlinePassed(deadline)) {
      return { text: 'text-red-600', bg: 'bg-red-50', icon: '⚠️', label: 'Overdue' };
    }
    if (isDeadlineToday(deadline)) {
      return { text: 'text-orange-600', bg: 'bg-orange-50', icon: '📅', label: 'Today' };
    }
    if (isDeadlineApproaching(deadline)) {
      return { text: 'text-yellow-600', bg: 'bg-yellow-50', icon: '⏰', label: 'Soon' };
    }
    return { text: 'text-gray-600', bg: 'bg-gray-50', icon: '📆', label: 'Upcoming' };
  };

  // Mobile card view for smaller screens

  const MobileTaskCard = ({ task, index }: { task: Task; index: number }) => {
    const deadlinePassed = isDeadlinePassed(task.deadline);
    const deadlineStyle = getDeadlineStyle(task.deadline);
    const priority = getPriorityInfo(typeof task.priority === 'number' ? task.priority : parseInt(task.priority as any) || 3);
    const status = getStatusInfo(task.status);

    return (
      <div
        onClick={() => onRowClick(task)}
        className="bg-white rounded-xl border border-gray-100 p-4 mb-3 cursor-pointer hover:shadow-md transition-all active:scale-[0.98]"
      >
        <div className="flex items-start justify-between mb-3">
          <div className="flex items-center gap-2">
            <span className="text-xs text-gray-400 font-medium">#{index + 1}</span>
            <h3 className="font-semibold text-gray-900 flex-1">{task.project_name}</h3>
          </div>
          {showFavouriteAction && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                onToggleFavourite(task);
              }}
              className="text-yellow-500 hover:scale-110 transition"
            >
              {task.is_favourite ? <FiStar className="fill-yellow-500" size={18} /> : <FiStarOutline size={18} />}
            </button>
          )}
        </div>

        {task.description && (
          <p className="text-sm text-gray-500 mb-3 line-clamp-2">{task.description}</p>
        )}

        <div className="flex flex-wrap gap-2 mb-3">
          <span className={`px-2 py-1 text-xs font-medium rounded-full ${priority.bg} ${priority.text}`}>
            {priority.icon} {priority.label}
          </span>
          <span className={`inline-flex items-center gap-1 px-2 py-1 text-xs font-medium rounded-full ${status.bg} ${status.text}`}>
            {status.icon}
            {status.label}
          </span>
        </div>

        <div className="flex items-center justify-between pt-2 border-t border-gray-50">
          <div className={`flex items-center gap-1 px-2 py-1 rounded-lg ${deadlineStyle.bg}`}>
            <span className="text-sm">{deadlineStyle.icon}</span>
            <span className={`text-xs font-medium ${deadlineStyle.text}`}>
              {formatDate(task.deadline)}
            </span>
            {deadlinePassed && (
              <span className="text-xs text-red-600 ml-1">⚠️</span>
            )}
          </div>
        </div>
      </div>
    );
  };

  return (
    <>
      {/* Desktop Table View - Hidden on mobile */}
      <div className="hidden md:block overflow-x-auto">
        <table className="min-w-full bg-white rounded-xl overflow-hidden shadow-sm border border-gray-100">
          <thead className="bg-gradient-to-r from-gray-50 to-white border-b border-gray-100">
            <tr>
              <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">No</th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Project Name</th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Priority</th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Deadline</th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Status</th>
              {showFavouriteAction && (
                <th className="px-4 py-3 text-center text-xs font-semibold text-gray-500 uppercase tracking-wider">Fav</th>
              )}
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {tasks.map((task, index) => {
              const deadlinePassed = isDeadlinePassed(task.deadline);
              const deadlineStyle = getDeadlineStyle(task.deadline);
              const priority = getPriorityInfo(typeof task.priority === 'number' ? task.priority : parseInt(task.priority as any) || 3);
              const status = getStatusInfo(task.status);
              
              return (
                <tr
                  key={task.id}
                  onClick={() => onRowClick(task)}
                  className="hover:bg-gray-50 cursor-pointer transition-colors group"
                >
                  <td className="px-4 py-3">
                    <span className="text-sm text-gray-400 font-medium">{index + 1}</span>
                  </td>
                  <td className="px-4 py-3">
                    <div className="text-sm font-semibold text-gray-900 group-hover:text-blue-600 transition-colors">
                      {task.project_name}
                    </div>
                    {task.description && (
                      <div className="text-xs text-gray-400 truncate max-w-xs mt-0.5">
                        {task.description}
                      </div>
                    )}
                  </td>
                  <td className="px-4 py-3">
                    <span className={`inline-flex items-center gap-1 px-2 py-1 text-xs font-medium rounded-full ${priority.bg} ${priority.text}`}>
                      <span>{priority.icon}</span>
                      {priority.label}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <div className={`inline-flex items-center gap-1 px-2 py-1 rounded-lg ${deadlineStyle.bg}`}>
                      <span className="text-xs">{deadlineStyle.icon}</span>
                      <span className={`text-xs font-medium ${deadlineStyle.text}`}>
                        {formatDate(task.deadline)}
                      </span>
                      {deadlinePassed && <span className="text-xs text-red-600 ml-1">⚠️</span>}
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <span className={`inline-flex items-center gap-1 px-2 py-1 text-xs font-medium rounded-full ${status.bg} ${status.text}`}>
                      {status.icon}
                      {status.label}
                    </span>
                  </td>
                  {showFavouriteAction && (
                    <td className="px-4 py-3 text-center">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          onToggleFavourite(task);
                        }}
                        className="text-gray-300 hover:text-yellow-500 hover:scale-110 transition-all"
                      >
                        {task.is_favourite ? (
                          <FiStar className="fill-yellow-500 text-yellow-500" size={18} />
                        ) : (
                          <FiStarOutline size={18} />
                        )}
                      </button>
                    </td>
                  )}
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Mobile Card View - Visible on mobile only */}
      <div className="md:hidden">
        {tasks.map((task, index) => (
          <MobileTaskCard key={task.id} task={task} index={index} />
        ))}
      </div>

      {/* Empty State */}
      {tasks.length === 0 && (
        <div className="text-center py-12">
          <div className="w-16 h-16 mx-auto mb-4 bg-gray-100 rounded-full flex items-center justify-center">
            <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
            </svg>
          </div>
          <p className="text-gray-500 text-sm">No tasks found</p>
        </div>
      )}
    </>
  );
}