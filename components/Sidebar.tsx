"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { getDisplayName, type ChatUser } from "@/lib/chat/models";
import UserAvatar from "./UserAvatar";

interface SidebarProps {
  currentUser: ChatUser;
  isLoading?: boolean;
  onLogout: () => Promise<void>;
  onSelectUser: (user: ChatUser) => Promise<void>;
  presenceByUserId: Record<string, boolean>;
  selectedUserId?: string | null;
  users: ChatUser[];
}

export default function Sidebar({
  currentUser,
  isLoading = false,
  onLogout,
  onSelectUser,
  presenceByUserId,
  selectedUserId,
  users,
}: SidebarProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [isMobileOpen, setIsMobileOpen] = useState(false);

  const filteredUsers = users.filter(user =>
    user.fullName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    user.email?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const onlineCount = users.filter(u => presenceByUserId[u.id]).length;

  return (
    <>
      {/* Mobile menu button */}
      <button
        onClick={() => setIsMobileOpen(!isMobileOpen)}
        className="fixed bottom-4 right-4 z-50 rounded-full bg-gradient-to-r from-violet-600 to-blue-500 p-4 shadow-2xl lg:hidden"
      >
        <svg className="h-6 w-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
        </svg>
      </button>

      {/* Sidebar overlay for mobile */}
      <AnimatePresence>
        {isMobileOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setIsMobileOpen(false)}
            className="fixed inset-0 z-40 bg-black/80 backdrop-blur-sm lg:hidden"
          />
        )}
      </AnimatePresence>

      {/* Sidebar */}
      <motion.aside
        initial={{ x: -300, opacity: 0 }}
        animate={{ 
          x: isMobileOpen ? 0 : 0,
          opacity: 1 
        }}
        transition={{ duration: 0.3, type: "spring", stiffness: 300 }}
        className={`fixed inset-y-0 left-0 z-50 flex w-[85vw] max-w-sm flex-col bg-[#0a0a0f] shadow-2xl transition-transform duration-300 lg:relative lg:translate-x-0 ${
          isMobileOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"
        }`}
      >
        <div className="relative flex h-full flex-col p-4">
          {/* Premium gradient background */}
          <div className="absolute inset-0 bg-gradient-to-b from-violet-600/5 to-transparent pointer-events-none" />
          
          {/* User Profile Section */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="neo-panel relative mb-6 overflow-hidden p-5"
          >
            <div className="absolute -right-10 -top-10 h-32 w-32 rounded-full bg-violet-600/20 blur-3xl" />
            
            <div className="relative flex items-center gap-4">
              <motion.div
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <UserAvatar size="lg" user={currentUser} />
              </motion.div>
              
              <div className="flex-1">
                <h3 className="text-lg font-bold text-white">
                  {getDisplayName(currentUser)}
                </h3>
                <p className="text-sm text-slate-400">{currentUser.email}</p>
                
                <div className="mt-2 flex items-center gap-2">
                  <div className="relative">
                    <div className="h-2 w-2 rounded-full bg-emerald-400">
                      <div className="absolute inset-0 rounded-full bg-emerald-400 animate-ping opacity-75" />
                    </div>
                  </div>
                  <span className="text-xs text-slate-400">Online</span>
                </div>
              </div>
              
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => void onLogout()}
                className="rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-xs font-medium text-slate-300 transition hover:bg-white/10"
              >
                <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                </svg>
              </motion.button>
            </div>
          </motion.div>

          {/* Search Bar */}
          <div className="mb-6">
            <div className="relative">
              <svg className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
              <input
                type="text"
                placeholder="Search conversations..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full rounded-2xl border border-white/10 bg-white/5 py-3 pl-10 pr-4 text-sm text-white placeholder:text-slate-500 focus:border-violet-500 focus:outline-none focus:ring-1 focus:ring-violet-500"
              />
            </div>
          </div>

          {/* Status Bar */}
          <div className="mb-4 flex items-center justify-between px-2">
            <h2 className="text-sm font-semibold uppercase tracking-wider text-slate-400">
              Direct Messages
            </h2>
            <div className="flex items-center gap-2">
              <div className="h-1.5 w-1.5 rounded-full bg-emerald-400" />
              <span className="text-xs text-slate-500">{onlineCount} online</span>
            </div>
          </div>

          {/* Users List */}
          <div className="chat-scroll flex-1 overflow-y-auto">
            <AnimatePresence mode="wait">
              {isLoading ? (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="space-y-3"
                >
                  {[1, 2, 3, 4].map((i) => (
                    <div key={i} className="flex items-center gap-3 rounded-2xl p-3">
                      <div className="h-12 w-12 animate-shimmer rounded-2xl bg-slate-800" />
                      <div className="flex-1 space-y-2">
                        <div className="h-4 w-32 animate-shimmer rounded-full bg-slate-800" />
                        <div className="h-3 w-20 animate-shimmer rounded-full bg-slate-800" />
                      </div>
                    </div>
                  ))}
                </motion.div>
              ) : filteredUsers.length === 0 ? (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="flex flex-col items-center justify-center py-12 text-center"
                >
                  <div className="mb-3 text-4xl">🔍</div>
                  <p className="text-sm text-slate-400">No users found</p>
                  <p className="text-xs text-slate-500">Try a different search term</p>
                </motion.div>
              ) : (
                <div className="space-y-2">
                  {filteredUsers.map((user, idx) => {
                    const isActive = selectedUserId === user.id;
                    const isOnline = Boolean(presenceByUserId[user.id]);

                    return (
                      <motion.button
                        key={user.id}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: idx * 0.05 }}
                        whileHover={{ scale: 1.02, x: 4 }}
                        whileTap={{ scale: 0.98 }}
                        onClick={() => {
                          void onSelectUser(user);
                          setIsMobileOpen(false);
                        }}
                        className={`group relative w-full rounded-2xl p-3 text-left transition-all ${
                          isActive
                            ? "bg-gradient-to-r from-violet-600/20 to-blue-600/20 border border-violet-500/30"
                            : "hover:bg-white/5 border border-transparent"
                        }`}
                      >
                        <div className="flex items-center gap-3">
                          <div className="relative">
                            <UserAvatar size="md" user={user} />
                            {isOnline && (
                              <span className="absolute -bottom-0.5 -right-0.5">
                                <span className="relative flex h-3.5 w-3.5">
                                  <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75" />
                                  <span className="relative inline-flex h-3.5 w-3.5 rounded-full bg-emerald-400" />
                                </span>
                              </span>
                            )}
                          </div>

                          <div className="min-w-0 flex-1">
                            <div className="flex items-center justify-between gap-2">
                              <p className="truncate text-sm font-semibold text-white">
                                {getDisplayName(user)}
                              </p>
                              {isOnline && (
                                <span className="text-[10px] font-medium text-emerald-400">● Online</span>
                              )}
                            </div>
                            <p className="mt-0.5 truncate text-xs text-slate-500">
                              {user.email}
                            </p>
                          </div>

                          {isActive && (
                            <motion.div
                              layoutId="activeIndicator"
                              className="h-8 w-1 rounded-full bg-gradient-to-b from-violet-400 to-blue-400"
                            />
                          )}
                        </div>

                        {/* Hover effect */}
                        <div className="absolute inset-0 rounded-2xl bg-gradient-to-r from-white/0 via-white/5 to-white/0 opacity-0 transition-opacity group-hover:opacity-100" />
                      </motion.button>
                    );
                  })}
                </div>
              )}
            </AnimatePresence>
          </div>

          {/* Footer Stats */}
          <div className="mt-4 border-t border-white/10 pt-4">
            <div className="flex items-center justify-between text-xs text-slate-500">
              <span>{users.length} contacts</span>
              <span className="flex items-center gap-1">
                <div className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse" />
                Real-time
              </span>
            </div>
          </div>
        </div>
      </motion.aside>
    </>
  );
}