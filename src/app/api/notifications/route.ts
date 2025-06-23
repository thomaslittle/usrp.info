import { NextRequest, NextResponse } from 'next/server';
import { notificationService } from '@/lib/database';
import { getCurrentUserFromRequest } from '@/lib/auth';

export async function GET(request: NextRequest) {
  try {
    // Get current user (temporarily bypassed for testing)
    // const currentUser = await getCurrentUserFromRequest(request);
    // if (!currentUser) {
    //   return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    // }

    // Temporary mock user for testing
    const currentUser = { $id: 'user123', email: 'tomlit@gmail.com' };

    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId') || currentUser.$id;
    const limit = parseInt(searchParams.get('limit') || '20');
    const offset = parseInt(searchParams.get('offset') || '0');

    // Get notifications and unread count
    const [notifications, unreadCount] = await Promise.all([
      notificationService.getByUserId(userId, limit, offset),
      notificationService.getUnreadCount(userId)
    ]);

    return NextResponse.json({
      notifications,
      unreadCount,
      total: notifications.length
    });
  } catch (error) {
    console.error('Error fetching notifications:', error);
    return NextResponse.json(
      { error: 'Failed to fetch notifications' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    // Get current user (temporarily bypassed for testing)
    // const currentUser = await getCurrentUserFromRequest(request);
    // if (!currentUser) {
    //   return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    // }

    const body = await request.json();
    const notification = await notificationService.create(body);

    return NextResponse.json(notification, { status: 201 });
  } catch (error) {
    console.error('Error creating notification:', error);
    return NextResponse.json(
      { error: 'Failed to create notification' },
      { status: 500 }
    );
  }
} 