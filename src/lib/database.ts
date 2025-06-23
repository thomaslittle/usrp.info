import { Query, ID } from 'appwrite';
import { adminDatabases, DATABASE_ID, COLLECTIONS } from './appwrite-server';
import { databases } from './appwrite';
import type { User, Department, Content, ActivityLog, DepartmentType, ContentType, ContentStatus, ContentVersion, VersionDiff, VersionComparison, Notification } from '@/types';

// User operations
export const userService = {
  async create(userData: Omit<User, '$id' | '$createdAt' | '$updatedAt'>) {
    return await adminDatabases.createDocument(
      DATABASE_ID,
      COLLECTIONS.USERS,
      ID.unique(),
      {
        ...userData,
        createdAt: new Date().toISOString(),
      }
    );
  },

  async getById(userId: string) {
    try {
      return await adminDatabases.getDocument(DATABASE_ID, COLLECTIONS.USERS, userId);
    } catch (error) {
      console.error('Error getting user:', error);
      return null;
    }
  },

  async getByEmail(email: string) {
    try {
      const result = await adminDatabases.listDocuments(
        DATABASE_ID,
        COLLECTIONS.USERS,
        [Query.equal('email', email)]
      );
      return result.documents[0] || null;
    } catch (error) {
      console.error('Error getting user by email:', error);
      return null;
    }
  },

  async getByDepartment(department: DepartmentType) {
    try {
      const result = await adminDatabases.listDocuments(
        DATABASE_ID,
        COLLECTIONS.USERS,
        [Query.equal('department', department)]
      );
      return result.documents;
    } catch (error) {
      console.error('Error getting users by department:', error);
      return [];
    }
  },

  async update(userId: string, updates: Partial<User>) {
    return await adminDatabases.updateDocument(DATABASE_ID, COLLECTIONS.USERS, userId, updates);
  },

  async delete(userId: string) {
    return await adminDatabases.deleteDocument(DATABASE_ID, COLLECTIONS.USERS, userId);
  },

  async list(queries: string[] = []) {
    try {
      const result = await adminDatabases.listDocuments(
        DATABASE_ID,
        COLLECTIONS.USERS,
        queries
      );
      return result.documents;
    } catch (error) {
      console.error('Error listing users:', error);
      return [];
    }
  }
};

// Department operations
export const departmentService = {
  async create(departmentData: Omit<Department, '$id' | '$createdAt' | '$updatedAt'>) {
    return await adminDatabases.createDocument(
      DATABASE_ID,
      COLLECTIONS.DEPARTMENTS,
      ID.unique(),
      {
        ...departmentData,
        createdAt: new Date().toISOString(),
      }
    );
  },

  async getBySlug(slug: string) {
    try {
      const result = await adminDatabases.listDocuments(
        DATABASE_ID,
        COLLECTIONS.DEPARTMENTS,
        [Query.equal('slug', slug)]
      );
      return result.documents[0] || null;
    } catch (error) {
      console.error('Error getting department by slug:', error);
      return null;
    }
  },

  async getActive() {
    try {
      const result = await adminDatabases.listDocuments(
        DATABASE_ID,
        COLLECTIONS.DEPARTMENTS,
        [Query.equal('isActive', true)]
      );
      return result.documents;
    } catch (error) {
      console.error('Error getting active departments:', error);
      return [];
    }
  },

  async list() {
    try {
      const result = await adminDatabases.listDocuments(DATABASE_ID, COLLECTIONS.DEPARTMENTS);
      return result.documents;
    } catch (error) {
      console.error('Error listing departments:', error);
      return [];
    }
  },

  async update(departmentId: string, updates: Partial<Department>) {
    return await adminDatabases.updateDocument(DATABASE_ID, COLLECTIONS.DEPARTMENTS, departmentId, updates);
  }
};

// Content operations
export const contentService = {
  async create(contentData: Omit<Content, '$id' | '$createdAt' | '$updatedAt'>, authorId?: string) {
    const now = new Date().toISOString();
    const content = await adminDatabases.createDocument(
      DATABASE_ID,
      COLLECTIONS.CONTENT,
      ID.unique(),
      {
        ...contentData,
        createdAt: now,
        updatedAt: now,
        version: 1,
      }
    );

    // Create initial version
    await versionService.createVersion(content.$id, {
      title: contentData.title,
      slug: contentData.slug,
      content: contentData.content,
      type: contentData.type,
      status: contentData.status,
      tags: contentData.tags || [],
      authorId: authorId || contentData.authorId || 'system',
      version: 1,
      isCurrentVersion: true,
      changesSummary: 'Initial version',
      publishedAt: contentData.status === 'published' ? now : undefined,
      createdAt: now,
    });

    return content;
  },

  async getById(contentId: string) {
    try {
      return await adminDatabases.getDocument(DATABASE_ID, COLLECTIONS.CONTENT, contentId);
    } catch (error) {
      console.error('Error getting content:', error);
      return null;
    }
  },

  async getBySlug(departmentId: string, slug: string) {
    try {
      const result = await adminDatabases.listDocuments(
        DATABASE_ID,
        COLLECTIONS.CONTENT,
        [
          Query.equal('departmentId', departmentId),
          Query.equal('slug', slug),
        ]
      );
      return result.documents[0] || null;
    } catch (error) {
      console.error('Error getting content by slug:', error);
      return null;
    }
  },

  async getByDepartment(departmentId: string, status?: ContentStatus) {
    try {
      const queries = [
        Query.equal('departmentId', departmentId),
        Query.orderDesc('updatedAt')
      ];
      
      // Only filter by status if specified
      if (status) {
        queries.push(Query.equal('status', status));
      }
      
      const result = await adminDatabases.listDocuments(
        DATABASE_ID,
        COLLECTIONS.CONTENT,
        queries
      );
      return result.documents;
    } catch (error) {
      console.error('Error getting content by department:', error);
      return [];
    }
  },

  async getByType(departmentId: string, type: ContentType, status: ContentStatus = 'published') {
    try {
      const result = await adminDatabases.listDocuments(
        DATABASE_ID,
        COLLECTIONS.CONTENT,
        [
          Query.equal('departmentId', departmentId),
          Query.equal('type', type),
          Query.equal('status', status),
          Query.orderDesc('updatedAt')
        ]
      );
      return result.documents;
    } catch (error) {
      console.error('Error getting content by type:', error);
      return [];
    }
  },

  async update(contentId: string, updates: Partial<Content>, authorId: string, changesSummary?: string) {
    const currentContent = await this.getById(contentId);
    if (!currentContent) {
      throw new Error('Content not found');
    }

    const newVersion = (currentContent.version || 1) + 1;
    const now = new Date().toISOString();

    const updateData = {
      ...updates,
      updatedAt: now,
      version: newVersion,
    };

    // Final check to ensure content is a string before updating
    if (updateData.content && typeof updateData.content === 'object') {
      updateData.content = JSON.stringify(updateData.content);
    }

    // Update main content document
    const updatedContent = await adminDatabases.updateDocument(DATABASE_ID, COLLECTIONS.CONTENT, contentId, updateData);

    // Create new version
    await versionService.createVersion(contentId, {
      title: updates.title || currentContent.title,
      slug: updates.slug || currentContent.slug,
      content: updates.content || currentContent.content,
      type: updates.type || currentContent.type,
      status: updates.status || currentContent.status,
      tags: updates.tags || currentContent.tags,
      authorId,
      version: newVersion,
      isCurrentVersion: true,
      changesSummary,
      publishedAt: updates.status === 'published' ? now : updates.publishedAt,
      createdAt: now,
    });

    // Mark previous version as not current
    await versionService.markPreviousVersionsAsNotCurrent(contentId, newVersion);

    // Log the version creation
    await logActivity(
      authorId,
      'version_created',
      'content',
      `Created version ${newVersion} of "${currentContent.title}"`,
      contentId,
      undefined,
      undefined,
      {
        versionNumber: newVersion,
        previousVersion: currentContent.version,
        changesSummary,
      }
    );

    return updatedContent;
  },

  async publish(contentId: string) {
    return await this.update(contentId, {
      status: 'published',
      publishedAt: new Date().toISOString(),
    }, 'system', 'Published content');
  },

  async unpublish(contentId: string) {
    return await this.update(contentId, {
      status: 'draft',
      publishedAt: undefined,
    }, 'system', 'Unpublished content');
  },

  async delete(contentId: string) {
    // Delete all versions first
    await versionService.deleteAllVersions(contentId);
    return await adminDatabases.deleteDocument(DATABASE_ID, COLLECTIONS.CONTENT, contentId);
  },

  async search(departmentId: string, searchTerm: string, status: ContentStatus = 'published') {
    try {
      const result = await adminDatabases.listDocuments(
        DATABASE_ID,
        COLLECTIONS.CONTENT,
        [
          Query.equal('departmentId', departmentId),
          Query.equal('status', status),
          Query.search('title', searchTerm),
        ]
      );
      return result.documents;
    } catch (error) {
      console.error('Error searching content:', error);
      return [];
    }
  },

  async getAll(status?: ContentStatus) {
    try {
      const queries = [Query.orderDesc('updatedAt')];
      
      // Only filter by status if specified
      if (status) {
        queries.push(Query.equal('status', status));
      }
      
      const result = await adminDatabases.listDocuments(
        DATABASE_ID,
        COLLECTIONS.CONTENT,
        queries
      );
      return result.documents;
    } catch (error) {
      console.error('Error getting all content:', error);
      return [];
    }
  }
};

// Version management operations
export const versionService = {
  async createVersion(contentId: string, versionData: Omit<ContentVersion, '$id' | 'versionId' | 'contentId' | '$createdAt' | '$updatedAt'>) {
    return await adminDatabases.createDocument(
      DATABASE_ID,
      COLLECTIONS.CONTENT_VERSIONS,
      ID.unique(),
      {
        versionId: ID.unique(),
        contentId,
        ...versionData,
      }
    );
  },

  async getVersionsByContentId(contentId: string) {
    try {
      const result = await adminDatabases.listDocuments(
        DATABASE_ID,
        COLLECTIONS.CONTENT_VERSIONS,
        [
          Query.equal('contentId', contentId),
          Query.orderDesc('version')
        ]
      );
      return result.documents;
    } catch (error) {
      console.error('Error getting versions:', error);
      return [];
    }
  },

  async getVersionByNumber(contentId: string, versionNumber: number) {
    try {
      const result = await adminDatabases.listDocuments(
        DATABASE_ID,
        COLLECTIONS.CONTENT_VERSIONS,
        [
          Query.equal('contentId', contentId),
          Query.equal('version', versionNumber)
        ]
      );
      return result.documents[0] || null;
    } catch (error) {
      console.error('Error getting version by number:', error);
      return null;
    }
  },

  async getCurrentVersion(contentId: string) {
    try {
      const result = await adminDatabases.listDocuments(
        DATABASE_ID,
        COLLECTIONS.CONTENT_VERSIONS,
        [
          Query.equal('contentId', contentId),
          Query.equal('isCurrentVersion', true)
        ]
      );
      return result.documents[0] || null;
    } catch (error) {
      console.error('Error getting current version:', error);
      return null;
    }
  },

  async markPreviousVersionsAsNotCurrent(contentId: string, currentVersionNumber: number) {
    try {
      const versions = await this.getVersionsByContentId(contentId);
      for (const version of versions) {
        if (version.version !== currentVersionNumber && version.isCurrentVersion) {
          await adminDatabases.updateDocument(
            DATABASE_ID,
            COLLECTIONS.CONTENT_VERSIONS,
            version.$id,
            { isCurrentVersion: false }
          );
        }
      }
    } catch (error) {
      console.error('Error marking previous versions as not current:', error);
    }
  },

  async restoreVersion(contentId: string, versionNumber: number, authorId: string) {
    const versionToRestore = await this.getVersionByNumber(contentId, versionNumber);
    if (!versionToRestore) {
      throw new Error('Version not found');
    }

    const currentContent = await contentService.getById(contentId);
    if (!currentContent) {
      throw new Error('Content not found');
    }

    // Create a new version with restored content
    const newVersionNumber = currentContent.version + 1;
    const now = new Date().toISOString();

    // Update main content document
    const updatedContent = await adminDatabases.updateDocument(
      DATABASE_ID,
      COLLECTIONS.CONTENT,
      contentId,
      {
        title: versionToRestore.title,
        slug: versionToRestore.slug,
        content: versionToRestore.content,
        type: versionToRestore.type,
        status: versionToRestore.status,
        tags: versionToRestore.tags,
        version: newVersionNumber,
        updatedAt: now,
        publishedAt: versionToRestore.publishedAt,
      }
    );

    // Create new version entry
    await this.createVersion(contentId, {
      title: versionToRestore.title,
      slug: versionToRestore.slug,
      content: versionToRestore.content,
      type: versionToRestore.type,
      status: versionToRestore.status,
      tags: versionToRestore.tags,
      authorId,
      version: newVersionNumber,
      isCurrentVersion: true,
      changesSummary: `Restored from version ${versionNumber}`,
      publishedAt: versionToRestore.publishedAt,
      createdAt: now,
    });

    // Mark previous version as not current
    await this.markPreviousVersionsAsNotCurrent(contentId, newVersionNumber);

    // Log the version restoration
    await logActivity(
      authorId,
      'version_restored',
      'content',
      `Restored content to version ${versionNumber}`,
      contentId,
      undefined,
      undefined,
      {
        versionNumber: newVersionNumber,
        previousVersion: versionNumber,
        changesSummary: `Restored from version ${versionNumber}`,
      }
    );

    return updatedContent;
  },

  async compareVersions(contentId: string, fromVersion: number, toVersion: number): Promise<VersionComparison> {
    const fromVersionData = await this.getVersionByNumber(contentId, fromVersion);
    const toVersionData = await this.getVersionByNumber(contentId, toVersion);

    if (!fromVersionData || !toVersionData) {
      throw new Error('One or both versions not found');
    }

    const diffs: VersionDiff[] = [];
    const fieldsToCompare = ['title', 'slug', 'content', 'type', 'status', 'tags'];

    for (const field of fieldsToCompare) {
      const oldValue = (fromVersionData as any)[field];
      const newValue = (toVersionData as any)[field];

      if (JSON.stringify(oldValue) !== JSON.stringify(newValue)) {
        let changeType: 'added' | 'removed' | 'modified' = 'modified';
        
        if (oldValue === null || oldValue === undefined) {
          changeType = 'added';
        } else if (newValue === null || newValue === undefined) {
          changeType = 'removed';
        }

        diffs.push({
          field,
          oldValue,
          newValue,
          changeType,
        });
      }
    }

    return {
      fromVersion,
      toVersion,
      fromVersionData: fromVersionData as unknown as ContentVersion,
      toVersionData: toVersionData as unknown as ContentVersion,
      diffs,
      totalChanges: diffs.length,
    };
  },

  async deleteAllVersions(contentId: string) {
    try {
      const versions = await this.getVersionsByContentId(contentId);
      for (const version of versions) {
        await adminDatabases.deleteDocument(DATABASE_ID, COLLECTIONS.CONTENT_VERSIONS, version.$id);
      }
    } catch (error) {
      console.error('Error deleting all versions:', error);
    }
  },

  async getVersionStats(contentId: string) {
    const versions = await this.getVersionsByContentId(contentId);
    const authors = new Set(versions.map(v => v.authorId));
    
    return {
      totalVersions: versions.length,
      uniqueAuthors: authors.size,
      firstVersion: versions.length > 0 ? versions[versions.length - 1] : null,
      latestVersion: versions.length > 0 ? versions[0] : null,
      publishedVersions: versions.filter(v => v.status === 'published').length,
    };
  }
};

// Activity log operations
export const activityLogService = {
  async create(logData: Omit<ActivityLog, '$id' | '$createdAt' | '$updatedAt'>) {
    return await adminDatabases.createDocument(
      DATABASE_ID,
      COLLECTIONS.ACTIVITY_LOGS,
      ID.unique(),
      {
        ...logData,
        timestamp: new Date().toISOString(),
      }
    );
  },

  async getByUser(userId: string, limit: number = 50) {
    try {
      const result = await adminDatabases.listDocuments(
        DATABASE_ID,
        COLLECTIONS.ACTIVITY_LOGS,
        [
          Query.equal('userId', userId),
          Query.orderDesc('timestamp'),
          Query.limit(limit)
        ]
      );
      return result.documents;
    } catch (error) {
      console.error('Error getting user activity logs:', error);
      return [];
    }
  },

  async getByResource(resourceType: string, resourceId: string) {
    try {
      const result = await adminDatabases.listDocuments(
        DATABASE_ID,
        COLLECTIONS.ACTIVITY_LOGS,
        [
          Query.equal('resourceType', resourceType),
          Query.equal('resourceId', resourceId),
          Query.orderDesc('timestamp')
        ]
      );
      return result.documents;
    } catch (error) {
      console.error('Error getting resource activity logs:', error);
      return [];
    }
  },

  async getRecent(limit: number = 100) {
    try {
      const result = await adminDatabases.listDocuments(
        DATABASE_ID,
        COLLECTIONS.ACTIVITY_LOGS,
        [
          Query.orderDesc('timestamp'),
          Query.limit(limit)
        ]
      );
      return result.documents;
    } catch (error) {
      console.error('Error getting recent activity logs:', error);
      return [];
    }
  }
};

export async function logActivity(
  userId: string,
  action: ActivityLog['action'],
  resourceType: string,
  description: string,
  resourceId?: string,
  ipAddress?: string,
  userAgent?: string,
  metadata?: ActivityLog['metadata']
) {
  try {
    await activityLogService.create({
      logId: ID.unique(),
      userId,
      action,
      resourceType,
      resourceId,
      description,
      ipAddress,
      userAgent,
      metadata,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error('Error logging activity:', error);
  }
}

// Notification Service
export const notificationService = {
    async create(notification: Omit<Notification, '$id' | '$createdAt' | '$updatedAt'>): Promise<Notification> {
        const doc = await databases.createDocument(
            DATABASE_ID,
            COLLECTIONS.NOTIFICATIONS,
            ID.unique(),
            {
                ...notification,
                metadata: notification.metadata ? JSON.stringify(notification.metadata) : undefined
            }
        );
        return {
            ...doc,
            metadata: doc.metadata ? JSON.parse(doc.metadata) : undefined
        } as unknown as Notification;
    },

    async getByUserId(userId: string, limit = 50, offset = 0): Promise<Notification[]> {
        const response = await databases.listDocuments(
            DATABASE_ID,
            COLLECTIONS.NOTIFICATIONS,
            [
                Query.equal('userId', userId),
                Query.orderDesc('createdAt'),
                Query.limit(limit),
                Query.offset(offset)
            ]
        );
        return response.documents.map(doc => ({
            ...doc,
            metadata: doc.metadata ? JSON.parse(doc.metadata) : undefined
        })) as unknown as Notification[];
    },

    async getUnreadCount(userId: string): Promise<number> {
        const response = await databases.listDocuments(
            DATABASE_ID,
            COLLECTIONS.NOTIFICATIONS,
            [
                Query.equal('userId', userId),
                Query.equal('isRead', false),
                Query.limit(1)
            ]
        );
        return response.total;
    },

    async markAsRead(notificationId: string): Promise<Notification> {
        const doc = await databases.updateDocument(
            DATABASE_ID,
            COLLECTIONS.NOTIFICATIONS,
            notificationId,
            {
                isRead: true,
                readAt: new Date().toISOString()
            }
        );
        return {
            ...doc,
            metadata: doc.metadata ? JSON.parse(doc.metadata) : undefined
        } as unknown as Notification;
    },

    async markAllAsRead(userId: string): Promise<void> {
        // Get all unread notifications for the user
        const unreadNotifications = await databases.listDocuments(
            DATABASE_ID,
            COLLECTIONS.NOTIFICATIONS,
            [
                Query.equal('userId', userId),
                Query.equal('isRead', false),
                Query.limit(100)
            ]
        );

        // Mark each as read
        const updatePromises = unreadNotifications.documents.map(notification =>
            databases.updateDocument(
                DATABASE_ID,
                COLLECTIONS.NOTIFICATIONS,
                notification.$id,
                {
                    isRead: true,
                    readAt: new Date().toISOString()
                }
            )
        );

        await Promise.all(updatePromises);
    },

    async delete(notificationId: string): Promise<void> {
        await databases.deleteDocument(
            DATABASE_ID,
            COLLECTIONS.NOTIFICATIONS,
            notificationId
        );
    },

    async createForDepartment(
        departmentId: string,
        notification: Omit<Notification, '$id' | '$createdAt' | '$updatedAt' | 'userId' | 'notificationId'>
    ): Promise<void> {
        // Get all users in the department
        const users = await userService.getByDepartment(departmentId as DepartmentType);
        
        // Create notifications for all users in the department
        const notificationPromises = users.map(user =>
            this.create({
                ...notification,
                notificationId: ID.unique(),
                userId: user.$id
            })
        );

        await Promise.all(notificationPromises);
    },

    async createProfileUpdateNotification(userId: string, updatedFields: string[]): Promise<void> {
        await this.create({
            notificationId: ID.unique(),
            userId,
            type: 'profile_updated',
            title: 'Profile Updated',
            message: `Your profile has been updated. Fields changed: ${updatedFields.join(', ')}`,
            priority: 'medium',
            createdAt: new Date().toISOString()
        });
    },

    async createContentNotification(
        contentId: string,
        contentTitle: string,
        authorName: string,
        departmentId: string,
        type: 'content_created' | 'content_updated' | 'content_published',
        actionUrl?: string
    ): Promise<void> {
        const typeMessages = {
            content_created: 'New content has been created',
            content_updated: 'Content has been updated',
            content_published: 'Content has been published'
        };

        await this.createForDepartment(departmentId, {
            type,
            title: typeMessages[type],
            message: `"${contentTitle}" by ${authorName}`,
            priority: type === 'content_published' ? 'high' : 'medium',
            actionUrl,
            metadata: {
                contentId,
                contentTitle,
                authorName
            },
            createdAt: new Date().toISOString()
        });
    }
}; 