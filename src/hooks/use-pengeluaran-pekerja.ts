import { useState, useEffect, useCallback } from 'react';
import { fetchPengeluaranPekerja, getAvailablePeriods, deleteApdDaily } from '@/lib/database/apd';
import type { PengeluaranPekerjaData } from '@/lib/types/database';

interface UsePengeluaranPekerjaOptions {
    periode?: string;
    apd_id?: number;
    autoFetch?: boolean;
}

export function usePengeluaranPekerja(options: UsePengeluaranPekerjaOptions = {}) {
    const [data, setData] = useState<PengeluaranPekerjaData[]>([]);
    const [availablePeriods, setAvailablePeriods] = useState<string[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const fetchData = useCallback(async () => {
        if (!options.periode && !options.apd_id) {
            return;
        }

        setLoading(true);
        setError(null);

        try {
            const result = await fetchPengeluaranPekerja({
                periode: options.periode,
                apd_id: options.apd_id,
            });
            setData(result);
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to fetch data');
        } finally {
            setLoading(false);
        }
    }, [options.periode, options.apd_id]);

    const fetchPeriods = async () => {
        try {
            const periods = await getAvailablePeriods();
            setAvailablePeriods(periods);
        } catch (err) {
            console.error('Failed to fetch periods:', err);
        }
    };

    useEffect(() => {
        fetchPeriods();
    }, []);

    useEffect(() => {
        if (options.autoFetch !== false) {
            fetchData();
        }
    }, [fetchData, options.autoFetch]);

    const refetch = useCallback(() => {
        fetchData();
    }, [fetchData]);

    const deleteData = useCallback(async (id: number) => {
        setLoading(true);
        setError(null);

        try {
            await deleteApdDaily(id);
            await refetch(); // Refresh data after deletion
            return true;
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to delete data');
            return false;
        } finally {
            setLoading(false);
        }
    }, [refetch]);

    return {
        data,
        availablePeriods,
        loading,
        error,
        refetch,
        deleteData,
    };
}

export function formatPeriodeDisplay(periode: string): string {
    try {
        if (!periode || typeof periode !== 'string') {
            return 'Periode tidak valid';
        }

        const date = new Date(periode);

        // Check if date is valid
        if (isNaN(date.getTime())) {
            return periode; // Return original if can't parse
        }

        const monthNames = [
            'Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni',
            'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'
        ];

        const monthIndex = date.getMonth();
        if (monthIndex < 0 || monthIndex > 11) {
            return periode; // Return original if month index is invalid
        }

        return `${monthNames[monthIndex]} ${date.getFullYear()}`;
    } catch (error) {
        console.error('Error formatting periode:', error);
        return periode; // Return original string if error occurs
    }
}

export function formatTanggal(tanggal: string): string {
    try {
        if (!tanggal || typeof tanggal !== 'string') {
            return 'Tanggal tidak valid';
        }

        const date = new Date(tanggal);

        // Check if date is valid
        if (isNaN(date.getTime())) {
            return tanggal; // Return original if can't parse
        }

        return `${date.getDate()}-${date.getMonth() + 1}-${date.getFullYear()}`;
    } catch (error) {
        console.error('Error formatting tanggal:', error);
        return tanggal; // Return original string if error occurs
    }
}