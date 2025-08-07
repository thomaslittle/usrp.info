'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { Icon } from '@iconify/react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Preloader } from '@/components/ui/preloader';
import { useAuth } from '@/hooks/use-auth';
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
    const { user, userProfile, isAuthenticated, isLoading: authLoading } = useAuth();
    const [dashboardData, setDashboardData] = useState<DashboardData | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const loadDashboardData = async () => {
            console.log('🔍 Dashboard auth check:', {
                isAuthenticated,
                authLoading,
                hasUser: !!user,
                hasUserProfile: !!userProfile,
                userEmail: user?.email || userProfile?.email
            });

            if (authLoading && !user && !userProfile) {
                console.log('🚫 Dashboard: Still loading auth, waiting...');
                return;
            }

            try {
                setLoading(true);
                setError(null);

                const sessionToken = getAppwriteSessionToken();
                console.log('🔑 Dashboard: Session token available:', !!sessionToken);

                let authHeaders = {};
                try {
                    const { account } = await import('@/lib/appwrite');
                    const currentSession = await account.getSession('current');
                    console.log('🔑 Got current session from Appwrite:', currentSession.$id);
                    authHeaders = {
                        'X-Appwrite-Session': currentSession.$id,
                        ...(sessionToken && { 'X-Fallback-Cookies': sessionToken })
                    };
                } catch (sessionError) {
                    console.warn('⚠️ Could not get Appwrite session:', sessionError);
                    authHeaders = {
                        ...(sessionToken && { 'X-Fallback-Cookies': sessionToken })
                    };
                }

                const userEmail = user?.email || userProfile?.email;
                if (!userEmail) {
                    throw new Error('No user email available');
                }

                const response = await fetch(`/api/dashboard/stats?email=${encodeURIComponent(userEmail)}`, {
                    method: 'GET',
                    credentials: 'include',
                    headers: {
                        'Content-Type': 'application/json',
                        ...authHeaders
                    }
                });

                if (!response.ok) {
                    if (response.status === 401) {
                        throw new Error('Authentication required. Please log in again.');
                    }
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
    }, [authLoading, user, userProfile, isAuthenticated]);

    if (loading) {
        return (
            <div className="container mx-auto p-4 lg:p-6">
                <div className="flex items-center justify-center min-h-[60vh]">
                    <div className="backdrop-blur-sm bg-gray-800/30 p-12 rounded-3xl border border-gray-700">
                        <Preloader text="Loading dashboard data..." size="lg" />
                        <p className="text-slate-300 mt-4 font-medium text-center">Initializing your workspace...</p>
                    </div>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="container mx-auto p-4 lg:p-6">
                <div className="flex items-center justify-center min-h-[60vh]">
                    <Card className="bg-gray-800/30 backdrop-blur-sm border-red-500/60 max-w-md shadow-lg">
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
            </div>
        );
    }

    if (!authLoading && !user && !userProfile) {
        console.log('🚫 Dashboard: No user data, redirecting to login');
        window.location.href = '/auth/login';
        return null;
    }

    if (!dashboardData) {
        return (
            <div className="container mx-auto p-4 lg:p-6">
                <div className="flex items-center justify-center min-h-[60vh]">
                    <Card className="bg-gray-800/30 backdrop-blur-sm border-yellow-500/30 max-w-md">
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
            </div>
        );
    }

    const { user: dbUser, stats, recentContent, recentActivity } = dashboardData;
    const currentUser = userProfile || dbUser;
    const canManageContent = currentUser && ['editor', 'admin', 'super_admin'].includes(currentUser.role);
    const canManageUsers = currentUser && ['admin', 'super_admin'].includes(currentUser.role);

    return (
        <div className="container mx-auto p-4 lg:p-6">
            {/* Header */}
            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6 mb-8">
                <div>
                    <h1 className="text-3xl font-bold text-white mb-2">
                        Welcome back, {currentUser?.username}
                    </h1>
                    <div className="flex flex-wrap items-center gap-3">
                        <span className="inline-flex items-center gap-2 px-3 py-1 bg-blue-500/20 text-blue-300 rounded-full text-sm font-medium border border-blue-500/30">
                            <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                            {currentUser?.department?.toUpperCase() || 'EMS'}
                        </span>
                        <span className="inline-flex items-center gap-2 px-3 py-1 bg-green-500/20 text-green-300 rounded-full text-sm font-medium border border-green-500/30">
                            <Icon icon="heroicons:shield-check-16-solid" className="h-3 w-3" />
                            {currentUser?.role?.replace('_', ' ').toUpperCase() || 'SUPER ADMIN'}
                        </span>
                        <span className="text-gray-400 text-sm">
                            {new Date().toLocaleDateString('en-US', {
                                weekday: 'long',
                                month: 'long',
                                day: 'numeric'
                            })}
                        </span>
                    </div>
                </div>

                {canManageContent && (
                    <div className="flex flex-col sm:flex-row gap-3">
                        <Link href="/dashboard/content">
                            <Button variant="outline" className="w-full sm:w-auto bg-gray-800/50 border-gray-700 text-white hover:bg-gray-700">
                                <Icon icon="heroicons:document-text-16-solid" className="mr-2 h-4 w-4" />
                                Manage Content
                            </Button>
                        </Link>
                        <Link href="/dashboard/content/new">
                            <Button className="w-full sm:w-auto bg-gradient-to-r from-purple-500 to-violet-600 hover:from-purple-600 hover:to-violet-700 text-white">
                                <Icon icon="heroicons:plus-16-solid" className="mr-2 h-4 w-4" />
                                Create Content
                            </Button>
                        </Link>
                    </div>
                )}
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                <Card className="bg-gray-800/30 backdrop-blur-sm border-gray-700 hover:bg-gray-800/40 transition-all duration-300">
                    <CardContent className="p-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm font-medium text-gray-400 mb-1">Total Content</p>
                                <p className="text-2xl font-bold text-white">{stats.totalContent}</p>
                            </div>
                            <div className="h-12 w-12 bg-blue-500/20 rounded-lg flex items-center justify-center">
                                <Icon icon="heroicons:document-text-16-solid" className="h-6 w-6 text-blue-400" />
                            </div>
                        </div>
                    </CardContent>
                </Card>

                <Card className="bg-gray-800/30 backdrop-blur-sm border-gray-700 hover:bg-gray-800/40 transition-all duration-300">
                    <CardContent className="p-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm font-medium text-gray-400 mb-1">Published</p>
                                <p className="text-2xl font-bold text-white">{stats.publishedContent}</p>
                            </div>
                            <div className="h-12 w-12 bg-green-500/20 rounded-lg flex items-center justify-center">
                                <Icon icon="heroicons:check-circle-16-solid" className="h-6 w-6 text-green-400" />
                            </div>
                        </div>
                    </CardContent>
                </Card>

                <Card className="bg-gray-800/30 backdrop-blur-sm border-gray-700 hover:bg-gray-800/40 transition-all duration-300">
                    <CardContent className="p-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm font-medium text-gray-400 mb-1">Drafts</p>
                                <p className="text-2xl font-bold text-white">{stats.draftContent}</p>
                            </div>
                            <div className="h-12 w-12 bg-amber-500/20 rounded-lg flex items-center justify-center">
                                <Icon icon="heroicons:document-16-solid" className="h-6 w-6 text-amber-400" />
                            </div>
                        </div>
                    </CardContent>
                </Card>

                <Card className="bg-gray-800/30 backdrop-blur-sm border-gray-700 hover:bg-gray-800/40 transition-all duration-300">
                    <CardContent className="p-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm font-medium text-gray-400 mb-1">Recent Activity</p>
                                <p className="text-2xl font-bold text-white">{stats.recentActivity}</p>
                            </div>
                            <div className="h-12 w-12 bg-purple-500/20 rounded-lg flex items-center justify-center">
                                <Icon icon="heroicons:clock-16-solid" className="h-6 w-6 text-purple-400" />
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Main Content Grid */}
            <div className="grid grid-cols-1 xl:grid-cols-3 gap-8 mb-8">
                {/* Recent Content */}
                <div className="xl:col-span-2">
                    <Card className="bg-gray-800/30 backdrop-blur-sm border-gray-700">
                        <CardHeader className="border-b border-gray-700">
                            <div className="flex items-center justify-between">
                                <CardTitle className="text-lg font-semibold text-white flex items-center gap-2">
                                    <Icon icon="heroicons:document-text-16-solid" className="h-5 w-5 text-blue-400" />
                                    Recent Content
                                </CardTitle>
                                {canManageContent && (
                                    <Link href="/dashboard/content">
                                        <Button variant="outline" size="sm" className="bg-gray-800/50 border-gray-700 text-white hover:bg-gray-700">
                                            <Icon icon="heroicons:arrow-top-right-on-square-16-solid" className="mr-2 h-3 w-3" />
                                            View All
                                        </Button>
                                    </Link>
                                )}
                            </div>
                        </CardHeader>
                        <CardContent className="p-6">
                            <div className="space-y-4">
                                {recentContent.length > 0 ? (
                                    recentContent.slice(0, 5).map((content) => (
                                        <div key={content.$id} className="group p-4 rounded-lg border border-gray-700 hover:bg-gray-800/50 transition-colors">
                                            <div className="flex items-start justify-between gap-4">
                                                <div className="flex-1 min-w-0">
                                                    <h3 className="font-medium text-white truncate mb-1">
                                                        {content.title}
                                                    </h3>
                                                    <p className="text-sm text-gray-400 line-clamp-2 mb-3">
                                                        {(() => {
                                                            if (!content.content || content.content.trim() === '' || content.content === '<p>N/A</p>') {
                                                                return 'No preview available';
                                                            }
                                                            const plainText = content.content.replace(/<[^>]*>/g, '').trim();
                                                            if (plainText.length === 0) {
                                                                return 'No preview available';
                                                            }
                                                            return plainText.slice(0, 120) + (plainText.length > 120 ? '...' : '');
                                                        })()}
                                                    </p>
                                                    <div className="flex items-center gap-3 text-xs flex-wrap">
                                                        <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full font-medium ${content.status === 'published'
                                                            ? 'bg-green-500/20 text-green-300 border border-green-500/30'
                                                            : 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                                                            }`}>
                                                            <div className={`w-1.5 h-1.5 rounded-full ${content.status === 'published' ? 'bg-green-500' : 'bg-amber-500'}`}></div>
                                                            {content.status}
                                                        </span>
                                                        <span className="text-gray-400 uppercase text-xs font-medium">
                                                            {content.type}
                                                        </span>
                                                        <span className="text-gray-400">
                                                            {new Date(content.$updatedAt).toLocaleDateString('en-US', {
                                                                month: 'short',
                                                                day: 'numeric'
                                                            })}
                                                        </span>
                                                    </div>
                                                </div>
                                                {canManageContent && (
                                                    <Link href={`/dashboard/content/${content.$id}/edit`}>
                                                        <Button variant="outline" size="sm" className="opacity-0 group-hover:opacity-100 transition-opacity bg-gray-800/50 border-gray-700 text-white hover:bg-gray-700">
                                                            <Icon icon="heroicons:pencil-16-solid" className="h-3 w-3" />
                                                        </Button>
                                                    </Link>
                                                )}
                                            </div>
                                        </div>
                                    ))
                                ) : (
                                    <div className="text-center py-12">
                                        <div className="h-12 w-12 bg-gray-700 rounded-lg flex items-center justify-center mx-auto mb-4">
                                            <Icon icon="heroicons:document-text-16-solid" className="h-6 w-6 text-gray-400" />
                                        </div>
                                        <h3 className="font-medium text-white mb-2">No content available</h3>
                                        <p className="text-gray-400 text-sm mb-4">
                                            Start creating content to see it appear here.
                                        </p>
                                        {canManageContent && (
                                            <Link href="/dashboard/content/new">
                                                <Button size="sm" className="bg-gradient-to-r from-purple-500 to-violet-600 hover:from-purple-600 hover:to-violet-700 text-white">
                                                    <Icon icon="heroicons:plus-16-solid" className="mr-2 h-3 w-3" />
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
                    <Card className="bg-gray-800/30 backdrop-blur-sm border-gray-700">
                        <CardHeader className="border-b border-gray-700">
                            <CardTitle className="text-lg font-semibold text-white flex items-center gap-2">
                                <Icon icon="heroicons:clock-16-solid" className="h-5 w-5 text-purple-400" />
                                Recent Activity
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="p-6">
                            <div className="space-y-4">
                                {recentActivity.length > 0 ? (
                                    recentActivity.slice(0, 8).map((activity) => (
                                        <div key={activity.$id} className="flex items-start gap-3 p-3 rounded-lg hover:bg-gray-800/50 transition-colors">
                                            <div className={`h-8 w-8 rounded-full flex items-center justify-center flex-shrink-0 ${activity.action.includes('create') ? 'bg-green-500/20' :
                                                activity.action.includes('update') ? 'bg-blue-500/20' :
                                                    activity.action.includes('delete') ? 'bg-red-500/20' :
                                                        'bg-purple-500/20'
                                                }`}>
                                                <Icon
                                                    icon={
                                                        activity.action.includes('create') ? 'heroicons:plus-16-solid' :
                                                            activity.action.includes('update') ? 'heroicons:pencil-16-solid' :
                                                                activity.action.includes('delete') ? 'heroicons:trash-16-solid' :
                                                                    'heroicons:eye-16-solid'
                                                    }
                                                    className={`h-4 w-4 ${activity.action.includes('create') ? 'text-green-400' :
                                                        activity.action.includes('update') ? 'text-blue-400' :
                                                            activity.action.includes('delete') ? 'text-red-400' :
                                                                'text-purple-400'
                                                        }`}
                                                />
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <p className="text-sm text-white font-medium mb-1">
                                                    {activity.description}
                                                </p>
                                                <p className="text-xs text-gray-400">
                                                    {new Date(activity.timestamp).toLocaleString()}
                                                </p>
                                            </div>
                                        </div>
                                    ))
                                ) : (
                                    <div className="text-center py-8">
                                        <div className="h-12 w-12 bg-gray-700 rounded-lg flex items-center justify-center mx-auto mb-4">
                                            <Icon icon="heroicons:clock-16-solid" className="h-6 w-6 text-gray-400" />
                                        </div>
                                        <h3 className="font-medium text-white mb-2">No recent activity</h3>
                                        <p className="text-gray-400 text-sm">
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
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                <Link href="/ems" className="group">
                    <Card className="bg-gray-800/30 backdrop-blur-sm border-gray-700 hover:bg-gray-800/40 transition-all duration-200 h-full">
                        <CardContent className="p-6">
                            <div className="flex items-center gap-4 mb-4">
                                <div className="h-12 w-12 bg-red-500/20 rounded-lg flex items-center justify-center group-hover:bg-red-500/30 transition-colors">
                                    <Icon icon="heroicons:heart-16-solid" className="h-6 w-6 text-red-400" />
                                </div>
                                <div>
                                    <h3 className="font-semibold text-white text-lg group-hover:text-red-400 transition-colors">
                                        EMS Portal
                                    </h3>
                                    <p className="text-sm text-gray-400">Access department resources</p>
                                </div>
                            </div>
                            <p className="text-gray-300 text-sm leading-relaxed">
                                Quick access to medical protocols, SOPs, and reference materials.
                            </p>
                        </CardContent>
                    </Card>
                </Link>

                {canManageUsers && (
                    <Link href="/dashboard/users" className="group">
                        <Card className="bg-gray-800/30 backdrop-blur-sm border-gray-700 hover:bg-gray-800/40 transition-all duration-200 h-full">
                            <CardContent className="p-6">
                                <div className="flex items-center gap-4 mb-4">
                                    <div className="h-12 w-12 bg-blue-500/20 rounded-lg flex items-center justify-center group-hover:bg-blue-500/30 transition-colors">
                                        <Icon icon="heroicons:users-16-solid" className="h-6 w-6 text-blue-400" />
                                    </div>
                                    <div>
                                        <h3 className="font-semibold text-white text-lg group-hover:text-blue-400 transition-colors">
                                            User Management
                                        </h3>
                                        <p className="text-sm text-gray-400">Manage department staff</p>
                                    </div>
                                </div>
                                <p className="text-gray-300 text-sm leading-relaxed">
                                    Add, edit, and manage user accounts and permissions.
                                </p>
                            </CardContent>
                        </Card>
                    </Link>
                )}

                <Link href="/dashboard/profile" className="group">
                    <Card className="bg-gray-800/30 backdrop-blur-sm border-gray-700 hover:bg-gray-800/40 transition-all duration-200 h-full">
                        <CardContent className="p-6">
                            <div className="flex items-center gap-4 mb-4">
                                <div className="h-12 w-12 bg-green-500/20 rounded-lg flex items-center justify-center group-hover:bg-green-500/30 transition-colors">
                                    <Icon icon="heroicons:user-16-solid" className="h-6 w-6 text-green-400" />
                                </div>
                                <div>
                                    <h3 className="font-semibold text-white text-lg group-hover:text-green-400 transition-colors">
                                        My Profile
                                    </h3>
                                    <p className="text-sm text-gray-400">Update your information</p>
                                </div>
                            </div>
                            <p className="text-gray-300 text-sm leading-relaxed">
                                Edit your profile, preferences, and account settings.
                            </p>
                        </CardContent>
                    </Card>
                </Link>
            </div>
        </div>
    );
} 