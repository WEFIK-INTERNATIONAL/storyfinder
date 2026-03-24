'use client';

import { useState, useEffect, useCallback } from 'react';

const API_URL = '/api/retouches';

export function useRetouchData() {
    const [works, setWorks] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const fetchData = useCallback(async () => {
        setLoading(true);
        setError(null);
        try {
            const ctrl = new AbortController();
            const t = setTimeout(() => ctrl.abort(), 10_000);

            const res = await fetch(API_URL, {
                signal: ctrl.signal,
                headers: { 'Content-Type': 'application/json' },
                next: { revalidate: 60 },
            });
            clearTimeout(t);

            if (!res.ok)
                throw new Error(`Server ${res.status}: ${res.statusText}`);
            const data = await res.json();
            if (!Array.isArray(data))
                throw new Error('API did not return an array');
            setWorks(data);
        } catch (err) {
            setError(
                err.name === 'AbortError' ? 'Request timed out.' : err.message
            );
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchData();
    }, [fetchData]);

    return { works, loading, error, refetch: fetchData };
}
