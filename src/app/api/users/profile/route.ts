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

    const user = result.documents.length > 0 ? result.documents[0] : null;

    return NextResponse.json({ user });
  } catch (error) {
    console.error('Error getting user profile:', error);
    return NextResponse.json(
      { error: 'Failed to get user profile' },
      { status: 500 }
    );
  }
} 