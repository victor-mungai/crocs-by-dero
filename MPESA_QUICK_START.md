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
- ✅ Consumer Key: `7bC3y49xfxnBoPsdia2H3PuAKgqjJA6dWelwpTcfGAmIWyQI`
- ✅ Consumer Secret: `OCadC4BTlZxhAGO18ZcNmNyOMsaRA9wIlxhYP8BnxqX5dyE1kyqTtyeHpmrW0Jrp`

You still need:
- ⚠️ **Shortcode** (Paybill/Till Number) - Get from M-Pesa Developer Portal
- ⚠️ **Passkey** - Get from M-Pesa Developer Portal

### Step 2: Set Environment Variables on Netlify

1. Go to **Netlify Dashboard** → Your Site → **Site settings** → **Environment variables**
2. Click **Add variable** and add these:

```
MPESA_CONSUMER_KEY = 7bC3y49xfxnBoPsdia2H3PuAKgqjJA6dWelwpTcfGAmIWyQI
MPESA_CONSUMER_SECRET = OCadC4BTlZxhAGO18ZcNmNyOMsaRA9wIlxhYP8BnxqX5dyE1kyqTtyeHpmrW0Jrp
MPESA_SHORTCODE = YOUR_SHORTCODE
MPESA_PASSKEY = YOUR_PASSKEY
MPESA_ENVIRONMENT = sandbox
```

3. Replace `YOUR_SHORTCODE` and `YOUR_PASSKEY` with your actual values

### Step 3: Deploy

1. Push your code to GitHub
2. Netlify will automatically deploy
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

1. Change `MPESA_ENVIRONMENT` to `production` in Netlify
2. Update callback URL in M-Pesa Developer Portal to your production URL
3. Test with small real transactions first

## 🆘 Need Help?

See the full setup guide: `MPESA_SETUP.md`

---

**That's it!** Your M-Pesa integration is ready to go! 🎉

