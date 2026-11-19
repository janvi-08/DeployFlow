import React from 'react';

export interface BadgeProps {
  children: React.ReactNode;
  variant?: 'primary' | 'success' | 'warning' | 'danger' | 'neutral' | 'purple';
  size?: 'sm' | 'md';
  dot?: boolean;
}

export const Badge: React.FC<BadgeProps> = ({
  children,
  variant = 'neutral',
  size = 'md',
  dot = false,
}) => {
  const variantClasses = {
    primary: 'bg-emerald-50 text-emerald-800 border-emerald-200 shadow-sm shadow-emerald-500/5',
    success: 'bg-emerald-50 text-emerald-700 border-emerald-200 shadow-sm shadow-emerald-500/5',
    warning: 'bg-amber-50 text-amber-800 border-amber-200 shadow-sm shadow-amber-500/5',
    danger: 'bg-rose-50 text-rose-800 border-rose-200 shadow-sm shadow-rose-500/5',
    neutral: 'bg-slate-100 text-slate-700 border-slate-200',
    purple: 'bg-violet-50 text-violet-800 border-violet-200 shadow-sm shadow-violet-500/5',
  };

  const dotClasses = {
    primary: 'bg-emerald-600',
    success: 'bg-emerald-600',
    warning: 'bg-amber-500',
    danger: 'bg-rose-500',
    neutral: 'bg-slate-400',
    purple: 'bg-violet-600',
  };

  const sizeClasses = {
    sm: 'text-[10px] font-mono px-2 py-0.5 space-x-1',
    md: 'text-xs font-medium px-2.5 py-1 space-x-1.5',
  };

  return (
    <span
      className={`inline-flex items-center rounded-md border font-medium transition-all ${variantClasses[variant]} ${sizeClasses[size]}`}
    >
      {dot && <span className={`w-1.5 h-1.5 rounded-full ${dotClasses[variant]} animate-pulse`} />}
      <span>{children}</span>
    </span>
  );
};
