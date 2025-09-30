import { useState, useEffect } from 'react';
import { fetchBengkelItems, createBengkelItem } from '@/lib/database/apd';
import type { ApdBengkel, CreateBengkelData } from '@/lib/types/database';

export function useBengkelItems() {
    const [items, setItems] = useState<ApdBengkel[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const loadItems = async () => {
        try {
            setLoading(true);
            setError(null);
            const data = await fetchBengkelItems();
            setItems(data);
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to load bengkel items');
        } finally {
            setLoading(false);
        }
    };

    const addItem = async (itemData: CreateBengkelData) => {
        try {
            const newItem = await createBengkelItem(itemData);
            setItems(prev => [...prev, newItem]);
            return newItem;
        } catch (err) {
            const errorMessage = err instanceof Error ? err.message : 'Failed to create bengkel item';
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