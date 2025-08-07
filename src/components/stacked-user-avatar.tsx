import React from 'react';
import { User } from '@/types';

interface StackedUserAvatarProps {
    user: User;
    className?: string;
}

export function StackedUserAvatar({ user, className = '' }: StackedUserAvatarProps) {
    // For linked users: main avatar shows database user (character), small overlay shows auth user
    // For non-linked users: show the user's own initials



    let mainInitials: string;
    let linkedInitials: string | null = null;

    if (user.linkedUser) {
        // Main avatar: Database user's initials (the character being displayed)
        mainInitials = (user.gameCharacterName || user.username || 'U').split(' ').map((n) => n[0]).join('').toUpperCase().slice(0, 2);

        // Small overlay: Auth user's initials (the real user behind the character)
        linkedInitials = (user.linkedUser.username || user.linkedUser.gameCharacterName || 'A').split(' ').map((n) => n[0]).join('').toUpperCase().slice(0, 2);
    } else {
        // Single user: use their own initials
        mainInitials = user.email?.includes('@ems.usrp.info')
            ? (user.gameCharacterName || user.username || 'U').split(' ').map((n) => n[0]).join('').toUpperCase().slice(0, 2)
            : (user.username || user.gameCharacterName || 'U').split(' ').map((n) => n[0]).join('').toUpperCase().slice(0, 2);
    }

    if (!user.linkedUser) {
        // Single avatar for non-linked users
        return (
            <div className={`rounded-full bg-gradient-to-br from-purple-500 to-violet-600 flex items-center justify-center overflow-hidden ${className}`}>
                <span className="text-white font-bold text-lg">{mainInitials}</span>
            </div>
        );
    }

    // Stacked avatars for linked users
    return (
        <div className={`relative ${className}`}>
            {/* Main user avatar (background) */}
            <div className="absolute inset-0 rounded-full bg-gradient-to-br from-purple-500 to-violet-600 flex items-center justify-center overflow-hidden">
                <span className="text-white font-bold text-lg">{mainInitials}</span>
            </div>

            {/* Linked user avatar (foreground, smaller, positioned at top-right) */}
            <div
                className="absolute -top-1 -right-1 rounded-full bg-gradient-to-br from-green-500 to-emerald-600 flex items-center justify-center overflow-hidden border-2 border-gray-800"
                style={{ width: 20, height: 20 }}
            >
                <span className="text-white font-bold text-xs">{linkedInitials}</span>
            </div>
        </div>
    );
} 