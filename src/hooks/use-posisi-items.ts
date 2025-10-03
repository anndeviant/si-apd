import { useState, useEffect } from 'react';
import { fetchPosisi, createPosisi } from '@/lib/database/pegawai';
import type { Posisi, CreatePosisiData } from '@/lib/types/database';

export function usePosisiItems() {
    const [items, setItems] = useState<Posisi[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const loadItems = async () => {
        try {
            setLoading(true);
            setError(null);
            const data = await fetchPosisi();
            setItems(data);
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to load posisi items');
        } finally {
            setLoading(false);
        }
    };

    const addItem = async (itemData: CreatePosisiData) => {
        try {
            const newItem = await createPosisi(itemData);
            setItems(prev => [...prev, newItem].sort((a, b) => a.nama_posisi.localeCompare(b.nama_posisi)));
            return newItem;
        } catch (err) {
            const errorMessage = err instanceof Error ? err.message : 'Failed to create posisi item';
            setError(errorMessage);
            throw new Error(errorMessage);
        }
    };

    const refreshItems = () => {
        loadItems();
    };

    useEffect(() => {
        loadItems();
    }, []);

    return {
        items,
        loading,
        error,
        addItem,
        refreshItems,
    };
}