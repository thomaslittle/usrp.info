import { NextRequest, NextResponse } from 'next/server';
import { contentService, departmentService } from '@/lib/database';

interface RouteParams {
  params: {
    params: string[];
  };
}

export async function GET(request: NextRequest, { params }: RouteParams) {
  try {
    const [departmentSlug, ...rest] = params.params;
    
    if (!departmentSlug) {
      return NextResponse.json(
        { error: 'Department slug is required' },
        { status: 400 }
      );
    }

    // Get department by slug
    const department = await departmentService.getBySlug(departmentSlug);
    if (!department) {
      return NextResponse.json(
        { error: 'Department not found' },
        { status: 404 }
      );
    }

    // If no additional params, return all content for department
    if (rest.length === 0) {
      const content = await contentService.getByDepartment(department.$id);
      return NextResponse.json({ content, department });
    }

    // If one param, it could be content type or slug
    if (rest.length === 1) {
      const param = rest[0];
      
      // First try to get by slug
      const contentBySlug = await contentService.getBySlug(department.$id, param);
      if (contentBySlug) {
        return NextResponse.json({ content: contentBySlug, department });
      }

      // If not found by slug, try as content type
      const validTypes = ['sop', 'guide', 'announcement', 'resource', 'training'];
      if (validTypes.includes(param)) {
        const contentByType = await contentService.getByType(department.$id, param as any);
        return NextResponse.json({ content: contentByType, department });
      }

      return NextResponse.json(
        { error: 'Content not found' },
        { status: 404 }
      );
    }

    // If two params, first is type, second is slug
    if (rest.length === 2) {
      const [type, slug] = rest;
      const content = await contentService.getBySlug(department.$id, slug);
      
      if (!content) {
        return NextResponse.json(
          { error: 'Content not found' },
          { status: 404 }
        );
      }

      // Verify the content type matches
      if (content.type !== type) {
        return NextResponse.json(
          { error: 'Content type mismatch' },
          { status: 400 }
        );
      }

      return NextResponse.json({ content, department });
    }

    return NextResponse.json(
      { error: 'Invalid route parameters' },
      { status: 400 }
    );

  } catch (error) {
    console.error('Content API error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
} 