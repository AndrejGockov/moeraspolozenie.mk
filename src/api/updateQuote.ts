import * as admin from "firebase-admin";
import fetch from "node-fetch";

const serviceAccount = JSON.parse(
    process.env.FIREBASE_SERVICE_ACCOUNT as string
);

admin.initializeApp({
    credential: admin.credential.cert(serviceAccount)
});

const db = admin.firestore();

interface ZenQuote {
    q: string;
    a: string;
}

async function updateQuote(): Promise<void> {
    try {
        const res = await fetch("https://zenquotes.io/api/today");
        const data = await res.json() as ZenQuote[];

        const quote = data[0];

        await db.collection("quotes").doc("daily").set({
            text: quote.q,
            author: quote.a,
            updatedAt: new Date().toISOString()
        });

        console.log("✅ Quote updated:", quote.q);
    } catch (err) {
        console.error("❌ Error:", err);
        process.exit(1);
    }
}

updateQuote();