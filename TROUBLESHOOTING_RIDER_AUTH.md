# 🔧 Troubleshooting Rider Dashboard Authorization

If you're still seeing "Access Denied" after setting up authorized riders, follow these steps:

## Step 1: Verify Firestore Data

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Select your project: **crocs-by-dero**
3. Go to **Firestore Database** → **Data**
4. Check the **`authorizedRiders`** collection exists
5. Verify you have documents with these exact emails (lowercase):
   - `prestonmugo33@gmail.com`
   - `derroreacts@gmail.com`

### Check Document Structure

Each document should have:
- **Field:** `email` (type: string)
- **Value:** The email address in **lowercase** (e.g., `prestonmugo33@gmail.com`)

**Important:** The email field must be exactly:
- ✅ `prestonmugo33@gmail.com` (lowercase)
- ✅ `derroreacts@gmail.com` (lowercase)
- ❌ NOT `PrestonMugo33@gmail.com` (mixed case)
- ❌ NOT ` prestonmugo33@gmail.com ` (with spaces)

## Step 2: Verify Firestore Security Rules

1. Go to **Firestore Database** → **Rules**
2. Make sure you have this rule for `authorizedRiders`:

```javascript
match /authorizedRiders/{riderId} {
  allow read: if request.auth != null;
  allow write: if false;
}
```

3. Click **"Publish"** if you made changes
4. Wait 1-2 minutes for rules to propagate

## Step 3: Check Browser Console

1. Open your app in the browser
2. Press **F12** to open Developer Tools
3. Go to the **Console** tab
4. Try to access `/rider-dashboard`
5. Look for these log messages:

```
🔍 Checking authorization for email: prestonmugo33@gmail.com
📊 Authorization query result: { ... }
```

### Common Console Errors:

**Error: "Missing or insufficient permissions"**
- **Fix:** Update Firestore security rules (see Step 2)

**Error: "The query requires an index"**
- **Fix:** Click the link in the error to create the index, or use the fallback method (already implemented)

**No error, but "found: false"**
- **Fix:** Check that the email in Firestore matches exactly (see Step 1)

## Step 4: Verify User Authentication

1. Make sure you're signed in with Google
2. Check the console for your user email:
   ```
   🔐 Checking authorization for user: { email: "prestonmugo33@gmail.com", ... }
   ```

3. If the email doesn't match, sign out and sign back in

## Step 5: Test with Browser Console

Open the browser console and run:

```javascript
// Check if you're authenticated
import { getAuth } from 'firebase/auth'
const auth = getAuth()
console.log('Current user:', auth.currentUser?.email)

// Manually check authorization
import { isRiderAuthorized } from './src/firebase/riderAuthService'
isRiderAuthorized('prestonmugo33@gmail.com').then(result => {
  console.log('Authorization check:', result)
})
```

## Step 6: Verify Email Format

The authorization check converts emails to lowercase and trims spaces. Make sure:

1. Your Firestore documents have emails in lowercase
2. No extra spaces before/after the email
3. The email matches exactly what Google Sign-In returns

## Quick Fix Checklist

- [ ] `authorizedRiders` collection exists in Firestore
- [ ] Documents have `email` field (lowercase)
- [ ] Firestore rules allow `read` for authenticated users
- [ ] Rules are published (clicked "Publish")
- [ ] Signed in with correct Google account
- [ ] Browser console shows no permission errors
- [ ] Waited 1-2 minutes after updating rules

## Still Not Working?

1. **Clear browser cache:**
   - Press `Ctrl+Shift+Delete` (Windows) or `Cmd+Shift+Delete` (Mac)
   - Clear cached images and files
   - Reload the page

2. **Sign out and sign back in:**
   - This refreshes the authentication token
   - Sometimes needed after updating Firestore rules

3. **Check Firestore Rules Syntax:**
   - Make sure there are no syntax errors
   - Rules should be valid JavaScript

4. **Verify Collection Name:**
   - Collection must be exactly: `authorizedRiders` (case-sensitive)
   - Not `authorized_riders` or `AuthorizedRiders`

5. **Check Network Tab:**
   - Open Developer Tools → Network tab
   - Look for failed requests to Firestore
   - Check the error response

## Debug Information to Share

If you need help, provide:
1. Browser console logs (copy all messages)
2. Network tab errors (if any)
3. Screenshot of Firestore `authorizedRiders` collection
4. Screenshot of Firestore security rules
5. The email you're trying to use

---

**After following these steps, the authorization should work!** 🚀

