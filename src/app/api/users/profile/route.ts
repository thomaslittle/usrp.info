import { NextRequest, NextResponse } from 'next/server';
import { adminDatabases, DATABASE_ID, COLLECTIONS } from '@/lib/appwrite-server';
import { Query } from 'node-appwrite';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const email = searchParams.get('email');

    if (!email) {
      return NextResponse.json(
        { error: 'Email parameter is required' },
        { status: 400 }
      );
    }

    // Use adminDatabases to get user by email
    const result = await adminDatabases.listDocuments(
      DATABASE_ID,
      COLLECTIONS.USERS,
      [Query.equal('email', email)]
    );

    let user = result.documents.length > 0 ? result.documents[0] : null;

    // If user has a linkedUserId, fetch the linked user's data and merge it
    if (user && user.linkedUserId) {
      try {
        const linkedUser = await adminDatabases.getDocument(
          DATABASE_ID,
          COLLECTIONS.USERS,
          user.linkedUserId
        );
        
        // Merge linked user's data with current user, prioritizing linked user's profile info
        user = {
          ...user, // Keep original user's auth info (email, role, etc.)
          // Override with linked user's profile information
          username: linkedUser.username || user.username,
          gameCharacterName: linkedUser.gameCharacterName || user.gameCharacterName,
          rank: linkedUser.rank || user.rank,
          jobTitle: linkedUser.jobTitle || user.jobTitle,
          phoneNumber: linkedUser.phoneNumber || user.phoneNumber,
          callsign: linkedUser.callsign || user.callsign,
          assignment: linkedUser.assignment || user.assignment,
          activity: linkedUser.activity || user.activity,
          status: linkedUser.status || user.status,
          timezone: linkedUser.timezone || user.timezone,
          discordUsername: linkedUser.discordUsername || user.discordUsername,
          isFTO: linkedUser.isFTO !== undefined ? linkedUser.isFTO : user.isFTO,
          isSoloCleared: linkedUser.isSoloCleared !== undefined ? linkedUser.isSoloCleared : user.isSoloCleared,
          isWaterRescue: linkedUser.isWaterRescue !== undefined ? linkedUser.isWaterRescue : user.isWaterRescue,
          isCoPilotCert: linkedUser.isCoPilotCert !== undefined ? linkedUser.isCoPilotCert : user.isCoPilotCert,
          isAviationCert: linkedUser.isAviationCert !== undefined ? linkedUser.isAviationCert : user.isAviationCert,
          isPsychNeuro: linkedUser.isPsychNeuro !== undefined ? linkedUser.isPsychNeuro : user.isPsychNeuro,
        };
      } catch (error) {
        console.error('Error fetching linked user:', error);
        // Continue with original user if linked user fetch fails
      }
    }

    return NextResponse.json({ user });
  } catch (error) {
    console.error('Error getting user profile:', error);
    return NextResponse.json(
      { error: 'Failed to get user profile' },
      { status: 500 }
    );
  }
} 