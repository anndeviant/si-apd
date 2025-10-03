import { useState } from 'react';
import { createPegawai } from '@/lib/database/pegawai';
import type { CreatePegawaiData } from '@/lib/types/database';

export interface MandatoryApdFormData {
    nama: string;
    nip: string;
    divisi_id: number | null;
    posisi_id: number | null;
    size_sepatu: number | null;
    jenis_sepatu: string;
    warna_katelpack: string;
    size_katelpack: string;
    warna_helm: string;
}

const initialFormData: MandatoryApdFormData = {
    nama: '',
    nip: '',
    divisi_id: null,
    posisi_id: null,
    size_sepatu: null,
    jenis_sepatu: '',
    warna_katelpack: '',
    size_katelpack: '',
    warna_helm: '',
};

export function useMandatoryApdForm() {
    const [formData, setFormData] = useState<MandatoryApdFormData>(initialFormData);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const updateField = <K extends keyof MandatoryApdFormData>(
        field: K,
        value: MandatoryApdFormData[K]
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
        if (!formData.nama.trim()) {
            return 'Nama pegawai harus diisi';
        }
        if (!formData.nip.trim()) {
            return 'NIP harus diisi';
        }
        if (!formData.divisi_id) {
            return 'Divisi harus dipilih';
        }
        if (!formData.posisi_id) {
            return 'Posisi harus dipilih';
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

            const pegawaiData: CreatePegawaiData = {
                nama: formData.nama.trim(),
                nip: formData.nip.trim(),
                divisi_id: formData.divisi_id!,
                posisi_id: formData.posisi_id!,
                size_sepatu: formData.size_sepatu || undefined,
                jenis_sepatu: formData.jenis_sepatu.trim() || undefined,
                warna_katelpack: formData.warna_katelpack.trim() || undefined,
                size_katelpack: formData.size_katelpack.trim() || undefined,
                warna_helm: formData.warna_helm.trim() || undefined,
            };

            await createPegawai(pegawaiData);

            resetForm();
            return true;
        } catch (err) {
            const errorMessage = err instanceof Error ? err.message : 'Gagal menyimpan data pegawai';
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