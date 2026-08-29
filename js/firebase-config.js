/**
 * SmartLearn - Firebase Configuration & Authentication/Firestore Service
 * Brand: SmartLearn | Connected Classroom
 * 
 * Instructions to connect your Firebase account:
 * 1. Open Firebase Console: https://console.firebase.google.com/
 * 2. Create a new project (e.g. "smartlearn-edtech").
 * 3. Go to Project Settings -> General -> "Add app" -> Web app.
 * 4. Enable Authentication -> Sign-in method -> Email/Password.
 * 5. Enable Firestore Database in Test or Production Mode.
 * 6. Replace the placeholder values in `firebaseConfig` below with your real keys.
 */

const firebaseConfig = {
  apiKey: "AIzaSyDTgaT9YfN1CHHQMScF11xB-kYCV5FKBvg",
  authDomain: "smartlearn-37f48.firebaseapp.com",
  projectId: "smartlearn-37f48",
  storageBucket: "smartlearn-37f48.firebasestorage.app",
  messagingSenderId: "829460949215",
  appId: "1:829460949215:web:5cdcc2cb72a6eb2b05a16a",
  measurementId: "G-TJ424SYEFD"
};

const SmartLearnFirebase = {
  app: null,
  auth: null,
  db: null,
  isConfigured: false,

  // 1. Initialize Firebase Services
  init() {
    try {
      if (typeof firebase === 'undefined') {
        console.warn("⚠️ Firebase SDK not loaded. SmartLearn will run in local storage mode.");
        this.isConfigured = false;
        return false;
      }

      // Check if API Key or Project ID is placeholder / mock demo value
      const isPlaceholder = !firebaseConfig.apiKey || 
                            firebaseConfig.apiKey.startsWith("YOUR_FIREBASE") ||
                            firebaseConfig.projectId.startsWith("YOUR_PROJECT");

      if (isPlaceholder) {
        console.info("💡 SmartLearn Firebase Status: Local Storage Fallback Active.");
        this.isConfigured = false;
        return false;
      }

      // Initialize Firebase App
      if (!firebase.apps.length) {
        this.app = firebase.initializeApp(firebaseConfig);
      } else {
        this.app = firebase.app();
      }

      // Initialize Authentication and Firestore
      this.auth = firebase.auth();
      this.db = firebase.firestore();
      this.isConfigured = true;

      console.log("🔥 SmartLearn Firebase initialized successfully with Cloud Auth & Firestore Database!");
      
      // Keep session state persistent across tabs/reloads
      this.auth.setPersistence(firebase.auth.Auth.Persistence.LOCAL).catch(err => {
        console.warn("Firebase Auth persistence setup warning:", err);
      });

      return true;
    } catch (e) {
      console.error("Firebase initialization error:", e);
      this.isConfigured = false;
      return false;
    }
  },

  // 2. Firebase Authentication: Register User
  async registerUser(email, password, profileData) {
    if (!this.isConfigured) return null;
    try {
      // Create account in Firebase Auth (password is securely hashed natively by Firebase)
      const userCredential = await this.auth.createUserWithEmailAndPassword(email, password);
      const uid = userCredential.user.uid;

      // Prepare user document for Firestore
      const isTeacherRole = (profileData.role === "Teacher" || profileData.role === "teacher");
      const userDocData = {
        id: uid,
        uid: uid,
        email: email.toLowerCase().trim(),
        role: profileData.role,
        fullName: profileData.fullName || profileData.name || "",
        name: profileData.name || profileData.fullName || "",
        phone: profileData.phone || "",
        className: profileData.className || profileData.class || "B.Tech CSE",
        class: profileData.class || profileData.className || "B.Tech CSE",
        section: profileData.section || "A",
        studentId: profileData.studentId || ("SL-2026-" + Math.floor(100 + Math.random() * 900)),
        employeeId: profileData.employeeId || "",
        subject: profileData.subject || "",
        department: profileData.department || "",
        status: profileData.status || (isTeacherRole ? "pending" : "approved"),
        isApproved: profileData.isApproved !== undefined ? profileData.isApproved : (!isTeacherRole),
        approved: profileData.approved !== undefined ? profileData.approved : (!isTeacherRole),
        childStudentId: profileData.childStudentId || "",
        childUserId: profileData.childUserId || "",
        childName: profileData.childName || "",
        avatar: profileData.avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(profileData.fullName || profileData.name || "User")}`,
        createdAt: firebase.firestore.FieldValue.serverTimestamp()
      };

      // Save user profile into Firestore collection 'users'
      await this.db.collection("users").doc(uid).set(userDocData);

      return { uid, user: userDocData };
    } catch (error) {
      console.error("Firebase register error:", error);
      throw error;
    }
  },

  // 3. Firebase Authentication: Login User
  async loginUser(email, password) {
    if (!this.isConfigured) return null;
    try {
      const userCredential = await this.auth.signInWithEmailAndPassword(email, password);
      const uid = userCredential.user.uid;
      const cleanEmail = email.toLowerCase().trim();

      // Fetch user profile from Firestore 'users' collection
      const doc = await this.db.collection("users").doc(uid).get();
      if (doc.exists) {
        return { uid, user: { id: uid, ...doc.data() } };
      } else {
        // Fallback search by email if UID doc doesn't exist
        const query = await this.db.collection("users").where("email", "==", cleanEmail).get();
        if (!query.empty) {
          const matchedDoc = query.docs[0];
          return { uid: matchedDoc.id, user: { id: matchedDoc.id, ...matchedDoc.data() } };
        }
      }

      // Auto-generate profile doc if user exists in Firebase Auth but missing in Firestore
      const emailPrefix = cleanEmail.split("@")[0];
      const autoName = emailPrefix.charAt(0).toUpperCase() + emailPrefix.slice(1);
      const fallbackUserDoc = {
        id: uid,
        uid: uid,
        email: cleanEmail,
        fullName: autoName,
        name: autoName,
        role: "Student",
        className: "B.Tech CSE",
        class: "B.Tech CSE",
        section: "A",
        studentId: "SL-2026-" + Math.floor(100 + Math.random() * 900),
        department: "CSE",
        avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(cleanEmail)}`,
        createdAt: new Date().toISOString()
      };

      try {
        await this.db.collection("users").doc(uid).set(fallbackUserDoc);
      } catch (e) {
        console.warn("Could not save fallback user doc to Firestore:", e);
      }

      return { uid, user: fallbackUserDoc };
    } catch (error) {
      console.error("Firebase login error:", error);
      throw error;
    }
  },

  // 4. Firebase Authentication: Logout
  async logout() {
    if (!this.isConfigured || !this.auth) return;
    try {
      await this.auth.signOut();
    } catch (e) {
      console.error("Firebase signout error:", e);
    }
  },

  // 5. Firestore Collection Sync (Save item or collection to Firestore)
  async saveDoc(collectionName, docId, data) {
    if (!this.isConfigured) return false;
    try {
      await this.db.collection(collectionName).doc(docId).set(data, { merge: true });
      return true;
    } catch (e) {
      console.error(`Error saving to Firestore collection ${collectionName}:`, e);
      return false;
    }
  },

  // 6. Firestore Collection Fetch
  async fetchCollection(collectionName) {
    if (!this.isConfigured) return [];
    try {
      const snapshot = await this.db.collection(collectionName).get();
      const items = [];
      snapshot.forEach(doc => {
        items.push({ id: doc.id, ...doc.data() });
      });
      return items;
    } catch (e) {
      console.error(`Error fetching collection ${collectionName} from Firestore:`, e);
      return [];
    }
  }
};

// Initialize SmartLearnFirebase immediately and on DOM Load
SmartLearnFirebase.init();
document.addEventListener("DOMContentLoaded", () => {
  SmartLearnFirebase.init();
});
