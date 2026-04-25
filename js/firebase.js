/**
 * NightR41d.exe — Firebase Integration
 * Handles saving check-ins and retrieving history from Firestore.
 */

// Firebase Configuration — MindCare (mindcare-aa984)
const firebaseConfig = {
    apiKey: "AIzaSyBOwaCtSLb095-MqkJGUPoAJP2rKWhArAA",
    authDomain: "mindcare-aa984.firebaseapp.com",
    projectId: "mindcare-aa984",
    storageBucket: "mindcare-aa984.firebasestorage.app",
    messagingSenderId: "608800807181",
    appId: "1:608800807181:web:33c45569d4309e77427844",
    measurementId: "G-3QSXQWT00L"
};

// Initialize Firebase (use window.firebase for ES module compatibility)
window.firebase.initializeApp(firebaseConfig);
const db = window.firebase.firestore();

/**
 * Saves a check-in record to Firestore.
 * @param {Object} data - { date, sleep, study, emotion, stressValue, tasks, lastBreak, score, aiAdvice }
 * @returns {Promise<DocumentReference>}
 */
export async function saveCheckin(data) {
    try {
        const docRef = await db.collection("checkins").add({
            ...data,
            timestamp: window.firebase.firestore.FieldValue.serverTimestamp()
        });
        console.log("Check-in saved successfully:", docRef.id);
        return docRef;
    } catch (error) {
        console.error("Error saving check-in:", error);
        throw error;
    }
}

/**
 * Retrieves the last 7 check-ins from Firestore.
 * @returns {Promise<Array>} - Array of check-in objects
 */
export async function getHistory() {
    try {
        const snapshot = await db.collection("checkins")
            .orderBy("timestamp", "desc")
            .limit(7)
            .get();
        
        return snapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data()
        }));
    } catch (error) {
        console.error("Error fetching history:", error);
        return [];
    }
}

/**
 * Clears all history from the checkins collection.
 * @returns {Promise<boolean>}
 */
export async function clearHistory() {
    try {
        const snapshot = await db.collection("checkins").get();
        const deletePromises = snapshot.docs.map(doc => doc.ref.delete());
        await Promise.all(deletePromises);
        console.log("History cleared successfully.");
        return true;
    } catch (error) {
        console.error("Error clearing history:", error);
        return false;
    }
}
