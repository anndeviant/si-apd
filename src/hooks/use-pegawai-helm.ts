"use client";

import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/lib/supabase/client";

import { toast } from "sonner";
import {
    uploadAndUpdateApdDocumentation,
    deleteAndUpdateApdDocumentation
} from "@/lib/uploads/apd-documentation";

export interface PegawaiHelmData {
    id: number;
    no: number;
    nama?: string;
    nip?: string;
    warna_helm?: string;
    link_helm?: string;
}

export function usePegawaiHelm() {
    const [pegawaiData, setPegawaiData] = useState<PegawaiHelmData[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isUpdating, setIsUpdating] = useState<{ [key: number]: boolean }>({});

    // Fetch data pegawai yang memiliki data helm
    const fetchPegawaiHelm = useCallback(async () => {
        try {
            setIsLoading(true);

            const { data, error } = await supabase
                .from("pegawai")
                .select("id, nama, nip, warna_helm, link_helm")
                .not("warna_helm", "is", null)
                .neq("warna_helm", "")
                .order("nama", { ascending: true });

            if (error) {
                console.error("Error fetching pegawai helm:", error);
                toast.error("Gagal mengambil data pegawai helm");
                return;
            }

            // Format data dengan nomor urut
            const formattedData: PegawaiHelmData[] = (data || []).map((item, index) => ({
                ...item,
                no: index + 1
            }));

            setPegawaiData(formattedData);
        } catch (error) {
            console.error("Error in fetchPegawaiHelm:", error);
            toast.error("Terjadi kesalahan saat mengambil data pegawai helm");
        } finally {
            setIsLoading(false);
        }
    }, []);



    // Upload file dokumentasi helm dan update database
    const uploadHelmDocumentation = useCallback(async (pegawaiId: number, file: File) => {
        try {
            setIsUpdating(prev => ({ ...prev, [pegawaiId]: true }));

            const result = await uploadAndUpdateApdDocumentation(file, "HELM", pegawaiId);

            if (result.success) {
                // Update local state
                setPegawaiData(prev => prev.map(item =>
                    item.id === pegawaiId
                        ? { ...item, link_helm: result.url }
                        : item
                ));
                toast.success("Dokumentasi helm berhasil diupload dan disimpan");
                return true;
            } else {
                toast.error(result.error || "Gagal mengupload dokumentasi helm");
                return false;
            }
        } catch (error) {
            console.error("Error in uploadHelmDocumentation:", error);
            toast.error("Terjadi kesalahan saat mengupload dokumentasi helm");
            return false;
        } finally {
            setIsUpdating(prev => ({ ...prev, [pegawaiId]: false }));
        }
    }, []);

    // Delete documentation file and update database
    const deleteLinkHelm = useCallback(async (pegawaiId: number, currentLink?: string) => {
        try {
            setIsUpdating(prev => ({ ...prev, [pegawaiId]: true }));

            if (!currentLink) {
                toast.error("Tidak ada dokumentasi untuk dihapus");
                return false;
            }

            const result = await deleteAndUpdateApdDocumentation(currentLink, "HELM", pegawaiId);

            if (result.success) {
                // Update local state
                setPegawaiData(prev => prev.map(item =>
                    item.id === pegawaiId
                        ? { ...item, link_helm: undefined }
                        : item
                ));
                toast.success("Dokumentasi helm berhasil dihapus");
                return true;
            } else {
                toast.error(result.error || "Gagal menghapus dokumentasi helm");
                return false;
            }
        } catch (error) {
            console.error("Error in deleteLinkHelm:", error);
            toast.error("Terjadi kesalahan saat menghapus dokumentasi helm");
            return false;
        } finally {
            setIsUpdating(prev => ({ ...prev, [pegawaiId]: false }));
        }
    }, []);

    useEffect(() => {
        fetchPegawaiHelm();
    }, [fetchPegawaiHelm]);

    return {
        pegawaiData,
        isLoading,
        isUpdating,
        fetchPegawaiHelm,
        uploadHelmDocumentation,
        deleteLinkHelm
    };
}