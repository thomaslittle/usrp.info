import { headers } from 'next/headers';
import Link from 'next/link';
import { Icon } from '@iconify/react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

interface Department {
    $id: string;
    name: string;
    slug: string;
    description?: string;
    color?: string;
    contentCount?: number;
}

async function getDepartments(): Promise<Department[]> {
    const headerInstance = await headers();
    const cookieHeader = headerInstance.get('cookie');
    const url = `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/api/departments`;

    try {
        const response = await fetch(url, {
            headers: { 'cookie': cookieHeader || '' },
            cache: 'no-store',
        });

        if (!response.ok) {
            console.error('Failed to fetch departments:', response.status);
            return [];
        }

        const data = await response.json();
        return data.departments || [];
    } catch (error) {
        console.error('Error fetching departments:', error);
        return [];
    }
}

function getDepartmentColor(slug: string) {
    switch (slug) {
        case 'ems': return 'bg-purple-500/20 text-purple-300 border-purple-500/30';
        case 'police': return 'bg-blue-500/20 text-blue-300 border-blue-500/30';
        case 'fire': return 'bg-red-500/20 text-red-300 border-red-500/30';
        case 'doj': return 'bg-yellow-500/20 text-yellow-300 border-yellow-500/30';
        case 'government': return 'bg-green-500/20 text-green-300 border-green-500/30';
        default: return 'bg-gray-500/20 text-gray-300 border-gray-500/30';
    }
}

function getDepartmentIcon(slug: string) {
    switch (slug) {
        case 'ems': return 'heroicons:heart-16-solid';
        case 'police': return 'heroicons:shield-check-16-solid';
        case 'fire': return 'heroicons:fire-16-solid';
        case 'doj': return 'heroicons:scale-16-solid';
        case 'government': return 'heroicons:building-office-16-solid';
        default: return 'heroicons:folder-16-solid';
    }
}

export default async function DepartmentsPage() {
    const departments = await getDepartments();

    return (
        <div className="relative py-8">
            <div className="container mx-auto px-6 lg:px-8">
                {/* Header */}
                <div className="mb-8">
                    <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
                        <div>
                            <h1 className="text-4xl font-bold text-white mb-3 bg-gradient-to-r from-white to-gray-300 bg-clip-text text-transparent">
                                Departments
                            </h1>
                            <p className="text-xl text-gray-300">
                                Manage and view department information and content
                            </p>
                        </div>
                        <div className="flex items-center gap-4">
                            <Button asChild className="bg-purple-600 hover:bg-purple-700">
                                <Link href="/dashboard">
                                    <Icon icon="heroicons:arrow-left-16-solid" className="mr-2 h-4 w-4" />
                                    Back to Dashboard
                                </Link>
                            </Button>
                        </div>
                    </div>
                </div>

                {/* Departments Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {departments.map((department) => (
                        <Card key={department.$id} className="backdrop-blur-sm bg-white/5 border-white/10 hover:bg-white/10 transition-all duration-300">
                            <CardHeader className="pb-4">
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-3">
                                        <div className={`p-2 rounded-lg border ${getDepartmentColor(department.slug)}`}>
                                            <Icon icon={getDepartmentIcon(department.slug)} className="h-5 w-5" />
                                        </div>
                                        <div>
                                            <CardTitle className="text-white text-lg">{department.name}</CardTitle>
                                            <p className="text-sm text-gray-400">/{department.slug}</p>
                                        </div>
                                    </div>
                                    {department.contentCount !== undefined && (
                                        <Badge variant="secondary" className="bg-gray-800 text-gray-300">
                                            {department.contentCount} items
                                        </Badge>
                                    )}
                                </div>
                            </CardHeader>
                            <CardContent>
                                {department.description && (
                                    <p className="text-gray-300 text-sm mb-4">{department.description}</p>
                                )}
                                <div className="flex gap-2">
                                    <Button asChild size="sm" variant="outline" className="flex-1">
                                        <Link href={`/ems/${department.slug}`}>
                                            <Icon icon="heroicons:eye-16-solid" className="mr-2 h-4 w-4" />
                                            View
                                        </Link>
                                    </Button>
                                    <Button asChild size="sm" className="flex-1 bg-purple-600 hover:bg-purple-700">
                                        <Link href={`/dashboard/content?department=${department.slug}`}>
                                            <Icon icon="heroicons:pencil-16-solid" className="mr-2 h-4 w-4" />
                                            Manage
                                        </Link>
                                    </Button>
                                </div>
                            </CardContent>
                        </Card>
                    ))}
                </div>

                {departments.length === 0 && (
                    <Card className="backdrop-blur-sm bg-white/5 border-white/10">
                        <CardContent className="p-12 text-center">
                            <div className="p-4 bg-gray-800/50 rounded-full w-fit mx-auto mb-4">
                                <Icon icon="heroicons:building-office-16-solid" className="h-8 w-8 text-gray-400" />
                            </div>
                            <h3 className="text-xl font-semibold text-white mb-2">No Departments Found</h3>
                            <p className="text-gray-400">
                                No departments are currently configured in the system.
                            </p>
                        </CardContent>
                    </Card>
                )}
            </div>
        </div>
    );
} 