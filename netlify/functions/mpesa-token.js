// M-Pesa OAuth Token Generation
// This function generates an access token for M-Pesa API authentication

exports.handler = async (event, context) => {
  // Only allow POST requests
  if (event.httpMethod !== 'POST') {
    return {
      statusCode: 405,
      body: JSON.stringify({ error: 'Method not allowed' })
    }
  }

  const consumerKey = process.env.MPESA_CONSUMER_KEY
  const consumerSecret = process.env.MPESA_CONSUMER_SECRET

  if (!consumerKey || !consumerSecret) {
    return {
      statusCode: 500,
      body: JSON.stringify({ error: 'M-Pesa credentials not configured' })
    }
  }

  // M-Pesa OAuth URL (Sandbox or Production)
  const authUrl = process.env.MPESA_ENVIRONMENT === 'production'
    ? 'https://api.safaricom.co.ke/oauth/v1/generate?grant_type=client_credentials'
    : 'https://sandbox.safaricom.co.ke/oauth/v1/generate?grant_type=client_credentials'

  try {
    // Create Basic Auth header
    const auth = Buffer.from(`${consumerKey}:${consumerSecret}`).toString('base64')

    const response = await fetch(authUrl, {
      method: 'GET',
      headers: {
        'Authorization': `Basic ${auth}`
      }
    })

    if (!response.ok) {
      const errorText = await response.text()
      console.error('M-Pesa OAuth error:', errorText)
      return {
        statusCode: response.status,
        body: JSON.stringify({ 
          error: 'Failed to get access token',
          details: errorText 
        })
      }
    }

    const data = await response.json()
    
    return {
      statusCode: 200,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Headers': 'Content-Type'
      },
      body: JSON.stringify({
        access_token: data.access_token,
        expires_in: data.expires_in
      })
    }
  } catch (error) {
    console.error('Error getting M-Pesa token:', error)
    return {
      statusCode: 500,
      body: JSON.stringify({ 
        error: 'Internal server error',
        message: error.message 
      })
    }
  }
}

