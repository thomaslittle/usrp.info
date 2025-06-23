import { NextRequest, NextResponse } from 'next/server';
import { departmentService } from '@/lib/database';
import { adminDatabases, DATABASE_ID, COLLECTIONS } from '@/lib/appwrite-server';

export async function GET() {
  try {
    const departments = await departmentService.list();

    return NextResponse.json({ 
      departments 
    });
  } catch (error) {
    console.error('Error getting departments:', error);
    return NextResponse.json(
      { error: 'Failed to get departments' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { name, slug, color, logo } = body;

    if (!name || !slug) {
      return NextResponse.json(
        { success: false, error: 'Name and slug are required' },
        { status: 400 }
      );
    }

    const department = await adminDatabases.createDocument(
      DATABASE_ID,
      COLLECTIONS.DEPARTMENTS,
      'unique()',
      {
        departmentId: `dept_${slug}`,
        name,
        slug,
        color: color || '#753ace',
        logo: logo || '',
        isActive: true
      }
    );

    return NextResponse.json({
      success: true,
      department
    });
  } catch (error: unknown) {
    console.error('Error creating department:', error);
    return NextResponse.json(
      { success: false, error: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
} 