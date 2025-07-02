/**
 * Admin middleware for Nuxt.js
 * Provides additional admin-specific checks and user experience improvements
 * Note: Primary permission checking is handled by auth.global.ts middleware
 */
export default defineNuxtRouteMiddleware((to) => {
  // Only apply to admin routes
  if (!to.path.startsWith('/admin')) {
    return
  }

  // For client-side navigation, provide immediate feedback
  if (import.meta.client) {
    const cookies = document.cookie
    const hasSession = cookies.includes('better-auth.session_token') || 
                      cookies.includes('better-auth-session')
    
    if (!hasSession) {
      // Not authenticated, redirect to signin
      const localePath = useLocalePath()
      console.log('Admin access attempt without authentication, redirecting to signin')
      return navigateTo(localePath('/signin'))
    }

    // Additional client-side checks could be added here
    // For example: checking user role from stored session data
    // However, we rely on the global auth middleware for comprehensive checks
    
    console.log('Admin middleware: Session detected, deferring to auth.global.ts for permission checks')
  }

  // Server-side processing
  if (import.meta.server) {
    console.log(`Admin middleware: Processing admin route access - ${to.path}`)
  }

  // Note: Detailed permission checking is handled by:
  // 1. middleware/auth.global.ts - Route-level RBAC permissions
  // 2. server/middleware/permissions.ts - API-level protection  
  // 3. Individual API routes - Resource-specific authorization
  // 
  // This middleware provides:
  // - Quick client-side authentication check
  // - Admin-specific logging and monitoring
  // - Future admin-specific features (rate limiting, audit logging, etc.)
}) 