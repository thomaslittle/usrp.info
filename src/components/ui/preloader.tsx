import React from 'react';
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const preloaderVariants = cva(
    "inline-block p-0 text-left relative",
    {
        variants: {
            size: {
                sm: "w-8 h-8",
                md: "w-12 h-12",
                lg: "w-16 h-16"
            }
        },
        defaultVariants: {
            size: "md"
        }
    }
);

interface PreloaderProps extends VariantProps<typeof preloaderVariants> {
    text?: string;
    fullScreen?: boolean;
    className?: string;
}

export function Preloader({
    text = 'Loading...',
    size = 'md',
    fullScreen = false,
    className = ''
}: PreloaderProps) {
    const containerClasses = fullScreen
        ? 'fixed top-0 left-0 right-0 bottom-0 z-[999999] h-screen w-screen flex items-center justify-center pointer-events-none overflow-hidden bg-transparent transition-opacity duration-500'
        : 'flex items-center justify-center';

    return (
        <div className={cn(containerClasses, className)}>
            <div className="text-center">
                <div className={cn(preloaderVariants({ size }))}>
                    <span className="absolute inline-block w-full h-full rounded-full bg-purple-600 animate-[loader3_1.5s_linear_infinite]" />
                    <span className="absolute inline-block w-full h-full rounded-full bg-purple-600 animate-[loader3_1.5s_linear_infinite] [animation-delay:-0.9s]" />
                </div>
                {text && (
                    <p className="text-slate-300 mt-4 text-sm font-medium">{text}</p>
                )}
            </div>
        </div>
    );
} 