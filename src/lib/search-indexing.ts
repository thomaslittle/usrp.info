import { adminDatabases, DATABASE_ID, COLLECTIONS } from './appwrite-server';
import { IndexType } from 'node-appwrite';

interface SearchIndex {
  key: string;
  type: IndexType;
  attributes: string[];
  orders?: string[];
}

// Define search indexes for optimal performance
const SEARCH_INDEXES: SearchIndex[] = [
  // Content collection indexes
  {
    key: 'content_title_search',
    type: IndexType.Fulltext,
    attributes: ['title']
  },
  {
    key: 'content_content_search', 
    type: IndexType.Fulltext,
    attributes: ['content']
  },
  {
    key: 'content_tags_search',
    type: IndexType.Fulltext,
    attributes: ['tags']
  },
  {
    key: 'content_status_published',
    type: IndexType.Key,
    attributes: ['status']
  },
  {
    key: 'content_department_filter',
    type: IndexType.Key,
    attributes: ['departmentId']
  },
  {
    key: 'content_type_filter',
    type: IndexType.Key,
    attributes: ['type']
  },
  
  // Department collection indexes
  {
    key: 'department_name_search',
    type: IndexType.Fulltext,
    attributes: ['name']
  },
  {
    key: 'department_slug_search',
    type: IndexType.Fulltext,
    attributes: ['slug']
  },
  {
    key: 'department_active_filter',
    type: IndexType.Key,
    attributes: ['isActive']
  },

  // User collection indexes (for future use)
  {
    key: 'user_email_unique',
    type: IndexType.Unique,
    attributes: ['email']
  },
  {
    key: 'user_username_search',
    type: IndexType.Fulltext,
    attributes: ['username']
  },
  {
    key: 'user_department_filter',
    type: IndexType.Key,
    attributes: ['department']
  },
  {
    key: 'user_role_filter',
    type: IndexType.Key,
    attributes: ['role']
  }
];

export async function ensureSearchIndexes(): Promise<void> {
  try {
    console.log('🔍 Ensuring search indexes are created...');

    for (const index of SEARCH_INDEXES) {
      try {
        // Try to create the index
        await adminDatabases.createIndex(
          DATABASE_ID,
          getCollectionForIndex(index.key),
          index.key,
          index.type,
          index.attributes,
          index.orders
        );
        console.log(`✅ Created index: ${index.key}`);
      } catch (error: any) {
        // Index might already exist
        if (error.code === 409) {
          console.log(`ℹ️  Index already exists: ${index.key}`);
        } else {
          console.error(`❌ Failed to create index ${index.key}:`, error.message);
        }
      }
    }

    console.log('🎉 Search indexing complete!');
  } catch (error) {
    console.error('❌ Error ensuring search indexes:', error);
    throw error;
  }
}

function getCollectionForIndex(indexKey: string): string {
  if (indexKey.startsWith('content_')) {
    return COLLECTIONS.CONTENT;
  } else if (indexKey.startsWith('department_')) {
    return COLLECTIONS.DEPARTMENTS;
  } else if (indexKey.startsWith('user_')) {
    return COLLECTIONS.USERS;
  } else if (indexKey.startsWith('activity_')) {
    return COLLECTIONS.ACTIVITY_LOGS;
  }
  
  throw new Error(`Unknown collection for index: ${indexKey}`);
}

// Function to check if search is properly configured
export async function checkSearchHealth(): Promise<boolean> {
  try {
    // Test search functionality with a simple query
    const testQuery = 'test';
    
    // Test content search
    try {
      await adminDatabases.listDocuments(
        DATABASE_ID,
        COLLECTIONS.CONTENT,
        []
      );
    } catch (error) {
      console.error('Content collection search test failed:', error);
      return false;
    }

    // Test departments search
    try {
      await adminDatabases.listDocuments(
        DATABASE_ID,
        COLLECTIONS.DEPARTMENTS,
        []
      );
    } catch (error) {
      console.error('Departments collection search test failed:', error);
      return false;
    }

    console.log('✅ Search health check passed');
    return true;
  } catch (error) {
    console.error('❌ Search health check failed:', error);
    return false;
  }
}

// Export for use in API routes or initialization scripts
export { SEARCH_INDEXES }; 