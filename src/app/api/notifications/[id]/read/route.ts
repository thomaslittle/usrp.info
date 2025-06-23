import { NextRequest, NextResponse } from 'next/server';
import { notificationService } from '@/lib/database';
// import { getCurrentUserFromRequest } from '@/lib/auth';

interface RouteParams {
  params: Promise<{ id: string }>;
}

export async function POST(request: NextRequest, { params }: RouteParams) {
  try {
    const { id: notificationId } = await params;

    // Get current user (temporarily bypassed for testing)
    // const currentUser = await getCurrentUserFromRequest(request);
    // if (!currentUser) {
    //   return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    // }

    const notification = await notificationService.markAsRead(notificationId);

    return NextResponse.json(notification);
  } catch (error) {
    console.error('Error marking notification as read:', error);
    return NextResponse.json(
      { error: 'Failed to mark notification as read' },
      { status: 500 }
    );
  }
} 