'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { Icon } from '@iconify/react';
import { Button } from '@/components/ui/button';
import { Preloader } from '@/components/ui/preloader';
import { ContentDataTable } from '@/components/content-data-table';
import { getCurrentUser } from '@/lib/auth';
import { getAppwriteSessionToken } from '@/lib/utils';
import { User, Content, ContentStatus } from '@/types';

interface Department {
    $id: string;
    name: string;
}

export default function ContentManagementPage() {
    const [user, setUser] = useState<User | null>(null);
    const [userDepartment, setUserDepartment] = useState<Department | null>(null);
    const [content, setContent] = useState<Content[]>([]);
    const [departments, setDepartments] = useState<Department[]>([]);
    const [loading, setLoading] = useState(true);

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
                setUserDepartment(data.userDepartment as unknown as Department);
                setContent(data.content as unknown as Content[]);

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

    // const canEdit = (contentItem: Content) => {
    //     if (!user) return false;
    //     if (user.role === 'super_admin') return true;
    //     if (user.role === 'admin' && userDepartment && userDepartment.$id === contentItem.departmentId) return true;
    //     if (user.role === 'editor' && userDepartment && userDepartment.$id === contentItem.departmentId) return true;
    //     return false;
    // };

    // const canPublish = (contentItem: Content) => {
    //     if (!user) return false;
    //     if (user.role === 'super_admin') return true;
    //     if (user.role === 'admin' && userDepartment && userDepartment.$id === contentItem.departmentId) return true;
    //     return false;
    // };

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

    // const getDepartmentName = (departmentId: string) => {
    //     const dept = departments.find(d => d.$id === departmentId);
    //     return dept ? dept.name : 'Unknown Department';
    // };

    return (
        <div className="relative py-8">
            <div className="container mx-auto px-6 lg:px-8">
                {/* Enhanced Header */}
                <div className="mb-8">
                    <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
                        <div>
                            <h1 className="text-4xl font-bold text-white mb-3 bg-gradient-to-r from-white to-gray-300 bg-clip-text text-transparent">
                                Content Management
                            </h1>
                            <p className="text-xl text-gray-300">
                                Manage all content across departments
                            </p>
                        </div>

                        {canCreateContent && (
                            <div className="flex gap-3">
                                <Button
                                    asChild
                                    className="bg-gradient-to-r from-purple-600 to-purple-700 hover:from-purple-700 hover:to-purple-800 shadow-lg shadow-purple-500/25 transition-all duration-300 hover:shadow-purple-500/40 hover:scale-105"
                                >
                                    <Link href="/dashboard/content/new" className="flex items-center gap-2">
                                        <Icon icon="heroicons:plus-16-solid" className="h-4 w-4" />
                                        Create Content
                                    </Link>
                                </Button>
                            </div>
                        )}
                    </div>
                </div>

                {/* Content Table */}
                <ContentDataTable
                    data={content}
                    user={user}
                    userDepartment={userDepartment}
                    departments={departments}
                    onDelete={handleDeleteContent}
                    onStatusChange={handleStatusChange}
                />
            </div>
        </div>
    );
} 