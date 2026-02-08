import { headers } from 'next/headers';
import { config } from '@config';
import { translations } from '@libs/i18n';
import { DataTable } from './table';

interface PageProps {
  params: Promise<{ lang: string }>;
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}

export default async function GenerationLogsPage({ params, searchParams }: PageProps) {
  const [{ lang }, rawParams] = await Promise.all([params, searchParams]);
  const t = translations[lang as keyof typeof translations];

  const page = Number(rawParams.page) || 1;
  const limit = 20;
  const status = typeof rawParams.status === 'string' ? rawParams.status : undefined;
  const feature = typeof rawParams.feature === 'string' ? rawParams.feature : undefined;

  const query = new URLSearchParams({
    page: String(page),
    limit: String(limit),
  });

  if (status && status !== 'all') {
    query.set('status', status);
  }

  if (feature && feature !== 'all') {
    query.set('feature', feature);
  }

  try {
    const response = await fetch(`${config.app.baseUrl}/api/generation-logs?${query.toString()}`, {
      headers: await headers(),
      cache: 'no-store',
    });

    if (!response.ok) {
      throw new Error('Failed to fetch generation logs');
    }

    const data = await response.json();

    return (
      <div className="container mx-auto py-10 px-5">
        <div className="mb-4">
          <h1 className="text-2xl font-bold">{t.admin.generationLogs.title}</h1>
          <p className="text-muted-foreground">{t.admin.generationLogs.subtitle}</p>
        </div>

        <DataTable
          data={data?.logs || []}
          pagination={{
            page,
            totalPages: data?.totalPages || 1,
            total: data?.total || 0,
          }}
        />
      </div>
    );
  } catch (error) {
    console.error('Error fetching generation logs:', error);
    return (
      <div className="container mx-auto py-10 px-5">
        <div className="mb-4">
          <h1 className="text-2xl font-bold">{t.admin.generationLogs.title}</h1>
          <p className="text-muted-foreground">{t.admin.generationLogs.subtitle}</p>
        </div>
        <div className="text-sm text-destructive">{t.admin.generationLogs.messages.fetchError}</div>
      </div>
    );
  }
}
