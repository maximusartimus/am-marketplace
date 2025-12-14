'use client';

import { useEffect, useState, useCallback } from 'react';
import { supabase } from '@/lib/supabase';

interface Category {
  id: string;
  name_en: string | null;
  name_hy: string | null;
  slug: string;
  position: number;
  parent_id: string | null;
  icon: string | null;
  listing_count?: number;
}

export default function AdminCategories() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);

  // Modal states
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const [formData, setFormData] = useState({
    name_en: '',
    name_hy: '',
    slug: '',
    position: 0,
    icon: '',
    parent_id: '',
  });
  const [formLoading, setFormLoading] = useState(false);
  const [formError, setFormError] = useState('');

  // Delete modal
  const [deleteCategory, setDeleteCategory] = useState<Category | null>(null);
  const [deleteLoading, setDeleteLoading] = useState(false);

  const fetchCategories = useCallback(async () => {
    setLoading(true);
    try {
      const { data: categoriesData, error } = await supabase
        .from('categories')
        .select('*')
        .order('position', { ascending: true });

      if (error) throw error;

      // Get listing counts for each category
      if (categoriesData && categoriesData.length > 0) {
        const categoriesWithCounts = await Promise.all(
          categoriesData.map(async (category) => {
            const { count } = await supabase
              .from('listings')
              .select('*', { count: 'exact', head: true })
              .eq('category_id', category.id);
            return { ...category, listing_count: count || 0 };
          })
        );
        setCategories(categoriesWithCounts);
      } else {
        setCategories([]);
      }
    } catch (error) {
      console.error('Error fetching categories:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchCategories();
  }, [fetchCategories]);

  const openCreateModal = () => {
    setEditingCategory(null);
    setFormData({
      name_en: '',
      name_hy: '',
      slug: '',
      position: categories.length,
      icon: '',
      parent_id: '',
    });
    setFormError('');
    setIsModalOpen(true);
  };

  const openEditModal = (category: Category) => {
    setEditingCategory(category);
    setFormData({
      name_en: category.name_en || '',
      name_hy: category.name_hy || '',
      slug: category.slug,
      position: category.position,
      icon: category.icon || '',
      parent_id: category.parent_id || '',
    });
    setFormError('');
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setEditingCategory(null);
    setFormError('');
  };

  const generateSlug = (name: string) => {
    return name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)/g, '');
  };

  const handleNameChange = (name: string) => {
    setFormData(prev => ({
      ...prev,
      name_en: name,
      slug: editingCategory ? prev.slug : generateSlug(name),
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError('');
    setFormLoading(true);

    try {
      // Validate
      if (!formData.name_en.trim()) {
        throw new Error('English name is required');
      }
      if (!formData.slug.trim()) {
        throw new Error('Slug is required');
      }

      const categoryData = {
        name_en: formData.name_en.trim(),
        name_hy: formData.name_hy.trim() || null,
        slug: formData.slug.trim(),
        position: formData.position,
        icon: formData.icon.trim() || null,
        parent_id: formData.parent_id || null,
      };

      if (editingCategory) {
        // Update
        const { error } = await supabase
          .from('categories')
          .update(categoryData)
          .eq('id', editingCategory.id);

        if (error) throw error;
      } else {
        // Create
        const { error } = await supabase
          .from('categories')
          .insert(categoryData);

        if (error) {
          if (error.code === '23505') {
            throw new Error('A category with this slug already exists');
          }
          throw error;
        }
      }

      fetchCategories();
      closeModal();
    } catch (error) {
      console.error('Error saving category:', error);
      setFormError(error instanceof Error ? error.message : 'Failed to save category');
    } finally {
      setFormLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!deleteCategory) return;

    setDeleteLoading(true);
    try {
      const { error } = await supabase
        .from('categories')
        .delete()
        .eq('id', deleteCategory.id);

      if (error) throw error;

      fetchCategories();
      setDeleteCategory(null);
    } catch (error) {
      console.error('Error deleting category:', error);
      alert('Failed to delete category. Please try again.');
    } finally {
      setDeleteLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm text-gray-500">
            Manage product categories for the marketplace
          </p>
        </div>
        <button
          onClick={openCreateModal}
          className="px-4 py-2 bg-[#222222] text-white rounded-lg hover:bg-[#333333] transition-colors flex items-center gap-2"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
          </svg>
          Add Category
        </button>
      </div>

      {/* Categories List */}
      <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
        <table className="w-full">
          <thead className="bg-gray-50 border-b border-gray-200">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Position
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Name
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Slug
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Listings
              </th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {loading ? (
              [...Array(5)].map((_, i) => (
                <tr key={i}>
                  <td className="px-6 py-4" colSpan={5}>
                    <div className="h-4 bg-gray-200 rounded animate-pulse"></div>
                  </td>
                </tr>
              ))
            ) : categories.length === 0 ? (
              <tr>
                <td className="px-6 py-8 text-center text-gray-500" colSpan={5}>
                  No categories found. Create your first category.
                </td>
              </tr>
            ) : (
              categories.map((category) => (
                <tr key={category.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 text-sm text-gray-500">
                    {category.position}
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      {category.icon && (
                        <span className="text-xl">{category.icon}</span>
                      )}
                      <div>
                        <p className="font-medium text-gray-900">
                          {category.name_en || category.name_hy}
                        </p>
                        {category.name_hy && category.name_en && (
                          <p className="text-sm text-gray-500">{category.name_hy}</p>
                        )}
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-500">
                    /{category.slug}
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-500">
                    {category.listing_count || 0}
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex justify-end gap-2">
                      <button
                        onClick={() => openEditModal(category)}
                        className="text-sm text-blue-600 hover:underline"
                      >
                        Edit
                      </button>
                      {(category.listing_count || 0) === 0 ? (
                        <button
                          onClick={() => setDeleteCategory(category)}
                          className="text-sm text-red-600 hover:underline"
                        >
                          Delete
                        </button>
                      ) : (
                        <span className="text-sm text-gray-400" title="Cannot delete category with listings">
                          Delete
                        </span>
                      )}
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Create/Edit Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-md w-full p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              {editingCategory ? 'Edit Category' : 'Create Category'}
            </h3>

            <form onSubmit={handleSubmit} className="space-y-4">
              {formError && (
                <div className="p-3 bg-red-50 text-red-700 text-sm rounded-lg">
                  {formError}
                </div>
              )}

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Name (English) *
                </label>
                <input
                  type="text"
                  value={formData.name_en}
                  onChange={(e) => handleNameChange(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="e.g., Electronics"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Name (Armenian)
                </label>
                <input
                  type="text"
                  value={formData.name_hy}
                  onChange={(e) => setFormData(prev => ({ ...prev, name_hy: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="e.g., Էdelays"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Slug *
                </label>
                <div className="flex items-center">
                  <span className="text-gray-500 mr-1">/</span>
                  <input
                    type="text"
                    value={formData.slug}
                    onChange={(e) => setFormData(prev => ({ ...prev, slug: e.target.value }))}
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="e.g., electronics"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Position
                  </label>
                  <input
                    type="number"
                    value={formData.position}
                    onChange={(e) => setFormData(prev => ({ ...prev, position: parseInt(e.target.value) || 0 }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    min="0"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Icon (Emoji)
                  </label>
                  <input
                    type="text"
                    value={formData.icon}
                    onChange={(e) => setFormData(prev => ({ ...prev, icon: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="📱"
                    maxLength={2}
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Parent Category
                </label>
                <select
                  value={formData.parent_id}
                  onChange={(e) => setFormData(prev => ({ ...prev, parent_id: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">None (Top Level)</option>
                  {categories
                    .filter(c => c.id !== editingCategory?.id)
                    .map(c => (
                      <option key={c.id} value={c.id}>
                        {c.name_en || c.name_hy}
                      </option>
                    ))
                  }
                </select>
              </div>

              <div className="flex justify-end gap-3 pt-4">
                <button
                  type="button"
                  onClick={closeModal}
                  className="px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={formLoading}
                  className="px-4 py-2 text-sm font-medium text-white bg-[#222222] hover:bg-[#333333] rounded-lg transition-colors disabled:opacity-50"
                >
                  {formLoading ? 'Saving...' : (editingCategory ? 'Update' : 'Create')}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {deleteCategory && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-md w-full p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              Delete Category
            </h3>

            <p className="text-sm text-gray-600 mb-6">
              Are you sure you want to delete &quot;{deleteCategory.name_en || deleteCategory.name_hy}&quot;? 
              This action cannot be undone.
            </p>

            <div className="flex justify-end gap-3">
              <button
                onClick={() => setDeleteCategory(null)}
                className="px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleDelete}
                disabled={deleteLoading}
                className="px-4 py-2 text-sm font-medium text-white bg-red-600 hover:bg-red-700 rounded-lg transition-colors disabled:opacity-50"
              >
                {deleteLoading ? 'Deleting...' : 'Delete'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}




