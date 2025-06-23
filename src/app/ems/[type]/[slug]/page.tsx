import { notFound } from 'next/navigation';
import { DepartmentLayout } from '@/components/department-layout';
import { ContentRenderer } from '@/components/content-renderer';
import { departmentService, contentService, userService } from '@/lib/database';
import { Content, Department, User } from '@/types';
import { getCurrentUserFromHeaders } from '@/lib/auth';
import { Button } from '@/components/ui/button';
import { Icon } from '@iconify/react';
import Link from 'next/link';
import { headers } from 'next/headers';

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
            icon: 'ion:medical-outline',
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

interface PageProps {
    params: Promise<{
        type: string;
        slug: string;
    }>;
}

async function getContent(type: string, slug: string): Promise<{ content: Content | null, department: Department | null }> {
    try {
        const departmentDoc = await departmentService.getBySlug('ems');
        if (!departmentDoc) {
            return { content: null, department: null };
        }

        const contentDoc = await contentService.getBySlug(departmentDoc.$id, slug);
        if (!contentDoc || contentDoc.type !== type) {
            return { content: null, department: null };
        }

        return {
            content: contentDoc as unknown as Content,
            department: departmentDoc as unknown as Department
        };
    } catch (error) {
        console.error('Error fetching content:', error);
        return { content: null, department: null };
    }
}

export default async function ContentPage({ params }: PageProps) {
    const { type, slug } = await params;
    const { content, department } = await getContent(type, slug);

    if (!content || !department) {
        notFound();
    }

    const headerList = await headers();
    const authUser = await getCurrentUserFromHeaders(headerList);

    let user: User | null = null;
    if (authUser) {
        const userDoc = await userService.getByEmail(authUser.email);
        if (userDoc) {
            user = userDoc as unknown as User;
        }
    }

    const canEdit = user && ['admin', 'super_admin', 'editor'].includes(user.role);

    const currentPath = `/ems/${type}/${slug}`;

    return (
        <DepartmentLayout config={emsConfig} currentPath={currentPath}>
            <div className="container mx-auto px-6 lg:px-8 py-8">
                <div className="mb-8">
                    <div className="flex items-center justify-between gap-4 mb-4">
                        <div className="flex items-center gap-4">
                            <Link
                                href="/ems"
                                className="text-purple-400 hover:text-purple-300 transition-colors"
                            >
                                ← Back to EMS Hub
                            </Link>
                            <span className="text-gray-500">|</span>
                            <span className="text-gray-400 uppercase">
                                {type.replace('-', ' ')}
                            </span>
                        </div>
                        {canEdit && (
                            <Link href={`/dashboard/content/${content.$id}/edit`}>
                                <Button size="sm" className="bg-purple-600 hover:bg-purple-700">
                                    <Icon icon="heroicons:pencil-square-16-solid" className="mr-2 h-4 w-4" />
                                    Edit
                                </Button>
                            </Link>
                        )}
                    </div>

                    <h1 className="text-4xl font-bold text-white mb-4">
                        {content.title}
                    </h1>

                    <div className="flex flex-wrap items-center gap-4 text-sm text-gray-400">
                        <span className="uppercase">
                            {content.type.replace('-', ' ')}
                        </span>
                        <span>•</span>
                        <span>Version {content.version}</span>
                        {content.publishedAt && (
                            <>
                                <span>•</span>
                                <span>
                                    Published {new Date(content.publishedAt).toLocaleDateString()}
                                </span>
                            </>
                        )}
                        {content.tags && content.tags.length > 0 && (
                            <>
                                <span>•</span>
                                <div className="flex flex-wrap gap-2">
                                    {content.tags.map((tag: string) => (
                                        <span
                                            key={tag}
                                            className="px-2 py-1 text-xs font-medium bg-purple-500/20 text-purple-300 rounded-md"
                                        >
                                            {tag}
                                        </span>
                                    ))}
                                </div>
                            </>
                        )}
                    </div>
                </div>

                <div className="">
                    <ContentRenderer content={content} />
                </div>

                <div className="mt-8 flex items-center justify-between">
                    <Link
                        href="/ems"
                        className="inline-flex items-center gap-2 px-4 py-2 bg-gray-700 hover:bg-gray-600 text-white rounded-lg transition-colors"
                    >
                        ← Back to EMS Hub
                    </Link>

                    <div className="text-sm text-gray-400">
                        Last updated: {new Date(content.updatedAt).toLocaleDateString()}
                    </div>
                </div>
            </div>
        </DepartmentLayout>
    );
} 