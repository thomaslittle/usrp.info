import { NextRequest, NextResponse } from 'next/server';
// Database operations handled by service layer
import { getCurrentUserFromRequest } from '@/lib/auth';
import { userService, departmentService, contentService, logActivity, notificationService } from '@/lib/database';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const userEmail = searchParams.get('email');

    if (!userEmail) {
      return NextResponse.json(
        { error: 'Email parameter is required' },
        { status: 400 }
      );
    }

    // Get user profile to check permissions
    const userData = await userService.getByEmail(userEmail);
    if (!userData) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }

    let content = [];
    let userDepartment = null;

    // Get user's department info
    const department = await departmentService.getBySlug(userData.department);
    if (department) {
      userDepartment = department;
    }

    // Super admins can see all content
    if (userData.role === 'super_admin') {
      content = await contentService.getAll();
    } else {
      // Regular users see content from their department
      if (!department) {
        return NextResponse.json(
          { error: 'Department not found' },
          { status: 404 }
        );
      }

      content = await contentService.getByDepartment(department.$id);
    }

    return NextResponse.json({ 
      content,
      user: userData,
      userDepartment 
    });
  } catch (error) {
    console.error('Error in GET /api/content:', error);
    return NextResponse.json(
      { error: 'Failed to get content' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
    try {
        const user = await getCurrentUserFromRequest(request);
        if (!user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const body = await request.json();
        const { contentData } = body;

        if (!contentData) {
            return NextResponse.json({ error: 'Missing content data' }, { status: 400 });
        }

        // Get the current user data
        const currentUser = await userService.getByEmail(user.email);
        if (!currentUser) {
            return NextResponse.json({ error: 'User not found' }, { status: 404 });
        }

        const result = await contentService.create(contentData, currentUser.$id);

        // Log the activity
        await logActivity(
            currentUser.$id,
            'create',
            'content',
            `Created ${contentData.type}: ${contentData.title}`,
            result.$id
        );

        // Create notification for department users
        await notificationService.createContentNotification(
            result.$id,
            contentData.title,
            currentUser.username || currentUser.email,
            contentData.departmentId,
            'content_created',
            `/ems/${contentData.type}/${contentData.slug}`
        );

        return NextResponse.json({ success: true, content: result }, { status: 201 });
    } catch (error) {
        console.error('Error creating content:', error);
        return NextResponse.json({ error: 'Failed to create content' }, { status: 500 });
    }
} 