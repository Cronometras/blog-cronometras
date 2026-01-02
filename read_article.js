
const { initializeApp } = require("firebase/app");
const { getFirestore, doc, getDoc } = require("firebase/firestore");
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

async function getArticle() {
    const articleId = 'sq0WoVb6b8SxCs1Jkr4H';
    try {
        const docRef = doc(db, 'articulos_cronometras', articleId);
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
            const content = docSnap.data().content;
            const lines = content.split('\n');
            console.log('Lines with math:');
            lines.forEach(line => {
                if (line.includes('$$') || line.includes('\\text')) {
                    console.log(line);
                }
            });
        } else {
            console.log('No such document!');
        }
    } catch (error) {
        console.error('Error:', error);
    }
}

getArticle();
