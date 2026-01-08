// M-Pesa Payment Callback Handler
// This function receives payment confirmation from M-Pesa

exports.handler = async (event, context) => {
  // Only allow POST requests
  if (event.httpMethod !== 'POST') {
    return {
      statusCode: 405,
      body: JSON.stringify({ error: 'Method not allowed' })
    }
  }

  try {
    const callbackData = JSON.parse(event.body)

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

    console.log('M-Pesa Callback received:', {
      CheckoutRequestID,
      ResultCode,
      ResultDesc
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
    }

    // TODO: Save payment status to database (Firebase Firestore)
    // You can add Firebase code here to save the payment status
    // Example:
    // await savePaymentStatus(CheckoutRequestID, {
    //   status: ResultCode === 0 ? 'success' : 'failed',
    //   resultCode: ResultCode,
    //   resultDesc: ResultDesc,
    //   paymentDetails,
    //   timestamp: new Date().toISOString()
    // })

    // Return success response to M-Pesa
    return {
      statusCode: 200,
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        ResultCode: 0,
        ResultDesc: 'Callback received successfully'
      })
    }
  } catch (error) {
    console.error('Error processing M-Pesa callback:', error)
    
    // Still return success to M-Pesa to prevent retries
    return {
      statusCode: 200,
      body: JSON.stringify({
        ResultCode: 0,
        ResultDesc: 'Callback received'
      })
    }
  }
}

