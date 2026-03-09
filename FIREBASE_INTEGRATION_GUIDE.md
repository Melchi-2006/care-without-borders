# 🔥 Firebase Integration Guide

This guide explains how to set up Firebase Firestore for database operations alongside the backend authentication system.

## Overview

The application now uses a **hybrid approach**:
- **Backend Authentication**: Uses local JSON file (`data/users.json`) for secure password verification
- **Firebase Firestore**: Syncs user data for real-time access from frontend (optional but recommended)
- **Client-side Firebase**: Used by frontend for reading data in real-time

## Step 1: Get Firebase Admin SDK Credentials

### Option A: Using Firebase Console (Recommended)

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Select your project: **care-without-borders-789dd**
3. Click **⚙️ Project Settings** (gear icon)
4. Go to **Service Accounts** tab
5. Click **"Generate New Private Key"** button
6. Copy the JSON key file contents

### Option B: View Existing Service Account

If you already have a service account:
1. Firebase Console → Project Settings → Service Accounts
2. Look for existing keys under "Firebase Admin SDK"
3. Download the JSON key file

## Step 2: Extract Credentials from JSON Key File

The downloaded JSON file will look like:

```json
{
  "type": "service_account",
  "project_id": "care-without-borders-789dd",
  "private_key_id": "abc123def456",
  "private_key": "-----BEGIN PRIVATE KEY-----\nMIIEvQIBADANBgkqhkiG9w0BAQEFAASCBKcwggSjAgEAAoIBAQC...\n-----END PRIVATE KEY-----\n",
  "client_email": "firebase-adminsdk-xxxxx@care-without-borders-789dd.iam.gserviceaccount.com",
  "client_id": "123456789",
  "auth_uri": "https://accounts.google.com/o/oauth2/auth",
  "token_uri": "https://oauth2.googleapis.com/token",
  "auth_provider_x509_cert_url": "https://www.googleapis.com/oauth2/v1/certs",
  "client_x509_cert_url": "https://www.googleapis.com/robot/v1/metadata/x509/firebase-adminsdk-xxxxx%40care-without-borders-789dd.iam.gserviceaccount.com"
}
```

Extract three key values:
1. `private_key_id` - Your Firebase Admin key ID
2. `private_key` - Your Firebase Admin private key (KEEP THIS SECRET!)
3. `client_email` - Your Firebase service account email

## Step 3: Update .env File

Update your `.env` file with the extracted credentials:

```env
# Firebase Admin SDK Configuration
FIREBASE_CLIENT_EMAIL="firebase-adminsdk-xxxxx@care-without-borders-789dd.iam.gserviceaccount.com"
FIREBASE_PRIVATE_KEY_ID="abc123def456"
FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\nMIIEvQIBADANBgkqhkiG9w0BAQEFAASCBKcwggSjAgEAAoIBAQC...\n-----END PRIVATE KEY-----\n"
```

⚠️ **SECURITY WARNING**: 
- Never commit `.env` to git (already in `.gitignore`)
- Never share your private key
- Keep your private key secret!

## Step 4: Enable Firestore Database

1. Firebase Console → Build → Firestore Database
2. Click **"Create Database"**
3. Select Region: **asia-south1** (or nearest to your users)
4. Start in **Test Mode** (for development)
5. Click **"Enable"**

## Step 5: Set Firestore Security Rules (Important!)

After Firestore is created, update security rules for authentication:

1. In Firestore → **Rules** tab
2. Replace with:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Patients can read/write their own documents
    match /patients/{userId} {
      allow read, write: if request.auth.uid == userId;
    }
    
    // Doctors can read/write their own documents and read patient lists
    match /doctors/{userId} {
      allow read, write: if request.auth.uid == userId;
    }
    
    // Prescriptions - doctors can create, patients can read their own
    match /prescriptions/{docId} {
      allow create: if request.auth.token.doctor == true;
      allow read: if request.auth.uid == resource.data.patientId || request.auth.token.doctor == true;
    }
    
    // Appointments - doctors can read their appointments, patients can read theirs
    match /appointments/{docId} {
      allow read: if request.auth.uid == resource.data.patientId || request.auth.uid == resource.data.doctorId;
      allow write: if request.auth.uid == resource.data.doctorId;
    }
    
    // Medical Records
    match /medicalRecords/{docId} {
      allow read, write: if request.auth.uid == resource.data.patientId;
    }
  }
}
```

3. Click **"Publish"**

## Step 6: Test the Integration

After setup, the system will:

1. ✅ Register new users in backend (`data/users.json`)
2. ✅ Automatically sync to Firebase Firestore
3. ✅ Log sync status in console:
   ```
   ✅ Firebase Admin SDK initialized successfully
   ✅ Doctor john@example.com saved to Firebase
   ✅ Patient jane@example.com saved to Firebase
   ```

## Firebase Collections Schema

### `doctors` Collection
```json
{
  "id": "abc123def456",
  "email": "doctor@example.com",
  "name": "Dr. John Smith",
  "phone": "+1234567890",
  "specialization": "Cardiology",
  "licenseNumber": "DOC123456",
  "createdAt": "2026-03-09T10:30:00.000Z",
  "status": "active",
  "rating": 4.5,
  "consultations": 15,
  "availableSlots": [],
  "patients": []
}
```

### `patients` Collection
```json
{
  "id": "xyz789abc456",
  "email": "patient@example.com",
  "name": "Jane Doe",
  "phone": "+0987654321",
  "age": 35,
  "gender": "Female",
  "createdAt": "2026-03-09T10:30:00.000Z",
  "status": "active",
  "medicalHistory": [],
  "prescriptions": [],
  "appointments": [],
  "consultations": []
}
```

### `prescriptions` Collection
```json
{
  "id": "presc123",
  "patientId": "xyz789abc456",
  "doctorId": "abc123def456",
  "medicines": [
    {
      "name": "Aspirin",
      "dosage": "500mg",
      "frequency": "2 times daily",
      "duration": "7 days"
    }
  ],
  "instructions": "Take with food",
  "createdAt": "2026-03-09T11:00:00.000Z",
  "validUntil": "2026-04-09T11:00:00.000Z",
  "status": "active"
}
```

### `appointments` Collection
```json
{
  "id": "appt123",
  "patientId": "xyz789abc456",
  "doctorId": "abc123def456",
  "scheduledTime": "2026-03-10T14:30:00.000Z",
  "duration": 15,
  "status": "scheduled",
  "notes": "Follow-up consultation",
  "createdAt": "2026-03-09T10:30:00.000Z"
}
```

### `payments` Collection
```json
{
  "paymentId": "pay_123456",
  "patientId": "xyz789abc456",
  "doctorId": "abc123def456",
  "appointmentId": "appt123",
  "amount": 500,
  "currency": "INR",
  "status": "completed",
  "razorpayOrderId": "order_123456",
  "razorpaySignature": "signature_xyz",
  "createdAt": "2026-03-10T14:30:00.000Z"
}
```

### `medicalRecords` Collection
```json
{
  "patientId": "xyz789abc456",
  "recordType": "prescription",
  "data": {
    "medicines": [...],
    "instructions": "..."
  },
  "doctorId": "abc123def456",
  "createdAt": "2026-03-09T11:00:00.000Z"
}
```

## Frontend Usage (Client-side Firebase)

The frontend can read real-time data from Firestore using the client-side Firebase SDK:

```javascript
import { db } from './js/firebase.js';
import { doc, getDoc } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-firestore.js";

// Get patient data
const patientRef = doc(db, "patients", patientId);
const patientDoc = await getDoc(patientRef);
const patientData = patientDoc.data();
```

## Backend APIs for Firebase Operations

### Save Prescription to Firebase
```bash
POST /api/save-prescription
{
  "patientId": "xyz789abc456",
  "doctorId": "abc123def456",
  "medicines": [...],
  "instructions": "..."
}
```

### Get Doctor Appointments from Firebase
```bash
GET /api/doctor-appointments/:doctorId
```

### Save Payment to Firebase
```bash
POST /api/save-payment
{
  "patientId": "xyz789abc456",
  "doctorId": "abc123def456",
  "appointmentId": "appt123",
  "amount": 500
}
```

## Troubleshooting

### Firebase Not Initialized
**Error**: `Firebase not available: Missing credentials in environment`

**Solution**: Ensure `.env` has `FIREBASE_CLIENT_EMAIL` and `FIREBASE_PRIVATE_KEY`

### Invalid Private Key Format
**Error**: `Invalid private key format`

**Solution**: Ensure the private key includes newline characters: `\n`

### Authentication Failed
**Error**: `Firebase authentication failed`

**Solution**: 
1. Check if service account is enabled
2. Check Firebase project ID matches `.env`
3. Try regenerating private key in Firebase Console

### Firestore Quota Exceeded
**Error**: `RESOURCE_EXHAUSTED: Quota exceeded`

**Solution**: 
1. Check Firestore usage in Firebase Console
2. Upgrade from Spark Plan to Blaze Plan
3. Or reduce write frequency

## Next Steps

1. ✅ Install firebase-admin: `npm install firebase-admin`
2. ✅ Update `.env` with Firebase credentials
3. ✅ Enable Firestore in Firebase Console
4. ✅ Set Firestore security rules
5. ✅ Restart the server: `npm start`
6. ✅ Test registration and verify data in Firestore Console

## Resources

- [Firebase Console](https://console.firebase.google.com/)
- [Firebase Admin SDK Documentation](https://firebase.google.com/docs/database/admin/start)
- [Firestore Security Rules Guide](https://firebase.google.com/docs/firestore/security/get-started)
- [Firebase Pricing](https://firebase.google.com/pricing)

---

**Questions?** Check the logs for Firebase initialization status when starting the server.
