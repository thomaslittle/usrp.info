'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Icon } from '@iconify/react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Preloader } from '@/components/ui/preloader';
import { BlockNoteEditorComponent } from '@/components/ui/blocknote-editor';
import { getCurrentUser } from '@/lib/auth';
import { getAppwriteSessionToken } from '@/lib/utils';
import { User, ContentType } from '@/types';
import { ID } from 'appwrite';

interface ContentFormData {
    title: string;
    slug: string;
    content: string;
    type: ContentType;
    tags: string[];
    status: 'draft' | 'published';
}

export default function NewContentPage() {
    const [user, setUser] = useState<User | null>(null);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [formData, setFormData] = useState<ContentFormData>({
        title: '',
        slug: '',
        content: '',
        type: 'sop',
        tags: [],
        status: 'draft'
    });
    const [tagInput, setTagInput] = useState('');
    const router = useRouter();

    useEffect(() => {
        const initUser = async () => {
            try {
                const authUser = await getCurrentUser();
                if (!authUser) {
                    router.push('/auth/login');
                    return;
                }

                // Use API route to get user profile
                const response = await fetch(`/api/users/profile?email=${encodeURIComponent(authUser.email)}`);
                if (response.ok) {
                    const data = await response.json();
                    setUser(data.user as User);
                } else {
                    router.push('/auth/login');
                    return;
                }
            } catch (error) {
                console.error('Error loading user:', error);
                router.push('/auth/login');
            } finally {
                setLoading(false);
            }
        };

        initUser();
    }, [router]);

    // Generate slug from title
    useEffect(() => {
        if (formData.title) {
            const slug = formData.title
                .toLowerCase()
                .replace(/[^a-z0-9\s-]/g, '')
                .replace(/\s+/g, '-')
                .replace(/-+/g, '-')
                .trim();
            setFormData(prev => ({ ...prev, slug }));
        }
    }, [formData.title]);

    const handleInputChange = (field: keyof ContentFormData, value: string | ContentType | string[]) => {
        setFormData(prev => ({ ...prev, [field]: value }));
    };

    const handleAddTag = () => {
        if (tagInput.trim() && !formData.tags.includes(tagInput.trim())) {
            setFormData(prev => ({
                ...prev,
                tags: [...prev.tags, tagInput.trim()]
            }));
            setTagInput('');
        }
    };

    const handleRemoveTag = (tagToRemove: string) => {
        setFormData(prev => ({
            ...prev,
            tags: prev.tags.filter(tag => tag !== tagToRemove)
        }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!user) return;

        setSaving(true);

        try {
            // Convert content to JSON format
            const contentJson = JSON.stringify({
                type: 'markdown',
                content: formData.content
            });

            // Find department ID from user's department slug
            const deptResponse = await fetch(`/api/departments?slug=${user.department}`);
            if (!deptResponse.ok) throw new Error('Could not find department');
            const deptData = await deptResponse.json();
            const department = deptData.departments[0];
            if (!department) throw new Error('Department not found');

            const contentData = {
                contentId: ID.unique(),
                departmentId: department.$id,
                title: formData.title,
                slug: formData.slug,
                content: contentJson,
                type: formData.type,
                status: formData.status,
                authorId: user.userId,
                tags: formData.tags,
                version: 1,
                createdAt: new Date().toISOString(),
                updatedAt: new Date().toISOString(),
                ...(formData.status === 'published' && { publishedAt: new Date().toISOString() })
            };

            // Get session token from localStorage for authentication
            const sessionToken = getAppwriteSessionToken();

            const response = await fetch('/api/content', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    ...(sessionToken && { 'X-Fallback-Cookies': sessionToken })
                },
                body: JSON.stringify({ contentData })
            });

            if (!response.ok) {
                throw new Error('Failed to create content');
            }

            router.push('/dashboard/content?message=Content created successfully');
        } catch (error) {
            console.error('Error creating content:', error);
            alert('Failed to create content. Please try again.');
        } finally {
            setSaving(false);
        }
    };

    if (loading) {
        return (
            <div className="p-6">
                <Preloader
                    text="Loading editor..."
                    size="md"
                />
            </div>
        );
    }

    if (!user || !['editor', 'admin', 'super_admin'].includes(user.role)) {
        return (
            <div className="p-6">
                <Card className="bg-gray-800 border-gray-800">
                    <CardContent className="p-12">
                        <div className="text-center">
                            <Icon icon="heroicons:no-symbol-16-solid" className="h-16 w-16 mx-auto mb-4 text-red-500" />
                            <h3 className="text-lg font-medium text-white mb-2">Access Denied</h3>
                            <p className="text-gray-400">You don&apos;t have permission to create content.</p>
                        </div>
                    </CardContent>
                </Card>
            </div>
        );
    }

    return (
        <div className="p-6 space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold text-white">Create New Content</h1>
                    <p className="text-gray-400">Create content for the {user.department.toUpperCase()} department</p>
                </div>
                <Button
                    variant="outline"
                    onClick={() => router.back()}
                    className="border-gray-600 text-gray-300"
                >
                    <Icon icon="heroicons:arrow-left-16-solid" className="mr-2 h-4 w-4" />
                    Back
                </Button>
            </div>

            {/* Content Form */}
            <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* Main Content */}
                    <div className="lg:col-span-2 space-y-6">
                        <Card className="bg-gray-800 border-gray-800">
                            <CardHeader>
                                <CardTitle className="text-white">Main Content</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="space-y-4">
                                    <div className="space-y-2">
                                        <Label htmlFor="title" className="text-gray-300 mb-2">Title</Label>
                                        <Input
                                            id="title"
                                            type="text"
                                            value={formData.title}
                                            onChange={(e) => handleInputChange('title', e.target.value)}
                                            required
                                            className="bg-gray-700 border-gray-600 text-white"
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="slug" className="text-gray-300 mb-2">Slug (URL)</Label>
                                        <Input
                                            id="slug"
                                            type="text"
                                            value={formData.slug}
                                            onChange={(e) => handleInputChange('slug', e.target.value)}
                                            required
                                            className="bg-gray-700 border-gray-600 text-white"
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="content" className="text-gray-300 mb-2">Content</Label>
                                        <BlockNoteEditorComponent
                                            value={formData.content}
                                            onChange={(value: string) => handleInputChange('content', value)}
                                            placeholder="Start writing your content..."
                                        />
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    </div>

                    {/* Metadata */}
                    <div className="space-y-6">
                        <Card className="bg-gray-800 border-gray-800">
                            <CardHeader>
                                <CardTitle className="text-white">Publish</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="space-y-4">
                                    <Select
                                        value={formData.status}
                                        onValueChange={(value) => handleInputChange('status', value)}
                                    >
                                        <SelectTrigger className="bg-gray-700 border-gray-600 text-white">
                                            <SelectValue />
                                        </SelectTrigger>
                                        <SelectContent className="bg-gray-800 border-gray-800 text-white">
                                            <SelectItem value="draft">Draft</SelectItem>
                                            <SelectItem value="published">Publish</SelectItem>
                                        </SelectContent>
                                    </Select>
                                    <Button
                                        type="submit"
                                        disabled={saving}
                                        className="w-full bg-gradient-to-r from-purple-500 to-violet-600 text-white"
                                    >
                                        {saving ? (
                                            <>
                                                <Icon icon="lucide:loader-2" className="mr-2 h-4 w-4 animate-spin" />
                                                Saving...
                                            </>
                                        ) : (
                                            <>
                                                <Icon icon="heroicons:check-16-solid" className="mr-2 h-4 w-4" />
                                                Save Content
                                            </>
                                        )}
                                    </Button>
                                </div>
                            </CardContent>
                        </Card>
                        <Card className="bg-gray-800 border-gray-800">
                            <CardHeader>
                                <CardTitle className="text-white">Metadata</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="space-y-4">
                                    <div className="space-y-2">
                                        <Label htmlFor="type" className="text-gray-300 mb-2">Type</Label>
                                        <Select
                                            value={formData.type}
                                            onValueChange={(value) => handleInputChange('type', value)}
                                        >
                                            <SelectTrigger className="bg-gray-700 border-gray-600 text-white">
                                                <SelectValue />
                                            </SelectTrigger>
                                            <SelectContent className="bg-gray-800 border-gray-800 text-white">
                                                <SelectItem value="sop">SOP</SelectItem>
                                                <SelectItem value="guideline">Guideline</SelectItem>
                                                <SelectItem value="announcement">Announcement</SelectItem>
                                                <SelectItem value="policy">Policy</SelectItem>
                                                <SelectItem value="training">Training</SelectItem>
                                                <SelectItem value="resource">Resource</SelectItem>
                                            </SelectContent>
                                        </Select>
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="tags" className="text-gray-300 mb-2">Tags</Label>
                                        <div className="flex items-center space-x-2">
                                            <Input
                                                id="tags"
                                                type="text"
                                                value={tagInput}
                                                onChange={(e) => setTagInput(e.target.value)}
                                                onKeyDown={(e) => {
                                                    if (e.key === 'Enter') {
                                                        e.preventDefault();
                                                        handleAddTag();
                                                    }
                                                }}
                                                className="bg-gray-700 border-gray-600 text-white"
                                            />
                                            <Button type="button" onClick={handleAddTag} className="bg-purple-600 hover:bg-purple-700 text-white">Add</Button>
                                        </div>
                                        <div className="mt-2 flex flex-wrap gap-2">
                                            {formData.tags.map(tag => (
                                                <div key={tag} className="flex items-center bg-gray-600 rounded-full px-3 py-1 text-sm text-white">
                                                    <span>{tag}</span>
                                                    <button
                                                        type="button"
                                                        onClick={() => handleRemoveTag(tag)}
                                                        className="ml-2 text-gray-400 hover:text-white"
                                                    >
                                                        <Icon icon="heroicons:x-mark-16-solid" className="h-3 w-3" />
                                                    </button>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    </div>
                </div>
            </form>
        </div>
    );
} 