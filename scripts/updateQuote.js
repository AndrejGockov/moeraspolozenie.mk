const admin = require("firebase-admin");
const fetch = require("node-fetch");

// Firebase service account from GitHub secret
const serviceAccount = JSON.parse(
    process.env.FIREBASE_SERVICE_ACCOUNT
);

admin.initializeApp({
    credential: admin.credential.cert(serviceAccount)
});

const db = admin.firestore();

async function updateQuote() {
    try {
        // Fetch quote
        const res = await fetch(
            "https://api.quotable.io/random?tags=happiness|inspirational"
        );

        const data = await res.json();

        const quote = {
            text: data.content,
            author: data.author,
            updatedAt: new Date().toISOString()
        };

        // Save to Firestore
        await db.collection("quotes").doc("daily").set(quote);

        console.log("✅ Daily quote updated:", quote);
    } catch (err) {
        console.error("❌ Error updating quote:", err);
        process.exit(1);
    }
}

updateQuote();