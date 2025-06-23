import { NextRequest, NextResponse } from 'next/server';
import { userService } from '@/lib/database';

export async function POST(request: NextRequest) {
    try {
        const { email } = await request.json();

        if (!email) {
            return NextResponse.json(
                { success: false, error: 'Email is required' },
                { status: 400 }
            );
        }

        // Check if this is the first user or if user already exists
        const user = await userService.getByEmail(email);
        if (!user) {
            return NextResponse.json(
                { success: false, error: 'User not found. Please register first.' },
                { status: 404 }
            );
        }

        // Check if there are any super admins already
        const allUsers = await userService.list();
        const superAdmins = allUsers.filter(u => u.role === 'super_admin');
        
        if (superAdmins.length > 0) {
            return NextResponse.json(
                { success: false, error: 'Super admin already exists. Only one super admin is allowed.' },
                { status: 403 }
            );
        }

        // Promote user to super_admin
        await userService.update(user.$id, { role: 'super_admin' });

        return NextResponse.json({ 
            success: true, 
            message: `User ${email} promoted to super_admin`,
            user: {
                id: user.$id,
                email: user.email,
                username: user.username,
                role: 'super_admin'
            }
        });

    } catch (error) {
        console.error('Error setting up super admin:', error);
        return NextResponse.json(
            { success: false, error: 'Failed to set up super admin' },
            { status: 500 }
        );
    }
} 