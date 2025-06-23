'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { Icon } from '@iconify/react';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { useSearchParams } from 'next/navigation';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import {
    Form,
    FormControl,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from '@/components/ui/form';
import { login } from '@/lib/auth';
import { DiscordLoginButton } from '@/components/discord-login-button';

const loginSchema = z.object({
    email: z.string().email({
        message: "Please enter a valid email address.",
    }),
    password: z.string().min(1, {
        message: "Password is required.",
    }),
});

type LoginFormValues = z.infer<typeof loginSchema>;

export default function LoginPage() {
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const searchParams = useSearchParams();

    // Check for OAuth errors in URL parameters
    useEffect(() => {
        const errorParam = searchParams.get('error');
        if (errorParam === 'oauth_failed') {
            setError('Discord login failed. This might be because an account with this email already exists. Please try logging in with email/password instead, or contact an administrator.');
        }
    }, [searchParams]);

    const form = useForm<LoginFormValues>({
        resolver: zodResolver(loginSchema),
        defaultValues: {
            email: '',
            password: '',
        },
    });

    const onSubmit = async (data: LoginFormValues) => {
        setLoading(true);
        setError('');

        const result = await login(data.email, data.password);

        if (result.success) {
            setTimeout(() => {
                window.location.href = '/ems';
            }, 100);
        } else {
            setError(result.error || 'Login failed');
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center p-4">
            <Card className="w-full max-w-md mx-auto bg-gray-900/70 border border-gray-800 shadow-xl">
                <CardHeader className="text-center space-y-4">
                    <div className="flex justify-center">
                        <img
                            src="/images/wordmark.webp"
                            alt="Unscripted RP"
                            className="w-48 object-contain"
                        />
                    </div>
                    <p className="text-gray-400">Sign in to your account to continue</p>
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
                                name="password"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel className="text-sm font-medium text-gray-300">
                                            Password
                                        </FormLabel>
                                        <FormControl>
                                            <Input
                                                type="password"
                                                placeholder="Enter your password"
                                                className="bg-gray-800/50 border-gray-800 text-white placeholder-gray-400 focus:ring-purple-500 focus:border-transparent"
                                                {...field}
                                            />
                                        </FormControl>
                                        <FormMessage className="text-red-400" />
                                    </FormItem>
                                )}
                            />

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
                                        Signing In...
                                    </>
                                ) : (
                                    <>
                                        <Icon icon="heroicons:arrow-right-end-on-rectangle-16-solid" className="mr-2 h-5 w-5 uppercase" />
                                        Sign In
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
                                Don&apos;t have an account?{' '}
                                <Link href="/auth/register" className="text-purple-400 hover:text-purple-300 font-semibold cursor-pointer">
                                    Create Account
                                </Link>
                            </p>
                        </form>
                    </Form>

                    <div className="text-center mt-6">
                        <Link href="/" className="text-gray-400 hover:text-purple-400 transition-colors cursor-pointer">
                            ← Back to Home
                        </Link>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
} 