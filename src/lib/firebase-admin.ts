import { initializeApp, cert, getApps, App } from 'firebase-admin/app';
import { getFirestore, Firestore } from 'firebase-admin/firestore';
import { readFileSync, existsSync } from 'fs';
import { resolve } from 'path';

let cachedDb: Firestore | null = null;

function readServiceAccount(): any {
  // Source 1: FIREBASE_SERVICE_ACCOUNT_PATH (path to JSON file)
  const envPath = (import.meta.env.FIREBASE_SERVICE_ACCOUNT_PATH
    || process.env.FIREBASE_SERVICE_ACCOUNT_PATH || '').trim();
  if (envPath) {
    const abs = resolve(process.cwd(), envPath);
    if (existsSync(abs)) {
      return JSON.parse(readFileSync(abs, 'utf8'));
    }
  }

  // Source 2: FIREBASE_SERVICE_ACCOUNT_JSON (raw JSON, possibly one-line)
  const envJson = (import.meta.env.FIREBASE_SERVICE_ACCOUNT_JSON
    || process.env.FIREBASE_SERVICE_ACCOUNT_JSON || '').trim();
  if (envJson) {
    if (envJson.startsWith('{')) {
      return JSON.parse(envJson);
    }
    // Could be a path that doesn't start with {
    const abs = resolve(process.cwd(), envJson);
    if (existsSync(abs)) {
      return JSON.parse(readFileSync(abs, 'utf8'));
    }
  }

  // Source 3: ./sa.json in project root (local dev convenience)
  const localPath = resolve(process.cwd(), 'sa.json');
  if (existsSync(localPath)) {
    return JSON.parse(readFileSync(localPath, 'utf8'));
  }

  throw new Error(
    'Firebase admin service account not found. Provide one of:\n' +
    '  - FIREBASE_SERVICE_ACCOUNT_PATH=/abs/path/to/sa.json\n' +
    '  - FIREBASE_SERVICE_ACCOUNT_JSON={"type":...}\n' +
    '  - ./sa.json in project root'
  );
}

function getAdminApp(): App {
  if (getApps().length > 0) {
    return getApps()[0];
  }
  return initializeApp({ credential: cert(readServiceAccount()) });
}

export function getAdminFirestore(): Firestore {
  if (cachedDb) return cachedDb;
  cachedDb = getFirestore(getAdminApp());
  return cachedDb;
}
