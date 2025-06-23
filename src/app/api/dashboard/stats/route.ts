import { NextRequest, NextResponse } from 'next/server';
import { adminDatabases, DATABASE_ID, COLLECTIONS } from '@/lib/appwrite-server';
import { Query } from 'node-appwrite';
import { getCurrentUserFromRequest } from '@/lib/auth';

export async function GET(request: NextRequest) {
  try {
    // Try to get current user from auth
    let currentUser = await getCurrentUserFromRequest(request);
    
    // If auth fails, try to get user email from query params as fallback
    if (!currentUser) {
      const { searchParams } = new URL(request.url);
      const userEmail = searchParams.get('email');
      
      if (userEmail) {
        console.log('🔄 Auth failed, trying fallback with email:', userEmail);
        // Create a minimal user object for the dashboard
        currentUser = {
          email: userEmail,
          $id: 'fallback',
          name: userEmail.split('@')[0],
          prefs: {}
        } as any;
      } else {
        console.log('🚫 No authenticated user found and no email fallback in dashboard stats API');
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
      }
    }

    console.log('✅ Authenticated user for dashboard:', currentUser!.email);

    // Get user profile from database
    let userData;
    try {
      console.log('🔍 Looking up user in database:', currentUser!.email);
      const userResult = await adminDatabases.listDocuments(
        DATABASE_ID,
        COLLECTIONS.USERS,
        [Query.equal('email', currentUser!.email)]
      );
      
      userData = userResult.documents[0];
      console.log('📊 User lookup result:', userData ? 'Found' : 'Not found');
    } catch (userError) {
      console.error('❌ Error fetching user from database:', userError);
      // Return default dashboard data if user lookup fails
      return NextResponse.json({
        user: {
          username: currentUser!.name || 'User',
          email: currentUser!.email,
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
      console.log('⚠️ User not found in database, returning default data');
      // Return default dashboard data if user not found
      return NextResponse.json({
        user: {
          username: currentUser.username || 'User',
          email: currentUser.email,
          role: currentUser.role || 'viewer',
          department: currentUser.department || 'ems'
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