# Stripe CLI Setup Instructions

## 1. Install Stripe CLI (if not already installed)
```bash
# Download and install from: https://stripe.com/docs/stripe-cli
# Or use npm/yarn:
npm install -g stripe-cli
```

## 2. Login to Stripe
```bash
stripe login
# This will open a browser window to authenticate
```

## 3. Start the webhook listener
```bash
stripe listen --forward-to localhost:3000/api/stripe/webhook
```

## 4. Copy the webhook signing key
After starting the listener, Stripe will show a webhook signing key like:
```
> Ready! Your webhook signing secret is whsec_1234567890abcdef...
```

## 5. Add the webhook secret to your environment
Add this to your `.env.local` file:
```bash
STRIPE_WEBHOOK_SECRET=whsec_1234567890abcdef...
```

## 6. Test webhooks
You can test webhooks with:
```bash
stripe trigger payment_intent.succeeded
stripe trigger customer.subscription.created
```

## 7. Your webhook endpoint is ready
Your webhook endpoint is: `http://localhost:3000/api/stripe/webhook`

## Important Notes:
- Keep the CLI running while testing payments
- The webhook secret changes each time you restart the listener
- Update your `.env.local` file with the new secret each time
- Make sure your Stripe account is in test mode for development
