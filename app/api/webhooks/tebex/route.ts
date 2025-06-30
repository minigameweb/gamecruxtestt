import { NextRequest, NextResponse } from 'next/server'
import crypto from 'crypto'
import { db } from '@/db'
import { subscriptions } from '@/db/schema'
import { eq } from 'drizzle-orm'

const TEBEX_WEBHOOK_SECRET = process.env.TEBEX_SECRET || ''
const ALLOWED_IPS = ['18.209.80.3', '54.87.231.232']

// Get real IP address from request
function getRealIP(request: NextRequest): string {
  const forwarded = request.headers.get('x-forwarded-for')
  const realIP = request.headers.get('x-real-ip')

  if (forwarded) {
    return forwarded.split(',')[0].trim()
  }
  if (realIP) {
    return realIP
  }
  return request.ip || 'unknown'
}

// Verify webhook signature
function verifySignature(rawBody: string, signature: string): boolean {
  const bodyHash = crypto.createHash('sha256').update(rawBody, 'utf-8').digest('hex')
  const expectedSignature = crypto
    .createHmac('sha256', TEBEX_WEBHOOK_SECRET)
    .update(bodyHash)
    .digest('hex')

  return expectedSignature === signature
}

export async function POST(request: NextRequest) {
  try {
    // IP validation
    const clientIP = getRealIP(request)
    if (!ALLOWED_IPS.includes(clientIP)) {
      console.warn(`Webhook rejected: Invalid IP ${clientIP}`)
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    // Get raw body and signature
    const rawBody = await request.text()
    const signature = request.headers.get('x-signature')

    if (!signature) {
      return NextResponse.json({ error: 'Missing signature' }, { status: 400 })
    }

    // Verify signature
    if (!verifySignature(rawBody, signature)) {
      console.warn('Webhook rejected: Invalid signature')
      return NextResponse.json({ error: 'Invalid signature' }, { status: 401 })
    }

    // Parse webhook data
    const webhookData = JSON.parse(rawBody)
    const { type, id, subject } = webhookData

    console.log(`Received webhook: ${type}`, { id, timestamp: new Date().toISOString() })

    // Handle validation webhook
    if (type === 'validation.webhook') {
      return NextResponse.json({ id })
    }

    // Handle different webhook types
    switch (type) {
      case 'payment.completed':
        await handlePaymentCompleted(subject)
        break

      case 'recurring-payment.renewed':
        await handleRecurringPaymentRenewed(subject)
        break

      case 'recurring-payment.ended':
        await handleRecurringPaymentEnded(subject)
        break

      case 'recurring-payment.cancellation.requested':
        await handleRecurringPaymentCancellationRequested(subject)
        break

      case 'recurring-payment.cancellation.aborted':
        await handleRecurringPaymentCancellationAborted(subject)
        break

      case 'payment.declined':
        await handlePaymentDeclined(subject)
        break

      default:
        console.log(`Unhandled webhook type: ${type}`)
    }

    return NextResponse.json({ success: true })

  } catch (error) {
    console.error('Webhook processing error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

async function handlePaymentCompleted(subject: any) {
  try {
    const { custom, transaction_id, recurring_payment_reference } = subject

    if (!custom?.userid) {
      console.warn('Payment completed but no user ID found in custom data')
      return
    }

    // Check if subscription already exists
    const existingSubscription = await db
      .select()
      .from(subscriptions)
      .where(eq(subscriptions.userId, custom.userid))
      .limit(1)

    if (existingSubscription.length > 0) {
      // Update existing subscription
      await db
        .update(subscriptions)
        .set({
          isActive: "true",
          status: 'active',
          updatedAt: new Date(),
          recurringPayment: recurring_payment_reference || existingSubscription[0].recurringPayment
        })
        .where(eq(subscriptions.userId, custom.userid))
    } else {
      console.log('New payment completed, subscription should be created via payment flow')
    }

    console.log(`Payment completed for user: ${custom.userid}`)
  } catch (error) {
    console.error('Error handling payment completed:', error)
  }
}

async function handleRecurringPaymentRenewed(subject: any) {
  try {
    const { reference, next_payment_at, last_payment } = subject

    if (!last_payment?.custom?.userid) {
      console.warn('Recurring payment renewed but no user ID found')
      return
    }

    const nextPaymentDate = next_payment_at ? new Date(next_payment_at) : null

    await db
      .update(subscriptions)
      .set({
        isActive: "true",
        status: 'active',
        nextPaymentDate,
        updatedAt: new Date(),
        failedPaymentCount: "0" // Reset failed payment count on successful renewal
      })
      .where(eq(subscriptions.userId, last_payment.custom.userid))

    console.log(`Recurring payment renewed for user: ${last_payment.custom.userid}`)
  } catch (error) {
    console.error('Error handling recurring payment renewed:', error)
  }
}

async function handleRecurringPaymentEnded(subject: any) {
  try {
    const { reference, last_payment, cancelled_at, cancel_reason } = subject

    if (!last_payment?.custom?.userid) {
      console.warn('Recurring payment ended but no user ID found')
      return
    }

    await db
      .update(subscriptions)
      .set({
        isActive: "false",
        status: 'cancelled',
        cancelledAt: cancelled_at ? new Date(cancelled_at) : new Date(),
        cancellationReason: cancel_reason || 'Recurring payment ended',
        pendingCancellation: "false",
        updatedAt: new Date()
      })
      .where(eq(subscriptions.userId, last_payment.custom.userid))

    console.log(`Recurring payment ended for user: ${last_payment.custom.userid}`)
  } catch (error) {
    console.error('Error handling recurring payment ended:', error)
  }
}

async function handleRecurringPaymentCancellationRequested(subject: any) {
  try {
    const { reference, last_payment } = subject

    if (!last_payment?.custom?.userid) {
      console.warn('Recurring payment cancellation requested but no user ID found')
      return
    }

    // Mark as pending cancellation (subscription remains active until end of billing period)
    await db
      .update(subscriptions)
      .set({
        pendingCancellation: "true",
        cancellationRequestedAt: new Date(),
        updatedAt: new Date()
      })
      .where(eq(subscriptions.userId, last_payment.custom.userid))

    console.log(`Recurring payment cancellation requested for user: ${last_payment.custom.userid}`)
  } catch (error) {
    console.error('Error handling recurring payment cancellation requested:', error)
  }
}

async function handleRecurringPaymentCancellationAborted(subject: any) {
  try {
    const { reference, last_payment } = subject

    if (!last_payment?.custom?.userid) {
      console.warn('Recurring payment cancellation aborted but no user ID found')
      return
    }

    // Remove pending cancellation flag
    await db
      .update(subscriptions)
      .set({
        pendingCancellation: "false",
        cancellationRequestedAt: null,
        updatedAt: new Date()
      })
      .where(eq(subscriptions.userId, last_payment.custom.userid))

    console.log(`Recurring payment cancellation aborted for user: ${last_payment.custom.userid}`)
  } catch (error) {
    console.error('Error handling recurring payment cancellation aborted:', error)
  }
}

async function handlePaymentDeclined(subject: any) {
  try {
    const { custom, decline_reason } = subject

    if (!custom?.userid) {
      console.warn('Payment declined but no user ID found')
      return
    }

    // Increment failed payment count and potentially mark as overdue
    const existingSubscription = await db
      .select()
      .from(subscriptions)
      .where(eq(subscriptions.userId, custom.userid))
      .limit(1)

    if (existingSubscription.length > 0) {
      const currentFailedCount = parseInt(existingSubscription[0].failedPaymentCount || "0")
      const newFailedCount = currentFailedCount + 1

      await db
        .update(subscriptions)
        .set({
          failedPaymentCount: newFailedCount.toString(),
          status: newFailedCount >= 3 ? 'expired' : 'overdue',
          lastFailedPaymentReason: decline_reason,
          updatedAt: new Date()
        })
        .where(eq(subscriptions.userId, custom.userid))
    }

    console.log(`Payment declined for user: ${custom.userid}, reason: ${decline_reason}`)
  } catch (error) {
    console.error('Error handling payment declined:', error)
  }
}
