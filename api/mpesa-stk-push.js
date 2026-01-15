// M-Pesa STK Push Initiation for Vercel
// This function initiates an M-Pesa STK Push payment request

export default async function handler(req, res) {
  // Only allow POST requests
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  try {
    const { phoneNumber, amount, accountReference, transactionDesc } = req.body

    // Validate input
    if (!phoneNumber || !amount || !accountReference) {
      return res.status(400).json({ 
        error: 'Missing required fields: phoneNumber, amount, accountReference' 
      })
    }

    // Format phone number (remove + and ensure it starts with 254)
    let formattedPhone = phoneNumber.replace(/\s+/g, '').replace(/^\+/, '')
    if (formattedPhone.startsWith('0')) {
      formattedPhone = '254' + formattedPhone.substring(1)
    } else if (!formattedPhone.startsWith('254')) {
      formattedPhone = '254' + formattedPhone
    }

    // Validate amount (must be positive)
    const amountNum = parseFloat(amount)
    if (isNaN(amountNum) || amountNum <= 0) {
      return res.status(400).json({ error: 'Invalid amount' })
    }

    // Get access token first
    const consumerKey = process.env.MPESA_CONSUMER_KEY
    const consumerSecret = process.env.MPESA_CONSUMER_SECRET

    // Enhanced error logging
    if (!consumerKey || !consumerSecret) {
      console.error('M-Pesa credentials missing:', {
        hasConsumerKey: !!consumerKey,
        hasConsumerSecret: !!consumerSecret,
        envKeys: Object.keys(process.env).filter(k => k.includes('MPESA'))
      })
      return res.status(500).json({ 
        error: 'M-Pesa credentials not configured',
        message: 'Please ensure MPESA_CONSUMER_KEY and MPESA_CONSUMER_SECRET are set in Vercel environment variables'
      })
    }

    // M-Pesa OAuth URL
    const authUrl = process.env.MPESA_ENVIRONMENT === 'production'
      ? 'https://api.safaricom.co.ke/oauth/v1/generate?grant_type=client_credentials'
      : 'https://sandbox.safaricom.co.ke/oauth/v1/generate?grant_type=client_credentials'

    // Create Basic Auth header
    const auth = Buffer.from(`${consumerKey}:${consumerSecret}`).toString('base64')

    const tokenResponse = await fetch(authUrl, {
      method: 'GET',
      headers: {
        'Authorization': `Basic ${auth}`
      }
    })

    if (!tokenResponse.ok) {
      const errorText = await tokenResponse.text()
      console.error('M-Pesa OAuth error:', {
        status: tokenResponse.status,
        statusText: tokenResponse.statusText,
        error: errorText,
        authUrl: authUrl,
        hasCredentials: !!(consumerKey && consumerSecret),
        environment: process.env.MPESA_ENVIRONMENT || 'not set'
      })
      return res.status(tokenResponse.status).json({ 
        error: 'Failed to get access token',
        details: errorText,
        message: tokenResponse.status === 400 
          ? 'Invalid credentials. Please check your Consumer Key and Secret in Vercel environment variables.'
          : 'Authentication failed. Please check your M-Pesa credentials and environment settings.'
      })
    }

    const tokenData = await tokenResponse.json()
    const access_token = tokenData.access_token

    // M-Pesa STK Push URL
    const stkPushUrl = process.env.MPESA_ENVIRONMENT === 'production'
      ? 'https://api.safaricom.co.ke/mpesa/stkpush/v1/processrequest'
      : 'https://sandbox.safaricom.co.ke/mpesa/stkpush/v1/processrequest'

    // Get shortcode and passkey from environment
    const shortCode = process.env.MPESA_SHORTCODE
    const passKey = process.env.MPESA_PASSKEY
    const baseUrl = process.env.VERCEL_URL 
      ? `https://${process.env.VERCEL_URL}` 
      : process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'
    const callbackUrl = process.env.MPESA_CALLBACK_URL || `${baseUrl}/api/mpesa-callback`

    if (!shortCode || !passKey) {
      return res.status(500).json({ error: 'M-Pesa shortcode or passkey not configured' })
    }

    // Generate timestamp (YYYYMMDDHHmmss)
    const timestamp = new Date().toISOString().replace(/[-:T]/g, '').split('.')[0]
    
    // Generate password (Base64 encoded shortcode + passkey + timestamp)
    const password = Buffer.from(`${shortCode}${passKey}${timestamp}`).toString('base64')

    // STK Push request payload
    const stkPushPayload = {
      BusinessShortCode: shortCode,
      Password: password,
      Timestamp: timestamp,
      TransactionType: 'CustomerPayBillOnline',
      Amount: Math.round(amountNum), // M-Pesa requires integer amount
      PartyA: formattedPhone,
      PartyB: shortCode,
      PhoneNumber: formattedPhone,
      CallBackURL: callbackUrl,
      AccountReference: accountReference.substring(0, 12), // Max 12 characters
      TransactionDesc: transactionDesc || 'Footwear Kenya Purchase'
    }

    // Make STK Push request
    const stkResponse = await fetch(stkPushUrl, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${access_token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(stkPushPayload)
    })

    const stkData = await stkResponse.json()

    if (!stkResponse.ok) {
      console.error('M-Pesa STK Push error:', stkData)
      return res.status(stkResponse.status).json({ 
        error: 'STK Push failed',
        details: stkData 
      })
    }

    // Set CORS headers
    res.setHeader('Access-Control-Allow-Origin', '*')
    res.setHeader('Access-Control-Allow-Methods', 'POST')
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type')

    return res.status(200).json({
      success: true,
      checkoutRequestID: stkData.CheckoutRequestID,
      customerMessage: stkData.CustomerMessage,
      responseCode: stkData.ResponseCode,
      responseDescription: stkData.ResponseDescription
    })
  } catch (error) {
    console.error('Error initiating STK Push:', error)
    return res.status(500).json({ 
      error: 'Internal server error',
      message: error.message 
    })
  }
}

