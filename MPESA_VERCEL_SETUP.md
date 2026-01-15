# M-Pesa Credentials Setup for Vercel

## 🔑 Your M-Pesa Credentials

- **Consumer Key**: `WK45ADAtvR6BfjdcqACvhTeMbLWeGKZMjwTRbb75yI0uS36c`
- **Consumer Secret**: `1kGBVka9J9C2Xyf3iG4Bcs2bcuNzwGgPlOfN77FhCrFTZGu5qDUpHenMof1DXA88`

## ⚡ Quick Setup Steps

### Step 1: Add Environment Variables in Vercel

1. Go to [Vercel Dashboard](https://vercel.com/dashboard)
2. Select your project
3. Go to **Settings** → **Environment Variables**
4. Add each variable by clicking **Add**:

| Variable Name | Value | Environment |
|--------------|-------|-------------|
| `MPESA_CONSUMER_KEY` | `WK45ADAtvR6BfjdcqACvhTeMbLWeGKZMjwTRbb75yI0uS36c` | Production, Preview, Development |
| `MPESA_CONSUMER_SECRET` | `1kGBVka9J9C2Xyf3iG4Bcs2bcuNzwGgPlOfN77FhCrFTZGu5qDUpHenMof1DXA88` | Production, Preview, Development |
| `MPESA_SHORTCODE` | `YOUR_SHORTCODE` | Production, Preview, Development |
| `MPESA_PASSKEY` | `1738` | Production, Preview, Development |
| `MPESA_ENVIRONMENT` | `sandbox` (or `production`) | Production, Preview, Development |

**Important:**
- Replace `YOUR_SHORTCODE` with your actual M-Pesa shortcode
- Passkey is: `1738`
- Select all three environments (Production, Preview, Development) when adding each variable

### Step 2: Redeploy Your Application

After adding the environment variables:

1. Go to **Deployments** tab
2. Click the **⋯** (three dots) on the latest deployment
3. Click **Redeploy**
4. Or push a new commit to trigger automatic deployment

### Step 3: Configure Callback URL in M-Pesa Portal

1. Log in to [M-Pesa Developer Portal](https://developer.safaricom.co.ke/)
2. Go to **My Apps** → Select your app
3. Set the **Callback URL** to:
   ```
   https://your-site.vercel.app/api/mpesa-callback
   ```
   Replace `your-site.vercel.app` with your actual Vercel domain

### Step 4: Test the Integration

1. Visit your deployed site
2. Go to checkout page
3. Select "Pay with M-Pesa"
4. Enter a test phone number (for sandbox)
5. Complete the payment flow

## 🔍 Verify Environment Variables

To verify your environment variables are set correctly:

1. Go to **Settings** → **Environment Variables**
2. You should see all 5 variables listed
3. Make sure they're enabled for the correct environments

## 🐛 Troubleshooting

### "M-Pesa credentials not configured"
- **Solution**: Make sure you've added `MPESA_CONSUMER_KEY` and `MPESA_CONSUMER_SECRET` in Vercel
- **Solution**: Redeploy after adding environment variables

### "Failed to get access token"
- **Solution**: Double-check your Consumer Key and Secret are correct
- **Solution**: Make sure there are no extra spaces when copying the credentials

### "STK Push failed"
- **Solution**: Verify `MPESA_SHORTCODE` and `MPESA_PASSKEY` are set correctly
- **Solution**: Check that phone number is in correct format (254XXXXXXXXX)

## 📝 Notes

- Environment variables are case-sensitive
- Always redeploy after adding/updating environment variables
- For production, change `MPESA_ENVIRONMENT` to `production`
- Never commit credentials to Git (they're already in `.gitignore`)

---

**Need more help?** See the full setup guide: `MPESA_SETUP.md`

