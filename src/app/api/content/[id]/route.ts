import { NextRequest, NextResponse } from 'next/server';
// Database operations handled by service layer
import { contentService, userService, notificationService } from '@/lib/database';
import { getCurrentUserFromRequest } from '@/lib/auth';

export async function GET(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id: contentId } = await params;
        const content = await contentService.getById(contentId);

        if (!content) {
            return NextResponse.json({ error: 'Content not found' }, { status: 404 });
        }

        return NextResponse.json({ content });
    } catch (error) {
        console.error('Error fetching content:', error);
        return NextResponse.json({ error: 'Failed to fetch content' }, { status: 500 });
    }
}

export async function PUT(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const user = await getCurrentUserFromRequest(request);
        if (!user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const currentUser = await userService.getByEmail(user.email);
        if (!currentUser) {
            return NextResponse.json({ error: 'User not found' }, { status: 404 });
        }

        const { id: contentId } = await params;
        const updateData = await request.json();
        const { changesSummary, ...contentUpdates } = updateData;
        
        // Ensure content is a string before saving
        if (contentUpdates.content && typeof contentUpdates.content === 'object') {
            contentUpdates.content = JSON.stringify(contentUpdates.content);
        }
        
        const updatedContent = await contentService.update(
            contentId, 
            contentUpdates, 
            currentUser.$id,
            changesSummary
        );

        // Create notification for department users
        if (updatedContent) {
            await notificationService.createContentNotification(
                contentId,
                updatedContent.title,
                currentUser.username || currentUser.email,
                updatedContent.departmentId,
                'content_updated',
                `/ems/${updatedContent.type}/${updatedContent.slug}`
            );
        }

        return NextResponse.json({ success: true, content: updatedContent });
    } catch (error) {
        console.error('Error updating content:', error);
        return NextResponse.json({ error: 'Failed to update content' }, { status: 500 });
    }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: contentId } = await params;

    if (!contentId) {
      return NextResponse.json(
        { error: 'Content ID is required' },
        { status: 400 }
      );
    }

    await contentService.delete(contentId);

    return NextResponse.json({ 
      success: true,
      message: 'Content deleted successfully' 
    });
  } catch (error) {
    console.error('Error deleting content:', error);
    return NextResponse.json(
      { error: 'Failed to delete content' },
      { status: 500 }
    );
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await getCurrentUserFromRequest(request);
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const currentUser = await userService.getByEmail(user.email);
    if (!currentUser) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    const { id: contentId } = await params;
    const body = await request.json();

    if (!contentId) {
      return NextResponse.json(
        { error: 'Content ID is required' },
        { status: 400 }
      );
    }

    // Handle status updates
    if (body.status) {
      if (body.status === 'published') {
        await contentService.publish(contentId);
      } else {
        await contentService.update(contentId, { status: body.status }, currentUser.$id, `Status changed to ${body.status}`);
      }
    } else {
      const { changesSummary, ...updateData } = body;
      // Ensure content is a string before saving
      if (updateData.content && typeof updateData.content === 'object') {
        updateData.content = JSON.stringify(updateData.content);
      }
      // Handle other updates
      await contentService.update(contentId, updateData, currentUser.$id, changesSummary);
    }

    return NextResponse.json({ 
      success: true,
      message: 'Content updated successfully' 
    });
  } catch (error) {
    console.error('Error updating content:', error);
    return NextResponse.json(
      { error: 'Failed to update content' },
      { status: 500 }
    );
  }
} 