# Rider Dashboard Authorization Setup

The Rider Dashboard is now restricted to authorized email addresses only. Only users with authorized emails can access the dashboard.

## How It Works

1. Users must sign in with Google
2. The system checks if their email is in the `authorizedRiders` collection in Firestore
3. If authorized, they can access the dashboard
4. If not authorized, they see an "Access Denied" message

## Setting Up Authorized Riders

### Option 1: Add via Firebase Console (Recommended)

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Select your project: **crocs-by-dero**
3. Go to **Firestore Database** → **Data**
4. Create a collection called **`authorizedRiders`** (if it doesn't exist)
5. Add documents with the following structure:
   - **Document ID:** (auto-generated or custom)
   - **Fields:**
     - `email`: `rider@example.com` (the rider's email address - lowercase)
     - `name`: `John Doe` (optional, rider's name)
     - `createdAt`: `2024-01-01T00:00:00.000Z` (timestamp)

### Option 2: Add via Code (For Developers)

You can use the `addAuthorizedRider` function in `src/firebase/riderAuthService.js`:

```javascript
import { addAuthorizedRider } from './src/firebase/riderAuthService'

// Add a rider
addAuthorizedRider('rider@example.com', 'John Doe')
  .then(() => console.log('Rider authorized!'))
  .catch(error => console.error('Error:', error))
```

## Example: Adding Multiple Riders

In Firebase Console, add multiple documents to the `authorizedRiders` collection:

**Document 1:**
- `email`: `prestonmugo33@gmail.com`
- `name`: `Preston Mugo` (optional)
- `createdAt`: (current timestamp, optional)

**Document 2:**
- `email`: `derroreacts@gmail.com`
- `name`: `Derro` (optional)
- `createdAt`: (current timestamp, optional)

## Removing Authorized Riders

### Via Firebase Console:
1. Go to Firestore Database → Data
2. Open the `authorizedRiders` collection
3. Delete the document for the rider you want to remove

### Via Code:
```javascript
import { removeAuthorizedRider } from './src/firebase/riderAuthService'

removeAuthorizedRider('rider@example.com')
  .then(() => console.log('Rider removed!'))
  .catch(error => console.error('Error:', error))
```

## Security Notes

- Email addresses are stored in lowercase for consistent matching
- Only users with emails in the `authorizedRiders` collection can access the dashboard
- Users will see an "Access Denied" message if they try to access without authorization
- The authorization check happens every time the dashboard is accessed

## Firestore Security Rules

Make sure your Firestore rules allow reading the `authorizedRiders` collection:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Authorized riders - only authenticated users can read
    match /authorizedRiders/{riderId} {
      allow read: if request.auth != null;
      allow write: if false; // Only via console or admin functions
    }
    
    // Other rules...
  }
}
```

## Testing

1. Add a test email to `authorizedRiders` collection
2. Sign in with Google using that email
3. Navigate to `/rider-dashboard`
4. You should see the dashboard (not "Access Denied")

## Troubleshooting

**"Access Denied" even after adding email:**
- Make sure the email in Firestore matches exactly (case-insensitive, but stored in lowercase)
- Check that the user is signed in with Google
- Verify the document exists in the `authorizedRiders` collection

**Can't add documents:**
- Check Firestore security rules
- Make sure you have write permissions

