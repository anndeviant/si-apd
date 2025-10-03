import { useState, useEffect } from 'react';
import { fetchDivisi, createDivisi } from '@/lib/database/pegawai';
import type { Divisi, CreateDivisiData } from '@/lib/types/database';

export function useDivisiItems() {
    const [items, setItems] = useState<Divisi[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const loadItems = async () => {
        try {
            setLoading(true);
            setError(null);
            const data = await fetchDivisi();
            setItems(data);
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to load divisi items');
        } finally {
            setLoading(false);
        }
    };

    const addItem = async (itemData: CreateDivisiData) => {
        try {
            const newItem = await createDivisi(itemData);
            setItems(prev => [...prev, newItem].sort((a, b) => a.nama_divisi.localeCompare(b.nama_divisi)));
            return newItem;
        } catch (err) {
            const errorMessage = err instanceof Error ? err.message : 'Failed to create divisi item';
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