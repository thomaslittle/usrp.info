import { NextRequest, NextResponse } from 'next/server';
import { notificationService } from '@/lib/database';
// import { getCurrentUserFromRequest } from '@/lib/auth';

export async function POST(request: NextRequest) {
  try {
    // Get current user (temporarily bypassed for testing)
    // const currentUser = await getCurrentUserFromRequest(request);
    // if (!currentUser) {
    //   return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    // }

    const body = await request.json();
    const { userId } = body;

    if (!userId) {
      return NextResponse.json({ error: 'User ID is required' }, { status: 400 });
    }

    await notificationService.markAllAsRead(userId);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error marking all notifications as read:', error);
    return NextResponse.json(
      { error: 'Failed to mark all notifications as read' },
      { status: 500 }
    );
  }
} 