// M-Pesa OAuth Token Generation
// Generates access token using Daraja API OAuth 2.0 (Client Credentials)

export default async function handler(req, res) {
  // Handle CORS
  res.setHeader('Access-Control-Allow-Origin', '*')
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS')
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization')

  if (req.method === 'OPTIONS') {
    return res.status(200).end()
  }

  if (req.method !== 'GET' && req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  const consumerKey = process.env.MPESA_CONSUMER_KEY
  const consumerSecret = process.env.MPESA_CONSUMER_SECRET

  if (!consumerKey || !consumerSecret) {
    return res.status(500).json({ error: 'M-Pesa credentials not configured' })
  }

  try {
    // Daraja OAuth endpoint
    const authUrl = process.env.MPESA_ENVIRONMENT === 'production'
      ? 'https://api.safaricom.co.ke/oauth/v1/generate?grant_type=client_credentials'
      : 'https://sandbox.safaricom.co.ke/oauth/v1/generate?grant_type=client_credentials'

    // Create Basic Auth header (Base64 encoded key:secret)
    const auth = Buffer.from(`${consumerKey}:${consumerSecret}`).toString('base64')

    const response = await fetch(authUrl, {
      method: 'GET',
      headers: {
        'Authorization': `Basic ${auth}`,
        'Content-Type': 'application/json'
      }
    })

    if (!response.ok) {
      const errorText = await response.text()
      console.error('M-Pesa OAuth error:', errorText)
      return res.status(response.status).json({ 
        error: 'Failed to get access token',
        details: errorText 
      })
    }

    const data = await response.json()
    
    return res.status(200).json({
      success: true,
      access_token: data.access_token,
      expires_in: data.expires_in || '3599'
    })
  } catch (error) {
    console.error('Error getting M-Pesa token:', error)
    return res.status(500).json({ 
      error: 'Internal server error',
      message: error.message 
    })
  }
}

