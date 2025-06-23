export interface User {
  $id: string;
  userId: string;
  email: string;
  username: string;
  department: 'ems' | 'police' | 'doj' | 'fire' | 'government';
  role: 'viewer' | 'editor' | 'admin' | 'super_admin';
  gameCharacterName?: string;
  rank?: string;
  jobTitle?: string;
  phoneNumber?: string;
  callsign?: string;
  assignment?: string;
  activity?: 'Active' | 'Moderate' | 'Inactive';
  status?: 'Full-Time' | 'Part-Time' | 'On-Call';
  timezone?: string;
  discordUsername?: string;
  isFTO?: boolean;
  isSoloCleared?: boolean;
  isWaterRescue?: boolean;
  isCoPilotCert?: boolean;
  isAviationCert?: boolean;
  isPsychNeuro?: boolean;
  lastLogin?: string;
  createdAt: string;
  $createdAt: string;
  $updatedAt: string;
}

export interface Department {
  $id: string;
  departmentId: string;  
  name: string;
  slug: string;
  color: string;
  logo?: string;
  isActive: boolean;
  createdAt: string;
  $createdAt: string;
  $updatedAt: string;
}

export interface Content {
  $id: string;
  contentId: string;
  departmentId: string;
  title: string;
  slug: string;
  content: string; // JSON string for rich text content
  type: 'sop' | 'guide' | 'announcement' | 'resource' | 'training' | 'policy';
  status: 'draft' | 'published' | 'archived';
  authorId: string;
  tags?: string[];
  version: number;
  publishedAt?: string;
  createdAt: string;
  updatedAt: string;
  $createdAt: string;
  $updatedAt: string;
}

export interface ContentVersion {
  $id: string;
  versionId: string;
  contentId: string; // Reference to main content document
  version: number;
  title: string;
  slug: string;
  content: unknown; // Changed from any
  type: 'sop' | 'guide' | 'announcement' | 'resource' | 'training' | 'policy';
  status: 'draft' | 'published' | 'archived';
  tags?: string[];
  authorId: string; // User who created this version
  changesSummary?: string; // Brief description of changes
  isCurrentVersion: boolean;
  publishedAt?: string;
  createdAt: string;
  $createdAt: string;
  $updatedAt: string;
}

export interface VersionDiff {
  field: string;
  oldValue: any;
  newValue: any;
  changeType: 'added' | 'removed' | 'modified';
}

export interface VersionComparison {
  fromVersion: number;
  toVersion: number;
  fromVersionData: ContentVersion;
  toVersionData: ContentVersion;
  diffs: VersionDiff[];
  totalChanges: number;
}

export interface ActivityLog {
  $id: string;
  logId: string;
  userId: string;
  action: 'create' | 'update' | 'delete' | 'view' | 'login' | 'logout' | 'version_created' | 'version_restored';
  resourceType: string;
  resourceId?: string;
  description: string;
  ipAddress?: string;
  userAgent?: string;
  metadata?: {
    versionNumber?: number;
    previousVersion?: number;
    changesSummary?: string;
  };
  timestamp: string;
  $createdAt: string;
  $updatedAt: string;
}

export interface Notification {
  $id: string;
  notificationId: string;
  userId: string; // Who should receive this notification
  type: 'profile_updated' | 'content_created' | 'content_updated' | 'content_published' | 'role_changed' | 'department_announcement';
  title: string;
  message: string;
  isRead?: boolean; // Optional since it has a default value in database
  priority?: 'low' | 'medium' | 'high' | 'urgent'; // Optional since it has a default value
  actionUrl?: string; // Optional URL to navigate to when clicked
  metadata?: {
    contentId?: string;
    contentTitle?: string;
    authorName?: string;
    departmentName?: string;
    oldRole?: string;
    newRole?: string;
    changesSummary?: string;
  };
  createdAt: string;
  readAt?: string;
  $createdAt: string;
  $updatedAt: string;
}

export type UserRole = 'viewer' | 'editor' | 'admin' | 'super_admin';
export type DepartmentType = 'ems' | 'police' | 'doj' | 'fire' | 'government';
export type ContentType = 'sop' | 'guide' | 'announcement' | 'resource' | 'training' | 'policy';
export type ContentStatus = 'draft' | 'published' | 'archived';
export type ActivityAction = 'create' | 'update' | 'delete' | 'view' | 'login' | 'logout' | 'version_created' | 'version_restored';
export type VersionChangeType = 'added' | 'removed' | 'modified';
export type NotificationType = 'profile_updated' | 'content_created' | 'content_updated' | 'content_published' | 'role_changed' | 'department_announcement';
export type NotificationPriority = 'low' | 'medium' | 'high' | 'urgent'; 