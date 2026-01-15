# 🔒 Firestore Security Rules Fix

## Problem
You're seeing "Missing or insufficient permissions" errors because your Firestore security rules don't allow reading the `authorizedRiders` and `carts` collections.

## Solution: Update Firestore Security Rules

### Step 1: Go to Firebase Console
1. Open [Firebase Console](https://console.firebase.google.com/)
2. Select your project: **crocs-by-dero** (or your project name)
3. Click **Firestore Database** in the left menu
4. Click the **Rules** tab at the top

### Step 2: Replace the Rules
Copy and paste this **complete** set of rules:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    
    // Products - anyone can read, authenticated users can write
    match /products/{productId} {
      allow read: if true;
      allow write: if request.auth != null;
    }
    
    // Authorized Riders - authenticated users can read to check authorization
    match /authorizedRiders/{riderId} {
      allow read: if request.auth != null;
      allow write: if false; // Only via Firebase Console or admin functions
    }
    
    // Carts - users can only read/write their own cart
    match /carts/{userId} {
      allow read, write: if request.auth != null && request.auth.uid == userId;
    }
    
    // Orders - authenticated users can read their own orders, write new orders
    match /orders/{orderId} {
      allow read: if request.auth != null;
      allow create: if request.auth != null;
      allow update: if request.auth != null;
    }
    
    // Riders - authenticated users can read/write
    match /riders/{riderId} {
      allow read: if request.auth != null;
      allow write: if request.auth != null && request.auth.uid == riderId;
    }
    
    // Users - users can read/write their own profile
    match /users/{userId} {
      allow read, write: if request.auth != null && request.auth.uid == userId;
    }
  }
}
```

### Step 3: Publish the Rules
1. Click the **"Publish"** button at the top
2. Wait for the confirmation message: "Rules published successfully"

### Step 4: Test
1. **Sign out** from your app
2. **Sign in again** with Google (`prestonmugo33@gmail.com`)
3. Try accessing `/rider-dashboard` again
4. Check the browser console - the permission errors should be gone!

## What These Rules Do

- ✅ **Products**: Anyone can view products, only authenticated users can edit
- ✅ **Authorized Riders**: Authenticated users can check if they're authorized
- ✅ **Carts**: Users can only access their own cart (by user ID)
- ✅ **Orders**: Authenticated users can create and read orders
- ✅ **Riders**: Riders can read all rider profiles, but only update their own
- ✅ **Users**: Users can only read/write their own profile

## Troubleshooting

**Still seeing permission errors?**
1. Make sure you clicked **"Publish"** after updating the rules
2. Wait 1-2 minutes for rules to propagate
3. Sign out and sign back in
4. Clear browser cache (Ctrl+Shift+Delete)

**Rules not saving?**
- Make sure you're in the correct Firebase project
- Check that you have "Owner" or "Editor" permissions on the project

## Security Notes

- These rules allow authenticated users to read/write their own data
- Only authenticated users can access protected collections
- The `authorizedRiders` collection is read-only for users (write is disabled)
- Users can only access their own carts and profiles

---

**After updating the rules, the rider dashboard should work!** 🚀

