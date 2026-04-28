/* eslint-disable @next/next/no-img-element */
"use client";

import { useState } from "react";
import { getInitials, type ChatUser } from "@/lib/chat/models";

interface UserAvatarProps {
  size?: "lg" | "md" | "sm" | "xs";
  user: Pick<ChatUser, "avatarUrl" | "email" | "fullName">;
  showStatus?: boolean;
  isOnline?: boolean;
}

const sizeClasses = {
  xs: "h-8 w-8 text-xs",
  sm: "h-10 w-10 text-xs",
  md: "h-11 w-11 text-sm",
  lg: "h-14 w-14 text-base",
};

const ringClasses = {
  xs: "h-2.5 w-2.5 -bottom-0.5 -right-0.5",
  sm: "h-3 w-3 -bottom-0.5 -right-0.5",
  md: "h-3.5 w-3.5 -bottom-0.5 -right-0.5",
  lg: "h-4 w-4 -bottom-0.5 -right-0.5",
};

export default function UserAvatar({ 
  size = "md", 
  user, 
  showStatus = false, 
  isOnline = false 
}: UserAvatarProps) {
  const [imgError, setImgError] = useState(false);

  if (user.avatarUrl && !imgError) {
    return (
      <div className="relative inline-block">
        <img
          alt={user.fullName || user.email || "User avatar"}
          className={`${sizeClasses[size]} rounded-[22px] border border-white/10 object-cover shadow-[0_10px_30px_rgba(15,23,42,0.35)] transition-transform duration-200 hover:scale-105`}
          src={user.avatarUrl}
          onError={() => setImgError(true)}
        />
        {showStatus && (
          <span
            className={`absolute ${ringClasses[size]} rounded-full border-2 border-[#111827] ${
              isOnline
                ? "bg-emerald-400 shadow-[0_0_18px_rgba(74,222,128,0.85)]"
                : "bg-slate-500"
            }`}
          />
        )}
      </div>
    );
  }

  return (
    <div className="relative inline-block">
      <div
        className={`${sizeClasses[size]} flex items-center justify-center rounded-[22px] border border-white/12 bg-gradient-to-br from-violet-500 to-blue-500 font-semibold text-white shadow-[0_14px_34px_rgba(76,29,149,0.38)] transition-transform duration-200 hover:scale-105`}
      >
        {getInitials(user)}
      </div>
      {showStatus && (
        <span
          className={`absolute ${ringClasses[size]} rounded-full border-2 border-[#111827] ${
            isOnline
              ? "bg-emerald-400 shadow-[0_0_18px_rgba(74,222,128,0.85)]"
              : "bg-slate-500"
          }`}
        />
      )}
    </div>
  );
}