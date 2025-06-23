import { NextResponse } from 'next/server';
import { departmentService, contentService } from '@/lib/database';
import { AppwriteException } from 'node-appwrite';

export async function GET(
    request: Request,
    { params }: { params: { slug: string } }
) {
    try {
        const { slug } = params;

        if (!slug) {
            return new NextResponse(
                JSON.stringify({ error: 'Department slug is required' }),
                { status: 400, headers: { 'Content-Type': 'application/json' } }
            );
        }

        const department = await departmentService.getBySlug(slug);

        if (!department) {
            return new NextResponse(
                JSON.stringify({ error: 'Department not found' }),
                { status: 404, headers: { 'Content-Type': 'application/json' } }
            );
        }

        // Only fetch published content for public-facing pages
        const content = await contentService.getByDepartment(department.$id, 'published');

        return NextResponse.json({ department, content });
    } catch (e) {
        if (e instanceof AppwriteException) {
            console.error(e);
            return new NextResponse(
                JSON.stringify({ error: e.message }),
                { status: e.code, headers: { 'Content-Type': 'application/json' } }
            );
        }
        
        console.error(e);
        return new NextResponse(
            JSON.stringify({ error: 'An unexpected error occurred' }),
            { status: 500, headers: { 'Content-Type': 'application/json' } }
        );
    }
} 