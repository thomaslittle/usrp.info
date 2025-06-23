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
function convertRichTextToMarkdown(doc: unknown): string {
    const docTyped = doc as { content?: unknown[] };
    if (!docTyped.content) return '';

    function processNode(node: unknown): string {
        if (!node) return '';

        const nodeTyped = node as {
            type?: string;
            text?: string;
            content?: unknown[];
            attrs?: { level?: number }
        };

        if (nodeTyped.type === 'text') {
            return nodeTyped.text || '';
        }

        if (nodeTyped.type === 'paragraph') {
            const content = nodeTyped.content?.map(processNode).join('') || '';
            return content + '\n\n';
        }

        if (nodeTyped.type === 'heading') {
            const level = nodeTyped.attrs?.level || 1;
            const content = nodeTyped.content?.map(processNode).join('') || '';
            return '#'.repeat(level) + ' ' + content + '\n\n';
        }

        if (nodeTyped.type === 'bulletList') {
            return nodeTyped.content?.map((item: unknown) => {
                const itemTyped = item as { content?: unknown[] };
                const content = itemTyped.content?.map(processNode).join('').trim() || '';
                return '- ' + content + '\n';
            }).join('') + '\n';
        }

        if (nodeTyped.type === 'listItem') {
            return nodeTyped.content?.map(processNode).join('') || '';
        }

        // Handle other node types by processing their content
        if (nodeTyped.content) {
            return nodeTyped.content.map(processNode).join('');
        }

        return '';
    }

    return docTyped.content.map(processNode).join('').trim();
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

interface ContentItem {
    $id: string;
    title: string;
    slug: string;
    content: string;
    type: ContentType;
    tags?: string[];
    status: 'draft' | 'published';
    version: number;
    authorId: string;
    publishedAt?: string;
}

export default function EditContentPage() {
    const [user, setUser] = useState<User | null>(null);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [contentItem, setContentItem] = useState<ContentItem | null>(null);
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

                setContentItem(content as ContentItem);

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
                } catch {
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
                version: parseFloat(((contentItem.version || 0) + 0.01).toFixed(2)),
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
                    className="mx-auto"
                />
            </div>
        );
    }

    if (!contentItem) {
        return (
            <div className="p-6 text-center">
                <p className="text-white">Content not found or you do not have permission to view it.</p>
                <Button onClick={() => router.push('/dashboard/content')} className="mt-4">
                    Back to Content List
                </Button>
            </div>
        );
    }

    return (
        <div className="p-4 sm:p-6">
            <div className="flex justify-between items-center mb-6">
                <div>
                    <h1 className="text-3xl font-bold text-white">Edit Content</h1>
                    <p className="text-sm text-gray-400">
                        Editing: {contentItem.title} (v{contentItem.version})
                    </p>
                </div>
                <div className="flex items-center gap-2">
                    <Button
                        variant={activeTab === 'edit' ? 'default' : 'outline'}
                        onClick={() => setActiveTab('edit')}
                    >
                        <Icon icon="heroicons:pencil-16-solid" className="h-4 w-4 mr-2" />
                        Edit
                    </Button>
                    <Button
                        variant={activeTab === 'history' ? 'default' : 'outline'}
                        onClick={() => setActiveTab('history')}
                    >
                        <Icon icon="heroicons:clock-16-solid" className="h-4 w-4 mr-2" />
                        History
                    </Button>
                    <Button
                        variant="ghost"
                        onClick={() => router.back()}
                    >
                        <Icon icon="heroicons:arrow-left-16-solid" className="h-4 w-4 mr-2" />
                        Back
                    </Button>
                </div>
            </div>

            {activeTab === 'edit' && (
                <form onSubmit={handleSubmit}>
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
                        {/* Content Details */}
                        <Card className="lg:col-span-2 bg-gray-800/50 border border-gray-800">
                            <CardHeader>
                                <CardTitle>Content Details</CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div>
                                    <Label htmlFor="title" className="block mb-2">Title *</Label>
                                    <Input
                                        id="title"
                                        value={formData.title}
                                        onChange={(e) => handleInputChange('title', e.target.value)}
                                        className="bg-gray-900/50 border-gray-700"
                                    />
                                </div>
                                <div>
                                    <Label htmlFor="slug" className="block mb-2">Slug</Label>
                                    <Input
                                        id="slug"
                                        value={formData.slug}
                                        onChange={(e) => handleInputChange('slug', e.target.value)}
                                        className="bg-gray-900/50 border-gray-700"
                                    />
                                    {user && <p className="text-xs text-gray-500 mt-1">URL: /{user.department}/{formData.type}/{formData.slug}</p>}
                                </div>
                                <div>
                                    <Label htmlFor="changesSummary" className="block mb-2">Changes Summary</Label>
                                    <Textarea
                                        id="changesSummary"
                                        value={formData.changesSummary}
                                        onChange={(e) => handleInputChange('changesSummary', e.target.value)}
                                        placeholder="Briefly describe what changes you made..."
                                        className="bg-gray-900/50 border-gray-700"
                                    />
                                </div>
                            </CardContent>
                        </Card>

                        {/* Settings */}
                        <Card className="bg-gray-800/50 border border-gray-800">
                            <CardHeader>
                                <CardTitle>Settings</CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div>
                                    <Label htmlFor="type" className="block mb-2">Content Type *</Label>
                                    <Select
                                        value={formData.type}
                                        onValueChange={(value: ContentType) => handleInputChange('type', value)}
                                    >
                                        <SelectTrigger className="bg-gray-900/50 border-gray-700">
                                            <SelectValue />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="sop">Standard Operating Procedure</SelectItem>
                                            <SelectItem value="guide">Guide</SelectItem>
                                            <SelectItem value="announcement">Announcement</SelectItem>
                                            <SelectItem value="resource">Resource</SelectItem>
                                            <SelectItem value="training">Training</SelectItem>
                                            <SelectItem value="policy">Policy</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                                <div>
                                    <Label htmlFor="status" className="block mb-2">Status</Label>
                                    <Select
                                        value={formData.status}
                                        onValueChange={(value: 'draft' | 'published') => handleInputChange('status', value)}
                                    >
                                        <SelectTrigger className="bg-gray-900/50 border-gray-700">
                                            <SelectValue />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="draft">Draft</SelectItem>
                                            <SelectItem value="published">Published</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                                <div>
                                    <Label className="block mb-2">Tags</Label>
                                    <div className="flex items-center gap-2">
                                        <Input
                                            value={tagInput}
                                            onChange={(e) => setTagInput(e.target.value)}
                                            onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddTag())}
                                            placeholder="Add a tag..."
                                            className="bg-gray-900/50 border-gray-700"
                                        />
                                        <Button type="button" onClick={handleAddTag} size="sm">Add</Button>
                                    </div>
                                    <div className="flex flex-wrap gap-2 mt-2">
                                        {formData.tags.map(tag => (
                                            <div key={tag} className="flex items-center gap-1 bg-gray-700 text-white px-2 py-1 rounded-md text-sm">
                                                {tag}
                                                <button type="button" onClick={() => handleRemoveTag(tag)}>
                                                    <Icon icon="heroicons:x-mark-16-solid" className="h-3 w-3" />
                                                </button>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    </div>

                    {/* Editor */}
                    <Card className="bg-gray-800/50 border border-gray-800">
                        <CardContent className="p-2 md:p-4">
                            <BlockNoteEditorComponent
                                value={formData.content}
                                onChange={(newContent: string) => handleInputChange('content', newContent)}
                            />
                        </CardContent>
                    </Card>

                    <div className="mt-6 flex justify-end">
                        <Button type="submit" disabled={saving} size="lg">
                            {saving ? (
                                <>
                                    <Icon icon="line-md:loading-loop" className="h-5 w-5 mr-2" />
                                    Saving...
                                </>
                            ) : (
                                <>
                                    <Icon icon="heroicons:check-16-solid" className="h-5 w-5 mr-2" />
                                    Save Changes
                                </>
                            )}
                        </Button>
                    </div>
                </form>
            )}

            {activeTab === 'history' && contentItem && (
                <VersionHistory
                    contentId={contentId}
                    onVersionRestored={handleVersionRestored}
                />
            )}
        </div>
    );
}