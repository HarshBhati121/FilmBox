import { useEffect, useRef, useCallback } from 'react';

export function useInfiniteScroll(onLoadMore, hasMore, loading) {
  const observer = useRef();

  const lastElementRef = useCallback((node) => {
    if (loading) return;
    if (observer.current) observer.current.disconnect();

    observer.current = new IntersectionObserver(entries => {
      if (entries[0].isIntersecting && hasMore) {
        onLoadMore();
      }
    });

    if (node) observer.current.observe(node);
  }, [loading, hasMore, onLoadMore]);

  return lastElementRef;
}
