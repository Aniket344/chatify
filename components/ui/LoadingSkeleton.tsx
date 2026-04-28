"use client";

interface LoadingSkeletonProps {
  variant?: "message" | "user" | "full";
}

export default function LoadingSkeleton({ variant = "full" }: LoadingSkeletonProps) {
  if (variant === "message") {
    return (
      <div className="flex items-start gap-3">
        <div className="skeleton h-10 w-10 rounded-[22px]" />
        <div className="flex-1 space-y-2">
          <div className="skeleton h-4 w-24 rounded-full" />
          <div className="skeleton h-16 w-64 rounded-[24px]" />
        </div>
      </div>
    );
  }

  if (variant === "user") {
    return (
      <div className="flex items-center gap-3 rounded-[26px] px-4 py-4">
        <div className="skeleton h-11 w-11 rounded-[22px]" />
        <div className="flex-1 space-y-2">
          <div className="skeleton h-4 w-32 rounded-full" />
          <div className="skeleton h-3 w-20 rounded-full" />
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-full w-full items-center justify-center">
      <div className="glass-panel rounded-[30px] px-8 py-6">
        <div className="skeleton mx-auto h-8 w-8 rounded-full" />
        <div className="skeleton mt-4 h-4 w-48 rounded-full" />
      </div>
    </div>
  );
}