//Vercel updateQuotes.ts
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

export default async function handler(req: Request) {
    if (req.headers.get("authorization") !== `Bearer ${process.env.CRON_SECRET}`) {
        return new Response("Unauthorized", { status: 401 });
    }

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
        return new Response("OK", { status: 200 });
    } catch (err) {
        console.error("❌ Error:", err);
        return new Response("Error", { status: 500 });
    }
}
// github pages updateQuote.ts
//
// import { initializeApp, cert } from "firebase-admin/app";
// import { getFirestore } from "firebase-admin/firestore";
// import fetch from "node-fetch";
//
// const serviceAccount = JSON.parse(
//     process.env.FIREBASE_SERVICE_ACCOUNT as string
// );
//
// initializeApp({
//     credential: cert(serviceAccount)
// });
//
// const db = getFirestore();
//
// interface ZenQuote {
//     q: string;
//     a: string;
// }
//
// async function updateQuote(): Promise<void> {
//     try {
//         const res = await fetch("https://zenquotes.io/api/today");
//         const data = await res.json() as ZenQuote[];
//
//         const quote = data[0];
//
//         await db.collection("quotes").doc("daily").set({
//             text: quote.q,
//             author: quote.a,
//             updatedAt: new Date().toISOString()
//         });
//
//         console.log("✅ Quote updated:", quote.q);
//     } catch (err) {
//         console.error("❌ Error:", err);
//         process.exit(1);
//     }
// }
//
// updateQuote();