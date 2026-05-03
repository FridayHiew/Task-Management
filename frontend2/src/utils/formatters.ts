// utils/formatters.ts

// Format date for display (DD MMM YYYY) - e.g., "30 May 2026"
export const formatDateForDisplay = (date: string | undefined): string => {
  if (!date) return '-';
  const d = new Date(date);
  return d.toLocaleDateString('en-GB', {
    day: '2-digit',
    month: 'short',
    year: 'numeric'
  });
};

// Format date for input field (YYYY-MM-DD)
export const formatDateForInput = (date: string | undefined): string => {
  if (!date) return '';
  const d = new Date(date);
  return d.toISOString().split('T')[0];
};

// Format datetime for display (DD MMM YYYY, HH:MM)
export const formatDateTime = (date: string | undefined): string => {
  if (!date) return '-';
  const d = new Date(date);
  return d.toLocaleDateString('en-GB', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });
};

// Check if deadline is passed
export const isDeadlinePassed = (deadline: string | undefined): boolean => {
  if (!deadline) return false;
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const deadlineDate = new Date(deadline);
  deadlineDate.setHours(0, 0, 0, 0);
  return deadlineDate < today;
};