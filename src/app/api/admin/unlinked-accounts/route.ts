import { NextResponse } from 'next/server';
import { adminDatabases, DATABASE_ID, COLLECTIONS, adminUsers } from '@/lib/appwrite-server';
import { getCurrentUserFromRequest, hasPermission, UserRole } from '@/lib/auth';
import { Models } from 'node-appwrite';

export async function GET(request: Request) {
    try {
        const currentUser = await getCurrentUserFromRequest(request);

        if (!currentUser || !hasPermission(currentUser.role as UserRole, 'admin')) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        // 1. Fetch all Appwrite authentication accounts
        const { users: allAuthAccounts } = await adminUsers.list();

        // 2. Fetch all user profiles from the database
        const { documents: allUserProfiles } = await adminDatabases.listDocuments(
            DATABASE_ID,
            COLLECTIONS.USERS
        );

        // 3. Create a set of linked Appwrite account IDs for quick lookup
        const linkedAccountIds = new Set(
            allUserProfiles
                .map(profile => profile.appwriteAccountId)
                .filter(Boolean)
        );

        // 4. Filter auth accounts to find those that are not linked
        const unlinkedAccounts = allAuthAccounts.filter(
            (account: Models.User<Models.Preferences>) => !linkedAccountIds.has(account.$id)
        );

        // 5. Return the list of unlinked accounts
        return NextResponse.json(unlinkedAccounts.map((acc: Models.User<Models.Preferences>) => ({ id: acc.$id, email: acc.email })));

    } catch (error) {
        console.error('Error fetching unlinked accounts:', error);
        const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred';
        return NextResponse.json({ error: 'Failed to fetch unlinked accounts', details: errorMessage }, { status: 500 });
    }
} 