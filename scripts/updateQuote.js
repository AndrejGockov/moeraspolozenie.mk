const admin = require("firebase-admin");

const serviceAccount = JSON.parse(
    process.env.FIREBASE_SERVICE_ACCOUNT
);

admin.initializeApp({
    credential: admin.credential.cert(serviceAccount)
});

const db = admin.firestore();

async function updateQuote() {
    try {
        const res = await fetch("https://zenquotes.io/api/random");
        const data = await res.json();

        // ZenQuotes returns an ARRAY
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