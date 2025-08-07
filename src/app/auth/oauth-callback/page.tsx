'use client';

import React, { useEffect, useState, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Icon } from '@iconify/react';
import Link from 'next/link';
import { useAuth } from '@/hooks/use-auth';

function OAuthCallbackContent() {
    const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');
    const [errorMessage, setErrorMessage] = useState('');
    const searchParams = useSearchParams();
    const router = useRouter();
    const { isAuthenticated, isLoading } = useAuth();

    useEffect(() => {
        // If still loading auth state, do nothing
        if (isLoading) return;
        // If authenticated, redirect to dashboard
        if (isAuthenticated) {
            setStatus('success');
            setTimeout(() => {
                router.replace('/dashboard');
            }, 1200);
            return;
        }
        // If not authenticated, check for error param
        const error = searchParams.get('error');
        const errorDescription = searchParams.get('error_description');
        if (error) {
            if (error === 'user_already_exists' || errorDescription?.includes('already exists')) {
                setErrorMessage('An account with this Discord email already exists. Please log in with your email and password, or contact an administrator to link your Discord account.');
            } else {
                setErrorMessage(`OAuth error: ${errorDescription || error}`);
            }
            setStatus('error');
            return;
        }
        // If not authenticated and no error, show generic error
        setErrorMessage('Invalid OAuth callback parameters');
        setStatus('error');
    }, [isAuthenticated, isLoading, searchParams, router]);

    return (
        <Card className="w-full max-w-md mx-auto bg-gray-900/70 border border-gray-800 shadow-xl">
            <CardHeader className="text-center">
                <div className="flex justify-center mb-4">
                    <img
                        src="/images/wordmark.webp"
                        alt="PENTA UNTITLED PROJECT RP RP"
                        className="w-48 object-contain"
                    />
                </div>
                <CardTitle className="text-white">
                    {status === 'loading' && 'Processing Authentication...'}
                    {status === 'success' && 'Login Successful!'}
                    {status === 'error' && 'Authentication Error'}
                </CardTitle>
            </CardHeader>
            <CardContent className="text-center">
                {status === 'loading' && (
                    <div className="space-y-4">
                        <div className="flex justify-center">
                            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-500"></div>
                        </div>
                        <p className="text-gray-400">Please wait while we complete your login...</p>
                    </div>
                )}

                {status === 'success' && (
                    <div className="space-y-4">
                        <div className="flex justify-center">
                            <Icon icon="heroicons:check-circle-16-solid" className="h-12 w-12 text-green-500" />
                        </div>
                        <p className="text-gray-300">You have been successfully logged in!</p>
                        <p className="text-gray-400">Redirecting to dashboard...</p>
                    </div>
                )}

                {status === 'error' && (
                    <div className="space-y-4">
                        <div className="flex justify-center">
                            <Icon icon="heroicons:exclamation-triangle-16-solid" className="h-12 w-12 text-red-500" />
                        </div>
                        <div className="bg-red-900/50 border border-red-500 text-red-300 px-4 py-3 rounded-lg text-left">
                            {errorMessage}
                        </div>
                        <div className="space-y-2">
                            <Link href="/auth/login">
                                <Button className="w-full bg-gradient-to-r from-purple-500 to-violet-600 hover:from-purple-600 hover:to-violet-700 text-white">
                                    <Icon icon="heroicons:arrow-left-16-solid" className="mr-2 h-4 w-4" />
                                    Back to Login
                                </Button>
                            </Link>
                            <Link href="/">
                                <Button variant="outline" className="w-full border-gray-600 text-gray-300 hover:bg-gray-800">
                                    <Icon icon="heroicons:home-16-solid" className="mr-2 h-4 w-4" />
                                    Back to Home
                                </Button>
                            </Link>
                        </div>
                    </div>
                )}
            </CardContent>
        </Card>
    );
}

function LoadingFallback() {
    return (
        <Card className="w-full max-w-md mx-auto bg-gray-900/70 border border-gray-800 shadow-xl">
            <CardHeader className="text-center">
                <div className="flex justify-center mb-4">
                    <img
                        src="/images/wordmark.webp"
                        alt="PENTA UNTITLED PROJECT RP RP"
                        className="w-48 object-contain"
                    />
                </div>
                <CardTitle className="text-white">Loading...</CardTitle>
            </CardHeader>
            <CardContent className="text-center">
                <div className="space-y-4">
                    <div className="flex justify-center">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-500"></div>
                    </div>
                    <p className="text-gray-400">Please wait...</p>
                </div>
            </CardContent>
        </Card>
    );
}

export default function OAuthCallbackPage() {
    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center p-4">
            <Suspense fallback={<LoadingFallback />}>
                <OAuthCallbackContent />
            </Suspense>
        </div>
    );
} 