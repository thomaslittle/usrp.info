'use client';

import React, { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/use-auth';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Preloader } from '@/components/ui/preloader';
import { Icon } from '@iconify/react';
import Link from 'next/link';

export default function ProfilePage() {
    const { userProfile, isAuthenticated, isLoading } = useAuth();
    const router = useRouter();

    useEffect(() => {
        // Redirect authenticated users to the dashboard profile page
        if (isAuthenticated && userProfile) {
            router.push('/dashboard/profile');
        }
    }, [isAuthenticated, userProfile, router]);

    if (isLoading) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
                <Preloader
                    text="Loading profile..."
                    size="lg"
                    fullScreen
                />
            </div>
        );
    }

    // Show login prompt for non-authenticated users
    if (!isAuthenticated) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 p-4">
                <Card className="w-full max-w-lg mx-auto bg-gray-900/70 border border-gray-800 shadow-xl">
                    <CardHeader className="text-center">
                        <div className="mx-auto w-16 h-16 bg-purple-500/20 rounded-full flex items-center justify-center mb-4">
                            <Icon icon="heroicons:user-16-solid" className="w-8 h-8 text-purple-400" />
                        </div>
                        <CardTitle className="text-white text-2xl font-bold">Profile Access</CardTitle>
                        <div className="text-gray-400 text-sm">Sign in to view your profile</div>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <p className="text-gray-300 text-center">
                            You need to be signed in to access your profile information.
                        </p>
                        <div className="flex flex-col space-y-3">
                            <Link href="/auth/login">
                                <Button className="w-full bg-gradient-to-r from-purple-500 to-violet-600 hover:from-purple-600 hover:to-violet-700 text-white font-semibold">
                                    <Icon icon="heroicons:arrow-right-end-on-rectangle-16-solid" className="mr-2 h-4 w-4" />
                                    Sign In
                                </Button>
                            </Link>
                            <Link href="/auth/register">
                                <Button variant="outline" className="w-full border-gray-600 text-gray-300 hover:bg-purple-500/10 hover:border-purple-500/50 font-semibold">
                                    <Icon icon="heroicons:user-plus-16-solid" className="mr-2 h-4 w-4" />
                                    Create Account
                                </Button>
                            </Link>
                        </div>
                        <div className="text-center">
                            <Link href="/" className="text-purple-400 hover:text-purple-300 text-sm">
                                ← Back to Home
                            </Link>
                        </div>
                    </CardContent>
                </Card>
            </div>
        );
    }

    // This should not be reached due to the redirect, but just in case
    return null;
} 