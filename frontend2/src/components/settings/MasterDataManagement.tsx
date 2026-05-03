'use client';

import { useState, useEffect } from 'react';
import { masterService, MasterItem } from '@/services/master.service';
import { useToast } from '@/context/ToastContext';
import ConfirmDialog from '@/components/common/ConfirmDialog';

const ChevronLeftIcon = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <polyline points="15 18 9 12 15 6" />
  </svg>
);

const PlusIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <line x1="12" y1="5" x2="12" y2="19" />
    <line x1="5" y1="12" x2="19" y2="12" />
  </svg>
);

const TrashIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <polyline points="3 6 5 6 21 6" />
    <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
  </svg>
);

const SearchIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <circle cx="11" cy="11" r="8" />
    <line x1="21" y1="21" x2="16.65" y2="16.65" />
  </svg>
);

const EmptyStateIcon = () => (
  <svg width="80" height="80" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1">
    <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
    <circle cx="12" cy="7" r="4" />
  </svg>
);

interface MasterDataManagementProps {
  onBack: () => void;
}

const masterTypes = [
  { id: 'advisors', label: 'Advisors', icon: '👨‍💼' },
  { id: 'business_users', label: 'Business Users', icon: '🏢' },
  { id: 'cost_centers', label: 'Cost Centers', icon: '💰' },
  { id: 'outsource_partners', label: 'Outsource Partners', icon: '🤝' },
  { id: 'categories', label: 'Categories', icon: '📁' }
];

export default function MasterDataManagement({ onBack }: MasterDataManagementProps) {
  const { showToast } = useToast();
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState<MasterItem[]>([]);
  const [filteredData, setFilteredData] = useState<MasterItem[]>([]);
  const [masterType, setMasterType] = useState('advisors');
  const [newItemName, setNewItemName] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [deleteItem, setDeleteItem] = useState<MasterItem | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const fetchData = async () => {
    setLoading(true);
    try {
      let items: MasterItem[] = [];
      switch (masterType) {
        case 'advisors':
          items = await masterService.getAdvisors();
          break;
        case 'business_users':
          items = await masterService.getBusinessUsers();
          break;
        case 'cost_centers':
          items = await masterService.getCostCenters();
          break;
        case 'outsource_partners':
          items = await masterService.getOutsourcePartners();
          break;
        case 'categories':
          items = await masterService.getCategories();
          break;
      }
      setData(items);
      setFilteredData(items);
    } catch (err) {
      console.error(err);
      showToast('Failed to load data', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [masterType]);

  useEffect(() => {
    if (searchQuery.trim() === '') {
      setFilteredData(data);
    } else {
      const filtered = data.filter(item =>
        item.name.toLowerCase().includes(searchQuery.toLowerCase())
      );
      setFilteredData(filtered);
    }
  }, [searchQuery, data]);

  const handleAddItem = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newItemName.trim()) {
      showToast('Please enter an item name', 'warning');
      return;
    }
    
    // Check for duplicate
    const exists = data.some(item => item.name.toLowerCase() === newItemName.toLowerCase());
    if (exists) {
      showToast('Item already exists', 'error');
      return;
    }
    
    try {
      await masterService.create(masterType, { name: newItemName.trim() });
      setNewItemName('');
      fetchData();
      showToast('Item added successfully', 'success');
    } catch (err) {
      showToast('Failed to add item', 'error');
    }
  };

  const handleDeleteItem = async () => {
    if (!deleteItem) return;
    
    setIsDeleting(true);
    try {
      await masterService.delete(masterType, deleteItem.id);
      setDeleteItem(null);
      fetchData();
      showToast('Item deleted successfully', 'success');
    } catch (err) {
      showToast('Failed to delete item', 'error');
    } finally {
      setIsDeleting(false);
    }
  };

  const currentTypeLabel = masterTypes.find(t => t.id === masterType)?.label || 'Items';

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
        <h1 className="text-xl font-semibold text-gray-900">Master Data</h1>
      </div>

      <div className="p-4 max-w-2xl mx-auto">
        <div className="space-y-5">
          {/* Type Tabs - Improved with icons */}
          <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
            {masterTypes.map((type) => (
              <button
                key={type.id}
                onClick={() => setMasterType(type.id)}
                className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium whitespace-nowrap transition-all ${
                  masterType === type.id
                    ? 'bg-blue-500 text-white shadow-md shadow-blue-200 scale-105'
                    : 'bg-white text-gray-600 hover:bg-gray-100 border border-gray-200'
                }`}
              >
                <span className="text-base">{type.icon}</span>
                {type.label}
              </button>
            ))}
          </div>

          {/* Add Form - Improved with better visual */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4">
            <h2 className="text-sm font-semibold text-gray-700 mb-3 flex items-center gap-2">
              <span className="w-1 h-4 bg-blue-500 rounded-full"></span>
              Add New {currentTypeLabel}
            </h2>
            <form onSubmit={handleAddItem} className="flex gap-2">
              <input
                type="text"
                placeholder={`Enter ${currentTypeLabel.toLowerCase()} name...`}
                className="flex-1 px-4 py-2.5 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all bg-gray-50"
                value={newItemName}
                onChange={(e) => setNewItemName(e.target.value)}
                autoComplete="off"
              />
              <button 
                type="submit" 
                className="bg-blue-500 text-white p-2.5 rounded-xl hover:bg-blue-600 transition-all hover:scale-105 active:scale-95 disabled:opacity-50"
                disabled={!newItemName.trim()}
              >
                <PlusIcon />
              </button>
            </form>
          </div>

          {/* Search Bar - New Feature */}
          {data.length > 0 && (
            <div className="relative">
              <div className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400">
                <SearchIcon />
              </div>
              <input
                type="text"
                placeholder="Search items..."
                className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
          )}

          {/* Items List - Improved with better visual states */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
            <div className="px-4 py-3 border-b border-gray-100 bg-gray-50">
              <div className="flex justify-between items-center">
                <h3 className="text-sm font-semibold text-gray-700">
                  {currentTypeLabel} List
                </h3>
                <span className="text-xs text-gray-500 bg-gray-200 px-2 py-0.5 rounded-full">
                  {filteredData.length} items
                </span>
              </div>
            </div>
            
            <div className="divide-y divide-gray-100">
              {loading ? (
                <div className="flex flex-col items-center justify-center py-16">
                  <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-500 mb-3"></div>
                  <p className="text-sm text-gray-500">Loading items...</p>
                </div>
              ) : filteredData.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-16 text-center">
                  <div className="text-gray-300 mb-3">
                    <EmptyStateIcon />
                  </div>
                  <p className="text-sm text-gray-500 mb-2">No {currentTypeLabel.toLowerCase()} found</p>
                  <p className="text-xs text-gray-400">
                    {searchQuery ? 'Try a different search term' : 'Add your first item using the form above'}
                  </p>
                </div>
              ) : (
                filteredData.map((item, index) => (
                  <div 
                    key={item.id} 
                    className="flex items-center justify-between p-4 hover:bg-gray-50 transition-colors group"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center text-gray-500 text-sm font-medium group-hover:bg-blue-100 group-hover:text-blue-600 transition-colors">
                        {index + 1}
                      </div>
                      <span className="text-gray-800 font-medium">{item.name}</span>
                    </div>
                    <button
                      onClick={() => setDeleteItem(item)}
                      className="text-gray-400 hover:text-red-500 transition-all hover:scale-110 p-1"
                    >
                      <TrashIcon />
                    </button>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Delete Confirmation Dialog */}
      <ConfirmDialog
        isOpen={!!deleteItem}
        title="Delete Item"
        message={`Are you sure you want to delete "${deleteItem?.name}"? This action cannot be undone.`}
        onConfirm={handleDeleteItem}
        onCancel={() => setDeleteItem(null)}
        confirmText={isDeleting ? 'Deleting...' : 'Delete'}
        confirmVariant="danger"
      />

      {/* Bottom Navigation */}
      <div className="fixed bottom-0 left-0 right-0 bg-white border-t flex justify-around py-3 shadow-lg">
        <button onClick={() => window.location.href = '/home'} className="text-gray-500 hover:text-blue-500 transition-colors">Home</button>
        <button onClick={() => window.location.href = '/tasks'} className="text-gray-500 hover:text-blue-500 transition-colors">Tasks</button>
        <button onClick={() => window.location.href = '/settings'} className="text-blue-500">Settings</button>
      </div>
    </div>
  );
}