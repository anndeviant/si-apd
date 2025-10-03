import { useState, useEffect, useCallback } from 'react';
import { toast } from 'sonner';
import {
    generateBatchRekap,
    fetchApdMonthly,
    updateApdMonthly,
    getAvailableMonthlyPeriods,
    calculatePeriode
} from '@/lib/database/apd';
import type {
    ApdMonthlyWithRelations,
    UpdateApdMonthlyData
} from '@/lib/types/database';

export interface BatchRekapFormData {
    periode: Date;
}

export interface EditableMonthlyData {
    id: number;
    stock_awal: number;
    realisasi: number;
}

const initialFormData: BatchRekapFormData = {
    periode: new Date(),
};

export function useBatchRekap() {
    const [formData, setFormData] = useState<BatchRekapFormData>(initialFormData);
    const [monthlyData, setMonthlyData] = useState<ApdMonthlyWithRelations[]>([]);
    const [availablePeriods, setAvailablePeriods] = useState<string[]>([]);
    const [isGenerating, setIsGenerating] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [isUpdating, setIsUpdating] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [editingRow, setEditingRow] = useState<number | null>(null);
    const [editFormData, setEditFormData] = useState<EditableMonthlyData | null>(null);

    const loadAvailablePeriods = async () => {
        try {
            const periods = await getAvailableMonthlyPeriods();
            setAvailablePeriods(periods);
        } catch (err) {
            console.error('Failed to load available periods:', err);
        }
    };

    const loadMonthlyData = useCallback(async () => {
        try {
            setIsLoading(true);
            setError(null);

            const periodeString = calculatePeriode(formData.periode.toISOString().split('T')[0]);
            const data = await fetchApdMonthly({ periode: periodeString });
            setMonthlyData(data);
        } catch (err) {
            const errorMessage = err instanceof Error ? err.message : 'Failed to load monthly data';
            setError(errorMessage);
        } finally {
            setIsLoading(false);
        }
    }, [formData.periode]);

    // Load available periods on component mount
    useEffect(() => {
        loadAvailablePeriods();
    }, []);

    // Load monthly data when periode changes
    useEffect(() => {
        if (formData.periode) {
            loadMonthlyData();
        }
    }, [formData.periode, loadMonthlyData]);

    const updatePeriode = (periode: Date) => {
        setFormData({ periode });
        setError(null);
    };

    const generateRekap = async (): Promise<boolean> => {
        try {
            setIsGenerating(true);
            setError(null);

            const periodeString = calculatePeriode(formData.periode.toISOString().split('T')[0]);
            await generateBatchRekap(periodeString);

            toast.success('Batch rekap berhasil!');

            // Reload data after successful generation (akan otomatis sinkron dengan apd_items.jumlah)
            await loadMonthlyData();
            await loadAvailablePeriods();

            return true;
        } catch (err) {
            const errorMessage = err instanceof Error ? err.message : 'Failed to generate batch rekap';
            setError(errorMessage);
            return false;
        } finally {
            setIsGenerating(false);
        }
    };

    const startEdit = (row: ApdMonthlyWithRelations) => {
        setEditingRow(row.id);
        setEditFormData({
            id: row.id,
            stock_awal: row.apd_items?.jumlah || 0, // Real-time dari apd_items
            realisasi: row.realisasi || 0
        });
    };

    const cancelEdit = () => {
        setEditingRow(null);
        setEditFormData(null);
    };

    const updateEditFormData = <K extends keyof EditableMonthlyData>(
        field: K,
        value: EditableMonthlyData[K]
    ) => {
        if (editFormData) {
            setEditFormData({
                ...editFormData,
                [field]: value
            });
        }
    };

    const saveEdit = async (): Promise<boolean> => {
        if (!editFormData) {
            console.log('No editFormData available');
            return false;
        }

        try {
            setIsUpdating(true);
            setError(null);

            console.log('Saving edit data:', editFormData);
            const updateData: UpdateApdMonthlyData = {
                stock_awal: editFormData.stock_awal,
                realisasi: editFormData.realisasi
            };
            console.log('Update data:', updateData);

            await updateApdMonthly(editFormData.id, updateData);
            console.log('Update completed successfully');

            // Update local state
            setMonthlyData(prev =>
                prev.map(item =>
                    item.id === editFormData.id
                        ? {
                            ...item,
                            stock_awal: editFormData.stock_awal,
                            realisasi: editFormData.realisasi,
                            saldo_akhir: editFormData.stock_awal + editFormData.realisasi - (item.distribusi || 0)
                        }
                        : item
                )
            );

            toast.success('Data berhasil diupdate!');
            cancelEdit();
            return true;
        } catch (err) {
            const errorMessage = err instanceof Error ? err.message : 'Failed to update data';
            setError(errorMessage);
            return false;
        } finally {
            setIsUpdating(false);
        }
    };

    const saveEditWithData = async (id: number, updateData: UpdateApdMonthlyData): Promise<boolean> => {
        try {
            setIsUpdating(true);
            setError(null);

            console.log('saveEditWithData called with:', { id, updateData });
            await updateApdMonthly(id, updateData);
            console.log('Database update completed');

            // Refresh data dari database untuk mendapatkan nilai terbaru (termasuk sinkronisasi stock_awal)
            await loadMonthlyData();

            toast.success('Data berhasil diupdate!');
            return true;
        } catch (err) {
            const errorMessage = err instanceof Error ? err.message : 'Failed to update data';
            console.error('Save error:', errorMessage);
            setError(errorMessage);
            return false;
        } finally {
            setIsUpdating(false);
        }
    };

    const clearMessages = () => {
        setError(null);
    };

    const formatPeriodeName = (periode: string): string => {
        const date = new Date(periode);
        // Handle invalid dates
        if (isNaN(date.getTime())) {
            return 'Invalid Date';
        }
        const monthNames = [
            'Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni',
            'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'
        ];
        return `${monthNames[date.getMonth()]} ${date.getFullYear()}`;
    };

    return {
        // Form data
        formData,
        updatePeriode,

        // Monthly data
        monthlyData,
        availablePeriods,
        formatPeriodeName,

        // Loading states
        isGenerating,
        isLoading,
        isUpdating,

        // Actions
        generateRekap,
        loadMonthlyData,

        // Edit functionality
        editingRow,
        editFormData,
        startEdit,
        cancelEdit,
        updateEditFormData,
        saveEdit,
        saveEditWithData,

        // Messages
        error,
        clearMessages,
        setError,
    };
}