'use client';

import React, { useState, useEffect } from 'react';
import { Icon } from '@iconify/react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { getAppwriteSessionToken } from '@/lib/utils';
import { ContentVersion } from '@/types';

interface VersionHistoryProps {
    contentId: string;
    onVersionRestored?: () => void;
}

interface EnrichedVersion extends ContentVersion {
    author: {
        id: string;
        username: string;
        email: string;
        gameCharacterName?: string;
    } | null;
}

interface VersionStats {
    totalVersions: number;
    uniqueAuthors: number;
    firstVersion: ContentVersion | null;
    latestVersion: ContentVersion | null;
    publishedVersions: number;
}

export function VersionHistory({ contentId, onVersionRestored }: VersionHistoryProps) {
    const [versions, setVersions] = useState<EnrichedVersion[]>([]);
    const [stats, setStats] = useState<VersionStats | null>(null);
    const [loading, setLoading] = useState(true);
    const [selectedVersions, setSelectedVersions] = useState<{ from: number; to: number } | null>(null);
    const [comparison, setComparison] = useState<any>(null);
    const [restoreDialogOpen, setRestoreDialogOpen] = useState(false);
    const [versionToRestore, setVersionToRestore] = useState<number | null>(null);
    const [restoreLoading, setRestoreLoading] = useState(false);

    useEffect(() => {
        fetchVersions(contentId);
    }, [contentId]);

    const fetchVersions = async (contentId: string) => {
        try {
            setLoading(true);
            // Get session token from localStorage for authentication
            const sessionToken = getAppwriteSessionToken();

            const response = await fetch(`/api/content/${contentId}/versions`, {
                headers: {
                    ...(sessionToken && { 'X-Fallback-Cookies': sessionToken })
                }
            });
            if (!response.ok) throw new Error('Failed to fetch versions');

            const data = await response.json();
            setVersions(data.versions);
            setStats(data.stats);
        } catch (error) {
            console.error('Error fetching versions:', error);
        } finally {
            setLoading(false);
        }
    };

    const compareVersions = async (version1Id: string, version2Id: string, contentId: string) => {
        try {
            // Get session token from localStorage for authentication
            const sessionToken = getAppwriteSessionToken();

            const response = await fetch(
                `/api/content/${contentId}/versions/compare?from=${version1Id}&to=${version2Id}`,
                {
                    headers: {
                        ...(sessionToken && { 'X-Fallback-Cookies': sessionToken })
                    }
                }
            );
            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.error || 'Failed to compare versions');
            }

            const comparisonData = await response.json();

            // Ensure the comparison data has the expected structure
            if (!comparisonData || !comparisonData.fromVersionData || !comparisonData.toVersionData) {
                throw new Error('Invalid comparison data received');
            }

            setComparison(comparisonData);
            setSelectedVersions({ from: parseInt(version1Id), to: parseInt(version2Id) });
        } catch (error) {
            console.error('Error comparing versions:', error);
            alert(`Failed to compare versions: ${error instanceof Error ? error.message : 'Unknown error'}`);
        }
    };

    const handleRestoreVersion = async (versionNumber: number) => {
        try {
            setRestoreLoading(true);
            // Get session token from localStorage for authentication
            const sessionToken = getAppwriteSessionToken();

            const response = await fetch(`/api/content/${contentId}/versions`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    ...(sessionToken && { 'X-Fallback-Cookies': sessionToken })
                },
                body: JSON.stringify({ versionNumber }),
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.error || 'Failed to restore version');
            }

            const result = await response.json();
            setRestoreDialogOpen(false);
            setVersionToRestore(null);

            // Refresh versions and notify parent
            await fetchVersions(contentId);
            onVersionRestored?.();

            // Show success message
            alert(result.message || 'Version restored successfully');
        } catch (error) {
            console.error('Error restoring version:', error);
            alert(`Failed to restore version: ${error instanceof Error ? error.message : 'Unknown error'}`);
        } finally {
            setRestoreLoading(false);
        }
    };

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'published': return 'bg-green-500/20 text-green-400 border-green-500/30';
            case 'draft': return 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30';
            case 'archived': return 'bg-red-500/20 text-red-400 border-red-500/30';
            default: return 'bg-gray-500/20 text-gray-400 border-gray-500/30';
        }
    };

    const getTypeColor = (type: string) => {
        switch (type) {
            case 'sop': return 'bg-blue-500/20 text-blue-400 border-blue-500/30';
            case 'guide': return 'bg-green-500/20 text-green-400 border-green-500/30';
            case 'announcement': return 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30';
            case 'resource': return 'bg-purple-500/20 text-purple-400 border-purple-500/30';
            case 'training': return 'bg-red-500/20 text-red-400 border-red-500/30';
            case 'policy': return 'bg-indigo-500/20 text-indigo-400 border-indigo-500/30';
            default: return 'bg-gray-500/20 text-gray-400 border-gray-500/30';
        }
    };

    if (loading) {
        return (
            <div className="bg-gray-900/80 border border-gray-800 rounded-2xl shadow-lg p-8 flex items-center justify-center">
                <Icon icon="heroicons:arrow-path" className="h-6 w-6 animate-spin text-purple-400" />
                <span className="ml-2 text-slate-300">Loading version history...</span>
            </div>
        );
    }

    return (
        <div className="space-y-8">
            {/* Stats Overview */}
            {stats && (
                <div className="bg-gray-900/80 border border-gray-800 rounded-2xl shadow-lg p-8">
                    <div className="flex items-center gap-3 mb-6">
                        <Icon icon="heroicons:clock" className="h-6 w-6 text-purple-400" />
                        <h2 className="text-2xl font-bold text-slate-100">Version Statistics</h2>
                    </div>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                        <div className="text-center">
                            <div className="text-3xl font-extrabold text-purple-400">{stats.totalVersions}</div>
                            <div className="text-base text-slate-400 mt-1">Total Versions</div>
                        </div>
                        <div className="text-center">
                            <div className="text-3xl font-extrabold text-blue-400">{stats.uniqueAuthors}</div>
                            <div className="text-base text-slate-400 mt-1">Contributors</div>
                        </div>
                        <div className="text-center">
                            <div className="text-3xl font-extrabold text-green-400">{stats.publishedVersions}</div>
                            <div className="text-base text-slate-400 mt-1">Published</div>
                        </div>
                        <div className="text-center">
                            <div className="text-3xl font-extrabold text-yellow-400">{stats.firstVersion ? new Date(stats.firstVersion.createdAt).toLocaleDateString() : '-'}</div>
                            <div className="text-base text-slate-400 mt-1">First Created</div>
                        </div>
                    </div>
                </div>
            )}
            <div className="border-t border-gray-800 my-6" />
            {/* Version History */}
            <div className="bg-gray-900/80 border border-gray-800 rounded-2xl shadow-lg p-8">
                <div className="flex items-center gap-3 mb-6">
                    <Icon icon="heroicons:book-open" className="h-6 w-6 text-purple-400" />
                    <h2 className="text-2xl font-bold text-slate-100">Version History <span className="text-slate-400 font-normal">({versions.length} versions)</span></h2>
                </div>
                {versions.length === 0 ? (
                    <div className="text-center py-8">
                        <Icon icon="heroicons:clock" className="h-12 w-12 text-slate-500 mx-auto mb-4" />
                        <h3 className="text-lg font-medium text-slate-300 mb-2">No Version History</h3>
                        <p className="text-slate-400 text-sm">
                            This content was created before version management was implemented.
                            <br />
                            Future edits will create version history automatically.
                        </p>
                    </div>
                ) : (
                    <div className="space-y-4">
                        {versions.map((version, index) => (
                            <div
                                key={version.$id}
                                className={`p-4 border rounded-lg ${version.isCurrentVersion
                                    ? 'border-purple-500/50 bg-purple-500/10'
                                    : 'border-slate-600 bg-slate-700/50'
                                    }`}
                            >
                                <div className="flex items-start justify-between">
                                    <div className="flex-1">
                                        <div className="flex items-center gap-3 mb-2">
                                            <div className="flex items-center gap-2">
                                                <span className="text-lg font-bold text-white">
                                                    Version {version.version}
                                                </span>
                                                {version.isCurrentVersion && (
                                                    <Badge className="bg-purple-500/20 text-purple-300 border-purple-500/30">
                                                        Current
                                                    </Badge>
                                                )}
                                            </div>
                                            <Badge className={getStatusColor(version.status)}>
                                                {version.status.toUpperCase()}
                                            </Badge>
                                            <Badge className={getTypeColor(version.type)}>
                                                {version.type.toUpperCase()}
                                            </Badge>
                                        </div>

                                        <h3 className="text-white font-medium mb-2">{version.title}</h3>

                                        {version.changesSummary && (
                                            <p className="text-slate-300 text-sm mb-2">
                                                <Icon icon="heroicons:pencil" className="inline h-4 w-4 mr-1" />
                                                {version.changesSummary}
                                            </p>
                                        )}

                                        <div className="flex items-center gap-4 text-sm text-slate-400">
                                            <div className="flex items-center">
                                                <Icon icon="heroicons:user" className="h-4 w-4 mr-1" />
                                                {version.author?.gameCharacterName || version.author?.username || 'Unknown'}
                                            </div>
                                            <div className="flex items-center">
                                                <Icon icon="heroicons:calendar" className="h-4 w-4 mr-1" />
                                                {new Date(version.createdAt).toLocaleString()}
                                            </div>
                                            {version.publishedAt && (
                                                <div className="flex items-center">
                                                    <Icon icon="heroicons:eye" className="h-4 w-4 mr-1" />
                                                    Published {new Date(version.publishedAt).toLocaleString()}
                                                </div>
                                            )}
                                        </div>
                                    </div>

                                    <div className="flex items-center gap-2 ml-4">
                                        {!version.isCurrentVersion && (
                                            <Button
                                                variant="ghost"
                                                size="sm"
                                                className="text-slate-300 hover:text-white hover:bg-slate-600"
                                                onClick={() => {
                                                    setVersionToRestore(version.version);
                                                    setRestoreDialogOpen(true);
                                                }}
                                            >
                                                <Icon icon="heroicons:arrow-uturn-left" className="h-4 w-4" />
                                            </Button>
                                        )}

                                        {index < versions.length - 1 && (
                                            <Button
                                                variant="ghost"
                                                size="sm"
                                                className="text-slate-300 hover:text-white hover:bg-slate-600"
                                                onClick={() => compareVersions(version.version.toString(), versions[index + 1].version.toString(), contentId)}
                                            >
                                                <Icon icon="heroicons:arrows-right-left" className="h-4 w-4" />
                                            </Button>
                                        )}
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            {/* Version Comparison Dialog */}
            {comparison && selectedVersions && (
                <Dialog open={!!comparison} onOpenChange={() => setComparison(null)}>
                    <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto bg-slate-800 border-slate-700">
                        <DialogHeader>
                            <DialogTitle className="text-white">
                                Compare Versions {selectedVersions.from} → {selectedVersions.to}
                            </DialogTitle>
                        </DialogHeader>

                        <div className="space-y-6">
                            <div className="grid grid-cols-2 gap-6">
                                <div>
                                    <h3 className="text-lg font-semibold text-white mb-2">
                                        Version {comparison.fromVersion}
                                    </h3>
                                    <div className="text-sm text-slate-400 space-y-1">
                                        <p>By: {comparison.fromVersionData?.author?.gameCharacterName || comparison.fromVersionData?.author?.username || 'Unknown'}</p>
                                        <p>Date: {comparison.fromVersionData?.createdAt ? new Date(comparison.fromVersionData.createdAt).toLocaleString() : 'Unknown'}</p>
                                    </div>
                                </div>
                                <div>
                                    <h3 className="text-lg font-semibold text-white mb-2">
                                        Version {comparison.toVersion}
                                    </h3>
                                    <div className="text-sm text-slate-400 space-y-1">
                                        <p>By: {comparison.toVersionData?.author?.gameCharacterName || comparison.toVersionData?.author?.username || 'Unknown'}</p>
                                        <p>Date: {comparison.toVersionData?.createdAt ? new Date(comparison.toVersionData.createdAt).toLocaleString() : 'Unknown'}</p>
                                    </div>
                                </div>
                            </div>

                            <div>
                                <h4 className="text-white font-medium mb-3">
                                    Changes ({comparison.totalChanges || 0} {(comparison.totalChanges || 0) === 1 ? 'change' : 'changes'})
                                </h4>

                                {(!comparison.diffs || comparison.diffs.length === 0) ? (
                                    <p className="text-slate-400">No changes detected between these versions.</p>
                                ) : (
                                    <div className="space-y-3">
                                        {comparison.diffs.map((diff: any, index: number) => (
                                            <div key={index} className="border border-slate-600 rounded-lg p-3">
                                                <div className="flex items-center gap-2 mb-2">
                                                    <span className="text-white font-medium uppercase">{diff.field}</span>
                                                    <Badge className={
                                                        diff.changeType === 'added' ? 'bg-green-500/20 text-green-400' :
                                                            diff.changeType === 'removed' ? 'bg-red-500/20 text-red-400' :
                                                                'bg-yellow-500/20 text-yellow-400'
                                                    }>
                                                        {diff.changeType}
                                                    </Badge>
                                                </div>

                                                <div className="grid grid-cols-2 gap-4 text-sm">
                                                    <div>
                                                        <p className="text-red-400 mb-1">- Old Value:</p>
                                                        <div className="bg-red-500/10 border border-red-500/30 rounded p-2 text-slate-300">
                                                            {typeof diff.oldValue === 'string' ? diff.oldValue : JSON.stringify(diff.oldValue)}
                                                        </div>
                                                    </div>
                                                    <div>
                                                        <p className="text-green-400 mb-1">+ New Value:</p>
                                                        <div className="bg-green-500/10 border border-green-500/30 rounded p-2 text-slate-300">
                                                            {typeof diff.newValue === 'string' ? diff.newValue : JSON.stringify(diff.newValue)}
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>
                        </div>
                    </DialogContent>
                </Dialog>
            )}

            {/* Restore Version Dialog */}
            <Dialog open={restoreDialogOpen} onOpenChange={setRestoreDialogOpen}>
                <DialogContent className="bg-slate-800 border-slate-700">
                    <DialogHeader>
                        <DialogTitle className="text-white">
                            Restore Version {versionToRestore}
                        </DialogTitle>
                    </DialogHeader>

                    <div className="space-y-4">
                        <p className="text-slate-300">
                            Are you sure you want to restore this version? This will create a new version with the content from version {versionToRestore}.
                        </p>

                        <div className="flex justify-end gap-3">
                            <Button
                                variant="ghost"
                                onClick={() => setRestoreDialogOpen(false)}
                                disabled={restoreLoading}
                                className="text-slate-300 hover:text-white"
                            >
                                Cancel
                            </Button>
                            <Button
                                onClick={() => versionToRestore && handleRestoreVersion(versionToRestore)}
                                disabled={restoreLoading}
                                className="bg-purple-600 hover:bg-purple-700"
                            >
                                {restoreLoading ? (
                                    <>
                                        <Icon icon="heroicons:arrow-path" className="h-4 w-4 mr-2 animate-spin" />
                                        Restoring...
                                    </>
                                ) : (
                                    <>
                                        <Icon icon="heroicons:arrow-uturn-left" className="h-4 w-4 mr-2" />
                                        Restore Version
                                    </>
                                )}
                            </Button>
                        </div>
                    </div>
                </DialogContent>
            </Dialog>
        </div>
    );
} 