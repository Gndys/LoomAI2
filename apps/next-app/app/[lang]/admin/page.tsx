/**
 * 管理员仪表板页面
 * 
 * 📊 图表数据说明：
 * - 当前使用静态测试数据 (monthlyRevenueData) 用于演示美观效果
 * - 线上环境请切换到真实数据源
 * 
 * 🔄 切换到真实数据的步骤：
 * 1. 在 AdminDashboard 函数中取消注释：const realMonthlyData = await getRealMonthlyData();
 * 2. 将 <RevenueChart data={monthlyRevenueData} /> 改为 <RevenueChart data={realMonthlyData} />
 * 3. getRealMonthlyData() 函数会获取过去6个月的真实订单和收入数据
 * 
 * ✨ 功能特性：
 * - 自动错误处理和数据回退
 * - 支持空数据状态的优雅显示
 * - 响应式设计适配各种屏幕尺寸
 * - 实时数据查询（今日、本月统计）
 */

import { headers } from 'next/headers'
import { auth } from "@libs/auth";
import { userRoles } from "@libs/database/constants";
import { db } from "@libs/database";
import { user } from "@libs/database/schema/user";
import { order, orderStatus } from "@libs/database/schema/order";
import { count, eq, gte, and, sql, desc } from "drizzle-orm";
import { config } from "@config";
import dynamic from 'next/dynamic';
import { translations } from "@libs/i18n";

// 定义图表数据类型
interface ChartData {
  month: string;
  revenue: number;
  orders: number;
}

// 动态导入 recharts 图表组件
const RevenueChart = dynamic(() => import('./RevenueChart'), { 
  loading: () => (
    <div className="h-80 flex items-center justify-center bg-gray-50 rounded-lg">
      <div className="text-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-2"></div>
        <p className="text-sm text-gray-500">加载图表中...</p>
      </div>
    </div>
  )
});

// 简化的统计数据类型定义
interface AdminStats {
  revenue: {
    total: number;
  };
  customers: {
    new: number; // 本月新客户
  };
  orders: {
    new: number; // 本月新订单
  };
  todayData: {
    revenue: number;
    newUsers: number;
    orders: number;
  };
  monthData: {
    revenue: number;
    newUsers: number;
    orders: number;
  };
}

// 测试数据 - 月度收入趋势（为了演示美观，线上可替换为真实数据）
const monthlyRevenueData: ChartData[] = [
  { month: '1月', revenue: 12000, orders: 45 },
  { month: '2月', revenue: 15000, orders: 52 },
  { month: '3月', revenue: 18000, orders: 61 },
  { month: '4月', revenue: 22000, orders: 73 },
  { month: '5月', revenue: 19000, orders: 68 },
  { month: '6月', revenue: 25000, orders: 84 },
  { month: '7月', revenue: 28000, orders: 92 },
  { month: '8月', revenue: 32000, orders: 105 },
  { month: '9月', revenue: 29000, orders: 98 },
  { month: '10月', revenue: 35000, orders: 112 },
  { month: '11月', revenue: 38000, orders: 125 },
  { month: '12月', revenue: 42000, orders: 138 },
];

// 获取真实的月度收入趋势数据（过去6个月）
async function getRealMonthlyData(): Promise<ChartData[]> {
  try {
    const now = new Date();
    const monthlyData: ChartData[] = [];
    
    // 获取过去6个月的数据
    for (let i = 5; i >= 0; i--) {
      const targetDate = new Date(now);
      targetDate.setMonth(targetDate.getMonth() - i);
      
      // 该月的开始和结束时间
      const monthStart = new Date(targetDate.getFullYear(), targetDate.getMonth(), 1);
      const monthEnd = new Date(targetDate.getFullYear(), targetDate.getMonth() + 1, 0, 23, 59, 59);
      
      try {
        // 查询该月的收入总额
        const [monthRevenue] = await db.select({
          total: sql<number>`COALESCE(SUM(CAST(${order.amount} AS DECIMAL)), 0)`
        }).from(order).where(and(
          eq(order.status, orderStatus.PAID),
          gte(order.createdAt, monthStart),
          sql`${order.createdAt} <= ${monthEnd}`
        ));
        
        // 查询该月的订单数量
        const [monthOrders] = await db.select({
          count: count()
        }).from(order).where(and(
          gte(order.createdAt, monthStart),
          sql`${order.createdAt} <= ${monthEnd}`
        ));
        
        // 格式化月份显示 - 使用更简洁的格式
        const monthName = `${targetDate.getMonth() + 1}月`;
        
        monthlyData.push({
          month: monthName,
          revenue: Number(monthRevenue.total) || 0,
          orders: monthOrders.count || 0
        });
      } catch (error) {
        console.error(`获取${targetDate.getMonth() + 1}月数据失败:`, error);
        // 如果某个月数据获取失败，使用默认值
        monthlyData.push({
          month: `${targetDate.getMonth() + 1}月`,
          revenue: 0,
          orders: 0
        });
      }
    }
    
    return monthlyData;
  } catch (error) {
    console.error('获取月度数据失败，使用默认数据:', error);
    // 如果整个函数失败，返回最近6个月的空数据结构
    const now = new Date();
    const fallbackData: ChartData[] = [];
    for (let i = 5; i >= 0; i--) {
      const targetDate = new Date(now);
      targetDate.setMonth(targetDate.getMonth() - i);
      fallbackData.push({
        month: `${targetDate.getMonth() + 1}月`,
        revenue: 0,
        orders: 0
      });
    }
    return fallbackData;
  }
}

// 获取统计数据的函数
async function getAdminStats(): Promise<AdminStats> {
  const now = new Date();
  
  // 时间范围定义
  const today = new Date(now);
  today.setHours(0, 0, 0, 0);
  
  const thisMonth = new Date(now);
  thisMonth.setDate(1);
  thisMonth.setHours(0, 0, 0, 0);

  // 总收入
  const [totalRevenue] = await db.select({
    total: sql<number>`COALESCE(SUM(CAST(${order.amount} AS DECIMAL)), 0)`
  }).from(order).where(eq(order.status, orderStatus.PAID));

  // 本月新客户
  const [newCustomers] = await db.select({ count: count() }).from(user)
    .where(gte(user.createdAt, thisMonth));

  // 本月新订单
  const [newOrders] = await db.select({ count: count() }).from(order)
    .where(gte(order.createdAt, thisMonth));

  // 今日数据
  const [todayRevenue] = await db.select({
    total: sql<number>`COALESCE(SUM(CAST(${order.amount} AS DECIMAL)), 0)`
  }).from(order).where(and(
    eq(order.status, orderStatus.PAID),
    gte(order.createdAt, today)
  ));

  const [todayNewUsers] = await db.select({ count: count() }).from(user).where(gte(user.createdAt, today));
  const [todayOrders] = await db.select({ count: count() }).from(order).where(gte(order.createdAt, today));

  // 本月数据
  const [thisMonthRevenue] = await db.select({
    total: sql<number>`COALESCE(SUM(CAST(${order.amount} AS DECIMAL)), 0)`
  }).from(order).where(and(
    eq(order.status, orderStatus.PAID),
    gte(order.createdAt, thisMonth)
  ));

  const [monthlyOrders] = await db.select({ count: count() }).from(order).where(gte(order.createdAt, thisMonth));

  return {
    revenue: {
      total: Number(totalRevenue.total) || 0,
    },
    customers: {
      new: newCustomers.count,
    },
    orders: {
      new: newOrders.count,
    },
    todayData: {
      revenue: Number(todayRevenue.total) || 0,
      newUsers: todayNewUsers.count,
      orders: todayOrders.count,
    },
    monthData: {
      revenue: Number(thisMonthRevenue.total) || 0,
      newUsers: newCustomers.count,
      orders: monthlyOrders.count,
    },
  };
}

// 获取最近5个订单
async function getRecentOrders() {
  const recentOrders = await db.select({
    id: order.id,
    userId: order.userId,
    amount: order.amount,
    status: order.status,
    planId: order.planId,
    provider: order.provider,
    createdAt: order.createdAt,
  }).from(order)
    .orderBy(desc(order.createdAt))
    .limit(5);

  return recentOrders;
}

// 格式化数字显示
function formatNumber(num: number): string {
  if (num >= 1000000) {
    return (num / 1000000).toFixed(1) + 'M';
  } else if (num >= 1000) {
    return (num / 1000).toFixed(1) + 'K';
  }
  return num.toString();
}

export default async function AdminDashboard({ params }: { params: { lang: string } }) {
  const { lang } = await params;
  const t = translations[lang as keyof typeof translations];

  const session = await auth.api.getSession({
    headers: await headers()
  });

  // 权限检查
  if (!session || session.user.role !== userRoles.ADMIN) {
    return (
      <div className="p-8">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-red-600 mb-4">{t.admin.dashboard.accessDenied}</h1>
          <p className="text-gray-600">{t.admin.dashboard.noPermission}</p>
        </div>
      </div>
    );
  }

  // 获取统计数据和最近订单
  const [stats, recentOrders] = await Promise.all([
    getAdminStats(),
    getRecentOrders()
  ]);

  // 🔄 线上环境切换到真实数据的方法：
  // 1. 取消下面一行的注释，获取真实的月度数据
  // const realMonthlyData = await getRealMonthlyData();
  // 
  // 2. 在下面的 RevenueChart 组件中将 data={monthlyRevenueData} 
  //    替换为 data={realMonthlyData}
  // 
  // 当前使用静态数据是为了确保演示效果，即使没有足够的历史数据也能看到美观的图表

  return (
    <div className="p-8 bg-gray-50 min-h-screen">
      <div className="max-w-7xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-3xl font-bold text-gray-900">{t.admin.dashboard.title}</h1>
          <div className="text-sm text-gray-500">
            {t.admin.dashboard.lastUpdated}: {new Date().toLocaleString(lang === 'zh-CN' ? 'zh-CN' : 'en-US')}
          </div>
        </div>
        
        {/* 核心业务指标 */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          {/* Total Revenue */}
          <div className="bg-white p-6 rounded-lg shadow-sm border">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-sm font-medium text-gray-500">{t.admin.dashboard.metrics.totalRevenue}</h3>
                <p className="text-2xl font-bold text-gray-900">¥{formatNumber(stats.revenue.total)}</p>
                <p className="text-sm text-gray-600">{t.admin.dashboard.metrics.totalRevenueDesc}</p>
              </div>
              <div className="p-3 bg-green-100 rounded-full">
                <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
                </svg>
              </div>
            </div>
          </div>

          {/* New Customers */}
          <div className="bg-white p-6 rounded-lg shadow-sm border">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-sm font-medium text-gray-500">{t.admin.dashboard.metrics.newCustomers}</h3>
                <p className="text-2xl font-bold text-gray-900">{formatNumber(stats.customers.new)}</p>
                <p className="text-sm text-gray-600">{t.admin.dashboard.metrics.newCustomersDesc}</p>
              </div>
              <div className="p-3 bg-blue-100 rounded-full">
                <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z" />
                </svg>
              </div>
            </div>
          </div>

          {/* New Orders */}
          <div className="bg-white p-6 rounded-lg shadow-sm border">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-sm font-medium text-gray-500">{t.admin.dashboard.metrics.newOrders}</h3>
                <p className="text-2xl font-bold text-gray-900">{formatNumber(stats.orders.new)}</p>
                <p className="text-sm text-gray-600">{t.admin.dashboard.metrics.newOrdersDesc}</p>
              </div>
              <div className="p-3 bg-purple-100 rounded-full">
                <svg className="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
                </svg>
              </div>
            </div>
          </div>
        </div>

        {/* 月度收入趋势图表 */}
        <div className="bg-white p-6 rounded-lg shadow-sm border mb-8">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-semibold text-gray-900">{t.admin.dashboard.chart.monthlyRevenueTrend}</h3>
            <div className="flex items-center space-x-4 text-sm">
              <div className="flex items-center">
                <div className="w-3 h-3 bg-blue-500 rounded-full mr-2"></div>
                <span className="text-gray-600">{t.admin.dashboard.chart.revenue}</span>
              </div>
              <div className="flex items-center">
                <div className="w-3 h-3 bg-green-500 rounded-full mr-2"></div>
                <span className="text-gray-600">{t.admin.dashboard.chart.orders}</span>
              </div>
            </div>
          </div>
          <RevenueChart data={monthlyRevenueData} />
        </div>

        {/* 时间维度统计 */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          {/* 今日数据 */}
          <div className="bg-white p-6 rounded-lg shadow-sm border">
            <h3 className="text-lg font-semibold mb-4 text-gray-900">{t.admin.dashboard.todayData.title}</h3>
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">{t.admin.dashboard.todayData.revenue}</span>
                <span className="text-lg font-semibold text-gray-900">¥{formatNumber(stats.todayData.revenue)}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">{t.admin.dashboard.todayData.newUsers}</span>
                <span className="text-lg font-semibold text-gray-900">{stats.todayData.newUsers}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">{t.admin.dashboard.todayData.orders}</span>
                <span className="text-lg font-semibold text-gray-900">{stats.todayData.orders}</span>
              </div>
            </div>
          </div>

          {/* 本月数据 */}
          <div className="bg-white p-6 rounded-lg shadow-sm border">
            <h3 className="text-lg font-semibold mb-4 text-gray-900">{t.admin.dashboard.monthData.title}</h3>
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">{t.admin.dashboard.monthData.revenue}</span>
                <span className="text-lg font-semibold text-gray-900">¥{formatNumber(stats.monthData.revenue)}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">{t.admin.dashboard.monthData.newUsers}</span>
                <span className="text-lg font-semibold text-gray-900">{stats.monthData.newUsers}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">{t.admin.dashboard.monthData.orders}</span>
                <span className="text-lg font-semibold text-gray-900">{stats.monthData.orders}</span>
              </div>
            </div>
          </div>
        </div>

        {/* 最近订单 */}
        <div className="bg-white rounded-lg shadow-sm border">
          <div className="p-6 border-b">
            <h3 className="text-lg font-semibold">{t.admin.dashboard.recentOrders.title}</h3>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">{t.admin.dashboard.recentOrders.orderId}</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">{t.admin.dashboard.recentOrders.plan}</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">{t.admin.dashboard.recentOrders.amount}</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">{t.admin.dashboard.recentOrders.provider}</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">{t.admin.dashboard.recentOrders.status}</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">{t.admin.dashboard.recentOrders.time}</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {recentOrders.map((order) => {
                  const plan = config.payment.plans[order.planId as keyof typeof config.payment.plans];
                  return (
                    <tr key={order.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                        #{order.id.slice(-8)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {plan?.name || order.planId}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-semibold text-gray-900">
                        ¥{Number(order.amount).toLocaleString()}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 capitalize">
                        {order.provider}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                          order.status === orderStatus.PAID ? 'bg-green-100 text-green-800' :
                          order.status === orderStatus.PENDING ? 'bg-yellow-100 text-yellow-800' :
                          order.status === orderStatus.FAILED ? 'bg-red-100 text-red-800' :
                          'bg-gray-100 text-gray-800'
                        }`}>
                          {order.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {order.createdAt ? new Date(order.createdAt).toLocaleString(lang === 'zh-CN' ? 'zh-CN' : 'en-US') : ''}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
