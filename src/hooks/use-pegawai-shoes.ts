"use client";

import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/lib/supabase/client";

import { toast } from "sonner";
import {
    uploadAndUpdateApdDocumentation,
    deleteAndUpdateApdDocumentation
} from "@/lib/uploads/apd-documentation";

export interface PegawaiShoesData {
    id: number;
    no: number;
    nama?: string;
    nip?: string;
    size_sepatu?: number;
    jenis_sepatu?: string;
    link_shoes?: string;
}

export function usePegawaiShoes() {
    const [pegawaiData, setPegawaiData] = useState<PegawaiShoesData[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isUpdating, setIsUpdating] = useState<{ [key: number]: boolean }>({});

    // Fetch data pegawai yang memiliki data sepatu
    const fetchPegawaiShoes = useCallback(async () => {
        try {
            setIsLoading(true);

            const { data, error } = await supabase
                .from("pegawai")
                .select("id, nama, nip, size_sepatu, jenis_sepatu, link_shoes")
                .or("size_sepatu.not.is.null,jenis_sepatu.not.is.null")
                .or("size_sepatu.neq.0,jenis_sepatu.neq.''")
                .order("nama", { ascending: true });

            if (error) {
                console.error("Error fetching pegawai shoes:", error);
                toast.error("Gagal mengambil data pegawai safety shoes");
                return;
            }

            // Filter data yang memiliki informasi sepatu
            const filteredData = (data || []).filter(item =>
                (item.size_sepatu && item.size_sepatu > 0) ||
                (item.jenis_sepatu && item.jenis_sepatu.trim() !== "")
            );

            // Format data dengan nomor urut
            const formattedData: PegawaiShoesData[] = filteredData.map((item, index) => ({
                ...item,
                no: index + 1
            }));

            setPegawaiData(formattedData);
        } catch (error) {
            console.error("Error in fetchPegawaiShoes:", error);
            toast.error("Terjadi kesalahan saat mengambil data pegawai safety shoes");
        } finally {
            setIsLoading(false);
        }
    }, []);

    // Upload file dokumentasi shoes dan update database
    const uploadShoesDocumentation = useCallback(async (pegawaiId: number, file: File) => {
        try {
            setIsUpdating(prev => ({ ...prev, [pegawaiId]: true }));

            const result = await uploadAndUpdateApdDocumentation(file, "SHOES", pegawaiId);

            if (result.success) {
                // Update local state
                setPegawaiData(prev => prev.map(item =>
                    item.id === pegawaiId
                        ? { ...item, link_shoes: result.url }
                        : item
                ));
                toast.success("Dokumentasi safety shoes berhasil diupload dan disimpan");
                return true;
            } else {
                toast.error(result.error || "Gagal mengupload dokumentasi safety shoes");
                return false;
            }
        } catch (error) {
            console.error("Error in uploadShoesDocumentation:", error);
            toast.error("Terjadi kesalahan saat mengupload dokumentasi safety shoes");
            return false;
        } finally {
            setIsUpdating(prev => ({ ...prev, [pegawaiId]: false }));
        }
    }, []);

    // Delete documentation file and update database
    const deleteLinkShoes = useCallback(async (pegawaiId: number, currentLink?: string) => {
        try {
            setIsUpdating(prev => ({ ...prev, [pegawaiId]: true }));

            if (!currentLink) {
                toast.error("Tidak ada dokumentasi untuk dihapus");
                return false;
            }

            const result = await deleteAndUpdateApdDocumentation(currentLink, "SHOES", pegawaiId);

            if (result.success) {
                // Update local state
                setPegawaiData(prev => prev.map(item =>
                    item.id === pegawaiId
                        ? { ...item, link_shoes: undefined }
                        : item
                ));
                toast.success("Dokumentasi safety shoes berhasil dihapus");
                return true;
            } else {
                toast.error(result.error || "Gagal menghapus dokumentasi safety shoes");
                return false;
            }
        } catch (error) {
            console.error("Error in deleteLinkShoes:", error);
            toast.error("Terjadi kesalahan saat menghapus dokumentasi safety shoes");
            return false;
        } finally {
            setIsUpdating(prev => ({ ...prev, [pegawaiId]: false }));
        }
    }, []);

    useEffect(() => {
        fetchPegawaiShoes();
    }, [fetchPegawaiShoes]);

    return {
        pegawaiData,
        isLoading,
        isUpdating,
        fetchPegawaiShoes,
        uploadShoesDocumentation,
        deleteLinkShoes
    };
}