// M-Pesa Payment Callback Handler
// Receives payment confirmation from M-Pesa

import { db } from '../../src/firebase/config.js'
import { doc, updateDoc, Timestamp } from 'firebase/firestore'

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

    console.log('=== M-PESA PAYMENT CALLBACK ===')
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
      console.log('✅ PAYMENT SUCCESS:', paymentDetails)
    } else {
      console.log('❌ PAYMENT FAILED:', { ResultCode, ResultDesc })
    }

    // Save payment status to Firebase
    if (db && CheckoutRequestID) {
      try {
        // Find order by payment reference and update
        const paymentRecord = {
          paymentStatus: ResultCode === 0 ? 'completed' : 'failed',
          paymentResultCode: ResultCode,
          paymentResultDesc: ResultDesc,
          mpesaReceiptNumber: paymentDetails?.mpesaReceiptNumber || null,
          paymentCompletedAt: Timestamp.now(),
          checkoutRequestID: CheckoutRequestID
        }
        
        // Update order status to confirmed if payment successful
        if (ResultCode === 0) {
          paymentRecord.status = 'confirmed'
        }

        console.log('💾 Saving to Firebase:', paymentRecord)
        // Note: You'll need to query by paymentReference to find the order
        // For now, just log the data
      } catch (firebaseError) {
        console.error('Firebase save error:', firebaseError)
      }
    }

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