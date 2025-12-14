'use client';

import { useEffect, useState, useRef } from 'react';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/lib/supabase';
import { Header } from '@/components/layout/Header';
import { ReportModal } from '@/components/ui/ReportModal';

interface User {
  id: string;
  email: string;
  raw_user_meta_data: {
    full_name?: string;
  };
}

interface ListingImage {
  url: string;
  is_primary: boolean;
}

interface Listing {
  id: string;
  title_en: string;
  price: number;
  currency: string;
  listing_images: ListingImage[];
}

interface Message {
  id: string;
  conversation_id: string;
  sender_id: string;
  body: string;
  created_at: string;
  is_read: boolean;
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
}

export default function ConversationPage() {
  const params = useParams();
  const router = useRouter();
  const conversationId = params.id as string;
  
  const { user, loading: authLoading } = useAuth();
  const [conversation, setConversation] = useState<Conversation | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [otherUser, setOtherUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [newMessage, setNewMessage] = useState('');
  const [sending, setSending] = useState(false);
  const [showReportModal, setShowReportModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deleting, setDeleting] = useState(false);
  
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    if (authLoading) return;
    
    if (!user) {
      router.push('/auth/signin');
      return;
    }

    async function fetchConversation() {
      try {
        // Fetch conversation with listing info
        const { data: convo, error: convoError } = await supabase
          .from('conversations')
          .select(`
            *,
            listing:listings(
              id,
              title_en,
              price,
              currency,
              listing_images(url, is_primary)
            )
          `)
          .eq('id', conversationId)
          .single();

        if (convoError) {
          console.error('Error fetching conversation:', convoError);
          setError('Conversation not found');
          return;
        }

        // Check if user is part of this conversation
        if (convo.buyer_id !== user!.id && convo.seller_id !== user!.id) {
          setError('You do not have access to this conversation');
          return;
        }

        setConversation(convo);

        // Fetch the other user's info
        const otherId = convo.buyer_id === user!.id ? convo.seller_id : convo.buyer_id;
        const { data: otherUserData } = await supabase
          .from('users')
          .select('id, email, raw_user_meta_data')
          .eq('id', otherId)
          .single();

        if (otherUserData) {
          setOtherUser(otherUserData);
        }

        // Fetch messages
        const { data: msgs, error: msgsError } = await supabase
          .from('messages')
          .select('*')
          .eq('conversation_id', conversationId)
          .order('created_at', { ascending: true });

        if (msgsError) {
          console.error('Error fetching messages:', msgsError);
        } else {
          setMessages(msgs || []);
        }

        // Mark unread messages as read
        const unreadMessages = (msgs || []).filter(
          m => m.sender_id !== user!.id && !m.is_read
        );

        if (unreadMessages.length > 0) {
          await supabase
            .from('messages')
            .update({ is_read: true })
            .in('id', unreadMessages.map(m => m.id));
        }
      } catch (err) {
        console.error('Error:', err);
        setError('An unexpected error occurred');
      } finally {
        setLoading(false);
      }
    }

    fetchConversation();
  }, [user, authLoading, conversationId, router]);

  // Realtime subscription for new messages
  useEffect(() => {
    if (!user || !conversationId) return;

    const channel = supabase
      .channel(`messages-realtime-${conversationId}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'messages',
          filter: `conversation_id=eq.${conversationId}`,
        },
        (payload) => {
          // Add new message to the messages array
          // Only if it's not from the current user (to avoid duplicates)
          const newMessage = payload.new as Message;
          if (newMessage.sender_id !== user.id) {
            setMessages((prev) => [...prev, newMessage]);
            
            // Mark the incoming message as read since user is viewing the conversation
            supabase
              .from('messages')
              .update({ is_read: true })
              .eq('id', newMessage.id)
              .then(() => {
                // Message marked as read
              });
          }
        }
      )
      .subscribe();

    // Cleanup on unmount
    return () => {
      supabase.removeChannel(channel);
    };
  }, [conversationId, user?.id]);

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!newMessage.trim() || !user || !conversation || sending) return;

    setSending(true);
    const messageBody = newMessage.trim();
    setNewMessage('');

    try {
      // Insert new message
      const { data: msg, error: msgError } = await supabase
        .from('messages')
        .insert({
          conversation_id: conversation.id,
          sender_id: user.id,
          body: messageBody,
          is_read: false,
        })
        .select()
        .single();

      if (msgError) {
        console.error('Error sending message:', msgError);
        setNewMessage(messageBody); // Restore message on error
        return;
      }

      // Add message to list
      setMessages(prev => [...prev, msg]);

      // Update conversation's updated_at
      await supabase
        .from('conversations')
        .update({ updated_at: new Date().toISOString() })
        .eq('id', conversation.id);

      // Create notification for the recipient (don't block on failure)
      try {
        const recipientId = conversation.buyer_id === user.id 
          ? conversation.seller_id 
          : conversation.buyer_id;
        
        // Don't notify yourself
        if (recipientId !== user.id) {
          const senderName = user.user_metadata?.full_name || user.email?.split('@')[0] || 'Someone';
          
          await supabase.from('notifications').insert({
            user_id: recipientId,
            type: 'new_message',
            title: `New message from ${senderName}`,
            body: messageBody.substring(0, 100),
            link: `/messages/${conversation.id}`,
            related_id: conversation.id,
          });
        }
      } catch (notifError) {
        // Fail silently - don't block message sending
        console.error('Failed to create notification:', notifError);
      }

      // Focus input
      inputRef.current?.focus();
    } catch (err) {
      console.error('Error:', err);
      setNewMessage(messageBody); // Restore message on error
    } finally {
      setSending(false);
    }
  };

  const getListingImage = () => {
    if (!conversation?.listing?.listing_images?.length) return null;
    const primary = conversation.listing.listing_images.find(img => img.is_primary);
    return primary?.url || conversation.listing.listing_images[0]?.url;
  };

  const getOtherUserName = () => {
    if (otherUser?.raw_user_meta_data?.full_name) {
      return otherUser.raw_user_meta_data.full_name;
    }
    if (otherUser?.email) {
      return otherUser.email.split('@')[0];
    }
    return 'User';
  };

  const formatMessageTime = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

    if (diffDays === 0) {
      return date.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' });
    } else if (diffDays === 1) {
      return 'Yesterday ' + date.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' });
    } else {
      return date.toLocaleDateString('en-US', { 
        month: 'short', 
        day: 'numeric',
        hour: 'numeric',
        minute: '2-digit'
      });
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage(e);
    }
  };

  const handleDeleteConversation = async () => {
    if (!conversation || !user) return;

    // Verify user is a participant
    if (conversation.buyer_id !== user.id && conversation.seller_id !== user.id) {
      setError('You do not have permission to delete this conversation');
      return;
    }

    setDeleting(true);
    try {
      const { error: deleteError } = await supabase
        .from('conversations')
        .delete()
        .eq('id', conversation.id);

      if (deleteError) {
        console.error('Error deleting conversation:', deleteError);
        setError('Failed to delete conversation');
        return;
      }

      // Redirect to messages list
      router.push('/messages');
    } catch (err) {
      console.error('Error:', err);
      setError('An unexpected error occurred');
    } finally {
      setDeleting(false);
    }
  };

  if (loading || authLoading) {
    return (
      <div className="h-screen flex flex-col">
        <Header />
        <div className="flex-1 bg-[#F5F5F5] flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin w-8 h-8 border-2 border-[#222222] border-t-transparent rounded-full mx-auto mb-4" />
            <p className="text-sm text-[#757575]">Loading conversation...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error || !conversation) {
    return (
      <div className="h-screen flex flex-col">
        <Header />
        <div className="flex-1 bg-[#F5F5F5] flex items-center justify-center">
          <div className="text-center max-w-md mx-auto px-4">
            <div className="w-16 h-16 bg-[#E5E5E5] rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-[#757575]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <h1 className="text-xl font-semibold text-[#222222] mb-2">{error || 'Conversation not found'}</h1>
            <p className="text-[#757575] mb-6">This conversation may have been deleted or you don&apos;t have access.</p>
            <Link
              href="/messages"
              className="inline-block px-6 py-3 bg-[#222222] text-white font-medium hover:bg-[#333333] transition-colors"
            >
              Back to Messages
            </Link>
          </div>
        </div>
      </div>
    );
  }

  const listingImage = getListingImage();

  return (
    <div className="h-screen flex flex-col">
      <Header />
      <div className="flex-1 flex flex-col min-h-0 bg-[#F5F5F5]">
        <div className="max-w-[800px] mx-auto w-full flex-1 flex flex-col min-h-0">
          {/* Back button and Listing Info Header - fixed at top */}
          <div className="flex-shrink-0 bg-white border-b border-[#E5E5E5] px-4 md:px-6 py-4">
            {/* Top row with Back button and Report button */}
            <div className="flex items-center justify-between mb-4">
              <Link
                href="/messages"
                className="inline-flex items-center gap-2 text-sm text-[#757575] hover:text-[#222222]"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
                Back to Messages
              </Link>
              
              {/* Action Buttons */}
              <div className="flex items-center gap-2">
                {/* Delete Conversation Button */}
                <button
                  onClick={() => setShowDeleteModal(true)}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs text-[#757575] hover:text-[#D32F2F] border border-[#E5E5E5] hover:border-[#D32F2F] transition-colors rounded"
                  title="Delete conversation"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                  </svg>
                  Delete
                </button>

                {/* Report User Button */}
                <button
                  onClick={() => setShowReportModal(true)}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs text-[#757575] hover:text-[#D32F2F] border border-[#E5E5E5] hover:border-[#D32F2F] transition-colors rounded"
                  title="Report this user"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 21v-4m0 0V5a2 2 0 012-2h6.5l1 1H21l-3 6 3 6h-8.5l-1-1H5a2 2 0 00-2 2zm9-13.5V9" />
                  </svg>
                  Report
                </button>
              </div>
            </div>

            <Link
              href={`/listing/${conversation.listing.id}`}
              className="flex gap-4 hover:bg-[#F5F5F5] transition-colors p-2 -mx-2 rounded"
            >
              <div className="flex-shrink-0 w-16 h-16 bg-[#F5F5F5] border border-[#E5E5E5] overflow-hidden">
                {listingImage ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={listingImage}
                    alt={conversation.listing.title_en}
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
              <div className="flex-1 min-w-0">
                <p className="font-medium text-[#222222] truncate">{conversation.listing.title_en}</p>
                <p className="text-lg font-bold text-[#222222]">
                  ֏{conversation.listing.price.toLocaleString()}
                </p>
                <p className="text-sm text-[#757575]">
                  Chatting with {getOtherUserName()}
                </p>
              </div>
            </Link>
          </div>

          {/* Messages Container - scrollable middle section */}
          <div className="flex-1 overflow-y-auto min-h-0 px-4 md:px-6 py-4 space-y-4">
            {messages.length === 0 ? (
              <div className="text-center py-8">
                <p className="text-[#757575]">No messages yet. Start the conversation!</p>
              </div>
            ) : (
              messages.map((message) => {
                const isCurrentUser = message.sender_id === user?.id;
                return (
                  <div
                    key={message.id}
                    className={`flex ${isCurrentUser ? 'justify-end' : 'justify-start'}`}
                  >
                    <div
                      className={`max-w-[75%] ${
                        isCurrentUser
                          ? 'bg-[#F56400] text-white'
                          : 'bg-[#E5E5E5] text-[#222222]'
                      } px-4 py-3 rounded-lg`}
                    >
                      <p className="whitespace-pre-wrap break-words">{message.body}</p>
                      <p
                        className={`text-xs mt-1 ${
                          isCurrentUser ? 'text-white/70' : 'text-[#757575]'
                        }`}
                      >
                        {formatMessageTime(message.created_at)}
                      </p>
                    </div>
                  </div>
                );
              })
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Message Input - fixed at bottom */}
          <div className="flex-shrink-0 bg-white border-t border-[#E5E5E5] px-4 md:px-6 py-4">
            <form onSubmit={handleSendMessage} className="flex gap-3">
              <textarea
                ref={inputRef}
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Type a message..."
                rows={1}
                className="flex-1 resize-none border border-[#E5E5E5] px-4 py-3 focus:outline-none focus:border-[#222222] transition-colors text-[#222222] placeholder-[#757575]"
                disabled={sending}
              />
              <button
                type="submit"
                disabled={!newMessage.trim() || sending}
                className="px-6 py-3 bg-[#F56400] text-white font-medium hover:bg-[#D95700] disabled:bg-[#E5E5E5] disabled:text-[#757575] disabled:cursor-not-allowed transition-colors flex-shrink-0"
              >
                {sending ? (
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                ) : (
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                  </svg>
                )}
              </button>
            </form>
          </div>
        </div>
      </div>

      {/* Delete Confirmation Modal */}
      {showDeleteModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div 
            className="absolute inset-0 bg-black/50"
            onClick={() => setShowDeleteModal(false)}
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
                onClick={() => setShowDeleteModal(false)}
                disabled={deleting}
                className="px-4 py-2 text-[#222222] border border-[#E5E5E5] hover:bg-[#F5F5F5] transition-colors disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                onClick={handleDeleteConversation}
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

      {/* Report User Modal */}
      {user && conversation && (
        <ReportModal
          isOpen={showReportModal}
          onClose={() => setShowReportModal(false)}
          reportType="user"
          reporterId={user.id}
          userId={conversation.buyer_id === user.id ? conversation.seller_id : conversation.buyer_id}
          targetName={getOtherUserName()}
        />
      )}
    </div>
  );
}

