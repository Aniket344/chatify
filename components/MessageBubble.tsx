"use client";

import { motion } from "framer-motion";
import { formatMessageTime, getMessageStatus } from "@/lib/chat/format";
import type { ChatUser, MessageRow } from "@/lib/chat/models";
import UserAvatar from "./UserAvatar";

interface MessageBubbleProps {
  isGroupStart: boolean;
  isOwn: boolean;
  message: MessageRow;
  showStatus: boolean;
  user: Pick<ChatUser, "avatarUrl" | "email" | "fullName">;
}

export default function MessageBubble({
  isGroupStart,
  isOwn,
  message,
  showStatus,
  user,
}: MessageBubbleProps) {
  const status = getMessageStatus(message, isOwn);

  const statusIcons = {
    Sending: (
      <svg className="h-3 w-3 animate-spin" fill="none" viewBox="0 0 24 24">
        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
      </svg>
    ),
    Sent: (
      <svg className="h-3 w-3" fill="currentColor" viewBox="0 0 20 20">
        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
      </svg>
    ),
    Delivered: (
      <svg className="h-3 w-3" fill="currentColor" viewBox="0 0 20 20">
        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
      </svg>
    ),
    Read: (
      <div className="relative">
        <svg className="h-3 w-3 text-blue-400" fill="currentColor" viewBox="0 0 20 20">
          <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
        </svg>
        <svg className="absolute -right-1.5 h-3 w-3 text-blue-400" fill="currentColor" viewBox="0 0 20 20">
          <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
        </svg>
      </div>
    ),
  };

  return (
    <motion.div
      initial={{ opacity: 0, x: isOwn ? 30 : -30, scale: 0.9 }}
      animate={{ opacity: 1, x: 0, scale: 1 }}
      transition={{ type: "spring", stiffness: 500, damping: 30 }}
     className={`flex items-end ${isOwn ? "justify-end" : "justify-start"}`}
    >
      
      

      <div className={`max-w-[85%] sm:max-w-[70%] ${isOwn ? "items-end" : "items-start"} flex flex-col`}>
        <motion.div
          whileHover={{ scale: 1.02 }}
          transition={{ type: "spring", stiffness: 400 }}
          className={`relative overflow-hidden rounded-[28px] px-5 py-3 text-sm leading-6 shadow-2xl ${
            isOwn
              ? "bg-gradient-to-br from-violet-600 via-purple-600 to-blue-600 text-white"
              : "bg-gradient-to-br from-slate-800/90 to-slate-900/90 text-slate-100 border border-white/10"
          }`}
        >
          {/* Shimmer effect on hover */}
          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000" />
          
          <p className="whitespace-pre-wrap break-words">{message.content}</p>
        </motion.div>

        <div className="mt-1.5 flex items-center gap-2 px-2 text-[10px] text-slate-400 sm:text-[11px]">
          <span>{formatMessageTime(message.created_at)}</span>
          {showStatus && status && (
            <motion.span
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              className="flex items-center gap-1"
            >
              {statusIcons[status as keyof typeof statusIcons] || status}
            </motion.span>
          )}
        </div>
      </div>

      
    </motion.div>
  );
}