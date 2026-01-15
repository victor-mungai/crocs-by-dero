# M-Pesa Payment Troubleshooting Guide

## 🔴 Common Error: "Failed to get access token" (400 Bad Request)

This error occurs when the M-Pesa OAuth authentication fails. Here's how to fix it:

### ✅ Step 1: Verify Environment Variables in Vercel

1. Go to [Vercel Dashboard](https://vercel.com/dashboard)
2. Select your project
3. Go to **Settings** → **Environment Variables**
4. Verify these variables exist and are correct:

| Variable | Expected Value | Status |
|----------|---------------|--------|
| `MPESA_CONSUMER_KEY` | `WK45ADAtvR6BfjdcqACvhTeMbLWeGKZMjwTRbb75yI0uS36c` | ✅ Check |
| `MPESA_CONSUMER_SECRET` | `1kGBVka9J9C2Xyf3iG4Bcs2bcuNzwGgPlOfN77FhCrFTZGu5qDUpHenMof1DXA88` | ✅ Check |
| `MPESA_SHORTCODE` | Your shortcode (e.g., `6151127`) | ✅ Check |
| `MPESA_PASSKEY` | `1738` | ✅ Check |
| `MPESA_ENVIRONMENT` | `sandbox` (or `production`) | ✅ Check |

**Important:**
- Make sure there are **no extra spaces** before or after the values
- Make sure all variables are enabled for **Production, Preview, and Development**
- Variables are **case-sensitive**

### ✅ Step 2: Redeploy After Adding Variables

**Critical:** Environment variables are only loaded during deployment. After adding/updating variables:

1. Go to **Deployments** tab
2. Click **⋯** (three dots) on the latest deployment
3. Click **Redeploy**
4. Wait for deployment to complete

### ✅ Step 3: Check Vercel Function Logs

1. Go to **Deployments** → Select your latest deployment
2. Click on **Functions** tab
3. Click on `api/mpesa-stk-push`
4. Check the logs for detailed error messages

Look for:
- "M-Pesa credentials missing" → Variables not set
- "M-Pesa OAuth error" → Credentials incorrect or invalid

### ✅ Step 4: Verify Credentials in M-Pesa Portal

1. Log in to [M-Pesa Developer Portal](https://developer.safaricom.co.ke/)
2. Go to **My Apps** → Select your app
3. Verify:
   - Consumer Key matches what you have in Vercel
   - Consumer Secret matches what you have in Vercel
   - App is in the correct environment (Sandbox/Production)

### ✅ Step 5: Test Environment Configuration

Make sure `MPESA_ENVIRONMENT` matches your M-Pesa app:
- If your app is in **Sandbox**, use: `MPESA_ENVIRONMENT=sandbox`
- If your app is in **Production**, use: `MPESA_ENVIRONMENT=production`

**Common Mistake:** Using production credentials with `sandbox` environment or vice versa.

---

## 🔴 Error: "Failed to load resource: 400" for `api/mpesa-stk-push`

This means the API endpoint is returning a 400 error. Check:

1. **Request Format:** Make sure the request body includes:
   ```json
   {
     "phoneNumber": "254712345678",
     "amount": 1000,
     "accountReference": "ORDER123",
     "transactionDesc": "Order description"
   }
   ```

2. **Phone Number Format:** Must be in format `254XXXXXXXXX` (Kenyan format)

3. **Amount:** Must be a positive number

---

## 🔴 Error: "M-Pesa credentials not configured"

**Solution:**
- Environment variables are not set in Vercel
- Variables are not enabled for the current environment
- You haven't redeployed after adding variables

**Fix:**
1. Add all required environment variables in Vercel
2. Enable them for all environments (Production, Preview, Development)
3. Redeploy your application

---

## 🔴 Error: "M-Pesa shortcode or passkey not configured"

**Solution:**
- `MPESA_SHORTCODE` or `MPESA_PASSKEY` is missing

**Fix:**
1. Add `MPESA_SHORTCODE` with your till number (e.g., `6151127`)
2. Add `MPESA_PASSKEY` with value `1738`
3. Redeploy

---

## 🟡 Testing Locally

If testing locally, you need to:

1. **Install Vercel CLI:**
   ```bash
   npm install -g vercel
   ```

2. **Link your project:**
   ```bash
   vercel link
   ```

3. **Pull environment variables:**
   ```bash
   vercel env pull .env.local
   ```

4. **Run dev server:**
   ```bash
   vercel dev
   ```

5. **Or use local .env file:**
   Create `.env.local` in project root:
   ```
   MPESA_CONSUMER_KEY=WK45ADAtvR6BfjdcqACvhTeMbLWeGKZMjwTRbb75yI0uS36c
   MPESA_CONSUMER_SECRET=1kGBVka9J9C2Xyf3iG4Bcs2bcuNzwGgPlOfN77FhCrFTZGu5qDUpHenMof1DXA88
   MPESA_SHORTCODE=6151127
   MPESA_PASSKEY=1738
   MPESA_ENVIRONMENT=sandbox
   ```

---

## ✅ Quick Checklist

Before testing M-Pesa payments, verify:

- [ ] All 5 environment variables are set in Vercel
- [ ] Variables are enabled for Production, Preview, and Development
- [ ] You've redeployed after adding/updating variables
- [ ] Consumer Key and Secret match M-Pesa Developer Portal
- [ ] `MPESA_ENVIRONMENT` matches your M-Pesa app environment
- [ ] Shortcode and Passkey are correct
- [ ] Callback URL is configured in M-Pesa Portal

---

## 📞 Still Having Issues?

1. **Check Vercel Function Logs:**
   - Go to Deployments → Functions → View logs
   - Look for detailed error messages

2. **Check M-Pesa Developer Portal:**
   - Verify your app status
   - Check transaction history
   - Verify callback URL is set

3. **Test with M-Pesa Test Credentials:**
   - Use sandbox test numbers
   - Verify sandbox environment is working

4. **Common Issues:**
   - Credentials copied with extra spaces → Remove spaces
   - Wrong environment → Match `MPESA_ENVIRONMENT` with your app
   - Not redeployed → Always redeploy after adding variables
   - Variables not enabled for all environments → Enable for all

---

**Need More Help?** See the full setup guide: `MPESA_SETUP.md`

