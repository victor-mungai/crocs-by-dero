# M-Pesa Integration - Quick Start

## ✅ What's Been Set Up

1. **M-Pesa Payment Functions** (in `netlify/functions/`):
   - `mpesa-token.js` - Generates OAuth access tokens
   - `mpesa-stk-push.js` - Initiates M-Pesa STK Push payments
   - `mpesa-callback.js` - Handles payment confirmations

2. **Updated Checkout Page**:
   - Added M-Pesa payment option
   - Phone number input field
   - Payment status messages
   - Seamless integration with existing WhatsApp checkout

## 🚀 Quick Setup (5 Minutes)

### Step 1: Get Your M-Pesa Credentials

You already have:
- ✅ Consumer Key: `WK45ADAtvR6BfjdcqACvhTeMbLWeGKZMjwTRbb75yI0uS36c`
- ✅ Consumer Secret: `1kGBVka9J9C2Xyf3iG4Bcs2bcuNzwGgPlOfN77FhCrFTZGu5qDUpHenMof1DXA88`

You still need:
- ⚠️ **Shortcode** (Paybill/Till Number) - Get from M-Pesa Developer Portal
- ✅ **Passkey**: `1738`

### Step 2: Set Environment Variables on Vercel

1. Go to **Vercel Dashboard** → Your Project → **Settings** → **Environment Variables**
2. Click **Add** and add these variables:

```
MPESA_CONSUMER_KEY = WK45ADAtvR6BfjdcqACvhTeMbLWeGKZMjwTRbb75yI0uS36c
MPESA_CONSUMER_SECRET = 1kGBVka9J9C2Xyf3iG4Bcs2bcuNzwGgPlOfN77FhCrFTZGu5qDUpHenMof1DXA88
MPESA_SHORTCODE = YOUR_SHORTCODE
MPESA_PASSKEY = 1738
MPESA_ENVIRONMENT = sandbox
```

3. Replace `YOUR_SHORTCODE` with your actual shortcode (Passkey is: `1738`)
4. Make sure to select the appropriate environments (Production, Preview, Development)
5. Click **Save** and redeploy your application

### Step 3: Deploy

1. Push your code to GitHub (if auto-deploy is enabled, Vercel will deploy automatically)
2. Or manually trigger a deployment in Vercel dashboard
3. Test the payment on your live site!

## 🧪 Testing

1. Go to checkout page
2. Select **"Pay with M-Pesa"**
3. Enter phone number (for sandbox, use test numbers from M-Pesa)
4. Click **"Pay with M-Pesa"**
5. Check your phone for STK Push prompt

## 📱 How Customers Use It

1. Customer adds items to cart
2. Goes to checkout
3. Selects **"Pay with M-Pesa"** option
4. Enters their M-Pesa registered phone number
5. Clicks **"Pay [Amount] with M-Pesa"**
6. Receives STK Push on their phone
7. Enters M-Pesa PIN
8. Payment is processed automatically
9. Order is confirmed!

## ⚙️ Production Setup

When ready for real payments:

1. Change `MPESA_ENVIRONMENT` to `production` in Vercel environment variables
2. Update callback URL in M-Pesa Developer Portal to your production URL
3. Redeploy your application
4. Test with small real transactions first

## 🆘 Need Help?

See the full setup guide: `MPESA_SETUP.md`

---

**That's it!** Your M-Pesa integration is ready to go! 🎉

