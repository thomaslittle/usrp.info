import { Client, Account, Databases, Storage, Functions } from 'appwrite';

export const client = new Client();

client
  .setEndpoint('https://appwrite.usrp.info/v1')
  .setProject('684492280037c88a3856');

export const account = new Account(client);
export const databases = new Databases(client);
export const storage = new Storage(client);
export const functions = new Functions(client);

// Database and Collection IDs
export const DATABASE_ID = '6844ad7a000bfb3b4957';
export const COLLECTIONS = {
  USERS: 'users',
  DEPARTMENTS: 'departments', 
  CONTENT: 'content',
  ACTIVITY_LOGS: 'activity_logs'
} as const;

// Storage Buckets
export const BUCKETS = {
  UPLOADS: 'uploads',
  AVATARS: 'avatars'
} as const; 