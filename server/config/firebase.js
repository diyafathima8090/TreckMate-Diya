import admin from 'firebase-admin';
import dotenv from 'dotenv';
dotenv.config();

try {
  // If FIREBASE_SERVICE_ACCOUNT_KEY is provided as a stringified JSON in env
  if (process.env.FIREBASE_SERVICE_ACCOUNT_KEY) {
    const serviceAccount = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT_KEY);
    admin.initializeApp({
      credential: admin.credential.cert(serviceAccount)
    });
    console.log('Firebase Admin Initialized with Service Account Key');
  }
  // Fallback to explicit env vars (Full Service Account)
  else if (process.env.FIREBASE_PROJECT_ID && process.env.FIREBASE_CLIENT_EMAIL && process.env.FIREBASE_PRIVATE_KEY) {
    admin.initializeApp({
      credential: admin.credential.cert({
        projectId: process.env.FIREBASE_PROJECT_ID,
        clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
        // Handle newline characters in private key string
        privateKey: process.env.FIREBASE_PRIVATE_KEY.replace(/\\n/g, '\n')
      })
    });
    console.log('Firebase Admin Initialized with explicit credentials');
  }
  // Minimum required for verifyIdToken is the projectId
  else if (process.env.FIREBASE_PROJECT_ID) {
    admin.initializeApp({
      projectId: process.env.FIREBASE_PROJECT_ID
    });
    console.log('Firebase Admin Initialized with Project ID (Token verification only)');
  }
  // Local testing / default initialization (will work if GOOGLE_APPLICATION_CREDENTIALS is set)
  else {
    admin.initializeApp();
    console.log('Firebase Admin Initialized with default credentials');
  }
} catch (error) {
  console.error('Firebase Admin Initialization Error:', error.message);
}

export default admin;
