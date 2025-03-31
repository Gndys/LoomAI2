'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { authClientReact } from "@libs/auth/authClient";
import { userRoles } from "@libs/database/schema/user";

const AdminDashboard = () => {
  const router = useRouter();
  const { data: session, isPending } = authClientReact.useSession();
  console.log(session?.user.role)
  useEffect(() => {
    if (!isPending && (!session?.user || session.user.role !== userRoles.ADMIN)) {
      router.push('/'); // 如果不是管理员，重定向到首页
    }
  }, [session, isPending, router]);

  // 如果正在加载或没有用户信息，显示加载状态
  if (isPending) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  // 如果不是管理员，不显示内容（会被 useEffect 重定向）
  if (!session?.user || session.user.role !== userRoles.ADMIN) {
    return null;
  }

  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold mb-6">管理员仪表板</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {/* 统计卡片 */}
        <div className="bg-white p-6 rounded-lg shadow">
          <h2 className="text-lg font-semibold mb-2">总用户数</h2>
          <p className="text-3xl font-bold">1,234</p>
        </div>
        <div className="bg-white p-6 rounded-lg shadow">
          <h2 className="text-lg font-semibold mb-2">今日订单</h2>
          <p className="text-3xl font-bold">56</p>
        </div>
        <div className="bg-white p-6 rounded-lg shadow">
          <h2 className="text-lg font-semibold mb-2">本月收入</h2>
          <p className="text-3xl font-bold">¥45,678</p>
        </div>
      </div>
      
      {/* 最近活动列表 */}
      <div className="mt-8">
        <h2 className="text-xl font-semibold mb-4">最近活动</h2>
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <div className="p-4 border-b">
            <p className="text-gray-600">新用户注册 - 张三</p>
            <p className="text-sm text-gray-400">2024-03-30 14:30</p>
          </div>
          <div className="p-4 border-b">
            <p className="text-gray-600">订单完成 #12345</p>
            <p className="text-sm text-gray-400">2024-03-30 13:15</p>
          </div>
          <div className="p-4">
            <p className="text-gray-600">系统更新完成</p>
            <p className="text-sm text-gray-400">2024-03-30 12:00</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard; 