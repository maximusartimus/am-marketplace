'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/lib/supabase';
import { Header } from '@/components/layout/Header';

interface User {
  id: string;
  email: string;
  raw_user_meta_data: {
    full_name?: string;
  };
}

interface Listing {
  id: string;
  title_en: string;
  listing_images: {
    url: string;
    is_primary: boolean;
  }[];
}

interface Message {
  id: string;
  body: string;
  created_at: string;
  is_read: boolean;
  sender_id: string;
}

interface Conversation {
  id: string;
  listing_id: string;
  buyer_id: string;
  seller_id: string;
  created_at: string;
  updated_at: string;
  status: string;
  listing: Listing;
  messages: Message[];
  other_user?: User;
  unread_count?: number;
}

export default function MessagesPage() {
  const router = useRouter();
  const { user, loading: authLoading } = useAuth();
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [conversationToDelete, setConversationToDelete] = useState<string | null>(null);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    if (authLoading) return;
    
    if (!user) {
      router.push('/auth/signin');
      return;
    }

    async function fetchConversations() {
      try {
        // Fetch conversations where user is buyer or seller
        const { data: convos, error: convosError } = await supabase
          .from('conversations')
          .select(`
            *,
            listing:listings(
              id,
              title_en,
              listing_images(url, is_primary)
            ),
            messages(
              id,
              body,
              created_at,
              is_read,
              sender_id
            )
          `)
          .or(`buyer_id.eq.${user!.id},seller_id.eq.${user!.id}`)
          .order('updated_at', { ascending: false });

        if (convosError) {
          console.error('Error fetching conversations:', convosError);
          setError('Failed to load messages');
          return;
        }

        if (!convos || convos.length === 0) {
          setConversations([]);
          return;
        }

        // Get unique user IDs (the other party in each conversation)
        const otherUserIds = convos.map(c => 
          c.buyer_id === user!.id ? c.seller_id : c.buyer_id
        );
        const uniqueUserIds = [...new Set(otherUserIds)];

        // Fetch user details from auth.users via a workaround
        // Since we can't directly access auth.users, we'll use the profiles or users table if available
        // For now, we'll work with what we have and show email fallback
        const { data: users } = await supabase
          .from('users')
          .select('id, email, raw_user_meta_data')
          .in('id', uniqueUserIds);

        const usersMap = new Map(users?.map(u => [u.id, u]) || []);

        // Process conversations
        const processedConvos = convos.map(convo => {
          const otherId = convo.buyer_id === user!.id ? convo.seller_id : convo.buyer_id;
          const otherUser = usersMap.get(otherId);
          
          // Sort messages by created_at descending
          const sortedMessages = (convo.messages || []).sort(
            (a: Message, b: Message) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
          );

          // Count unread messages (not sent by current user and not read)
          const unreadCount = sortedMessages.filter(
            (m: Message) => m.sender_id !== user!.id && !m.is_read
          ).length;

          return {
            ...convo,
            messages: sortedMessages,
            other_user: otherUser,
            unread_count: unreadCount,
          };
        });

        setConversations(processedConvos);
      } catch (err) {
        console.error('Error:', err);
        setError('An unexpected error occurred');
      } finally {
        setLoading(false);
      }
    }

    fetchConversations();
  }, [user, authLoading, router]);

  const getListingImage = (listing: Listing) => {
    if (!listing.listing_images || listing.listing_images.length === 0) {
      return null;
    }
    const primary = listing.listing_images.find(img => img.is_primary);
    return primary?.url || listing.listing_images[0]?.url;
  };

  const getOtherUserName = (convo: Conversation) => {
    if (convo.other_user?.raw_user_meta_data?.full_name) {
      return convo.other_user.raw_user_meta_data.full_name;
    }
    if (convo.other_user?.email) {
      return convo.other_user.email.split('@')[0];
    }
    return 'User';
  };

  const formatTime = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

    if (diffDays === 0) {
      return date.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' });
    } else if (diffDays === 1) {
      return 'Yesterday';
    } else if (diffDays < 7) {
      return date.toLocaleDateString('en-US', { weekday: 'short' });
    } else {
      return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    }
  };

  const handleDeleteClick = (e: React.MouseEvent, conversationId: string) => {
    e.preventDefault();
    e.stopPropagation();
    setConversationToDelete(conversationId);
    setDeleteModalOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (!conversationToDelete || !user) return;

    setDeleting(true);
    try {
      // Verify user is a participant before deleting
      const conversation = conversations.find(c => c.id === conversationToDelete);
      if (!conversation || (conversation.buyer_id !== user.id && conversation.seller_id !== user.id)) {
        setError('You do not have permission to delete this conversation');
        return;
      }

      const { error: deleteError } = await supabase
        .from('conversations')
        .delete()
        .eq('id', conversationToDelete);

      if (deleteError) {
        console.error('Error deleting conversation:', deleteError);
        setError('Failed to delete conversation');
        return;
      }

      // Remove from local state
      setConversations(prev => prev.filter(c => c.id !== conversationToDelete));
      setDeleteModalOpen(false);
      setConversationToDelete(null);
    } catch (err) {
      console.error('Error:', err);
      setError('An unexpected error occurred');
    } finally {
      setDeleting(false);
    }
  };

  const handleDeleteCancel = () => {
    setDeleteModalOpen(false);
    setConversationToDelete(null);
  };

  if (loading || authLoading) {
    return (
      <>
        <Header />
        <div className="min-h-screen bg-[#F5F5F5] flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin w-8 h-8 border-2 border-[#222222] border-t-transparent rounded-full mx-auto mb-4" />
            <p className="text-sm text-[#757575]">Loading messages...</p>
          </div>
        </div>
      </>
    );
  }

  return (
    <>
      <Header />
      <div className="min-h-screen bg-[#F5F5F5]">
        <div className="max-w-[800px] mx-auto px-4 md:px-6 py-6">
          <h1 className="text-2xl font-semibold text-[#222222] mb-6">Messages</h1>

          {error && (
            <div className="bg-[#FFEBEE] text-[#D32F2F] px-4 py-3 mb-6">
              {error}
            </div>
          )}

          {conversations.length === 0 ? (
            <div className="bg-white border border-[#E5E5E5] p-8 text-center">
              <div className="w-16 h-16 bg-[#F5F5F5] rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-[#757575]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                </svg>
              </div>
              <h2 className="text-lg font-medium text-[#222222] mb-2">No messages yet</h2>
              <p className="text-[#757575] mb-6">
                When you contact a seller or receive a message, it will appear here.
              </p>
              <Link
                href="/"
                className="inline-block px-6 py-3 bg-[#222222] text-white font-medium hover:bg-[#333333] transition-colors"
              >
                Browse Listings
              </Link>
            </div>
          ) : (
            <div className="bg-white border border-[#E5E5E5] divide-y divide-[#E5E5E5]">
              {conversations.map((convo) => {
                const lastMessage = convo.messages[0];
                const listingImage = getListingImage(convo.listing);
                const hasUnread = (convo.unread_count || 0) > 0;

                return (
                  <div key={convo.id} className="relative group">
                    <Link
                      href={`/messages/${convo.id}`}
                      className={`flex gap-4 p-4 hover:bg-[#F5F5F5] transition-colors ${
                        hasUnread ? 'bg-[#FFF3E0]' : ''
                      }`}
                    >
                      {/* Listing Image */}
                      <div className="flex-shrink-0 w-16 h-16 bg-[#F5F5F5] border border-[#E5E5E5] overflow-hidden">
                        {listingImage ? (
                          // eslint-disable-next-line @next/next/no-img-element
                          <img
                            src={listingImage}
                            alt={convo.listing.title_en}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-[#757575]">
                            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                            </svg>
                          </div>
                        )}
                      </div>

                      {/* Content */}
                      <div className="flex-1 min-w-0 pr-8">
                        <div className="flex items-start justify-between gap-2">
                          <div className="min-w-0">
                            <p className={`text-sm truncate ${hasUnread ? 'font-semibold' : 'font-medium'} text-[#222222]`}>
                              {getOtherUserName(convo)}
                            </p>
                            <p className="text-xs text-[#757575] truncate">
                              {convo.listing.title_en}
                            </p>
                          </div>
                          <div className="flex-shrink-0 text-right">
                            <p className="text-xs text-[#757575]">
                              {lastMessage ? formatTime(lastMessage.created_at) : formatTime(convo.created_at)}
                            </p>
                            {hasUnread && (
                              <span className="inline-flex items-center justify-center w-5 h-5 text-xs font-medium bg-[#F56400] text-white rounded-full mt-1">
                                {convo.unread_count}
                              </span>
                            )}
                          </div>
                        </div>
                        {lastMessage && (
                          <p className={`text-sm mt-1 truncate ${hasUnread ? 'text-[#222222]' : 'text-[#757575]'}`}>
                            {lastMessage.sender_id === user?.id ? 'You: ' : ''}{lastMessage.body}
                          </p>
                        )}
                      </div>
                    </Link>

                    {/* Delete Button */}
                    <button
                      onClick={(e) => handleDeleteClick(e, convo.id)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 p-2 text-[#757575] hover:text-[#D32F2F] opacity-0 group-hover:opacity-100 transition-opacity"
                      title="Delete conversation"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                      </svg>
                    </button>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* Delete Confirmation Modal */}
      {deleteModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div 
            className="absolute inset-0 bg-black/50"
            onClick={handleDeleteCancel}
          />
          <div className="relative bg-white w-full max-w-md mx-4 p-6 shadow-lg">
            <h2 className="text-lg font-semibold text-[#222222] mb-2">
              Delete this conversation?
            </h2>
            <p className="text-[#757575] mb-6">
              This will permanently delete all messages. This action cannot be undone.
            </p>
            <div className="flex gap-3 justify-end">
              <button
                onClick={handleDeleteCancel}
                disabled={deleting}
                className="px-4 py-2 text-[#222222] border border-[#E5E5E5] hover:bg-[#F5F5F5] transition-colors disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                onClick={handleDeleteConfirm}
                disabled={deleting}
                className="px-4 py-2 bg-[#D32F2F] text-white hover:bg-[#B71C1C] transition-colors disabled:opacity-50 flex items-center gap-2"
              >
                {deleting ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    Deleting...
                  </>
                ) : (
                  'Delete'
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}


