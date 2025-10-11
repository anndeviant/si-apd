import { useState, useEffect, useMemo } from 'react';
import { fetchPegawai, deletePegawai, updatePegawai } from '@/lib/database/pegawai';
import type { PegawaiWithRelations, UpdatePegawaiData } from '@/lib/types/database';

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

            // Search di nama bengkel
            if (pegawai.bengkel?.name?.toLowerCase().includes(term)) {
                return true;
            }

            return false;
        });
    }, [pegawaiList, searchTerm]);

    // Group pegawai by divisi and bengkel
    const groupedPegawai = useMemo(() => {
        const divisiGroups: { [key: string]: PegawaiWithRelations[] } = {};

        filteredPegawai.forEach((pegawai) => {
            const divisiName = pegawai.divisi?.nama_divisi || 'Tanpa Divisi';
            if (!divisiGroups[divisiName]) {
                divisiGroups[divisiName] = [];
            }
            divisiGroups[divisiName].push(pegawai);
        });

        // Sort divisi alphabetically and create bengkel subgroups
        return Object.keys(divisiGroups)
            .sort()
            .map(divisiName => {
                const pegawaiInDivisi = divisiGroups[divisiName];

                // Group by bengkel within this divisi
                const bengkelGroups: { [key: string]: PegawaiWithRelations[] } = {};

                pegawaiInDivisi.forEach((pegawai) => {
                    const bengkelName = pegawai.bengkel?.name || 'Tanpa Bengkel';
                    if (!bengkelGroups[bengkelName]) {
                        bengkelGroups[bengkelName] = [];
                    }
                    bengkelGroups[bengkelName].push(pegawai);
                });

                // Sort bengkel alphabetically and return structured data
                const bengkelList = Object.keys(bengkelGroups)
                    .sort()
                    .map(bengkelName => ({
                        bengkel: bengkelName,
                        pegawai: bengkelGroups[bengkelName].sort((a, b) =>
                            (a.nama || '').localeCompare(b.nama || '')
                        )
                    }));

                return {
                    divisi: divisiName,
                    bengkelList: bengkelList
                };
            });
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

    // Handle update pegawai
    const handleUpdatePegawai = async (id: number, updateData: UpdatePegawaiData): Promise<boolean> => {
        try {
            await updatePegawai(id, updateData);
            // Reload data after successful update
            await loadPegawaiData();
            return true;
        } catch (err) {
            const errorMessage = err instanceof Error ? err.message : 'Gagal mengupdate data pegawai';
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
        handleUpdatePegawai,
        refreshData: loadPegawaiData,
    };
}