import { headers } from 'next/headers';
import Link from 'next/link';
import { Icon } from '@iconify/react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

interface ActivityLog {
    $id: string;
    action: string;
    details: string;
    userId: string;
    username?: string;
    timestamp: string;
    type: 'content' | 'user' | 'system';
    metadata?: Record<string, any>;
}

async function getActivityLogs(): Promise<ActivityLog[]> {
    const headerInstance = await headers();
    const cookieHeader = headerInstance.get('cookie');

    // For now, return empty array since we don't have activity logs API yet
    // This prevents the 404 error and provides a placeholder page
    return [];
}

function getActionIcon(action: string) {
    switch (action.toLowerCase()) {
        case 'create':
        case 'created': return 'heroicons:plus-16-solid';
        case 'update':
        case 'updated': return 'heroicons:pencil-16-solid';
        case 'delete':
        case 'deleted': return 'heroicons:trash-16-solid';
        case 'login': return 'heroicons:arrow-right-on-rectangle-16-solid';
        case 'logout': return 'heroicons:arrow-left-on-rectangle-16-solid';
        case 'publish':
        case 'published': return 'heroicons:eye-16-solid';
        default: return 'heroicons:information-circle-16-solid';
    }
}

function getActionColor(action: string) {
    switch (action.toLowerCase()) {
        case 'create':
        case 'created': return 'bg-green-500/20 text-green-300 border-green-500/30';
        case 'update':
        case 'updated': return 'bg-blue-500/20 text-blue-300 border-blue-500/30';
        case 'delete':
        case 'deleted': return 'bg-red-500/20 text-red-300 border-red-500/30';
        case 'login': return 'bg-purple-500/20 text-purple-300 border-purple-500/30';
        case 'logout': return 'bg-gray-500/20 text-gray-300 border-gray-500/30';
        case 'publish':
        case 'published': return 'bg-yellow-500/20 text-yellow-300 border-yellow-500/30';
        default: return 'bg-gray-500/20 text-gray-300 border-gray-500/30';
    }
}

function formatTimestamp(timestamp: string) {
    try {
        return new Date(timestamp).toLocaleString();
    } catch {
        return timestamp;
    }
}

export default async function LogsPage() {
    const logs = await getActivityLogs();

    return (
        <div className="relative py-8">
            <div className="container mx-auto px-6 lg:px-8">
                {/* Header */}
                <div className="mb-8">
                    <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
                        <div>
                            <h1 className="text-4xl font-bold text-white mb-3 bg-gradient-to-r from-white to-gray-300 bg-clip-text text-transparent">
                                Activity Logs
                            </h1>
                            <p className="text-xl text-gray-300">
                                View system activity and user actions
                            </p>
                        </div>
                        <div className="flex items-center gap-4">
                            <Button asChild className="bg-purple-600 hover:bg-purple-700">
                                <Link href="/dashboard">
                                    <Icon icon="heroicons:arrow-left-16-solid" className="mr-2 h-4 w-4" />
                                    Back to Dashboard
                                </Link>
                            </Button>
                        </div>
                    </div>
                </div>

                {/* Activity Logs */}
                <div className="space-y-4">
                    {logs.map((log) => (
                        <Card key={log.$id} className="backdrop-blur-sm bg-white/5 border-white/10">
                            <CardContent className="p-6">
                                <div className="flex items-start gap-4">
                                    <div className={`p-2 rounded-lg border ${getActionColor(log.action)}`}>
                                        <Icon icon={getActionIcon(log.action)} className="h-5 w-5" />
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <div className="flex items-center justify-between mb-2">
                                            <h3 className="text-lg font-semibold text-white">
                                                {log.action}
                                            </h3>
                                            <div className="flex items-center gap-2">
                                                <Badge className={getActionColor(log.type)}>
                                                    {log.type}
                                                </Badge>
                                                <span className="text-sm text-gray-400">
                                                    {formatTimestamp(log.timestamp)}
                                                </span>
                                            </div>
                                        </div>
                                        <p className="text-gray-300 mb-2">{log.details}</p>
                                        {log.username && (
                                            <p className="text-sm text-gray-400">
                                                by <span className="text-purple-300">{log.username}</span>
                                            </p>
                                        )}
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    ))}
                </div>

                {logs.length === 0 && (
                    <Card className="backdrop-blur-sm bg-white/5 border-white/10">
                        <CardContent className="p-12 text-center">
                            <div className="p-4 bg-gray-800/50 rounded-full w-fit mx-auto mb-4">
                                <Icon icon="heroicons:clipboard-document-list-16-solid" className="h-8 w-8 text-gray-400" />
                            </div>
                            <h3 className="text-xl font-semibold text-white mb-2">No Activity Logs</h3>
                            <p className="text-gray-400 mb-4">
                                Activity logging is not yet implemented or there are no recent activities to display.
                            </p>
                            <div className="text-sm text-gray-500">
                                <p>Activity logs will show:</p>
                                <ul className="list-disc list-inside mt-2 space-y-1">
                                    <li>Content creation, updates, and deletions</li>
                                    <li>User login and logout events</li>
                                    <li>System administrative actions</li>
                                    <li>Permission changes and role updates</li>
                                </ul>
                            </div>
                        </CardContent>
                    </Card>
                )}
            </div>
        </div>
    );
} 