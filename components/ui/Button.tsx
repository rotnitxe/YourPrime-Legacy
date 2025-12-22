
import React from 'react';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

function cn(...inputs: ClassValue[]) { return twMerge(clsx(inputs)); }

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> { 
    variant?: 'primary' | 'secondary' | 'danger' | 'ghost' | 'glass'; 
    size?: 'sm' | 'md' | 'lg' | 'icon';
    isLoading?: boolean; 
}

const Button: React.FC<ButtonProps> = ({ children, className, variant = 'primary', size = 'md', isLoading = false, ...props }) => { 
    const baseStyles = "inline-flex items-center justify-center rounded-xl font-bold transition-all active:scale-95 disabled:opacity-50 disabled:pointer-events-none";

    const variants = {
        primary: "bg-gradient-to-r from-violet-600 to-indigo-600 text-white shadow-lg shadow-indigo-500/30 hover:shadow-indigo-500/50 border border-transparent",
        secondary: "bg-slate-800 text-slate-200 hover:bg-slate-700 border border-slate-700",
        danger: "bg-red-500/10 text-red-500 hover:bg-red-500/20 border border-red-500/20",
        ghost: "hover:bg-slate-800/50 text-slate-400 hover:text-white",
        glass: "bg-white/10 backdrop-blur-md text-white border border-white/10 hover:bg-white/20"
    };
    const sizes = {
        sm: "h-8 px-3 text-xs",
        md: "h-12 px-6 text-sm",
        lg: "h-14 px-8 text-base",
        icon: "h-10 w-10 p-0"
    };
    return (
        <button className={cn(baseStyles, variants[variant], sizes[size], className)} {...props}>
            {isLoading ? (
                <svg className="animate-spin h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
            ) : (
                children
            )}
        </button>
    );
}; 

export default Button;
