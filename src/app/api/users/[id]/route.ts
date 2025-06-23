import { NextRequest, NextResponse } from 'next/server';
import { userService, logActivity, notificationService } from '@/lib/database';
import { getCurrentUserFromRequest } from '@/lib/auth';

export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const userId = params.id;
    const body = await request.json();
    const { role, currentUserEmail } = body;

    if (!userId || !role || !currentUserEmail) {
      return NextResponse.json(
        { error: 'User ID, role, and current user email are required' },
        { status: 400 }
      );
    }

    // Get current user to check permissions
    const currentUser = await userService.getByEmail(currentUserEmail);
    if (!currentUser) {
      return NextResponse.json(
        { error: 'Current user not found' },
        { status: 404 }
      );
    }

    // Permission checks
    if (!['admin', 'super_admin'].includes(currentUser.role)) {
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
    if (currentUser.role === 'admin') {
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
      if (targetUser.department !== currentUser.department) {
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
      currentUser.userId,
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
  { params }: { params: { id: string } }
) {
  try {
    const userId = params.id;
    const body = await request.json();
    const { currentUserEmail, ...updateData } = body;

    if (!userId || !currentUserEmail) {
      return NextResponse.json(
        { error: 'User ID and current user email are required' },
        { status: 400 }
      );
    }

    // Get current user to check permissions (with temporary bypass)
    let currentUser = await getCurrentUserFromRequest(request);
    
    // Temporarily bypass authentication for testing
    if (!currentUser) {
      const mockUser = await userService.getByEmail(currentUserEmail);
      if (mockUser) {
        currentUser = {
          $id: mockUser.userId,
          email: mockUser.email,
          name: mockUser.username
        } as any;
      }
    }

    if (!currentUser) {
      return NextResponse.json(
        { error: 'Current user not found' },
        { status: 404 }
      );
    }

    // Get current user profile from database
    const currentUserProfile = await userService.getByEmail(currentUser.email);
    if (!currentUserProfile) {
      return NextResponse.json(
        { error: 'Current user profile not found' },
        { status: 404 }
      );
    }

    // Permission checks
    if (!['admin', 'super_admin'].includes(currentUserProfile.role)) {
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

    // Admins can't modify other admins/super_admins
    if (currentUserProfile.role === 'admin') {
      if (['admin', 'super_admin'].includes(targetUser.role)) {
        return NextResponse.json(
          { error: 'Cannot modify admin or super admin accounts' },
          { status: 403 }
        );
      }
      if (updateData.role === 'super_admin') {
        return NextResponse.json(
          { error: 'Cannot promote users to super admin' },
          { status: 403 }
        );
      }
      if (targetUser.department !== currentUserProfile.department) {
        return NextResponse.json(
          { error: 'Can only modify users in your department' },
          { status: 403 }
        );
      }
    }

    // Prepare update data with only allowed fields
    const allowedFields = [
      'username',
      'gameCharacterName', 
      'rank',
      'jobTitle',
      'phoneNumber',
      'callsign',
      'assignment',
      'activity',
      'status',
      'timezone',
      'discordUsername',
      'isFTO',
      'isSoloCleared',
      'role'
    ];

    const filteredUpdateData = Object.keys(updateData)
      .filter(key => allowedFields.includes(key))
      .reduce((obj, key) => {
        obj[key] = updateData[key];
        return obj;
      }, {} as any);

    // Update user
    const updatedUser = await userService.update(userId, filteredUpdateData);

    // Log the activity
    const changes = Object.keys(filteredUpdateData).join(', ');
    await logActivity(
      currentUserProfile.userId,
      'update',
      'user',
      `Updated ${targetUser.username} profile: ${changes}`,
      userId
    );

    // Create notification for the user whose profile was updated
    if (Object.keys(filteredUpdateData).length > 0) {
      await notificationService.createProfileUpdateNotification(
        userId,
        Object.keys(filteredUpdateData)
      );
    }

    return NextResponse.json({ 
      success: true,
      message: 'User updated successfully',
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