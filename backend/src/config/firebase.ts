import * as admin from 'firebase-admin';
import path from 'path';

// Use absolute path to ensure the key is found
const serviceAccountPath = path.resolve(__dirname, '../../serviceAccountKey.json');

if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.cert(serviceAccountPath),
  });
  console.log("✅ Firebase Admin Initialized");
}

export const db = admin.firestore();
export const auth = admin.auth();