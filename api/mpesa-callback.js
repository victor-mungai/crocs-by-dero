// M-Pesa Payment Callback Handler for Vercel
// This function receives payment confirmation from M-Pesa

export default async function handler(req, res) {
  // Only allow POST requests
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  try {
    const callbackData = req.body

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
      
      console.log('Payment successful:', paymentDetails)
    } else {
      console.log('Payment failed:', ResultDesc)
    }

    // TODO: Save payment status to database (Firebase Firestore)
    // You can add Firebase code here to save the payment status
    // Example:
    // import { db } from '../src/firebase/config'
    // import { collection, addDoc } from 'firebase/firestore'
    // 
    // await addDoc(collection(db, 'payments'), {
    //   checkoutRequestID: CheckoutRequestID,
    //   status: ResultCode === 0 ? 'success' : 'failed',
    //   resultCode: ResultCode,
    //   resultDesc: ResultDesc,
    //   paymentDetails,
    //   timestamp: new Date().toISOString()
    // })

    // Return success response to M-Pesa
    // M-Pesa expects a specific response format
    return res.status(200).json({
      ResultCode: 0,
      ResultDesc: 'Callback received successfully'
    })
  } catch (error) {
    console.error('Error processing M-Pesa callback:', error)
    
    // Still return success to M-Pesa to prevent retries
    // M-Pesa will retry if we return an error, which could cause issues
    return res.status(200).json({
      ResultCode: 0,
      ResultDesc: 'Callback received'
    })
  }
}

