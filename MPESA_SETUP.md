# M-Pesa Payment Integration Setup Guide

This guide will help you set up M-Pesa payment integration for your Footwear Kenya website.

## 📋 Prerequisites

1. **M-Pesa Developer Account**: Sign up at [https://developer.safaricom.co.ke/](https://developer.safaricom.co.ke/)
2. **M-Pesa App Credentials**: Consumer Key and Consumer Secret (you already have these)
3. **Shortcode**: Your M-Pesa Paybill or Till Number
4. **Passkey**: Your M-Pesa API passkey
5. **Netlify Account**: For hosting the serverless functions

## 🔑 Your Current Credentials

- **Consumer Key**: `7bC3y49xfxnBoPsdia2H3PuAKgqjJA6dWelwpTcfGAmIWyQI`
- **Consumer Secret**: `OCadC4BTlZxhAGO18ZcNmNyOMsaRA9wIlxhYP8BnxqX5dyE1kyqTtyeHpmrW0Jrp`

## ⚙️ Required M-Pesa Settings

You'll need to get these from your M-Pesa Developer Portal:

1. **Shortcode** (Paybill or Till Number)
2. **Passkey** (API Passkey from M-Pesa Developer Portal)
3. **Environment** (Sandbox or Production)

## 🚀 Setup Steps

### Step 1: Get Your M-Pesa Passkey and Shortcode

1. Log in to [M-Pesa Developer Portal](https://developer.safaricom.co.ke/)
2. Go to **My Apps** → Select your app
3. Copy the following:
   - **Shortcode** (Paybill/Till Number)
   - **Passkey** (Under API Credentials)

### Step 2: Set Up Environment Variables on Netlify

1. Go to your Netlify site dashboard
2. Navigate to **Site settings** → **Environment variables**
3. Add the following variables:

```
MPESA_CONSUMER_KEY=7bC3y49xfxnBoPsdia2H3PuAKgqjJA6dWelwpTcfGAmIWyQI
MPESA_CONSUMER_SECRET=OCadC4BTlZxhAGO18ZcNmNyOMsaRA9wIlxhYP8BnxqX5dyE1kyqTtyeHpmrW0Jrp
MPESA_SHORTCODE=YOUR_SHORTCODE_HERE
MPESA_PASSKEY=YOUR_PASSKEY_HERE
MPESA_ENVIRONMENT=sandbox
MPESA_CALLBACK_URL=https://your-site.netlify.app/.netlify/functions/mpesa-callback
```

**Important Notes:**
- Replace `YOUR_SHORTCODE_HERE` with your actual shortcode
- Replace `YOUR_PASSKEY_HERE` with your actual passkey
- For **Sandbox** testing, use `MPESA_ENVIRONMENT=sandbox`
- For **Production**, use `MPESA_ENVIRONMENT=production`
- Replace `your-site.netlify.app` with your actual Netlify site URL

### Step 3: Configure Callback URL in M-Pesa Portal

1. In your M-Pesa Developer Portal, go to your app settings
2. Set the **Callback URL** to:
   ```
   https://your-site.netlify.app/.netlify/functions/mpesa-callback
   ```
3. Save the settings

### Step 4: Test the Integration

1. Deploy your site to Netlify
2. Go to the checkout page
3. Select "Pay with M-Pesa"
4. Enter a test phone number (for sandbox, use the test numbers from M-Pesa)
5. Click "Pay with M-Pesa"
6. Check your phone for the STK Push prompt

## 🧪 Sandbox Testing

For sandbox testing, you can use these test numbers:
- **Phone**: 254708374149 (or any test number provided by M-Pesa)
- **Amount**: Any amount (sandbox doesn't charge real money)

## 🔒 Production Setup

When ready for production:

1. **Switch to Production Environment**:
   - Update `MPESA_ENVIRONMENT=production` in Netlify environment variables
   - Update the callback URL in M-Pesa Portal to your production URL

2. **Update API URLs**:
   - The functions automatically switch between sandbox and production URLs based on `MPESA_ENVIRONMENT`

3. **Test with Real Transactions**:
   - Use real M-Pesa registered phone numbers
   - Test with small amounts first

## 📱 How It Works

1. **Customer selects M-Pesa payment** on checkout
2. **Enters phone number** registered with M-Pesa
3. **Clicks "Pay with M-Pesa"**
4. **STK Push is sent** to their phone
5. **Customer enters PIN** on their phone
6. **Payment is processed** and callback is received
7. **Order is confirmed** and cart is cleared

## 🐛 Troubleshooting

### Issue: "Failed to get access token"
- **Solution**: Check that `MPESA_CONSUMER_KEY` and `MPESA_CONSUMER_SECRET` are correct
- Verify they're set in Netlify environment variables

### Issue: "STK Push failed"
- **Solution**: 
  - Verify `MPESA_SHORTCODE` and `MPESA_PASSKEY` are correct
  - Check that the phone number is in correct format (254XXXXXXXXX)
  - Ensure callback URL is configured in M-Pesa Portal

### Issue: "Payment not received"
- **Solution**:
  - Check Netlify function logs for errors
  - Verify callback URL is accessible
  - Check M-Pesa transaction history in Developer Portal

### Issue: Functions not working locally
- **Solution**: 
  - Install Netlify CLI: `npm install -g netlify-cli`
  - Run: `netlify dev` to test functions locally
  - Functions will be available at `http://localhost:8888/.netlify/functions/`

## 📞 Support

If you encounter issues:
1. Check Netlify function logs: **Site dashboard** → **Functions** → **View logs**
2. Check M-Pesa Developer Portal for transaction status
3. Verify all environment variables are set correctly

## 🔐 Security Notes

- **Never commit credentials to Git**: They're already in `.gitignore`
- **Use environment variables**: Always use Netlify environment variables for secrets
- **Rotate credentials**: If credentials are compromised, regenerate them in M-Pesa Portal

## ✅ Checklist

- [ ] M-Pesa Developer Account created
- [ ] Consumer Key and Secret obtained
- [ ] Shortcode and Passkey obtained
- [ ] Environment variables set in Netlify
- [ ] Callback URL configured in M-Pesa Portal
- [ ] Tested with sandbox environment
- [ ] Ready for production (if applicable)

---

**Need Help?** Check the M-Pesa Developer Documentation: [https://developer.safaricom.co.ke/](https://developer.safaricom.co.ke/)

