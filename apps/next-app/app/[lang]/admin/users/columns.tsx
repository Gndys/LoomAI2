"use client"

import { ColumnDef } from "@tanstack/react-table"
import type { User } from '@libs/database'
import { userRoles } from '@libs/database/constants'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Switch } from "@/components/ui/switch"
import { toast } from "sonner"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"
import { useState } from "react"
import { MoreHorizontal } from "lucide-react"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { useRouter } from "next/navigation"
import { DataTableColumnHeader } from "./components/data-table-column-header"
import { authClientReact } from "@libs/auth/authClient"
import { useTranslation } from "@/hooks/use-translation"

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

// BannedCellComponent to handle the banned status with confirmation dialog
const BannedCellComponent = ({ value, userId }: { value: boolean, userId: string }) => {
  const { t } = useTranslation()
  const [isOpen, setIsOpen] = useState(false)
  const [checked, setChecked] = useState(value)

  const handleConfirm = async () => {
    try {
      if (!checked) {
        await authClientReact.admin.banUser({
          userId,
          banReason: 'No reason provided',
        });
      } else {
        await authClientReact.admin.unbanUser({
          userId,
        });
      }

      setChecked(!checked);
      setIsOpen(false);
      toast.success(checked ? t.admin.users.table.dialog.unbanSuccess : t.admin.users.table.dialog.banSuccess);
    } catch (error) {
      toast.error(t.admin.users.messages.operationFailed);
      console.error('Error updating user status:', error);
    }
  }

  return (
    <AlertDialog open={isOpen} onOpenChange={setIsOpen}>
      <AlertDialogTrigger asChild>
        <div className="flex items-center">
          <Switch 
            checked={checked} 
            onClick={(e) => {
              e.preventDefault()
              if (!checked) {
                setIsOpen(true)
              } else {
                handleConfirm()
              }
            }} 
          />
        </div>
      </AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>{t.admin.users.table.dialog.banTitle}</AlertDialogTitle>
          <AlertDialogDescription>
            {t.admin.users.table.dialog.banDescription}
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>{t.actions.cancel}</AlertDialogCancel>
          <AlertDialogAction onClick={handleConfirm}>{t.actions.confirm}</AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}

// RoleCellComponent to handle role changes
const RoleCellComponent = ({ currentRole, userId }: { currentRole: string, userId: string }) => {
  const { t } = useTranslation()
  const handleRoleChange = async (newRole: string) => {
    try {
      await authClientReact.admin.setRole({
        userId,
        role: newRole,
      });

      toast.success(t.admin.users.table.dialog.updateRoleSuccess);
    } catch (error) {
      toast.error(t.admin.users.table.dialog.updateRoleFailed);
      console.error('Error updating user role:', error);
    }
  };

  return (
    <Select defaultValue={currentRole} onValueChange={handleRoleChange}>
      <SelectTrigger className="w-[100px]">
        <SelectValue placeholder={t.admin.users.form.placeholders.selectRole} />
      </SelectTrigger>
      <SelectContent>
        <SelectItem value={userRoles.ADMIN}>{userRoles.ADMIN}</SelectItem>
        <SelectItem value={userRoles.USER}>{userRoles.USER}</SelectItem>
      </SelectContent>
    </Select>
  );
};

// ActionsCellComponent to handle user actions
const ActionsCellComponent = ({ user }: { user: User }) => {
  const { t } = useTranslation()
  const router = useRouter()
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)

  const handleDeleteConfirm = async () => {
    try {
      await authClientReact.admin.removeUser({
        userId: user.id,
      });

      setDeleteDialogOpen(false);
      toast.success(t.admin.users.messages.deleteSuccess);
      // Refresh the page to update the table
      router.refresh();
    } catch (error) {
      toast.error(t.admin.users.messages.deleteError);
      console.error('Error deleting user:', error);
    }
  }

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" className="h-8 w-8 p-0">
            <span className="sr-only">{t.admin.users.table.columns.actions}</span>
            <MoreHorizontal className="h-4 w-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuLabel>{t.admin.users.table.columns.actions}</DropdownMenuLabel>
          <DropdownMenuItem
            onClick={() => {
              router.push(`/admin/users/${user.id}`)
            }}
          >
            {t.admin.users.table.actions.editUser}
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem
            onClick={() => setDeleteDialogOpen(true)}
            className="text-red-600 focus:text-red-600"
          >
            {t.admin.users.table.actions.deleteUser}
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{t.admin.users.deleteDialog.title}</AlertDialogTitle>
            <AlertDialogDescription>
              {t.admin.users.deleteDialog.description}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>{t.actions.cancel}</AlertDialogCancel>
            <AlertDialogAction 
              onClick={handleDeleteConfirm}
              className="bg-red-600 hover:bg-red-700 focus:ring-red-600"
            >
              {t.actions.delete}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  )
}

export const columns = () => {
  const { t } = useTranslation()
  
  return [
    {
      accessorKey: "id",
      header: t.admin.users.table.columns.id,
    },
    {
      accessorKey: "name",
      header: t.admin.users.table.columns.name,
    },
    {
      accessorKey: "email",
      header: t.admin.users.table.columns.email,
    },
    {
      accessorKey: "role",
      header: t.admin.users.table.columns.role,
      cell: ({ row }) => {
        const currentRole = row.getValue("role") as string;
        const userId = row.getValue("id") as string;
        return <RoleCellComponent currentRole={currentRole} userId={userId} />;
      },
    },
    {
      accessorKey: "emailVerified",
      header: t.admin.users.table.columns.emailVerified,
    },
    {
      accessorKey: "banned",
      header: t.admin.users.table.columns.banned,
      cell: ({ row }) => {
        const isBanned = row.getValue("banned") as boolean
        const userId = row.getValue("id") as string
        return <BannedCellComponent value={isBanned} userId={userId} />
      },
    },
    {
      accessorKey: "createdAt",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title={t.admin.users.table.columns.createdAt} />
      ),
      cell: ({ row }) => {
        const createdAt = row.getValue("createdAt") as Date;
        const formatted = `${createdAt.getFullYear()}/${String(createdAt.getMonth() + 1).padStart(2, "0")}/${String(createdAt.getDate()).padStart(2, "0")}`;
        return <div className="text-right font-medium">{formatted}</div>;
      },
      enableSorting: true,
    },
    {
      accessorKey: "updatedAt",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title={t.admin.users.table.columns.updatedAt} />
      ),
      cell: ({ row }) => {
        const updatedAt = row.getValue("updatedAt") as Date;
        const formatted = `${updatedAt.getFullYear()}/${String(updatedAt.getMonth() + 1).padStart(2, "0")}/${String(updatedAt.getDate()).padStart(2, "0")}`;
        return <div className="text-right font-medium">{formatted}</div>;
      },
      enableSorting: true,
    },
    {
      id: "actions",
      cell: ({ row }) => {
        const user = row.original
        return <ActionsCellComponent user={user} />
      },
    }
  ] as ColumnDef<User>[]
}
