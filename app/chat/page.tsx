"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import ChatWindow from "@/components/ChatWindow";
import Sidebar from "@/components/Sidebar";
import LoadingSkeleton from "@/components/ui/LoadingSkeleton";
import { useAuth } from "@/hooks/useAuth";
import { useMessages } from "@/hooks/useMessages";
import { usePresence } from "@/hooks/usePresence";
import { useTyping } from "@/hooks/useTyping";
import { useUsers } from "@/hooks/useUsers";
import { getOrCreateDirectConversation } from "@/lib/chat/conversations";
import type { ChatUser } from "@/lib/chat/models";
import { useChatStore } from "@/store/chat-store";

export default function ChatPage() {
  const router = useRouter();
  const { currentUser, isLoading: isAuthLoading, signOut } = useAuth();
  const activeConversationId = useChatStore((state) => state.activeConversationId);
  const presenceByUserId = useChatStore((state) => state.presenceByUserId);
  const selectedUser = useChatStore((state) => state.selectedUser);
  const setSelectedChat = useChatStore((state) => state.setSelectedChat);
  
  const { error: usersError, isLoading: isUsersLoading, users } = useUsers(currentUser?.id);
  const { error: messageError, isLoading: isMessagesLoading, isSending, messages, sendMessage } =
    useMessages({
      conversationId: activeConversationId,
      currentUserId: currentUser?.id,
    });
  const { broadcastTyping, typingUsers } = useTyping({
    conversationId: activeConversationId,
    currentUserId: currentUser?.id,
  });
  
  const [isSelectingUser, setIsSelectingUser] = useState(false);
  const [selectionError, setSelectionError] = useState<string | null>(null);

  usePresence(currentUser?.id);

  useEffect(() => {
    if (!isAuthLoading && !currentUser) {
      router.replace("/login");
    }
  }, [currentUser, isAuthLoading, router]);

  const handleSelectUser = async (user: ChatUser) => {
    setIsSelectingUser(true);
    setSelectionError(null);

    try {
      const conversationId = await getOrCreateDirectConversation(user.id);
      setSelectedChat(user, conversationId);
    } catch (error) {
      setSelectionError(error instanceof Error ? error.message : "Unable to open conversation");
    } finally {
      setIsSelectingUser(false);
    }
  };

  const handleSendMessage = async (content: string) => {
    if (!currentUser || !selectedUser || !activeConversationId) {
      return;
    }

    await sendMessage({
      content,
      conversationId: activeConversationId,
      receiverId: selectedUser.id,
      senderId: currentUser.id,
    });
    await broadcastTyping(false);
  };

  const handleLogout = async () => {
    await signOut();
    router.replace("/login");
  };

  // Loading state
  if (isAuthLoading || (!currentUser && !selectionError)) {
    return <LoadingSkeleton variant="full" />;
  }

  if (!currentUser) {
    return null;
  }

  return (
    <main className="flex min-h-screen flex-col bg-[#090d18] lg:flex-row">
      <Sidebar
        currentUser={currentUser}
        isLoading={isUsersLoading || isSelectingUser}
        onLogout={handleLogout}
        onSelectUser={handleSelectUser}
        presenceByUserId={presenceByUserId}
        selectedUserId={selectedUser?.id}
        users={users}
      />

      <div className="flex min-w-0 flex-1 flex-col">
        {/* Error banners */}
        {(usersError || selectionError) && (
          <div className="mx-4 mt-4 rounded-2xl border border-rose-500/20 bg-rose-500/10 px-4 py-3 text-sm text-rose-300 lg:mx-0 lg:mt-0 lg:rounded-none">
            <div className="flex items-center gap-2">
              <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              {usersError || selectionError}
            </div>
          </div>
        )}

        <ChatWindow
          currentUser={currentUser}
          error={messageError}
          isLoading={isMessagesLoading}
          isSending={isSending}
          isTyping={selectedUser ? typingUsers.includes(selectedUser.id) : false}
          messages={messages}
          onSendMessage={handleSendMessage}
          onTypingChange={(isTyping) => void broadcastTyping(isTyping)}
          selectedUser={selectedUser}
        />
      </div>
    </main>
  );
}