'use client';

import React from 'react';
import { Button } from './ui/button';
import { Icon } from '@iconify/react';
import { loginWithDiscord } from '@/lib/auth';

interface DiscordLoginButtonProps {
    className?: string;
    children?: React.ReactNode;
}

export function DiscordLoginButton({ className, children }: DiscordLoginButtonProps) {
    const handleDiscordLogin = async () => {
        const result = await loginWithDiscord();
        if (!result.success) {
            console.error('Discord login failed:', result.error);
            // You might want to show a toast or error message here
        }
    };

    return (
        <Button
            variant="secondary"
            onClick={handleDiscordLogin}
            className={`w-full bg-[#5865F2] hover:bg-[#4752C4] text-white ${className || ''}`}
        >
            <Icon icon="ic:baseline-discord" className="w-5 h-5" />
            {children || 'Continue with Discord'}
        </Button>
    );
} 