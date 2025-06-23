import { NextRequest, NextResponse } from 'next/server';
import { userService } from '@/lib/database';

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

    // Get current user to check permissions
    const currentUser = await userService.getByEmail(userEmail);
    if (!currentUser) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }

    let users = [];

    // Check permissions and load appropriate users
    if (currentUser.role === 'super_admin') {
      // Super admin can see all users
      users = await userService.list();
    } else if (currentUser.role === 'admin') {
      // Admin can see users in their department
      users = await userService.getByDepartment(currentUser.department);
    } else {
      // Non-admin users cannot access user management
      return NextResponse.json(
        { error: 'Insufficient permissions' },
        { status: 403 }
      );
    }

    return NextResponse.json({ 
      users,
      currentUser 
    });
  } catch (error) {
    console.error('Error getting users:', error);
    return NextResponse.json(
      { error: 'Failed to get users' },
      { status: 500 }
    );
  }
} 