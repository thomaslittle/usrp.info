'use client';

import React from 'react';
import Link from 'next/link';
import { Icon } from '@iconify/react';
import { Button } from '@/components/ui/button';

export default function DashboardNotFound() {
    return (
        <div className="min-h-screen bg-gray-900 flex items-center justify-center relative overflow-hidden">
            {/* Background Pattern */}
            <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZGVmcz48cGF0dGVybiBpZD0iZ3JpZCIgd2lkdGg9IjYwIiBoZWlnaHQ9IjYwIiBwYXR0ZXJuVW5pdHM9InVzZXJTcGFjZU9uVXNlIj48cGF0aCBkPSJNIDYwIDAgTCAwIDAgMCA2MCIgZmlsbD0ibm9uZSIgc3Ryb2tlPSJyZ2JhKDI1NSwgMjU1LCAyNTUsIDAuMDMpIiBzdHJva2Utd2lkdGg9IjEiLz48L3BhdHRlcm4+PC9kZWZzPjxyZWN0IHdpZHRoPSIxMDAlIiBoZWlnaHQ9IjEwMCUiIGZpbGw9InVybCgjZ3JpZCkiLz48L3N2Zz4=')] opacity-20"></div>

            {/* Gradient Overlay */}
            <div className="absolute inset-0 bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900"></div>

            <div className="relative z-10 text-center px-6 max-w-2xl mx-auto">
                {/* 404 Text */}
                <div className="mb-8">
                    <h1 className="text-8xl font-black text-white mb-4 tracking-wider">
                        404
                    </h1>
                    <h2 className="text-xl font-bold text-gray-300 mb-6 tracking-wide">
                        DASHBOARD PAGE NOT FOUND
                    </h2>
                    <p className="text-gray-400 text-lg mb-8 leading-relaxed">
                        The dashboard page you&apos;re looking for doesn&apos;t exist or you don&apos;t have permission to access it. Let&apos;s get you back to your dashboard.
                    </p>
                </div>

                {/* Action Buttons */}
                <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-12">
                    <Link href="/dashboard" className="cursor-pointer">
                        <Button
                            size="lg"
                            className="bg-gradient-to-r from-purple-500 to-violet-600 hover:from-purple-600 hover:to-violet-700 text-white border-0 px-8 py-4 text-lg shadow-lg hover:shadow-xl transform transition-all duration-200 font-semibold cursor-pointer"
                        >
                            <Icon icon="heroicons:home-16-solid" className="mr-2 h-5 w-5" />
                            Dashboard Home
                        </Button>
                    </Link>

                    <Link href="/dashboard/content" className="cursor-pointer">
                        <Button
                            variant="outline"
                            size="lg"
                            className="border-gray-600 text-gray-300 hover:bg-purple-500/10 hover:border-purple-500/50 px-8 py-4 text-lg font-semibold cursor-pointer"
                        >
                            <Icon icon="heroicons:document-text-16-solid" className="mr-2 h-5 w-5" />
                            Content Management
                        </Button>
                    </Link>
                </div>

                {/* Dashboard Icon */}
                <div className="flex justify-center items-end h-32">
                    <div className="relative">
                        <div className="w-24 h-24 bg-gradient-to-br from-purple-500/20 to-violet-600/20 rounded-full flex items-center justify-center border border-purple-500/30">
                            <Icon icon="heroicons:cog-6-tooth-16-solid" className="h-12 w-12 text-purple-400" />
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
} 