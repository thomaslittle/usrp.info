'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { Icon } from '@iconify/react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Preloader } from '@/components/ui/preloader';
import { useAuth } from '@/hooks/use-auth';
import { getAppwriteSessionToken, cn } from '@/lib/utils';
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

                const sessionToken = getAppwriteSessionToken();

                const response = await fetch('/api/dashboard/stats', {
                    headers: {
                        ...(sessionToken && { 'X-Fallback-Cookies': sessionToken })
                    }
                });
                if (!response.ok) {
                    throw new Error(`Failed to load dashboard data: ${response.statusText}`);
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
        <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900/20 to-slate-900">
            {/* Header Section */}
            <div className="px-6 pt-8 pb-6">
                <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6 mb-8">
                    <div className="space-y-4">
                        <h1 className="text-4xl lg:text-5xl font-bold text-white tracking-tight font-akrobat">
                            Welcome back, <span className="bg-gradient-to-r from-purple-400 to-violet-400 bg-clip-text text-transparent">{user?.username}</span>
                        </h1>
                        <div className="flex flex-wrap items-center gap-3">
                            <div className="flex items-center gap-2 px-4 py-2 rounded-2xl bg-gradient-to-r from-purple-500/20 to-violet-500/20 border border-purple-500/30">
                                <div className="w-2 h-2 bg-purple-400 rounded-full animate-pulse"></div>
                                <span className="text-purple-300 font-semibold text-sm">
                                    {user?.department?.toUpperCase()} DEPARTMENT
                                </span>
                            </div>
                            <div className="flex items-center gap-2 px-4 py-2 rounded-2xl bg-gradient-to-r from-blue-500/20 to-cyan-500/20 border border-blue-500/30">
                                <Icon icon="heroicons:shield-check-16-solid" className="h-3 w-3 text-blue-400" />
                                <span className="text-blue-300 font-semibold text-sm">
                                    {user?.role?.replace('_', ' ').toUpperCase()} ACCESS
                                </span>
                            </div>
                        </div>
                    </div>

                    {canManageContent && (
                        <div className="flex flex-col sm:flex-row gap-3">
                            <Link href="/dashboard/content">
                                <Button
                                    variant="outline"
                                    className="backdrop-blur-sm bg-white/5 border-purple-500/30 text-purple-300 hover:bg-purple-500/20 hover:border-purple-400 font-semibold rounded-2xl transition-all duration-300 h-12 px-6"
                                >
                                    <Icon icon="heroicons:document-text-16-solid" className="mr-2 h-4 w-4" />
                                    Manage Content
                                </Button>
                            </Link>
                            <Link href="/dashboard/content/new">
                                <Button className="bg-gradient-to-r from-purple-500 to-violet-600 hover:from-purple-600 hover:to-violet-700 text-white border-0 shadow-xl font-semibold rounded-2xl transition-all duration-300 hover:scale-105 h-12 px-6">
                                    <Icon icon="heroicons:plus-16-solid" className="mr-2 h-4 w-4" />
                                    Create Content
                                </Button>
                            </Link>
                        </div>
                    )}
                </div>

                {/* Stats Cards */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                    <Card className="backdrop-blur-sm bg-white/5 border border-white/10 rounded-3xl overflow-hidden group hover:scale-105 transition-all duration-300 hover:bg-white/10">
                        <CardContent className="p-6 relative">
                            <div className="flex items-center justify-between mb-4">
                                <div className="p-3 bg-gradient-to-br from-purple-500 to-violet-600 rounded-2xl shadow-lg">
                                    <Icon icon="heroicons:document-text-16-solid" className="h-6 w-6 text-white" />
                                </div>
                                <span className="text-xs font-semibold text-slate-400 tracking-wider">TOTAL</span>
                            </div>
                            <div className="space-y-1">
                                <div className="text-3xl font-bold text-white">{stats.totalContent}</div>
                                <p className="text-sm text-slate-400 font-medium">Content Items</p>
                            </div>
                        </CardContent>
                    </Card>

                    <Card className="backdrop-blur-sm bg-white/5 border border-white/10 rounded-3xl overflow-hidden group hover:scale-105 transition-all duration-300 hover:bg-white/10">
                        <CardContent className="p-6 relative">
                            <div className="flex items-center justify-between mb-4">
                                <div className="p-3 bg-gradient-to-br from-green-500 to-emerald-600 rounded-2xl shadow-lg">
                                    <Icon icon="heroicons:eye-16-solid" className="h-6 w-6 text-white" />
                                </div>
                                <span className="text-xs font-semibold text-slate-400 tracking-wider">LIVE</span>
                            </div>
                            <div className="space-y-1">
                                <div className="text-3xl font-bold text-white">{stats.publishedContent}</div>
                                <p className="text-sm text-slate-400 font-medium">Published</p>
                            </div>
                        </CardContent>
                    </Card>

                    <Card className="backdrop-blur-sm bg-white/5 border border-white/10 rounded-3xl overflow-hidden group hover:scale-105 transition-all duration-300 hover:bg-white/10">
                        <CardContent className="p-6 relative">
                            <div className="flex items-center justify-between mb-4">
                                <div className="p-3 bg-gradient-to-br from-yellow-500 to-orange-600 rounded-2xl shadow-lg">
                                    <Icon icon="heroicons:pencil-16-solid" className="h-6 w-6 text-white" />
                                </div>
                                <span className="text-xs font-semibold text-slate-400 tracking-wider">DRAFT</span>
                            </div>
                            <div className="space-y-1">
                                <div className="text-3xl font-bold text-white">{stats.draftContent}</div>
                                <p className="text-sm text-slate-400 font-medium">In Progress</p>
                            </div>
                        </CardContent>
                    </Card>

                    <Card className="backdrop-blur-sm bg-white/5 border border-white/10 rounded-3xl overflow-hidden group hover:scale-105 transition-all duration-300 hover:bg-white/10">
                        <CardContent className="p-6 relative">
                            <div className="flex items-center justify-between mb-4">
                                <div className="p-3 bg-gradient-to-br from-blue-500 to-cyan-600 rounded-2xl shadow-lg">
                                    <Icon icon="heroicons:bolt-16-solid" className="h-6 w-6 text-white" />
                                </div>
                                <span className="text-xs font-semibold text-slate-400 tracking-wider">WEEK</span>
                            </div>
                            <div className="space-y-1">
                                <div className="text-3xl font-bold text-white">{stats.recentActivity}</div>
                                <p className="text-sm text-slate-400 font-medium">Activities</p>
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </div>

            {/* Main Content Grid */}
            <div className="px-6 pb-8">
                <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
                    {/* Recent Content */}
                    <div className="xl:col-span-2">
                        <Card className="backdrop-blur-sm bg-white/5 border border-white/10 rounded-3xl h-full">
                            <CardHeader className="p-6 pb-4">
                                <div className="flex items-center justify-between">
                                    <CardTitle className="text-white flex items-center gap-3 font-bold text-xl font-akrobat">
                                        <div className="p-2 bg-gradient-to-br from-purple-500 to-violet-600 rounded-2xl">
                                            <Icon icon="heroicons:document-text-16-solid" className="h-5 w-5 text-white" />
                                        </div>
                                        Recent Content
                                    </CardTitle>
                                    {canManageContent && (
                                        <Link href="/dashboard/content">
                                            <Button variant="outline" size="sm" className="backdrop-blur-sm bg-white/5 border-purple-500/30 text-purple-300 hover:bg-purple-500/20 hover:border-purple-400 font-medium rounded-2xl transition-all duration-300">
                                                <Icon icon="heroicons:arrow-top-right-on-square-16-solid" className="mr-2 h-3 w-3" />
                                                View All
                                            </Button>
                                        </Link>
                                    )}
                                </div>
                            </CardHeader>
                            <CardContent className="px-6 pb-6">
                                <div className="space-y-3">
                                    {recentContent.length > 0 ? (
                                        recentContent.slice(0, 5).map((content, index) => (
                                            <div key={content.$id} className="group">
                                                <div className="backdrop-blur-sm bg-white/5 p-5 rounded-2xl hover:bg-white/10 transition-all duration-300 border border-white/10 hover:border-purple-500/30">
                                                    <div className="flex items-start justify-between gap-4">
                                                        <div className="flex-1 min-w-0">
                                                            <h3 className="font-semibold text-white truncate group-hover:text-purple-300 transition-colors text-lg">
                                                                {content.title}
                                                            </h3>
                                                            <p className="text-sm text-slate-400 mt-2 line-clamp-2 leading-relaxed">
                                                                {content.type?.replace('_', ' ').toUpperCase()} • {content.tags?.join(', ') || 'No tags'}
                                                            </p>
                                                            <div className="flex items-center gap-4 mt-4 text-xs">
                                                                <span className={cn(
                                                                    "inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full border font-medium",
                                                                    content.status === 'published'
                                                                        ? 'bg-green-500/20 border-green-500/30 text-green-300'
                                                                        : 'bg-yellow-500/20 border-yellow-500/30 text-yellow-300'
                                                                )}>
                                                                    <div className={cn(
                                                                        "w-1.5 h-1.5 rounded-full",
                                                                        content.status === 'published' ? 'bg-green-400' : 'bg-yellow-400'
                                                                    )}></div>
                                                                    {content.status.toUpperCase()}
                                                                </span>
                                                                <span className="text-slate-500 font-medium">
                                                                    {content.departmentId?.toUpperCase()}
                                                                </span>
                                                                <span className="text-slate-500">
                                                                    {new Date(content.$updatedAt).toLocaleDateString()}
                                                                </span>
                                                            </div>
                                                        </div>
                                                        {canManageContent && (
                                                            <Link href={`/dashboard/content/${content.$id}/edit`}>
                                                                <Button variant="outline" size="sm" className="backdrop-blur-sm bg-white/5 border-slate-600/50 text-slate-400 hover:text-white hover:border-purple-500/50 transition-all duration-300 opacity-0 group-hover:opacity-100 rounded-2xl">
                                                                    <Icon icon="heroicons:pencil-16-solid" className="h-3 w-3" />
                                                                </Button>
                                                            </Link>
                                                        )}
                                                    </div>
                                                </div>
                                            </div>
                                        ))
                                    ) : (
                                        <div className="text-center py-16">
                                            <div className="p-6 bg-slate-700/20 rounded-3xl w-fit mx-auto mb-6">
                                                <Icon icon="heroicons:document-text-16-solid" className="h-12 w-12 text-slate-400" />
                                            </div>
                                            <h3 className="font-bold text-white mb-3 text-xl">No content available</h3>
                                            <p className="text-slate-400 text-sm leading-relaxed mb-6">
                                                Start creating content to see it appear here.
                                            </p>
                                            {canManageContent && (
                                                <Link href="/dashboard/content/new">
                                                    <Button className="bg-gradient-to-r from-purple-500 to-violet-600 hover:from-purple-600 hover:to-violet-700 font-medium rounded-2xl h-12 px-6">
                                                        <Icon icon="heroicons:plus-16-solid" className="mr-2 h-4 w-4" />
                                                        Create First Content
                                                    </Button>
                                                </Link>
                                            )}
                                        </div>
                                    )}
                                </div>
                            </CardContent>
                        </Card>
                    </div>

                    {/* Recent Activity */}
                    <div>
                        <Card className="backdrop-blur-sm bg-white/5 border border-white/10 rounded-3xl h-full">
                            <CardHeader className="p-6 pb-4">
                                <CardTitle className="text-white flex items-center gap-3 font-bold text-xl font-akrobat">
                                    <div className="p-2 bg-gradient-to-br from-blue-500 to-cyan-600 rounded-2xl">
                                        <Icon icon="heroicons:bolt-16-solid" className="h-5 w-5 text-white" />
                                    </div>
                                    Recent Activity
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="px-6 pb-6">
                                <div className="space-y-3">
                                    {recentActivity.length > 0 ? (
                                        recentActivity.slice(0, 8).map((activity, index) => (
                                            <div key={activity.$id} className="flex items-start gap-4 p-4 rounded-2xl hover:bg-white/5 transition-colors duration-200">
                                                <div className={cn(
                                                    "p-2.5 rounded-2xl mt-0.5",
                                                    activity.action.includes('create') ? 'bg-green-500/20' :
                                                        activity.action.includes('update') ? 'bg-blue-500/20' :
                                                            activity.action.includes('delete') ? 'bg-red-500/20' :
                                                                'bg-purple-500/20'
                                                )}>
                                                    <Icon
                                                        icon={
                                                            activity.action.includes('create') ? 'heroicons:plus-16-solid' :
                                                                activity.action.includes('update') ? 'heroicons:pencil-16-solid' :
                                                                    activity.action.includes('delete') ? 'heroicons:trash-16-solid' :
                                                                        'heroicons:eye-16-solid'
                                                        }
                                                        className={cn(
                                                            "h-4 w-4",
                                                            activity.action.includes('create') ? 'text-green-400' :
                                                                activity.action.includes('update') ? 'text-blue-400' :
                                                                    activity.action.includes('delete') ? 'text-red-400' :
                                                                        'text-purple-400'
                                                        )}
                                                    />
                                                </div>
                                                <div className="flex-1 min-w-0">
                                                    <p className="text-sm text-white font-medium leading-relaxed">
                                                        {activity.description}
                                                    </p>
                                                    <p className="text-xs text-slate-400 mt-1.5">
                                                        {new Date(activity.timestamp).toLocaleString()}
                                                    </p>
                                                </div>
                                            </div>
                                        ))
                                    ) : (
                                        <div className="text-center py-12">
                                            <div className="p-4 bg-slate-700/20 rounded-3xl w-fit mx-auto mb-4">
                                                <Icon icon="heroicons:bolt-16-solid" className="h-8 w-8 text-slate-400" />
                                            </div>
                                            <h3 className="font-semibold text-white mb-2">No recent activity</h3>
                                            <p className="text-slate-400 text-sm">
                                                Activity will appear here as you use the system.
                                            </p>
                                        </div>
                                    )}
                                </div>
                            </CardContent>
                        </Card>
                    </div>
                </div>

                {/* Quick Actions */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mt-8">
                    <Link href="/ems" className="group">
                        <Card className="backdrop-blur-sm bg-white/5 border border-white/10 rounded-3xl h-full hover:scale-105 transition-all duration-300 hover:bg-white/10">
                            <CardContent className="p-6">
                                <div className="flex items-center gap-4 mb-4">
                                    <div className="p-4 bg-gradient-to-br from-purple-500 to-violet-600 rounded-3xl shadow-lg group-hover:shadow-purple-500/50 transition-all duration-300">
                                        <Icon icon="heroicons:heart-16-solid" className="h-8 w-8 text-white" />
                                    </div>
                                    <div>
                                        <h3 className="font-bold text-white text-xl group-hover:text-purple-300 transition-colors">
                                            EMS Portal
                                        </h3>
                                        <p className="text-sm text-slate-400">Access department resources</p>
                                    </div>
                                </div>
                                <p className="text-slate-300 text-sm leading-relaxed">
                                    Quick access to medical protocols, SOPs, and reference materials.
                                </p>
                            </CardContent>
                        </Card>
                    </Link>

                    {canManageUsers && (
                        <Link href="/dashboard/users" className="group">
                            <Card className="backdrop-blur-sm bg-white/5 border border-white/10 rounded-3xl h-full hover:scale-105 transition-all duration-300 hover:bg-white/10">
                                <CardContent className="p-6">
                                    <div className="flex items-center gap-4 mb-4">
                                        <div className="p-4 bg-gradient-to-br from-blue-500 to-cyan-600 rounded-3xl shadow-lg group-hover:shadow-blue-500/50 transition-all duration-300">
                                            <Icon icon="heroicons:users-16-solid" className="h-8 w-8 text-white" />
                                        </div>
                                        <div>
                                            <h3 className="font-bold text-white text-xl group-hover:text-blue-300 transition-colors">
                                                User Management
                                            </h3>
                                            <p className="text-sm text-slate-400">Manage department staff</p>
                                        </div>
                                    </div>
                                    <p className="text-slate-300 text-sm leading-relaxed">
                                        Add, edit, and manage user accounts and permissions.
                                    </p>
                                </CardContent>
                            </Card>
                        </Link>
                    )}

                    <Link href="/dashboard/profile" className="group">
                        <Card className="backdrop-blur-sm bg-white/5 border border-white/10 rounded-3xl h-full hover:scale-105 transition-all duration-300 hover:bg-white/10">
                            <CardContent className="p-6">
                                <div className="flex items-center gap-4 mb-4">
                                    <div className="p-4 bg-gradient-to-br from-green-500 to-emerald-600 rounded-3xl shadow-lg group-hover:shadow-green-500/50 transition-all duration-300">
                                        <Icon icon="heroicons:user-16-solid" className="h-8 w-8 text-white" />
                                    </div>
                                    <div>
                                        <h3 className="font-bold text-white text-xl group-hover:text-green-300 transition-colors">
                                            Profile Settings
                                        </h3>
                                        <p className="text-sm text-slate-400">Update your information</p>
                                    </div>
                                </div>
                                <p className="text-slate-300 text-sm leading-relaxed">
                                    Manage your profile, preferences, and account settings.
                                </p>
                            </CardContent>
                        </Card>
                    </Link>
                </div>
            </div>
        </div>
    );
} 