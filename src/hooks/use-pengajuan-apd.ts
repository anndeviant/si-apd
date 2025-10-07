import { useState, useEffect, useCallback } from 'react';
import { toast } from 'sonner';
import {
    fetchPengajuanApd,
    createPengajuanApd,
    updatePengajuanApd,
    deletePengajuanApd,
    formatDate
} from '@/lib/database/pengajuan-apd';
import type { PengajuanApd, CreatePengajuanApdData, UpdatePengajuanApdData } from '@/lib/types/database';

export interface PengajuanFormData {
    nama_project: string;
    nomor_project: string;
    kepala_project: string;
    progres: string;
    keterangan: string;
    tanggal: Date;
    apd_nama: string;
    jumlah: number;
    unit: string;
    harga: number;
}

const initialFormData: PengajuanFormData = {
    nama_project: '',
    nomor_project: '',
    kepala_project: '',
    progres: 'Draft',
    keterangan: '',
    tanggal: new Date(),
    apd_nama: '',
    jumlah: 1,
    unit: 'pcs',
    harga: 0,
};

interface UsePengajuanApdFilters {
    nama_project?: string;
    progres?: string;
}

export function usePengajuanApd(filters?: UsePengajuanApdFilters) {
    const [pengajuanItems, setPengajuanItems] = useState<PengajuanApd[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isSubmitting, setIsSubmitting] = useState(false);

    // Load pengajuan data
    const loadPengajuanData = useCallback(async () => {
        try {
            setIsLoading(true);
            const data = await fetchPengajuanApd(filters);
            setPengajuanItems(data);
        } catch (err) {
            const errorMessage = err instanceof Error ? err.message : 'Failed to load pengajuan data';
            toast.error(errorMessage);
        } finally {
            setIsLoading(false);
        }
    }, [filters]);

    useEffect(() => {
        loadPengajuanData();
    }, [loadPengajuanData]);

    // Create new pengajuan
    const createPengajuan = async (formData: PengajuanFormData): Promise<boolean> => {
        const validationError = validateForm(formData);
        if (validationError) {
            toast.error(validationError);
            return false;
        }

        try {
            setIsSubmitting(true);

            const submitData: CreatePengajuanApdData = {
                nama_project: formData.nama_project.trim(),
                nomor_project: formData.nomor_project.trim(),
                kepala_project: formData.kepala_project.trim(),
                progres: formData.progres,
                keterangan: formData.keterangan.trim() || undefined,
                tanggal: formatDate(formData.tanggal),
                apd_nama: formData.apd_nama.trim(),
                jumlah: formData.jumlah,
                unit: formData.unit,
                harga: formData.harga,
                // total will be calculated automatically by database
            };

            await createPengajuanApd(submitData);
            toast.success('Data pengajuan berhasil ditambahkan');
            await loadPengajuanData();
            return true;
        } catch (err) {
            const errorMessage = err instanceof Error ? err.message : 'Failed to create pengajuan';
            toast.error(errorMessage);
            return false;
        } finally {
            setIsSubmitting(false);
        }
    };

    // Update existing pengajuan
    const updatePengajuan = async (id: number, formData: PengajuanFormData): Promise<boolean> => {
        const validationError = validateForm(formData);
        if (validationError) {
            toast.error(validationError);
            return false;
        }

        try {
            setIsSubmitting(true);

            const updateData: UpdatePengajuanApdData = {
                nama_project: formData.nama_project.trim(),
                nomor_project: formData.nomor_project.trim(),
                kepala_project: formData.kepala_project.trim(),
                progres: formData.progres,
                keterangan: formData.keterangan.trim() || undefined,
                tanggal: formatDate(formData.tanggal),
                apd_nama: formData.apd_nama.trim(),
                jumlah: formData.jumlah,
                unit: formData.unit,
                harga: formData.harga,
                // total will be calculated automatically by database
            };

            await updatePengajuanApd(id, updateData);
            toast.success('Data pengajuan berhasil diperbarui');
            await loadPengajuanData();
            return true;
        } catch (err) {
            const errorMessage = err instanceof Error ? err.message : 'Failed to update pengajuan';
            toast.error(errorMessage);
            return false;
        } finally {
            setIsSubmitting(false);
        }
    };

    // Delete pengajuan
    const deletePengajuan = async (id: number): Promise<boolean> => {
        try {
            setIsSubmitting(true);

            await deletePengajuanApd(id);
            toast.success('Data pengajuan berhasil dihapus');
            await loadPengajuanData();
            return true;
        } catch (err) {
            const errorMessage = err instanceof Error ? err.message : 'Failed to delete pengajuan';
            toast.error(errorMessage);
            return false;
        } finally {
            setIsSubmitting(false);
        }
    };

    // Form validation
    const validateForm = (formData: PengajuanFormData): string | null => {
        if (!formData.nama_project.trim()) {
            return 'Nama project harus diisi';
        }
        if (!formData.nomor_project.trim()) {
            return 'Nomor project harus diisi';
        }
        if (!formData.kepala_project.trim()) {
            return 'Kepala project harus diisi';
        }
        if (!formData.apd_nama.trim()) {
            return 'Nama APD harus diisi';
        }
        if (formData.jumlah <= 0) {
            return 'Jumlah harus lebih dari 0';
        }
        if (formData.harga < 0) {
            return 'Harga tidak boleh kurang dari 0';
        }
        if (!formData.unit.trim()) {
            return 'Unit harus diisi';
        }

        return null;
    };

    // Refresh data
    const refreshData = () => {
        loadPengajuanData();
    };

    return {
        // Data
        pengajuanItems,

        // States
        isLoading,
        isSubmitting,

        // Actions
        createPengajuan,
        updatePengajuan,
        deletePengajuan,
        refreshData,

        // Utils
        validateForm,
        initialFormData,
    };
}

// Hook untuk form pengajuan dengan state management
export function usePengajuanForm(initialData?: Partial<PengajuanFormData>) {
    const [formData, setFormData] = useState<PengajuanFormData>({
        ...initialFormData,
        ...initialData,
    });

    const updateField = <K extends keyof PengajuanFormData>(
        field: K,
        value: PengajuanFormData[K]
    ) => {
        setFormData(prev => ({
            ...prev,
            [field]: value,
        }));
    };

    const resetForm = (newInitialData?: Partial<PengajuanFormData>) => {
        setFormData({
            ...initialFormData,
            ...newInitialData,
        });
    };

    const setFormDataComplete = (data: PengajuanFormData) => {
        setFormData(data);
    };

    // Calculate total automatically when jumlah or harga changes
    const calculateTotal = () => {
        return formData.jumlah * formData.harga;
    };

    return {
        formData,
        updateField,
        resetForm,
        setFormDataComplete,
        calculateTotal,
    };
}