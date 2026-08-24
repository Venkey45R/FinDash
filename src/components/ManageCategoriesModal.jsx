import React, { useState } from 'react';
import { X, Check, Edit2, Trash2 } from 'lucide-react';
import { useTransaction } from '../context/TransactionContext';
import ConfirmPopup from './ConfirmPopup';

const ManageCategoriesModal = ({ isOpen, onClose }) => {
  const { incomeCategories = [], updateIncomeCategory, deleteIncomeCategory } = useTransaction();
  const [editingCategoryId, setEditingCategoryId] = useState(null);
  const [editingCategoryName, setEditingCategoryName] = useState('');
  const [categoryToDelete, setCategoryToDelete] = useState(null);

  if (!isOpen) return null;

  const handleEditCategorySubmit = async (e, id) => {
    e.preventDefault();
    if (!editingCategoryName.trim()) return;

    // Dirty check: skip API call if name hasn't changed
    const original = incomeCategories.find(c => c._id === id);
    if (original && editingCategoryName.trim() === original.name) {
      setEditingCategoryId(null);
      return;
    }

    await updateIncomeCategory(id, editingCategoryName.trim());
    setEditingCategoryId(null);
  };

  const confirmDelete = async () => {
    if (categoryToDelete) {
      await deleteIncomeCategory(categoryToDelete);
      setCategoryToDelete(null);
    }
  };

  return (
    <>
      <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
        <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm" onClick={onClose} />
        
        <div className="relative w-full max-w-md bg-white dark:bg-slate-900 rounded-2xl shadow-2xl overflow-hidden border border-gray-100 dark:border-slate-800 flex flex-col max-h-[80vh] animate-in zoom-in-95 duration-200">
          <div className="flex items-center justify-between p-4 border-b border-gray-100 dark:border-slate-800">
            <h3 className="font-bold text-lg text-gray-900 dark:text-white">Manage Categories</h3>
            <button onClick={onClose} className="p-2 text-gray-400 hover:bg-gray-100 dark:hover:bg-slate-800 rounded-full transition-colors">
              <X className="w-5 h-5" />
            </button>
          </div>

          <div className="p-4 overflow-y-auto flex-1 custom-scrollbar">
            {incomeCategories.length === 0 ? (
              <div className="text-center py-8 text-gray-500">No custom categories found.</div>
            ) : (
              <div className="space-y-3">
                {incomeCategories.map(cat => (
                  <div key={cat._id} className="flex items-center justify-between gap-3 p-3 bg-gray-50 dark:bg-slate-800/50 rounded-xl border border-gray-100 dark:border-slate-700">
                    {editingCategoryId === cat._id ? (
                      <form onSubmit={(e) => handleEditCategorySubmit(e, cat._id)} className="flex-1 flex gap-2">
                        <input 
                          autoFocus
                          className="flex-1 px-3 py-1.5 text-sm bg-white dark:bg-slate-900 border border-teal-500 rounded-lg text-gray-900 dark:text-white outline-none" 
                          value={editingCategoryName} 
                          onChange={e => setEditingCategoryName(e.target.value)} 
                        />
                        <button type="submit" className="p-1.5 text-white bg-teal-600 rounded-lg hover:bg-teal-700 transition-colors"><Check className="w-4 h-4" /></button>
                        <button type="button" onClick={() => setEditingCategoryId(null)} className="p-1.5 text-gray-600 dark:text-gray-400 bg-gray-200 dark:bg-slate-700 rounded-lg hover:bg-gray-300 dark:hover:bg-slate-600 transition-colors"><X className="w-4 h-4" /></button>
                      </form>
                    ) : (
                      <>
                        <span className="text-gray-800 dark:text-gray-200 font-medium truncate flex-1">{cat.name}</span>
                        <div className="flex items-center gap-1">
                          <button type="button" onClick={() => { setEditingCategoryId(cat._id); setEditingCategoryName(cat.name); }} className="p-1.5 text-gray-400 hover:text-blue-500 rounded-lg hover:bg-white dark:hover:bg-slate-700 transition-colors"><Edit2 className="w-4 h-4" /></button>
                          <button type="button" onClick={() => setCategoryToDelete(cat._id)} className="p-1.5 text-gray-400 hover:text-red-500 rounded-lg hover:bg-white dark:hover:bg-slate-700 transition-colors"><Trash2 className="w-4 h-4" /></button>
                        </div>
                      </>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      <ConfirmPopup 
        isOpen={!!categoryToDelete}
        title="Delete Category"
        message="Are you sure you want to delete this custom category? (Existing transactions will keep the category name)."
        onConfirm={confirmDelete}
        onCancel={() => setCategoryToDelete(null)}
      />
    </>
  );
};

export default ManageCategoriesModal;
