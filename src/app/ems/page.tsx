import React from 'react';
import Link from 'next/link';
import { Icon } from '@iconify/react';
import { Button } from '@/components/ui/button';
import { DepartmentLayout } from '@/components/department-layout';
import { departmentService, contentService, userService } from '@/lib/database';
import { Content, Department, User } from '@/types';
import { getCurrentUserFromRequest } from '@/lib/auth';

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

interface EMSPageProps {
    searchParams: { [key: string]: string | string[] | undefined };
}

async function getEMSContent(): Promise<{ content: Content[], department: Department | null, currentUser: User | null }> {
    try {
        // Get EMS department
        const departmentDoc = await departmentService.getBySlug('ems');
        if (!departmentDoc) {
            return { content: [], department: null, currentUser: null };
        }

        // Get all published content for EMS
        const contentDocs = await contentService.getByDepartment(departmentDoc.$id, 'published');

        // Get current user (temporarily using mock user)
        // const currentUser = await getCurrentUserFromRequest();
        const currentUser = {
            $id: 'user123',
            email: 'tomlit@gmail.com',
            department: 'ems',
            role: 'admin'
        } as User;

        // Type cast the documents to our types
        const department = departmentDoc as unknown as Department;
        const content = contentDocs as unknown as Content[];

        return { content, department, currentUser };
    } catch (error) {
        console.error('Error fetching EMS content:', error);
        return { content: [], department: null, currentUser: null };
    }
}

export default async function EMSPage({ searchParams }: EMSPageProps) {
    const { content, department, currentUser } = await getEMSContent();

    // Check if user can edit content
    const canEdit = currentUser && (
        currentUser.role === 'admin' ||
        currentUser.role === 'super_admin' ||
        currentUser.role === 'editor'
    ) && currentUser.department === 'ems';

    if (!department) {
        return (
            <DepartmentLayout config={emsConfig} currentPath="/ems">
                <div className="container mx-auto px-6 lg:px-8 py-8 bg-gray-900">
                    <div className="text-center">
                        <h1 className="text-3xl font-bold text-white mb-4">EMS Department Not Found</h1>
                        <p className="text-gray-300">
                            The EMS department data could not be loaded. Please contact an administrator.
                        </p>
                    </div>
                </div>
            </DepartmentLayout>
        );
    }

    // Group content by type for better organization
    const contentByType = content.reduce((acc, item) => {
        if (!acc[item.type]) {
            acc[item.type] = [];
        }
        acc[item.type].push(item);
        return acc;
    }, {} as Record<string, Content[]>);

    return (
        <DepartmentLayout config={emsConfig} currentPath="/ems">
            <div className="relative py-8">
                <div className="absolute inset-0 -z-10">
                    <img src="/images/bg.webp" alt="background" className="object-cover w-full h-full" />
                    <div className="absolute inset-0 bg-black/50"></div>
                    <div className="absolute inset-0 bg-gradient-to-br from-purple-500/10 via-transparent to-blue-500/10"></div>
                </div>
                <div className="container mx-auto px-6 lg:px-8">
                    <div className="mb-8">
                        <h1 className="text-4xl font-bold text-white mb-4">
                            {department.name}
                        </h1>
                        <p className="text-xl text-gray-300">
                            Emergency Medical Services Resource Hub
                        </p>
                    </div>

                    {content.length === 0 ? (
                        <div className="text-center py-12">
                            <h2 className="text-2xl font-bold text-white mb-4">No Content Available</h2>
                            <p className="text-gray-300">
                                Content is being prepared. Please check back later.
                            </p>
                        </div>
                    ) : (
                        <div className="space-y-12">
                            {/* Add Content Button */}
                            {/* {canEdit && (
                                <div className="flex justify-end">
                                    <Link href="/dashboard/content/new">
                                        <Button className="bg-gradient-to-r from-purple-500 to-violet-600 hover:from-purple-600 hover:to-violet-700 text-white">
                                            <Icon icon="heroicons:plus-16-solid" className="h-4 w-4 mr-2" />
                                            Add New Content
                                        </Button>
                                    </Link>
                                </div>
                            )} */}

                            {/* Standard Operating Procedures */}
                            {contentByType.sop && contentByType.sop.length > 0 && (
                                <section>
                                    <div className="flex items-center justify-between mb-6">
                                        <h2 className="text-2xl font-bold text-white">Mastersheet Data</h2>
                                        {canEdit && (
                                            <Link href="/dashboard/content/new?type=sop">
                                                <Button variant="outline" size="sm" className="border-purple-500 text-purple-400 hover:bg-purple-500 hover:text-white">
                                                    <Icon icon="heroicons:plus-16-solid" className="h-4 w-4 mr-2" />
                                                    Add SOP
                                                </Button>
                                            </Link>
                                        )}
                                    </div>
                                    <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                                        {contentByType.sop.map((item) => (
                                            <ContentCard key={item.$id} content={item} canEdit={!!canEdit} />
                                        ))}
                                    </div>
                                </section>
                            )}

                            {/* Guides */}
                            {contentByType.guide && contentByType.guide.length > 0 && (
                                <section>
                                    <div className="flex items-center justify-between mb-6">
                                        <h2 className="text-2xl font-bold text-white">Medical Guides</h2>
                                        {canEdit && (
                                            <Link href="/dashboard/content/new?type=guide">
                                                <Button variant="outline" size="sm" className="border-purple-500 text-purple-400 hover:bg-purple-500 hover:text-white">
                                                    <Icon icon="heroicons:plus-16-solid" className="h-4 w-4 mr-2" />
                                                    Add Guide
                                                </Button>
                                            </Link>
                                        )}
                                    </div>
                                    <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                                        {contentByType.guide.map((item) => (
                                            <ContentCard key={item.$id} content={item} canEdit={!!canEdit} />
                                        ))}
                                    </div>
                                </section>
                            )}

                            {/* Resources */}
                            {contentByType.resource && contentByType.resource.length > 0 && (
                                <section>
                                    <div className="flex items-center justify-between mb-6">
                                        <h2 className="text-2xl font-bold text-white">Reference Resources</h2>
                                        {canEdit && (
                                            <Link href="/dashboard/content/new?type=resource">
                                                <Button variant="outline" size="sm" className="border-purple-500 text-purple-400 hover:bg-purple-500 hover:text-white">
                                                    <Icon icon="heroicons:plus-16-solid" className="h-4 w-4 mr-2" />
                                                    Add Resource
                                                </Button>
                                            </Link>
                                        )}
                                    </div>
                                    <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                                        {contentByType.resource.map((item) => (
                                            <ContentCard key={item.$id} content={item} canEdit={!!canEdit} />
                                        ))}
                                    </div>
                                </section>
                            )}

                            {/* Training Materials */}
                            {contentByType.training && contentByType.training.length > 0 && (
                                <section>
                                    <div className="flex items-center justify-between mb-6">
                                        <h2 className="text-2xl font-bold text-white">Training Materials</h2>
                                        {canEdit && (
                                            <Link href="/dashboard/content/new?type=training">
                                                <Button variant="outline" size="sm" className="border-purple-500 text-purple-400 hover:bg-purple-500 hover:text-white">
                                                    <Icon icon="heroicons:plus-16-solid" className="h-4 w-4 mr-2" />
                                                    Add Training
                                                </Button>
                                            </Link>
                                        )}
                                    </div>
                                    <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                                        {contentByType.training.map((item) => (
                                            <ContentCard key={item.$id} content={item} canEdit={!!canEdit} />
                                        ))}
                                    </div>
                                </section>
                            )}

                            {/* Announcements */}
                            {contentByType.announcement && contentByType.announcement.length > 0 && (
                                <section>
                                    <div className="flex items-center justify-between mb-6">
                                        <h2 className="text-2xl font-bold text-white">Announcements</h2>
                                        {canEdit && (
                                            <Link href="/dashboard/content/new?type=announcement">
                                                <Button variant="outline" size="sm" className="border-purple-500 text-purple-400 hover:bg-purple-500 hover:text-white">
                                                    <Icon icon="heroicons:plus-16-solid" className="h-4 w-4 mr-2" />
                                                    Add Announcement
                                                </Button>
                                            </Link>
                                        )}
                                    </div>
                                    <div className="space-y-4">
                                        {contentByType.announcement.map((item) => (
                                            <ContentCard key={item.$id} content={item} fullWidth canEdit={!!canEdit} />
                                        ))}
                                    </div>
                                </section>
                            )}
                        </div>
                    )}
                </div>
            </div>
        </DepartmentLayout>
    );
}

interface ContentCardProps {
    content: Content;
    fullWidth?: boolean;
    canEdit?: boolean;
}

function ContentCard({ content, fullWidth = false, canEdit = false }: ContentCardProps) {
    const href = `/ems/${content.type}/${content.slug}`;

    return (
        <div className={`bg-gray-800/50 border border-gray-800 rounded-lg p-6 hover:bg-gray-800/70 transition-colors ${fullWidth ? 'w-full' : ''}`}>
            <div className="flex items-start justify-between mb-4">
                <div className="flex-1">
                    <h3 className="text-lg font-semibold text-white mb-2 uppercase tracking-wider">
                        <a href={href} className="hover:text-purple-400 transition-colors">
                            {content.title}
                        </a>
                    </h3>
                    {content.tags && content.tags.length > 0 && (
                        <div className="flex flex-wrap gap-2 mb-3">
                            {content.tags.map((tag) => (
                                <span
                                    key={tag}
                                    className="px-2 py-1 text-xs font-medium bg-purple-500/20 text-purple-300 rounded-md"
                                >
                                    {tag}
                                </span>
                            ))}
                        </div>
                    )}
                </div>
                <div className="flex items-center gap-2">
                    <div className="text-sm text-gray-400">
                        v{content.version}
                    </div>
                    {canEdit && (
                        <Link href={`/dashboard/content/${content.$id}/edit`}>
                            <Button variant="ghost" size="sm" className="h-8 w-8 p-0 text-gray-400 hover:text-purple-400">
                                <Icon icon="heroicons:pencil-16-solid" className="h-4 w-4" />
                            </Button>
                        </Link>
                    )}
                </div>
            </div>

            <div className="text-sm text-gray-400 flex items-center justify-between">
                <span className="capitalize">
                    {content.type.replace('-', ' ')}
                </span>
                {content.publishedAt && (
                    <span>
                        {new Date(content.publishedAt).toLocaleDateString()}
                    </span>
                )}
            </div>
        </div>
    );
} 