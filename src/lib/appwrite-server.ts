import { Client, Account, Databases, Storage, Functions, Users } from 'node-appwrite';

export const adminClient = new Client();

const apiKey = process.env.APPWRITE_API_KEY;
if (!apiKey) {
  throw new Error('Missing APPWRITE_API_KEY environment variable');
}
adminClient
  .setEndpoint('https://appwrite.usrp.info/v1')
  .setProject('684492280037c88a3856')
  .setKey(apiKey);

export const adminAccount = new Account(adminClient);
export const adminDatabases = new Databases(adminClient);
export const adminStorage = new Storage(adminClient);
export const adminFunctions = new Functions(adminClient);
export const adminUsers = new Users(adminClient);

// Database and Collection IDs (same as client)
export const DATABASE_ID = '6844ad7a000bfb3b4957';
export const COLLECTIONS = {
  USERS: 'users',
  DEPARTMENTS: 'departments', 
  CONTENT: 'content',
  CONTENT_VERSIONS: 'content_versions',
  ACTIVITY_LOGS: 'activity_logs',
  NOTIFICATIONS: 'notifications'
} as const; 