'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { Icon } from '@iconify/react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Preloader } from '@/components/ui/preloader';
import { getCurrentUser } from '@/lib/auth';
import { getAppwriteSessionToken } from '@/lib/utils';
import { User, Content, ContentType, ContentStatus } from '@/types';

const contentTypeColors: { [key in ContentType | string]: string } = {
    sop: 'bg-blue-200 text-blue-800 dark:bg-blue-900/50 dark:text-blue-300',
    guide: 'bg-green-200 text-green-800 dark:bg-green-900/50 dark:text-green-300',
    announcement: 'bg-yellow-200 text-yellow-800 dark:bg-yellow-900/50 dark:text-yellow-300',
    resource: 'bg-purple-200 text-purple-800 dark:bg-purple-900/50 dark:text-purple-300',
    training: 'bg-red-200 text-red-800 dark:bg-red-900/50 dark:text-red-300',
    policy: 'bg-indigo-200 text-indigo-800 dark:bg-indigo-900/50 dark:text-indigo-300',
};

const statusColors: { [key in ContentStatus]: string } = {
    draft: 'bg-gray-200 text-gray-800 dark:bg-gray-700 dark:text-gray-200',
    published: 'bg-green-200 text-green-800 dark:bg-green-900/50 dark:text-green-300',
    archived: 'bg-red-200 text-red-800 dark:bg-red-900/50 dark:text-red-300',
};

export default function ContentManagementPage() {
    const [user, setUser] = useState<User | null>(null);
    const [userDepartment, setUserDepartment] = useState<any>(null);
    const [content, setContent] = useState<Content[]>([]);
    const [filteredContent, setFilteredContent] = useState<Content[]>([]);
    const [departments, setDepartments] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [filters, setFilters] = useState({
        type: 'all' as ContentType | 'all',
        status: 'all' as ContentStatus | 'all',
        search: ''
    });

    useEffect(() => {
        const loadContent = async () => {
            try {
                const currentUser = await getCurrentUser();
                if (!currentUser) return;

                // Get session token from localStorage for authentication
                const sessionToken = getAppwriteSessionToken();

                // Use API route to get content with proper permissions
                const response = await fetch(`/api/content?email=${encodeURIComponent(currentUser.email)}`, {
                    headers: {
                        ...(sessionToken && { 'X-Fallback-Cookies': sessionToken })
                    }
                });
                if (!response.ok) {
                    throw new Error('Failed to fetch content');
                }

                const data = await response.json();
                setUser(data.user as unknown as User);
                setUserDepartment(data.userDepartment);
                setContent(data.content as unknown as Content[]);
                setFilteredContent(data.content as unknown as Content[]);

                // Load departments for super admins to show department names
                if (data.user.role === 'super_admin') {
                    const deptResponse = await fetch('/api/departments', {
                        headers: {
                            ...(sessionToken && { 'X-Fallback-Cookies': sessionToken })
                        }
                    });
                    if (deptResponse.ok) {
                        const deptData = await deptResponse.json();
                        setDepartments(deptData.departments);
                    }
                }
            } catch (error) {
                console.error('Error loading content:', error);
            } finally {
                setLoading(false);
            }
        };

        loadContent();
    }, []);

    useEffect(() => {
        // Apply filters
        let filtered = content;

        if (filters.type !== 'all') {
            filtered = filtered.filter(item => item.type === filters.type);
        }

        if (filters.status !== 'all') {
            filtered = filtered.filter(item => item.status === filters.status);
        }

        if (filters.search) {
            filtered = filtered.filter(item =>
                item.title.toLowerCase().includes(filters.search.toLowerCase()) ||
                item.slug.toLowerCase().includes(filters.search.toLowerCase())
            );
        }

        setFilteredContent(filtered);
    }, [content, filters]);

    const handleDeleteContent = async (contentId: string) => {
        if (!confirm('Are you sure you want to delete this content?')) return;

        try {
            // Get session token from localStorage for authentication
            const sessionToken = getAppwriteSessionToken();

            const response = await fetch(`/api/content/${contentId}`, {
                method: 'DELETE',
                headers: {
                    ...(sessionToken && { 'X-Fallback-Cookies': sessionToken })
                }
            });

            if (!response.ok) {
                throw new Error('Failed to delete content');
            }

            setContent(prev => prev.filter(item => item.$id !== contentId));
        } catch (error) {
            console.error('Error deleting content:', error);
            alert('Failed to delete content');
        }
    };

    const handleStatusChange = async (contentId: string, newStatus: ContentStatus) => {
        try {
            // Get session token from localStorage for authentication
            const sessionToken = getAppwriteSessionToken();

            const response = await fetch(`/api/content/${contentId}`, {
                method: 'PATCH',
                headers: {
                    'Content-Type': 'application/json',
                    ...(sessionToken && { 'X-Fallback-Cookies': sessionToken })
                },
                body: JSON.stringify({ status: newStatus }),
            });

            if (!response.ok) {
                throw new Error('Failed to update content status');
            }

            setContent(prev => prev.map(item =>
                item.$id === contentId ? { ...item, status: newStatus } : item
            ));
        } catch (error) {
            console.error('Error updating content status:', error);
            alert('Failed to update content status');
        }
    };

    const canEdit = (contentItem: Content) => {
        if (!user) return false;
        if (user.role === 'super_admin') return true;
        if (user.role === 'admin' && userDepartment && userDepartment.$id === contentItem.departmentId) return true;
        if (user.role === 'editor' && userDepartment && userDepartment.$id === contentItem.departmentId) return true;
        return false;
    };

    const canPublish = (contentItem: Content) => {
        if (!user) return false;
        if (user.role === 'super_admin') return true;
        if (user.role === 'admin' && userDepartment && userDepartment.$id === contentItem.departmentId) return true;
        return false;
    };

    if (loading) {
        return (
            <div className="p-6">
                <Preloader
                    text="Loading content..."
                    size="md"
                />
            </div>
        );
    }

    const canCreateContent = user && ['editor', 'admin', 'super_admin'].includes(user.role);

    const getDepartmentName = (departmentId: string) => {
        const dept = departments.find(d => d.$id === departmentId);
        return dept ? dept.name : 'Unknown Department';
    };

    return (
        <div className="p-6 space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold text-white">Content Management</h1>
                    <p className="text-gray-400">
                        {user?.role === 'super_admin'
                            ? 'Manage all content across departments'
                            : 'Manage your department\'s content'
                        }
                    </p>
                </div>
                {canCreateContent && (
                    <Link href="/dashboard/content/new">
                        <Button className="bg-purple-600 hover:bg-purple-700">
                            <Icon icon="heroicons:plus-16-solid" className="mr-2 h-4 w-4" />
                            Create Content
                        </Button>
                    </Link>
                )}
            </div>

            {/* Filters */}
            <div className="flex items-center justify-between gap-4">
                <div className="w-full max-w-sm">
                    <Input
                        type="text"
                        placeholder="Search content..."
                        value={filters.search}
                        onChange={(e) => setFilters(prev => ({ ...prev, search: e.target.value }))}
                        className="bg-slate-800 border-slate-700 text-white placeholder-slate-400 focus:ring-purple-500 w-full"
                    />
                </div>
                <div className="flex items-center gap-4">
                    <Select
                        value={filters.type}
                        onValueChange={(value) => setFilters(prev => ({ ...prev, type: value as ContentType | 'all' }))}
                    >
                        <SelectTrigger className="bg-slate-800 border-slate-700 text-white focus:ring-purple-500 w-[180px]">
                            <SelectValue placeholder="All Types" />
                        </SelectTrigger>
                        <SelectContent className="bg-slate-800 border-slate-700 text-white">
                            <SelectItem value="all">All Types</SelectItem>
                            <SelectItem value="sop">SOP</SelectItem>
                            <SelectItem value="guide">Guide</SelectItem>
                            <SelectItem value="announcement">Announcement</SelectItem>
                            <SelectItem value="resource">Resource</SelectItem>
                            <SelectItem value="training">Training</SelectItem>
                            <SelectItem value="policy">Policy</SelectItem>
                        </SelectContent>
                    </Select>
                    <Select
                        value={filters.status}
                        onValueChange={(value) => setFilters(prev => ({ ...prev, status: value as ContentStatus | 'all' }))}
                    >
                        <SelectTrigger className="bg-slate-800 border-slate-700 text-white focus:ring-purple-500 w-[180px]">
                            <SelectValue placeholder="All Status" />
                        </SelectTrigger>
                        <SelectContent className="bg-slate-800 border-slate-700 text-white">
                            <SelectItem value="all">All Status</SelectItem>
                            <SelectItem value="draft">Draft</SelectItem>
                            <SelectItem value="published">Published</SelectItem>
                            <SelectItem value="archived">Archived</SelectItem>
                        </SelectContent>
                    </Select>
                    <div className="px-4 py-2 bg-slate-800 border border-slate-700 rounded-md text-sm text-white w-[120px] text-center">
                        {filteredContent.length} {filteredContent.length === 1 ? 'item' : 'items'}
                    </div>
                </div>
            </div>

            {/* Content List */}
            <div className="space-y-4">
                {filteredContent.map(item => (
                    <div key={item.$id} className="bg-slate-800/50 border border-slate-700 rounded-lg p-4 flex items-center justify-between">
                        <div className="flex-grow">
                            <div className="flex items-center gap-x-3">
                                <h2 className="text-lg font-bold text-white">{item.title}</h2>
                                <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${contentTypeColors[item.type] || 'bg-gray-100 text-gray-800'}`}>
                                    {item.type.toUpperCase()}
                                </span>
                                <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${statusColors[item.status] || 'bg-gray-100 text-gray-800'}`}>
                                    {item.status.toUpperCase()}
                                </span>
                            </div>
                            <p className="text-sm text-slate-400 mt-1">/{item.slug}</p>
                            <p className="text-xs text-slate-500 mt-1">
                                Version {item.version} &bull;
                                Updated {new Date(item.$updatedAt).toLocaleDateString()}
                                {item.publishedAt && ` • Published ${new Date(item.publishedAt).toLocaleDateString()}`}
                            </p>
                            {user?.role === 'super_admin' && (
                                <p className="text-xs text-purple-400 mt-1">
                                    Department: {getDepartmentName(item.departmentId)}
                                </p>
                            )}
                        </div>

                        <div className="flex items-center gap-x-2 flex-shrink-0 ml-4">
                            {canPublish(item) && (
                                <Button
                                    variant="ghost"
                                    size="sm"
                                    className="text-slate-300 hover:bg-slate-700 hover:text-white"
                                    onClick={() => handleStatusChange(item.$id, item.status === 'published' ? 'draft' : 'published')}
                                >
                                    <Icon icon={item.status === 'published' ? 'heroicons:eye-slash' : 'heroicons:eye'} className="mr-2 h-4 w-4" />
                                    {item.status === 'published' ? 'Unpublish' : 'Publish'}
                                </Button>
                            )}
                            {canEdit(item) && (
                                <Link href={`/dashboard/content/${item.$id}/edit`}>
                                    <Button variant="ghost" size="sm" className="text-slate-300 hover:bg-slate-700 hover:text-white">
                                        <Icon icon="heroicons:pencil-square" className="mr-2 h-4 w-4" />
                                        Edit
                                    </Button>
                                </Link>
                            )}
                            <Link href={`/ems/${item.type}/${item.slug}`} target="_blank">
                                <Button variant="ghost" size="sm" className="text-slate-300 hover:bg-slate-700 hover:text-white">
                                    <Icon icon="heroicons:arrow-top-right-on-square" className="mr-2 h-4 w-4" />
                                    View
                                </Button>
                            </Link>
                            {canEdit(item) && (
                                <Button
                                    variant="ghost"
                                    size="sm"
                                    className="text-red-400 hover:bg-red-500/10 hover:text-red-400"
                                    onClick={() => handleDeleteContent(item.$id)}
                                >
                                    <Icon icon="heroicons:trash" className="h-4 w-4" />
                                </Button>
                            )}
                        </div>
                    </div>
                ))}
            </div>

            {filteredContent.length === 0 && (
                <div className="text-center py-10">
                    <p className="text-gray-400">No content found.</p>
                </div>
            )}
        </div>
    );
} 