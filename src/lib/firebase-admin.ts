import * as admin from 'firebase-admin';

if (!admin.apps.length) {
  try {
    admin.initializeApp({
      projectId: "qicmart-1c98a",
      // We don't need a service account key here if we are just verifying tokens 
      // on a server where we have environment variables or if we're using default credentials.
      // However, for local dev, we usually need a service account JSON.
      // But for verifyIdToken, sometimes projectId is enough if configured correctly.
      // Actually, for full security, we should use a service account.
    });
  } catch (error) {
    console.error('Firebase admin initialization error', error);
  }
}

export const adminAuth = admin.auth();
export const adminDb = admin.firestore();
