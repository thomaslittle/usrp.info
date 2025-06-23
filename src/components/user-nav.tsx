"use client";

import { useAuth } from '@/hooks/use-auth';
import { UserAvatar } from '@/components/user-avatar';
import { NotificationDropdown } from '@/components/notification-dropdown';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Icon } from '@iconify/react';
import { logout } from '@/lib/auth';
import { Popover, PopoverTrigger, PopoverContent } from '@/components/ui/popover';
import { GlobalSearch } from '@/components/global-search';
import React from 'react';

export function UserNav() {
    const { userProfile, isAuthenticated, isLoading } = useAuth();
    const [open, setOpen] = React.useState(false);
    const [isHovered, setIsHovered] = React.useState(false);

    const handleLogout = async () => {
        setOpen(false);
        await logout();
        // Use window.location.href to force a full page refresh after logout
        window.location.href = '/';
    };

    // Show loading state briefly
    if (isLoading) {
        return (
            <div className="fixed top-0 right-0 z-50 flex items-center space-x-4 p-4">
                <div className="w-8 h-8 relative">
                    <span className="absolute inline-block w-full h-full rounded-full bg-purple-600 animate-[loader3_1.5s_linear_infinite]" />
                    <span className="absolute inline-block w-full h-full rounded-full bg-purple-600 animate-[loader3_1.5s_linear_infinite] [animation-delay:-0.9s]" />
                </div>
            </div>
        );
    }

    // Show login/register buttons when not authenticated
    if (!isAuthenticated || !userProfile) {
        return (
            <div className="fixed top-0 right-0 z-50 flex items-center space-x-4 p-4">
                <GlobalSearch />
                <Link href="/auth/login">
                    <Button variant="outline" className="border-gray-600 text-gray-300 hover:bg-purple-500/10 hover:border-purple-500/50 font-semibold">
                        <Icon icon="heroicons:arrow-right-end-on-rectangle-16-solid" className="mr-2 h-4 w-4" />
                        Sign In
                    </Button>
                </Link>
                <Link href="/auth/register">
                    <Button className="bg-gradient-to-r from-purple-500 to-violet-600 hover:from-purple-600 hover:to-violet-700 text-white font-semibold">
                        <Icon icon="heroicons:user-plus-16-solid" className="mr-2 h-4 w-4" />
                        Register
                    </Button>
                </Link>
            </div>
        );
    }

    // Show user menu when authenticated
    const canAccessDashboard = userProfile.role !== 'viewer';
    const handleMenuClick = () => setOpen(false);

    return (
        <div className="fixed top-0 left-0 right-0 z-50 md:left-auto md:top-5.5 md:right-5.5">
            <div className="container mx-auto flex items-center justify-between p-3 md:justify-end md:p-0">
                <div className="flex items-center space-x-3 bg-gray-800/50 backdrop-blur-lg md:rounded-full md:px-4 md:py-2 md:shadow-lg md:border md:border-gray-800">
                    <GlobalSearch />
                    <NotificationDropdown className="rounded-full p-2 hover:bg-gray-700/50" />
                    <div className="hidden sm:flex flex-col text-right">
                        <span className="text-white font-medium leading-tight">{userProfile.username}</span>
                        <span className="text-xs text-purple-300 font-semibold tracking-wide">{userProfile.department.toUpperCase()}</span>
                    </div>
                    <Popover open={open} onOpenChange={setOpen}>
                        <PopoverTrigger asChild>
                            <div
                                className="relative cursor-pointer"
                                onMouseEnter={() => setIsHovered(true)}
                                onMouseLeave={() => setIsHovered(false)}
                            >
                                <UserAvatar
                                    user={userProfile}
                                    className="w-10 h-10 border-2 border-purple-500 hover:border-violet-400 transition-all"
                                />
                                {isHovered && (
                                    <div className="absolute -top-1 -right-1 bg-gray-800 rounded-full p-1 border border-gray-600 shadow-lg">
                                        <Icon icon="heroicons:cog-6-tooth-16-solid" className="w-3 h-3 text-purple-400" />
                                    </div>
                                )}
                            </div>
                        </PopoverTrigger>
                        <PopoverContent
                            sideOffset={8}
                            align="end"
                            className="bg-gray-900 border border-gray-800 rounded-xl shadow-xl p-2 min-w-[200px] animate-in fade-in-0 zoom-in-95"
                        >
                            <div className="flex flex-col gap-1">
                                <div className="px-3 py-2 border-b border-gray-800 mb-1">
                                    <div className="flex items-center space-x-3">
                                        <UserAvatar user={userProfile} className="w-8 h-8" />
                                        <div>
                                            <div className="text-sm font-medium text-white">{userProfile.username}</div>
                                            <div className="text-xs text-gray-400 capitalize">{userProfile.role.replace('_', ' ')}</div>
                                        </div>
                                    </div>
                                </div>
                                <Link href="/dashboard/profile" className="block px-3 py-2 rounded-md text-sm text-white hover:bg-purple-500/10 transition" onClick={handleMenuClick}>
                                    <Icon icon="heroicons:user-16-solid" className="inline mr-2 h-4 w-4 text-purple-400" /> Profile
                                </Link>
                                <Link href="/" className="block px-3 py-2 rounded-md text-sm text-white hover:bg-purple-500/10 transition" onClick={handleMenuClick}>
                                    <Icon icon="heroicons:home-16-solid" className="inline mr-2 h-4 w-4 text-purple-400" /> Home
                                </Link>
                                <Link href="/ems" className="block px-3 py-2 rounded-md text-sm text-white hover:bg-purple-500/10 transition" onClick={handleMenuClick}>
                                    <Icon icon="heroicons:book-open-16-solid" className="inline mr-2 h-4 w-4 text-purple-400" /> Reference
                                </Link>
                                {canAccessDashboard && (
                                    <Link href="/dashboard" className="block px-3 py-2 rounded-md text-sm text-white hover:bg-purple-500/10 transition" onClick={handleMenuClick}>
                                        <Icon icon="heroicons:squares-2x2-16-solid" className="inline mr-2 h-4 w-4 text-purple-400" /> Dashboard
                                    </Link>
                                )}
                                <div className="border-t border-gray-800 mt-1 pt-1">
                                    <button
                                        onClick={handleLogout}
                                        className="w-full text-left px-3 py-2 rounded-md text-sm text-red-400 hover:bg-red-500/10 transition flex items-center"
                                    >
                                        <Icon icon="heroicons:arrow-right-start-on-rectangle-16-solid" className="inline mr-2 h-4 w-4" /> Logout
                                    </button>
                                </div>
                            </div>
                        </PopoverContent>
                    </Popover>
                </div>
            </div>
        </div>
    );
} 