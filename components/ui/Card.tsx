
import React from 'react';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

function cn(...inputs: ClassValue[]) { return twMerge(clsx(inputs)); }

interface CardProps extends React.HTMLAttributes<HTMLDivElement> { variant?: 'default' | 'glass' | 'outline' | 'flat'; noPadding?: boolean; }

const Card: React.FC<CardProps> = ({ children, className, variant = 'default', noPadding = false, ...props }) => { 
    const variants = { 
        default: "bg-slate-900/80 border border-slate-800 shadow-xl", 
        glass: "bg-white/5 backdrop-blur-md border border-white/10 shadow-lg", 
        outline: "bg-transparent border border-slate-700", 
        flat: "bg-slate-900" 
    };

    return (
        <div className={cn("rounded-2xl overflow-hidden", variants[variant], !noPadding && "p-5", className)} {...props}>
            {children}
        </div>
    );
}; 

export default Card;
