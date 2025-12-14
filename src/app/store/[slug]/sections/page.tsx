'use client';

import { useEffect, useState, useCallback } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/lib/supabase';
import { Header } from '@/components/layout/Header';
import { ProtectedRoute } from '@/components/auth/ProtectedRoute';

interface Store {
  id: string;
  user_id: string;
  name: string;
  slug: string;
}

interface Section {
  id: string;
  store_id: string;
  name_en: string | null;
  name_hy: string;
  name_ru: string | null;
  position: number;
  created_at: string;
  listing_count: number;
}

function ManageSectionsContent() {
  const params = useParams();
  const router = useRouter();
  const slug = params.slug as string;
  const { user, loading: authLoading } = useAuth();

  const [store, setStore] = useState<Store | null>(null);
  const [sections, setSections] = useState<Section[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Modal states
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [selectedSection, setSelectedSection] = useState<Section | null>(null);

  // Form states
  const [sectionName, setSectionName] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  // Reorder states
  const [isReordering, setIsReordering] = useState<string | null>(null);

  const fetchSections = useCallback(async (storeId: string) => {
    try {
      // Fetch sections with listing counts
      const { data: sectionsData, error: sectionsError } = await supabase
        .from('store_sections')
        .select('*')
        .eq('store_id', storeId)
        .order('position', { ascending: true });

      if (sectionsError) {
        console.error('Error fetching sections:', sectionsError);
        return;
      }

      // Get listing counts for each section
      const sectionsWithCounts = await Promise.all(
        (sectionsData || []).map(async (section) => {
          const { count } = await supabase
            .from('listings')
            .select('*', { count: 'exact', head: true })
            .eq('section_id', section.id)
            .eq('status', 'active');

          return {
            ...section,
            listing_count: count || 0,
          };
        })
      );

      setSections(sectionsWithCounts);
    } catch (err) {
      console.error('Error fetching sections:', err);
    }
  }, []);

  useEffect(() => {
    async function fetchStoreAndSections() {
      if (!user) return;

      try {
        // Fetch store
        const { data: storeData, error: storeError } = await supabase
          .from('stores')
          .select('id, user_id, name, slug')
          .eq('slug', slug)
          .single();

        if (storeError) {
          if (storeError.code === 'PGRST116') {
            setError('Store not found');
          } else {
            setError('Failed to load store');
          }
          return;
        }

        // Check ownership
        if (storeData.user_id !== user.id) {
          setError('You do not have permission to manage this store');
          return;
        }

        setStore(storeData);
        await fetchSections(storeData.id);
      } catch (err) {
        console.error('Error:', err);
        setError('An unexpected error occurred');
      } finally {
        setLoading(false);
      }
    }

    if (!authLoading && user) {
      fetchStoreAndSections();
    } else if (!authLoading && !user) {
      router.push('/auth/signin');
    }
  }, [slug, user, authLoading, router, fetchSections]);

  const handleAddSection = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!store || !sectionName.trim()) return;

    setIsSubmitting(true);
    setFormError(null);

    try {
      // Get the next position
      const nextPosition = sections.length > 0
        ? Math.max(...sections.map(s => s.position)) + 1
        : 0;

      const { error } = await supabase.from('store_sections').insert({
        store_id: store.id,
        name_en: sectionName.trim(),
        name_hy: sectionName.trim(), // Same value for now
        position: nextPosition,
      });

      if (error) {
        console.error('Error creating section:', error);
        setFormError('Failed to create section. Please try again.');
        return;
      }

      // Refresh sections and close modal
      await fetchSections(store.id);
      setShowAddModal(false);
      setSectionName('');
    } catch (err) {
      console.error('Error:', err);
      setFormError('An unexpected error occurred.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleEditSection = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!store || !selectedSection || !sectionName.trim()) return;

    setIsSubmitting(true);
    setFormError(null);

    try {
      const { error } = await supabase
        .from('store_sections')
        .update({
          name_en: sectionName.trim(),
          name_hy: sectionName.trim(), // Same value for now
        })
        .eq('id', selectedSection.id);

      if (error) {
        console.error('Error updating section:', error);
        setFormError('Failed to update section. Please try again.');
        return;
      }

      // Refresh sections and close modal
      await fetchSections(store.id);
      setShowEditModal(false);
      setSelectedSection(null);
      setSectionName('');
    } catch (err) {
      console.error('Error:', err);
      setFormError('An unexpected error occurred.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteSection = async () => {
    if (!store || !selectedSection) return;

    setIsSubmitting(true);
    setFormError(null);

    try {
      // First, unassign listings from this section
      if (selectedSection.listing_count > 0) {
        const { error: updateError } = await supabase
          .from('listings')
          .update({ section_id: null })
          .eq('section_id', selectedSection.id);

        if (updateError) {
          console.error('Error unassigning listings:', updateError);
          setFormError('Failed to unassign listings. Please try again.');
          return;
        }
      }

      // Then delete the section
      const { error } = await supabase
        .from('store_sections')
        .delete()
        .eq('id', selectedSection.id);

      if (error) {
        console.error('Error deleting section:', error);
        setFormError('Failed to delete section. Please try again.');
        return;
      }

      // Refresh sections and close modal
      await fetchSections(store.id);
      setShowDeleteModal(false);
      setSelectedSection(null);
    } catch (err) {
      console.error('Error:', err);
      setFormError('An unexpected error occurred.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleMoveSection = async (sectionId: string, direction: 'up' | 'down') => {
    if (!store) return;

    const currentIndex = sections.findIndex(s => s.id === sectionId);
    if (currentIndex === -1) return;

    const newIndex = direction === 'up' ? currentIndex - 1 : currentIndex + 1;
    if (newIndex < 0 || newIndex >= sections.length) return;

    setIsReordering(sectionId);

    try {
      const currentSection = sections[currentIndex];
      const swapSection = sections[newIndex];

      // Swap positions
      await Promise.all([
        supabase
          .from('store_sections')
          .update({ position: swapSection.position })
          .eq('id', currentSection.id),
        supabase
          .from('store_sections')
          .update({ position: currentSection.position })
          .eq('id', swapSection.id),
      ]);

      // Refresh sections
      await fetchSections(store.id);
    } catch (err) {
      console.error('Error reordering sections:', err);
    } finally {
      setIsReordering(null);
    }
  };

  const openEditModal = (section: Section) => {
    setSelectedSection(section);
    setSectionName(section.name_en || section.name_hy);
    setShowEditModal(true);
  };

  const openDeleteModal = (section: Section) => {
    setSelectedSection(section);
    setShowDeleteModal(true);
  };

  const closeModals = () => {
    setShowAddModal(false);
    setShowEditModal(false);
    setShowDeleteModal(false);
    setSelectedSection(null);
    setSectionName('');
    setFormError(null);
  };

  if (loading || authLoading) {
    return (
      <>
        <Header />
        <div className="min-h-screen bg-[#F5F5F5] flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin w-8 h-8 border-2 border-[#222222] border-t-transparent rounded-full mx-auto mb-4" />
            <p className="text-sm text-[#757575]">Loading...</p>
          </div>
        </div>
      </>
    );
  }

  if (error) {
    return (
      <>
        <Header />
        <div className="min-h-screen bg-[#F5F5F5] flex items-center justify-center">
          <div className="text-center max-w-md mx-auto px-4">
            <div className="w-16 h-16 bg-[#E5E5E5] rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-[#757575]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
            </div>
            <h1 className="text-xl font-semibold text-[#222222] mb-2">{error}</h1>
            <Link
              href="/"
              className="inline-block px-6 py-3 bg-[#222222] text-white font-medium hover:bg-[#333333] transition-colors"
            >
              Back to Home
            </Link>
          </div>
        </div>
      </>
    );
  }

  if (!store) return null;

  return (
    <>
      <Header />
      <div className="min-h-screen bg-[#F5F5F5]">
        {/* Page Header */}
        <div className="bg-white border-b border-[#E5E5E5]">
          <div className="max-w-3xl mx-auto px-4 py-6">
            <Link
              href={`/store/${store.slug}`}
              className="text-[#757575] hover:text-[#222222] text-sm mb-4 inline-flex items-center gap-1"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
              Back to {store.name}
            </Link>
            <h1 className="text-2xl md:text-3xl font-semibold text-[#222222]">Manage Sections</h1>
            <p className="text-[#757575] mt-2">Organize your listings into sections</p>
          </div>
        </div>

        <div className="max-w-3xl mx-auto px-4 py-8">
          {/* Add Section Button */}
          <div className="mb-6">
            <button
              onClick={() => setShowAddModal(true)}
              className="inline-flex items-center gap-2 px-4 py-2 bg-[#F56400] hover:bg-[#D95700] transition-colors text-sm font-medium text-white"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
              Add Section
            </button>
          </div>

          {/* Sections List */}
          {sections.length > 0 ? (
            <div className="bg-white border border-[#E5E5E5]">
              {sections.map((section, index) => (
                <div
                  key={section.id}
                  className={`flex items-center justify-between p-4 ${
                    index !== sections.length - 1 ? 'border-b border-[#E5E5E5]' : ''
                  }`}
                >
                  <div className="flex-1">
                    <h3 className="font-medium text-[#222222]">
                      {section.name_en || section.name_hy}
                    </h3>
                    <p className="text-sm text-[#757575]">
                      {section.listing_count} {section.listing_count === 1 ? 'listing' : 'listings'}
                    </p>
                  </div>

                  <div className="flex items-center gap-2">
                    {/* Reorder Buttons */}
                    <div className="flex flex-col gap-0.5 mr-2">
                      <button
                        onClick={() => handleMoveSection(section.id, 'up')}
                        disabled={index === 0 || isReordering !== null}
                        className="p-1 text-[#757575] hover:text-[#222222] disabled:opacity-30 disabled:cursor-not-allowed"
                        title="Move up"
                      >
                        {isReordering === section.id ? (
                          <div className="w-4 h-4 border-2 border-[#757575] border-t-transparent rounded-full animate-spin" />
                        ) : (
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" />
                          </svg>
                        )}
                      </button>
                      <button
                        onClick={() => handleMoveSection(section.id, 'down')}
                        disabled={index === sections.length - 1 || isReordering !== null}
                        className="p-1 text-[#757575] hover:text-[#222222] disabled:opacity-30 disabled:cursor-not-allowed"
                        title="Move down"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                        </svg>
                      </button>
                    </div>

                    {/* Edit Button */}
                    <button
                      onClick={() => openEditModal(section)}
                      className="p-2 text-[#757575] hover:text-[#222222] hover:bg-[#F5F5F5] transition-colors"
                      title="Edit section"
                    >
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                      </svg>
                    </button>

                    {/* Delete Button */}
                    <button
                      onClick={() => openDeleteModal(section)}
                      className="p-2 text-[#757575] hover:text-[#D32F2F] hover:bg-[#FFEBEE] transition-colors"
                      title="Delete section"
                    >
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                      </svg>
                    </button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            /* Empty State */
            <div className="bg-white border border-[#E5E5E5] p-12 text-center">
              <div className="w-16 h-16 bg-[#F5F5F5] rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-[#757575]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                </svg>
              </div>
              <h3 className="text-lg font-medium text-[#222222] mb-2">No sections yet</h3>
              <p className="text-[#757575] mb-6 max-w-sm mx-auto">
                Create sections to organize your listings. Buyers will see tabs to filter by section on your store page.
              </p>
              <button
                onClick={() => setShowAddModal(true)}
                className="inline-flex items-center gap-2 px-6 py-3 bg-[#222222] hover:bg-[#333333] transition-colors font-medium text-white"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                </svg>
                Create Your First Section
              </button>
            </div>
          )}

          {/* Info Box */}
          <div className="mt-6 p-4 bg-[#E3F2FD] border border-[#1976D2] text-[#1976D2] text-sm">
            <div className="flex items-start gap-3">
              <svg className="w-5 h-5 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <div>
                <p className="font-medium mb-1">How sections work</p>
                <ul className="list-disc list-inside space-y-1 text-[#1976D2]/80">
                  <li>Sections with listings appear as tabs on your store page</li>
                  <li>Empty sections are only visible here (not to buyers)</li>
                  <li>Assign listings to sections when creating or editing them</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Add Section Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 overflow-y-auto">
          <div className="flex min-h-full items-center justify-center p-4">
            <div className="fixed inset-0 bg-black/50" onClick={closeModals} />
            <div className="relative bg-white w-full max-w-md p-6">
              <h2 className="text-xl font-semibold text-[#222222] mb-4">Add Section</h2>
              
              <form onSubmit={handleAddSection}>
                {formError && (
                  <div className="mb-4 p-3 bg-[#FFEBEE] border border-[#D32F2F] text-[#D32F2F] text-sm">
                    {formError}
                  </div>
                )}

                <div className="mb-6">
                  <label htmlFor="sectionName" className="block text-sm font-medium text-[#222222] mb-2">
                    Section Name <span className="text-[#D32F2F]">*</span>
                  </label>
                  <input
                    type="text"
                    id="sectionName"
                    value={sectionName}
                    onChange={(e) => setSectionName(e.target.value)}
                    placeholder="e.g., Electronics, Clothing, Books"
                    className="w-full px-4 py-3 border border-[#E5E5E5] focus:border-[#222222] focus:outline-none text-[#222222] placeholder-[#757575]"
                    maxLength={100}
                    autoFocus
                  />
                </div>

                <div className="flex gap-3">
                  <button
                    type="button"
                    onClick={closeModals}
                    className="flex-1 px-4 py-3 border border-[#E5E5E5] text-[#222222] hover:bg-[#F5F5F5] transition-colors font-medium"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={isSubmitting || !sectionName.trim()}
                    className="flex-1 px-4 py-3 bg-[#222222] text-white hover:bg-[#333333] transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {isSubmitting ? 'Creating...' : 'Create Section'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Edit Section Modal */}
      {showEditModal && selectedSection && (
        <div className="fixed inset-0 z-50 overflow-y-auto">
          <div className="flex min-h-full items-center justify-center p-4">
            <div className="fixed inset-0 bg-black/50" onClick={closeModals} />
            <div className="relative bg-white w-full max-w-md p-6">
              <h2 className="text-xl font-semibold text-[#222222] mb-4">Edit Section</h2>
              
              <form onSubmit={handleEditSection}>
                {formError && (
                  <div className="mb-4 p-3 bg-[#FFEBEE] border border-[#D32F2F] text-[#D32F2F] text-sm">
                    {formError}
                  </div>
                )}

                <div className="mb-6">
                  <label htmlFor="editSectionName" className="block text-sm font-medium text-[#222222] mb-2">
                    Section Name <span className="text-[#D32F2F]">*</span>
                  </label>
                  <input
                    type="text"
                    id="editSectionName"
                    value={sectionName}
                    onChange={(e) => setSectionName(e.target.value)}
                    placeholder="e.g., Electronics, Clothing, Books"
                    className="w-full px-4 py-3 border border-[#E5E5E5] focus:border-[#222222] focus:outline-none text-[#222222] placeholder-[#757575]"
                    maxLength={100}
                    autoFocus
                  />
                </div>

                <div className="flex gap-3">
                  <button
                    type="button"
                    onClick={closeModals}
                    className="flex-1 px-4 py-3 border border-[#E5E5E5] text-[#222222] hover:bg-[#F5F5F5] transition-colors font-medium"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={isSubmitting || !sectionName.trim()}
                    className="flex-1 px-4 py-3 bg-[#222222] text-white hover:bg-[#333333] transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {isSubmitting ? 'Saving...' : 'Save Changes'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {showDeleteModal && selectedSection && (
        <div className="fixed inset-0 z-50 overflow-y-auto">
          <div className="flex min-h-full items-center justify-center p-4">
            <div className="fixed inset-0 bg-black/50" onClick={closeModals} />
            <div className="relative bg-white w-full max-w-md p-6">
              <h2 className="text-xl font-semibold text-[#222222] mb-4">Delete Section</h2>
              
              {formError && (
                <div className="mb-4 p-3 bg-[#FFEBEE] border border-[#D32F2F] text-[#D32F2F] text-sm">
                  {formError}
                </div>
              )}

              <p className="text-[#595959] mb-4">
                Are you sure you want to delete &quot;{selectedSection.name_en || selectedSection.name_hy}&quot;?
              </p>

              {selectedSection.listing_count > 0 && (
                <div className="mb-4 p-3 bg-[#FFF3E0] border border-[#F56400] text-[#F56400] text-sm">
                  <strong>Warning:</strong> This section contains {selectedSection.listing_count} {selectedSection.listing_count === 1 ? 'listing' : 'listings'}. 
                  {' '}These listings will be unassigned from this section but won&apos;t be deleted.
                </div>
              )}

              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={closeModals}
                  className="flex-1 px-4 py-3 border border-[#E5E5E5] text-[#222222] hover:bg-[#F5F5F5] transition-colors font-medium"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleDeleteSection}
                  disabled={isSubmitting}
                  className="flex-1 px-4 py-3 bg-[#D32F2F] text-white hover:bg-[#B71C1C] transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isSubmitting ? 'Deleting...' : 'Delete Section'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

export default function ManageSectionsPage() {
  return (
    <ProtectedRoute>
      <ManageSectionsContent />
    </ProtectedRoute>
  );
}
