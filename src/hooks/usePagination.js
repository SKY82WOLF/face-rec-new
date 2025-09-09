import { useState, useEffect } from 'react'

import { useRouter, useSearchParams } from 'next/navigation'

const usePagination = (initialPage = 1, initialPerPage = 10, perPageOptions = [10, 15, 20, 25, 30, 40, 50, 100]) => {
  const router = useRouter()
  const searchParams = useSearchParams()

  const [page, setPage] = useState(() => {
    const pageFromUrl = parseInt(searchParams.get('page'), 10)

    return pageFromUrl && pageFromUrl > 0 ? pageFromUrl : initialPage
  })

  const [per_page, setPerPage] = useState(() => {
    const perPageFromUrl = parseInt(searchParams.get('per_page'), 10)

    return perPageFromUrl && perPageOptions.includes(perPageFromUrl) ? perPageFromUrl : initialPerPage
  })

  useEffect(() => {
    const params = new URLSearchParams(searchParams)

    params.set('page', page.toString())
    params.set('per_page', per_page.toString())
    router.replace(`?${params.toString()}`, { scroll: false })
  }, [page, per_page, router, searchParams])

  const handlePageChange = (event, value) => {
    if (value && !isNaN(value)) {
      setPage(value)
    }
  }

  const handlePerPageChange = event => {
    setPerPage(event.target.value)
    setPage(1) // Reset to first page when changing items per page
  }

  return {
    page,
    per_page,
    setPage,
    setPerPage,
    handlePageChange,
    handlePerPageChange,
    perPageOptions
  }
}

export default usePagination
