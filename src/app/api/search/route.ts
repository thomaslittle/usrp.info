import { NextRequest, NextResponse } from 'next/server';
import { Query } from 'node-appwrite';
import { adminDatabases, DATABASE_ID, COLLECTIONS } from '@/lib/appwrite-server';

interface SearchResult {
  id: string;
  type: 'content' | 'user';
  title: string;
  subtitle?: string;
  description?: string;
  url: string;
  department?: string;
  contentType?: string;
  status?: string;
  tags?: string[];
  rank?: string;
  callsign?: string;
  activity?: string;
}

export async function GET(request: NextRequest) {
  try {
    // Bypass authentication for testing
    const currentUser = {
      $id: 'test-user',
      email: 'tomlit@gmail.com',
      name: 'Tom Lit',
      labels: [],
      prefs: {}
    };

    const searchParams = request.nextUrl.searchParams;
    const query = searchParams.get('q');

    if (!query || query.trim().length < 2) {
      return NextResponse.json({ 
        success: false, 
        error: 'Query must be at least 2 characters long' 
      }, { status: 400 });
    }

    const searchTerm = query.trim();
    const results: SearchResult[] = [];

    // Search content
    try {
      const contentQueries = [
        Query.limit(20)
      ];

      // Check for department-specific searches
      const lowerSearchTerm = searchTerm.toLowerCase();
      if (['ems', 'police', 'fire', 'doj', 'government'].includes(lowerSearchTerm)) {
        // Search by department
        contentQueries.push(
          Query.and([
            Query.equal('departmentId', lowerSearchTerm),
            Query.equal('status', 'published')
          ])
        );
      } else if (['sop', 'guide', 'announcement', 'resource', 'training', 'policy'].includes(lowerSearchTerm)) {
        // Search by content type
        contentQueries.push(
          Query.and([
            Query.equal('type', lowerSearchTerm),
            Query.equal('status', 'published')
          ])
        );
      } else {
        // Regular text search
        contentQueries.push(
          Query.and([
            Query.or([
              Query.search('title', searchTerm),
              Query.contains('tags', searchTerm)
            ]),
            Query.equal('status', 'published')
          ])
        );
      }

      const contentResults = await adminDatabases.listDocuments(
        DATABASE_ID,
        COLLECTIONS.CONTENT,
        contentQueries
      );

      for (const doc of contentResults.documents) {
        // Generate description from content if available
        let description = '';
        if (doc.content) {
          try {
            const contentObj = typeof doc.content === 'string' ? JSON.parse(doc.content) : doc.content;
            if (contentObj.blocks && Array.isArray(contentObj.blocks)) {
              const textBlocks = contentObj.blocks.filter((block: any) => 
                block.type === 'paragraph' && block.data?.text
              );
              if (textBlocks.length > 0) {
                description = textBlocks[0].data.text.replace(/<[^>]*>/g, '').substring(0, 100) + '...';
              }
            }
          } catch (e) {
            // Fallback to raw content
            description = typeof doc.content === 'string' 
              ? doc.content.substring(0, 100) + '...'
              : '';
          }
        }

        results.push({
          id: doc.$id,
          type: 'content',
          title: doc.title,
          description,
          url: `/ems/${doc.type}/${doc.slug}`,
          department: doc.departmentId,
          contentType: doc.type,
          status: doc.status,
          tags: doc.tags || []
        });
      }
    } catch (error) {
      console.error('Content search error:', error);
    }

    // Search users
    try {
      // Build user search queries
      const userQueries = [
        Query.limit(15)
      ];

      // Check for special searches first
      const lowerSearchTerm = searchTerm.toLowerCase();
      
      if (lowerSearchTerm.includes('fto')) {
        // Search for FTO users
        userQueries.push(Query.equal('isFTO', true));
      } else if (lowerSearchTerm.includes('solo') || lowerSearchTerm.includes('cleared')) {
        // Search for solo cleared users
        userQueries.push(Query.equal('isSoloCleared', true));
      } else if (['active', 'moderate', 'inactive'].some(status => lowerSearchTerm.includes(status))) {
        // Search by activity status
        const activityStatus = ['Active', 'Moderate', 'Inactive'].find(status => 
          lowerSearchTerm.includes(status.toLowerCase())
        );
        if (activityStatus) {
          userQueries.push(Query.equal('activity', activityStatus));
        }
      } else if (['full-time', 'part-time', 'on-call'].some(status => lowerSearchTerm.includes(status.replace('-', '')))) {
        // Search by employment status
        const employmentStatus = ['Full-Time', 'Part-Time', 'On-Call'].find(status => 
          lowerSearchTerm.includes(status.toLowerCase().replace('-', ''))
        );
        if (employmentStatus) {
          userQueries.push(Query.equal('status', employmentStatus));
        }
      } else {
        // Regular text search across multiple fields
        userQueries.push(
          Query.or([
            Query.search('username', searchTerm),
            Query.search('gameCharacterName', searchTerm),
            Query.search('callsign', searchTerm),
            Query.search('jobTitle', searchTerm),
            Query.search('assignment', searchTerm),
            Query.search('department', searchTerm)
          ])
        );
      }

      const userResults = await adminDatabases.listDocuments(
        DATABASE_ID,
        COLLECTIONS.USERS,
        userQueries
      );

      for (const user of userResults.documents) {
        let subtitle = '';
        if (user.jobTitle) {
          subtitle = user.jobTitle;
        } else if (user.role) {
          subtitle = user.role.charAt(0).toUpperCase() + user.role.slice(1);
        }

        if (user.callsign) {
          subtitle += ` • ${user.callsign}`;
        }

        // Add special badges for search context
        let specialBadges = [];
        if (lowerSearchTerm.includes('fto') && user.isFTO) {
          specialBadges.push('FTO');
        }
        if ((lowerSearchTerm.includes('solo') || lowerSearchTerm.includes('cleared')) && user.isSoloCleared) {
          specialBadges.push('Solo Cleared');
        }
        if (specialBadges.length > 0) {
          subtitle += ` • ${specialBadges.join(' • ')}`;
        }

        results.push({
          id: user.$id,
          type: 'user',
          title: user.gameCharacterName || user.username,
          subtitle,
          description: user.department ? `${user.department.toUpperCase()} Department` : undefined,
          url: `/dashboard/profile?user=${user.$id}`,
          department: user.department,
          rank: user.jobTitle,
          callsign: user.callsign,
          activity: user.activity
        });
      }
    } catch (error) {
      console.error('User search error:', error);
    }

    // Sort results by relevance (exact matches first, then partial matches)
    results.sort((a, b) => {
      const aExact = a.title.toLowerCase().includes(searchTerm.toLowerCase()) ? 1 : 0;
      const bExact = b.title.toLowerCase().includes(searchTerm.toLowerCase()) ? 1 : 0;
      
      if (aExact !== bExact) {
        return bExact - aExact;
      }
      
      // Secondary sort by type (content first, then users)
      if (a.type !== b.type) {
        return a.type === 'content' ? -1 : 1;
      }
      
      return a.title.localeCompare(b.title);
    });

    return NextResponse.json({
      success: true,
      results: results.slice(0, 25), // Limit total results
      total: results.length
    });

  } catch (error) {
    console.error('Search API error:', error);
    return NextResponse.json({
      success: false,
      error: 'Internal server error'
    }, { status: 500 });
  }
} 