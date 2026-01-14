# Firebase Setup Instructions

## Fixing "auth/unauthorized-domain" Error

The error `Firebase: Error (auth/unauthorized-domain)` occurs when your domain is not authorized in Firebase Console for Google Sign-In.

### Steps to Fix:

1. **Go to Firebase Console**
   - Visit: https://console.firebase.google.com/
   - Select your project: `crocs-by-dero`

2. **Navigate to Authentication Settings**
   - Click on **Authentication** in the left sidebar
   - Click on the **Settings** tab
   - Scroll down to **Authorized domains**

3. **Add Your Domain**
   - Click **Add domain**
   - Add the following domains:
     - `localhost` (for local development)
     - Your Vercel domain (e.g., `your-app.vercel.app`)
     - Your custom domain (if you have one)
     - `127.0.0.1` (for local development)

4. **Save Changes**
   - Click **Add** for each domain
   - Changes take effect immediately

### Common Domains to Add:

- `localhost`
- `127.0.0.1`
- `your-app.vercel.app` (replace with your actual Vercel domain)
- `your-custom-domain.com` (if applicable)

### Note:
- Firebase automatically includes `localhost` for local development, but you may need to add it explicitly
- For production, make sure your deployed domain (Vercel URL) is added
- The domain must match exactly (including `https://` vs `http://`)

### Testing:
After adding the domains, try signing in again. The error should be resolved.

