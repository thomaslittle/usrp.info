import { NextResponse } from 'next/server';
import { userService } from '@/lib/database';
import { User } from '@/types';

export async function GET() {
  try {
    // Get EMS users from the database
    const emsUsers = (await userService.getByDepartment('ems')) as unknown as User[];
    
    const filteredUsers = emsUsers.filter(user => user.role !== 'super_admin');

    // Transform the data to match the expected format for the roster
    const rosterData = filteredUsers.map(user => ({
      name: user.gameCharacterName || user.username,
      rank: user.rank || 'Unknown',
      callsign: user.callsign || '',
      assignment: user.assignment || '',
      activity: user.activity || 'Inactive',
      status: user.status || 'Unknown',
      fto: user.isFTO || false,
      soloCleared: user.isSoloCleared || false,
      waterRescue: false, // These fields don't exist in the database yet
      coPilot: false,
      aviation: false,
      psychNeuro: false,
      ftoCert: user.isFTO || false
    }));

    return NextResponse.json({ 
      users: rosterData,
      total: rosterData.length
    });
  } catch (error) {
    console.error('Error fetching EMS roster:', error);
    return NextResponse.json(
      { error: 'Failed to fetch EMS roster' },
      { status: 500 }
    );
  }
} 