'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { Icon } from '@iconify/react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Preloader } from '@/components/ui/preloader';
import { getAppwriteSessionToken } from '@/lib/utils';
import { Content, ActivityLog, User } from '@/types';

interface DashboardStats {
    totalContent: number;
    publishedContent: number;
    draftContent: number;
    recentActivity: number;
}

interface DashboardData {
    user: User;
    stats: DashboardStats;
    recentContent: Content[];
    recentActivity: ActivityLog[];
}

export default function DashboardPage() {
    const [dashboardData, setDashboardData] = useState<DashboardData | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const loadDashboardData = async () => {
            try {
                setLoading(true);
                setError(null);

                const response = await fetch('/api/dashboard/stats', {
                    credentials: 'include'
                });
                if (!response.ok) {
                    throw new Error(`Failed to load dashboard data. Status: ${response.status}`);
                }

                const data = await response.json();
                setDashboardData(data);
            } catch (error) {
                console.error('Error loading dashboard data:', error);
                setError(error instanceof Error ? error.message : 'Failed to load dashboard data');
            } finally {
                setLoading(false);
            }
        };

        loadDashboardData();
    }, []);

    if (loading) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900/20 to-slate-900 flex items-center justify-center">
                <div className="backdrop-blur-sm bg-white/5 p-12 rounded-3xl border border-white/10">
                    <Preloader text="Loading dashboard data..." size="lg" />
                    <p className="text-slate-300 mt-4 font-medium text-center">Initializing your workspace...</p>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900/20 to-slate-900 flex items-center justify-center">
                <Card className="backdrop-blur-sm bg-white/5 border-red-500/30 max-w-md border border-white/10">
                    <CardContent className="p-8">
                        <div className="flex items-center space-x-3 text-red-400 mb-4">
                            <div className="p-3 bg-red-500/20 rounded-full">
                                <Icon icon="heroicons:exclamation-triangle-16-solid" className="h-6 w-6" />
                            </div>
                            <span className="font-semibold text-lg">Dashboard Error</span>
                        </div>
                        <p className="text-red-300 mb-6 leading-relaxed">{error}</p>
                        <Button
                            onClick={() => window.location.reload()}
                            className="w-full bg-red-600 hover:bg-red-700 transition-all duration-300 rounded-xl"
                        >
                            <Icon icon="heroicons:arrow-path-16-solid" className="mr-2 h-4 w-4" />
                            Retry Connection
                        </Button>
                    </CardContent>
                </Card>
            </div>
        );
    }

    if (!dashboardData) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900/20 to-slate-900 flex items-center justify-center">
                <Card className="backdrop-blur-sm bg-white/5 border-yellow-500/30 max-w-md border border-white/10">
                    <CardContent className="p-8">
                        <div className="flex items-center space-x-3 text-yellow-400 mb-4">
                            <div className="p-3 bg-yellow-500/20 rounded-full">
                                <Icon icon="heroicons:exclamation-triangle-16-solid" className="h-6 w-6" />
                            </div>
                            <span className="font-semibold text-lg">No Data Available</span>
                        </div>
                        <p className="text-yellow-300 leading-relaxed">Dashboard data is not available at this time.</p>
                    </CardContent>
                </Card>
            </div>
        );
    }

    const { user, stats, recentContent, recentActivity } = dashboardData;
    const canManageContent = user && ['editor', 'admin', 'super_admin'].includes(user.role);
    const canManageUsers = user && ['admin', 'super_admin'].includes(user.role);

    return (
        <div className="relative py-8">
            <div className="container mx-auto px-6 lg:px-8">
                {/* Header with improved spacing and styling */}
                <div className="mb-12">
                    <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
                        <div>
                            <h1 className="text-4xl font-bold text-white mb-3 bg-gradient-to-r from-white to-gray-300 bg-clip-text text-transparent">
                                Dashboard Overview
                            </h1>
                            <p className="text-xl text-gray-300 flex items-center gap-2">
                                <Icon icon="heroicons:hand-raised-16-solid" className="h-5 w-5 text-purple-400" />
                                Welcome back, <span className="font-semibold text-white">{user.username}</span>
                            </p>
                        </div>

                        {/* Quick Actions */}
                        <div className="flex flex-wrap items-center gap-4">
                            {canManageContent && (
                                <Button
                                    asChild
                                    className="bg-gradient-to-r from-purple-600 to-purple-700 hover:from-purple-700 hover:to-purple-800 shadow-lg shadow-purple-500/25 transition-all duration-300 hover:shadow-purple-500/40 hover:scale-105"
                                >
                                    <Link href="/dashboard/content/new" className="flex items-center gap-2">
                                        <Icon icon="heroicons:plus-16-solid" className="h-4 w-4" />
                                        Create Content
                                    </Link>
                                </Button>
                            )}
                            <Button
                                asChild
                                variant="outline"
                                className="border-gray-600 hover:border-purple-500 hover:bg-purple-500/10 transition-all duration-300"
                            >
                                <Link href="/dashboard/content" className="flex items-center gap-2">
                                    <Icon icon="heroicons:document-text-16-solid" className="h-4 w-4" />
                                    Manage Content
                                </Link>
                            </Button>
                            {canManageUsers && (
                                <Button
                                    asChild
                                    variant="outline"
                                    className="border-gray-600 hover:border-sky-500 hover:bg-sky-500/10 transition-all duration-300"
                                >
                                    <Link href="/dashboard/users" className="flex items-center gap-2">
                                        <Icon icon="heroicons:users-16-solid" className="h-4 w-4" />
                                        Manage Users
                                    </Link>
                                </Button>
                            )}
                        </div>
                    </div>
                </div>

                {/* Enhanced Stats Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
                    <Card className="bg-gradient-to-br from-gray-800/60 to-gray-900/60 border border-gray-700/50 backdrop-blur-sm hover:border-purple-500/50 transition-all duration-300 group">
                        <CardContent className="p-6">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm font-medium text-gray-400 mb-1">Total Content</p>
                                    <p className="text-3xl font-bold text-white group-hover:text-purple-300 transition-colors duration-300">
                                        {stats.totalContent}
                                    </p>
                                    <p className="text-xs text-gray-500 mt-1">All departments</p>
                                </div>
                                <div className="bg-purple-500/20 p-4 rounded-xl group-hover:bg-purple-500/30 transition-colors duration-300">
                                    <Icon icon="heroicons:document-text-16-solid" className="h-6 w-6 text-purple-400" />
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    <Card className="bg-gradient-to-br from-gray-800/60 to-gray-900/60 border border-gray-700/50 backdrop-blur-sm hover:border-green-500/50 transition-all duration-300 group">
                        <CardContent className="p-6">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm font-medium text-gray-400 mb-1">Published</p>
                                    <p className="text-3xl font-bold text-white group-hover:text-green-300 transition-colors duration-300">
                                        {stats.publishedContent}
                                    </p>
                                    <p className="text-xs text-gray-500 mt-1">Live content</p>
                                </div>
                                <div className="bg-green-500/20 p-4 rounded-xl group-hover:bg-green-500/30 transition-colors duration-300">
                                    <Icon icon="heroicons:check-circle-16-solid" className="h-6 w-6 text-green-400" />
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    <Card className="bg-gradient-to-br from-gray-800/60 to-gray-900/60 border border-gray-700/50 backdrop-blur-sm hover:border-yellow-500/50 transition-all duration-300 group">
                        <CardContent className="p-6">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm font-medium text-gray-400 mb-1">Draft</p>
                                    <p className="text-3xl font-bold text-white group-hover:text-yellow-300 transition-colors duration-300">
                                        {stats.draftContent}
                                    </p>
                                    <p className="text-xs text-gray-500 mt-1">In progress</p>
                                </div>
                                <div className="bg-yellow-500/20 p-4 rounded-xl group-hover:bg-yellow-500/30 transition-colors duration-300">
                                    <Icon icon="heroicons:pencil-16-solid" className="h-6 w-6 text-yellow-400" />
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    <Card className="bg-gradient-to-br from-gray-800/60 to-gray-900/60 border border-gray-700/50 backdrop-blur-sm hover:border-blue-500/50 transition-all duration-300 group">
                        <CardContent className="p-6">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm font-medium text-gray-400 mb-1">Recent Activity</p>
                                    <p className="text-3xl font-bold text-white group-hover:text-blue-300 transition-colors duration-300">
                                        {stats.recentActivity}
                                    </p>
                                    <p className="text-xs text-gray-500 mt-1">Last 7 days</p>
                                </div>
                                <div className="bg-blue-500/20 p-4 rounded-xl group-hover:bg-blue-500/30 transition-colors duration-300">
                                    <Icon icon="heroicons:bolt-16-solid" className="h-6 w-6 text-blue-400" />
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                    {/* Enhanced Recent Content */}
                    <Card className="bg-gradient-to-br from-gray-800/60 to-gray-900/60 border border-gray-700/50 backdrop-blur-sm">
                        <CardHeader className="pb-4">
                            <div className="flex items-center justify-between">
                                <CardTitle className="text-white flex items-center gap-3">
                                    <div className="bg-purple-500/20 p-2 rounded-lg">
                                        <Icon icon="heroicons:document-text-16-solid" className="h-5 w-5 text-purple-400" />
                                    </div>
                                    Recent Content
                                </CardTitle>
                                <Button
                                    asChild
                                    variant="ghost"
                                    size="sm"
                                    className="text-purple-400 hover:text-purple-300 hover:bg-purple-500/10"
                                >
                                    <Link href="/dashboard/content">View All</Link>
                                </Button>
                            </div>
                        </CardHeader>
                        <CardContent className="pt-0">
                            {recentContent.length === 0 ? (
                                <div className="text-center py-8">
                                    <Icon icon="heroicons:document-text-16-solid" className="h-12 w-12 mx-auto mb-4 text-gray-500" />
                                    <p className="text-gray-400">No recent content</p>
                                </div>
                            ) : (
                                <div className="space-y-4">
                                    {recentContent.map((item) => (
                                        <div key={item.$id} className="flex items-center justify-between p-3 bg-gray-900/50 rounded-lg border border-gray-700/50">
                                            <div className="flex-1">
                                                <h4 className="text-white font-medium">{item.title}</h4>
                                                <p className="text-sm text-gray-400">
                                                    {item.type} • v{item.version.toFixed(2)} • {new Date(item.updatedAt).toLocaleDateString()}
                                                </p>
                                            </div>
                                            <div className="flex items-center gap-2">
                                                <span className={`px-2 py-1 text-xs font-medium rounded-md ${item.status === 'published' ? 'bg-green-500/20 text-green-400' :
                                                    item.status === 'draft' ? 'bg-yellow-500/20 text-yellow-400' :
                                                        'bg-gray-500/20 text-gray-400'
                                                    }`}>
                                                    {item.status}
                                                </span>
                                                <Link href={`/dashboard/content/${item.$id}/edit`}>
                                                    <Button size="sm" variant="outline" className="border-gray-600 text-gray-300 hover:bg-purple-500/10 hover:border-purple-500/50">
                                                        <Icon icon="heroicons:pencil-16-solid" className="h-4 w-4" />
                                                    </Button>
                                                </Link>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </CardContent>
                    </Card>

                    {/* Enhanced Quick Actions */}
                    <Card className="bg-gradient-to-br from-gray-800/60 to-gray-900/60 border border-gray-700/50 backdrop-blur-sm">
                        <CardHeader className="pb-4">
                            <CardTitle className="text-white flex items-center gap-3">
                                <div className="bg-blue-500/20 p-2 rounded-lg">
                                    <Icon icon="heroicons:bolt-16-solid" className="h-5 w-5 text-blue-400" />
                                </div>
                                Quick Actions
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="pt-0">
                            <div className="space-y-3">
                                {canManageContent && (
                                    <Button
                                        asChild
                                        className="w-full bg-gradient-to-r from-purple-600 to-purple-700 hover:from-purple-700 hover:to-purple-800 shadow-lg shadow-purple-500/25 transition-all duration-300 hover:shadow-purple-500/40"
                                    >
                                        <Link href="/dashboard/content/new" className="flex items-center justify-center gap-2">
                                            <Icon icon="heroicons:plus-16-solid" className="h-4 w-4" />
                                            Create New Content
                                        </Link>
                                    </Button>
                                )}

                                <Button
                                    asChild
                                    variant="outline"
                                    className="w-full border-gray-600 text-gray-300 hover:bg-green-500/10 hover:border-green-500/50 transition-all duration-300"
                                >
                                    <Link href="/ems" className="flex items-center justify-center gap-2">
                                        <Icon icon="heroicons:book-open-16-solid" className="h-4 w-4" />
                                        View Public Site
                                    </Link>
                                </Button>

                                <Button
                                    asChild
                                    variant="outline"
                                    className="w-full border-gray-600 text-gray-300 hover:bg-sky-500/10 hover:border-sky-500/50 transition-all duration-300"
                                >
                                    <Link href="/dashboard/profile" className="flex items-center justify-center gap-2">
                                        <Icon icon="heroicons:user-circle-16-solid" className="h-4 w-4" />
                                        Edit Profile
                                    </Link>
                                </Button>

                                {user.role === 'super_admin' && (
                                    <div className="pt-2 border-t border-gray-700/50">
                                        <p className="text-xs text-gray-500 mb-2 font-medium uppercase tracking-wide">Admin Tools</p>
                                        <Button
                                            asChild
                                            variant="outline"
                                            size="sm"
                                            className="w-full border-red-600/50 text-red-400 hover:bg-red-500/10 hover:border-red-500/50 transition-all duration-300"
                                        >
                                            <Link href="/api/seed" className="flex items-center justify-center gap-2">
                                                <Icon icon="heroicons:cog-6-tooth-16-solid" className="h-4 w-4" />
                                                System Tools
                                            </Link>
                                        </Button>
                                    </div>
                                )}
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </div>
    );
} 