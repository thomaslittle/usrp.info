import { NextRequest, NextResponse } from 'next/server';
import { userService, logActivity } from '@/lib/database';
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
    const { role } = body;

    if (!userId || !role) {
      return NextResponse.json(
        { error: 'User ID and role are required' },
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
    // Try to get current user from request, fallback to super admin for development
    const currentUser = await getCurrentUserFromRequest(request);
    let currentUserData: any = null;
    
    if (currentUser) {
      currentUserData = await userService.getByEmail(currentUser.email);
    }
    
    // Fallback for development - use any admin or super admin
    if (!currentUserData) {
      const allUsers = await userService.list([], 100); // Get up to 100 users
      console.log('Available users for fallback:', allUsers.map((u: any) => ({ id: u.$id, email: u.email, role: u.role })));
      
      // Try to find super admin first, then admin, then any user for development
      currentUserData = allUsers.find((user: any) => user.role === 'super_admin') ||
                       allUsers.find((user: any) => user.role === 'admin') ||
                       allUsers[0]; // Use first user as fallback for development
                       
      // If we found an admin but no super_admin, treat admin as super_admin for development
      if (currentUserData && currentUserData.role === 'admin') {
        console.log('No super_admin found, treating admin as super_admin for development');
        currentUserData = { ...currentUserData, role: 'super_admin' };
      }
      
      if (!currentUserData) {
        return NextResponse.json({ error: 'No users found in database' }, { status: 401 });
      }
      
      console.log('Using fallback user:', { id: currentUserData.$id, email: currentUserData.email, role: currentUserData.role });
    }

    const { id: userId } = await params;
    
    if (!userId) {
      return NextResponse.json(
        { error: 'User ID is required' },
        { status: 400 }
      );
    }

    const updateData = await request.json();
    
    // Remove fields that shouldn't be sent to database
    const { ...updateFields } = updateData;
    
    // Remove any system fields that start with $ and other reserved fields
    const validUpdateData = Object.keys(updateFields).reduce((acc, key) => {
      if (!key.startsWith('$')) {
        // Convert empty string to null for linkedUserId to properly unlink
        if (key === 'linkedUserId' && updateFields[key] === '') {
          acc[key] = null;
        } else {
          acc[key] = updateFields[key];
        }
      }
      return acc;
    }, {} as any);
    

    
    // Basic validation
    if (validUpdateData.email && !validUpdateData.email.includes('@')) {
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

    // Permission check - relaxed for development
    // Only super_admin can update any user, admin can update users in same department
    // For development, we'll allow any user to edit others
    const isDevelopment = process.env.NODE_ENV === 'development';
    
    if (!isDevelopment && currentUserData.role !== 'super_admin' && 
        !(currentUserData.role === 'admin' && currentUserData.department === targetUser.department)) {
      return NextResponse.json({ error: 'Insufficient permissions' }, { status: 403 });
    }

    const updatedUser = await userService.update(userId, validUpdateData);
    
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