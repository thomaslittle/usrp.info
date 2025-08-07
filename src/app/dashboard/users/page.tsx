'use client';

import React, { useState, useEffect } from 'react';
import { Icon } from '@iconify/react';
import { Check, ChevronsUpDown } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem } from '@/components/ui/command';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Preloader } from '@/components/ui/preloader';
import { UserDataTable } from '@/components/user-data-table';
import { Checkbox } from '@/components/ui/checkbox';
import { Badge } from '@/components/ui/badge';
import { UserAvatar } from '@/components/user-avatar';
import { UserHoverCard } from '@/components/user-hover-card';
import { sortUsersByRank } from '@/lib/rank-utils';
import Link from 'next/link';
import { getCurrentUser } from '@/lib/auth';
import { getAppwriteSessionToken, cn } from '@/lib/utils';
import { User, UserRole } from '@/types';

const roleColors = {
    viewer: 'default',
    editor: 'blue',
    admin: 'sky',
    super_admin: 'green'
} as const;

const departmentColors = {
    ems: 'green',
    fire: 'blue',
    police: 'blue',
    dispatch: 'sky',
    admin: 'default'
} as const;

const getRankColor = (rank: string) => {
    const lowerRank = rank.toLowerCase();
    if (lowerRank.includes('chief') || lowerRank.includes('head')) {
        return 'text-yellow-400 font-bold';
    }
    if (lowerRank.includes('captain') || lowerRank.includes('lieutenant')) {
        return 'text-purple-400';
    }
    if (lowerRank.includes('attending') || lowerRank.includes('paramedic') || lowerRank.includes('sr. emt') || lowerRank.includes('specialist')) {
        return 'text-sky-400';
    }
    if (lowerRank.includes('doctor')) {
        return 'text-green-400';
    }
    if (lowerRank.includes('intern')) {
        return 'text-gray-400';
    }
    return 'text-white';
};

interface EditUserFormData {
    email: string;
    username: string;
    department: 'ems' | 'police' | 'doj' | 'fire' | 'government';
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
    isWaterRescue: boolean;
    isCoPilotCert: boolean;
    isAviationCert: boolean;
    isPsychNeuro: boolean;
    role: UserRole;
    linkedUserId: string;
}

export default function UserManagementPage() {
    const [currentUser, setCurrentUser] = useState<User | null>(null);
    const [users, setUsers] = useState<User[]>([]);
    const [filteredUsers, setFilteredUsers] = useState<User[]>([]);
    const [loading, setLoading] = useState(true);
    const [setupLoading, setSetupLoading] = useState(false);
    const [viewMode, setViewMode] = useState<'compact' | 'expanded'>('compact');
    const [selectedUsers, setSelectedUsers] = useState<Set<string>>(new Set());
    const [editingUser, setEditingUser] = useState<User | null>(null);
    const [editFormData, setEditFormData] = useState<EditUserFormData>({
        email: '',
        username: '',
        department: 'ems',
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
        isWaterRescue: false,
        isCoPilotCert: false,
        isAviationCert: false,
        isPsychNeuro: false,
        role: 'viewer',
        linkedUserId: ''
    });
    const [saveLoading, setSaveLoading] = useState(false);
    const [comboboxOpen, setComboboxOpen] = useState(false);
    const [showUnlinkConfirm, setShowUnlinkConfirm] = useState(false);
    const [filters, setFilters] = useState({
        department: 'all',
        role: 'all',
        activity: 'all',
        search: ''
    });

    const loadUsers = async () => {
        setLoading(true);
        try {
            const authUser = await getCurrentUser();
            if (!authUser) return;

            const sessionToken = getAppwriteSessionToken();

            const profileResponse = await fetch(`/api/users/profile?email=${encodeURIComponent(authUser.email)}`, {
                headers: {
                    ...(sessionToken && { 'X-Fallback-Cookies': sessionToken })
                }
            });
            if (!profileResponse.ok) {
                console.error('Failed to get user profile');
                setLoading(false);
                return;
            }
            const profileData = await profileResponse.json();
            if (!profileData.user) {
                console.error('User profile not found');
                setLoading(false);
                return;
            }

            setCurrentUser(profileData.user as User);

            if (!['admin', 'super_admin'].includes(profileData.user.role)) {
                setLoading(false);
                return;
            }

            const usersResponse = await fetch(`/api/users?email=${encodeURIComponent(authUser.email)}&limit=1000`);
            if (!usersResponse.ok) {
                console.error('Failed to load users');
                setLoading(false);
                return;
            }
            const usersData = await usersResponse.json();
            const allUsers = usersData.users as User[];

            // Sort users by rank before setting state
            const sortedUsers = sortUsersByRank(allUsers);

            setUsers(sortedUsers);
            setFilteredUsers(sortedUsers);
        } catch (error) {
            console.error('Error loading users:', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
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
            window.location.reload();
        } catch (error) {
            console.error('Error setting up super admin:', error);
            alert(error instanceof Error ? error.message : 'Failed to set up super admin');
        } finally {
            setSetupLoading(false);
        }
    };

    useEffect(() => {
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

        // Apply rank sorting to filtered results
        const sortedFiltered = sortUsersByRank(filtered);
        setFilteredUsers(sortedFiltered);
    }, [users, filters]);

    const handleRoleChange = async (userId: string, newRole: UserRole) => {
        if (!currentUser) return;
        if (currentUser.role !== 'super_admin' && currentUser.role !== 'admin') {
            alert('You do not have permission to change user roles');
            return;
        }

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
                throw new Error(errorData.error || 'Failed to update role');
            }

            const updatedUser = await response.json();
            setUsers(prevUsers => prevUsers.map(u => u.$id === userId ? { ...u, role: updatedUser.role } : u));
        } catch (error) {
            console.error('Error updating role:', error);
            alert(error instanceof Error ? error.message : 'An unknown error occurred');
        }
    };

    const handleEditUser = (user: User) => {
        setEditingUser(user);
        setEditFormData({
            email: user.email,
            username: user.username,
            department: user.department,
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
            isWaterRescue: user.isWaterRescue || false,
            isCoPilotCert: user.isCoPilotCert || false,
            isAviationCert: user.isAviationCert || false,
            isPsychNeuro: user.isPsychNeuro || false,
            role: user.role,
            linkedUserId: user.linkedUserId || ''
        });
    };

    const handleSaveUser = async () => {
        if (!editingUser || !currentUser) return;

        setSaveLoading(true);
        try {
            const response = await fetch(`/api/users/${editingUser.$id}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    ...editFormData,
                    currentUserEmail: currentUser.email,
                }),
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.error || 'Failed to save user');
            }

            const updatedUser = await response.json();
            setUsers(prevUsers => prevUsers.map(u => (u.$id === updatedUser.$id ? updatedUser : u)));
            setEditingUser(null);

            // Reload users to ensure linked user data is properly updated
            await loadUsers();
        } catch (error) {
            console.error('Error saving user:', error);
            alert(error instanceof Error ? error.message : 'An unknown error occurred');
        } finally {
            setSaveLoading(false);
        }
    };

    const canModifyUser = (user: User) => {
        if (!currentUser) return false;
        if (currentUser.role === 'super_admin') {
            return currentUser.$id !== user.$id;
        }
        if (currentUser.role === 'admin') {
            return !['admin', 'super_admin'].includes(user.role) && currentUser.department === user.department;
        }
        return false;
    };

    if (loading) {
        return <div className="p-6"><Preloader text="Loading users..." size="md" /></div>;
    }

    if (currentUser && !['admin', 'super_admin'].includes(currentUser.role)) {
        return (
            <div className="p-6 space-y-6">
                <Card>
                    <CardHeader>
                        <CardTitle>Access Denied</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <p>You do not have permission to manage users.</p>
                        {currentUser.role === 'viewer' && (
                            <div className="mt-4">
                                <p>Your current role is 'Viewer'. You need to be an 'Admin' or 'Super Admin' to access this page.</p>
                                {!users.some(u => u.role === 'super_admin') && (
                                    <div className="mt-4 p-4 bg-yellow-900/50 border border-yellow-700 rounded-lg">
                                        <p className="font-bold text-yellow-300">System Setup Required</p>
                                        <p className="text-yellow-400">No Super Admin is configured in the system. As the first user, you can promote yourself.</p>
                                        <Button onClick={handleSetupSuperAdmin} disabled={setupLoading} className="mt-2">
                                            {setupLoading ? 'Setting up...' : 'Promote to Super Admin'}
                                        </Button>
                                    </div>
                                )}
                            </div>
                        )}
                    </CardContent>
                </Card>
            </div>
        );
    }

    const handlePromoteUser = async (userId: string, newRole: UserRole) => {
        try {
            // Find the user to get their email
            const userToPromote = users.find(user => user.$id === userId);
            if (!userToPromote) {
                throw new Error('User not found');
            }

            const sessionToken = getAppwriteSessionToken();
            const response = await fetch(`/api/admin/promote-user`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    ...(sessionToken && { 'X-Fallback-Cookies': sessionToken })
                },
                body: JSON.stringify({
                    email: userToPromote.email,
                    role: newRole,
                    currentUserEmail: currentUser?.email
                }),
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.error || 'Failed to promote user');
            }

            setUsers(prev => prev.map(user =>
                user.$id === userId ? { ...user, role: newRole } : user
            ));
        } catch (error) {
            console.error('Error promoting user:', error);
            alert('Failed to promote user: ' + (error instanceof Error ? error.message : 'Unknown error'));
        }
    };

    const handleDeleteUser = async (userId: string) => {
        if (!confirm('Are you sure you want to delete this user?')) return;

        try {
            const sessionToken = getAppwriteSessionToken();
            const response = await fetch(`/api/users/${userId}`, {
                method: 'DELETE',
                headers: {
                    'Content-Type': 'application/json',
                    ...(sessionToken && { 'X-Fallback-Cookies': sessionToken })
                },
                body: JSON.stringify({
                    currentUserEmail: currentUser?.email
                })
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.error || 'Failed to delete user');
            }

            setUsers(prev => prev.filter(user => user.$id !== userId));
            setSelectedUsers(prev => {
                const newSet = new Set(prev);
                newSet.delete(userId);
                return newSet;
            });
        } catch (error) {
            console.error('Error deleting user:', error);
            alert(`Failed to delete user: ${error instanceof Error ? error.message : 'Unknown error'}`);
        }
    };

    const handleSelectUser = (userId: string, checked: boolean) => {
        setSelectedUsers(prev => {
            const newSet = new Set(prev);
            if (checked) {
                newSet.add(userId);
            } else {
                newSet.delete(userId);
            }
            return newSet;
        });
    };

    const handleSelectAll = (checked: boolean) => {
        if (checked) {
            setSelectedUsers(new Set(filteredUsers.map(user => user.$id)));
        } else {
            setSelectedUsers(new Set());
        }
    };

    const handleBulkDelete = async () => {
        if (selectedUsers.size === 0) return;
        if (!confirm(`Are you sure you want to delete ${selectedUsers.size} user(s)?`)) return;

        try {
            const sessionToken = getAppwriteSessionToken();
            const deletePromises = Array.from(selectedUsers).map(userId =>
                fetch(`/api/users/${userId}`, {
                    method: 'DELETE',
                    headers: {
                        'Content-Type': 'application/json',
                        ...(sessionToken && { 'X-Fallback-Cookies': sessionToken })
                    },
                    body: JSON.stringify({
                        currentUserEmail: currentUser?.email
                    })
                })
            );

            const responses = await Promise.all(deletePromises);
            const failedDeletes = responses.filter(response => !response.ok);

            if (failedDeletes.length > 0) {
                alert(`Failed to delete ${failedDeletes.length} user(s)`);
            }

            setUsers(prev => prev.filter(user => !selectedUsers.has(user.$id)));
            setSelectedUsers(new Set());
        } catch (error) {
            console.error('Error bulk deleting users:', error);
            alert('Failed to delete some users');
        }
    };

    return (
        <div className="relative py-8">
            <div className="container mx-auto px-6 lg:px-8">
                {/* Enhanced Header */}
                <div className="mb-8">
                    <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
                        <div>
                            <h1 className="text-4xl font-bold text-white mb-3 bg-gradient-to-r from-white to-gray-300 bg-clip-text text-transparent">
                                User Management
                            </h1>
                            <p className="text-xl text-gray-300">
                                Manage user accounts and permissions across the platform
                            </p>
                        </div>

                        <div className="flex gap-3">
                            <Button
                                asChild
                                className="bg-gradient-to-r from-sky-600 to-sky-700 hover:from-sky-700 hover:to-sky-800 shadow-lg shadow-sky-500/25 transition-all duration-300 hover:shadow-sky-500/40 hover:scale-105"
                            >
                                <Link href="/dashboard/users/create" className="flex items-center gap-2">
                                    <Icon icon="heroicons:user-plus-16-solid" className="h-4 w-4" />
                                    Create User
                                </Link>
                            </Button>
                        </div>
                    </div>
                </div>


                {/* User Views */}
                <Tabs value={viewMode} onValueChange={(value) => setViewMode(value as 'compact' | 'expanded')} className="w-full">

                    <TabsContent value="compact" className="space-y-4 overflow-x-auto">
                        <UserDataTable
                            data={filteredUsers}
                            currentUser={currentUser}
                            onPromoteUser={handlePromoteUser}
                            onDeleteUser={handleDeleteUser}
                            onEditUser={async (userId: string, userData: Partial<User>) => {
                                try {
                                    const response = await fetch(`/api/users/${userId}`, {
                                        method: 'PUT',
                                        headers: {
                                            'Content-Type': 'application/json',
                                        },
                                        body: JSON.stringify(userData),
                                    });

                                    if (!response.ok) {
                                        const errorData = await response.json();
                                        throw new Error(errorData.error || 'Failed to save user');
                                    }

                                    const updatedUser = await response.json();
                                    setUsers(prevUsers => prevUsers.map(u => (u.$id === updatedUser.$id ? updatedUser : u)));
                                } catch (error) {
                                    console.error('Error saving user:', error);
                                    throw error;
                                }
                            }}
                        />
                    </TabsContent>

                    <TabsContent value="expanded" className="mt-0">
                        {/* Enhanced Expanded View */}
                        <div className="space-y-6">
                            {/* Enhanced Bulk Actions Bar */}
                            {selectedUsers.size > 0 && (
                                <Card className="bg-gradient-to-r from-purple-900/30 to-purple-800/30 border border-purple-500/50 backdrop-blur-sm shadow-lg shadow-purple-500/10">
                                    <CardContent className="p-4">
                                        <div className="flex items-center justify-between">
                                            <div className="flex items-center space-x-4">
                                                <div className="bg-purple-500/20 p-2 rounded-lg">
                                                    <Icon icon="heroicons:check-circle-16-solid" className="h-5 w-5 text-purple-400" />
                                                </div>
                                                <span className="text-purple-300 font-medium">
                                                    {selectedUsers.size} user(s) selected
                                                </span>
                                                <Button
                                                    variant="outline"
                                                    size="sm"
                                                    onClick={() => setSelectedUsers(new Set())}
                                                    className="text-gray-300 border-gray-600 hover:bg-gray-700/50 transition-all duration-300"
                                                >
                                                    <Icon icon="heroicons:x-mark-16-solid" className="h-4 w-4 mr-1" />
                                                    Clear
                                                </Button>
                                            </div>
                                            <div className="flex items-center space-x-2">
                                                <Button
                                                    variant="outline"
                                                    size="sm"
                                                    onClick={handleBulkDelete}
                                                    className="text-red-400 border-red-400/50 hover:bg-red-400 hover:text-white transition-all duration-300"
                                                >
                                                    <Icon icon="heroicons:trash-16-solid" className="mr-1 h-4 w-4" />
                                                    Delete Selected
                                                </Button>
                                            </div>
                                        </div>
                                    </CardContent>
                                </Card>
                            )}

                            {/* Enhanced Filters */}
                            <Card className="bg-gradient-to-r from-gray-800/60 to-gray-900/60 border border-gray-700/50 backdrop-blur-sm">
                                <CardHeader className="pb-4">
                                    <div className="flex items-center justify-between">
                                        <CardTitle className="text-white flex items-center gap-3">
                                            <div className="bg-sky-500/20 p-2 rounded-lg">
                                                <Icon icon="heroicons:funnel-16-solid" className="h-5 w-5 text-sky-400" />
                                            </div>
                                            Filters & Selection
                                        </CardTitle>
                                        <div className="flex items-center space-x-3">
                                            <Checkbox
                                                checked={selectedUsers.size === filteredUsers.length && filteredUsers.length > 0}
                                                onCheckedChange={handleSelectAll}
                                                aria-label="Select all users"
                                                className="border-sky-500/50 data-[state=checked]:bg-sky-600"
                                            />
                                            <Label className="text-sm text-gray-300 font-medium">Select All</Label>
                                        </div>
                                    </div>
                                </CardHeader>
                                <CardContent className="pt-0">
                                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                        <div>
                                            <Label htmlFor="role" className="block mb-2 text-gray-300">Role</Label>
                                            <Select
                                                value={filters.role}
                                                onValueChange={(value) => setFilters(prev => ({ ...prev, role: value as UserRole | 'all' }))}
                                            >
                                                <SelectTrigger className="bg-gray-800/50 border-gray-700/50 text-white focus:border-sky-500/50">
                                                    <SelectValue placeholder="All roles" />
                                                </SelectTrigger>
                                                <SelectContent className="bg-gray-800/90 border-gray-700/50 backdrop-blur-md">
                                                    <SelectItem value="all" className="text-gray-300">All Roles</SelectItem>
                                                    <SelectItem value="viewer" className="text-gray-300">Viewer</SelectItem>
                                                    <SelectItem value="editor" className="text-gray-300">Editor</SelectItem>
                                                    <SelectItem value="admin" className="text-gray-300">Admin</SelectItem>
                                                    <SelectItem value="super_admin" className="text-gray-300">Super Admin</SelectItem>
                                                </SelectContent>
                                            </Select>
                                        </div>
                                        <div>
                                            <Label htmlFor="department" className="block mb-2 text-gray-300">Department</Label>
                                            <Select
                                                value={filters.department}
                                                onValueChange={(value) => setFilters(prev => ({ ...prev, department: value }))}
                                            >
                                                <SelectTrigger className="bg-gray-800/50 border-gray-700/50 text-white focus:border-sky-500/50">
                                                    <SelectValue placeholder="All departments" />
                                                </SelectTrigger>
                                                <SelectContent className="bg-gray-800/90 border-gray-700/50 backdrop-blur-md">
                                                    <SelectItem value="all" className="text-gray-300">All Departments</SelectItem>
                                                    <SelectItem value="ems" className="text-gray-300">EMS</SelectItem>
                                                    <SelectItem value="fire" className="text-gray-300">Fire</SelectItem>
                                                    <SelectItem value="police" className="text-gray-300">Police</SelectItem>
                                                    <SelectItem value="dispatch" className="text-gray-300">Dispatch</SelectItem>
                                                    <SelectItem value="admin" className="text-gray-300">Admin</SelectItem>
                                                </SelectContent>
                                            </Select>
                                        </div>
                                        <div className="flex items-end">
                                            <Button
                                                variant="outline"
                                                onClick={() => setFilters({ department: 'all', role: 'all', activity: 'all', search: '' })}
                                                className="w-full border-gray-600 text-gray-300 hover:bg-red-500/10 hover:border-red-500/50 transition-all duration-300"
                                            >
                                                <Icon icon="heroicons:x-mark-16-solid" className="h-4 w-4 mr-2" />
                                                Clear Filters
                                            </Button>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>

                            {/* Users Grid */}
                            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
                                {filteredUsers.map((user) => (
                                    <Card key={user.$id} className={cn(
                                        "bg-gray-800/50 border border-gray-700/50 backdrop-blur-sm hover:bg-gray-800/70 transition-colors",
                                        selectedUsers.has(user.$id) && "ring-2 ring-purple-500/50 border-purple-500/30"
                                    )}>
                                        <CardHeader className="pb-3">
                                            <div className="flex items-center space-x-3">
                                                <Checkbox
                                                    checked={selectedUsers.has(user.$id)}
                                                    onCheckedChange={(checked) => handleSelectUser(user.$id, !!checked)}
                                                    aria-label={`Select ${user.username}`}
                                                />
                                                <UserAvatar user={user} className="w-12 h-12" />
                                                <div className="flex-1 min-w-0">
                                                    <h3 className="font-medium text-white truncate">
                                                        <UserHoverCard user={user}>
                                                            <span className="cursor-pointer hover:text-blue-300 transition-colors">
                                                                {user.gameCharacterName || user.username}
                                                                {user.linkedUser && <span className="text-green-400 ml-1">●</span>}
                                                            </span>
                                                        </UserHoverCard>
                                                    </h3>
                                                    <p className={`text-sm truncate ${getRankColor(user.rank || 'Unknown')}`}>
                                                        {user.rank || 'Unknown Rank'}
                                                    </p>
                                                </div>
                                            </div>
                                        </CardHeader>
                                        <CardContent className="pt-0">
                                            <div className="space-y-3">
                                                <div>
                                                    <p className="text-xs text-gray-500 font-medium uppercase tracking-wide">Role</p>
                                                    <Badge colorVariant={roleColors[user.role] || 'default'} variant="solid" className="mt-1">
                                                        {user.role.replace('_', ' ').toUpperCase()}
                                                    </Badge>
                                                </div>
                                                {user.department && (
                                                    <div>
                                                        <p className="text-xs text-gray-500 font-medium uppercase tracking-wide">Department</p>
                                                        <Badge colorVariant={departmentColors[user.department as keyof typeof departmentColors] || 'default'} variant="solid" className="mt-1">
                                                            {user.department.toUpperCase()}
                                                        </Badge>
                                                    </div>
                                                )}
                                                <div>
                                                    <p className="text-xs text-gray-500 font-medium uppercase tracking-wide">Activity</p>
                                                    <div className="flex items-center mt-1">
                                                        <div className={`w-2 h-2 rounded-full mr-2 ${user.activity === 'Active' ? 'bg-green-400' : user.activity === 'Moderate' ? 'bg-yellow-400' : 'bg-red-400'}`}></div>
                                                        <span className={`text-sm ${user.activity === 'Active' ? 'text-green-400' : user.activity === 'Moderate' ? 'text-yellow-400' : 'text-red-400'}`}>
                                                            {user.activity || 'Active'}
                                                        </span>
                                                    </div>
                                                </div>
                                                <div>
                                                    <p className="text-xs text-gray-500 font-medium uppercase tracking-wide">Joined</p>
                                                    <p className="text-sm text-gray-300 mt-1">
                                                        {new Date(user.$createdAt).toLocaleDateString()}
                                                    </p>
                                                </div>
                                            </div>
                                            {user.role !== 'super_admin' && user.$id !== currentUser?.$id && (
                                                <div className="flex gap-2 mt-4">
                                                    <Button
                                                        size="sm"
                                                        variant="outline"
                                                        className="flex-1 text-blue-400 border-blue-400 hover:bg-blue-400 hover:text-white"
                                                        onClick={() => handleEditUser(user)}
                                                    >
                                                        Manage
                                                    </Button>
                                                </div>
                                            )}
                                        </CardContent>
                                    </Card>
                                ))}
                            </div>

                            {filteredUsers.length === 0 && (
                                <div className="text-center py-12">
                                    <Icon icon="heroicons:users-16-solid" className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                                    <h3 className="text-lg font-medium text-white mb-2">No users found</h3>
                                    <p className="text-gray-400">
                                        {filters.search || filters.role !== 'all' || filters.department !== 'all'
                                            ? 'Try adjusting your filters to see more users.'
                                            : 'No users have been created yet.'
                                        }
                                    </p>
                                </div>
                            )}

                            {/* Edit User Dialog */}
                            <Dialog open={!!editingUser} onOpenChange={(open) => !open && setEditingUser(null)}>
                                <DialogContent className="bg-gray-800/50 border border-gray-800 backdrop-blur-md max-w-2xl max-h-[80vh] overflow-y-auto">
                                    <DialogHeader>
                                        <DialogTitle className="text-white">Edit User: {editingUser?.username}</DialogTitle>
                                    </DialogHeader>
                                    <div className="grid gap-4 py-4">
                                        <div className="grid grid-cols-2 gap-4">
                                            <div>
                                                <Label htmlFor="email" className="block mb-2">Email</Label>
                                                <Input
                                                    id="email"
                                                    type="email"
                                                    value={editFormData.email}
                                                    onChange={(e) => setEditFormData(prev => ({ ...prev, email: e.target.value }))}
                                                    className="bg-gray-800/70 border border-gray-700/50 text-white placeholder:text-gray-400"
                                                    disabled={currentUser?.role !== 'super_admin'}
                                                />
                                            </div>
                                            <div>
                                                <Label htmlFor="username" className="block mb-2">Username</Label>
                                                <Input
                                                    id="username"
                                                    value={editFormData.username}
                                                    onChange={(e) => setEditFormData(prev => ({ ...prev, username: e.target.value }))}
                                                    className="bg-gray-800/70 border border-gray-700/50 text-white placeholder:text-gray-400"
                                                />
                                            </div>
                                        </div>

                                        <div className="grid grid-cols-2 gap-4">
                                            <div>
                                                <Label htmlFor="department" className="block mb-2">Department</Label>
                                                <Select
                                                    value={editFormData.department}
                                                    onValueChange={(value) => setEditFormData(prev => ({ ...prev, department: value as 'ems' | 'police' | 'doj' | 'fire' | 'government' }))}
                                                    disabled={currentUser?.role !== 'super_admin'}
                                                >
                                                    <SelectTrigger className="bg-gray-800/70 border border-gray-700/50 text-white">
                                                        <SelectValue />
                                                    </SelectTrigger>
                                                    <SelectContent className="bg-gray-800/90 border border-gray-700/50 backdrop-blur-md">
                                                        <SelectItem value="ems" className="text-gray-300">EMS</SelectItem>
                                                        <SelectItem value="police" className="text-gray-300">Police</SelectItem>
                                                        <SelectItem value="fire" className="text-gray-300">Fire</SelectItem>
                                                        <SelectItem value="doj" className="text-gray-300">DOJ</SelectItem>
                                                        <SelectItem value="government" className="text-gray-300">Government</SelectItem>
                                                    </SelectContent>
                                                </Select>
                                            </div>
                                            <div>
                                                <Label htmlFor="gameCharacterName" className="block mb-2">Game Character Name</Label>
                                                <Input
                                                    id="gameCharacterName"
                                                    value={editFormData.gameCharacterName}
                                                    onChange={(e) => setEditFormData(prev => ({ ...prev, gameCharacterName: e.target.value }))}
                                                    className="bg-gray-800/70 border border-gray-700/50 text-white placeholder:text-gray-400"
                                                />
                                            </div>
                                        </div>

                                        <div className="grid grid-cols-2 gap-4">
                                            <div>
                                                <Label htmlFor="rank" className="block mb-2">Rank</Label>
                                                <Input
                                                    id="rank"
                                                    value={editFormData.rank}
                                                    onChange={(e) => setEditFormData(prev => ({ ...prev, rank: e.target.value }))}
                                                    className="bg-gray-800/70 border border-gray-700/50 text-white placeholder:text-gray-400"
                                                />
                                            </div>
                                            <div>
                                                <Label htmlFor="jobTitle" className="block mb-2">Job Title</Label>
                                                <Input
                                                    id="jobTitle"
                                                    value={editFormData.jobTitle}
                                                    onChange={(e) => setEditFormData(prev => ({ ...prev, jobTitle: e.target.value }))}
                                                    className="bg-gray-800/70 border border-gray-700/50 text-white placeholder:text-gray-400"
                                                />
                                            </div>
                                        </div>

                                        <div className="grid grid-cols-2 gap-4">
                                            <div>
                                                <Label htmlFor="phoneNumber" className="block mb-2">Phone Number</Label>
                                                <Input
                                                    id="phoneNumber"
                                                    value={editFormData.phoneNumber}
                                                    onChange={(e) => {
                                                        const value = e.target.value.replace(/\D/g, '');
                                                        if (value.length <= 7) {
                                                            setEditFormData(prev => ({ ...prev, phoneNumber: value }));
                                                        }
                                                    }}
                                                    className="bg-gray-800/70 border border-gray-700/50 text-white placeholder:text-gray-400"
                                                    placeholder="5551234"
                                                    maxLength={7}
                                                />
                                            </div>
                                            <div>
                                                <Label htmlFor="callsign" className="block mb-2">Callsign</Label>
                                                <Input
                                                    id="callsign"
                                                    value={editFormData.callsign}
                                                    onChange={(e) => setEditFormData(prev => ({ ...prev, callsign: e.target.value }))}
                                                    className="bg-gray-800/70 border border-gray-700/50 text-white placeholder:text-gray-400"
                                                />
                                            </div>
                                        </div>

                                        <div>
                                            <Label htmlFor="assignment" className="block mb-2">Assignment</Label>
                                            <Input
                                                id="assignment"
                                                value={editFormData.assignment}
                                                onChange={(e) => setEditFormData(prev => ({ ...prev, assignment: e.target.value }))}
                                                className="bg-gray-800/70 border border-gray-700/50 text-white placeholder:text-gray-400"
                                            />
                                        </div>

                                        <div className="grid grid-cols-2 gap-4">
                                            <div>
                                                <Label htmlFor="activity" className="block mb-2">Activity</Label>
                                                <Select
                                                    value={editFormData.activity}
                                                    onValueChange={(value) => setEditFormData(prev => ({ ...prev, activity: value as 'Active' | 'Moderate' | 'Inactive' }))}
                                                >
                                                    <SelectTrigger className="bg-gray-800/70 border border-gray-700/50 text-white">
                                                        <SelectValue />
                                                    </SelectTrigger>
                                                    <SelectContent className="bg-gray-800/90 border border-gray-700/50 backdrop-blur-md">
                                                        <SelectItem value="Active" className="text-gray-300">Active</SelectItem>
                                                        <SelectItem value="Moderate" className="text-gray-300">Moderate</SelectItem>
                                                        <SelectItem value="Inactive" className="text-gray-300">Inactive</SelectItem>
                                                    </SelectContent>
                                                </Select>
                                            </div>
                                            <div>
                                                <Label htmlFor="status" className="block mb-2">Status</Label>
                                                <Select
                                                    value={editFormData.status}
                                                    onValueChange={(value) => setEditFormData(prev => ({ ...prev, status: value as 'Full-Time' | 'Part-Time' | 'On-Call' }))}
                                                >
                                                    <SelectTrigger className="bg-gray-800/70 border border-gray-700/50 text-white">
                                                        <SelectValue />
                                                    </SelectTrigger>
                                                    <SelectContent className="bg-gray-800/90 border border-gray-700/50 backdrop-blur-md">
                                                        <SelectItem value="Full-Time" className="text-gray-300">Full-Time</SelectItem>
                                                        <SelectItem value="Part-Time" className="text-gray-300">Part-Time</SelectItem>
                                                        <SelectItem value="On-Call" className="text-gray-300">On-Call</SelectItem>
                                                    </SelectContent>
                                                </Select>
                                            </div>
                                        </div>

                                        <div className="grid grid-cols-2 gap-4">
                                            <div>
                                                <Label htmlFor="timezone" className="block mb-2">Timezone</Label>
                                                <Input
                                                    id="timezone"
                                                    value={editFormData.timezone}
                                                    onChange={(e) => setEditFormData(prev => ({ ...prev, timezone: e.target.value }))}
                                                    className="bg-gray-800/70 border border-gray-700/50 text-white placeholder:text-gray-400"
                                                />
                                            </div>
                                            <div>
                                                <Label htmlFor="discordUsername" className="block mb-2">Discord Username</Label>
                                                <Input
                                                    id="discordUsername"
                                                    value={editFormData.discordUsername}
                                                    onChange={(e) => setEditFormData(prev => ({ ...prev, discordUsername: e.target.value }))}
                                                    className="bg-gray-800/70 border border-gray-700/50 text-white placeholder:text-gray-400"
                                                />
                                            </div>
                                        </div>

                                        <div className="grid grid-cols-2 gap-4">
                                            <div>
                                                <Label htmlFor="role" className="block mb-2">Role</Label>
                                                <Select
                                                    value={editFormData.role}
                                                    onValueChange={(value) => setEditFormData(prev => ({ ...prev, role: value as UserRole }))}
                                                >
                                                    <SelectTrigger className="bg-gray-800/70 border border-gray-700/50 text-white">
                                                        <SelectValue />
                                                    </SelectTrigger>
                                                    <SelectContent className="bg-gray-800/90 border border-gray-700/50 backdrop-blur-md">
                                                        <SelectItem value="viewer" className="text-gray-300">Viewer</SelectItem>
                                                        <SelectItem value="editor" className="text-gray-300">Editor</SelectItem>
                                                        <SelectItem value="admin" className="text-gray-300">Admin</SelectItem>
                                                        <SelectItem value="super_admin" className="text-gray-300">Super Admin</SelectItem>
                                                    </SelectContent>
                                                </Select>
                                            </div>
                                            <div>
                                                <Label htmlFor="linkedUserId" className="block mb-2">
                                                    Link to Auth User
                                                    <span className="text-xs text-gray-400 block">Connect this character to a real person</span>
                                                </Label>
                                                <Popover open={comboboxOpen} onOpenChange={setComboboxOpen}>
                                                    <PopoverTrigger asChild>
                                                        <Button
                                                            variant="outline"
                                                            role="combobox"
                                                            aria-expanded={comboboxOpen}
                                                            className="w-full justify-between bg-gray-800/70 border border-gray-700/50 text-white hover:bg-gray-700/70"
                                                        >
                                                            {editFormData.linkedUserId && editingUser?.linkedUser
                                                                ? `${editingUser.linkedUser.username} (${editingUser.linkedUser.email?.substring(0, 2)}***@${editingUser.linkedUser.email?.split('@')[1] || 'unknown'})`
                                                                : editFormData.linkedUserId
                                                                    ? users.find(u => u.$id === editFormData.linkedUserId)?.username || 'Unknown User'
                                                                    : 'Select user...'}
                                                            <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                                                        </Button>
                                                    </PopoverTrigger>
                                                    <PopoverContent className="w-full p-0 bg-gray-800/95 border border-gray-700/50 backdrop-blur-md">
                                                        <Command className="bg-transparent">
                                                            <CommandInput placeholder="Search users..." className="text-white" />
                                                            <CommandEmpty className="text-gray-400">No user found.</CommandEmpty>
                                                            <CommandGroup>
                                                                <CommandItem
                                                                    value="none"
                                                                    onSelect={() => {
                                                                        if (editFormData.linkedUserId) {
                                                                            setShowUnlinkConfirm(true);
                                                                        } else {
                                                                            setEditFormData(prev => ({ ...prev, linkedUserId: '' }));
                                                                        }
                                                                        setComboboxOpen(false);
                                                                    }}
                                                                    className="text-gray-300 hover:bg-gray-700/50"
                                                                >
                                                                    <Check
                                                                        className={`mr-2 h-4 w-4 ${editFormData.linkedUserId === '' ? 'opacity-100' : 'opacity-0'}`}
                                                                    />
                                                                    {editFormData.linkedUserId ? (
                                                                        <span className="text-red-400">🔗 Unlink Account</span>
                                                                    ) : (
                                                                        <span>No Link</span>
                                                                    )}
                                                                </CommandItem>
                                                                {users
                                                                    .filter(user =>
                                                                        user.$id !== editingUser?.$id &&
                                                                        !user.email?.includes('@ems.usrp.info') // Only show auth users for linking
                                                                    )
                                                                    .map((user) => (
                                                                        <CommandItem
                                                                            key={user.$id}
                                                                            value={`${user.username} ${user.email}`}
                                                                            onSelect={() => {
                                                                                setEditFormData(prev => ({ ...prev, linkedUserId: user.$id }));
                                                                                setComboboxOpen(false);
                                                                            }}
                                                                            className="text-gray-300 hover:bg-gray-700/50"
                                                                        >
                                                                            <Check
                                                                                className={`mr-2 h-4 w-4 ${editFormData.linkedUserId === user.$id ? 'opacity-100' : 'opacity-0'}`}
                                                                            />
                                                                            {user.username} ({user.email})
                                                                        </CommandItem>
                                                                    ))}
                                                            </CommandGroup>
                                                        </Command>
                                                    </PopoverContent>
                                                </Popover>
                                            </div>
                                        </div>

                                        <div className="space-y-4">
                                            <div className="flex items-center space-x-4">
                                                <div className="flex items-center space-x-2">
                                                    <Checkbox
                                                        id="isFTO"
                                                        checked={editFormData.isFTO}
                                                        onCheckedChange={(checked) => setEditFormData(prev => ({ ...prev, isFTO: !!checked }))}
                                                    />
                                                    <Label htmlFor="isFTO" className="text-sm">FTO</Label>
                                                </div>
                                                <div className="flex items-center space-x-2">
                                                    <Checkbox
                                                        id="isSoloCleared"
                                                        checked={editFormData.isSoloCleared}
                                                        onCheckedChange={(checked) => setEditFormData(prev => ({ ...prev, isSoloCleared: !!checked }))}
                                                    />
                                                    <Label htmlFor="isSoloCleared" className="text-sm">Solo Cleared</Label>
                                                </div>
                                            </div>
                                            <div className="flex items-center space-x-4">
                                                <div className="flex items-center space-x-2">
                                                    <Checkbox
                                                        id="isWaterRescue"
                                                        checked={editFormData.isWaterRescue}
                                                        onCheckedChange={(checked) => setEditFormData(prev => ({ ...prev, isWaterRescue: !!checked }))}
                                                    />
                                                    <Label htmlFor="isWaterRescue" className="text-sm">Water Rescue</Label>
                                                </div>
                                                <div className="flex items-center space-x-2">
                                                    <Checkbox
                                                        id="isCoPilotCert"
                                                        checked={editFormData.isCoPilotCert}
                                                        onCheckedChange={(checked) => setEditFormData(prev => ({ ...prev, isCoPilotCert: !!checked }))}
                                                    />
                                                    <Label htmlFor="isCoPilotCert" className="text-sm">Co-Pilot Cert.</Label>
                                                </div>
                                            </div>
                                            <div className="flex items-center space-x-4">
                                                <div className="flex items-center space-x-2">
                                                    <Checkbox
                                                        id="isAviationCert"
                                                        checked={editFormData.isAviationCert}
                                                        onCheckedChange={(checked) => setEditFormData(prev => ({ ...prev, isAviationCert: !!checked }))}
                                                    />
                                                    <Label htmlFor="isAviationCert" className="text-sm">Aviation Cert.</Label>
                                                </div>
                                                <div className="flex items-center space-x-2">
                                                    <Checkbox
                                                        id="isPsychNeuro"
                                                        checked={editFormData.isPsychNeuro}
                                                        onCheckedChange={(checked) => setEditFormData(prev => ({ ...prev, isPsychNeuro: !!checked }))}
                                                    />
                                                    <Label htmlFor="isPsychNeuro" className="text-sm">Psych/Neuro</Label>
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="flex justify-end space-x-2">
                                        <Button
                                            variant="outline"
                                            onClick={() => setEditingUser(null)}
                                            className="bg-gray-800/70 border border-gray-700/50 text-white hover:bg-gray-700/70"
                                        >
                                            Cancel
                                        </Button>
                                        <Button
                                            onClick={handleSaveUser}
                                            disabled={saveLoading}
                                            className="bg-gradient-to-r from-purple-500 to-violet-600 hover:from-purple-600 hover:to-violet-700 text-white"
                                        >
                                            {saveLoading ? 'Saving...' : 'Save Changes'}
                                        </Button>
                                    </div>
                                </DialogContent>
                            </Dialog>

                            {/* Unlink Confirmation Dialog */}
                            <Dialog open={showUnlinkConfirm} onOpenChange={setShowUnlinkConfirm}>
                                <DialogContent className="bg-gray-800/95 border border-gray-700/50 backdrop-blur-md max-w-md">
                                    <DialogHeader>
                                        <DialogTitle className="text-white flex items-center gap-2">
                                            <Icon icon="heroicons:exclamation-triangle-16-solid" className="h-5 w-5 text-yellow-400" />
                                            Unlink Account
                                        </DialogTitle>
                                    </DialogHeader>
                                    <div className="py-4">
                                        <p className="text-gray-300 mb-4">
                                            Are you sure you want to unlink this account? This will:
                                        </p>
                                        <ul className="list-disc list-inside text-sm text-gray-400 space-y-1 mb-4">
                                            <li>Remove the connection between the character and auth user</li>
                                            <li>Stop displaying stacked avatars</li>
                                            <li>Remove hover card functionality</li>
                                            <li>Allow the account to be linked to a different user</li>
                                        </ul>
                                        <p className="text-yellow-300 text-sm">
                                            You can re-link the account later if needed.
                                        </p>
                                    </div>
                                    <div className="flex justify-end space-x-2">
                                        <Button
                                            variant="outline"
                                            onClick={() => setShowUnlinkConfirm(false)}
                                            className="bg-gray-800/70 border border-gray-700/50 text-white hover:bg-gray-700/70"
                                        >
                                            Cancel
                                        </Button>
                                        <Button
                                            onClick={() => {
                                                setEditFormData(prev => ({ ...prev, linkedUserId: '' }));
                                                setShowUnlinkConfirm(false);
                                            }}
                                            className="bg-red-600 hover:bg-red-700 text-white"
                                        >
                                            <Icon icon="heroicons:link-slash-16-solid" className="h-4 w-4 mr-2" />
                                            Unlink Account
                                        </Button>
                                    </div>
                                </DialogContent>
                            </Dialog>
                        </div>
                    </TabsContent>
                </Tabs>
            </div>
        </div>
    );
} 