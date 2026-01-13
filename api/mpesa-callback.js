// M-Pesa Payment Callback Handler
// Receives payment confirmation from M-Pesa

export default async function handler(req, res) {
  // Handle CORS
  res.setHeader('Access-Control-Allow-Origin', '*')
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS')
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type')

  if (req.method === 'OPTIONS') {
    return res.status(200).end()
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  try {
    const callbackData = req.body

    // Log the complete callback for debugging
    console.log('=== M-PESA CALLBACK RECEIVED ===')
    console.log('Timestamp:', new Date().toISOString())
    console.log('Full Callback Data:', JSON.stringify(callbackData, null, 2))
    console.log('=================================')

    // M-Pesa callback structure
    const {
      Body: {
        stkCallback: {
          CheckoutRequestID,
          ResultCode,
          ResultDesc,
          CallbackMetadata
        } = {}
      } = {}
    } = callbackData

    console.log('Parsed Callback:', {
      CheckoutRequestID,
      ResultCode,
      ResultDesc,
      hasMetadata: !!CallbackMetadata
    })

    // Extract payment details if successful
    let paymentDetails = null
    if (ResultCode === 0 && CallbackMetadata && CallbackMetadata.Item) {
      const items = CallbackMetadata.Item
      paymentDetails = {
        amount: items.find(item => item.Name === 'Amount')?.Value,
        mpesaReceiptNumber: items.find(item => item.Name === 'MpesaReceiptNumber')?.Value,
        transactionDate: items.find(item => item.Name === 'TransactionDate')?.Value,
        phoneNumber: items.find(item => item.Name === 'PhoneNumber')?.Value
      }
      console.log('Payment Details:', paymentDetails)
    }

    // TODO: Save to Firebase
    // const paymentRecord = {
    //   checkoutRequestID: CheckoutRequestID,
    //   status: ResultCode === 0 ? 'success' : 'failed',
    //   resultCode: ResultCode,
    //   resultDesc: ResultDesc,
    //   paymentDetails,
    //   timestamp: new Date().toISOString()
    // }
    // await savePaymentToFirebase(paymentRecord)

    console.log('Callback processed successfully')

    // Return success response to M-Pesa
    return res.status(200).json({
      ResultCode: 0,
      ResultDesc: 'Callback received successfully'
    })
  } catch (error) {
    console.error('Error processing M-Pesa callback:', error)
    
    // Still return success to M-Pesa to prevent retries
    return res.status(200).json({
      ResultCode: 0,
      ResultDesc: 'Callback received'
    })
  }
}