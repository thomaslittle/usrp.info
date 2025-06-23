'use client';

import React, { useState, useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import Link from 'next/link';
import { Icon } from '@iconify/react';
import { Button } from '@/components/ui/button';
import { Preloader } from '@/components/ui/preloader';
import { getCurrentUser, logout, getDiscordUserInfo, getDiscordServerUsername } from '@/lib/auth';
import { User, UserRole } from '@/types';
import { Models } from 'appwrite';
import { UserAvatar } from '@/components/user-avatar';
import { cn } from '@/lib/utils';

// Your Discord server ID for getting server-specific usernames
const DISCORD_SERVER_ID = process.env.NEXT_PUBLIC_DISCORD_SERVER_ID || '';

const dashboardNavigation = [
    {
        name: 'Overview',
        href: '/dashboard',
        icon: 'heroicons:home-16-solid',
        roles: ['viewer', 'editor', 'admin', 'super_admin']
    },
    {
        name: 'Content Management',
        href: '/dashboard/content',
        icon: 'heroicons:document-text-16-solid',
        roles: ['editor', 'admin', 'super_admin']
    },
    {
        name: 'User Management',
        href: '/dashboard/users',
        icon: 'heroicons:users-16-solid',
        roles: ['admin', 'super_admin']
    },
    {
        name: 'Departments',
        href: '/dashboard/departments',
        icon: 'heroicons:building-office-16-solid',
        roles: ['super_admin']
    },
    {
        name: 'Activity Logs',
        href: '/dashboard/logs',
        icon: 'heroicons:clipboard-document-list-16-solid',
        roles: ['admin', 'super_admin']
    }
];

export default function DashboardLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    const [authUser, setAuthUser] = useState<Models.User<Models.Preferences> | null>(null);
    const [user, setUser] = useState<User | null>(null);
    const [loading, setLoading] = useState(true);
    const [sidebarOpen, setSidebarOpen] = useState(false);
    const router = useRouter();
    const pathname = usePathname();

    useEffect(() => {
        const initAuth = async () => {
            try {
                const currentUser = await getCurrentUser();
                if (!currentUser) {
                    router.push('/auth/login');
                    return;
                }

                setAuthUser(currentUser);

                // Use API route to get user profile instead of direct database call
                try {
                    const response = await fetch(`/api/users/profile?email=${encodeURIComponent(currentUser.email)}`);
                    let userRecord = null;

                    if (response.ok) {
                        const data = await response.json();
                        userRecord = data.user;
                    }

                    // If no user record exists, create one (for Discord OAuth users)
                    if (!userRecord) {
                        console.log('No user record found, creating one for OAuth user...');

                        let username = currentUser.name || 'Unknown';
                        let gameCharacterName = '';

                        // If this is a Discord OAuth user, try to get server-specific info
                        if (DISCORD_SERVER_ID) {
                            try {
                                const discordUser = await getDiscordUserInfo();
                                if (discordUser) {
                                    // Try to get server nickname first
                                    const serverUsername = await getDiscordServerUsername(
                                        discordUser.id,
                                        DISCORD_SERVER_ID
                                    );

                                    if (serverUsername) {
                                        // Use server nickname for both username and character name
                                        gameCharacterName = serverUsername;
                                        username = serverUsername;
                                    } else {
                                        // Fall back to Discord display name or username
                                        username = discordUser.global_name || discordUser.username || username;
                                        gameCharacterName = discordUser.global_name || discordUser.username || '';
                                    }

                                    console.log(`Discord user setup: username="${username}", character="${gameCharacterName}"`);
                                }
                            } catch (error) {
                                console.warn('Could not fetch Discord server info (using basic Discord info):', error);
                            }
                        }

                        // Create user record via API route
                        const createResponse = await fetch('/api/users/create', {
                            method: 'POST',
                            headers: {
                                'Content-Type': 'application/json',
                            },
                            body: JSON.stringify({
                                userId: currentUser.$id,
                                email: currentUser.email,
                                username: username,
                                department: 'ems', // Default department - can be changed later
                                role: 'viewer', // Default role for new users
                                gameCharacterName: gameCharacterName,
                                rank: '',
                                createdAt: new Date().toISOString(),
                            }),
                        });

                        if (createResponse.ok) {
                            const createData = await createResponse.json();
                            userRecord = createData.user;
                            console.log('Created user record:', userRecord);
                        } else {
                            throw new Error('Failed to create user record');
                        }
                    }

                    if (userRecord) {
                        setUser({
                            $id: userRecord.$id,
                            userId: userRecord.userId,
                            email: userRecord.email,
                            username: userRecord.username,
                            department: userRecord.department,
                            role: userRecord.role,
                            gameCharacterName: userRecord.gameCharacterName || '',
                            rank: userRecord.rank || '',
                            lastLogin: new Date().toISOString(),
                            createdAt: userRecord.createdAt,
                            $createdAt: userRecord.$createdAt,
                            $updatedAt: userRecord.$updatedAt
                        });
                    } else {
                        console.error('Failed to create or retrieve user record');
                        router.push('/auth/login');
                        return;
                    }
                } catch (dbError) {
                    console.error('Database operation failed:', dbError);
                    router.push('/auth/login');
                    return;
                }
            } catch (error) {
                console.error('Authentication error:', error);
                router.push('/auth/login');
            } finally {
                setLoading(false);
            }
        };

        initAuth();
    }, [router]);

    const handleLogout = async () => {
        await logout();
        router.push('/auth/login');
    };

    const hasAccess = (requiredRoles: UserRole[]) => {
        return user && requiredRoles.includes(user.role);
    };

    const filteredNavigation = dashboardNavigation.filter(item =>
        hasAccess(item.roles as UserRole[])
    );

    if (loading) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900/20 to-slate-900 flex items-center justify-center">
                <div className="backdrop-blur-sm bg-white/5 p-12 rounded-3xl border border-white/10">
                    <Preloader text="Loading dashboard..." size="lg" />
                    <p className="text-slate-300 mt-4 font-medium text-center">Initializing your workspace...</p>
                </div>
            </div>
        );
    }

    if (!user) {
        return null; // Will redirect in useEffect
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900/20 to-slate-900 flex">
            {/* Mobile sidebar */}
            <div className={cn("fixed inset-0 z-50 lg:hidden", sidebarOpen ? 'block' : 'hidden')}>
                <div className="fixed inset-0 bg-black/50 backdrop-blur-sm" onClick={() => setSidebarOpen(false)} />
                <div className="fixed inset-y-0 left-0 w-72 bg-slate-900/90 backdrop-blur-xl border-r border-white/10 overflow-y-auto">
                    <div className="flex h-20 items-center justify-between px-6">
                        <div className="flex items-center space-x-3">
                            <img src="/images/wordmark.webp" alt="Unscripted RP" className="h-10 object-contain" />
                        </div>
                        <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => setSidebarOpen(false)}
                            className="text-slate-400 hover:text-white rounded-2xl"
                        >
                            <Icon icon="heroicons:x-mark-16-solid" className="h-5 w-5" />
                        </Button>
                    </div>
                    <nav className="px-4 pb-4">
                        <div className="space-y-2">
                            {filteredNavigation.map((item) => (
                                <Link
                                    key={item.name}
                                    href={item.href}
                                    className={cn(
                                        "group flex items-center px-4 py-3 text-sm font-medium transition-all duration-300 rounded-2xl",
                                        pathname === item.href
                                            ? "bg-gradient-to-r from-purple-500 to-violet-600 text-white shadow-lg shadow-purple-500/25"
                                            : "text-slate-300 hover:text-white hover:bg-white/10 backdrop-blur-sm"
                                    )}
                                    onClick={() => setSidebarOpen(false)}
                                >
                                    <Icon icon={item.icon} className="mr-3 h-5 w-5" />
                                    {item.name}
                                </Link>
                            ))}
                        </div>
                    </nav>
                </div>
            </div>

            {/* Desktop sidebar */}
            <div className="hidden lg:flex lg:w-72 lg:flex-col lg:fixed lg:inset-y-0">
                <div className="flex flex-col bg-slate-900/90 backdrop-blur-xl border-r border-white/10 h-full overflow-y-auto">

                    <nav className="flex-1 px-4 py-6">
                        <div className="space-y-2">
                            {filteredNavigation.map((item) => (
                                <Link
                                    key={item.name}
                                    href={item.href}
                                    className={cn(
                                        "group flex items-center px-4 py-3 text-sm font-medium transition-all duration-300 rounded-2xl",
                                        pathname === item.href
                                            ? "bg-gradient-to-r from-purple-500 to-violet-600 text-white shadow-lg shadow-purple-500/25"
                                            : "text-slate-300 hover:text-white hover:bg-white/10 backdrop-blur-sm"
                                    )}
                                >
                                    <Icon icon={item.icon} className="mr-3 h-5 w-5" />
                                    {item.name}
                                </Link>
                            ))}
                        </div>
                    </nav>

                    {/* User info at bottom */}
                    <div className="p-4 border-t border-white/10">
                        <div className="flex items-center gap-3 px-4 py-3 rounded-2xl bg-white/5 backdrop-blur-sm">
                            <UserAvatar user={user} className="w-8 h-8" />
                            <div className="flex-1 min-w-0">
                                <p className="text-sm font-medium text-white truncate">{user.username}</p>
                                <p className="text-xs text-slate-400 truncate capitalize">{user.role.replace('_', ' ')}</p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Main content */}
            <div className="flex-1 flex flex-col lg:pl-72">
                {/* Top navigation */}
                <div className="sticky top-0 z-40 bg-slate-900/80 backdrop-blur-xl border-b border-white/10">
                    <div className="flex h-20 items-center justify-between px-6">
                        <div className="flex items-center gap-4">
                            <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => setSidebarOpen(true)}
                                className="text-slate-400 hover:text-white lg:hidden rounded-2xl"
                            >
                                <Icon icon="heroicons:bars-3-16-solid" className="h-5 w-5" />
                            </Button>
                            <div className="hidden md:flex items-center gap-3">
                                <div className="flex items-center gap-2 px-3 py-2 rounded-xl bg-white/5 backdrop-blur-sm border border-white/10">
                                    <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                                    <span className="text-green-300 font-medium text-sm">ONLINE</span>
                                </div>
                                <div className="flex items-center gap-2 px-3 py-2 rounded-xl bg-white/5 backdrop-blur-sm border border-white/10">
                                    <Icon icon="heroicons:shield-check-16-solid" className="h-3 w-3 text-purple-400" />
                                    <span className="text-purple-300 font-medium text-sm capitalize">{user.role.replace('_', ' ')}</span>
                                </div>
                            </div>
                        </div>
                        <div className="flex items-center gap-4">
                            <Link href="/dashboard/profile">
                                <Button variant="ghost" size="sm" className="text-slate-400 hover:text-white rounded-2xl">
                                    <Icon icon="heroicons:cog-6-tooth-16-solid" className="h-5 w-5" />
                                </Button>
                            </Link>
                            <Button
                                variant="ghost"
                                size="sm"
                                onClick={handleLogout}
                                className="text-slate-400 hover:text-red-400 rounded-2xl"
                            >
                                <Icon icon="heroicons:arrow-right-start-on-rectangle-16-solid" className="h-5 w-5" />
                            </Button>
                        </div>
                    </div>
                </div>

                {/* Page content */}
                <main className="flex-1">
                    {children}
                </main>
            </div>
        </div>
    );
} 