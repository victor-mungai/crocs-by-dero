# M-Pesa Payment Integration Setup Guide

This guide will help you set up M-Pesa payment integration for your Footwear Kenya website.

## 📋 Prerequisites

1. **M-Pesa Developer Account**: Sign up at [https://developer.safaricom.co.ke/](https://developer.safaricom.co.ke/)
2. **M-Pesa App Credentials**: Consumer Key and Consumer Secret (you already have these)
3. **Shortcode**: Your M-Pesa Paybill or Till Number
4. **Passkey**: Your M-Pesa API passkey
5. **Vercel Account**: For hosting the serverless functions (or Netlify if using Netlify functions)

## 🔑 Your Current Credentials

- **Consumer Key**: `WK45ADAtvR6BfjdcqACvhTeMbLWeGKZMjwTRbb75yI0uS36c`
- **Consumer Secret**: `1kGBVka9J9C2Xyf3iG4Bcs2bcuNzwGgPlOfN77FhCrFTZGu5qDUpHenMof1DXA88`

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

### Step 2: Set Up Environment Variables on Vercel

1. Go to your Vercel project dashboard
2. Navigate to **Settings** → **Environment Variables**
3. Add the following variables:

```
MPESA_CONSUMER_KEY=WK45ADAtvR6BfjdcqACvhTeMbLWeGKZMjwTRbb75yI0uS36c
MPESA_CONSUMER_SECRET=1kGBVka9J9C2Xyf3iG4Bcs2bcuNzwGgPlOfN77FhCrFTZGu5qDUpHenMof1DXA88
MPESA_SHORTCODE=YOUR_SHORTCODE_HERE
MPESA_PASSKEY=1738
MPESA_ENVIRONMENT=sandbox
MPESA_CALLBACK_URL=https://your-site.vercel.app/api/mpesa-callback
```

**Important Notes:**
- Replace `YOUR_SHORTCODE_HERE` with your actual shortcode
- Passkey is: `1738`
- For **Sandbox** testing, use `MPESA_ENVIRONMENT=sandbox`
- For **Production**, use `MPESA_ENVIRONMENT=production`
- Replace `your-site.vercel.app` with your actual Vercel site URL
- Make sure to set these for **Production**, **Preview**, and **Development** environments if needed

### Step 3: Configure Callback URL in M-Pesa Portal

1. In your M-Pesa Developer Portal, go to your app settings
2. Set the **Callback URL** to:
   ```
   https://your-site.vercel.app/api/mpesa-callback
   ```
3. Save the settings

**Note:** If you're using Netlify instead of Vercel, use:
   ```
   https://your-site.netlify.app/.netlify/functions/mpesa-callback
   ```

### Step 4: Test the Integration

1. Deploy your site to Vercel (or push to GitHub if auto-deploy is enabled)
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
   - Update `MPESA_ENVIRONMENT=production` in Vercel environment variables
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
- Verify they're set in Vercel environment variables
- Make sure you've redeployed after adding the environment variables

### Issue: "STK Push failed"
- **Solution**: 
  - Verify `MPESA_SHORTCODE` and `MPESA_PASSKEY` are correct
  - Check that the phone number is in correct format (254XXXXXXXXX)
  - Ensure callback URL is configured in M-Pesa Portal

### Issue: "Payment not received"
- **Solution**:
  - Check Vercel function logs for errors (Vercel Dashboard → Functions → View logs)
  - Verify callback URL is accessible
  - Check M-Pesa transaction history in Developer Portal

### Issue: Functions not working locally
- **Solution**: 
  - Install Vercel CLI: `npm install -g vercel`
  - Run: `vercel dev` to test functions locally
  - Functions will be available at `http://localhost:3000/api/`
  - Or use Netlify CLI if using Netlify: `npm install -g netlify-cli` then `netlify dev`

## 📞 Support

If you encounter issues:
1. Check Vercel function logs: **Project dashboard** → **Deployments** → **Functions** → **View logs**
2. Check M-Pesa Developer Portal for transaction status
3. Verify all environment variables are set correctly in Vercel

## 🔐 Security Notes

- **Never commit credentials to Git**: They're already in `.gitignore`
- **Use environment variables**: Always use Vercel (or Netlify) environment variables for secrets
- **Rotate credentials**: If credentials are compromised, regenerate them in M-Pesa Portal

## ✅ Checklist

- [ ] M-Pesa Developer Account created
- [ ] Consumer Key and Secret obtained
- [ ] Shortcode and Passkey obtained
- [ ] Environment variables set in Vercel
- [ ] Callback URL configured in M-Pesa Portal
- [ ] Tested with sandbox environment
- [ ] Ready for production (if applicable)

---

**Need Help?** Check the M-Pesa Developer Documentation: [https://developer.safaricom.co.ke/](https://developer.safaricom.co.ke/)

