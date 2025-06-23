'use client';

import React, { useState, useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import Link from 'next/link';
import { Icon } from '@iconify/react';
import { Button } from '@/components/ui/button';
import { Preloader } from '@/components/ui/preloader';
import { useAuth } from '@/hooks/use-auth';
import { User, UserRole } from '@/types';
import { cn } from '@/lib/utils';
import { UserNav } from '@/components/user-nav';

// const DISCORD_SERVER_ID = process.env.NEXT_PUBLIC_DISCORD_SERVER_ID || '';

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
    const { user, isLoading: authLoading, isAuthenticated } = useAuth();
    const [userProfile, setUserProfile] = useState<User | null>(null);
    const [loading, setLoading] = useState(true);
    const [sidebarOpen, setSidebarOpen] = useState(false);
    const router = useRouter();
    const pathname = usePathname();

    useEffect(() => {
        const fetchUserProfile = async () => {
            if (authLoading) return;
            if (!isAuthenticated || !user) {
                router.push('/auth/login');
                return;
            }

            try {
                const response = await fetch(`/api/users/profile?email=${encodeURIComponent(user.email)}`);
                if (response.ok) {
                    const data = await response.json();
                    setUserProfile(data.user);
                } else {
                    throw new Error('Failed to fetch user profile');
                }
            } catch (error) {
                console.error('Profile fetch error:', error);
                router.push('/auth/login');
            } finally {
                setLoading(false);
            }
        };

        fetchUserProfile();
    }, [authLoading, isAuthenticated, user, router]);

    const hasAccess = (requiredRoles: UserRole[]) => {
        return userProfile && requiredRoles.includes(userProfile.role as UserRole);
    };

    const filteredNavigation = dashboardNavigation.filter(item =>
        hasAccess(item.roles as UserRole[])
    );

    if (loading || authLoading) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900/20 to-slate-900 flex items-center justify-center">
                <div className="backdrop-blur-sm bg-white/5 p-12 rounded-3xl border border-white/10">
                    <Preloader text="Loading dashboard..." size="lg" />
                    <p className="text-slate-300 mt-4 font-medium text-center">Initializing your workspace...</p>
                </div>
            </div>
        );
    }

    if (!userProfile) {
        return null; // Redirecting...
    }

    return (
        <div className="min-h-screen relative overflow-hidden">
            {/* Background Effects */}
            <img
                src="/images/bg.webp"
                alt="Background"
                className="absolute inset-0 w-full h-full object-cover -z-10"
            />
            <div className="absolute inset-0 bg-black/50 -z-10"></div>
            <div className="absolute inset-0 bg-gradient-to-br from-purple-500/10 via-transparent to-blue-500/10 -z-10"></div>

            <div className="relative flex min-h-screen">
                {/* Mobile sidebar */}
                <div className={cn("fixed inset-0 z-50 lg:hidden", sidebarOpen ? 'block' : 'hidden')}>
                    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm" onClick={() => setSidebarOpen(false)} />
                    <div className="fixed inset-y-0 left-0 w-72 bg-gray-800/50 backdrop-blur-xl border-r border-white/10 overflow-y-auto">
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

                {/* Static sidebar for desktop */}
                <div className="hidden lg:flex lg:w-72 lg:flex-col lg:inset-y-0">
                    <div className="flex grow flex-col gap-y-5 overflow-y-auto bg-gray-800/50 backdrop-blur-xl border-r border-white/10 px-6 pb-4">
                        <div className="flex h-20 shrink-0 items-center">
                            <div className="flex items-center gap-4">
                                <img
                                    src="/images/logo-short.png"
                                    alt="Logo"
                                    className="h-10 w-10 object-contain"
                                />
                                <div className="w-px h-12 bg-gray-700"></div>
                                <div className="flex flex-col">
                                    <span className="text-sm text-gray-400 font-medium">Department</span>
                                    <span className="text-xl font-bold text-white">Dashboard</span>
                                </div>
                            </div>
                        </div>
                        <nav className="flex flex-1 flex-col">
                            <ul role="list" className="flex flex-1 flex-col gap-y-7">
                                <li>
                                    <ul role="list" className="-mx-2 space-y-1">
                                        {filteredNavigation.map((item) => (
                                            <li key={item.name}>
                                                <Link
                                                    href={item.href}
                                                    className={cn(
                                                        "group flex gap-x-3 rounded-2xl p-3 text-sm leading-6 font-semibold transition-all duration-300",
                                                        pathname === item.href
                                                            ? "bg-gradient-to-r from-purple-500 to-violet-600 text-white shadow-lg shadow-purple-500/25"
                                                            : "text-slate-300 hover:text-white hover:bg-white/10 backdrop-blur-sm"
                                                    )}
                                                >
                                                    <Icon icon={item.icon} className="h-6 w-6 shrink-0" />
                                                    {item.name}
                                                </Link>
                                            </li>
                                        ))}
                                    </ul>
                                </li>
                            </ul>
                        </nav>
                    </div>
                </div>

                <div className="flex flex-1 flex-col min-w-0">
                    {/* Mobile header section with hamburger menu */}
                    <div className="lg:hidden bg-slate-900/95 backdrop-blur-xl border-b border-white/10 h-16 flex items-center px-4 relative z-40">
                        <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => setSidebarOpen(true)}
                            className="text-slate-400 hover:text-white p-2"
                        >
                            <Icon icon="heroicons:bars-3-16-solid" className="h-5 w-5" />
                        </Button>
                        <div className="w-px h-8 bg-gray-700 mx-4"></div>
                        <img src="/images/logo-short.png" alt="Logo" className="h-8 w-8 object-contain" />
                        <div className="flex-1" />
                    </div>

                    {/* UserNav handles all header functionality */}
                    <UserNav />

                    <main className="flex-1 mt-32 md:mt-16 min-w-0">
                        {children}
                    </main>
                </div>
            </div>
        </div>
    );
} 