import { create } from "zustand"
import type { MessageRow } from "@/lib/chat/models"

export type ChatFilter = "all" | "unread" | "groups" | "pinned"

interface UiState {
  sidebarOpen: boolean
  contactPanelOpen: boolean
  chatFilter: ChatFilter
  searchQuery: string
  replyingTo: MessageRow | null
  forwardMessageId: string | null
  editingMessage: MessageRow | null
  deleteTarget: MessageRow | null
  createGroupOpen: boolean
  startDirectChatOpen: boolean
  setSidebarOpen: (v: boolean) => void
  setContactPanelOpen: (v: boolean) => void
  setChatFilter: (f: ChatFilter) => void
  setSearchQuery: (q: string) => void
  setReplyingTo: (m: MessageRow | null) => void
  setForwardMessageId: (id: string | null) => void
  setEditingMessage: (m: MessageRow | null) => void
  setDeleteTarget: (m: MessageRow | null) => void
  setCreateGroupOpen: (v: boolean) => void
  setStartDirectChatOpen: (v: boolean) => void
}

export const useUiStore = create<UiState>((set) => ({
  sidebarOpen: false,
  contactPanelOpen: false,
  chatFilter: "all",
  searchQuery: "",
  replyingTo: null,
  forwardMessageId: null,
  editingMessage: null,
  deleteTarget: null,
  createGroupOpen: false,
  startDirectChatOpen: false,
  setSidebarOpen: (sidebarOpen) => set({ sidebarOpen }),
  setContactPanelOpen: (contactPanelOpen) => set({ contactPanelOpen }),
  setChatFilter: (chatFilter) => set({ chatFilter }),
  setSearchQuery: (searchQuery) => set({ searchQuery }),
  setReplyingTo: (replyingTo) => set({ replyingTo }),
  setForwardMessageId: (forwardMessageId) => set({ forwardMessageId }),
  setEditingMessage: (editingMessage) => set({ editingMessage }),
  setDeleteTarget: (deleteTarget) => set({ deleteTarget }),
  setCreateGroupOpen: (createGroupOpen) => set({ createGroupOpen }),
  setStartDirectChatOpen: (startDirectChatOpen) => set({ startDirectChatOpen }),
}))
