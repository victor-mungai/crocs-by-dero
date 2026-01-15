// M-Pesa Confirmation Endpoint
// Required for C2B simulation

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*')
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS')
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type')

  if (req.method === 'OPTIONS') {
    return res.status(200).end()
  }

  try {
    const confirmationData = req.body
    
    console.log('=== M-PESA CONFIRMATION REQUEST ===')
    console.log('Timestamp:', new Date().toISOString())
    console.log('Data:', JSON.stringify(confirmationData, null, 2))
    console.log('===================================')

    // Acknowledge receipt
    return res.status(200).json({
      ResultCode: 0,
      ResultDesc: 'Confirmation received successfully'
    })
  } catch (error) {
    console.error('Confirmation error:', error)
    return res.status(200).json({
      ResultCode: 0,
      ResultDesc: 'Confirmation received'
    })
  }
}