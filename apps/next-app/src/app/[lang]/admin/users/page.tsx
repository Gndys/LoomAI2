import { headers } from 'next/headers'
import { columns } from './columns';
import { DataTable } from './data-table';
import { authClientReact } from '@libs/auth/authClient'; // 确保路径正确


export default async function UserPage() {

  const { data } = await authClientReact.admin.listUsers({
    query: {
      limit: 10,
    },
    fetchOptions: {
      headers: await headers(),
    }
  });

  return (
    <div className="container mx-auto p-10">
      <DataTable columns={columns} data={data?.users as any[]} />
    </div>
  );
}