# 🎯 Stripe Webhook Configuration Guide

## 📋 Prerequisites
- ✅ Stripe test keys configured in `.env.local`
- ✅ Clerk authentication working
- ✅ Supabase database ready

## 🔧 Step 1: Configure Webhook in Stripe Dashboard

1. **Go to Stripe Dashboard:**
   - Navigate to [Stripe Dashboard](https://dashboard.stripe.com/test/dashboard)
   - Make sure you're in **Test mode** (toggle in top left)

2. **Create Webhook Endpoint:**
   - Go to **Developers** → **Webhooks**
   - Click "Add endpoint"
   - **Endpoint URL:** `https://your-domain.com/api/stripe/webhook`
   - **For local development:** `http://localhost:3000/api/stripe/webhook`
   - **HTTP method:** POST
   - **Listen to events:**
     ```
     checkout.session.completed
     invoice.payment_succeeded  
     invoice.payment_failed
     customer.subscription.deleted
     ```

3. **Configure Events:**
   - Select these specific events:
     - `checkout.session.completed` - When payment succeeds
     - `invoice.payment_succeeded` - When subscription payment succeeds
     - `invoice.payment_failed` - When payment fails
     - `customer.subscription.deleted` - When subscription is cancelled

4. **Get Webhook Secret:**
   - After creating, Stripe will give you a **Signing Secret**
   - Copy this secret and update your `.env.local`:
     ```env
     STRIPE_WEBHOOK_SECRET=whsec_your_actual_webhook_secret
     ```

## 🔧 Step 2: Update Environment Variables

Replace the mock webhook secret in your `.env.local`:

```env
# Replace this line:
STRIPE_WEBHOOK_SECRET=whsec_mock_key

# With your actual webhook secret from Stripe:
STRIPE_WEBHOOK_SECRET=whsec_your_real_webhook_secret_here
```

## 🔧 Step 3: Test the Webhook

1. **Start your dev server:**
   ```bash
   pnpm dev
   ```

2. **Test webhook in Stripe:**
   - In Stripe webhook dashboard, click "Send test webhook"
   - Select `checkout.session.completed` event
   - Send test data

3. **Check logs:**
   - Your webhook endpoint should log the received event
   - Check browser console and terminal for any errors

## 🚀 How the Webhook Works

When a user subscribes:

1. **Stripe sends event** → Your webhook endpoint
2. **Webhook verifies signature** → Using `STRIPE_WEBHOOK_SECRET`
3. **Updates user subscription** → In Supabase database
4. **Updates Clerk metadata** → Reflects subscription status
5. **User gets access** → Premium features unlocked

## 🔧 Webhook Endpoint Features

Your webhook at `/api/stripe/webhook` already handles:

- ✅ **Signature verification** - Security check
- ✅ **Payment success** - Activates premium
- ✅ **Payment failure** - Handles failed payments  
- ✅ **Subscription cancellation** - Downgrades to free
- ✅ **User sync** - Updates both Supabase and Clerk
- ✅ **Error handling** - Logs all issues

## 🎉 Current Status

- ✅ **Pricing page created** - Beautiful pricing UI
- ✅ **Stripe checkout** - Ready to accept payments
- ✅ **Webhook endpoint** - Handles all subscription events
- ✅ **Database integration** - User subscription tracking
- ✅ **Clerk integration** - Authentication working

## 🔄 Next Steps

1. **Update webhook secret** in `.env.local`
2. **Configure webhook** in Stripe dashboard
3. **Test payment flow** end-to-end
4. **Monitor webhook logs** for any issues

Your subscription system is now ready to handle real payments! 🚀
