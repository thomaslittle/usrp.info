import { NextRequest, NextResponse } from 'next/server';
import { adminDatabases, DATABASE_ID, COLLECTIONS } from '@/lib/appwrite-server';
import { ID } from 'node-appwrite';

export async function POST(request: NextRequest) {
  try {
    const userData = await request.json();
    const documentId = ID.unique();

    // Build user data with only required fields and non-empty optional fields
    const userDoc: any = {
      userId: documentId, // Set userId to match document ID
      email: userData.email,
      username: userData.username,
      department: userData.department,
      role: userData.role || 'viewer',
      createdAt: new Date(),
      isFTO: userData.isFTO || false,
      isSoloCleared: userData.isSoloCleared || false,
    };

    // Add optional fields only if they have values
    if (userData.gameCharacterName) userDoc.gameCharacterName = userData.gameCharacterName;
    if (userData.rank) userDoc.rank = userData.rank;
    if (userData.jobTitle) userDoc.jobTitle = userData.jobTitle;
    if (userData.phoneNumber) userDoc.phoneNumber = userData.phoneNumber;
    if (userData.callsign) userDoc.callsign = userData.callsign;
    if (userData.assignment) userDoc.assignment = userData.assignment;
    if (userData.activity) userDoc.activity = userData.activity;
    if (userData.status) userDoc.status = userData.status;
    if (userData.timezone) userDoc.timezone = userData.timezone;
    if (userData.discordUsername) userDoc.discordUsername = userData.discordUsername;

    console.log('Creating user with data:', userDoc);

    // Use adminDatabases to create user
    const user = await adminDatabases.createDocument(
      DATABASE_ID,
      COLLECTIONS.USERS,
      documentId,
      userDoc
    );

    return NextResponse.json({ user });
  } catch (error) {
    console.error('Error creating user:', error);
    console.error('Error details:', error instanceof Error ? error.message : 'Unknown error');
    return NextResponse.json(
      { error: 'Failed to create user', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
} 