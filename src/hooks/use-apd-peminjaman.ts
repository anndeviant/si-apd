import { useState, useEffect, useCallback } from 'react';
import { toast } from 'sonner';
import {
    fetchApdPeminjaman,
    createApdPeminjaman,
    updateApdPeminjaman,
    deleteApdPeminjaman,
    formatDate
} from '@/lib/database/apd';
import type { ApdPeminjaman, CreateApdPeminjamanData, UpdateApdPeminjamanData } from '@/lib/types/database';

export interface PeminjamanFormData {
    nama_peminjam: string;
    divisi: string;
    nama_apd: string;
    tanggal_pinjam: Date;
    tanggal_kembali: Date | null;
    status: string;
}

const initialFormData: PeminjamanFormData = {
    nama_peminjam: '',
    divisi: '',
    nama_apd: '',
    tanggal_pinjam: new Date(),
    tanggal_kembali: null,
    status: 'Dipinjam',
};

interface UseApdPeminjamanFilters {
    status?: string;
    nama_peminjam?: string;
    divisi?: string;
}

export function useApdPeminjaman(filters?: UseApdPeminjamanFilters) {
    const [peminjamanItems, setPeminjamanItems] = useState<ApdPeminjaman[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isSubmitting, setIsSubmitting] = useState(false);

    // Load peminjaman data
    const loadPeminjamanData = useCallback(async () => {
        try {
            setIsLoading(true);
            const data = await fetchApdPeminjaman(filters);
            setPeminjamanItems(data);
        } catch (err) {
            const errorMessage = err instanceof Error ? err.message : 'Failed to load peminjaman data';
            toast.error(errorMessage);
        } finally {
            setIsLoading(false);
        }
    }, [filters]);

    useEffect(() => {
        loadPeminjamanData();
    }, [loadPeminjamanData]);

    // Create new peminjaman
    const createPeminjaman = async (formData: PeminjamanFormData): Promise<boolean> => {
        const validationError = validateForm(formData);
        if (validationError) {
            toast.error(validationError);
            return false;
        }

        try {
            setIsSubmitting(true);

            const submitData: CreateApdPeminjamanData = {
                nama_peminjam: formData.nama_peminjam.trim(),
                divisi: formData.divisi.trim(),
                nama_apd: formData.nama_apd.trim(),
                tanggal_pinjam: formatDate(formData.tanggal_pinjam),
                tanggal_kembali: formData.tanggal_kembali
                    ? formatDate(formData.tanggal_kembali)
                    : undefined,
                status: formData.status,
            };

            await createApdPeminjaman(submitData);
            toast.success('Data peminjaman berhasil ditambahkan');
            await loadPeminjamanData();
            return true;
        } catch (err) {
            const errorMessage = err instanceof Error ? err.message : 'Failed to create peminjaman';
            toast.error(errorMessage);
            return false;
        } finally {
            setIsSubmitting(false);
        }
    };

    // Update existing peminjaman
    const updatePeminjaman = async (id: number, formData: PeminjamanFormData): Promise<boolean> => {
        const validationError = validateForm(formData);
        if (validationError) {
            toast.error(validationError);
            return false;
        }

        try {
            setIsSubmitting(true);

            const updateData: UpdateApdPeminjamanData = {
                nama_peminjam: formData.nama_peminjam.trim(),
                divisi: formData.divisi.trim(),
                nama_apd: formData.nama_apd.trim(),
                tanggal_pinjam: formatDate(formData.tanggal_pinjam),
                tanggal_kembali: formData.tanggal_kembali
                    ? formatDate(formData.tanggal_kembali)
                    : undefined,
                status: formData.status,
            };

            await updateApdPeminjaman(id, updateData);
            toast.success('Data peminjaman berhasil diperbarui');
            await loadPeminjamanData();
            return true;
        } catch (err) {
            const errorMessage = err instanceof Error ? err.message : 'Failed to update peminjaman';
            toast.error(errorMessage);
            return false;
        } finally {
            setIsSubmitting(false);
        }
    };

    // Delete peminjaman
    const deletePeminjaman = async (id: number): Promise<boolean> => {
        try {
            setIsSubmitting(true);

            await deleteApdPeminjaman(id);
            toast.success('Data peminjaman berhasil dihapus');
            await loadPeminjamanData();
            return true;
        } catch (err) {
            const errorMessage = err instanceof Error ? err.message : 'Failed to delete peminjaman';
            toast.error(errorMessage);
            return false;
        } finally {
            setIsSubmitting(false);
        }
    };

    // Form validation
    const validateForm = (formData: PeminjamanFormData): string | null => {
        if (!formData.nama_peminjam.trim()) {
            return 'Nama peminjam harus diisi';
        }
        if (!formData.divisi.trim()) {
            return 'Divisi harus diisi';
        }
        if (!formData.nama_apd.trim()) {
            return 'Nama APD harus diisi';
        }
        if (!formData.status) {
            return 'Status harus dipilih';
        }

        // Validate tanggal kembali tidak lebih awal dari tanggal pinjam
        if (formData.tanggal_kembali && formData.tanggal_kembali < formData.tanggal_pinjam) {
            return 'Tanggal kembali tidak boleh lebih awal dari tanggal pinjam';
        }

        return null;
    };

    // Refresh data
    const refreshData = () => {
        loadPeminjamanData();
    };

    return {
        // Data
        peminjamanItems,

        // States
        isLoading,
        isSubmitting,

        // Actions
        createPeminjaman,
        updatePeminjaman,
        deletePeminjaman,
        refreshData,

        // Utils
        validateForm,
        initialFormData,
    };
}

// Hook untuk form peminjaman dengan state management
export function usePeminjamanForm(initialData?: Partial<PeminjamanFormData>) {
    const [formData, setFormData] = useState<PeminjamanFormData>({
        ...initialFormData,
        ...initialData,
    });

    const updateField = <K extends keyof PeminjamanFormData>(
        field: K,
        value: PeminjamanFormData[K]
    ) => {
        setFormData(prev => ({
            ...prev,
            [field]: value,
        }));
    };

    const resetForm = (newInitialData?: Partial<PeminjamanFormData>) => {
        setFormData({
            ...initialFormData,
            ...newInitialData,
        });
    };

    const setFormDataComplete = (data: PeminjamanFormData) => {
        setFormData(data);
    };

    return {
        formData,
        updateField,
        resetForm,
        setFormDataComplete,
    };
}