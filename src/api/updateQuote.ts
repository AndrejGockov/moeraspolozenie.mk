import type { VercelRequest, VercelResponse } from '@vercel/node';
import { initializeApp, cert, getApps } from "firebase-admin/app";
import { getFirestore } from "firebase-admin/firestore";

if (!getApps().length) {
    initializeApp({
        credential: cert(JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT!))
    });
}

const db = getFirestore();

interface ZenQuote {
    q: string;
    a: string;
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
    const authHeader = req.headers.authorization;
    if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
        return res.status(401).send("Unauthorized");
    }

    try {
        const fetchResponse = await fetch("https://zenquotes.io/api/today");
        const data = (await fetchResponse.json()) as ZenQuote[];
        const quote = data[0];

        if (!quote || !quote.q) {
            throw new Error("Invalid response structure");
        }

        await db.collection("quotes").doc("daily").set({
            text: quote.q,
            author: quote.a,
            updatedAt: new Date().toISOString()
        });

        console.log("✅ Quote updated:", quote.q);
        return res.status(200).send("OK");
    } catch (err) {
        console.error("❌ Error:", err);
        return res.status(500).send("Error");
    }
}
