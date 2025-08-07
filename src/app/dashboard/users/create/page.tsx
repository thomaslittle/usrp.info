'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Icon } from '@iconify/react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import type { DepartmentType, UserRole } from '@/types';

interface CreateUserFormData {
    email: string;
    username: string;
    department: DepartmentType;
    role: UserRole;
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
}

const departments: { value: DepartmentType; label: string }[] = [
    { value: 'ems', label: 'Emergency Medical Services' },
    { value: 'police', label: 'Police Department' },
    { value: 'fire', label: 'Fire Department' },
    { value: 'doj', label: 'Department of Justice' },
    { value: 'government', label: 'Government' },
];

const roles: { value: UserRole; label: string; description: string }[] = [
    { value: 'viewer', label: 'Viewer', description: 'Can view content only' },
    { value: 'editor', label: 'Editor', description: 'Can create and edit content' },
    { value: 'admin', label: 'Admin', description: 'Can manage users and content in department' },
    { value: 'super_admin', label: 'Super Admin', description: 'Full system access' },
];

const activityLevels = [
    { value: 'Active', label: 'Active' },
    { value: 'Moderate', label: 'Moderate' },
    { value: 'Inactive', label: 'Inactive' },
] as const;

const statusOptions = [
    { value: 'Full-Time', label: 'Full-Time' },
    { value: 'Part-Time', label: 'Part-Time' },
    { value: 'On-Call', label: 'On-Call' },
] as const;

export default function CreateUserPage() {
    const router = useRouter();
    const [isLoading, setIsLoading] = useState(false);
    const [formData, setFormData] = useState<CreateUserFormData>({
        email: '',
        username: '',
        department: 'ems',
        role: 'viewer',
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
    });

    const [errors, setErrors] = useState<Partial<Record<keyof CreateUserFormData, string>>>({});

    const validateForm = (): boolean => {
        const newErrors: Partial<Record<keyof CreateUserFormData, string>> = {};

        // Required fields
        if (!formData.email.trim()) newErrors.email = 'Email is required';
        else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) newErrors.email = 'Invalid email format';

        if (!formData.username.trim()) newErrors.username = 'Username is required';
        if (!formData.department) newErrors.department = 'Department is required';
        if (!formData.role) newErrors.role = 'Role is required';

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!validateForm()) return;

        setIsLoading(true);

        try {
            const response = await fetch('/api/users/create', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(formData),
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.error || 'Failed to create user');
            }

            const result = await response.json();
            console.log('User created successfully:', result);

            // Redirect to user management page
            router.push('/dashboard/users');
        } catch (error) {
            console.error('Error creating user:', error);
            alert(`Failed to create user: ${error instanceof Error ? error.message : 'Unknown error'}`);
        } finally {
            setIsLoading(false);
        }
    };

    const handleInputChange = (field: keyof CreateUserFormData, value: string | boolean) => {
        setFormData(prev => ({ ...prev, [field]: value }));
        if (errors[field]) {
            setErrors(prev => ({ ...prev, [field]: undefined }));
        }
    };

    return (
        <div className="relative py-8">
            <div className="container mx-auto px-6 lg:px-8 max-w-4xl">
                {/* Header */}
                <div className="mb-8">
                    <div className="flex items-center gap-4 mb-6">
                        <Button
                            variant="outline"
                            size="sm"
                            asChild
                            className="border-gray-600 text-gray-300 hover:bg-gray-700/50"
                        >
                            <Link href="/dashboard/users" className="flex items-center gap-2">
                                <Icon icon="heroicons:arrow-left-16-solid" className="h-4 w-4" />
                                Back to Users
                            </Link>
                        </Button>
                    </div>

                    <div>
                        <h1 className="text-4xl font-bold text-white mb-3 bg-gradient-to-r from-white to-gray-300 bg-clip-text text-transparent">
                            Create New User
                        </h1>
                        <p className="text-xl text-gray-300">
                            Add a new user to the system with appropriate permissions
                        </p>
                    </div>
                </div>

                {/* Form */}
                <form onSubmit={handleSubmit} className="space-y-8">
                    {/* Basic Information */}
                    <Card className="bg-gray-800/70 border border-gray-700/50 backdrop-blur-sm">
                        <CardHeader>
                            <CardTitle className="text-white flex items-center gap-2">
                                <Icon icon="heroicons:user-16-solid" className="h-5 w-5 text-sky-400" />
                                Basic Information
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-6">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                {/* Email */}
                                <div>
                                    <Label htmlFor="email" className="block mb-2 text-white">
                                        Email Address <span className="text-red-400">*</span>
                                    </Label>
                                    <Input
                                        id="email"
                                        type="email"
                                        value={formData.email}
                                        onChange={(e) => handleInputChange('email', e.target.value)}
                                        className={`bg-gray-800/70 border ${errors.email ? 'border-red-500' : 'border-gray-700/50'} text-white placeholder:text-gray-400`}
                                        placeholder="user@example.com"
                                    />
                                    {errors.email && <p className="text-red-400 text-sm mt-1">{errors.email}</p>}
                                </div>

                                {/* Username */}
                                <div>
                                    <Label htmlFor="username" className="block mb-2 text-white">
                                        Username <span className="text-red-400">*</span>
                                    </Label>
                                    <Input
                                        id="username"
                                        value={formData.username}
                                        onChange={(e) => handleInputChange('username', e.target.value)}
                                        className={`bg-gray-800/70 border ${errors.username ? 'border-red-500' : 'border-gray-700/50'} text-white placeholder:text-gray-400`}
                                        placeholder="johndoe"
                                    />
                                    {errors.username && <p className="text-red-400 text-sm mt-1">{errors.username}</p>}
                                </div>

                                {/* Department */}
                                <div>
                                    <Label htmlFor="department" className="block mb-2 text-white">
                                        Department <span className="text-red-400">*</span>
                                    </Label>
                                    <Select value={formData.department} onValueChange={(value) => handleInputChange('department', value as DepartmentType)}>
                                        <SelectTrigger className={`bg-gray-800/70 border ${errors.department ? 'border-red-500' : 'border-gray-700/50'} text-white w-full`}>
                                            <SelectValue placeholder="Select department" />
                                        </SelectTrigger>
                                        <SelectContent className="bg-gray-800 border-gray-700">
                                            {departments.map((dept) => (
                                                <SelectItem key={dept.value} value={dept.value} className="text-white hover:bg-gray-700">
                                                    {dept.label}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                    {errors.department && <p className="text-red-400 text-sm mt-1">{errors.department}</p>}
                                </div>

                                {/* Role */}
                                <div>
                                    <Label htmlFor="role" className="block mb-2 text-white">
                                        Role <span className="text-red-400">*</span>
                                    </Label>
                                    <Select value={formData.role} onValueChange={(value) => handleInputChange('role', value as UserRole)}>
                                        <SelectTrigger className={`bg-gray-800/70 border ${errors.role ? 'border-red-500' : 'border-gray-700/50'} text-white w-full`}>
                                            <SelectValue placeholder="Select role" />
                                        </SelectTrigger>
                                        <SelectContent className="bg-gray-800 border-gray-700">
                                            {roles.map((role) => (
                                                <SelectItem key={role.value} value={role.value} className="text-white hover:bg-gray-700">
                                                    <div>
                                                        <div className="font-medium">{role.label}</div>
                                                        <div className="text-sm text-gray-400">{role.description}</div>
                                                    </div>
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                    {errors.role && <p className="text-red-400 text-sm mt-1">{errors.role}</p>}
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Professional Information */}
                    <Card className="bg-gray-800/70 border border-gray-700/50 backdrop-blur-sm">
                        <CardHeader>
                            <CardTitle className="text-white flex items-center gap-2">
                                <Icon icon="heroicons:briefcase-16-solid" className="h-5 w-5 text-purple-400" />
                                Professional Information
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-6">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                {/* Game Character Name */}
                                <div>
                                    <Label htmlFor="gameCharacterName" className="block mb-2 text-white">
                                        Game Character Name
                                    </Label>
                                    <Input
                                        id="gameCharacterName"
                                        value={formData.gameCharacterName}
                                        onChange={(e) => handleInputChange('gameCharacterName', e.target.value)}
                                        className="bg-gray-800/70 border border-gray-700/50 text-white placeholder:text-gray-400"
                                        placeholder="John Doe"
                                    />
                                </div>

                                {/* Rank */}
                                <div>
                                    <Label htmlFor="rank" className="block mb-2 text-white">
                                        Rank
                                    </Label>
                                    <Input
                                        id="rank"
                                        value={formData.rank}
                                        onChange={(e) => handleInputChange('rank', e.target.value)}
                                        className="bg-gray-800/70 border border-gray-700/50 text-white placeholder:text-gray-400"
                                        placeholder="Paramedic"
                                    />
                                </div>

                                {/* Job Title */}
                                <div>
                                    <Label htmlFor="jobTitle" className="block mb-2 text-white">
                                        Job Title
                                    </Label>
                                    <Input
                                        id="jobTitle"
                                        value={formData.jobTitle}
                                        onChange={(e) => handleInputChange('jobTitle', e.target.value)}
                                        className="bg-gray-800/70 border border-gray-700/50 text-white placeholder:text-gray-400"
                                        placeholder="Emergency Medical Technician"
                                    />
                                </div>

                                {/* Callsign */}
                                <div>
                                    <Label htmlFor="callsign" className="block mb-2 text-white">
                                        Callsign
                                    </Label>
                                    <Input
                                        id="callsign"
                                        value={formData.callsign}
                                        onChange={(e) => handleInputChange('callsign', e.target.value)}
                                        className="bg-gray-800/70 border border-gray-700/50 text-white placeholder:text-gray-400"
                                        placeholder="EMS-01"
                                    />
                                </div>

                                {/* Assignment */}
                                <div>
                                    <Label htmlFor="assignment" className="block mb-2 text-white">
                                        Assignment
                                    </Label>
                                    <Input
                                        id="assignment"
                                        value={formData.assignment}
                                        onChange={(e) => handleInputChange('assignment', e.target.value)}
                                        className="bg-gray-800/70 border border-gray-700/50 text-white placeholder:text-gray-400"
                                        placeholder="Ambulance Unit 1"
                                    />
                                </div>

                                {/* Activity Level */}
                                <div>
                                    <Label htmlFor="activity" className="block mb-2 text-white">
                                        Activity Level
                                    </Label>
                                    <Select value={formData.activity} onValueChange={(value) => handleInputChange('activity', value)}>
                                        <SelectTrigger className="bg-gray-800/70 border border-gray-700/50 text-white w-full">
                                            <SelectValue />
                                        </SelectTrigger>
                                        <SelectContent className="bg-gray-800 border-gray-700">
                                            {activityLevels.map((level) => (
                                                <SelectItem key={level.value} value={level.value} className="text-white hover:bg-gray-700">
                                                    {level.label}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </div>

                                {/* Status */}
                                <div>
                                    <Label htmlFor="status" className="block mb-2 text-white">
                                        Employment Status
                                    </Label>
                                    <Select value={formData.status} onValueChange={(value) => handleInputChange('status', value)}>
                                        <SelectTrigger className="bg-gray-800/70 border border-gray-700/50 text-white">
                                            <SelectValue />
                                        </SelectTrigger>
                                        <SelectContent className="bg-gray-800 border-gray-700">
                                            {statusOptions.map((status) => (
                                                <SelectItem key={status.value} value={status.value} className="text-white hover:bg-gray-700">
                                                    {status.label}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Contact Information */}
                    <Card className="bg-gray-800/70 border border-gray-700/50 backdrop-blur-sm">
                        <CardHeader>
                            <CardTitle className="text-white flex items-center gap-2">
                                <Icon icon="heroicons:phone-16-solid" className="h-5 w-5 text-green-400" />
                                Contact Information
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-6">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                {/* Phone Number */}
                                <div>
                                    <Label htmlFor="phoneNumber" className="block mb-2 text-white">
                                        Phone Number
                                    </Label>
                                    <Input
                                        id="phoneNumber"
                                        value={formData.phoneNumber}
                                        onChange={(e) => {
                                            const value = e.target.value.replace(/\D/g, '');
                                            if (value.length <= 7) {
                                                handleInputChange('phoneNumber', value);
                                            }
                                        }}
                                        className="bg-gray-800/70 border border-gray-700/50 text-white placeholder:text-gray-400"
                                        placeholder="5551234"
                                        maxLength={7}
                                    />
                                </div>

                                {/* Discord Username */}
                                <div>
                                    <Label htmlFor="discordUsername" className="block mb-2 text-white">
                                        Discord Username
                                    </Label>
                                    <Input
                                        id="discordUsername"
                                        value={formData.discordUsername}
                                        onChange={(e) => handleInputChange('discordUsername', e.target.value)}
                                        className="bg-gray-800/70 border border-gray-700/50 text-white placeholder:text-gray-400"
                                        placeholder="username#1234"
                                    />
                                </div>

                                {/* Timezone */}
                                <div className="md:col-span-2">
                                    <Label htmlFor="timezone" className="block mb-2 text-white">
                                        Timezone
                                    </Label>
                                    <Input
                                        id="timezone"
                                        value={formData.timezone}
                                        onChange={(e) => handleInputChange('timezone', e.target.value)}
                                        className="bg-gray-800/70 border border-gray-700/50 text-white placeholder:text-gray-400"
                                        placeholder="America/New_York"
                                    />
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Certifications & Permissions */}
                    <Card className="bg-gray-800/70 border border-gray-700/50 backdrop-blur-sm">
                        <CardHeader>
                            <CardTitle className="text-white flex items-center gap-2">
                                <Icon icon="heroicons:academic-cap-16-solid" className="h-5 w-5 text-yellow-400" />
                                Certifications & Permissions
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                {/* Training Certifications */}
                                <div>
                                    <h4 className="text-white font-medium mb-4">Training & Certifications</h4>
                                    <div className="space-y-3">
                                        <div className="flex items-center space-x-2">
                                            <Checkbox
                                                id="isFTO"
                                                checked={formData.isFTO}
                                                onCheckedChange={(checked) => handleInputChange('isFTO', !!checked)}
                                            />
                                            <Label htmlFor="isFTO" className="text-sm text-white">Field Training Officer (FTO)</Label>
                                        </div>
                                        <div className="flex items-center space-x-2">
                                            <Checkbox
                                                id="isSoloCleared"
                                                checked={formData.isSoloCleared}
                                                onCheckedChange={(checked) => handleInputChange('isSoloCleared', !!checked)}
                                            />
                                            <Label htmlFor="isSoloCleared" className="text-sm text-white">Solo Cleared</Label>
                                        </div>
                                        <div className="flex items-center space-x-2">
                                            <Checkbox
                                                id="isWaterRescue"
                                                checked={formData.isWaterRescue}
                                                onCheckedChange={(checked) => handleInputChange('isWaterRescue', !!checked)}
                                            />
                                            <Label htmlFor="isWaterRescue" className="text-sm text-white">Water Rescue Certified</Label>
                                        </div>
                                    </div>
                                </div>

                                {/* Specialized Certifications */}
                                <div>
                                    <h4 className="text-white font-medium mb-4">Specialized Certifications</h4>
                                    <div className="space-y-3">
                                        <div className="flex items-center space-x-2">
                                            <Checkbox
                                                id="isCoPilotCert"
                                                checked={formData.isCoPilotCert}
                                                onCheckedChange={(checked) => handleInputChange('isCoPilotCert', !!checked)}
                                            />
                                            <Label htmlFor="isCoPilotCert" className="text-sm text-white">Co-Pilot Certified</Label>
                                        </div>
                                        <div className="flex items-center space-x-2">
                                            <Checkbox
                                                id="isAviationCert"
                                                checked={formData.isAviationCert}
                                                onCheckedChange={(checked) => handleInputChange('isAviationCert', !!checked)}
                                            />
                                            <Label htmlFor="isAviationCert" className="text-sm text-white">Aviation Certified</Label>
                                        </div>
                                        <div className="flex items-center space-x-2">
                                            <Checkbox
                                                id="isPsychNeuro"
                                                checked={formData.isPsychNeuro}
                                                onCheckedChange={(checked) => handleInputChange('isPsychNeuro', !!checked)}
                                            />
                                            <Label htmlFor="isPsychNeuro" className="text-sm text-white">Psych/Neuro Specialist</Label>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Form Actions */}
                    <div className="flex flex-col sm:flex-row gap-4 justify-end">
                        <Button
                            type="button"
                            variant="outline"
                            asChild
                            className="border-gray-600 text-gray-300 hover:bg-gray-700/50"
                        >
                            <Link href="/dashboard/users">
                                Cancel
                            </Link>
                        </Button>
                        <Button
                            type="submit"
                            disabled={isLoading}
                            className="bg-gradient-to-r from-sky-600 to-sky-700 hover:from-sky-700 hover:to-sky-800 shadow-lg shadow-sky-500/25 transition-all duration-300 hover:shadow-sky-500/40 hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            {isLoading ? (
                                <>
                                    <Icon icon="heroicons:arrow-path-16-solid" className="h-4 w-4 mr-2 animate-spin" />
                                    Creating User...
                                </>
                            ) : (
                                <>
                                    <Icon icon="heroicons:user-plus-16-solid" className="h-4 w-4 mr-2" />
                                    Create User
                                </>
                            )}
                        </Button>
                    </div>
                </form>
            </div>
        </div>
    );
} 