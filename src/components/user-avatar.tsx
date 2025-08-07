import React from 'react';
import { User } from '@/types';

interface UserAvatarProps {
    user: User;
    className?: string;
}

export function UserAvatar({ user, className = '' }: UserAvatarProps) {
    // For now, we'll use initials for all users since we don't have individual Discord avatar data
    // In the future, this could be enhanced to fetch individual user avatars from their linked Discord accounts
    const initials = user.username
        ? user.username.split(' ').map((n) => n[0]).join('').toUpperCase().slice(0, 2)
        : user.gameCharacterName
            ? user.gameCharacterName.split(' ').map((n) => n[0]).join('').toUpperCase().slice(0, 2)
            : 'U';

    return (
        <div 
            className={`rounded-full bg-gradient-to-br from-purple-500 to-violet-600 flex items-center justify-center overflow-hidden ${className}`} 
            style={{ width: 40, height: 40 }}
            role="img"
            aria-label={`Avatar for ${user.username || user.gameCharacterName || 'User'}`}
        >
            <span className="text-white font-bold text-lg" aria-hidden="true">{initials}</span>
        </div>
    );
} 