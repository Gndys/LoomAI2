import Link from 'next/link'
import { Button } from '@/components/ui/button'

export default function UserNotFound() {
  return (
    <div className="container mx-auto p-10 text-center">
      <h1 className="text-4xl font-bold mb-4">User Not Found</h1>
      <p className="text-gray-600 mb-8">
        The user you are looking for does not exist or has been removed.
      </p>
      <Link href="/admin/users">
        <Button>Return to Users List</Button>
      </Link>
    </div>
  )
} 