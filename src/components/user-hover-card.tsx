import React from 'react';
import { User } from '@/types';
import {
    HoverCard,
    HoverCardContent,
    HoverCardTrigger,
} from '@/components/ui/hover-card';



interface UserHoverCardProps {
    user: User;
    children: React.ReactNode;
}

export function UserHoverCard({ user, children }: UserHoverCardProps) {
    // If user has linkedUserId, show that they're linked to someone
    const hasLinkedUser = user.linkedUserId && user.linkedUserId !== '';

    return (
        <HoverCard openDelay={50} closeDelay={100}>
            <HoverCardTrigger asChild>
                {children}
            </HoverCardTrigger>
            <HoverCardContent className="w-80 bg-gray-800 border-gray-700" side="top">
                <div className="space-y-2">
                    <div>
                        <h4 className="text-sm font-semibold text-white">
                            {user.gameCharacterName || user.username}
                        </h4>
                        <p className="text-xs text-gray-400">
                            @{user.username}
                        </p>
                    </div>

                    <div className="text-xs text-gray-300 space-y-1">
                        <div>
                            <span className="text-gray-400">Email:</span> {user.email?.substring(0, 2)}***@{user.email?.split('@')[1] || 'unknown'}
                        </div>
                        {user.rank && (
                            <div>
                                <span className="text-gray-400">Rank:</span> {user.rank}
                            </div>
                        )}
                        {user.callsign && (
                            <div>
                                <span className="text-gray-400">Callsign:</span> {user.callsign}
                            </div>
                        )}
                        {hasLinkedUser && (
                            <div className="text-green-400 text-xs mt-2">
                                🔗 Linked to auth user
                            </div>
                        )}
                    </div>
                </div>
            </HoverCardContent>
        </HoverCard>
    );
} 