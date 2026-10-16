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
  // NE PAS ajouter de bloc `env` ici : les variables listées sont inlinées dans
  // le bundle CLIENT, ce qui exposerait les secrets (service-role, Stripe…).
  // Next charge .env* et les env vars automatiquement côté serveur.
}

module.exports = nextConfig
