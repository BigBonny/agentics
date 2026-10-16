import { authMiddleware } from "@clerk/nextjs";

export default authMiddleware({
  publicRoutes: [
    '/',
    '/sign-in(.*)',
    '/sign-up(.*)',
    '/api/webhooks(.*)',
    '/pricing',
    '/about',
    '/contact',
    '/favicon.ico',
    '/_next/static/(.*)',
    '/_next/image(.*)',
    '/_next/css/(.*)',
    '/_next/chunks/(.*)',
    '/api/auth/test',
    '/courses',
    '/quiz',
    '/quiz/guest',
    '/api/quiz/guest',
    '/api/courses',
    '/api/ai/quiz',
    // Routes QualiSoft accessibles par le cron (secret Bearer, pas de session Clerk)
    '/api/qualisoft/sync',
    '/api/qualisoft/status',
    '/api/qualisoft/mappings',
  ],
  ignoredRoutes: [
    '/api/webhooks/stripe',
    '/api/stripe/webhook',
    '/api/webhooks/clerk',
    '/_next/static/(.*)',
    '/_next/image(.*)',
    '/_next/css/(.*)',
    '/_next/chunks/(.*)'
  ]
});

export const config = {
  matcher: ["/((?!.+\\.[\\w]+$|_next).*)", "/", "/(api|trpc)(.*)"],
};
