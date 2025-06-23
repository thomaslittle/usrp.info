import { NextRequest, NextResponse } from 'next/server';
import { userService } from '@/lib/database';

export async function POST(request: NextRequest) {
    try {
        const { email, role, currentUserEmail } = await request.json();

        if (!email || !role) {
            return NextResponse.json(
                { success: false, error: 'Email and role are required' },
                { status: 400 }
            );
        }

        // Get current user to check permissions
        let currentUser = null;
        if (currentUserEmail) {
            currentUser = await userService.getByEmail(currentUserEmail);
        }

        // Special case: If no current user is provided, check if this is the first user
        if (!currentUser) {
            const allUsers = await userService.list();
            if (allUsers.length === 0) {
                // This is the first user, allow promotion to super_admin
                console.log('First user detected, allowing super_admin promotion');
            } else {
                return NextResponse.json(
                    { success: false, error: 'Authentication required' },
                    { status: 401 }
                );
            }
        } else {
            // Check if current user has permission to promote
            if (currentUser.role !== 'super_admin') {
                return NextResponse.json(
                    { success: false, error: 'Only super admins can promote users' },
                    { status: 403 }
                );
            }
        }

        // Get user by email
        const user = await userService.getByEmail(email);
        if (!user) {
            return NextResponse.json(
                { success: false, error: 'User not found' },
                { status: 404 }
            );
        }

        // Update user role
        await userService.update(user.$id, { role });

        return NextResponse.json({ 
            success: true, 
            message: `User ${email} promoted to ${role}`,
            user: {
                id: user.$id,
                email: user.email,
                username: user.username,
                role: role
            }
        });

    } catch (error) {
        console.error('Error promoting user:', error);
        return NextResponse.json(
            { success: false, error: 'Failed to promote user' },
            { status: 500 }
        );
    }
} 