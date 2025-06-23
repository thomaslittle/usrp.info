'use client';

import React, { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { Icon } from '@iconify/react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Preloader } from '@/components/ui/preloader';
import { BlockNoteEditorComponent } from '@/components/ui/blocknote-editor';
import { VersionHistory } from '@/components/version-history';
import { getCurrentUser } from '@/lib/auth';
import { getAppwriteSessionToken } from '@/lib/utils';
import { User, ContentType } from '@/types';

// Helper function to convert rich text JSON to markdown
function convertRichTextToMarkdown(doc: any): string {
    if (!doc.content) return '';

    function processNode(node: any): string {
        if (!node) return '';

        if (node.type === 'text') {
            return node.text || '';
        }

        if (node.type === 'paragraph') {
            const content = node.content?.map(processNode).join('') || '';
            return content + '\n\n';
        }

        if (node.type === 'heading') {
            const level = node.attrs?.level || 1;
            const content = node.content?.map(processNode).join('') || '';
            return '#'.repeat(level) + ' ' + content + '\n\n';
        }

        if (node.type === 'bulletList') {
            return node.content?.map((item: any) => {
                const content = item.content?.map(processNode).join('').trim() || '';
                return '- ' + content + '\n';
            }).join('') + '\n';
        }

        if (node.type === 'listItem') {
            return node.content?.map(processNode).join('') || '';
        }

        // Handle other node types by processing their content
        if (node.content) {
            return node.content.map(processNode).join('');
        }

        return '';
    }

    return doc.content.map(processNode).join('').trim();
}

interface ContentFormData {
    title: string;
    slug: string;
    content: string;
    type: ContentType;
    tags: string[];
    status: 'draft' | 'published';
    changesSummary: string;
}

export default function EditContentPage() {
    const [user, setUser] = useState<User | null>(null);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [contentItem, setContentItem] = useState<any>(null);
    const [activeTab, setActiveTab] = useState<'edit' | 'history'>('edit');
    const [formData, setFormData] = useState<ContentFormData>({
        title: '',
        slug: '',
        content: '',
        type: 'sop',
        tags: [],
        status: 'draft',
        changesSummary: ''
    });
    const [tagInput, setTagInput] = useState('');
    const router = useRouter();
    const params = useParams();
    const contentId = params.id as string;

    useEffect(() => {
        const initUserAndContent = async () => {
            try {
                const authUser = await getCurrentUser();
                if (!authUser) {
                    router.push('/auth/login');
                    return;
                }

                // Get user profile via API
                const userResponse = await fetch(`/api/users/profile?email=${encodeURIComponent(authUser.email)}`);
                if (!userResponse.ok) {
                    router.push('/auth/login');
                    return;
                }
                const userData = await userResponse.json();
                setUser(userData.user as User);
                const userTyped = userData.user as User;

                // Load the content to edit via API
                const contentResponse = await fetch(`/api/content/${contentId}`);
                if (!contentResponse.ok) {
                    router.push('/dashboard/content?error=Content not found');
                    return;
                }
                const contentData = await contentResponse.json();
                const content = contentData.content;

                // Check if user can edit this content
                if (content.authorId !== userTyped.userId &&
                    !['admin', 'super_admin'].includes(userTyped.role)) {
                    router.push('/dashboard/content?error=Permission denied');
                    return;
                }

                setContentItem(content);

                // Parse content JSON if it exists
                let parsedContent = content.content;
                try {
                    const contentObj = JSON.parse(content.content);

                    // Handle different content structures
                    if (typeof contentObj === 'object') {
                        if (contentObj.content && typeof contentObj.content === 'string') {
                            parsedContent = contentObj.content;
                        } else if (contentObj.type === 'doc' && contentObj.content) {
                            parsedContent = convertRichTextToMarkdown(contentObj);
                        } else if (typeof contentObj === 'string') {
                            parsedContent = contentObj;
                        } else {
                            parsedContent = JSON.stringify(contentObj, null, 2);
                        }
                    }
                } catch (e) {
                    // Not JSON, use as is
                }

                setFormData({
                    title: content.title,
                    slug: content.slug,
                    content: parsedContent,
                    type: content.type,
                    tags: content.tags || [],
                    status: content.status,
                    changesSummary: ''
                });

            } catch (error) {
                console.error('Error loading user and content:', error);
                router.push('/dashboard/content?error=Failed to load content');
            } finally {
                setLoading(false);
            }
        };

        if (contentId) {
            initUserAndContent();
        }
    }, [router, contentId]);

    const handleInputChange = (field: keyof ContentFormData, value: any) => {
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
        if (!user || !contentItem) return;

        setSaving(true);

        try {
            const updateData = {
                title: formData.title,
                slug: formData.slug,
                content: formData.content,
                type: formData.type,
                status: formData.status,
                tags: formData.tags,
                changesSummary: formData.changesSummary,
                version: (contentItem.version || 1) + 1,
                updatedAt: new Date().toISOString(),
                ...(formData.status === 'published' && !contentItem.publishedAt && { publishedAt: new Date().toISOString() })
            };

            // Get session token from localStorage for authentication
            const sessionToken = getAppwriteSessionToken();

            const response = await fetch(`/api/content/${contentId}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    ...(sessionToken && { 'X-Fallback-Cookies': sessionToken })
                },
                body: JSON.stringify(updateData)
            });

            if (!response.ok) {
                throw new Error('Failed to update content');
            }

            router.push('/dashboard/content?message=Content updated successfully');
        } catch (error) {
            console.error('Error updating content:', error);
            alert('Failed to update content. Please try again.');
        } finally {
            setSaving(false);
        }
    };

    const handleVersionRestored = () => {
        // Refresh the page to load the restored content
        window.location.reload();
    };

    if (loading) {
        return (
            <div className="p-6">
                <Preloader
                    text="Loading content editor..."
                    size="md"
                />
            </div>
        );
    }

    if (!user || !contentItem) {
        return (
            <div className="p-6">
                <Card className="bg-gray-800 border-gray-800">
                    <CardContent className="p-12">
                        <div className="text-center">
                            <Icon icon="heroicons:no-symbol-16-solid" className="h-16 w-16 mx-auto mb-4 text-red-500" />
                            <h3 className="text-lg font-medium text-white mb-2">Error</h3>
                            <p className="text-gray-400">Could not load content or user data.</p>
                        </div>
                    </CardContent>
                </Card>
            </div>
        );
    }

    return (
        <div className="p-6 space-y-6 z-50">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold text-white">Edit Content</h1>
                    <p className="text-gray-400">
                        Editing: {contentItem.title} (v{contentItem.version})
                    </p>
                </div>
                <div className="flex items-center gap-3">
                    {/* Tab Navigation */}
                    <div className="flex rounded-lg bg-slate-800 border border-slate-700 p-1">
                        <Button
                            type="button"
                            variant={activeTab === 'edit' ? 'default' : 'ghost'}
                            size="sm"
                            onClick={() => setActiveTab('edit')}
                            className={activeTab === 'edit' ? 'bg-purple-600 text-white' : 'text-slate-300 hover:text-white'}
                        >
                            <Icon icon="heroicons:pencil" className="h-4 w-4 mr-2" />
                            Edit
                        </Button>
                        <Button
                            type="button"
                            variant={activeTab === 'history' ? 'default' : 'ghost'}
                            size="sm"
                            onClick={() => setActiveTab('history')}
                            className={activeTab === 'history' ? 'bg-purple-600 text-white' : 'text-slate-300 hover:text-white'}
                        >
                            <Icon icon="heroicons:clock" className="h-4 w-4 mr-2" />
                            History
                        </Button>
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
            </div>

            {/* Tab Content */}
            {activeTab === 'edit' ? (
                /* Content Form */
                <form onSubmit={handleSubmit} className="space-y-6">
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                        {/* Main Content */}
                        <div className="lg:col-span-2 space-y-6">
                            <Card className="bg-gray-800 border-gray-800">
                                <CardHeader>
                                    <CardTitle className="text-white">Content Details</CardTitle>
                                </CardHeader>
                                <CardContent className="space-y-4">
                                    <div className="space-y-2">
                                        <Label htmlFor="title" className="text-gray-300">Title *</Label>
                                        <Input
                                            id="title"
                                            type="text"
                                            value={formData.title}
                                            onChange={(e) => handleInputChange('title', e.target.value)}
                                            className="bg-gray-700 border-gray-600 text-white placeholder-gray-400 focus:ring-purple-500"
                                            placeholder="Enter content title"
                                            required
                                        />
                                    </div>

                                    <div className="space-y-2">
                                        <Label htmlFor="slug" className="text-gray-300">Slug</Label>
                                        <Input
                                            id="slug"
                                            type="text"
                                            value={formData.slug}
                                            onChange={(e) => handleInputChange('slug', e.target.value)}
                                            className="bg-gray-700 border-gray-600 text-white placeholder-gray-400 focus:ring-purple-500"
                                            placeholder="url-friendly-slug"
                                        />
                                        <p className="text-xs text-gray-500">
                                            URL: /{user.department}/{formData.type}/{formData.slug || 'slug'}
                                        </p>
                                    </div>

                                    <div className="space-y-2">
                                        <Label htmlFor="changesSummary" className="text-gray-300">Changes Summary</Label>
                                        <Textarea
                                            id="changesSummary"
                                            value={formData.changesSummary}
                                            onChange={(e) => handleInputChange('changesSummary', e.target.value)}
                                            className="bg-gray-700 border-gray-600 text-white placeholder-gray-400 focus:ring-purple-500"
                                            placeholder="Briefly describe what changes you made..."
                                            rows={3}
                                        />
                                        <p className="text-xs text-gray-500">
                                            This will help other users understand what changed in this version.
                                        </p>
                                    </div>
                                </CardContent>
                            </Card>

                            <Card className="bg-gray-800 border-gray-800">
                                <CardHeader>
                                    <CardTitle className="text-white">Content</CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <div className="space-y-2">
                                        <Label htmlFor="content" className="text-gray-300">Content</Label>
                                        <BlockNoteEditorComponent
                                            value={formData.content}
                                            onChange={(value: string) => handleInputChange('content', value)}
                                            placeholder="Edit your content..."
                                        />

                                    </div>
                                </CardContent>
                            </Card>
                        </div>

                        {/* Sidebar */}
                        <div className="space-y-6">
                            <Card className="bg-gray-800 border-gray-800">
                                <CardHeader>
                                    <CardTitle className="text-white">Settings</CardTitle>
                                </CardHeader>
                                <CardContent className="space-y-4">
                                    <div className="space-y-2">
                                        <Label htmlFor="type" className="text-gray-300">Content Type *</Label>
                                        <Select
                                            value={formData.type}
                                            onValueChange={(value) => handleInputChange('type', value as ContentType)}
                                        >
                                            <SelectTrigger className="bg-gray-700 border-gray-600 text-white focus:ring-purple-500">
                                                <SelectValue placeholder="Select content type" />
                                            </SelectTrigger>
                                            <SelectContent className="bg-gray-700 border-gray-600">
                                                <SelectItem value="sop">Standard Operating Procedure</SelectItem>
                                                <SelectItem value="guide">Guide</SelectItem>
                                                <SelectItem value="announcement">Announcement</SelectItem>
                                                <SelectItem value="resource">Resource</SelectItem>
                                                <SelectItem value="training">Training Material</SelectItem>
                                            </SelectContent>
                                        </Select>
                                    </div>

                                    <div className="space-y-2">
                                        <Label htmlFor="status" className="text-gray-300">Status</Label>
                                        <Select
                                            value={formData.status}
                                            onValueChange={(value) => handleInputChange('status', value as 'draft' | 'published')}
                                        >
                                            <SelectTrigger className="bg-gray-700 border-gray-600 text-white focus:ring-purple-500">
                                                <SelectValue placeholder="Select status" />
                                            </SelectTrigger>
                                            <SelectContent className="bg-gray-700 border-gray-600">
                                                <SelectItem value="draft">Draft</SelectItem>
                                                {(user.role === 'admin' || user.role === 'super_admin') && (
                                                    <SelectItem value="published">Published</SelectItem>
                                                )}
                                            </SelectContent>
                                        </Select>
                                    </div>
                                </CardContent>
                            </Card>

                            <Card className="bg-gray-800 border-gray-800">
                                <CardHeader>
                                    <CardTitle className="text-white">Tags</CardTitle>
                                </CardHeader>
                                <CardContent className="space-y-4">
                                    <div className="space-y-2">
                                        <div className="flex space-x-2">
                                            <Input
                                                type="text"
                                                value={tagInput}
                                                onChange={(e) => setTagInput(e.target.value)}
                                                onKeyPress={(e: React.KeyboardEvent<HTMLInputElement>) => e.key === 'Enter' && (e.preventDefault(), handleAddTag())}
                                                className="flex-1 bg-gray-700 border-gray-600 text-white placeholder-gray-400 focus:ring-purple-500"
                                                placeholder="Add a tag..."
                                            />
                                            <Button
                                                type="button"
                                                onClick={handleAddTag}
                                                className="bg-purple-600 hover:bg-purple-700"
                                            >
                                                Add
                                            </Button>
                                        </div>
                                        <div className="flex flex-wrap gap-2">
                                            {formData.tags.map((tag) => (
                                                <span
                                                    key={tag}
                                                    className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-purple-100 text-purple-800"
                                                >
                                                    {tag}
                                                    <button
                                                        type="button"
                                                        onClick={() => handleRemoveTag(tag)}
                                                        className="ml-1 text-purple-600 hover:text-purple-800"
                                                    >
                                                        <Icon icon="heroicons:x-mark-16-solid" className="h-3 w-3" />
                                                    </button>
                                                </span>
                                            ))}
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>

                            <Card className="bg-gray-800 border-gray-800">
                                <CardContent className="p-4">
                                    <div className="space-y-3">
                                        <Button
                                            type="submit"
                                            disabled={saving || !formData.title.trim()}
                                            className="w-full bg-purple-600 hover:bg-purple-700 disabled:opacity-50"
                                        >
                                            {saving ? (
                                                <>
                                                    <div className="mr-2 h-4 w-4 inline-block relative">
                                                        <span className="absolute inline-block w-full h-full rounded-full bg-white animate-[loader3_1.5s_linear_infinite]" />
                                                        <span className="absolute inline-block w-full h-full rounded-full bg-white animate-[loader3_1.5s_linear_infinite] [animation-delay:-0.9s]" />
                                                    </div>
                                                    Updating...
                                                </>
                                            ) : (
                                                <>
                                                    <Icon icon="heroicons:document-check-16-solid" className="mr-2 h-4 w-4" />
                                                    Update Content
                                                </>
                                            )}
                                        </Button>

                                        <Button
                                            type="button"
                                            variant="outline"
                                            onClick={() => router.push(`/ems/${contentItem.type}/${contentItem.slug}`)}
                                            className="w-full border-gray-600 text-gray-300 hover:bg-gray-700"
                                        >
                                            <Icon icon="heroicons:eye-16-solid" className="mr-2 h-4 w-4" />
                                            Preview
                                        </Button>
                                    </div>
                                </CardContent>
                            </Card>
                        </div>
                    </div>
                </form>
            ) : (
                /* Version History */
                <VersionHistory
                    contentId={contentId}
                    onVersionRestored={handleVersionRestored}
                />
            )}
        </div>
    );
}