// M-Pesa Validation Endpoint
// Required for C2B simulation

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*')
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS')
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type')

  if (req.method === 'OPTIONS') {
    return res.status(200).end()
  }

  try {
    const validationData = req.body
    
    console.log('=== M-PESA VALIDATION REQUEST ===')
    console.log('Timestamp:', new Date().toISOString())
    console.log('Data:', JSON.stringify(validationData, null, 2))
    console.log('=================================')

    // Accept all transactions
    return res.status(200).json({
      ResultCode: 0,
      ResultDesc: 'Accepted'
    })
  } catch (error) {
    console.error('Validation error:', error)
    return res.status(200).json({
      ResultCode: 0,
      ResultDesc: 'Accepted'
    })
  }
}