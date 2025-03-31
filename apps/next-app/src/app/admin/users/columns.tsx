"use client"

import { ColumnDef } from "@tanstack/react-table"
import type { User } from '@libs/database'

// This type is used to define the shape of our data.
// You can use a Zod schema here if you want.
export type Payment = {
  id: string
  amount: number
  status: "pending" | "processing" | "success" | "failed"
  email: string
}

// export const columns: ColumnDef<Payment>[] = [
//   {
//     accessorKey: "status",
//     header: "Status",
//   },
//   {
//     accessorKey: "email",
//     header: "Email",
//   },
//   {
//     accessorKey: "amount",
//     header: "Amount",
//   },
// ]

export const columns: ColumnDef<User>[] = [
  {
    accessorKey: "id",
    header: "ID",
  },
  {
    accessorKey: "name",
    header: "Name",
  },
  {
    accessorKey: "email",
    header: "Email",
  },
  {
    accessorKey: "role",
    header: "Role",
  },
  {
    accessorKey: "emailVerified",
    header: "Email Verified",
  },
  {
    accessorKey: "createdAt",
    cell: ({ row }) => {
      const createdAt = row.getValue("createdAt") as Date; // 已经是 Date 对象
      const formatted = `${createdAt.getFullYear()}/${String(createdAt.getMonth() + 1).padStart(2, "0")}/${String(createdAt.getDate()).padStart(2, "0")}`;
      return <div className="text-right font-medium">{formatted}</div>;
    },
  },
]
