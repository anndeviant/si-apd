"use client";

import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/lib/supabase/client";

import { toast } from "sonner";
import {
    uploadAndUpdateApdDocumentation,
    deleteAndUpdateApdDocumentation,
    generateSignedUrl
} from "@/lib/uploads/apd-documentation";

export interface PegawaiKatelpackData {
    id: number;
    no: number;
    nama?: string;
    nip?: string;
    warna_katelpack?: string;
    size_katelpack?: string;
    link_katelpack?: string;
    signed_url_katelpack?: string; // Generated on-demand signed URL
}

export function usePegawaiKatelpack() {
    const [pegawaiData, setPegawaiData] = useState<PegawaiKatelpackData[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isUpdating, setIsUpdating] = useState<{ [key: number]: boolean }>({});

    // Fetch data pegawai yang memiliki data katelpack
    const fetchPegawaiKatelpack = useCallback(async () => {
        try {
            setIsLoading(true);

            const { data, error } = await supabase
                .from("pegawai")
                .select("id, nama, nip, warna_katelpack, size_katelpack, link_katelpack")
                .or("warna_katelpack.not.is.null,size_katelpack.not.is.null")
                .or("warna_katelpack.neq.'',size_katelpack.neq.''")
                .order("nama", { ascending: true });

            if (error) {
                console.error("Error fetching pegawai katelpack:", error);
                toast.error("Gagal mengambil data pegawai katelpack");
                return;
            }

            // Filter data yang memiliki informasi katelpack
            const filteredData = (data || []).filter(item =>
                (item.warna_katelpack && item.warna_katelpack.trim() !== "") ||
                (item.size_katelpack && item.size_katelpack.trim() !== "")
            );

            // Format data dengan nomor urut dan generate signed URLs
            const formattedData: PegawaiKatelpackData[] = await Promise.all(
                filteredData.map(async (item, index) => {
                    let signed_url_katelpack: string | undefined;

                    // Generate signed URL if file path exists
                    if (item.link_katelpack && !item.link_katelpack.startsWith('http')) {
                        const signedResult = await generateSignedUrl(item.link_katelpack);
                        if (signedResult.success) {
                            signed_url_katelpack = signedResult.url;
                        }
                    } else if (item.link_katelpack && item.link_katelpack.startsWith('http')) {
                        // If it's already a URL (backward compatibility), use as is
                        signed_url_katelpack = item.link_katelpack;
                    }

                    return {
                        ...item,
                        no: index + 1,
                        signed_url_katelpack
                    };
                })
            );

            setPegawaiData(formattedData);
        } catch (error) {
            console.error("Error in fetchPegawaiKatelpack:", error);
            toast.error("Terjadi kesalahan saat mengambil data pegawai katelpack");
        } finally {
            setIsLoading(false);
        }
    }, []);

    // Upload file dokumentasi katelpack dan update database
    const uploadKatelpackDocumentation = useCallback(async (pegawaiId: number, file: File) => {
        try {
            setIsUpdating(prev => ({ ...prev, [pegawaiId]: true }));

            const result = await uploadAndUpdateApdDocumentation(file, "KATELPACK", pegawaiId);

            if (result.success) {
                // Generate signed URL for the new file
                const signedResult = await generateSignedUrl(result.url!);

                // Update local state
                setPegawaiData(prev => prev.map(item =>
                    item.id === pegawaiId
                        ? {
                            ...item,
                            link_katelpack: result.url,
                            signed_url_katelpack: signedResult.success ? signedResult.url : undefined
                        }
                        : item
                ));
                toast.success("Dokumentasi katelpack berhasil diupload dan disimpan");
                return true;
            } else {
                toast.error(result.error || "Gagal mengupload dokumentasi katelpack");
                return false;
            }
        } catch (error) {
            console.error("Error in uploadKatelpackDocumentation:", error);
            toast.error("Terjadi kesalahan saat mengupload dokumentasi katelpack");
            return false;
        } finally {
            setIsUpdating(prev => ({ ...prev, [pegawaiId]: false }));
        }
    }, []);

    // Delete documentation file and update database
    const deleteLinkKatelpack = useCallback(async (pegawaiId: number, currentLink?: string) => {
        try {
            setIsUpdating(prev => ({ ...prev, [pegawaiId]: true }));

            if (!currentLink) {
                toast.error("Tidak ada dokumentasi untuk dihapus");
                return false;
            }

            const result = await deleteAndUpdateApdDocumentation(currentLink, "KATELPACK", pegawaiId);

            if (result.success) {
                // Update local state
                setPegawaiData(prev => prev.map(item =>
                    item.id === pegawaiId
                        ? { ...item, link_katelpack: undefined, signed_url_katelpack: undefined }
                        : item
                ));
                toast.success("Dokumentasi katelpack berhasil dihapus");
                return true;
            } else {
                toast.error(result.error || "Gagal menghapus dokumentasi katelpack");
                return false;
            }
        } catch (error) {
            console.error("Error in deleteLinkKatelpack:", error);
            toast.error("Terjadi kesalahan saat menghapus dokumentasi katelpack");
            return false;
        } finally {
            setIsUpdating(prev => ({ ...prev, [pegawaiId]: false }));
        }
    }, []);

    useEffect(() => {
        fetchPegawaiKatelpack();
    }, [fetchPegawaiKatelpack]);

    return {
        pegawaiData,
        isLoading,
        isUpdating,
        fetchPegawaiKatelpack,
        uploadKatelpackDocumentation,
        deleteLinkKatelpack
    };
}