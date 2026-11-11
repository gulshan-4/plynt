'use client'

import { useState } from 'react'
import { toggleFollow } from '@/app/actions/follows'
import { toast } from 'react-hot-toast'
import { useRouter } from 'next/navigation'

export default function FollowButton({ targetUserId, initialIsFollowing, isLoggedIn }) {
  const [isFollowing, setIsFollowing] = useState(initialIsFollowing)
  const [isLoading, setIsLoading] = useState(false)
  const router = useRouter()

  const handleFollow = async () => {
    if (!isLoggedIn) {
      toast.error('You must be logged in to follow users.')
      router.push('/sign-in')
      return
    }

    setIsLoading(true)
    
    // Optimistic update
    setIsFollowing(!isFollowing)

    const res = await toggleFollow(targetUserId)
    
    if (res.error) {
      // Revert on error
      setIsFollowing(isFollowing)
      toast.error(res.error)
    } else {
      toast.success(res.isFollowing ? 'Following!' : 'Unfollowed')
    }

    setIsLoading(false)
  }

  return (
    <button 
      onClick={handleFollow}
      disabled={isLoading}
      className={`px-6 py-2.5 font-semibold rounded-xl transition-colors w-full sm:w-auto shadow-sm ${
        isFollowing 
          ? 'bg-gray-100 hover:bg-gray-200 text-gray-800 border border-gray-200'
          : 'bg-blue-600 hover:bg-blue-700 text-white'
      } ${isLoading ? 'opacity-70 cursor-not-allowed' : ''}`}
    >
      {isFollowing ? 'Following' : 'Follow'}
    </button>
  )
}
