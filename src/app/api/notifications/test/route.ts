import { NextResponse } from 'next/server';
import { notificationService } from '@/lib/database';
import { ID } from 'appwrite';

export async function POST() {
  try {
    // Create a test notification
    const testNotification = await notificationService.create({
      notificationId: ID.unique(),
      userId: 'user123', // Using our mock user ID
      type: 'content_created',
      title: 'Test Notification',
      message: 'This is a test notification to verify the system is working.',
      priority: 'medium',
      actionUrl: '/ems',
      metadata: {
        contentId: 'test123',
        contentTitle: 'Test Content',
        authorName: 'System Test'
      },
      createdAt: new Date().toISOString()
    });

    return NextResponse.json({
      success: true,
      notification: testNotification,
      message: 'Test notification created successfully'
    });
  } catch (error) {
    console.error('Error creating test notification:', error);
    return NextResponse.json(
      { error: 'Failed to create test notification' },
      { status: 500 }
    );
  }
} 