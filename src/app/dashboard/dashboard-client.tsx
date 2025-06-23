"use client";

import Link from 'next/link';
import { Icon } from '@iconify/react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
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
    error?: string;
    status?: number;
}

interface DashboardClientProps {
    initialData: DashboardData;
}

export function DashboardClient({ initialData }: DashboardClientProps) {
    if (initialData.error) {
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
                        <p className="text-red-300 mb-6 leading-relaxed">{initialData.error}</p>
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

    const { user, stats, recentContent } = initialData;
    const canManageContent = user && ['editor', 'admin', 'super_admin'].includes(user.role);
    const canManageUsers = user && ['admin', 'super_admin'].includes(user.role);

    return (
        <div className="relative py-8">
            <div className="container mx-auto px-6 lg:px-8">
                {/* Header */}
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
                        <div className="flex flex-wrap items-center gap-4">
                            {canManageContent && (
                                <Button asChild className="bg-purple-600 hover:bg-purple-700">
                                    <Link href="/dashboard/content/new">
                                        <Icon icon="heroicons:plus-16-solid" className="mr-2 h-4 w-4" />
                                        New Content
                                    </Link>
                                </Button>
                            )}
                            {canManageUsers && (
                                <Button asChild variant="outline">
                                    <Link href="/dashboard/users">
                                        <Icon icon="heroicons:users-16-solid" className="mr-2 h-4 w-4" />
                                        Manage Users
                                    </Link>
                                </Button>
                            )}
                        </div>
                    </div>
                </div>

                {/* Stats Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
                    <Card className="backdrop-blur-sm bg-white/5 border-white/10">
                        <CardContent className="p-6">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm font-medium text-gray-400">Total Content</p>
                                    <p className="text-3xl font-bold text-white">{stats.totalContent}</p>
                                </div>
                                <div className="p-3 bg-purple-500/20 rounded-full">
                                    <Icon icon="heroicons:document-text-16-solid" className="h-6 w-6 text-purple-400" />
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    <Card className="backdrop-blur-sm bg-white/5 border-white/10">
                        <CardContent className="p-6">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm font-medium text-gray-400">Published</p>
                                    <p className="text-3xl font-bold text-white">{stats.publishedContent}</p>
                                </div>
                                <div className="p-3 bg-green-500/20 rounded-full">
                                    <Icon icon="heroicons:eye-16-solid" className="h-6 w-6 text-green-400" />
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    <Card className="backdrop-blur-sm bg-white/5 border-white/10">
                        <CardContent className="p-6">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm font-medium text-gray-400">Drafts</p>
                                    <p className="text-3xl font-bold text-white">{stats.draftContent}</p>
                                </div>
                                <div className="p-3 bg-yellow-500/20 rounded-full">
                                    <Icon icon="heroicons:pencil-16-solid" className="h-6 w-6 text-yellow-400" />
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    <Card className="backdrop-blur-sm bg-white/5 border-white/10">
                        <CardContent className="p-6">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm font-medium text-gray-400">Recent Activity</p>
                                    <p className="text-3xl font-bold text-white">{stats.recentActivity}</p>
                                </div>
                                <div className="p-3 bg-blue-500/20 rounded-full">
                                    <Icon icon="heroicons:clock-16-solid" className="h-6 w-6 text-blue-400" />
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </div>

                {/* Quick Actions Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
                    <Card className="backdrop-blur-sm bg-white/5 border-white/10 hover:bg-white/10 transition-all duration-300">
                        <CardContent className="p-6">
                            <div className="flex items-center gap-4 mb-4">
                                <div className="p-3 bg-purple-500/20 rounded-full">
                                    <Icon icon="heroicons:document-text-16-solid" className="h-6 w-6 text-purple-400" />
                                </div>
                                <div>
                                    <h3 className="text-lg font-semibold text-white">Content Management</h3>
                                    <p className="text-sm text-gray-400">Create and manage content</p>
                                </div>
                            </div>
                            <Button asChild className="w-full bg-purple-600 hover:bg-purple-700">
                                <Link href="/dashboard/content">
                                    <Icon icon="heroicons:arrow-right-16-solid" className="mr-2 h-4 w-4" />
                                    Manage Content
                                </Link>
                            </Button>
                        </CardContent>
                    </Card>

                    {canManageUsers && (
                        <Card className="backdrop-blur-sm bg-white/5 border-white/10 hover:bg-white/10 transition-all duration-300">
                            <CardContent className="p-6">
                                <div className="flex items-center gap-4 mb-4">
                                    <div className="p-3 bg-blue-500/20 rounded-full">
                                        <Icon icon="heroicons:users-16-solid" className="h-6 w-6 text-blue-400" />
                                    </div>
                                    <div>
                                        <h3 className="text-lg font-semibold text-white">User Management</h3>
                                        <p className="text-sm text-gray-400">Manage users and permissions</p>
                                    </div>
                                </div>
                                <Button asChild className="w-full bg-blue-600 hover:bg-blue-700">
                                    <Link href="/dashboard/users">
                                        <Icon icon="heroicons:arrow-right-16-solid" className="mr-2 h-4 w-4" />
                                        Manage Users
                                    </Link>
                                </Button>
                            </CardContent>
                        </Card>
                    )}

                    <Card className="backdrop-blur-sm bg-white/5 border-white/10 hover:bg-white/10 transition-all duration-300">
                        <CardContent className="p-6">
                            <div className="flex items-center gap-4 mb-4">
                                <div className="p-3 bg-green-500/20 rounded-full">
                                    <Icon icon="heroicons:building-office-16-solid" className="h-6 w-6 text-green-400" />
                                </div>
                                <div>
                                    <h3 className="text-lg font-semibold text-white">Departments</h3>
                                    <p className="text-sm text-gray-400">View department information</p>
                                </div>
                            </div>
                            <Button asChild className="w-full bg-green-600 hover:bg-green-700">
                                <Link href="/dashboard/departments">
                                    <Icon icon="heroicons:arrow-right-16-solid" className="mr-2 h-4 w-4" />
                                    View Departments
                                </Link>
                            </Button>
                        </CardContent>
                    </Card>
                </div>

                {/* Recent Content */}
                {recentContent && recentContent.length > 0 && (
                    <Card className="backdrop-blur-sm bg-white/5 border-white/10 mb-8">
                        <CardHeader>
                            <CardTitle className="text-white flex items-center gap-2">
                                <Icon icon="heroicons:clock-16-solid" className="h-5 w-5 text-purple-400" />
                                Recent Content
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-4">
                                {recentContent.slice(0, 5).map((content) => (
                                    <div key={content.$id} className="flex items-center justify-between p-4 bg-gray-800/30 rounded-lg">
                                        <div className="flex-1">
                                            <h4 className="text-white font-medium">{content.title}</h4>
                                            <p className="text-sm text-gray-400">
                                                {content.departmentId} • {content.type}
                                            </p>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <Badge
                                                className={
                                                    content.status === 'published'
                                                        ? 'bg-green-500/20 text-green-300'
                                                        : 'bg-yellow-500/20 text-yellow-300'
                                                }
                                            >
                                                {content.status}
                                            </Badge>
                                            <Button asChild size="sm" variant="ghost">
                                                <Link href={`/dashboard/content/${content.$id}/edit`}>
                                                    <Icon icon="heroicons:pencil-16-solid" className="h-4 w-4" />
                                                </Link>
                                            </Button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </CardContent>
                    </Card>
                )}
            </div>
        </div>
    );
} 