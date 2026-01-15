# Authorized Riders - Quick Reference

## Authorized Email Addresses

Add these two email addresses to the `authorizedRiders` collection in Firebase Firestore:

1. **prestonmugo33@gmail.com**
2. **derroreacts@gmail.com**

## Quick Setup Steps

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Select project: **crocs-by-dero**
3. Go to **Firestore Database** → **Data**
4. Create collection: **`authorizedRiders`** (if it doesn't exist)

### Add First Rider:

**Document 1:**
- **Document ID:** `preston` (or auto-generate)
- **Fields:**
  - `email`: `prestonmugo33@gmail.com` (type: string)
  - `name`: `Preston Mugo` (type: string, optional)
  - `createdAt`: (timestamp, optional)

### Add Second Rider:

**Document 2:**
- **Document ID:** `derro` (or auto-generate)
- **Fields:**
  - `email`: `derroreacts@gmail.com` (type: string)
  - `name`: `Derro` (type: string, optional)
  - `createdAt`: (timestamp, optional)

## Minimum Required

For each rider, you only need:
- **Field:** `email`
- **Type:** `string`
- **Value:** The email address (e.g., `prestonmugo33@gmail.com`)

The `name` and `createdAt` fields are optional but recommended.

## After Adding

Once these emails are added to Firestore:
- Users with these emails can sign in with Google
- They will be able to access `/rider-dashboard`
- Other users will see "Access Denied"

