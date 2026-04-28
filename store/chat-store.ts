import { create } from "zustand"
import type { MessageRow, ChatUser } from "@/lib/chat/models"

interface ChatState {
  activeConversationId: string | null
  currentUser: ChatUser | null
  messages: MessageRow[]
  presenceByUserId: Record<string, boolean>
  selectedUser: ChatUser | null
  typingByUserId: Record<string, boolean>
  addMessage: (message: MessageRow) => void
  clearMessages: () => void
  reset: () => void
  setCurrentUser: (user: ChatUser | null) => void
  setMessages: (messages: MessageRow[]) => void
  setPresenceMap: (presenceByUserId: Record<string, boolean>) => void
  setSelectedChat: (selectedUser: ChatUser | null, conversationId: string | null) => void
  setTypingState: (userId: string, isTyping: boolean) => void
  updateMessage: (message: MessageRow) => void
}

const initialState = {
  activeConversationId: null,
  currentUser: null,
  messages: [],
  presenceByUserId: {},
  selectedUser: null,
  typingByUserId: {},
}

export const useChatStore = create<ChatState>((set) => ({
  ...initialState,
  setCurrentUser: (currentUser) => set({ currentUser }),
  setSelectedChat: (selectedUser, activeConversationId) =>
    set({
      selectedUser,
      activeConversationId,
      messages: [],
      typingByUserId: {},
    }),
  setMessages: (messages) =>
    set({
      messages: [...messages].sort(
        (left, right) =>
          new Date(left.created_at).getTime() - new Date(right.created_at).getTime()
      ),
    }),
  addMessage: (message) =>
    set((state) => {
      const exists = state.messages.some((item) => item.id === message.id)

      if (exists) {
        return state
      }

      return {
        messages: [...state.messages, message].sort(
          (left, right) =>
            new Date(left.created_at).getTime() - new Date(right.created_at).getTime()
        ),
      }
    }),
  updateMessage: (message) =>
    set((state) => ({
      messages: state.messages.map((item) => (item.id === message.id ? message : item)),
    })),
  clearMessages: () => set({ messages: [] }),
  setPresenceMap: (presenceByUserId) => set({ presenceByUserId }),
  setTypingState: (userId, isTyping) =>
    set((state) => ({
      typingByUserId: isTyping
        ? { ...state.typingByUserId, [userId]: true }
        : Object.fromEntries(
            Object.entries(state.typingByUserId).filter(([key]) => key !== userId)
          ),
    })),
  reset: () => set(initialState),
}))
