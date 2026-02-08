'use client';

import { useMemo, useState } from 'react';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import { Eye } from 'lucide-react';
import { useTranslation } from '@/hooks/use-translation';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';

interface GenerationLogRow {
  id: string;
  userId: string;
  userName?: string | null;
  userEmail?: string | null;
  feature: string;
  provider?: string | null;
  model?: string | null;
  taskId?: string | null;
  status: string;
  success?: boolean | null;
  failureReason?: string | null;
  requestPayload?: unknown;
  responsePayload?: unknown;
  detail?: unknown;
  createdAt: string;
  updatedAt: string;
}

interface DataTableProps {
  data: GenerationLogRow[];
  pagination: {
    page: number;
    totalPages: number;
    total: number;
  };
}

function formatDate(value: string) {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return date.toLocaleString();
}

function statusTone(status: string) {
  if (status === 'completed') return 'text-emerald-600';
  if (status === 'failed') return 'text-destructive';
  if (status === 'processing') return 'text-sky-600';
  return 'text-amber-600';
}

function prettyJson(value: unknown) {
  try {
    return JSON.stringify(value ?? {}, null, 2);
  } catch {
    return String(value ?? '');
  }
}

export function DataTable({ data, pagination }: DataTableProps) {
  const { t } = useTranslation();
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [selectedRow, setSelectedRow] = useState<GenerationLogRow | null>(null);

  const statusOptions = [
    { value: 'all', label: t.admin.generationLogs.filters.allStatus },
    { value: 'pending', label: t.admin.generationLogs.status.pending },
    { value: 'processing', label: t.admin.generationLogs.status.processing },
    { value: 'completed', label: t.admin.generationLogs.status.completed },
    { value: 'failed', label: t.admin.generationLogs.status.failed },
  ];

  const featureOptions = [
    { value: 'all', label: t.admin.generationLogs.filters.allFeatures },
    { value: 'video_generate', label: t.admin.generationLogs.filters.videoGenerate },
  ];

  const currentStatus = searchParams.get('status') || 'all';
  const currentFeature = searchParams.get('feature') || 'all';

  const rows = useMemo(() => data || [], [data]);

  const updateQuery = (next: { status?: string; feature?: string; page?: number }) => {
    const params = new URLSearchParams(searchParams.toString());

    if (typeof next.status === 'string') {
      if (next.status === 'all') params.delete('status');
      else params.set('status', next.status);
    }

    if (typeof next.feature === 'string') {
      if (next.feature === 'all') params.delete('feature');
      else params.set('feature', next.feature);
    }

    if (typeof next.page === 'number') {
      params.set('page', String(next.page));
    }

    router.push(`${pathname}?${params.toString()}`);
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center gap-2">
        <Select value={currentStatus} onValueChange={(value) => updateQuery({ status: value, page: 1 })}>
          <SelectTrigger className="w-[200px]">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {statusOptions.map((option) => (
              <SelectItem key={option.value} value={option.value}>
                {option.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select value={currentFeature} onValueChange={(value) => updateQuery({ feature: value, page: 1 })}>
          <SelectTrigger className="w-[220px]">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {featureOptions.map((option) => (
              <SelectItem key={option.value} value={option.value}>
                {option.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="rounded-md border bg-card">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>{t.admin.generationLogs.table.columns.time}</TableHead>
              <TableHead>{t.admin.generationLogs.table.columns.user}</TableHead>
              <TableHead>{t.admin.generationLogs.table.columns.feature}</TableHead>
              <TableHead>{t.admin.generationLogs.table.columns.providerModel}</TableHead>
              <TableHead>{t.admin.generationLogs.table.columns.taskId}</TableHead>
              <TableHead>{t.admin.generationLogs.table.columns.status}</TableHead>
              <TableHead>{t.admin.generationLogs.table.columns.success}</TableHead>
              <TableHead>{t.admin.generationLogs.table.columns.failureReason}</TableHead>
              <TableHead>{t.admin.generationLogs.table.columns.details}</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {rows.length === 0 ? (
              <TableRow>
                <TableCell colSpan={9} className="h-20 text-center text-muted-foreground">
                  {t.admin.generationLogs.table.noResults}
                </TableCell>
              </TableRow>
            ) : (
              rows.map((row) => (
                <TableRow key={row.id}>
                  <TableCell className="text-xs">{formatDate(row.createdAt)}</TableCell>
                  <TableCell>
                    <div className="max-w-[220px]">
                      <div className="truncate text-sm font-medium">{row.userName || 'N/A'}</div>
                      <div className="truncate text-xs text-muted-foreground">{row.userEmail || row.userId}</div>
                    </div>
                  </TableCell>
                  <TableCell className="text-sm">{row.feature}</TableCell>
                  <TableCell className="text-sm">
                    <div>{row.provider || '-'}</div>
                    <div className="text-xs text-muted-foreground">{row.model || '-'}</div>
                  </TableCell>
                  <TableCell className="font-mono text-xs">{row.taskId || '-'}</TableCell>
                  <TableCell className={`text-sm font-medium ${statusTone(row.status)}`}>{row.status}</TableCell>
                  <TableCell className="text-sm">
                    {row.success === true ? 'Yes' : row.success === false ? 'No' : '-'}
                  </TableCell>
                  <TableCell className="max-w-[260px] truncate text-xs text-destructive" title={row.failureReason || ''}>
                    {row.failureReason || '-'}
                  </TableCell>
                  <TableCell>
                    <Button size="sm" variant="outline" onClick={() => setSelectedRow(row)}>
                      <Eye className="h-4 w-4" />
                      {t.admin.generationLogs.table.actions.viewDetails}
                    </Button>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      <div className="flex items-center justify-between">
        <Button
          variant="outline"
          size="sm"
          disabled={pagination.page <= 1}
          onClick={() => updateQuery({ page: pagination.page - 1 })}
        >
          {t.admin.generationLogs.pagination.previous}
        </Button>
        <span className="text-sm text-muted-foreground">
          {t.admin.generationLogs.pagination.pageInfo
            .replace('{current}', String(pagination.page))
            .replace('{total}', String(pagination.totalPages))}
        </span>
        <Button
          variant="outline"
          size="sm"
          disabled={pagination.page >= pagination.totalPages}
          onClick={() => updateQuery({ page: pagination.page + 1 })}
        >
          {t.admin.generationLogs.pagination.next}
        </Button>
      </div>

      <Dialog open={Boolean(selectedRow)} onOpenChange={(open) => !open && setSelectedRow(null)}>
        <DialogContent className="max-w-4xl">
          <DialogHeader>
            <DialogTitle>{t.admin.generationLogs.table.actions.viewDetails}</DialogTitle>
            <DialogDescription>{selectedRow?.id}</DialogDescription>
          </DialogHeader>
          {selectedRow && (
            <div className="space-y-4">
              <div className="grid gap-2 text-sm sm:grid-cols-2">
                <div>
                  <span className="text-muted-foreground">{t.admin.generationLogs.table.columns.time}: </span>
                  {formatDate(selectedRow.createdAt)}
                </div>
                <div>
                  <span className="text-muted-foreground">{t.admin.generationLogs.table.columns.status}: </span>
                  {selectedRow.status}
                </div>
                <div>
                  <span className="text-muted-foreground">{t.admin.generationLogs.table.columns.taskId}: </span>
                  {selectedRow.taskId || '-'}
                </div>
                <div>
                  <span className="text-muted-foreground">{t.admin.generationLogs.table.columns.success}: </span>
                  {selectedRow.success === true ? 'Yes' : selectedRow.success === false ? 'No' : '-'}
                </div>
              </div>

              {selectedRow.failureReason && (
                <div className="rounded-md border border-destructive/30 bg-destructive/10 p-3 text-sm text-destructive">
                  {selectedRow.failureReason}
                </div>
              )}

              <div className="grid gap-3 md:grid-cols-3">
                <div className="space-y-1">
                  <p className="text-xs font-medium text-muted-foreground">Request Payload</p>
                  <pre className="max-h-64 overflow-auto rounded-md bg-muted p-3 text-xs">{prettyJson(selectedRow.requestPayload)}</pre>
                </div>
                <div className="space-y-1">
                  <p className="text-xs font-medium text-muted-foreground">Response Payload</p>
                  <pre className="max-h-64 overflow-auto rounded-md bg-muted p-3 text-xs">{prettyJson(selectedRow.responsePayload)}</pre>
                </div>
                <div className="space-y-1">
                  <p className="text-xs font-medium text-muted-foreground">Detail</p>
                  <pre className="max-h-64 overflow-auto rounded-md bg-muted p-3 text-xs">{prettyJson(selectedRow.detail)}</pre>
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
