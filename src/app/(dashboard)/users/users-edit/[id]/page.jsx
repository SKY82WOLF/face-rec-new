import { Suspense } from 'react'

import UserEditClient from './UserEditClient'

// Mock data for development
const mockUsers = [
  {
    id: 1,
    fullName: 'John Doe',
    username: 'johndoe',
    email: 'john@example.com',
    avatar: '/images/avatars/1.png',
    role: 'Admin',
    status: 'Active',
    phone: '+1 (123) 456-7890',
    address: '123 Main St, New York, NY 10001',
    bio: 'Frontend developer with expertise in React, Next.js, and Material UI.'
  },
  {
    id: 2,
    fullName: 'Jane Smith',
    username: 'janesmith',
    email: 'jane@example.com',
    avatar: '/images/avatars/2.png',
    role: 'User',
    status: 'Active',
    phone: '+1 (234) 567-8901',
    address: '456 Oak St, Los Angeles, CA 90001',
    bio: 'Backend developer specializing in Node.js and Python.'
  }
]

export function generateStaticParams() {
  // Generate static paths for all mock users
  return mockUsers.map(user => ({
    id: user.id.toString()
  }))
}

export default function UserEditPage({ params }) {
  const userId = parseInt(params.id)
  const user = mockUsers.find(u => u.id === userId)

  if (!user) {
    return null
  }

  return (
    <Suspense fallback={<div>Loading...</div>}>
      <UserEditClient initialUser={user} />
    </Suspense>
  )
}
