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
        const res = await fetch(
            "https://api.quotable.io/random?tags=happiness|inspirational"
        );

        const data = await res.json();

        await db.collection("quotes").doc("daily").set({
            text: data.content,
            author: data.author,
            updatedAt: new Date().toISOString()
        });

        console.log("✅ Quote updated");
    } catch (err) {
        console.error("❌ Error:", err);
        process.exit(1);
    }
}

updateQuote();