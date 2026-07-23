import { useState } from 'react';

/**
 * usePagination — Manages page/limit state for paginated lists.
 *
 * @param {number} initialPage
 * @param {number} initialLimit
 */
function usePagination(initialPage = 1, initialLimit = 10) {
  const [page, setPage] = useState(initialPage);
  const [limit, setLimit] = useState(initialLimit);

  const goToPage = (newPage) => setPage(newPage);
  const nextPage  = () => setPage((p) => p + 1);
  const prevPage  = () => setPage((p) => Math.max(1, p - 1));
  const reset     = () => setPage(1);

  return { page, limit, setLimit, goToPage, nextPage, prevPage, reset };
}

export default usePagination;
