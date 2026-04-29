"use client"

import { useEffect, useMemo } from "react"
import { usePathname, useRouter } from "next/navigation"
import { BottomNav } from "@/components/layout/BottomNav"
import { ContactInfoPanel } from "@/components/layout/ContactInfoPanel"
import { Sidebar } from "@/components/layout/Sidebar"
import { StartDirectChatModal } from "@/components/chat/StartDirectChatModal"
import { CreateGroupModal } from "@/components/groups/CreateGroupModal"
import LoadingSkeleton from "@/components/ui/LoadingSkeleton"
import { useAuth } from "@/hooks/useAuth"
import { useLastSeen } from "@/hooks/useLastSeen"
import { usePresence } from "@/hooks/usePresence"
import { useChats } from "@/hooks/useChats"
import { useUsers } from "@/hooks/useUsers"
import type { ChatUser } from "@/lib/chat/models"
import { useChatStore } from "@/store/chat-store"
import { useUiStore } from "@/store/ui-store"

export function AppShell({ children }: { children: React.ReactNode }) {
  const router = useRouter()
  const pathname = usePathname()
  const { currentUser, isLoading } = useAuth()
  const { chats, isLoading: chatsLoading, error: chatsError } = useChats(currentUser?.id)
  const { users } = useUsers(currentUser?.id)

  const setCreateGroupOpen = useUiStore((s) => s.setCreateGroupOpen)
  const setStartDirectChatOpen = useUiStore((s) => s.setStartDirectChatOpen)
  const createGroupOpen = useUiStore((s) => s.createGroupOpen)
  const startDirectChatOpen = useUiStore((s) => s.startDirectChatOpen)
  const contactPanelOpen = useUiStore((s) => s.contactPanelOpen)
  const setContactPanelOpen = useUiStore((s) => s.setContactPanelOpen)

  const selectedUser = useChatStore((s) => s.selectedUser)
  const isGroupConversation = useChatStore((s) => s.isGroupConversation)
  const groupTitle = useChatStore((s) => s.groupTitle)
  const groupAvatarUrl = useChatStore((s) => s.groupAvatarUrl)
  const conversationIdFromPath = useMemo(() => {
    if (!pathname.startsWith("/chats/")) {
      return null
    }
    const seg = pathname.split("/")[2]
    return seg && seg !== "chats" ? seg : null
  }, [pathname])

  const contactUser: ChatUser | null = useMemo(() => {
    if (!conversationIdFromPath) {
      return null
    }
    if (isGroupConversation) {
      return {
        id: conversationIdFromPath,
        fullName: groupTitle ?? "Group",
        email: null,
        avatarUrl: groupAvatarUrl,
      }
    }
    return selectedUser
  }, [conversationIdFromPath, groupAvatarUrl, groupTitle, isGroupConversation, selectedUser])

  useLastSeen(Boolean(currentUser) && !isLoading)
  usePresence(currentUser?.id)

  useEffect(() => {
    if (!isLoading && !currentUser) {
      router.replace("/login")
    }
  }, [currentUser, isLoading, router])

  useEffect(() => {
    if (pathname === "/chats") {
      setContactPanelOpen(false)
    }
  }, [pathname, setContactPanelOpen])

  if (isLoading || (!currentUser && !isLoading)) {
    return <LoadingSkeleton variant="full" />
  }

  if (!currentUser) {
    return null
  }

  return (
    <div className="flex h-[100dvh] max-h-[100dvh] w-full overflow-hidden bg-[var(--bg-app)]">
      <Sidebar
        chats={chats}
        isLoading={chatsLoading}
        error={chatsError}
        onNewDirectChat={() => setStartDirectChatOpen(true)}
        onOpenCreateGroup={() => setCreateGroupOpen(true)}
        typingByConversationId={{}}
      />

      <div className="flex min-h-0 min-w-0 flex-1 flex-col pb-14 lg:flex-row lg:pb-0">
        <div className="flex min-h-0 min-w-0 flex-1 flex-col">{children}</div>

        {contactPanelOpen && contactUser && conversationIdFromPath ? (
          <ContactInfoPanel
            conversationId={conversationIdFromPath}
            isGroup={isGroupConversation}
            user={contactUser}
          />
        ) : null}
      </div>

      <BottomNav />

      <StartDirectChatModal
        onClose={() => setStartDirectChatOpen(false)}
        open={startDirectChatOpen}
        users={users}
      />
      <CreateGroupModal
        onClose={() => setCreateGroupOpen(false)}
        open={createGroupOpen}
        users={users}
      />
    </div>
  )
}
