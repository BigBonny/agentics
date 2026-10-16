/** @type {import('next').NextConfig } */
const nextConfig = {
  reactStrictMode: true,
  experimental: {
    // pdf-parse charge son pdf.js embarqué via require() dynamique — il doit
    // rester hors du bundle webpack sinon le module n'est pas tracé/expédié.
    serverComponentsExternalPackages: ['pdf-parse'],
    // Force l'inclusion des fichiers pdf.js embarqués (require dynamique +
    // layout pnpm .pnpm/) dans le bundle serverless des routes d'upload.
    outputFileTracingIncludes: {
      '/api/working-upload': ['./node_modules/**/pdf-parse/**'],
      '/api/ai/extract-content': ['./node_modules/**/pdf-parse/**'],
      '/api/courses/upload': ['./node_modules/**/pdf-parse/**'],
    },
  },
  env: {
    // Make sure these are loaded
    NEXT_PUBLIC_SUPABASE_URL: process.env.NEXT_PUBLIC_SUPABASE_URL,
    NEXT_PUBLIC_SUPABASE_ANON_KEY: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
    SUPABASE_SERVICE_ROLE_KEY: process.env.SUPABASE_SERVICE_ROLE_KEY,
    NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY: process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY,
    CLERK_SECRET_KEY: process.env.CLERK_SECRET_KEY,
    NEXT_PUBLIC_CLERK_WEBHOOK_SECRET: process.env.NEXT_PUBLIC_CLERK_WEBHOOK_SECRET,
    CLERK_WEBHOOK_SECRET: process.env.CLERK_WEBHOOK_SECRET,
    OPENAI_API_KEY: process.env.OPENAI_API_KEY,
    STRIPE_SECRET_KEY: process.env.STRIPE_SECRET_KEY,
    NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY: process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY,
    STRIPE_WEBHOOK_SECRET: process.env.STRIPE_WEBHOOK_SECRET,
  }
}

module.exports = nextConfig
