
import React from 'react';

interface SkeletonProps {
  className?: string;
}

export const Skeleton: React.FC<SkeletonProps> = ({ className = "" }) => {
  return (
    <div className={`animate-pulse rounded-md bg-slate-800/50 ${className}`} />
  );
};

export const CardSkeleton: React.FC = () => (
    <div className="p-4 rounded-xl border border-slate-800 bg-slate-900/50 space-y-3">
        <div className="flex justify-between items-center">
            <Skeleton className="h-6 w-1/3" />
            <Skeleton className="h-4 w-1/6" />
        </div>
        <div className="space-y-2">
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-2/3" />
        </div>
    </div>
);
