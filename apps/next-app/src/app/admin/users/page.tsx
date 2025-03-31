'use client'; // 标记为客户端组件

import { useState, useEffect } from 'react';
import { columns } from './columns';
import { DataTable } from './data-table';
import { authClientReact } from '@libs/auth/authClient'; // 确保路径正确
// async function getData(): Promise<any[]> {
//   // Fetch data from your API here.
//   return [
//     {
//       id: "728ed52f",
//       amount: 100,
//       status: "pending",
//       email: "m@example.com",
//     },
//     // ...
//   ]
// }

export default function UserPage() {

  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchUsers() {
      try {
        const { data } = await authClientReact.admin.listUsers({
          query: {
            limit: 10,
          },
        });
        console.log('用户列表数据:', data);
        setUsers(data?.users || []);
      } catch (err) {
        console.error('获取用户列表失败:', err);
      } finally {
        setLoading(false);
      }
    }
    fetchUsers();
  }, []); // 空依赖数组，确保只在组件挂载时运行一次

  if (loading) {
    return <div className="container mx-auto py-10">加载中...</div>;
  }

  return (
    <div className="container mx-auto p-10">
      <DataTable columns={columns} data={users} />
    </div>
  );
}