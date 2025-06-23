import { NextResponse } from 'next/server';
import {
    adminDatabases,
    adminUsers,
    DATABASE_ID,
    COLLECTIONS,
} from '@/lib/appwrite-server';
import { getCurrentUserFromRequest, hasPermission, UserRole } from '@/lib/auth';

export async function POST(request: Request) {
    try {
        const currentUser = await getCurrentUserFromRequest(request);

        if (!currentUser || !hasPermission(currentUser.role as UserRole, 'admin')) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const { userProfileId, appwriteAccountId } = await request.json();

        if (!userProfileId || !appwriteAccountId) {
            return NextResponse.json({ error: 'Missing userProfileId or appwriteAccountId' }, { status: 400 });
        }

        // 1. Get the user profile and the auth account
        const [userProfile, authAccount] = await Promise.all([
            adminDatabases.getDocument(DATABASE_ID, COLLECTIONS.USERS, userProfileId),
            adminUsers.get(appwriteAccountId),
        ]);

        if (!userProfile) {
            return NextResponse.json({ error: 'User profile not found' }, { status: 404 });
        }
        if (!authAccount) {
            return NextResponse.json({ error: 'Authentication account not found' }, { status: 404 });
        }

        // 2. Update the user profile with the Appwrite account ID and email
        await adminDatabases.updateDocument(
            DATABASE_ID,
            COLLECTIONS.USERS,
            userProfileId,
            {
                appwriteAccountId: appwriteAccountId,
                email: authAccount.email, // Sync email
            }
        );

        // 3. Update the Appwrite auth account's preferences with role and department
        await adminUsers.updatePrefs(appwriteAccountId, {
            ...authAccount.prefs,
            role: userProfile.role,
            department: userProfile.department,
        });

        return NextResponse.json({ success: true, message: 'Account linked successfully' });

    } catch (error) {
        console.error('Error linking account:', error);
        const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred';
        return NextResponse.json({ error: 'Failed to link account', details: errorMessage }, { status: 500 });
    }
} 