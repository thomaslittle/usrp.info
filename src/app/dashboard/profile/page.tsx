'use client';

import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import { Icon } from '@iconify/react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Preloader } from '@/components/ui/preloader';
import { useAuth } from '@/hooks/use-auth';
import { User } from '@/types';
import { cn } from '@/lib/utils';

export default function ProfilePage() {
    const { user: authUser, userProfile, isLoading: authLoading } = useAuth();
    const searchParams = useSearchParams();
    const viewingUserId = searchParams.get('user');
    const isViewingOtherUser = !!viewingUserId;

    const [user, setUser] = useState<User | null>(null);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [showEmail, setShowEmail] = useState(false);
    const [formData, setFormData] = useState({
        username: '',
        gameCharacterName: '',
        rank: ''
    });

    const truncateEmail = (email: string) => {
        if (!email) return '';
        const [localPart, domain] = email.split('@');
        if (localPart.length <= 3) return email;
        return `${localPart.substring(0, 3)}***@${domain}`;
    };

    useEffect(() => {
        const loadUserProfile = async () => {
            if (authLoading) return;

            try {
                setLoading(true);
                setError(null);

                if (!authUser?.email) {
                    setError('No authenticated user found');
                    return;
                }

                let response;
                if (isViewingOtherUser) {
                    // Load other user's profile by ID
                    response = await fetch(`/api/users/${viewingUserId}`);
                } else {
                    // Load current user's profile
                    response = await fetch(`/api/users/profile?email=${encodeURIComponent(authUser.email)}`);
                }

                if (!response.ok) {
                    throw new Error(`Failed to load profile: ${response.statusText}`);
                }

                const data = await response.json();
                if (data.user) {
                    setUser(data.user);
                    if (!isViewingOtherUser) {
                        setFormData({
                            username: data.user.username || '',
                            gameCharacterName: data.user.gameCharacterName || '',
                            rank: data.user.rank || ''
                        });
                    }
                } else {
                    setError('User profile not found');
                }
            } catch (error) {
                console.error('Error loading user profile:', error);
                setError(error instanceof Error ? error.message : 'Failed to load profile');
            } finally {
                setLoading(false);
            }
        };

        loadUserProfile();
    }, [authUser, authLoading, viewingUserId, isViewingOtherUser]);

    const handleSave = async () => {
        if (!user || isViewingOtherUser) return;

        try {
            setSaving(true);
            setError(null);

            const response = await fetch(`/api/users/${user.$id}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(formData),
            });

            if (!response.ok) {
                throw new Error(`Failed to update profile: ${response.statusText}`);
            }

            const data = await response.json();
            setUser(data.user);

            // Show success message or redirect
            console.log('Profile updated successfully');
        } catch (error) {
            console.error('Error updating profile:', error);
            setError(error instanceof Error ? error.message : 'Failed to update profile');
        } finally {
            setSaving(false);
        }
    };

    const handleInputChange = (field: string, value: string) => {
        setFormData(prev => ({
            ...prev,
            [field]: value
        }));
    };

    if (authLoading || loading) {
        return (
            <div className="p-6">
                <Preloader
                    text={isViewingOtherUser ? "Loading user profile..." : "Loading profile..."}
                    size="md"
                />
            </div>
        );
    }

    if (error) {
        return (
            <div className="p-6">
                <Card className="bg-red-900/20 border-red-500/50">
                    <CardContent className="p-6">
                        <div className="flex items-center space-x-2 text-red-400">
                            <Icon icon="heroicons:exclamation-triangle-16-solid" className="h-5 w-5" />
                            <span className="font-semibold">Error loading profile</span>
                        </div>
                        <p className="text-red-300 mt-2">{error}</p>
                        <Button
                            onClick={() => window.location.reload()}
                            className="mt-4 bg-red-600 hover:bg-red-700"
                        >
                            Retry
                        </Button>
                    </CardContent>
                </Card>
            </div>
        );
    }

    if (!user) {
        return (
            <div className="p-6">
                <Card className="bg-yellow-900/20 border-yellow-500/50">
                    <CardContent className="p-6">
                        <div className="flex items-center space-x-2 text-yellow-400">
                            <Icon icon="heroicons:exclamation-triangle-16-solid" className="h-5 w-5" />
                            <span className="font-semibold">Profile not found</span>
                        </div>
                    </CardContent>
                </Card>
            </div>
        );
    }

    const getActivityColor = (activity: string) => {
        switch (activity) {
            case 'Active': return 'bg-green-500/20 text-green-300';
            case 'Moderate': return 'bg-yellow-500/20 text-yellow-300';
            case 'Inactive': return 'bg-red-500/20 text-red-300';
            default: return 'bg-gray-500/20 text-gray-300';
        }
    };

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'Full-Time': return 'bg-blue-500/20 text-blue-300';
            case 'Part-Time': return 'bg-purple-500/20 text-purple-300';
            case 'On-Call': return 'bg-orange-500/20 text-orange-300';
            default: return 'bg-gray-500/20 text-gray-300';
        }
    };

    return (
        <div className="p-6 space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold text-white">
                        {isViewingOtherUser ? `${user.gameCharacterName || user.username}'s Profile` : 'Profile Settings'}
                    </h1>
                    <p className="text-purple-300">
                        {isViewingOtherUser
                            ? `View ${user.gameCharacterName || user.username}'s information and details`
                            : 'Manage your account information and preferences'
                        }
                    </p>
                </div>
                {isViewingOtherUser && (
                    <Button
                        onClick={() => window.history.back()}
                        variant="outline"
                        className="border-gray-600 text-gray-300 hover:bg-gray-800"
                    >
                        <Icon icon="heroicons:arrow-left-16-solid" className="mr-2 h-4 w-4" />
                        Back
                    </Button>
                )}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Profile Information */}
                <div className="lg:col-span-2 space-y-6">
                    <Card className="bg-gray-900/50 border border-gray-800 backdrop-blur-sm">
                        <CardHeader>
                            <CardTitle className="text-white flex items-center space-x-2">
                                <Icon icon="heroicons:user-16-solid" className="h-5 w-5 text-purple-400" />
                                <span>Personal Information</span>
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label htmlFor="username" className="text-white font-medium">Username</Label>
                                    <Input
                                        id="username"
                                        value={isViewingOtherUser ? (user.username || '') : formData.username}
                                        onChange={isViewingOtherUser ? undefined : (e) => handleInputChange('username', e.target.value)}
                                        readOnly={isViewingOtherUser}
                                        className={cn(
                                            isViewingOtherUser
                                                ? 'bg-gray-700/30 border-gray-600 text-gray-300'
                                                : 'bg-gray-700/50 border-gray-600 text-white placeholder-gray-400 focus:border-purple-500 focus:ring-purple-500'
                                        )}
                                        placeholder="Enter your username"
                                    />
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="email" className="text-white font-medium">Email Address</Label>
                                    <div className="relative">
                                        <Input
                                            id="email"
                                            value={showEmail ? user.email : truncateEmail(user.email)}
                                            readOnly
                                            className="bg-gray-700/30 border-gray-600 text-gray-300 pr-10"
                                        />
                                        {!isViewingOtherUser && (
                                            <Button
                                                type="button"
                                                variant="ghost"
                                                size="sm"
                                                onClick={() => setShowEmail(!showEmail)}
                                                className="absolute right-2 top-1/2 transform -translate-y-1/2 h-6 w-6 p-0 text-gray-400 hover:text-white"
                                            >
                                                <Icon
                                                    icon={showEmail ? "heroicons:eye-slash-16-solid" : "heroicons:eye-16-solid"}
                                                    className="h-4 w-4"
                                                />
                                            </Button>
                                        )}
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="gameCharacterName" className="text-white font-medium">Game Character Name</Label>
                                    <Input
                                        id="gameCharacterName"
                                        value={isViewingOtherUser ? (user.gameCharacterName || '') : formData.gameCharacterName}
                                        onChange={isViewingOtherUser ? undefined : (e) => handleInputChange('gameCharacterName', e.target.value)}
                                        readOnly={isViewingOtherUser}
                                        className={cn(
                                            isViewingOtherUser
                                                ? 'bg-gray-700/30 border-gray-600 text-gray-300'
                                                : 'bg-gray-700/50 border-gray-600 text-white placeholder-gray-400 focus:border-purple-500 focus:ring-purple-500'
                                        )}
                                        placeholder="Enter your character name"
                                    />
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="rank" className="text-white font-medium">Rank/Position</Label>
                                    <Input
                                        id="rank"
                                        value={isViewingOtherUser ? (user.jobTitle || user.rank || '') : formData.rank}
                                        onChange={isViewingOtherUser ? undefined : (e) => handleInputChange('rank', e.target.value)}
                                        readOnly={isViewingOtherUser}
                                        className={cn(
                                            isViewingOtherUser
                                                ? 'bg-gray-700/30 border-gray-600 text-gray-300'
                                                : 'bg-gray-700/50 border-gray-600 text-white placeholder-gray-400 focus:border-purple-500 focus:ring-purple-500'
                                        )}
                                        placeholder="Enter your rank or position"
                                    />
                                </div>

                                {/* Additional EMS fields for viewing other users */}
                                {isViewingOtherUser && (
                                    <>
                                        {user.phoneNumber && (
                                            <div className="space-y-2">
                                                <Label className="text-white font-medium">Phone Number</Label>
                                                <Input
                                                    value={user.phoneNumber}
                                                    readOnly
                                                    className="bg-gray-700/30 border-gray-600 text-gray-300"
                                                />
                                            </div>
                                        )}

                                        {user.callsign && (
                                            <div className="space-y-2">
                                                <Label className="text-white font-medium">Callsign</Label>
                                                <Input
                                                    value={user.callsign}
                                                    readOnly
                                                    className="bg-gray-700/30 border-gray-600 text-gray-300"
                                                />
                                            </div>
                                        )}

                                        {user.assignment && (
                                            <div className="space-y-2">
                                                <Label className="text-white font-medium">Assignment</Label>
                                                <Input
                                                    value={user.assignment}
                                                    readOnly
                                                    className="bg-gray-700/30 border-gray-600 text-gray-300"
                                                />
                                            </div>
                                        )}

                                        {user.discordUsername && (
                                            <div className="space-y-2">
                                                <Label className="text-white font-medium">Discord Username</Label>
                                                <Input
                                                    value={user.discordUsername}
                                                    readOnly
                                                    className="bg-gray-700/30 border-gray-600 text-gray-300"
                                                />
                                            </div>
                                        )}
                                    </>
                                )}
                            </div>

                            {!isViewingOtherUser && (
                                <div className="flex justify-end pt-4">
                                    <Button
                                        onClick={handleSave}
                                        disabled={saving}
                                        className="bg-gradient-to-r from-purple-500 to-violet-600 hover:from-purple-600 hover:to-violet-700 text-white border-0 shadow-lg hover:shadow-xl transform transition-all duration-200 font-semibold"
                                    >
                                        {saving ? (
                                            <>
                                                <Icon icon="heroicons:arrow-path-16-solid" className="mr-2 h-4 w-4 animate-spin" />
                                                Saving...
                                            </>
                                        ) : (
                                            <>
                                                <Icon icon="heroicons:check-16-solid" className="mr-2 h-4 w-4" />
                                                Save Changes
                                            </>
                                        )}
                                    </Button>
                                </div>
                            )}
                        </CardContent>
                    </Card>
                </div>

                {/* Account Overview */}
                <div className="space-y-6">
                    <Card className="bg-gray-900/50 border border-gray-800 backdrop-blur-sm">
                        <CardHeader>
                            <CardTitle className="text-white flex items-center space-x-2">
                                <Icon icon="heroicons:identification-16-solid" className="h-5 w-5 text-purple-400" />
                                <span>Account Overview</span>
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="space-y-3">
                                <div className="flex justify-between items-center">
                                    <span className="text-gray-400 text-sm">Department</span>
                                    <span className="text-white font-medium uppercase">{user.department}</span>
                                </div>
                                <div className="flex justify-between items-center">
                                    <span className="text-gray-400 text-sm">Role</span>
                                    <span className="text-white font-medium uppercase">{user.role.replace('_', ' ')}</span>
                                </div>
                                {user.activity && (
                                    <div className="flex justify-between items-center">
                                        <span className="text-gray-400 text-sm">Activity</span>
                                        <Badge className={getActivityColor(user.activity)}>
                                            {user.activity}
                                        </Badge>
                                    </div>
                                )}
                                {user.status && (
                                    <div className="flex justify-between items-center">
                                        <span className="text-gray-400 text-sm">Status</span>
                                        <Badge className={getStatusColor(user.status)}>
                                            {user.status}
                                        </Badge>
                                    </div>
                                )}
                                {user.isFTO !== undefined && (
                                    <div className="flex justify-between items-center">
                                        <span className="text-gray-400 text-sm">FTO</span>
                                        <Badge className={user.isFTO ? 'bg-green-500/20 text-green-300' : 'bg-gray-500/20 text-gray-300'}>
                                            {user.isFTO ? 'Yes' : 'No'}
                                        </Badge>
                                    </div>
                                )}
                                {user.isSoloCleared !== undefined && (
                                    <div className="flex justify-between items-center">
                                        <span className="text-gray-400 text-sm">Solo Cleared</span>
                                        <Badge className={user.isSoloCleared ? 'bg-green-500/20 text-green-300' : 'bg-gray-500/20 text-gray-300'}>
                                            {user.isSoloCleared ? 'Yes' : 'No'}
                                        </Badge>
                                    </div>
                                )}
                                <div className="flex justify-between items-center">
                                    <span className="text-gray-400 text-sm">Member Since</span>
                                    <span className="text-white font-medium">
                                        {new Date(user.$createdAt).toLocaleDateString()}
                                    </span>
                                </div>
                                <div className="flex justify-between items-center">
                                    <span className="text-gray-400 text-sm">Last Updated</span>
                                    <span className="text-white font-medium">
                                        {new Date(user.$updatedAt).toLocaleDateString()}
                                    </span>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    {!isViewingOtherUser && (
                        <Card className="bg-gray-900/50 border border-gray-800 backdrop-blur-sm">
                            <CardHeader>
                                <CardTitle className="text-white flex items-center space-x-2">
                                    <Icon icon="heroicons:shield-check-16-solid" className="h-5 w-5 text-green-400" />
                                    <span>Account Security</span>
                                </CardTitle>
                            </CardHeader>
                            <CardContent>
                                <p className="text-gray-400 text-sm">
                                    Your account is secured through Discord OAuth.
                                    To update your password or security settings,
                                    please visit your Discord account settings.
                                </p>
                            </CardContent>
                        </Card>
                    )}
                </div>
            </div>
        </div>
    );
} 