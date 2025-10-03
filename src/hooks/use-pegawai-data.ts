import { useState, useEffect, useMemo } from 'react';
import { fetchPegawai, deletePegawai } from '@/lib/database/pegawai';
import type { PegawaiWithRelations } from '@/lib/types/database';

export function usePegawaiData() {
    const [pegawaiList, setPegawaiList] = useState<PegawaiWithRelations[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [error, setError] = useState<string | null>(null);

    // Load pegawai data
    const loadPegawaiData = async () => {
        try {
            setIsLoading(true);
            setError(null);
            const data = await fetchPegawai();
            setPegawaiList(data);
        } catch (err) {
            const errorMessage = err instanceof Error ? err.message : 'Gagal memuat data pegawai';
            setError(errorMessage);
        } finally {
            setIsLoading(false);
        }
    };

    // Initial load
    useEffect(() => {
        loadPegawaiData();
    }, []);

    // Filter pegawai berdasarkan search term
    const filteredPegawai = useMemo(() => {
        if (!searchTerm.trim()) {
            return pegawaiList;
        }

        const term = searchTerm.toLowerCase().trim();

        return pegawaiList.filter((pegawai) => {
            // Search di nama
            if (pegawai.nama?.toLowerCase().includes(term)) {
                return true;
            }

            // Search di NIP
            if (pegawai.nip?.toLowerCase().includes(term)) {
                return true;
            }

            // Search di nama divisi
            if (pegawai.divisi?.nama_divisi?.toLowerCase().includes(term)) {
                return true;
            }

            // Search di nama posisi
            if (pegawai.posisi?.nama_posisi?.toLowerCase().includes(term)) {
                return true;
            }

            return false;
        });
    }, [pegawaiList, searchTerm]);

    // Group pegawai by divisi
    const groupedPegawai = useMemo(() => {
        const groups: { [key: string]: PegawaiWithRelations[] } = {};

        filteredPegawai.forEach((pegawai) => {
            const divisiName = pegawai.divisi?.nama_divisi || 'Tanpa Divisi';
            if (!groups[divisiName]) {
                groups[divisiName] = [];
            }
            groups[divisiName].push(pegawai);
        });

        // Sort divisi alphabetically and return as array of objects
        return Object.keys(groups)
            .sort()
            .map(divisiName => ({
                divisi: divisiName,
                pegawai: groups[divisiName]
            }));
    }, [filteredPegawai]);    // Handle delete pegawai
    const handleDeletePegawai = async (id: number): Promise<boolean> => {
        try {
            await deletePegawai(id);
            // Reload data after successful delete
            await loadPegawaiData();
            return true;
        } catch (err) {
            const errorMessage = err instanceof Error ? err.message : 'Gagal menghapus data pegawai';
            setError(errorMessage);
            return false;
        }
    };

    return {
        pegawaiList: filteredPegawai,
        groupedPegawai,
        originalPegawaiList: pegawaiList,
        isLoading,
        searchTerm,
        setSearchTerm,
        error,
        setError,
        handleDeletePegawai,
        refreshData: loadPegawaiData,
    };
}