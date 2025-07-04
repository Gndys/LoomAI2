/**
 * Unified Authentication Middleware for Nuxt.js
 * Handles all authentication, authorization, and subscription checks in one place
 */
import { authClientVue } from '@libs/auth/authClient'
import { Action, Subject, can, createAppUser } from '@libs/permissions'

// Route configuration interface
interface ProtectedRouteConfig {
  pattern: RegExp
  type: 'page' | 'api'
  // Authentication requirements
  requiresAuth?: boolean
  // Permission required for access
  requiredPermission?: { 
    action: Action
    subject: Subject
  }
  // Subscription requirements
  requiresSubscription?: boolean
}

// Unified protected routes configuration
const protectedRoutes: ProtectedRouteConfig[] = [
  // Admin routes - require admin permissions
  {
    pattern: /^\/admin(\/.*)?$/,
    type: 'page',
    requiresAuth: true,
    requiredPermission: { action: Action.MANAGE, subject: Subject.ALL }
  },
  
  // Settings pages - require authentication only
  {
    pattern: /^\/settings(\/.*)?$/,
    type: 'page',
    requiresAuth: true
  },
  
  // Dashboard - require authentication only
  {
    pattern: /^\/dashboard(\/.*)?$/,
    type: 'page',
    requiresAuth: true
  },
  
  // Premium features - require active subscription
  {
    pattern: /^\/premium-features(\/.*)?$/,
    type: 'page',
    requiresAuth: true,
    requiresSubscription: true
  },
  
  // AI features - require authentication (could add subscription later)
  {
    pattern: /^\/ai(\/.*)?$/,
    type: 'page',
    requiresAuth: true
  },

  // API routes protection
  {
    pattern: /^\/api\/admin\/(.*)?$/,
    type: 'api',
    requiresAuth: true,
    requiredPermission: { action: Action.MANAGE, subject: Subject.ALL }
  },
  
  {
    pattern: /^\/api\/chat(\/.*)?$/,
    type: 'api',
    requiresAuth: true
  },
  
  {
    pattern: /^\/api\/premium(\/.*)?$/,
    type: 'api',
    requiresAuth: true,
    requiresSubscription: true
  }
]

/**
 * Check if user has valid subscription
 */
async function hasValidSubscription(userId: string): Promise<boolean> {
  // TODO: Implement actual subscription checking
  // For now, return true to allow access during development
  return true
  
  // Example implementation:
  // try {
  //   const { data: subscription } = await $fetch('/api/subscription/status', {
  //     method: 'POST',
  //     body: { userId }
  //   })
  //   return subscription?.status === 'active'
  // } catch {
  //   return false
  // }
}

/**
 * Get user session using Better Auth
 */
async function getUserSession() {
  try {
    const session = await authClientVue.getSession()
    return {
      session,
      user: session?.data?.user,
      isAuthenticated: !!session?.data?.user
    }
  } catch (error) {
    console.error('Failed to get session:', error)
    return {
      session: null,
      user: null,
      isAuthenticated: false
    }
  }
}

export default defineNuxtRouteMiddleware(async (to) => {
  // Skip middleware for auth pages and public routes
  const authRoutes = ['/signin', '/signup', '/forgot-password', '/reset-password', '/cellphone', '/wechat']
  const publicRoutes = ['/', '/pricing']
  
  if (authRoutes.includes(to.path) || publicRoutes.includes(to.path)) {
    return
  }

  // Skip API routes in client-side navigation
  if (process.client && to.path.startsWith('/api/')) {
    return
  }

  // Check if current route matches any protected route
  const matchedRoute = protectedRoutes.find(route => route.pattern.test(to.path))
  
  if (!matchedRoute) {
    return // Route is not protected
  }

  console.log(`🔒 Protected route accessed: ${to.path} (Type: ${matchedRoute.type})`)

  // Get user session (unified approach)
  const { user, isAuthenticated } = await getUserSession()

  // --- 1. Authentication Check ---
  if (matchedRoute.requiresAuth && !isAuthenticated) {
    console.log(`❌ Authentication failed for: ${to.path}`)
    
    if (matchedRoute.type === 'page') {
      // Redirect to signin page
      return navigateTo('/signin')
    } else {
      // For API routes, this would be handled by server middleware
      throw createError({
        statusCode: 401,
        statusMessage: 'Unauthorized'
      })
    }
  }

  // If no authentication required, allow access
  if (!matchedRoute.requiresAuth) {
    console.log(`✅ Public access allowed for: ${to.path}`)
    return
  }

  // --- 2. Subscription Check (if required) ---
  if (matchedRoute.requiresSubscription) {
    console.log(`💳 Checking subscription for: ${to.path}, User: ${user!.id}`)
    
    const hasSubscription = await hasValidSubscription(user!.id)
    
    if (!hasSubscription) {
      console.log(`❌ Subscription check failed for: ${to.path}, User: ${user!.id}`)
      
      if (matchedRoute.type === 'page') {
        // Redirect to pricing page
        return navigateTo('/pricing')
      } else {
        throw createError({
          statusCode: 402,
          statusMessage: 'Subscription required'
        })
      }
    }
    
    console.log(`✅ Subscription check passed for: ${to.path}`)
  }

  // --- 3. Authorization Check (RBAC-Based) ---
  const requiredPermission = matchedRoute.requiredPermission
  
  if (requiredPermission) {
    console.log(`🛡️ Checking permissions for: ${to.path} (${requiredPermission.action}:${requiredPermission.subject})`)
    
    // Create AppUser from session data
    const appUser = createAppUser(user!)
    
    if (!appUser) {
      console.log(`❌ Authorization failed (user object missing) for: ${to.path}`)
      throw createError({
        statusCode: 403,
        statusMessage: 'Forbidden: User information missing'
      })
    }

    // Check permissions using RBAC system
    const hasPermission = can(appUser, requiredPermission.action, requiredPermission.subject)

    if (!hasPermission) {
      console.log(`❌ Authorization failed for user ${user!.id} on ${to.path} (${requiredPermission.action}:${requiredPermission.subject})`)
      
      if (matchedRoute.type === 'page') {
        throw createError({
          statusCode: 403,
          statusMessage: 'Access Denied: Insufficient permissions'
        })
      } else {
        throw createError({
          statusCode: 403,
          statusMessage: 'Forbidden'
        })
      }
    }
    
    console.log(`✅ Authorization successful for user ${user!.id} on ${to.path}`)
  }

  console.log(`✅ Access granted to: ${to.path} for user: ${user!.id}`)
})

// --- Two-Layer Authorization Concept ---
// This middleware handles the FIRST layer of authorization:
// 1. Authentication: Is the user logged in?
// 2. General Permissions: Does the user's role/abilities generally allow
//    them to perform the requested action on the requested resource type?
//    Example check: can(user, Action.DELETE, Subject.ARTICLE)

// The SECOND layer of authorization (instance-specific checks) 
// MUST happen later, within the specific API route handler or page component.
// This is because middleware doesn't have access to the specific resource instance.

// Example for API Route Handler (e.g., server/api/articles/[id].delete.ts):
/*
export default defineEventHandler(async (event) => {
  // 1. Get session (already passed middleware auth check)
  const session = await getServerSession(event)
  if (!session?.user) {
    throw createError({ statusCode: 401, statusMessage: 'Unauthorized' })
  }

  // 2. Get the specific resource ID
  const articleId = getRouterParam(event, 'id')

  // 3. Fetch the resource instance from the database
  const article = await db.article.findUnique({ where: { id: articleId } })
  if (!article) {
    throw createError({ statusCode: 404, statusMessage: 'Article not found' })
  }

  // 4. Perform the INSTANCE-SPECIFIC permission check
  const appUser = createAppUser(session.user)
  const hasPermission = can(appUser, Action.DELETE, Subject.ARTICLE, article)

  if (!hasPermission) {
    throw createError({ statusCode: 403, statusMessage: 'Forbidden' })
  }

  // 5. Proceed with the operation
  await db.article.delete({ where: { id: articleId } })
  return { success: true }
})
*/ 