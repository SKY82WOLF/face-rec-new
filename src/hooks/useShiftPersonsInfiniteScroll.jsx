'use client'

import { useEffect, useRef, useCallback } from 'react'

import { useInfiniteQuery } from '@tanstack/react-query'

import { getShiftPersons } from '@/api/shifts'

const useShiftPersonsInfiniteScroll = (shiftId, containerRef) => {
  const { data, fetchNextPage, hasNextPage, isFetchingNextPage, isLoading, isError, error, refetch } = useInfiniteQuery(
    {
      queryKey: ['shiftPersonsInfinite', shiftId],
      queryFn: async ({ pageParam = 1 }) => {
        const response = await getShiftPersons(shiftId, {
          page: pageParam,
          per_page: 10 // Load 10 persons per page
        })

        return response
      },
      getNextPageParam: (lastPage, allPages) => {
        const totalPages = Math.ceil(lastPage.count / 10)
        const currentPage = allPages.length

        return currentPage < totalPages ? currentPage + 1 : undefined
      },
      enabled: !!shiftId,
      staleTime: 30 * 1000, // Consider data fresh for 30 seconds (shorter for more responsive updates)
      gcTime: 5 * 60 * 1000 // Keep in cache for 5 minutes
    }
  )

  // Flatten all pages into a single array
  const persons = data?.pages?.flatMap(page => page.results || []) || []

  // Auto-load first page when component mounts or shiftId changes
  useEffect(() => {
    if (shiftId && !isLoading && persons.length === 0 && hasNextPage) {
      fetchNextPage()
    }
  }, [shiftId, isLoading, persons.length, hasNextPage, fetchNextPage])

  // Only refetch if we don't have any data yet
  useEffect(() => {
    if (shiftId && !data && !isLoading) {
      refetch()
    }
  }, [shiftId, data, isLoading, refetch])

  // Auto-load more when scrolling near bottom
  const loadMore = useCallback(() => {
    if (hasNextPage && !isFetchingNextPage) {
      fetchNextPage()
    }
  }, [hasNextPage, isFetchingNextPage, fetchNextPage])

  // Scroll event handler
  useEffect(() => {
    const container = containerRef?.current

    if (!container) return

    const handleScroll = () => {
      const { scrollTop, scrollHeight, clientHeight } = container
      const threshold = 50 // Load more when 50px from bottom

      if (scrollHeight - scrollTop - clientHeight < threshold) {
        loadMore()
      }
    }

    // Add scroll listener
    container.addEventListener('scroll', handleScroll)

    // Also check on mount in case there's not enough content to scroll initially
    const checkInitialLoad = () => {
      const { scrollHeight, clientHeight } = container

      if (scrollHeight <= clientHeight && hasNextPage && !isFetchingNextPage) {
        loadMore()
      }
    }

    // Check after a short delay to ensure content is rendered
    const timeoutId = setTimeout(checkInitialLoad, 100)

    return () => {
      container.removeEventListener('scroll', handleScroll)
      clearTimeout(timeoutId)
    }
  }, [loadMore, containerRef, hasNextPage, isFetchingNextPage])

  return {
    persons,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    isLoading,
    isError,
    error,
    refetch
  }
}

export default useShiftPersonsInfiniteScroll
