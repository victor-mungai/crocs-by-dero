# Setting Up Environment Variables in Vercel

## 🎯 Quick Guide

### Option 1: Add Environment Variables in Vercel Dashboard (Recommended)

1. **Go to Vercel Dashboard**
   - Visit [https://vercel.com/dashboard](https://vercel.com/dashboard)
   - Select your project

2. **Navigate to Environment Variables**
   - Click on **Settings** (top menu)
   - Click on **Environment Variables** (left sidebar)

3. **Add Each Variable**
   - Click **Add New** button
   - Enter the variable name (e.g., `MPESA_CONSUMER_KEY`)
   - Enter the value
   - Select which environments to apply to:
     - ✅ Production
     - ✅ Preview
     - ✅ Development
   - Click **Save**

4. **Add All Required Variables**
   ```
   MPESA_CONSUMER_KEY=WK45ADAtvR6BfjdcqACvhTeMbLWeGKZMjwTRbb75yI0uS36c
   MPESA_CONSUMER_SECRET=1kGBVka9J9C2Xyf3iG4Bcs2bcuNzwGgPlOfN77FhCrFTZGu5qDUpHenMof1DXA88
   MPESA_SHORTCODE=YOUR_SHORTCODE
   MPESA_PASSKEY=YOUR_PASSKEY
   MPESA_ENVIRONMENT=sandbox
   ```

5. **Redeploy**
   - After adding variables, go to **Deployments**
   - Click **⋯** (three dots) on latest deployment
   - Click **Redeploy**

---

### Option 2: Use Vercel CLI (For Bulk Import)

1. **Install Vercel CLI**
   ```bash
   npm install -g vercel
   ```

2. **Login to Vercel**
   ```bash
   vercel login
   ```

3. **Link Your Project**
   ```bash
   vercel link
   ```

4. **Pull Environment Variables** (if you want to sync from Vercel to local)
   ```bash
   vercel env pull .env.local
   ```

5. **Push Environment Variables** (from local .env file to Vercel)
   ```bash
   vercel env add MPESA_CONSUMER_KEY
   vercel env add MPESA_CONSUMER_SECRET
   # ... repeat for each variable
   ```

---

### Option 3: Create Local .env File (For Development)

1. **Create `.env.local` file** in your project root:
   ```bash
   # M-Pesa Credentials
   MPESA_CONSUMER_KEY=WK45ADAtvR6BfjdcqACvhTeMbLWeGKZMjwTRbb75yI0uS36c
   MPESA_CONSUMER_SECRET=1kGBVka9J9C2Xyf3iG4Bcs2bcuNzwGgPlOfN77FhCrFTZGu5qDUpHenMof1DXA88
   MPESA_SHORTCODE=6151127
   MPESA_PASSKEY=1738
   MPESA_ENVIRONMENT=sandbox
   
   # Firebase (if needed)
   VITE_FIREBASE_API_KEY=your_firebase_api_key
   VITE_FIREBASE_AUTH_DOMAIN=your_auth_domain
   # ... other Firebase variables
   ```

2. **Important Notes:**
   - `.env.local` is already in `.gitignore` (won't be committed)
   - This file is for **local development only**
   - You still need to add variables in Vercel for production
   - Vite requires `VITE_` prefix for client-side variables

---

## 📋 Step-by-Step: Adding Variables in Vercel Dashboard

### Step 1: Access Environment Variables
1. Go to [vercel.com/dashboard](https://vercel.com/dashboard)
2. Click on your project name
3. Click **Settings** (top navigation)
4. Click **Environment Variables** (left sidebar)

### Step 2: Add M-Pesa Consumer Key
1. Click **Add New**
2. **Key**: `MPESA_CONSUMER_KEY`
3. **Value**: `WK45ADAtvR6BfjdcqACvhTeMbLWeGKZMjwTRbb75yI0uS36c`
4. Select environments: ✅ Production, ✅ Preview, ✅ Development
5. Click **Save**

### Step 3: Add M-Pesa Consumer Secret
1. Click **Add New**
2. **Key**: `MPESA_CONSUMER_SECRET`
3. **Value**: `1kGBVka9J9C2Xyf3iG4Bcs2bcuNzwGgPlOfN77FhCrFTZGu5qDUpHenMof1DXA88`
4. Select environments: ✅ Production, ✅ Preview, ✅ Development
5. Click **Save**

### Step 4: Add M-Pesa Shortcode
1. Click **Add New**
2. **Key**: `MPESA_SHORTCODE`
3. **Value**: `6151127`
4. Select environments: ✅ Production, ✅ Preview, ✅ Development
5. Click **Save**

### Step 5: Add M-Pesa Passkey
1. Click **Add New**
2. **Key**: `MPESA_PASSKEY`
3. **Value**: `1738`
4. Select environments: ✅ Production, ✅ Preview, ✅ Development
5. Click **Save**

### Step 6: Add M-Pesa Environment
1. Click **Add New**
2. **Key**: `MPESA_ENVIRONMENT`
3. **Value**: `sandbox` (or `production` when ready)
4. Select environments: ✅ Production, ✅ Preview, ✅ Development
5. Click **Save**

### Step 7: Verify Variables
- You should see all variables listed
- Each should show which environments they're enabled for

### Step 8: Redeploy
- Go to **Deployments** tab
- Click **⋯** on latest deployment
- Click **Redeploy**
- Or push a new commit to trigger auto-deploy

---

## 🔍 Verifying Environment Variables

### In Vercel Dashboard:
1. Go to **Settings** → **Environment Variables**
2. All variables should be listed
3. Check that they're enabled for the right environments

### In Your Code:
Environment variables are accessed via `process.env.VARIABLE_NAME` in serverless functions.

Example in `api/mpesa-stk-push.js`:
```javascript
const consumerKey = process.env.MPESA_CONSUMER_KEY
const consumerSecret = process.env.MPESA_CONSUMER_SECRET
```

---

## ⚠️ Important Notes

1. **Never commit `.env` files to Git**
   - `.env.local` is already in `.gitignore`
   - Always use Vercel dashboard for production secrets

2. **Vite Environment Variables**
   - Client-side variables need `VITE_` prefix
   - Example: `VITE_FIREBASE_API_KEY`
   - Server-side (API routes) don't need prefix

3. **Redeploy After Changes**
   - Environment variables are only loaded during build
   - Always redeploy after adding/updating variables

4. **Environment-Specific Variables**
   - You can set different values for Production, Preview, and Development
   - Useful for testing with different credentials

---

## 🐛 Troubleshooting

### Variables not working?
- ✅ Check spelling (case-sensitive)
- ✅ Verify variables are enabled for the right environment
- ✅ Redeploy after adding variables
- ✅ Check Vercel function logs for errors

### Can't see variables in code?
- ✅ Make sure you're accessing them correctly: `process.env.VARIABLE_NAME`
- ✅ For Vite client-side: use `import.meta.env.VITE_VARIABLE_NAME`
- ✅ Serverless functions can access all `process.env` variables

---

## 📚 Related Files

- `MPESA_VERCEL_SETUP.md` - M-Pesa specific setup
- `MPESA_SETUP.md` - Complete M-Pesa integration guide
- `.gitignore` - Ensures .env files aren't committed

---

**Need Help?** Check Vercel's official docs: [https://vercel.com/docs/concepts/projects/environment-variables](https://vercel.com/docs/concepts/projects/environment-variables)

