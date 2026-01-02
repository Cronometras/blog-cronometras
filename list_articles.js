
const { initializeApp } = require("firebase/app");
const { getFirestore, collection, getDocs } = require("firebase/firestore");
const dotenv = require("dotenv");

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

async function listArticles() {
    try {
        const articlesRef = collection(db, 'articulos_cronometras');
        const snapshot = await getDocs(articlesRef);

        // console.log(`Found ${snapshot.size} articles in Firestore\n`);

        snapshot.forEach(doc => {
            const data = doc.data();
            const topic = data.topic || '';
            if (topic.includes('MTM') || topic.includes('OEE')) {
                console.log(`FOUND: ${doc.id} | ${topic}`);
            }
        });
    } catch (error) {
        console.error('Error fetching articles:', error);
    }
}

listArticles();
