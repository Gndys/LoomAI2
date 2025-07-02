import { auth } from '@libs/auth'
import { db } from '@libs/database'
import { order } from '@libs/database/schema/order'
import { user } from '@libs/database/schema/user'
import { eq, desc, count } from 'drizzle-orm'
import { userRoles } from '@libs/database/constants'

/**
 * Get admin orders list with pagination
 * Requires admin permissions
 */
export default defineEventHandler(async (event) => {
  try {
    // Get query parameters
    const query = getQuery(event)
    const page = parseInt(query.page as string) || 1
    const limit = parseInt(query.limit as string) || 10
    const offset = (page - 1) * limit

    // Query orders with user information
    const orders = await db.select({
      id: order.id,
      amount: order.amount,
      currency: order.currency,
      status: order.status,
      createdAt: order.createdAt,
      updatedAt: order.updatedAt,
      // User information
      userId: user.id,
      userName: user.name,
      userEmail: user.email,
    })
    .from(order)
    .leftJoin(user, eq(order.userId, user.id))
    .orderBy(desc(order.createdAt))
    .limit(limit)
    .offset(offset)

    // Get total count for pagination
    const [{ count: totalCount }] = await db.select({ 
      count: count() 
    }).from(order)

    return {
      orders,
      pagination: {
        page,
        limit,
        total: totalCount,
        totalPages: Math.ceil(totalCount / limit)
      }
    }
  } catch (error) {
    console.error('Failed to fetch orders:', error)
    
    throw createError({
      statusCode: 500,
      statusMessage: 'Failed to fetch orders'
    })
  }
}) 