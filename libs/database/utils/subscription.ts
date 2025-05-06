import { db } from '../index';
import { subscription, subscriptionStatus } from '../schema/subscription';
import { eq, and } from 'drizzle-orm';

/**
 * 检查用户的订阅状态
 * @param userId 用户ID
 * @returns 订阅对象或null
 */
export async function checkSubscriptionStatus(userId: string) {
  // 获取用户的订阅
  const userSub = await db.select()
    .from(subscription)
    .where(
      and(
        eq(subscription.userId, userId),
        eq(subscription.status, subscriptionStatus.ACTIVE)
      )
    )
    .limit(1);

  if (!userSub.length) return null;

  // 检查是否过期
  const sub = userSub[0];
  
  // 检查是否为终身订阅
  const metadata = sub.metadata ? JSON.parse(sub.metadata) : {};
  if (metadata.isLifetime) {
    return { ...sub, isLifetime: true };
  }
  
  // 检查是否过期
  if (sub.periodEnd < new Date()) {
    // 更新状态
    await db.update(subscription)
      .set({ status: subscriptionStatus.CANCELED })
      .where(eq(subscription.id, sub.id));
    
    return null;
  }

  return sub;
}

/**
 * 检查用户是否拥有终身会员资格
 * @param userId 用户ID
 * @returns 是否为终身会员
 */
export async function isLifetimeMember(userId: string) {
  const sub = await checkSubscriptionStatus(userId);
  if (!sub) return false;
  
  const metadata = sub.metadata ? JSON.parse(sub.metadata) : {};
  return !!metadata.isLifetime;
} 