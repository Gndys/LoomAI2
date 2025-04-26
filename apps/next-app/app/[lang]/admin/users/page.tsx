import { headers } from 'next/headers'
import Link from 'next/link'
import { columns } from './columns';
import { DataTable } from './data-table';
import { authClientReact } from '@libs/auth/authClient'; // 确保路径正确
import { Button } from '@/components/ui/button';
import { UserPlus } from 'lucide-react'
import { translations } from '@libs/i18n';

type SearchField = "email" | "name" | "id";
type Role = "admin" | "user" | "all";
type BannedStatus = "true" | "false" | "all";

interface PageProps {
  params: Promise<{
    lang: string;
  }>;
  searchParams: { [key: string]: string | string[] | undefined }
}

export default async function UserPage({ params, searchParams }: PageProps) {
  // Await both params and searchParams
  const [{ lang }, rawParams] = await Promise.all([
    params,
    Promise.resolve(searchParams)
  ]);
  
  const t = translations[lang as keyof typeof translations];
  
  // Safely get values from searchParams
  const page = Number(rawParams.page) || 1;
  const pageSize = 10;
  const searchField = (rawParams.searchField as SearchField) || "email";
  const searchValue = (rawParams.searchValue as string) || "";
  const role = (rawParams.role as Role) || "all";
  const banned = (rawParams.banned as BannedStatus) || "all";
  const sortBy = (rawParams.sortBy as string) || undefined;
  const sortDirection = (rawParams.sortDirection as "asc" | "desc") || undefined;

  const query = {
    limit: pageSize,
    offset: (page - 1) * pageSize,
  } as any;

  // Only add sorting if both parameters are present
  if (sortBy && sortDirection) {
    query.sortBy = sortBy;
    query.sortDirection = sortDirection;
  }

  // Only add search if there's a value
  if (searchValue) {
    if (searchField === "id") {
      query.filterField = "id";
      query.filterOperator = "eq";
      query.filterValue = searchValue;
    } else {
      query.searchField = searchField;
      query.searchOperator = "contains";
      query.searchValue = searchValue;
    }
  }

  // Only add role filter if not "all"
  if (role && role !== "all") {
    if (!query.filterField) {
      query.filterField = "role";
      query.filterOperator = "eq";
      query.filterValue = role;
    } else {
      query.additionalFilters = [{
        field: "role",
        operator: "eq",
        value: role
      }];
    }
  }

  // Only add banned filter if not "all"
  if (banned && banned !== "all") {
    const bannedFilter = {
      field: "banned",
      operator: "eq",
      value: banned === "true"
    };

    if (!query.filterField) {
      query.filterField = bannedFilter.field;
      query.filterOperator = bannedFilter.operator;
      query.filterValue = bannedFilter.value;
    } else {
      query.additionalFilters = query.additionalFilters || [];
      query.additionalFilters.push(bannedFilter);
    }
  }

  const { data } = await authClientReact.admin.listUsers({
    query,
    fetchOptions: {
      headers: await headers(),
    }
  });

  const totalPages = Math.ceil((data?.total || 0) / pageSize);

  return (
    <div className="container mx-auto py-10 px-5">
      <div className='flex items-center justify-between mb-4'>
        <h1 className="text-2xl font-bold">{t.admin.users.title}</h1>
        
        <Link href='/admin/users/new'><Button>
          <UserPlus className="mr-2 h-4 w-4"></UserPlus>
          {t.admin.users.actions.addUser}
        </Button>
        </Link>
      </div>
      <div className="flex flex-col gap-4">
        <DataTable 
          columns={columns} 
          data={data?.users as any[]} 
          pagination={{
            currentPage: page,
            totalPages,
            pageSize,
            total: data?.total || 0
          }}
        />
      </div>
    </div>
  );
}