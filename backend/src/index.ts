import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import multer from "multer";
import { chatWithModel } from "./controllers/chatController";
import { uploadSOP } from "./controllers/adminController";
import * as admin from "firebase-admin";
import path from 'path';




dotenv.config();
const app = express();
const upload = multer({ dest: "src/uploads/" });

app.use(cors());
app.use(express.json());

// 1. Initialize Firebase Admin
// Make sure you have downloaded your Service Account JSON from Firebase Console
const serviceAccountPath = path.resolve(__dirname, '../serviceAccountKey.json');

try {
  admin.initializeApp({
    credential: admin.credential.cert(serviceAccountPath),
    projectId: process.env.VITE_FIREBASE_PROJECT_ID,
  });
  console.log("🛠️ Firebase Admin Initialized");
} catch (error) {
  console.error("❌ Firebase Initialization Error:", error);
}

const db = admin.firestore();

// 2. THE CONNECTION TEST FUNCTION
const testDbConnection = async () => {
  try {
    console.log('⏳ Testing Firestore connection...');
    
    // We try to fetch a dummy collection or "test" document
    const testRef = db.collection('connection_tests').doc('status');
    await testRef.set({
      last_connected: new Date().toISOString(),
      status: 'online'
    });

    console.log('✅ Firebase Database connected successfully!');
  } catch (error) {
    console.error('❌ Firebase Connection Failed:', error);
    // In a strict project, you might want to kill the process if DB is down
    // process.exit(1); 
  }
};
testDbConnection();

// Learner Endpoint
app.post("/api/chat", chatWithModel);

// admin CRUD endpoints would go here

// Admin Endpoint (Document Ingestion)
app.post("/api/admin/upload", upload.single("file"), uploadSOP);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () =>
  console.log(` CodeTribe Backend running on port ${PORT}`),
);
