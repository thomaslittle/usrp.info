import { NextRequest, NextResponse } from 'next/server';
import { userService, logActivity, notificationService } from '@/lib/database';
import { getCurrentUserFromRequest } from '@/lib/auth';

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const currentUser = await getCurrentUserFromRequest(request);
    if (!currentUser) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id: userId } = await params;
    const body = await request.json();
    const { role, currentUserEmail } = body;

    if (!userId || !role || !currentUserEmail) {
      return NextResponse.json(
        { error: 'User ID, role, and current user email are required' },
        { status: 400 }
      );
    }

    // Get current user to check permissions
    const currentUserData = await userService.getByEmail(currentUser.email);
    if (!currentUserData) {
      return NextResponse.json(
        { error: 'Current user not found' },
        { status: 404 }
      );
    }

    // Permission checks
    if (!['admin', 'super_admin'].includes(currentUserData.role)) {
      return NextResponse.json(
        { error: 'Insufficient permissions' },
        { status: 403 }
      );
    }

    // Get target user
    const targetUser = await userService.getById(userId);
    if (!targetUser) {
      return NextResponse.json(
        { error: 'Target user not found' },
        { status: 404 }
      );
    }

    // Admins can't promote to super_admin or modify other admins/super_admins
    if (currentUserData.role === 'admin') {
      if (['admin', 'super_admin'].includes(targetUser.role)) {
        return NextResponse.json(
          { error: 'Cannot modify admin or super admin accounts' },
          { status: 403 }
        );
      }
      if (role === 'super_admin') {
        return NextResponse.json(
          { error: 'Cannot promote users to super admin' },
          { status: 403 }
        );
      }
      if (targetUser.department !== currentUserData.department) {
        return NextResponse.json(
          { error: 'Can only modify users in your department' },
          { status: 403 }
        );
      }
    }

    // Update user role
    await userService.update(userId, { role });

    // Log the activity
    await logActivity(
      currentUserData.userId,
      'update',
      'user',
      `Changed role of ${targetUser.username} to ${role}`,
      userId
    );

    return NextResponse.json({ 
      success: true,
      message: 'User role updated successfully' 
    });
  } catch (error) {
    console.error('Error updating user role:', error);
    return NextResponse.json(
      { error: 'Failed to update user role' },
      { status: 500 }
    );
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const currentUser = await getCurrentUserFromRequest(request);
    if (!currentUser) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id: userId } = await params;
    
    if (!userId) {
      return NextResponse.json(
        { error: 'User ID is required' },
        { status: 400 }
      );
    }

    const updateData = await request.json();
    
    // Basic validation
    if (updateData.email && !updateData.email.includes('@')) {
      return NextResponse.json(
        { error: 'Invalid email format' },
        { status: 400 }
      );
    }

    // Check if current user can update this user
    const targetUser = await userService.getById(userId);
    if (!targetUser) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }

    // Authorization check
    const currentUserData = await userService.getByEmail(currentUser.email);
    if (!currentUserData) {
      return NextResponse.json({ error: 'Current user not found' }, { status: 404 });
    }

    // Only super_admin can update any user, admin can update users in same department
    if (currentUserData.role !== 'super_admin' && 
        !(currentUserData.role === 'admin' && currentUserData.department === targetUser.department)) {
      return NextResponse.json({ error: 'Insufficient permissions' }, { status: 403 });
    }

    const updatedUser = await userService.update(userId, updateData);
    
    return NextResponse.json({ 
      success: true, 
      user: updatedUser 
    });
  } catch (error) {
    console.error('Error updating user:', error);
    return NextResponse.json(
      { error: 'Failed to update user' },
      { status: 500 }
    );
  }
}

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: userId } = await params;
    
    if (!userId) {
      return NextResponse.json(
        { error: 'User ID is required' },
        { status: 400 }
      );
    }

    const user = await userService.getById(userId);
    
    if (!user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }

    // Remove sensitive information
    const { ...safeUser } = user;
    
    return NextResponse.json({ user: safeUser });
  } catch (error) {
    console.error('Error fetching user:', error);
    return NextResponse.json(
      { error: 'Failed to fetch user' },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const currentUser = await getCurrentUserFromRequest(request);
    if (!currentUser) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id: userId } = await params;
    
    if (!userId) {
      return NextResponse.json(
        { error: 'User ID is required' },
        { status: 400 }
      );
    }

    // Get current user data for authorization
    const currentUserData = await userService.getByEmail(currentUser.email);
    if (!currentUserData) {
      return NextResponse.json({ error: 'Current user not found' }, { status: 404 });
    }

    // Only super_admin can delete users
    if (currentUserData.role !== 'super_admin') {
      return NextResponse.json({ error: 'Insufficient permissions' }, { status: 403 });
    }

    // Prevent self-deletion
    if (userId === currentUserData.$id) {
      return NextResponse.json(
        { error: 'Cannot delete your own account' },
        { status: 400 }
      );
    }

    await userService.delete(userId);
    
    return NextResponse.json({ 
      success: true,
      message: 'User deleted successfully' 
    });
  } catch (error) {
    console.error('Error deleting user:', error);
    return NextResponse.json(
      { error: 'Failed to delete user' },
      { status: 500 }
    );
  }
} 