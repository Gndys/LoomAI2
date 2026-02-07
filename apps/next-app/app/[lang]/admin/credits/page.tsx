import { headers } from 'next/headers'
import { DataTable } from './data-table';
import { translations } from '@libs/i18n';
import { config } from '@config';
import { ConsumptionDashboard } from './components/consumption-dashboard';

const EMPTY_STATS = {
  summary: {
    totalConsumed: 0,
    consumedToday: 0,
    consumed7d: 0,
    consumed30d: 0,
    avgDaily30d: 0,
    transactions30d: 0,
    activeUsers30d: 0,
  },
  dailyTrend: [] as Array<{ date: string; consumed: number }>,
  topUsers: [] as Array<{ userId: string; userEmail: string | null; userName: string | null; consumed: number }>,
  topDescriptions: [] as Array<{ description: string; consumed: number }>,
  filterUsers: [] as Array<{ userId: string; userEmail: string | null; userName: string | null }>,
  selectedUserId: null as string | null,
  selectedUserInfo: null as { userId: string; userEmail: string | null; userName: string | null } | null,
};

interface PageProps {
  params: Promise<{
    lang: string;
  }>;
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>
}

export default async function CreditsPage({ params, searchParams }: PageProps) {
  const [{ lang }, rawParams] = await Promise.all([
    params,
    searchParams
  ]);
  
  const t = translations[lang as keyof typeof translations];
  
  const page = Number(rawParams.page) || 1;
  const pageSize = 10;
  const searchField = (rawParams.searchField as string) || undefined;
  const searchValue = (rawParams.searchValue as string) || undefined;
  const type = (rawParams.type as string) || undefined;
  const sortBy = (rawParams.sortBy as string) || undefined;
  const sortDirection = (rawParams.sortDirection as "asc" | "desc") || undefined;

  // Build API query parameters
  const queryParams = new URLSearchParams({
    page: page.toString(),
    limit: pageSize.toString(),
  });

  // Add search parameters
  if (searchValue && searchField) {
    queryParams.append('searchField', searchField);
    queryParams.append('searchValue', searchValue);
  }

  // Add filter parameters
  if (type && type !== 'all') {
    queryParams.append('type', type);
  }

  // Add sort parameters
  if (sortBy && sortDirection) {
    queryParams.append('sortBy', sortBy);
    queryParams.append('sortDirection', sortDirection);
  }

  try {
    // Call API to get credit transactions data
    const baseUrl = config.app.baseUrl;
    const apiUrl = `${baseUrl}/api/admin/credits/transactions?${queryParams.toString()}`;
    const statsApiUrl = `${baseUrl}/api/admin/credits/stats`;
    console.log('Fetching credit transactions from:', apiUrl);

    const requestHeaders = await headers();
    const [response, statsResponse] = await Promise.all([
      fetch(apiUrl, {
        headers: requestHeaders,
        cache: 'no-store', // Ensure fresh data
      }),
      fetch(statsApiUrl, {
        headers: requestHeaders,
        cache: 'no-store',
      })
    ]);

    if (!response.ok) {
      throw new Error('Failed to fetch credit transactions');
    }

    const data = await response.json();
    const statsData = statsResponse.ok ? await statsResponse.json() : EMPTY_STATS;
    const totalPages = Math.ceil((data?.total || 0) / pageSize);

    return (
      <div className="container mx-auto py-10 px-5">
        <div className='flex items-center justify-between mb-4'>
          <div>
            <h1 className="text-2xl font-bold">{t.admin.credits.title}</h1>
            <p className="text-muted-foreground">{t.admin.credits.subtitle}</p>
          </div>
        </div>
        <div className="flex flex-col gap-4">
          <ConsumptionDashboard
            data={statsData}
            labels={t.admin.credits.dashboard}
            descriptionLabels={t.dashboard.credits.descriptions}
          />
          <DataTable 
            data={data?.transactions || []} 
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
  } catch (error) {
    console.error('Error fetching credit transactions:', error);
    return (
      <div className="container mx-auto py-10 px-5">
        <div className='flex items-center justify-between mb-4'>
          <div>
            <h1 className="text-2xl font-bold">{t.admin.credits.title}</h1>
            <p className="text-muted-foreground">{t.admin.credits.subtitle}</p>
          </div>
        </div>
        <div className="flex flex-col gap-4">
          <div className="text-center py-10">
            <p className="text-red-500">{t.admin.credits.messages.fetchError}</p>
          </div>
        </div>
      </div>
    );
  }
}
