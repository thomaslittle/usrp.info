import React from 'react';
import Image from 'next/image';
import { DepartmentLayout } from '@/components/department-layout';
import { SOPContent } from '@/components/sop-content';

const emsConfig = {
    name: 'EMS',
    description: 'EMS/TacMed Department',
    icon: 'heroicons:heart-16-solid',
    color: 'from-purple-500 to-violet-600',
    primaryRoute: '/ems',
    routes: [
        {
            name: 'Reference Guide',
            path: '/ems',
            icon: 'ion:medical',
            description: 'Medical protocols and treatment guides'
        },
        {
            name: 'Mastersheet Data',
            path: '/ems/sops',
            icon: 'heroicons:book-open-16-solid',
            description: 'Comprehensive department data and guidelines'
        },
        // {
        //     name: 'Communication Codes',
        //     path: '/ems/codes',
        //     icon: 'heroicons:radio-16-solid',
        //     description: '10-codes and radio protocols'
        // },
        // {
        //     name: 'Treatment Protocols',
        //     path: '/ems/protocols',
        //     icon: 'heroicons:clipboard-document-list-16-solid',
        //     description: 'Emergency treatment procedures'
        // },
        // {
        //     name: 'Equipment Guide',
        //     path: '/ems/equipment',
        //     icon: 'heroicons:wrench-screwdriver-16-solid',
        //     description: 'Medical equipment and supplies'
        // }
    ]
};

export default function EMSSOPsPage() {
    return (
        <DepartmentLayout config={emsConfig} currentPath="/ems/sops">
            <div className="relative py-8">
                <div className="absolute inset-0 -z-10">
                    <Image src="/images/bg.webp" alt="background" fill className="object-cover" quality={80} />
                    <div className="absolute inset-0 bg-black/50"></div>
                    <div className="absolute inset-0 bg-gradient-to-br from-purple-500/10 via-transparent to-blue-500/10"></div>
                </div>
                <div className="container mx-auto px-6 lg:px-8">
                    <SOPContent />
                </div>
            </div>
        </DepartmentLayout>
    );
} 