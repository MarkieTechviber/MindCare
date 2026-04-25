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

// --- DEVICE-BASED USER ISOLATION ---
// Each device gets a unique ID stored in localStorage.
// All data is scoped under users/{deviceId}/checkins so devices are isolated.
function getDeviceId() {
    let deviceId = localStorage.getItem("nightr41d_device_id");
    if (!deviceId) {
        if (typeof crypto !== 'undefined' && crypto.randomUUID) {
            deviceId = crypto.randomUUID();
        } else {
            // Fallback for older browsers or environments without randomUUID
            deviceId = 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
                var r = Math.random() * 16 | 0, v = c == 'x' ? r : (r & 0x3 | 0x8);
                return v.toString(16);
            });
        }
        localStorage.setItem("nightr41d_device_id", deviceId);
        console.log("New device ID generated:", deviceId);
    }
    return deviceId;
}

/**
 * Returns the Firestore sub-collection path for the current device.
 * @returns {firebase.firestore.CollectionReference}
 */
function getUserCheckins() {
    const deviceId = getDeviceId();
    return db.collection("users").doc(deviceId).collection("checkins");
}

/**
 * Saves a check-in record to Firestore (scoped to this device).
 * @param {Object} data - { date, sleep, study, emotion, stressValue, tasks, lastBreak, score, aiAdvice }
 * @returns {Promise<DocumentReference>}
 */
export async function saveCheckin(data) {
    try {
        const docRef = await getUserCheckins().add({
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
 * Retrieves the last 7 check-ins from Firestore (scoped to this device).
 * @returns {Promise<Array>} - Array of check-in objects
 */
export async function getHistory() {
    try {
        const snapshot = await getUserCheckins()
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
 * Clears all history for this device from the checkins collection.
 * @returns {Promise<boolean>}
 */
export async function clearHistory() {
    try {
        const snapshot = await getUserCheckins().get();
        const deletePromises = snapshot.docs.map(doc => doc.ref.delete());
        await Promise.all(deletePromises);
        console.log("History cleared successfully.");
        return true;
    } catch (error) {
        console.error("Error clearing history:", error);
        return false;
    }
}

/**
 * Deletes a single check-in record from Firestore (scoped to this device).
 * @param {string} id - The document ID of the check-in
 * @returns {Promise<boolean>}
 */
export async function deleteCheckin(id) {
    try {
        await getUserCheckins().doc(id).delete();
        console.log(`Check-in ${id} deleted successfully.`);
        return true;
    } catch (error) {
        console.error("Error deleting check-in:", error);
        return false;
    }
}
