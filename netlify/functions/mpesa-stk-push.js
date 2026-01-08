// M-Pesa STK Push Initiation
// This function initiates an M-Pesa STK Push payment request

exports.handler = async (event, context) => {
  // Only allow POST requests
  if (event.httpMethod !== 'POST') {
    return {
      statusCode: 405,
      body: JSON.stringify({ error: 'Method not allowed' })
    }
  }

  try {
    const { phoneNumber, amount, accountReference, transactionDesc } = JSON.parse(event.body)

    // Validate input
    if (!phoneNumber || !amount || !accountReference) {
      return {
        statusCode: 400,
        body: JSON.stringify({ error: 'Missing required fields: phoneNumber, amount, accountReference' })
      }
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
      return {
        statusCode: 400,
        body: JSON.stringify({ error: 'Invalid amount' })
      }
    }

    // Get access token first - use the token generation logic directly
    const consumerKey = process.env.MPESA_CONSUMER_KEY
    const consumerSecret = process.env.MPESA_CONSUMER_SECRET

    if (!consumerKey || !consumerSecret) {
      return {
        statusCode: 500,
        body: JSON.stringify({ error: 'M-Pesa credentials not configured' })
      }
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
      console.error('M-Pesa OAuth error:', errorText)
      return {
        statusCode: tokenResponse.status,
        body: JSON.stringify({ 
          error: 'Failed to get access token',
          details: errorText 
        })
      }
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
    const callbackUrl = process.env.MPESA_CALLBACK_URL || `${process.env.URL || 'http://localhost:8888'}/.netlify/functions/mpesa-callback`

    if (!shortCode || !passKey) {
      return {
        statusCode: 500,
        body: JSON.stringify({ error: 'M-Pesa shortcode or passkey not configured' })
      }
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
      return {
        statusCode: stkResponse.status,
        body: JSON.stringify({ 
          error: 'STK Push failed',
          details: stkData 
        })
      }
    }

    return {
      statusCode: 200,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Headers': 'Content-Type'
      },
      body: JSON.stringify({
        success: true,
        checkoutRequestID: stkData.CheckoutRequestID,
        customerMessage: stkData.CustomerMessage,
        responseCode: stkData.ResponseCode,
        responseDescription: stkData.ResponseDescription
      })
    }
  } catch (error) {
    console.error('Error initiating STK Push:', error)
    return {
      statusCode: 500,
      body: JSON.stringify({ 
        error: 'Internal server error',
        message: error.message 
      })
    }
  }
}

