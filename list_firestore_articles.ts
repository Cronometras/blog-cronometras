
import { collection, getDocs } from "firebase/firestore";
import { db } from "./src/lib/firebase";
import { slugify } from "./src/utils/slugify";

async function listArticles() {
    try {
        const articlesRef = collection(db, 'articulos_cronometras');
        const querySnapshot = await getDocs(articlesRef);

        console.log(`Found ${querySnapshot.size} articles in Firestore\n`);

        querySnapshot.forEach((doc) => {
            const data = doc.data();
            const title = data.content ? data.content.match(/^#\s+(.+)$/m)?.[1] : 'No title';
            const slug = slugify(data.topic || title);
            console.log(`- ID: ${doc.id}`);
            console.log(`  Topic: ${data.topic}`);
            console.log(`  Expected Slug: ${slug}`);
            console.log(`  Status: ${data.status}\n`);
        });
    } catch (error) {
        console.error('Error:', error);
    }
}

listArticles();
