"use client";

import React from 'react';
import Link from 'next/link';
import { Icon } from '@iconify/react';
import { Button } from '@/components/ui/button';
import { User } from '@/types';


interface DepartmentConfig {
    name: string;
    description: string;
    icon: string;
    color: string;
    primaryRoute: string;
    routes: Array<{
        name: string;
        path: string;
        icon: string;
        description: string;
    }>;
}

interface DepartmentLayoutProps {
    children: React.ReactNode;
    config: DepartmentConfig;
    currentPath?: string;
    currentUser?: User | null;
}

export function DepartmentLayout({ children, config, currentPath, currentUser }: DepartmentLayoutProps) {
    const isAdmin = currentUser && ['admin', 'super_admin'].includes(currentUser.role);

    return (
        <div className="min-h-screen">
            {/* Header */}
            <header className="overflow-hidden bg-gradient-to-r from-purple-900 via-violet-900 to-purple-900 border-b border-purple-500/20">
                <div className="relative container mx-auto px-6 py-6">
                    <div className="flex flex-col md:flex-row items-start md:items-center justify-between relative z-10">
                        {/* Logo and Navigation */}
                        <div className="flex flex-col md:flex-row items-start md:items-center gap-4 w-full md:w-auto">
                            {/* Back to Home */}
                            <Link href="/" className="flex items-center gap-3 group ml-0 md:ml-0">
                                <div>
                                    <img src="/images/logo-short.png" alt="PENTA UNTITLED PROJECT RP RP" className="w-10 h-10 sm:hidden" />
                                    <img src="/images/PENTA UNTITLED PROJECT RP_logo.webp" alt="PENTA UNTITLED PROJECT RP RP" className="w-[168px] h-[26px] hidden sm:block" />
                                    <div className="text-purple-300 text-sm text-left md:text-right">Resource Portal</div>
                                </div>
                            </Link>
                            {/* Department Icon and Name */}
                            <div className="flex items-center gap-4 mt-4 md:mt-0 w-full md:w-auto">
                                <div className="hidden md:block w-px h-12 bg-purple-500/30"></div>
                                <div className="flex items-center gap-3">
                                    <div className={`p-3 bg-gradient-to-br ${config.color} rounded-xl shadow-lg`}>
                                        <Icon icon={config.icon} className="h-8 w-8 text-white" />
                                    </div>
                                    <div>
                                        <h1 className="text-white font-black text-xl">{config.name}</h1>
                                        <p className="text-purple-300 text-sm font-light">{config.description}</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </header>

            {/* Navigation Bar */}
            <nav className="sticky top-0 bg-gray-800/50 backdrop-blur-sm border-b border-gray-800 z-40">
                <div className="container mx-auto px-6">
                    <div className="flex items-center justify-between py-4">
                        <div className="flex items-center gap-2 overflow-x-auto">
                            {config.routes.map((route) => {
                                const isActive = currentPath === route.path;
                                return (
                                    <Link key={route.path} href={route.path}>
                                        <Button
                                            variant={isActive ? "default" : "ghost"}
                                            size="sm"
                                            className={`flex items-center gap-2 whitespace-nowrap transition-all duration-200 font-light ${isActive
                                                ? 'bg-gradient-to-r from-purple-500 to-violet-600 text-white shadow-lg shadow-purple-500/25'
                                                : 'text-gray-300 hover:text-white hover:bg-gray-800/50'
                                                }`}
                                        >
                                            <Icon icon={route.icon} className="h-4 w-4" />
                                            {route.name}
                                        </Button>
                                    </Link>
                                );
                            })}
                        </div>

                    </div>
                </div>
            </nav>

            {/* Main Content */}
            <main className="flex-1">
                {children}
            </main>

            {/* Footer */}
            <footer className="bg-gray-950/80 backdrop-blur-sm border-t border-gray-800">
                <div className="container mx-auto px-6 py-8">
                    <div className="grid grid-cols-1 sm:grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                        {/* Department Info */}
                        <div>
                            <div className="flex items-center gap-3 mb-4">
                                <div className={`p-2 bg-gradient-to-br ${config.color} rounded-lg`}>
                                    <Icon icon={config.icon} className="h-5 w-5 text-white" />
                                </div>
                                <div>
                                    <h3 className="text-white font-bold">{config.name}</h3>
                                    <p className="text-gray-400 text-sm font-light">{config.description}</p>
                                </div>
                            </div>

                        </div>

                        {/* Quick Links */}
                        <div>
                            <h3 className="text-white font-semibold mb-4 flex items-center gap-2">
                                <Icon icon="heroicons:link-16-solid" className="h-4 w-4 text-purple-400" />
                                Quick Links
                            </h3>
                            <div className="space-y-2">
                                {config.routes.slice(0, 4).map((route) => (
                                    <Link
                                        key={route.path}
                                        href={route.path}
                                        className="flex items-center gap-2 text-gray-400 hover:text-purple-400 transition-colors text-sm group"
                                    >
                                        <Icon icon={route.icon} className="h-4 w-4 group-hover:text-purple-400" />
                                        {route.name}
                                    </Link>
                                ))}
                            </div>
                        </div>

                        {/* Community Info */}
                        <div>
                            <h3 className="text-white font-semibold mb-4 flex items-center gap-2">
                                <Icon icon="heroicons:users-16-solid" className="h-4 w-4 text-purple-400" />
                                Community
                            </h3>
                            <div className="space-y-3">
                                <div className="flex items-center gap-3">

                                    <div>
                                        <div className="text-white text-sm font-semibold">PENTA UNTITLED PROJECT RP Roleplay</div>
                                    </div>
                                </div>
                                <div className="text-gray-400 text-sm font-light">
                                    PENTA UNTITLED PROJECT RP Roleplay Community • {config.name}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </footer>
        </div>
    );
} 