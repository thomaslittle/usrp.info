"use client";

import React, { useState, useEffect } from 'react';
import { Icon } from '@iconify/react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import type { Notification } from '@/types';
import { useAuthStore } from '@/store/auth';
import { getAppwriteSessionToken } from '@/lib/utils';

interface NotificationDropdownProps {
    className?: string;
}

export function NotificationDropdown({ className }: NotificationDropdownProps) {
    const [notifications, setNotifications] = useState<Notification[]>([]);
    const [unreadCount, setUnreadCount] = useState(0);
    const [isOpen, setIsOpen] = useState(false);
    const [isLoading, setIsLoading] = useState(true);
    const { user } = useAuthStore();

    useEffect(() => {
        if (user) {
            loadNotifications();
        }
    }, [user]);

    const loadNotifications = async () => {
        if (!user) return;

        try {
            setIsLoading(true);
            const sessionToken = getAppwriteSessionToken();

            // Fetch notifications
            const response = await fetch(`/api/notifications?userId=${user.$id}`, {
                headers: {
                    'X-Fallback-Cookies': sessionToken || ''
                }
            });

            if (response.ok) {
                const data = await response.json();
                setNotifications(data.notifications || []);
                setUnreadCount(data.unreadCount || 0);
            }
        } catch (error) {
            console.error('Error loading notifications:', error);
        } finally {
            setIsLoading(false);
        }
    };

    const markAsRead = async (notificationId: string) => {
        try {
            const sessionToken = getAppwriteSessionToken();
            await fetch(`/api/notifications/${notificationId}/read`, {
                method: 'POST',
                headers: {
                    'X-Fallback-Cookies': sessionToken || ''
                }
            });

            // Update local state
            setNotifications(prev =>
                prev.map(n => n.$id === notificationId ? { ...n, isRead: true } : n)
            );
            setUnreadCount(prev => Math.max(0, prev - 1));
        } catch (error) {
            console.error('Error marking notification as read:', error);
        }
    };

    const markAllAsRead = async () => {
        if (!user) return;

        try {
            const sessionToken = getAppwriteSessionToken();
            await fetch(`/api/notifications/mark-all-read`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'X-Fallback-Cookies': sessionToken || ''
                },
                body: JSON.stringify({ userId: user.$id })
            });

            setUnreadCount(0);
            setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
        } catch (error) {
            console.error('Error marking all notifications as read:', error);
        }
    };

    const handleNotificationClick = (notification: Notification) => {
        if (!notification.isRead) {
            markAsRead(notification.$id);
        }

        if (notification.actionUrl) {
            window.location.href = notification.actionUrl;
        }

        setIsOpen(false);
    };

    const getPriorityColor = (priority: string) => {
        switch (priority) {
            case 'urgent': return 'text-red-400 bg-red-500/10';
            case 'high': return 'text-orange-400 bg-orange-500/10';
            case 'medium': return 'text-yellow-400 bg-yellow-500/10';
            case 'low': return 'text-blue-400 bg-blue-500/10';
            default: return 'text-gray-400 bg-gray-500/10';
        }
    };

    const getTypeIcon = (type: string) => {
        switch (type) {
            case 'profile_updated': return 'heroicons:user-16-solid';
            case 'content_created': return 'heroicons:document-plus-16-solid';
            case 'content_updated': return 'heroicons:document-text-16-solid';
            case 'content_published': return 'heroicons:megaphone-16-solid';
            case 'role_changed': return 'heroicons:shield-check-16-solid';
            case 'department_announcement': return 'heroicons:speaker-wave-16-solid';
            default: return 'heroicons:bell-16-solid';
        }
    };

    const formatTimeAgo = (dateString: string) => {
        const date = new Date(dateString);
        const now = new Date();
        const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);

        if (diffInSeconds < 60) return 'Just now';
        if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)}m ago`;
        if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)}h ago`;
        if (diffInSeconds < 604800) return `${Math.floor(diffInSeconds / 86400)}d ago`;
        return date.toLocaleDateString();
    };

    if (!user) return null;

    return (
        <Popover open={isOpen} onOpenChange={setIsOpen}>
            <PopoverTrigger asChild>
                <Button
                    variant="ghost"
                    size="sm"
                    className={`relative text-gray-300 hover:text-white hover:bg-gray-700/50 transition-all ${className || ''}`}
                >
                    <Icon icon="heroicons:bell-16-solid" className="h-5 w-5" />
                    {unreadCount > 0 && (
                        <Badge
                            variant="destructive"
                            className="absolute -top-1 -right-1 h-4 w-4 rounded-full p-0 flex items-center justify-center text-xs font-bold bg-red-500 text-white min-w-4"
                        >
                            {unreadCount > 9 ? '9+' : unreadCount}
                        </Badge>
                    )}
                </Button>
            </PopoverTrigger>
            <PopoverContent
                align="end"
                className="w-80 p-0 bg-gray-900 border-gray-800 shadow-xl"
            >
                <div className="flex items-center justify-between p-4 border-b border-gray-800">
                    <h3 className="text-sm font-semibold text-white">Notifications</h3>
                    {unreadCount > 0 && (
                        <Button
                            variant="ghost"
                            size="sm"
                            onClick={markAllAsRead}
                            className="text-xs text-purple-400 hover:text-purple-300 hover:bg-purple-500/10"
                        >
                            Mark all read
                        </Button>
                    )}
                </div>

                <div className="max-h-80 overflow-y-auto">
                    {isLoading ? (
                        <div className="flex items-center justify-center p-8">
                            <Icon icon="heroicons:arrow-path-16-solid" className="h-6 w-6 animate-spin text-gray-400" />
                            <span className="ml-2 text-gray-400">Loading...</span>
                        </div>
                    ) : notifications.length === 0 ? (
                        <div className="flex flex-col items-center justify-center p-8">
                            <Icon icon="heroicons:bell-slash-16-solid" className="h-12 w-12 text-gray-500 mb-4" />
                            <p className="text-gray-400 text-sm">No notifications yet</p>
                        </div>
                    ) : (
                        <div className="divide-y divide-gray-700">
                            {notifications.map((notification) => (
                                <div
                                    key={notification.$id}
                                    onClick={() => handleNotificationClick(notification)}
                                    className={`p-4 cursor-pointer hover:bg-gray-800/50 transition-colors ${!notification.isRead ? 'bg-purple-500/5' : ''
                                        }`}
                                >
                                    <div className="flex items-start gap-3">
                                        <div className={`p-2 rounded-lg ${getPriorityColor(notification.priority || 'medium')}`}>
                                            <Icon icon={getTypeIcon(notification.type)} className="h-4 w-4" />
                                        </div>

                                        <div className="flex-1 min-w-0">
                                            <div className="flex items-center gap-2 mb-1">
                                                <h4 className={`text-sm font-medium truncate ${!notification.isRead ? 'text-white' : 'text-gray-300'
                                                    }`}>
                                                    {notification.title}
                                                </h4>
                                                {!notification.isRead && (
                                                    <div className="w-2 h-2 bg-purple-500 rounded-full flex-shrink-0" />
                                                )}
                                            </div>

                                            <p className="text-xs text-gray-400 mb-2 line-clamp-2">
                                                {notification.message}
                                            </p>

                                            <div className="flex items-center justify-between">
                                                <span className="text-xs text-gray-500">
                                                    {formatTimeAgo(notification.createdAt)}
                                                </span>

                                                {notification.priority && notification.priority !== 'medium' && (
                                                    <Badge
                                                        variant="outline"
                                                        className={`text-xs border-0 ${getPriorityColor(notification.priority)}`}
                                                    >
                                                        {notification.priority.toUpperCase()}
                                                    </Badge>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </PopoverContent>
        </Popover>
    );
} 