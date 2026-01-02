
const { initializeApp } = require("firebase/app");
const { getFirestore, collection, getDocs } = require("firebase/firestore");
const dotenv = require("dotenv");
const path = require("path");

dotenv.config();

const firebaseConfig = {
    apiKey: process.env.FIREBASE_API_KEY,
    authDomain: process.env.FIREBASE_AUTH_DOMAIN,
    projectId: process.env.FIREBASE_PROJECT_ID,
    storageBucket: process.env.FIREBASE_STORAGE_BUCKET,
    messagingSenderId: process.env.FIREBASE_MESSAGING_SENDER_ID,
    appId: process.env.FIREBASE_APP_ID,
    measurementId: process.env.FIREBASE_MEASUREMENT_ID
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

// Simple slugify implementation
function slugify(text) {
    return text
        .toString()
        .toLowerCase()
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '')
        .replace(/[^\w\s-]/g, '')
        .replace(/[\s_-]+/g, '-')
        .replace(/^-+|-+$/g, '');
}

async function listArticles() {
    try {
        const articlesRef = collection(db, 'articulos_cronometras');
        const querySnapshot = await getDocs(articlesRef);

        console.log(`Found ${querySnapshot.size} articles in Firestore\n`);

        querySnapshot.forEach((doc) => {
            const data = doc.data();
            const titleMatch = data.content ? data.content.match(/^#\s+(.+)$/m) : null;
            const title = titleMatch ? titleMatch[1].trim() : 'No title';
            const slug = slugify(data.topic || title);
            console.log(`- ID: ${doc.id}`);
            console.log(`  Topic: ${data.topic}`);
            console.log(`  Slug: ${slug}`);
            console.log(`  Status: ${data.status}\n`);
        });
    } catch (error) {
        console.error('Error:', error);
    }
}

listArticles();
