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
    '/admin/create-course',
    '/api/admin/create-dummy-course',
    '/courses',
    '/quiz',
    '/quiz/guest',
    '/api/quiz/guest',
    '/dashboard',
    '/api/courses',
    '/api/user/progress',
    '/api/stripe/checkout',
    '/api/ai/quiz',
    '/api/ai/extract-content',
    '/api/hello',
    '/api/debug/test',
    '/api/debug/simple',
    '/api/debug/all-progress',
    '/api/debug/manual-insert',
    '/api/sync-user'
  ],
  ignoredRoutes: [
    '/api/webhooks/stripe',
    '/api/stripe/webhook',
    '/api/webhooks/clerk',
    '/api/admin/create-dummy-course',
    '/_next/static/(.*)',
    '/_next/image(.*)',
    '/_next/css/(.*)',
    '/_next/chunks/(.*)'
  ]
});

export const config = {
  matcher: ["/((?!.+\\.[\\w]+$|_next).*)", "/", "/(api|trpc)(.*)"],
};
