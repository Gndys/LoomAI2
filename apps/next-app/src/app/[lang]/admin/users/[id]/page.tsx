// "use client"

import { notFound } from 'next/navigation'
import { headers } from 'next/headers'
import { db } from '@libs/database/client'
import { user } from '@libs/database/schema/user'
import { eq } from 'drizzle-orm'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Switch } from '@/components/ui/switch'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Label } from '@/components/ui/label'
import { userRoles } from '@libs/database/constants'
import Link from 'next/link'
import { SaveIcon, Trash2Icon } from 'lucide-react'

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
} from '@/components/ui/alert-dialog'

interface UserDetailPageProps {
  params: {
    id: string
  }
}

export default async function UserDetailPage({ params }: UserDetailPageProps) {
  // Extract user ID from URL params
  const { id } = params

  // Fetch user from database
  const users = await db.select().from(user).where(eq(user.id, id))
  
  // If user not found, return 404 page
  if (!users || users.length === 0) {
    notFound()
  }

  const userData = users[0]

  return (
    <div className="container mx-auto p-10">
      <div className="flex justify-between items-center mb-6">
        <Link href="/admin/users" className="text-blue-500 hover:text-blue-700">
          ← Back to Users
        </Link>
        
        <Button type="submit" form="user-edit-form" className="flex items-center gap-2">
          <SaveIcon className="h-4 w-4" />
          Save Changes
        </Button>
      </div>

      <h1 className="text-3xl font-bold mb-6">Edit User</h1>

      <form id="user-edit-form" action="/api/admin/users/update" method="POST" className="space-y-6">
        <input type="hidden" name="id" value={userData.id} />
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle>Basic Information</CardTitle>
              <CardDescription>User profile information</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="id">ID (Read-only)</Label>
                <Input id="id" value={userData.id} disabled />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="name">Name</Label>
                <Input id="name" name="name" defaultValue={userData.name} />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="email">Email (Read-only)</Label>
                <Input id="email" value={userData.email} disabled />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="role">Role</Label>
                <Select name="role" defaultValue={userData.role}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select role" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value={userRoles.ADMIN}>{userRoles.ADMIN}</SelectItem>
                    <SelectItem value={userRoles.USER}>{userRoles.USER}</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="image">Profile Image URL</Label>
                <Input id="image" name="image" defaultValue={userData.image || ''} />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Account Status</CardTitle>
              <CardDescription>User account verification and status</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <Label htmlFor="emailVerified" className="font-semibold">Email Verified</Label>
                <Switch 
                  id="emailVerified" 
                  name="emailVerified" 
                  defaultChecked={userData.emailVerified}
                />
              </div>
              
              <div className="flex items-center justify-between">
                <Label htmlFor="banned" className="font-semibold">Banned</Label>
                <Switch 
                  id="banned" 
                  name="banned" 
                  defaultChecked={userData.banned || false}
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="banReason">Ban Reason</Label>
                <Input 
                  id="banReason" 
                  name="banReason" 
                  defaultValue={userData.banReason || ''}
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="banExpires">Ban Expires (Unix Timestamp)</Label>
                <Input 
                  id="banExpires" 
                  name="banExpires" 
                  defaultValue={userData.banExpires?.toString() || ''}
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="createdAt">Created At (Read-only)</Label>
                <Input 
                  id="createdAt" 
                  value={userData.createdAt ? new Date(userData.createdAt).toLocaleString() : 'N/A'} 
                  disabled
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="updatedAt">Updated At (Read-only)</Label>
                <Input 
                  id="updatedAt" 
                  value={userData.updatedAt ? new Date(userData.updatedAt).toLocaleString() : 'N/A'} 
                  disabled
                />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Authentication</CardTitle>
              <CardDescription>Provider and phone verification</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="provider">Provider</Label>
                <Input id="provider" name="provider" defaultValue={userData.provider || ''} />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="providerId">Provider ID</Label>
                <Input id="providerId" name="providerId" defaultValue={userData.providerId || ''} />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="phoneNumber">Phone Number</Label>
                <Input id="phoneNumber" name="phoneNumber" defaultValue={userData.phoneNumber || ''} />
              </div>
              
              <div className="flex items-center justify-between">
                <Label htmlFor="phoneNumberVerified" className="font-semibold">Phone Verified</Label>
                <Switch 
                  id="phoneNumberVerified" 
                  name="phoneNumberVerified" 
                  defaultChecked={userData.phoneNumberVerified || false}
                />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Actions</CardTitle>
              <CardDescription>Save or delete this user</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <Button 
                  type="submit" 
                  form="user-edit-form" 
                  className="flex items-center gap-2"
                >
                  <SaveIcon className="h-4 w-4" />
                  Save Changes
                </Button>
                
                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <Button variant="destructive" type="button" className="flex items-center gap-2">
                      <Trash2Icon className="h-4 w-4" />
                      Delete User
                    </Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                      <AlertDialogDescription>
                        This action cannot be undone. This will permanently delete the user
                        and remove their data from our servers.
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel>Cancel</AlertDialogCancel>
                      <form action="/api/admin/users/delete" method="POST">
                        <input type="hidden" name="id" value={userData.id} />
                        <AlertDialogAction type="submit" className="bg-red-600 hover:bg-red-700">
                          Delete
                        </AlertDialogAction>
                      </form>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              </div>
            </CardContent>
            <CardFooter className="text-sm text-gray-500">
              All changes will be logged for accountability.
            </CardFooter>
          </Card>
        </div>
      </form>
    </div>
  )
} 