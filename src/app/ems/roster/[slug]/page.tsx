import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { notFound } from 'next/navigation';
import { Icon } from '@iconify/react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { DepartmentLayout } from '@/components/department-layout';
import { EMSRosterTable } from '@/components/ems-roster-table';
import { userService } from '@/lib/database';

import { User } from '@/types';

const emsConfig = {
    name: 'EMS',
    description: 'EMS/TacMed Department',
    icon: 'ion:medical',
    color: 'from-purple-500 to-violet-600',
    primaryRoute: '/ems',
    routes: [
        {
            name: 'Reference Guide',
            path: '/ems',
            icon: 'heroicons:document-text-16-solid',
            description: 'Medical protocols and treatment guides'
        },
        {
            name: 'Mastersheet Data',
            path: '/ems/sops',
            icon: 'heroicons:book-open-16-solid',
            description: 'Comprehensive SOPs and guidelines'
        }
    ]
};

interface RosterInfo {
    title: string;
    description: string;
    type: string;
    version: number;
    publishedAt: string;
    updatedAt: string;
    tags: string[];
    slug: string;
}

interface RosterPageProps {
    params: Promise<{
        slug: string;
    }>;
}

async function getRosterData(slug: string): Promise<{ users: User[], rosterInfo: RosterInfo } | null> {
    try {
        if (slug !== 'department-roster') {
            return null;
        }

        // Get EMS users for the roster
        const emsUserDocs = await userService.getByDepartment('ems');
        const allUsers = (emsUserDocs as unknown as User[]).filter(user => user.role !== 'super_admin');

        // Just use all users as-is, no merging
        const processedUsers = allUsers;

        const rosterInfo: RosterInfo = {
            title: 'Department Roster',
            description: 'Complete directory of all EMS department personnel with their certifications, assignments, and contact information.',
            type: 'roster',
            version: 1.0,
            publishedAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
            tags: ['Personnel', 'Directory', 'Certifications'],
            slug: 'department-roster'
        };

        return { users: processedUsers, rosterInfo };
    } catch (error) {
        console.error('Error fetching roster data:', error);
        return null;
    }
}

export default async function RosterPage({ params }: RosterPageProps) {
    const { slug } = await params;
    const data = await getRosterData(slug);

    if (!data) {
        notFound();
    }

    const { users, rosterInfo } = data;

    // const handleSubmit = async (_e: React.FormEvent) => {
    //     // Handle form submission
    // };

    return (
        <DepartmentLayout config={emsConfig} currentPath={`/ems/roster/${slug}`}>
            <div className="relative py-8">
                <div className="absolute inset-0 -z-10">
                    <Image src="/images/bg.webp" alt="background" fill className="object-cover" quality={80} />
                    <div className="absolute inset-0 bg-black/50"></div>
                    <div className="absolute inset-0 bg-gradient-to-br from-purple-500/10 via-transparent to-blue-500/10"></div>
                </div>
                <div className="container mx-auto px-6 lg:px-8">
                    {/* Header Section - CMS Style */}
                    <div className="mb-8">
                        <div className="flex items-center gap-4 mb-4">
                            <Link href="/ems">
                                <Button
                                    variant="outline"
                                    size="sm"
                                    className="border-gray-600 text-gray-300 hover:bg-gray-700"
                                >
                                    <Icon icon="heroicons:arrow-left-16-solid" className="h-4 w-4 mr-2" />
                                    Back to EMS
                                </Button>
                            </Link>
                            <div className="flex items-center gap-2">
                                <Badge className="bg-purple-500/20 border-purple-500/50 text-purple-300 border">
                                    {rosterInfo.type.toUpperCase()}
                                </Badge>
                                <span className="text-gray-400 text-sm">v{rosterInfo.version.toFixed(2)}</span>
                            </div>
                        </div>

                        <h1 className="text-4xl font-bold text-white mb-4">
                            {rosterInfo.title}
                        </h1>

                        <p className="text-xl text-gray-300 mb-6">
                            {rosterInfo.description}
                        </p>

                        {/* Tags */}
                        {rosterInfo.tags && rosterInfo.tags.length > 0 && (
                            <div className="flex flex-wrap gap-2 mb-6">
                                {rosterInfo.tags.map((tag: string) => (
                                    <span
                                        key={tag}
                                        className="px-3 py-1 text-sm font-medium bg-purple-500/20 text-purple-300 rounded-md border border-purple-500/30"
                                    >
                                        {tag}
                                    </span>
                                ))}
                            </div>
                        )}

                        {/* Meta Information */}
                        <div className="flex items-center gap-6 text-sm text-gray-400 border-b border-gray-700 pb-6">
                            <div className="flex items-center gap-2">
                                <Icon icon="heroicons:calendar-16-solid" className="h-4 w-4" />
                                <span>Published {new Date(rosterInfo.publishedAt).toLocaleDateString()}</span>
                            </div>
                            <div className="flex items-center gap-2">
                                <Icon icon="heroicons:clock-16-solid" className="h-4 w-4" />
                                <span>Updated {new Date(rosterInfo.updatedAt).toLocaleDateString()}</span>
                            </div>
                            <div className="flex items-center gap-2">
                                <Icon icon="heroicons:users-16-solid" className="h-4 w-4" />
                                <span>{users.length} Active Members</span>
                            </div>
                        </div>
                    </div>

                    {/* Content Section */}
                    <div className="bg-gray-800/30 border border-gray-700/50 rounded-lg p-6 backdrop-blur-sm">
                        <div className="mb-6">
                            <div className="flex items-center justify-between mb-4">
                                <h2 className="text-2xl font-bold text-white flex items-center gap-3">
                                    <div className="p-2 bg-gradient-to-r from-purple-500 to-violet-600 rounded-lg">
                                        <Icon icon="heroicons:users-16-solid" className="h-6 w-6 text-white" />
                                    </div>
                                    Active Personnel Directory
                                </h2>
                                <div className="text-sm text-gray-400">
                                    Live data from department database
                                </div>
                            </div>
                            <p className="text-gray-300 mb-6">
                                This roster displays real-time information about all active EMS department personnel.
                                Use the search and filter options to find specific members or sort by certifications,
                                rank, activity level, and more.
                            </p>
                        </div>

                        <EMSRosterTable data={users} />
                    </div>

                    {/* Footer Information */}
                    <div className="mt-8 text-center text-gray-400 text-sm">
                        <p>
                            This roster is automatically updated when personnel information changes.
                            For corrections or updates, contact your department administrator.
                        </p>
                    </div>
                </div>
            </div>
        </DepartmentLayout>
    );
} 