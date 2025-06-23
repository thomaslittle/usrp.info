import { NextRequest, NextResponse } from 'next/server';
import { adminDatabases, DATABASE_ID, COLLECTIONS } from '@/lib/appwrite-server';
import { Query } from 'appwrite';

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

interface ContentDocument {
  $id: string;
  title: string;
  content?: string;
  type: string;
  slug: string;
  departmentId: string;
  status: string;
  tags?: string[];
}

interface UserDocument {
  $id: string;
  username: string;
  gameCharacterName?: string;
  callsign?: string;
  jobTitle?: string;
  assignment?: string;
  department?: string;
  role?: string;
  isFTO?: boolean;
  isSoloCleared?: boolean;
  activity?: string;
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const query = searchParams.get('q');

    if (!query || query.trim().length === 0) {
      return NextResponse.json({
        success: false,
        error: 'Search query is required'
      }, { status: 400 });
    }

    const searchTerm = query.trim();
    const results: SearchResult[] = [];

    // Search content
    try {
      const allContentDocuments: ContentDocument[] = [];
      const foundDocumentIds = new Set<string>();

      const runContentQuery = async (queries: string[]) => {
        try {
          const response = await adminDatabases.listDocuments(
            DATABASE_ID,
            COLLECTIONS.CONTENT,
            [
              ...queries,
              Query.equal('status', 'published'),
              Query.limit(20)
            ]
          );
          for (const doc of response.documents) {
            const contentDoc = doc as unknown as ContentDocument;
            if (!foundDocumentIds.has(contentDoc.$id)) {
              foundDocumentIds.add(contentDoc.$id);
              allContentDocuments.push(contentDoc);
            }
          }
        } catch (queryError) {
          console.error('Content query error:', queryError);
        }
      };

      // Perform separate searches for title, tags, and type, as Appwrite does not support multiple 'search' queries in one call.
      await runContentQuery([Query.search('title', searchTerm)]);
      await runContentQuery([Query.contains('tags', searchTerm)]);
      await runContentQuery([Query.equal('type', searchTerm)]);

      for (const doc of allContentDocuments) {
        // Generate description from content if available
        let description = '';
        if (doc.content) {
          try {
            const contentObj = typeof doc.content === 'string' ? JSON.parse(doc.content) : doc.content;
            if (contentObj.blocks && Array.isArray(contentObj.blocks)) {
              const textBlocks = contentObj.blocks.filter((block: unknown) => {
                const typedBlock = block as { type?: string; data?: { text?: string } };
                return typedBlock.type === 'paragraph' && typedBlock.data?.text;
              });
              if (textBlocks.length > 0) {
                const firstBlock = textBlocks[0] as { data: { text: string } };
                description = firstBlock.data.text.replace(/<[^>]*>/g, '').substring(0, 100) + '...';
              }
            }
          } catch {
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

      for (const userDoc of userResults.documents) {
        const user = userDoc as unknown as UserDocument;
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
        const specialBadges = [];
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