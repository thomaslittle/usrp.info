'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Icon } from '@iconify/react';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { z } from 'zod';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
    Form,
    FormControl,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from '@/components/ui/form';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { register, login } from '@/lib/auth';
import { DepartmentType } from '@/types';
import { DiscordLoginButton } from '@/components/discord-login-button';

const departmentOptions = [
    { value: 'ems', label: 'Emergency Medical Services', description: 'EMS/TacMed Department' },
    { value: 'police', label: 'Los Santos Police Department', description: 'LSPD Operations' },
    { value: 'doj', label: 'Department of Justice', description: 'Legal Operations' },
    { value: 'fire', label: 'Fire Department', description: 'Fire & Rescue' },
    { value: 'government', label: 'Government', description: 'City Administration' }
];

const registerSchema = z.object({
    email: z.string().email({
        message: "Please enter a valid email address.",
    }),
    username: z.string().min(2, {
        message: "Username must be at least 2 characters.",
    }).max(30, {
        message: "Username must not be longer than 30 characters.",
    }),
    password: z.string().min(8, {
        message: "Password must be at least 8 characters.",
    }),
    confirmPassword: z.string(),
    department: z.string({
        required_error: "Please select a department.",
    }),
    gameCharacterName: z.string().optional(),
    rank: z.string().optional(),
}).refine((data) => data.password === data.confirmPassword, {
    message: "Passwords don't match",
    path: ["confirmPassword"],
});

type RegisterFormValues = z.infer<typeof registerSchema>;

export default function RegisterPage() {
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const form = useForm<RegisterFormValues>({
        resolver: zodResolver(registerSchema),
        defaultValues: {
            email: '',
            username: '',
            password: '',
            confirmPassword: '',
            department: undefined,
            gameCharacterName: '',
            rank: '',
        },
    });

    const onSubmit = async (data: RegisterFormValues) => {
        setLoading(true);
        setError('');

        try {
            // Create Appwrite account
            const authResult = await register(data.email, data.password, data.username);

            if (!authResult.success) {
                setError(authResult.error || 'Registration failed');
                setLoading(false);
                return;
            }

            // Create user record in database via API
            const userResponse = await fetch('/api/users/create', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    email: data.email,
                    username: data.username,
                    department: data.department as DepartmentType,
                    role: 'viewer', // Default role for new users
                    gameCharacterName: data.gameCharacterName || '',
                    rank: data.rank || '',
                }),
            });

            if (!userResponse.ok) {
                const errorData = await userResponse.json();
                throw new Error(errorData.error || 'Failed to create user record');
            }

            // Automatically log the user in after successful registration
            const loginResult = await login(data.email, data.password);

            if (!loginResult.success) {
                // If auto-login fails, redirect to login page with success message
                window.location.href = '/auth/login?message=Registration successful! Please log in.';
                return;
            }

            // Success! Redirect to EMS department page
            window.location.href = '/ems';
        } catch (error) {
            console.error('Registration error:', error);
            if (error instanceof Error) {
                setError(error.message);
            } else {
                setError('Failed to create user record. Please contact an administrator.');
            }
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 p-4">
            <Card className="w-full max-w-lg mx-auto bg-gray-900/70 border border-gray-800 shadow-xl">
                <CardHeader className="text-center space-y-4">
                    <div className="flex justify-center">
                        <Image
                            src="/images/wordmark.webp"
                            alt="PENTA UNTITLED PROJECT RP"
                            width={192}
                            height={64}
                            className="object-contain"
                            priority
                        />
                    </div>
                    <CardTitle className="text-white text-2xl font-bold">Create Account</CardTitle>
                </CardHeader>
                <CardContent>
                    <Form {...form}>
                        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                            {error && (
                                <div className="bg-red-900/50 border border-red-500 text-red-300 px-4 py-3 rounded-lg">
                                    <Icon icon="heroicons:exclamation-triangle-16-solid" className="inline mr-2 h-4 w-4" />
                                    {error}
                                </div>
                            )}

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <FormField
                                    control={form.control}
                                    name="email"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel className="text-sm font-medium text-gray-300">
                                                Email Address
                                            </FormLabel>
                                            <FormControl>
                                                <Input
                                                    type="email"
                                                    placeholder="Enter your email"
                                                    className="bg-gray-800/50 border-gray-800 text-white placeholder-gray-400 focus:ring-purple-500 focus:border-transparent"
                                                    {...field}
                                                />
                                            </FormControl>
                                            <FormMessage className="text-red-400" />
                                        </FormItem>
                                    )}
                                />

                                <FormField
                                    control={form.control}
                                    name="username"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel className="text-sm font-medium text-gray-300">
                                                Username
                                            </FormLabel>
                                            <FormControl>
                                                <Input
                                                    type="text"
                                                    placeholder="Choose a username"
                                                    className="bg-gray-800/50 border-gray-800 text-white placeholder-gray-400 focus:ring-purple-500 focus:border-transparent"
                                                    {...field}
                                                />
                                            </FormControl>
                                            <FormMessage className="text-red-400" />
                                        </FormItem>
                                    )}
                                />
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <FormField
                                    control={form.control}
                                    name="password"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel className="text-sm font-medium text-gray-300">
                                                Password
                                            </FormLabel>
                                            <FormControl>
                                                <Input
                                                    type="password"
                                                    placeholder="Enter password"
                                                    className="bg-gray-800/50 border-gray-800 text-white placeholder-gray-400 focus:ring-purple-500 focus:border-transparent"
                                                    {...field}
                                                />
                                            </FormControl>
                                            <FormMessage className="text-red-400" />
                                        </FormItem>
                                    )}
                                />

                                <FormField
                                    control={form.control}
                                    name="confirmPassword"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel className="text-sm font-medium text-gray-300">
                                                Confirm Password
                                            </FormLabel>
                                            <FormControl>
                                                <Input
                                                    type="password"
                                                    placeholder="Confirm password"
                                                    className="bg-gray-800/50 border-gray-800 text-white placeholder-gray-400 focus:ring-purple-500 focus:border-transparent"
                                                    {...field}
                                                />
                                            </FormControl>
                                            <FormMessage className="text-red-400" />
                                        </FormItem>
                                    )}
                                />
                            </div>

                            <FormField
                                control={form.control}
                                name="department"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel className="text-sm font-medium text-gray-300">
                                            Department
                                        </FormLabel>
                                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                                            <FormControl>
                                                <SelectTrigger className="bg-gray-800/50 border-gray-800 text-white">
                                                    <SelectValue placeholder="Select your department" />
                                                </SelectTrigger>
                                            </FormControl>
                                            <SelectContent className="bg-gray-800 border-gray-800">
                                                {departmentOptions.map((dept) => (
                                                    <SelectItem key={dept.value} value={dept.value}>
                                                        <div className="flex flex-col">
                                                            <span className="font-medium text-white">{dept.label}</span>
                                                            <span className="text-xs text-gray-400">{dept.description}</span>
                                                        </div>
                                                    </SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                        <FormMessage className="text-red-400" />
                                    </FormItem>
                                )}
                            />

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <FormField
                                    control={form.control}
                                    name="gameCharacterName"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel className="text-sm font-medium text-gray-300">
                                                Character Name
                                            </FormLabel>
                                            <FormControl>
                                                <Input
                                                    type="text"
                                                    placeholder="Your RP character name"
                                                    className="bg-gray-800/50 border-gray-800 text-white placeholder-gray-400 focus:ring-purple-500 focus:border-transparent"
                                                    {...field}
                                                />
                                            </FormControl>
                                            <FormMessage className="text-red-400" />
                                        </FormItem>
                                    )}
                                />

                                <FormField
                                    control={form.control}
                                    name="rank"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel className="text-sm font-medium text-gray-300">
                                                Current Rank
                                            </FormLabel>
                                            <FormControl>
                                                <Input
                                                    type="text"
                                                    placeholder="Your current rank"
                                                    className="bg-gray-800/50 border-gray-800 text-white placeholder-gray-400 focus:ring-purple-500 focus:border-transparent"
                                                    {...field}
                                                />
                                            </FormControl>
                                            <FormMessage className="text-red-400" />
                                        </FormItem>
                                    )}
                                />
                            </div>

                            <div className="text-xs text-gray-400 bg-gray-800/30 p-3 rounded-lg">
                                <Icon icon="heroicons:information-circle-16-solid" className="inline mr-2 h-4 w-4" />
                                Your account will be created with viewer permissions. Department administrators can upgrade your access level.
                            </div>

                            <Button
                                type="submit"
                                disabled={loading}
                                className="w-full bg-gradient-to-r from-purple-500 to-violet-600 hover:from-purple-600 hover:to-violet-700 text-white border-0 py-3 text-lg shadow-lg hover:shadow-xl transform transition-all duration-200 font-semibold cursor-pointer"
                            >
                                {loading ? (
                                    <>
                                        <div className="mr-2 h-5 w-5 inline-block relative">
                                            <span className="absolute inline-block w-full h-full rounded-full bg-white animate-[loader3_1.5s_linear_infinite]" />
                                            <span className="absolute inline-block w-full h-full rounded-full bg-white animate-[loader3_1.5s_linear_infinite] [animation-delay:-0.9s]" />
                                        </div>
                                        Creating Account & Signing In...
                                    </>
                                ) : (
                                    <>
                                        <Icon icon="heroicons:user-plus-16-solid" className="mr-2 h-5 w-5" />
                                        Create Account
                                    </>
                                )}
                            </Button>

                            <div className="relative">
                                <div className="absolute inset-0 flex items-center">
                                    <div className="w-full border-t border-gray-800"></div>
                                </div>
                            </div>

                            <DiscordLoginButton />

                            <p className="text-center text-sm text-gray-400">
                                Already have an account?{' '}
                                <Link href="/auth/login" className="text-purple-400 hover:text-purple-300 font-semibold cursor-pointer">
                                    Sign in
                                </Link>
                            </p>
                        </form>
                    </Form>
                </CardContent>
            </Card>
        </div>
    );
} 