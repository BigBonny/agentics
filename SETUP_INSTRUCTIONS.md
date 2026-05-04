# Agentics Révision - Setup Instructions

## Prerequisites

- Node.js 18+ installed
- npm or yarn package manager
- Git for version control

## 1. Environment Setup

### Clerk Authentication
1. Go to [Clerk Dashboard](https://dashboard.clerk.com)
2. Create a new application
3. Get your Publishable Key and Secret Key
4. Configure sign-in/sign-up URLs:
   - Sign-in URL: `/sign-in`
   - Sign-up URL: `/sign-up`
   - After sign-in: `/dashboard`
   - After sign-up: `/dashboard`

### Supabase Database
1. Go to [Supabase Dashboard](https://supabase.com)
2. Create a new project
3. Get your Project URL and Anon Key
4. Go to Settings > Database > SQL
5. Run the migration from `supabase/migrations/001_initial_schema.sql`
6. Get your Service Role Key from Settings > API

### Stripe Payment
1. Go to [Stripe Dashboard](https://dashboard.stripe.com)
2. Get your Publishable Key and Secret Key
3. Create products and prices:
   - Individual Plan: €12/month (price_1Oxxxxx)
   - Center Plan: Custom pricing
4. Set up webhook endpoint: `https://yourdomain.com/api/stripe/webhook`
5. Configure webhook events:
   - checkout.session.completed
   - invoice.payment_succeeded
   - invoice.payment_failed
   - customer.subscription.deleted

### OpenAI API
1. Go to [OpenAI Platform](https://platform.openai.com)
2. Create an API key
3. Ensure you have access to GPT-4 model

## 2. Environment Variables

Create a `.env.local` file in the root directory:

```env
# Clerk Authentication
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=your_clerk_publishable_key
CLERK_SECRET_KEY=your_clerk_secret_key
NEXT_PUBLIC_CLERK_SIGN_IN_URL=/sign-in
NEXT_PUBLIC_CLERK_SIGN_UP_URL=/sign-up
NEXT_PUBLIC_CLERK_AFTER_SIGN_IN_URL=/dashboard
NEXT_PUBLIC_CLERK_AFTER_SIGN_UP_URL=/dashboard

# Supabase
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key

# Stripe
STRIPE_SECRET_KEY=your_stripe_secret_key
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=your_stripe_publishable_key
STRIPE_WEBHOOK_SECRET=your_stripe_webhook_secret

# OpenAI
OPENAI_API_KEY=your_openai_api_key

# Database
DATABASE_URL=your_database_url
```

## 3. Installation and Setup

```bash
# Install dependencies
npm install

# Run development server
npm run dev

# Build for production
npm run build

# Start production server
npm start
```

## 4. Database Setup

### Run Supabase Migration
1. Open Supabase Dashboard
2. Go to SQL Editor
3. Copy and paste the content from `supabase/migrations/001_initial_schema.sql`
4. Run the migration

### Seed Content (Optional)
You can seed the content table with educational materials:

```sql
INSERT INTO content (subject, topic, title, content, difficulty, prerequisites, learning_objectives) VALUES
('Mathématiques', 'fonctions', 'Introduction aux fonctions', 'Une fonction est une relation...', 3, ARRAY['Ensembles'], ARRAY['Comprendre la notion de fonction', 'Identifier le domaine et le codomaine']),
('Mathématiques', 'dérivées', 'Dérivées de base', 'La dérivée mesure le taux de variation...', 4, ARRAY['Fonctions', 'Limites'], ARRAY['Calculer des dérivées simples', 'Comprendre l''interprétation géométrique']),
('Physique', 'mécanique', 'Lois de Newton', 'Les trois lois de Newton...', 5, ARRAY['Vecteurs', 'Forces'], ARRAY['Appliquer les lois de Newton', 'Résoudre des problèmes de mécanique']);
```

## 5. Stripe Configuration

### Create Products and Prices
1. In Stripe Dashboard, create products:
   - "Abonnement Étudiant Individuel"
   - "Solution Centre de Formation"

2. Create prices:
   - Individual: €12/month (recurring)
   - Center: Custom pricing

3. Update the price IDs in `components/Pricing.tsx`:
   ```typescript
   priceId: tier === 'individual' 
     ? 'price_your_actual_individual_price_id'
     : 'price_your_actual_center_price_id'
   ```

### Webhook Setup
1. In Stripe Dashboard, add webhook endpoint:
   - URL: `https://yourdomain.com/api/stripe/webhook`
   - Events: checkout.session.completed, invoice.payment_succeeded, invoice.payment_failed, customer.subscription.deleted
2. Get the webhook signing secret and add to `.env.local`

## 6. Testing

### Test Authentication
1. Visit `http://localhost:3000`
2. Click "S'inscrire" to create an account
3. Verify you can sign in and access the dashboard

### Test Payments
1. Sign in to your account
2. Go to `/pricing`
3. Click "S'abonner" on the Individual plan
4. Use Stripe test card: `4242 4242 4242 4242`

### Test AI Features
1. After successful payment, go to `/dashboard`
2. Click "Évaluation" tab
3. Try the evaluation and content features

## 7. Deployment

### Vercel (Recommended)
1. Push your code to GitHub
2. Connect your Vercel account to GitHub
3. Import the project
4. Add environment variables in Vercel dashboard
5. Deploy

### Environment Variables for Production
Make sure to add all environment variables to your hosting platform:
- Clerk keys
- Supabase keys
- Stripe keys
- OpenAI API key
- Webhook secret URL

## 8. Monitoring and Maintenance

### Key Areas to Monitor
- User registration and subscription status
- Payment processing and webhook failures
- AI API usage and costs
- Database performance
- Error logs

### Regular Tasks
- Monitor OpenAI API usage and costs
- Check Stripe payment failures
- Update educational content
- Backup database regularly

## Troubleshooting

### Common Issues
1. **Authentication not working**: Check Clerk keys and redirect URLs
2. **Payments failing**: Verify Stripe keys and webhook configuration
3. **AI features not working**: Check OpenAI API key and model access
4. **Database errors**: Verify Supabase connection and RLS policies

### Debug Mode
Add this to `.env.local` for debugging:
```env
DEBUG=true
```

## Support

For issues related to:
- **Clerk**: https://clerk.com/docs
- **Supabase**: https://supabase.com/docs
- **Stripe**: https://stripe.com/docs
- **OpenAI**: https://platform.openai.com/docs

---

## Security Notes

- Never commit `.env.local` to version control
- Use HTTPS in production
- Implement rate limiting for API endpoints
- Regularly rotate API keys
- Monitor for unusual activity
