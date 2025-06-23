import { NextResponse } from 'next/server';
import { ensureSearchIndexes, checkSearchHealth } from '@/lib/search-indexing';

export async function POST() {
  try {
    console.log('🚀 Starting search setup...');
    
    // Ensure all search indexes are created
    await ensureSearchIndexes();
    
    // Verify search health
    const isHealthy = await checkSearchHealth();
    
    if (!isHealthy) {
      return NextResponse.json({
        success: false,
        error: 'Search health check failed after setup'
      }, { status: 500 });
    }

    return NextResponse.json({
      success: true,
      message: 'Search indexes have been set up successfully',
      timestamp: new Date().toISOString()
    });

  } catch (error: unknown) {
    console.error('❌ Error setting up search:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: error instanceof Error ? error.message : 'Failed to setup search indexes' 
      },
      { status: 500 }
    );
  }
}

export async function GET() {
  try {
    // Check search health
    const isHealthy = await checkSearchHealth();
    
    return NextResponse.json({
      success: true,
      healthy: isHealthy,
      message: isHealthy ? 'Search is working properly' : 'Search has issues',
      timestamp: new Date().toISOString()
    });

  } catch (error: unknown) {
    console.error('❌ Error checking search health:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: error instanceof Error ? error.message : 'Failed to check search health' 
      },
      { status: 500 }
    );
  }
} 