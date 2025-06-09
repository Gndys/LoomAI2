"use client"

import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { usePathname, useRouter, useSearchParams } from "next/navigation"
import { useCallback, useState } from "react"
import { Button } from "@/components/ui/button"
import { Search as SearchIcon } from "lucide-react"
import { useTranslation } from "@/hooks/use-translation"

type SearchField = "id" | "userId" | "planId" | "userEmail" | "providerOrderId";
type OrderStatus = "pending" | "paid" | "failed" | "refunded" | "canceled" | "all";
type PaymentProvider = "stripe" | "wechat" | "all";

export function Search() {
  const { t } = useTranslation()
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()
  const [searchValue, setSearchValue] = useState(searchParams?.get("searchValue") || "")
  const [searchField, setSearchField] = useState<SearchField>((searchParams?.get("searchField") as SearchField) || "userEmail")
  const [status, setStatus] = useState<OrderStatus>((searchParams?.get("status") as OrderStatus) || "all")
  const [provider, setProvider] = useState<PaymentProvider>((searchParams?.get("provider") as PaymentProvider) || "all")

  const createQueryString = useCallback(
    (params: Record<string, string | null>) => {
      const newSearchParams = new URLSearchParams(searchParams?.toString())
      
      Object.entries(params).forEach(([key, value]) => {
        if (value === null) {
          newSearchParams.delete(key)
        } else {
          newSearchParams.set(key, value)
        }
      })
      
      return newSearchParams.toString()
    },
    [searchParams]
  )

  const onSearch = () => {
    router.push(
      `${pathname}?${createQueryString({
        searchValue: searchValue || null,
        searchField,
        status: status === "all" ? null : status,
        provider: provider === "all" ? null : provider,
        page: "1", // Reset to first page on search
      })}`
    )
  }

  const onFieldChange = (value: SearchField) => {
    setSearchField(value)
    setSearchValue("") // Clear search value when changing field
  }

  const onStatusChange = (value: OrderStatus) => {
    setStatus(value)
    router.push(
      `${pathname}?${createQueryString({
        status: value === "all" ? null : value,
        page: "1",
      })}`
    )
  }

  const onProviderChange = (value: PaymentProvider) => {
    setProvider(value)
    router.push(
      `${pathname}?${createQueryString({
        provider: value === "all" ? null : value,
        page: "1",
      })}`
    )
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    onSearch()
  }

  const getSearchPlaceholder = () => {
    const fieldMap: Record<SearchField, string> = {
      id: t.admin.orders.table.columns.id,
      userId: "User ID",
      planId: t.admin.orders.table.columns.plan,
      userEmail: "Email",
      providerOrderId: t.admin.orders.table.columns.providerOrderId
    }
    return t.admin.orders.table.search.searchPlaceholder.replace("{field}", fieldMap[searchField])
  }

  return (
    <form onSubmit={handleSubmit} className="flex items-center gap-2 flex-1">
      <Select
        value={searchField}
        onValueChange={onFieldChange}
      >
        <SelectTrigger className="w-[140px]">
          <SelectValue placeholder={t.admin.orders.table.search.searchBy} />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="userEmail">Email</SelectItem>
          <SelectItem value="planId">{t.admin.orders.table.columns.plan}</SelectItem>
          <SelectItem value="id">{t.admin.orders.table.columns.id}</SelectItem>
          <SelectItem value="userId">User ID</SelectItem>
          <SelectItem value="providerOrderId">{t.admin.orders.table.columns.providerOrderId}</SelectItem>
        </SelectContent>
      </Select>

      <Input
        placeholder={getSearchPlaceholder()}
        value={searchValue}
        onChange={(e) => setSearchValue(e.target.value)}
        className="w-[250px]"
      />
      
      <Button type="submit" size="icon" className="shrink-0">
        <SearchIcon className="h-4 w-4" />
      </Button>

      <div className="mx-2 h-4 w-[1px] bg-border" />

      <Select
        value={status}
        onValueChange={onStatusChange}
      >
        <SelectTrigger className="w-[130px]">
          <SelectValue placeholder={t.admin.orders.table.search.filterByStatus} />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">{t.admin.orders.table.search.allStatus}</SelectItem>
          <SelectItem value="pending">{t.admin.orders.table.search.pending}</SelectItem>
          <SelectItem value="paid">{t.admin.orders.table.search.paid}</SelectItem>
          <SelectItem value="failed">{t.admin.orders.table.search.failed}</SelectItem>
          <SelectItem value="refunded">{t.admin.orders.table.search.refunded}</SelectItem>
          <SelectItem value="canceled">{t.admin.orders.table.search.canceled}</SelectItem>
        </SelectContent>
      </Select>

      <Select
        value={provider}
        onValueChange={onProviderChange}
      >
        <SelectTrigger className="w-[130px]">
          <SelectValue placeholder={t.admin.orders.table.search.filterByProvider} />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">{t.admin.orders.table.search.allProviders}</SelectItem>
          <SelectItem value="stripe">{t.admin.orders.table.search.stripe}</SelectItem>
          <SelectItem value="wechat">{t.admin.orders.table.search.wechat}</SelectItem>
        </SelectContent>
      </Select>
    </form>
  )
} 