"use client";

import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";

interface InputBoxProps {
  disabled?: boolean;
  isSending?: boolean;
  onSendMessage: (content: string) => Promise<void>;
  onTypingChange: (isTyping: boolean) => void;
}

export default function InputBox({
  disabled = false,
  isSending = false,
  onSendMessage,
  onTypingChange,
}: InputBoxProps) {
  const [message, setMessage] = useState("");
  const [isFocused, setIsFocused] = useState(false);
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const adjustHeight = () => {
    const textarea = textareaRef.current;
    if (textarea) {
      textarea.style.height = "auto";
      textarea.style.height = `${Math.min(textarea.scrollHeight, 120)}px`;
    }
  };

  useEffect(() => {
    adjustHeight();
  }, [message]);

  const sendMessage = async () => {
    const trimmedMessage = message.trim();
    if (!trimmedMessage || disabled || isSending) return;

    await onSendMessage(trimmedMessage);
    setMessage("");
    onTypingChange(false);
    
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto";
    }
  };

  const handleKeyDown = async (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      await sendMessage();
    }
  };

  return (
    <div className="border-t border-white/10 bg-gradient-to-t from-black/20 to-transparent px-6 py-5">
      <div className={`relative rounded-2xl transition-all duration-300 ${
        isFocused ? "shadow-[0_0_0_2px_rgba(139,92,246,0.3)]" : ""
      }`}>
        <div className="flex items-end gap-3 rounded-2xl border border-white/10 bg-white/5 p-2 backdrop-blur">
          {/* Emoji button */}
          <motion.button
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            onClick={() => setShowEmojiPicker(!showEmojiPicker)}
            className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl text-slate-400 transition hover:bg-white/10 hover:text-white"
            type="button"
          >
            😊
          </motion.button>

          {/* Text input */}
          <textarea
            ref={textareaRef}
            onFocus={() => setIsFocused(true)}
            onBlur={() => setIsFocused(false)}
            className="max-h-32 min-h-[40px] flex-1 resize-none bg-transparent py-2 text-sm leading-6 text-white outline-none placeholder:text-slate-500 disabled:cursor-not-allowed"
            disabled={disabled}
            onChange={(e) => {
              const value = e.target.value;
              setMessage(value);
              onTypingChange(value.trim().length > 0);
            }}
            onKeyDown={handleKeyDown}
            placeholder="Type your message..."
            rows={1}
            value={message}
          />

          {/* Attachment button */}
          <motion.button
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl text-slate-400 transition hover:bg-white/10 hover:text-white"
            type="button"
          >
            <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.586a4 4 0 00-5.656-5.656l-6.415 6.585a6 6 0 108.486 8.486L20.5 13" />
            </svg>
          </motion.button>

          {/* Send button */}
          <motion.button
            whileHover={{ scale: message.trim() ? 1.05 : 1 }}
            whileTap={{ scale: message.trim() ? 0.95 : 1 }}
            onClick={() => void sendMessage()}
            disabled={disabled || isSending || !message.trim()}
            className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl transition-all ${
              message.trim() && !isSending
                ? "bg-gradient-to-r from-violet-600 to-blue-500 text-white shadow-lg"
                : "bg-white/5 text-slate-500"
            }`}
            type="button"
          >
            {isSending ? (
              <svg className="h-4 w-4 animate-spin" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
              </svg>
            ) : (
              <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
              </svg>
            )}
          </motion.button>
        </div>

        {/* Emoji picker (simplified) */}
        <AnimatePresence>
          {showEmojiPicker && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="absolute bottom-full left-0 mb-2 rounded-xl border border-white/10 bg-[#0a0a0f] p-2 backdrop-blur"
            >
              <div className="grid grid-cols-8 gap-1">
                {["😊", "😂", "❤️", "👍", "🎉", "🔥", "✨", "💯", "😢", "😡", "🙏", "🤔"].map((emoji) => (
                  <button
                    key={emoji}
                    onClick={() => {
                      setMessage(message + emoji);
                      setShowEmojiPicker(false);
                      textareaRef.current?.focus();
                    }}
                    className="rounded-lg p-2 text-lg transition hover:bg-white/10"
                  >
                    {emoji}
                  </button>
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}