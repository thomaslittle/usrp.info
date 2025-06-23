import { NextResponse } from 'next/server';
import { adminDatabases, DATABASE_ID, COLLECTIONS } from '@/lib/appwrite-server';
import { Query } from 'node-appwrite';

export async function GET() {
  try {
    console.log('Debug: Checking all content documents...');
    
    // Get all content documents without any filters
    const allContent = await adminDatabases.listDocuments(
      DATABASE_ID,
      COLLECTIONS.CONTENT,
      [Query.limit(100)]
    );
    
    console.log(`Found ${allContent.documents.length} total content documents`);
    
    const contentSummary = allContent.documents.map(doc => ({
      id: doc.$id,
      title: doc.title,
      type: doc.type,
      status: doc.status,
      departmentId: doc.departmentId,
      slug: doc.slug,
      tags: doc.tags,
      createdAt: doc.$createdAt
    }));
    
    // Also check if departments exist
    const departments = await adminDatabases.listDocuments(
      DATABASE_ID,
      COLLECTIONS.DEPARTMENTS,
      [Query.limit(10)]
    );
    
    console.log(`Found ${departments.documents.length} departments`);
    
    return NextResponse.json({
      success: true,
      contentCount: allContent.documents.length,
      content: contentSummary,
      departmentCount: departments.documents.length,
      departments: departments.documents.map(d => ({
        id: d.$id,
        name: d.name,
        slug: d.slug
      }))
    });
    
  } catch (error: unknown) {
    console.error('Debug content error:', error);
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
} 