'use client';

import React, { useState, useEffect } from 'react';
import { Icon } from '@iconify/react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Preloader } from '@/components/ui/preloader';
import { getCurrentUser } from '@/lib/auth';
import { getAppwriteSessionToken, cn } from '@/lib/utils';
import { User, UserRole } from '@/types';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { UserAvatar } from '@/components/user-avatar';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';

const roleColors = {
    viewer: 'bg-gray-100/10 text-gray-300 border border-gray-600',
    editor: 'bg-blue-400/10 text-blue-300 border border-blue-500/50',
    admin: 'bg-green-400/10 text-green-300 border border-green-500/50',
    super_admin: 'bg-purple-400/10 text-purple-300 border border-purple-500/50'
};

const roleDescriptions = {
    viewer: 'Can view content only',
    editor: 'Can create and edit content',
    admin: 'Can manage content and users in their department',
    super_admin: 'Full system access across all departments'
};

const activityColors = {
    Active: 'bg-green-100/10 text-green-300 border border-green-500/50',
    Moderate: 'bg-yellow-100/10 text-yellow-300 border border-yellow-500/50',
    Inactive: 'bg-red-100/10 text-red-300 border border-red-500/50'
};

const statusColors = {
    'Full-Time': 'bg-blue-100/10 text-blue-300 border border-blue-500/50',
    'Part-Time': 'bg-orange-100/10 text-orange-300 border border-orange-500/50',
    'On-Call': 'bg-purple-100/10 text-purple-300 border border-purple-500/50'
};

interface EditUserFormData {
    username: string;
    gameCharacterName: string;
    rank: string;
    jobTitle: string;
    phoneNumber: string;
    callsign: string;
    assignment: string;
    activity: 'Active' | 'Moderate' | 'Inactive';
    status: 'Full-Time' | 'Part-Time' | 'On-Call';
    timezone: string;
    discordUsername: string;
    isFTO: boolean;
    isSoloCleared: boolean;
    role: UserRole;
}

export default function UserManagementPage() {
    const [currentUser, setCurrentUser] = useState<User | null>(null);
    const [users, setUsers] = useState<User[]>([]);
    const [filteredUsers, setFilteredUsers] = useState<User[]>([]);
    const [loading, setLoading] = useState(true);
    const [setupLoading, setSetupLoading] = useState(false);
    const [editingUser, setEditingUser] = useState<User | null>(null);
    const [editFormData, setEditFormData] = useState<EditUserFormData>({
        username: '',
        gameCharacterName: '',
        rank: '',
        jobTitle: '',
        phoneNumber: '',
        callsign: '',
        assignment: '',
        activity: 'Active',
        status: 'Full-Time',
        timezone: '',
        discordUsername: '',
        isFTO: false,
        isSoloCleared: false,
        role: 'viewer'
    });
    const [saveLoading, setSaveLoading] = useState(false);
    const [filters, setFilters] = useState({
        department: 'all',
        role: 'all',
        activity: 'all',
        search: ''
    });

    useEffect(() => {
        const loadUsers = async () => {
            try {
                const authUser = await getCurrentUser();
                if (!authUser) return;

                // Get session token for authentication
                const sessionToken = getAppwriteSessionToken();

                // Get current user profile from API
                const profileResponse = await fetch(`/api/users/profile?email=${encodeURIComponent(authUser.email)}`, {
                    headers: {
                        ...(sessionToken && { 'X-Fallback-Cookies': sessionToken })
                    }
                });
                if (!profileResponse.ok) {
                    console.error('Failed to get user profile');
                    return;
                }
                const profileData = await profileResponse.json();
                if (!profileData.user) {
                    console.error('User profile not found');
                    return;
                }

                setCurrentUser(profileData.user as User);

                // Check if user has permission to access user management
                if (!['admin', 'super_admin'].includes(profileData.user.role)) {
                    setLoading(false);
                    return;
                }

                // Load users via API route
                const usersResponse = await fetch(`/api/users?email=${encodeURIComponent(authUser.email)}`, {
                    headers: {
                        ...(sessionToken && { 'X-Fallback-Cookies': sessionToken })
                    }
                });
                if (!usersResponse.ok) {
                    console.error('Failed to load users');
                    return;
                }
                const usersData = await usersResponse.json();

                setUsers(usersData.users as User[]);
                setFilteredUsers(usersData.users as User[]);
            } catch (error) {
                console.error('Error loading users:', error);
            } finally {
                setLoading(false);
            }
        };

        loadUsers();
    }, []);

    const handleSetupSuperAdmin = async () => {
        if (!currentUser) return;

        setSetupLoading(true);
        try {
            const sessionToken = getAppwriteSessionToken();
            const response = await fetch('/api/admin/setup-super-admin', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    ...(sessionToken && { 'X-Fallback-Cookies': sessionToken })
                },
                body: JSON.stringify({
                    email: currentUser.email
                }),
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.error || 'Failed to set up super admin');
            }

            const result = await response.json();
            alert(result.message);

            // Reload the page to refresh user data
            window.location.reload();
        } catch (error) {
            console.error('Error setting up super admin:', error);
            alert(error instanceof Error ? error.message : 'Failed to set up super admin');
        } finally {
            setSetupLoading(false);
        }
    };

    useEffect(() => {
        // Apply filters
        let filtered = users;

        if (filters.department !== 'all') {
            filtered = filtered.filter(user => user.department === filters.department);
        }

        if (filters.role !== 'all') {
            filtered = filtered.filter(user => user.role === filters.role);
        }

        if (filters.activity !== 'all') {
            filtered = filtered.filter(user => user.activity === filters.activity);
        }

        if (filters.search) {
            filtered = filtered.filter(user =>
                user.username.toLowerCase().includes(filters.search.toLowerCase()) ||
                user.email.toLowerCase().includes(filters.search.toLowerCase()) ||
                (user.gameCharacterName && user.gameCharacterName.toLowerCase().includes(filters.search.toLowerCase())) ||
                (user.callsign && user.callsign.toLowerCase().includes(filters.search.toLowerCase())) ||
                (user.rank && user.rank.toLowerCase().includes(filters.search.toLowerCase()))
            );
        }

        setFilteredUsers(filtered);
    }, [users, filters]);

    const handleRoleChange = async (userId: string, newRole: UserRole) => {
        if (!currentUser) return;

        // Permission checks
        if (currentUser.role !== 'super_admin' && currentUser.role !== 'admin') {
            alert('You do not have permission to change user roles');
            return;
        }

        // Admins can't promote to super_admin or modify other admins/super_admins
        if (currentUser.role === 'admin') {
            const targetUser = users.find(u => u.$id === userId);
            if (targetUser && ['admin', 'super_admin'].includes(targetUser.role)) {
                alert('You cannot modify admin or super admin accounts');
                return;
            }
            if (newRole === 'super_admin') {
                alert('You cannot promote users to super admin');
                return;
            }
        }

        try {
            // Use API route to update user role
            const response = await fetch(`/api/users/${userId}`, {
                method: 'PATCH',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    role: newRole,
                    currentUserEmail: currentUser.email
                }),
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.error || 'Failed to update user role');
            }

            // Update local state
            setUsers(prev => prev.map(user =>
                user.$id === userId ? { ...user, role: newRole } : user
            ));

        } catch (error) {
            console.error('Error updating user role:', error);
            alert(error instanceof Error ? error.message : 'Failed to update user role');
        }
    };

    const handleEditUser = (user: User) => {
        setEditingUser(user);
        setEditFormData({
            username: user.username || '',
            gameCharacterName: user.gameCharacterName || '',
            rank: user.rank || '',
            jobTitle: user.jobTitle || '',
            phoneNumber: user.phoneNumber || '',
            callsign: user.callsign || '',
            assignment: user.assignment || '',
            activity: user.activity || 'Active',
            status: user.status || 'Full-Time',
            timezone: user.timezone || '',
            discordUsername: user.discordUsername || '',
            isFTO: user.isFTO || false,
            isSoloCleared: user.isSoloCleared || false,
            role: user.role
        });
    };

    const handleSaveUser = async () => {
        if (!editingUser || !currentUser) return;

        setSaveLoading(true);
        try {
            const sessionToken = getAppwriteSessionToken();
            const response = await fetch(`/api/users/${editingUser.$id}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    ...(sessionToken && { 'X-Fallback-Cookies': sessionToken })
                },
                body: JSON.stringify({
                    ...editFormData,
                    currentUserEmail: currentUser.email
                }),
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.error || 'Failed to update user');
            }

            const result = await response.json();

            // Update local state
            setUsers(prev => prev.map(user =>
                user.$id === editingUser.$id ? { ...user, ...editFormData } : user
            ));

            setEditingUser(null);
            alert('User updated successfully!');
        } catch (error) {
            console.error('Error updating user:', error);
            alert(error instanceof Error ? error.message : 'Failed to update user');
        } finally {
            setSaveLoading(false);
        }
    };

    const canModifyUser = (user: User) => {
        if (!currentUser) return false;
        if (currentUser.role === 'super_admin') return true;
        if (currentUser.role === 'admin') {
            // Admin can modify viewers and editors in their department, but not other admins
            return user.department === currentUser.department &&
                !['admin', 'super_admin'].includes(user.role) &&
                user.$id !== currentUser.$id;
        }
        return false;
    };

    if (loading) {
        return (
            <div className="p-6">
                <Preloader
                    text="Loading users..."
                    size="md"
                />
            </div>
        );
    }

    // Show setup super admin option if no super admin exists
    const hasSuperAdmin = users.some(user => user.role === 'super_admin');
    const isSuperAdmin = currentUser?.role === 'super_admin';

    if (!currentUser) {
        return (
            <div className="p-6">
                <Card className="bg-gray-800 border-gray-800">
                    <CardContent className="p-12">
                        <div className="text-center">
                            <Icon icon="heroicons:no-symbol-16-solid" className="h-16 w-16 mx-auto mb-4 text-red-500" />
                            <h3 className="text-lg font-medium text-white mb-2">Not Authenticated</h3>
                            <p className="text-gray-400">Please log in to access user management.</p>
                        </div>
                    </CardContent>
                </Card>
            </div>
        );
    }

    if (!hasSuperAdmin) {
        return (
            <div className="p-6">
                <Card className="bg-gray-800 border-gray-800">
                    <CardContent className="p-12">
                        <div className="text-center">
                            <Icon icon="heroicons:shield-check-16-solid" className="h-16 w-16 mx-auto mb-4 text-purple-500" />
                            <h3 className="text-lg font-medium text-white mb-2">Setup Super Admin</h3>
                            <p className="text-gray-400 mb-6">
                                No super admin exists. Set up the first super admin to manage the system.
                            </p>
                            <div className="bg-gray-700/50 p-4 rounded-lg mb-6">
                                <p className="text-sm text-gray-300 mb-2">Current User:</p>
                                <p className="text-white font-medium">{currentUser.username} ({currentUser.email})</p>
                                <p className="text-gray-400 text-sm">Role: {currentUser.role}</p>
                            </div>
                            <Button
                                onClick={handleSetupSuperAdmin}
                                disabled={setupLoading}
                                className="bg-purple-600 hover:bg-purple-700 text-white"
                            >
                                {setupLoading ? (
                                    <>
                                        <Icon icon="heroicons:arrow-path-16-solid" className="h-4 w-4 mr-2 animate-spin" />
                                        Setting up...
                                    </>
                                ) : (
                                    <>
                                        <Icon icon="heroicons:shield-check-16-solid" className="h-4 w-4 mr-2" />
                                        Promote to Super Admin
                                    </>
                                )}
                            </Button>
                        </div>
                    </CardContent>
                </Card>
            </div>
        );
    }

    if (!['admin', 'super_admin'].includes(currentUser.role)) {
        return (
            <div className="p-6">
                <Card className="bg-gray-800 border-gray-800">
                    <CardContent className="p-12">
                        <div className="text-center">
                            <Icon icon="heroicons:no-symbol-16-solid" className="h-16 w-16 mx-auto mb-4 text-red-500" />
                            <h3 className="text-lg font-medium text-white mb-2">Access Denied</h3>
                            <p className="text-gray-400">You don't have permission to manage users.</p>
                        </div>
                    </CardContent>
                </Card>
            </div>
        );
    }

    const departments = [...new Set(users.map(user => user.department))];
    const roles = ['viewer', 'editor', 'admin', 'super_admin'];

    return (
        <TooltipProvider>
            <div className="p-6 space-y-6">
                {/* Header */}
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-3xl font-bold text-white font-akrobat tracking-tight">User Management</h1>
                        <p className="text-slate-400 font-poppins">Manage user roles, profiles, and department information</p>
                    </div>
                </div>

                {/* Filters */}
                <Card className="bg-slate-900/90 border-white/10 backdrop-blur-sm">
                    <CardContent className="p-6">
                        <div className="flex items-center gap-3 mb-4">
                            <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-purple-500/20 border border-purple-500/30">
                                <Icon icon="heroicons:funnel-16-solid" className="h-4 w-4 text-purple-400" />
                            </div>
                            <h3 className="text-lg font-semibold text-white font-akrobat">Filters</h3>
                        </div>

                        <div className="flex flex-wrap items-end gap-3">
                            <div className="flex-1 min-w-[200px]">
                                <Label htmlFor="search" className="text-sm font-medium text-slate-300 mb-2 block font-poppins">Search</Label>
                                <Input
                                    id="search"
                                    type="text"
                                    placeholder="Search users..."
                                    value={filters.search}
                                    onChange={(e) => setFilters(prev => ({ ...prev, search: e.target.value }))}
                                    className="bg-slate-800/50 border-slate-700 text-white placeholder-slate-400 font-poppins"
                                />
                            </div>

                            {currentUser.role === 'super_admin' && (
                                <div className="w-[160px]">
                                    <Label htmlFor="department" className="text-sm font-medium text-slate-300 mb-2 block font-poppins">Department</Label>
                                    <Select
                                        value={filters.department}
                                        onValueChange={(value) => setFilters(prev => ({ ...prev, department: value }))}
                                    >
                                        <SelectTrigger className="w-full bg-slate-800/50 border-slate-700 text-white font-poppins">
                                            <SelectValue placeholder="EMS" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="all">All Departments</SelectItem>
                                            {departments.map((dept) => (
                                                <SelectItem key={dept} value={dept}>
                                                    {dept.toUpperCase()}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </div>
                            )}

                            <div className="w-[140px]">
                                <Label htmlFor="role" className="text-sm font-medium text-slate-300 mb-2 block font-poppins">Role</Label>
                                <Select
                                    value={filters.role}
                                    onValueChange={(value) => setFilters(prev => ({ ...prev, role: value }))}
                                >
                                    <SelectTrigger className="w-full bg-slate-800/50 border-slate-700 text-white font-poppins">
                                        <SelectValue placeholder="All Roles" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="all">All Roles</SelectItem>
                                        <SelectItem value="viewer">Viewer</SelectItem>
                                        <SelectItem value="editor">Editor</SelectItem>
                                        <SelectItem value="admin">Admin</SelectItem>
                                        <SelectItem value="super_admin">Super Admin</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>

                            <div className="w-[140px]">
                                <Label htmlFor="activity" className="text-sm font-medium text-slate-300 mb-2 block font-poppins">Activity</Label>
                                <Select
                                    value={filters.activity}
                                    onValueChange={(value) => setFilters(prev => ({ ...prev, activity: value }))}
                                >
                                    <SelectTrigger className="w-full bg-slate-800/50 border-slate-700 text-white font-poppins">
                                        <SelectValue placeholder="All Activity" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="all">All Activity</SelectItem>
                                        <SelectItem value="Active">Active</SelectItem>
                                        <SelectItem value="Moderate">Moderate</SelectItem>
                                        <SelectItem value="Inactive">Inactive</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>

                            <div className="w-[120px]">
                                <Button
                                    onClick={() => setFilters({ department: 'all', role: 'all', activity: 'all', search: '' })}
                                    variant="outline"
                                    className="w-full bg-slate-800/50 hover:bg-slate-700 border-slate-600 text-slate-300 hover:text-white font-poppins"
                                >
                                    Clear Filters
                                </Button>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                {/* Users List */}
                <Card className="bg-gray-800/50 border-gray-800">
                    <CardHeader>
                        <CardTitle className="text-white flex items-center">
                            <Icon icon="heroicons:users-16-solid" className="mr-2 h-5 w-5 text-purple-400" />
                            Users ({filteredUsers.length})
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-3">
                            {filteredUsers.length > 0 ? (
                                filteredUsers.map((user) => (
                                    <div key={user.$id} className="flex items-center justify-between p-4 bg-gray-900/50 rounded-lg border border-gray-800/50">
                                        <div className="flex items-center gap-4">
                                            <UserAvatar user={user} className="w-12 h-12" />
                                            <div className="flex-1 min-w-0">
                                                <div className="flex items-center gap-2 mb-1">
                                                    <span className="font-medium text-white">{user.username}</span>
                                                    {user.$id === currentUser?.$id && (
                                                        <span className="text-xs font-semibold text-purple-400 bg-purple-500/20 px-2 py-0.5 rounded-full">
                                                            You
                                                        </span>
                                                    )}
                                                </div>
                                                <div className="flex items-center gap-2 text-sm text-gray-400 mb-1">
                                                    <span>{user.gameCharacterName || 'No character name'}</span>
                                                    {user.callsign && (
                                                        <>
                                                            <span>•</span>
                                                            <span className="font-mono text-purple-300">{user.callsign}</span>
                                                        </>
                                                    )}
                                                    {user.rank && (
                                                        <>
                                                            <span>•</span>
                                                            <span>{user.rank}</span>
                                                        </>
                                                    )}
                                                </div>
                                                <div className="flex items-center gap-2 text-xs text-gray-500">
                                                    <span>{user.email}</span>
                                                    {user.assignment && (
                                                        <>
                                                            <span>•</span>
                                                            <span>{user.assignment}</span>
                                                        </>
                                                    )}
                                                </div>
                                            </div>
                                        </div>

                                        <div className="flex items-center gap-3">
                                            {/* Status Badges */}
                                            <div className="flex flex-col gap-1">
                                                <div className="flex items-center gap-1">
                                                    <Tooltip>
                                                        <TooltipTrigger>
                                                            <Badge
                                                                variant="outline"
                                                                className={`text-xs ${roleColors[user.role]}`}
                                                            >
                                                                {user.role.replace('_', ' ').toUpperCase()}
                                                            </Badge>
                                                        </TooltipTrigger>
                                                        <TooltipContent className="bg-gray-900 border-gray-800 text-white">
                                                            <p>{roleDescriptions[user.role]}</p>
                                                        </TooltipContent>
                                                    </Tooltip>

                                                    {user.activity && (
                                                        <Badge
                                                            variant="outline"
                                                            className={`text-xs ${activityColors[user.activity]}`}
                                                        >
                                                            {user.activity}
                                                        </Badge>
                                                    )}
                                                </div>

                                                <div className="flex items-center gap-1">
                                                    {user.status && (
                                                        <Badge
                                                            variant="outline"
                                                            className={`text-xs ${statusColors[user.status]}`}
                                                        >
                                                            {user.status}
                                                        </Badge>
                                                    )}

                                                    {user.isFTO && (
                                                        <Badge variant="outline" className="text-xs bg-blue-100/10 text-blue-300 border border-blue-500/50">
                                                            FTO
                                                        </Badge>
                                                    )}

                                                    {user.isSoloCleared && (
                                                        <Badge variant="outline" className="text-xs bg-green-100/10 text-green-300 border border-green-500/50">
                                                            Solo
                                                        </Badge>
                                                    )}
                                                </div>
                                            </div>

                                            {/* Actions */}
                                            {canModifyUser(user) ? (
                                                <Dialog>
                                                    <DialogTrigger asChild>
                                                        <Button
                                                            variant="outline"
                                                            size="sm"
                                                            onClick={() => handleEditUser(user)}
                                                            className="border-gray-600 text-gray-300 hover:bg-gray-700"
                                                        >
                                                            <Icon icon="heroicons:pencil-16-solid" className="h-4 w-4 mr-1" />
                                                            Edit
                                                        </Button>
                                                    </DialogTrigger>
                                                    <DialogContent className="bg-gray-800 border-gray-800 text-white max-w-4xl max-h-[90vh] overflow-y-auto">
                                                        <DialogHeader>
                                                            <DialogTitle className="text-xl font-bold">
                                                                Edit User: {editingUser?.username}
                                                            </DialogTitle>
                                                        </DialogHeader>

                                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 py-4">
                                                            {/* Basic Information */}
                                                            <div className="space-y-4">
                                                                <h3 className="text-lg font-semibold text-purple-400 border-b border-gray-800 pb-2">
                                                                    Basic Information
                                                                </h3>

                                                                <div className="space-y-2">
                                                                    <Label htmlFor="username" className="text-gray-300">Username</Label>
                                                                    <Input
                                                                        id="username"
                                                                        value={editFormData.username}
                                                                        onChange={(e) => setEditFormData(prev => ({ ...prev, username: e.target.value }))}
                                                                        className="bg-gray-700 border-gray-600 text-white"
                                                                    />
                                                                </div>

                                                                <div className="space-y-2">
                                                                    <Label htmlFor="gameCharacterName" className="text-gray-300">Character Name</Label>
                                                                    <Input
                                                                        id="gameCharacterName"
                                                                        value={editFormData.gameCharacterName}
                                                                        onChange={(e) => setEditFormData(prev => ({ ...prev, gameCharacterName: e.target.value }))}
                                                                        className="bg-gray-700 border-gray-600 text-white"
                                                                    />
                                                                </div>

                                                                <div className="space-y-2">
                                                                    <Label htmlFor="rank" className="text-gray-300">Rank</Label>
                                                                    <Input
                                                                        id="rank"
                                                                        value={editFormData.rank}
                                                                        onChange={(e) => setEditFormData(prev => ({ ...prev, rank: e.target.value }))}
                                                                        className="bg-gray-700 border-gray-600 text-white"
                                                                    />
                                                                </div>

                                                                <div className="space-y-2">
                                                                    <Label htmlFor="jobTitle" className="text-gray-300">Job Title</Label>
                                                                    <Input
                                                                        id="jobTitle"
                                                                        value={editFormData.jobTitle}
                                                                        onChange={(e) => setEditFormData(prev => ({ ...prev, jobTitle: e.target.value }))}
                                                                        className="bg-gray-700 border-gray-600 text-white"
                                                                        placeholder="e.g., Chief of Staff, Captain (Doctor), EMT"
                                                                    />
                                                                </div>

                                                                <div className="space-y-2">
                                                                    <Label htmlFor="assignment" className="text-gray-300">Assignment</Label>
                                                                    <Input
                                                                        id="assignment"
                                                                        value={editFormData.assignment}
                                                                        onChange={(e) => setEditFormData(prev => ({ ...prev, assignment: e.target.value }))}
                                                                        className="bg-gray-700 border-gray-600 text-white"
                                                                        placeholder="e.g., Command, Medic Supervisor, Entry Level Medic"
                                                                    />
                                                                </div>

                                                                <div className="space-y-2">
                                                                    <Label htmlFor="role" className="text-gray-300">System Role</Label>
                                                                    <Select
                                                                        value={editFormData.role}
                                                                        onValueChange={(value) => setEditFormData(prev => ({ ...prev, role: value as UserRole }))}
                                                                    >
                                                                        <SelectTrigger className="bg-gray-700 border-gray-600 text-white">
                                                                            <SelectValue />
                                                                        </SelectTrigger>
                                                                        <SelectContent className="bg-gray-800 border-gray-800 text-white">
                                                                            <SelectItem value="viewer">Viewer</SelectItem>
                                                                            <SelectItem value="editor">Editor</SelectItem>
                                                                            {isSuperAdmin && <SelectItem value="admin">Admin</SelectItem>}
                                                                            {isSuperAdmin && <SelectItem value="super_admin">Super Admin</SelectItem>}
                                                                        </SelectContent>
                                                                    </Select>
                                                                </div>
                                                            </div>

                                                            {/* Contact & Status */}
                                                            <div className="space-y-4">
                                                                <h3 className="text-lg font-semibold text-purple-400 border-b border-gray-800 pb-2">
                                                                    Contact & Status
                                                                </h3>

                                                                <div className="space-y-2">
                                                                    <Label htmlFor="callsign" className="text-gray-300">Callsign</Label>
                                                                    <Input
                                                                        id="callsign"
                                                                        value={editFormData.callsign}
                                                                        onChange={(e) => setEditFormData(prev => ({ ...prev, callsign: e.target.value }))}
                                                                        className="bg-gray-700 border-gray-600 text-white"
                                                                        placeholder="e.g., M-1, E-23"
                                                                    />
                                                                </div>

                                                                <div className="space-y-2">
                                                                    <Label htmlFor="phoneNumber" className="text-gray-300">Phone Number</Label>
                                                                    <Input
                                                                        id="phoneNumber"
                                                                        value={editFormData.phoneNumber}
                                                                        onChange={(e) => setEditFormData(prev => ({ ...prev, phoneNumber: e.target.value }))}
                                                                        className="bg-gray-700 border-gray-600 text-white"
                                                                        placeholder="e.g., (555) 123-4567"
                                                                    />
                                                                </div>

                                                                <div className="space-y-2">
                                                                    <Label htmlFor="discordUsername" className="text-gray-300">Discord Username</Label>
                                                                    <Input
                                                                        id="discordUsername"
                                                                        value={editFormData.discordUsername}
                                                                        onChange={(e) => setEditFormData(prev => ({ ...prev, discordUsername: e.target.value }))}
                                                                        className="bg-gray-700 border-gray-600 text-white"
                                                                        placeholder="e.g., username#1234"
                                                                    />
                                                                </div>

                                                                <div className="space-y-2">
                                                                    <Label htmlFor="timezone" className="text-gray-300">Timezone</Label>
                                                                    <Input
                                                                        id="timezone"
                                                                        value={editFormData.timezone}
                                                                        onChange={(e) => setEditFormData(prev => ({ ...prev, timezone: e.target.value }))}
                                                                        className="bg-gray-700 border-gray-600 text-white"
                                                                        placeholder="e.g., EST, PST, UTC-5"
                                                                    />
                                                                </div>

                                                                <div className="space-y-2">
                                                                    <Label htmlFor="activity" className="text-gray-300">Activity Level</Label>
                                                                    <Select
                                                                        value={editFormData.activity}
                                                                        onValueChange={(value) => setEditFormData(prev => ({ ...prev, activity: value as 'Active' | 'Moderate' | 'Inactive' }))}
                                                                    >
                                                                        <SelectTrigger className="bg-gray-700 border-gray-600 text-white">
                                                                            <SelectValue />
                                                                        </SelectTrigger>
                                                                        <SelectContent className="bg-gray-800 border-gray-800 text-white">
                                                                            <SelectItem value="Active">Active</SelectItem>
                                                                            <SelectItem value="Moderate">Moderate</SelectItem>
                                                                            <SelectItem value="Inactive">Inactive</SelectItem>
                                                                        </SelectContent>
                                                                    </Select>
                                                                </div>

                                                                <div className="space-y-2">
                                                                    <Label htmlFor="status" className="text-gray-300">Employment Status</Label>
                                                                    <Select
                                                                        value={editFormData.status}
                                                                        onValueChange={(value) => setEditFormData(prev => ({ ...prev, status: value as 'Full-Time' | 'Part-Time' | 'On-Call' }))}
                                                                    >
                                                                        <SelectTrigger className="bg-gray-700 border-gray-600 text-white">
                                                                            <SelectValue />
                                                                        </SelectTrigger>
                                                                        <SelectContent className="bg-gray-800 border-gray-800 text-white">
                                                                            <SelectItem value="Full-Time">Full-Time</SelectItem>
                                                                            <SelectItem value="Part-Time">Part-Time</SelectItem>
                                                                            <SelectItem value="On-Call">On-Call</SelectItem>
                                                                        </SelectContent>
                                                                    </Select>
                                                                </div>

                                                                {/* Certifications */}
                                                                <div className="space-y-3">
                                                                    <Label className="text-gray-300">Certifications</Label>
                                                                    <div className="space-y-2">
                                                                        <div className="flex items-center space-x-2">
                                                                            <input
                                                                                type="checkbox"
                                                                                id="isFTO"
                                                                                checked={editFormData.isFTO}
                                                                                onChange={(e) => setEditFormData(prev => ({ ...prev, isFTO: e.target.checked }))}
                                                                                className="rounded border-gray-600 bg-gray-700 text-purple-600 focus:ring-purple-500"
                                                                            />
                                                                            <Label htmlFor="isFTO" className="text-sm text-gray-300">
                                                                                Field Training Officer (FTO)
                                                                            </Label>
                                                                        </div>
                                                                        <div className="flex items-center space-x-2">
                                                                            <input
                                                                                type="checkbox"
                                                                                id="isSoloCleared"
                                                                                checked={editFormData.isSoloCleared}
                                                                                onChange={(e) => setEditFormData(prev => ({ ...prev, isSoloCleared: e.target.checked }))}
                                                                                className="rounded border-gray-600 bg-gray-700 text-purple-600 focus:ring-purple-500"
                                                                            />
                                                                            <Label htmlFor="isSoloCleared" className="text-sm text-gray-300">
                                                                                Solo Cleared
                                                                            </Label>
                                                                        </div>
                                                                    </div>
                                                                </div>
                                                            </div>
                                                        </div>

                                                        <div className="flex justify-end gap-3 pt-4 border-t border-gray-800">
                                                            <Button
                                                                variant="outline"
                                                                onClick={() => setEditingUser(null)}
                                                                className="border-gray-600 text-gray-300"
                                                            >
                                                                Cancel
                                                            </Button>
                                                            <Button
                                                                onClick={handleSaveUser}
                                                                disabled={saveLoading}
                                                                className="bg-purple-600 hover:bg-purple-700 text-white"
                                                            >
                                                                {saveLoading ? (
                                                                    <>
                                                                        <Icon icon="heroicons:arrow-path-16-solid" className="h-4 w-4 mr-2 animate-spin" />
                                                                        Saving...
                                                                    </>
                                                                ) : (
                                                                    <>
                                                                        <Icon icon="heroicons:check-16-solid" className="h-4 w-4 mr-2" />
                                                                        Save Changes
                                                                    </>
                                                                )}
                                                            </Button>
                                                        </div>
                                                    </DialogContent>
                                                </Dialog>
                                            ) : (
                                                <div className="text-sm text-gray-500 italic">
                                                    {user.$id === currentUser.$id ? 'You' : 'Locked'}
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                ))
                            ) : (
                                <div className="text-center py-8 text-gray-400">
                                    <Icon icon="heroicons:user-group-16-solid" className="h-12 w-12 mx-auto mb-2 text-gray-500" />
                                    No users found matching your criteria.
                                </div>
                            )}
                        </div>
                    </CardContent>
                </Card>
            </div>
        </TooltipProvider>
    );
} 