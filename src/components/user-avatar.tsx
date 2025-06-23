import React, { useEffect, useState } from 'react';
// import { Icon } from '@iconify/react';
import { getDiscordUserInfo } from '@/lib/auth';
import { User } from '@/types';

interface UserAvatarProps {
    user: User;
    className?: string;
}

export function UserAvatar({ user, className = '' }: UserAvatarProps) {
    const [avatarUrl, setAvatarUrl] = useState<string | null>(null);

    useEffect(() => {
        let isMounted = true;
        async function fetchAvatar() {
            // Only try Discord avatar if user email is not a local email
            try {
                const discordUser = await getDiscordUserInfo();
                if (discordUser && discordUser.avatar) {
                    // Discord CDN URL for avatar
                    const url = `https://cdn.discordapp.com/avatars/${discordUser.id}/${discordUser.avatar}.png?size=128`;
                    if (isMounted) setAvatarUrl(url);
                } else {
                    if (isMounted) setAvatarUrl(null);
                }
            } catch {
                if (isMounted) setAvatarUrl(null);
            }
        }
        fetchAvatar();
        return () => { isMounted = false; };
    }, [user.email]);

    // Fallback: initials
    const initials = user.username
        ? user.username.split(' ').map((n) => n[0]).join('').toUpperCase().slice(0, 2)
        : 'U';

    return (
        <div className={`rounded-full bg-gradient-to-br from-purple-500 to-violet-600 flex items-center justify-center overflow-hidden ${className}`} style={{ width: 40, height: 40 }}>
            {avatarUrl ? (
                <img src={avatarUrl} alt={user.username} className="w-full h-full object-cover" />
            ) : (
                <span className="text-white font-bold text-lg">{initials}</span>
            )}
        </div>
    );
} 