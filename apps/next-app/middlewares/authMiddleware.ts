import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { auth } from "@libs/auth";
import { i18n } from '../app/i18n-config';

// Import necessary items from your permissions library
import { can, Action, Subject, AppUser, Role } from "@libs/permissions"; 
import { hasValidSubscription } from "./subscriptionMiddleware";

// Define the structure for protected route configuration
interface ProtectedRouteConfig {
  pattern: RegExp;
  type: 'page' | 'api';
  // Permission required for access
  requiredPermission?: { 
    action: Action; 
    subject: Subject; // Subject must be from the Subject enum
  };
  requiresSubscription?: boolean; // New field to indicate if route requires subscription
}

// --- Configuration for Protected Routes ---
// TODO: Adjust Subject values based on your @libs/permissions definitions.
const protectedRoutes: ProtectedRouteConfig[] = [
  {
    pattern: new RegExp(`^\\/(${i18n.locales.join('|')})\\/admin(\\/.*)?$`), 
    type: 'page',
    requiredPermission: { action: Action.MANAGE, subject: Subject.ALL } 
  },
  {
    pattern: new RegExp(`^\\/(${i18n.locales.join('|')})\\/settings(\\/.*)?$`), 
    type: 'page',
  },
  {
    pattern: new RegExp(`^\\/(${i18n.locales.join('|')})\\/dashboard(\\/.*)?$`), 
    type: 'page',
    requiresSubscription: true // 付费区域
  },
  {
    pattern: new RegExp(`^\\/(${i18n.locales.join('|')})\\/premium-features(\\/.*)?$`), 
    type: 'page',
    requiresSubscription: true // 高级功能区域
  },
  {
    pattern: new RegExp('^/api/users(\\/.*)?$'),
    type: 'api',
    requiredPermission: { action: Action.MANAGE, subject: Subject.ALL }
  },
  {
    pattern: new RegExp('^/api/admin/subscriptions(\\/.*)?$'),
    type: 'api',
    requiredPermission: { action: Action.MANAGE, subject: Subject.ALL }
  },
  {
    pattern: new RegExp('^/api/admin/orders(\\/.*)?$'),
    type: 'api',
    requiredPermission: { action: Action.MANAGE, subject: Subject.ALL }
  },
  {
    pattern: new RegExp('^/api/premium(\\/.*)?$'), 
    type: 'api',
    requiresSubscription: true
  },
  {
    pattern: new RegExp('^/api/chat(\\/.*)?$'), 
    type: 'api',
    // TODO: Replace Subject.CHAT_MESSAGE with a valid Subject 
    // requiredPermission: { action: Action.CREATE, subject: Subject.CHAT_MESSAGE } // Requires definition
  },
  {
    pattern: new RegExp('^/api/protected(\\/.*)?$'), 
    type: 'api', 
    // TODO: Replace Subject.PROTECTED_RESOURCE with a valid Subject
    // requiredPermission: { action: Action.READ, subject: Subject.PROTECTED_RESOURCE } // Requires definition
  },
];
// ----------------------------------------

export async function authMiddleware(request: NextRequest): Promise<NextResponse | undefined> {
  const pathname = request.nextUrl.pathname;

  const matchedRoute = protectedRoutes.find(route => route.pattern.test(pathname));

  if (!matchedRoute) {
    return undefined; 
  }

  console.log(`Protected route accessed: ${pathname}, Type: ${matchedRoute.type}`);
  const requestHeaders = new Headers(request.headers);
  const session = await auth.api.getSession({
      headers: requestHeaders
  });

  // --- 1. Authentication Check ---
  if (!session) {
    console.log(`Authentication failed for: ${pathname}`);
    if (matchedRoute.type === 'page') {
      const currentLocale = pathname.split('/')[1]; 
      const loginUrl = new URL(`/${currentLocale}/login`, request.url);
      return NextResponse.redirect(loginUrl);
    } else if (matchedRoute.type === 'api') {
      return new NextResponse('Unauthorized', { status: 401 });
    }
  }

  // --- 2. Subscription Check (if required) ---
  if (matchedRoute.requiresSubscription) {
    console.log(`Subscription check for: ${pathname}, User: ${session!.user?.id}`);
    const hasSubscription = await hasValidSubscription(session!.user?.id!);
    console.log('hasSubscription', hasSubscription);
    
    if (!hasSubscription) {
      console.log(`Subscription check failed for: ${pathname}, User: ${session!.user?.id}`);
      if (matchedRoute.type === 'page') {
        const currentLocale = pathname.split('/')[1];
        const pricingUrl = new URL(`/${currentLocale}/pricing`, request.url);
        return NextResponse.redirect(pricingUrl);
      } else if (matchedRoute.type === 'api') {
        return new NextResponse('Subscription required', { status: 402 });
      }
    }
  }

  // --- 3. Authorization Check (Ability-Based) ---
  console.log(`Authentication successful for: ${pathname}, User: ${session!.user?.id}`);
  const requiredPermission = matchedRoute.requiredPermission;

  if (requiredPermission) {
    const userFromSession = session!.user;
    
    if (!userFromSession) {
       console.log(`Authorization failed (user object missing in session) for: ${pathname}`);
       return new NextResponse('Forbidden: User information missing', { status: 403 });
    }

    // Map session.user to AppUser type expected by @libs/permissions
    // 确保所有必要的字段都被映射，如果缺少字段则使用默认值
    const appUser = {
      ...userFromSession,
      role: userFromSession.role as Role || Role.NORMAL
    } as AppUser;

    // Check permissions
    const hasPermission = can(appUser, requiredPermission.action, requiredPermission.subject);

    if (!hasPermission) {
      console.log(`Authorization failed (insufficient permissions) for user ${userFromSession.id} on ${pathname} (Action: ${requiredPermission.action}, Subject: ${requiredPermission.subject})`);
      return new NextResponse('Forbidden', { status: 403 });
    }
    console.log(`Authorization successful (permissions check passed) for user ${userFromSession.id} on ${pathname}`);
  } else {
    console.log(`No specific permission required for: ${pathname}`);
  }

  return undefined; 
}

// --- Two-Layer Authorization Concept ---
// The authMiddleware handles the FIRST layer of authorization:
// 1. Authentication: Is the user logged in?
// 2. General Permissions: Does the user's role/abilities generally allow
//    them to perform the requested action (e.g., 'delete') on the requested 
//    resource type (e.g., 'Article')?
//    Example check in middleware: can(user, Action.DELETE, Subject.ARTICLE)

// The SECOND layer of authorization (instance-specific checks) 
// MUST happen later, within the specific API route handler or getServerSideProps function.
// This is because middleware doesn't typically have the specific resource instance (e.g., the actual article data).

// Example Pseudo-code for an API Route Handler (e.g., /api/articles/[id].ts):
/*
import { can, Action, Subject } from "@libs/permissions";
import { auth } from "@libs/auth";
import { db } from "@libs/db"; // Your database client
import { NextApiRequest, NextApiResponse } from 'next';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === 'DELETE') {
    // 1. Get session (already passed middleware auth check if required)
    const session = await auth.api.getSession({ req }); // Or however you get session in API routes
    if (!session || !session.user) {
        return res.status(401).json({ message: "Unauthorized" });
    }
    const user = session.user; // Ensure this user object matches AppUser or map it

    // 2. Get the specific resource ID
    const articleId = req.query.id as string;

    // 3. Fetch the resource instance from the database
    const article = await db.article.findUnique({ where: { id: articleId } });
    if (!article) {
        return res.status(404).json({ message: "Article not found" });
    }

    // 4. Perform the INSTANCE-SPECIFIC permission check
    //    The 'can' function here might check if user.id === article.authorId internally
    //    based on the rules defined for (Action.DELETE, Subject.ARTICLE).
    const hasPermission = can(user, Action.DELETE, article); // Pass the actual article object

    if (!hasPermission) {
      return res.status(403).json({ message: "Forbidden: You cannot delete this article" });
    }

    // 5. Proceed with the operation (deletion)
    await db.article.delete({ where: { id: articleId } });
    return res.status(200).json({ message: "Article deleted" });

  } else {
    res.setHeader('Allow', ['DELETE']);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}
*/ 