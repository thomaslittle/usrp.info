import { NextRequest, NextResponse } from 'next/server';
import { adminDatabases, DATABASE_ID, COLLECTIONS } from '@/lib/appwrite-server';
import { Query } from 'node-appwrite';
import { getCurrentUserFromRequest } from '@/lib/auth';

export async function GET(request: NextRequest) {
  try {
    // Get current user from auth
    const currentUser = await getCurrentUserFromRequest(request);
    
    if (!currentUser) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Get user profile from database
    let userData;
    try {
      const userResult = await adminDatabases.listDocuments(
        DATABASE_ID,
        COLLECTIONS.USERS,
        [Query.equal('email', currentUser.email)]
      );
      
      userData = userResult.documents[0];
    } catch (userError) {
      console.error('Error fetching user:', userError);
      // Return default dashboard data if user lookup fails
      return NextResponse.json({
        user: {
          username: 'User',
          email: currentUser.email,
          role: 'viewer',
          department: 'ems'
        },
        stats: {
          totalContent: 0,
          publishedContent: 0,
          draftContent: 0,
          recentActivity: 0
        },
        recentContent: [],
        recentActivity: []
      });
    }

    if (!userData) {
      // Return default dashboard data if user not found
      return NextResponse.json({
        user: {
          username: 'User',
          email: currentUser.email,
          role: 'viewer',
          department: 'ems'
        },
        stats: {
          totalContent: 0,
          publishedContent: 0,
          draftContent: 0,
          recentActivity: 0
        },
        recentContent: [],
        recentActivity: []
      });
    }

    // Get the department document to find the actual department ID
    let department: any = null;
    let allContent: any[] = [];
    let recentActivity: any[] = [];
    
    try {
      const departmentResult = await adminDatabases.listDocuments(
        DATABASE_ID,
        COLLECTIONS.DEPARTMENTS,
        [Query.equal('slug', userData.department)]
      );
      department = departmentResult.documents[0];
    } catch (deptError) {
      console.error('Error fetching department:', deptError);
    }

    if (!department) {
      return NextResponse.json({
        user: userData,
        stats: {
          totalContent: 0,
          publishedContent: 0,
          draftContent: 0,
          recentActivity: 0
        },
        recentContent: [],
        recentActivity: []
      });
    }

    // Get all content for the department
    try {
      const allContentResult = await adminDatabases.listDocuments(
        DATABASE_ID,
        COLLECTIONS.CONTENT,
        [
          Query.equal('departmentId', department.$id),
          Query.orderDesc('updatedAt')
        ]
      );
      allContent = allContentResult.documents;
    } catch (contentError) {
      console.error('Error fetching content:', contentError);
    }

    const publishedContent = allContent.filter(content => content.status === 'published');
    const draftContent = allContent.filter(content => content.status === 'draft');

    // Get recent activity
    try {
      const activityResult = await adminDatabases.listDocuments(
        DATABASE_ID,
        COLLECTIONS.ACTIVITY_LOGS,
        [
          Query.orderDesc('$createdAt'),
          Query.limit(10)
        ]
      );
      recentActivity = activityResult.documents;
    } catch (activityError) {
      console.error('Error fetching activity:', activityError);
    }

    return NextResponse.json({
      user: userData,
      stats: {
        totalContent: allContent.length,
        publishedContent: publishedContent.length,
        draftContent: draftContent.length,
        recentActivity: recentActivity.length
      },
      recentContent: allContent.slice(0, 5),
      recentActivity: recentActivity
    });

  } catch (error) {
    console.error('Error getting dashboard stats:', error);
    return NextResponse.json(
      { error: 'Failed to get dashboard stats' },
      { status: 500 }
    );
  }
} 