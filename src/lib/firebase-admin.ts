import { initializeApp, cert, getApps, App } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';

let app: App;

function getAdminApp(): App {
  if (getApps().length > 0) {
    return getApps()[0];
  }

  const serviceAccount = import.meta.env.FIREBASE_SERVICE_ACCOUNT;
  if (!serviceAccount) {
    throw new Error('FIREBASE_SERVICE_ACCOUNT env var is not set');
  }

  const credentials = typeof serviceAccount === 'string'
    ? JSON.parse(serviceAccount)
    : serviceAccount;

  app = initializeApp({
    credential: cert(credentials),
  });

  return app;
}

export function getAdminFirestore() {
  return getFirestore(getAdminApp());
}
