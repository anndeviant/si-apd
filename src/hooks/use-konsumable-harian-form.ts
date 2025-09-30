import { useState } from 'react';
import { createApdDaily, calculatePeriode, formatDate } from '@/lib/database/apd';
import type { CreateApdDailyData } from '@/lib/types/database';

export interface KonsumableHarianFormData {
    apd_id: number | null;
    tanggal: Date;
    nama: string;
    bengkel_id: number | null;
    qty: number;
}

const initialFormData: KonsumableHarianFormData = {
    apd_id: null,
    tanggal: new Date(),
    nama: '',
    bengkel_id: null,
    qty: 1,
};

export function useKonsumableHarianForm() {
    const [formData, setFormData] = useState<KonsumableHarianFormData>(initialFormData);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const updateField = <K extends keyof KonsumableHarianFormData>(
        field: K,
        value: KonsumableHarianFormData[K]
    ) => {
        setFormData(prev => ({
            ...prev,
            [field]: value,
        }));
        // Clear error when user makes changes
        if (error) setError(null);
    };

    const resetForm = () => {
        setFormData(initialFormData);
        setError(null);
    };

    const validateForm = (): string | null => {
        if (!formData.apd_id) {
            return 'Pilih barang APD terlebih dahulu';
        }
        if (!formData.nama.trim()) {
            return 'Nama penerima harus diisi';
        }
        if (!formData.bengkel_id) {
            return 'Bengkel/Unit harus diisi';
        }
        if (formData.qty < 1) {
            return 'Jumlah minimal 1';
        }
        return null;
    };

    const submitForm = async (): Promise<boolean> => {
        const validationError = validateForm();
        if (validationError) {
            setError(validationError);
            return false;
        }

        try {
            setIsSubmitting(true);
            setError(null);

            const tanggalString = formatDate(formData.tanggal);
            const periode = calculatePeriode(tanggalString);

            const dailyData: CreateApdDailyData = {
                apd_id: formData.apd_id!,
                tanggal: tanggalString,
                nama: formData.nama.trim(),
                bengkel_id: formData.bengkel_id!,
                qty: formData.qty,
                periode,
            };

            await createApdDaily(dailyData);
            resetForm();
            return true;
        } catch (err) {
            const errorMessage = err instanceof Error ? err.message : 'Failed to save data';
            setError(errorMessage);
            return false;
        } finally {
            setIsSubmitting(false);
        }
    };

    return {
        formData,
        updateField,
        resetForm,
        submitForm,
        isSubmitting,
        error,
        setError,
    };
}