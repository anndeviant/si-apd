import { useState, useEffect } from 'react';
import { fetchApdItems, createApdItem } from '@/lib/database/apd';
import type { ApdItem, CreateApdItemData } from '@/lib/types/database';

export function useApdItems() {
    const [items, setItems] = useState<ApdItem[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const loadItems = async () => {
        try {
            setLoading(true);
            setError(null);
            const data = await fetchApdItems();
            setItems(data);
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to load APD items');
        } finally {
            setLoading(false);
        }
    };

    const addItem = async (itemData: CreateApdItemData) => {
        try {
            const newItem = await createApdItem(itemData);
            setItems(prev => [...prev, newItem]);
            return newItem;
        } catch (err) {
            const errorMessage = err instanceof Error ? err.message : 'Failed to create APD item';
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