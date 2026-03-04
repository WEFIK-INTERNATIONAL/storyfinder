'use client';

import { useState, useEffect } from 'react';

export function useImageLoader(src) {
  const [loaded, setLoaded] = useState(false);
  const [error,  setError]  = useState(false);

  useEffect(() => {
    if (!src) return;
    let cancelled = false;
    setLoaded(false);
    setError(false);
    const img    = new Image();
    img.onload   = () => { if (!cancelled) setLoaded(true); };
    img.onerror  = () => { if (!cancelled) setError(true);  };
    img.src      = src;
    return () => { cancelled = true; };
  }, [src]);

  return { loaded, error };
}