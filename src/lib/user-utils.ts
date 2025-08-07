import { User } from '@/types';

/**
 * Simple function - no merging, just return all users as-is
 * Characters (@ems.usrp.info) can be linked to auth users, but we show both separately
 */
export function mergeLinkedUsers(allUsers: User[]): User[] {
    // Just return all users as-is, no complex merging
    return allUsers;
} 