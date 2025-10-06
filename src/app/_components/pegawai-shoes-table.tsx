"use client";

import { useState, useRef } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Edit, Upload, Trash2, FileDown, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { ImagePreview } from "@/components/ui/image-preview";

import { usePegawaiShoes, PegawaiShoesData } from "@/hooks/use-pegawai-shoes";
import { exportPegawaiShoesToExcel } from "@/lib/exports";

export default function PegawaiShoesTable() {
  const {
    pegawaiData,
    isLoading,
    isUpdating,
    uploadShoesDocumentation,
    deleteLinkShoes,
  } = usePegawaiShoes();

  const [editingId, setEditingId] = useState<number | null>(null);
  const [isExporting, setIsExporting] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileUpload = async (pegawaiId: number, file: File) => {
    if (!file) return;

    const success = await uploadShoesDocumentation(pegawaiId, file);
    if (success) {
      setEditingId(null);
    }
  };

  const handleFileInputChange = (
    event: React.ChangeEvent<HTMLInputElement>,
    pegawaiId: number
  ) => {
    const file = event.target.files?.[0];
    if (file) {
      handleFileUpload(pegawaiId, file);
    }
    // Reset input value
    event.target.value = "";
  };

  const triggerFileInput = (pegawaiId: number) => {
    setEditingId(pegawaiId);
    fileInputRef.current?.click();
  };

  const handlePreview = (link: string) => {
    window.open(link, "_blank");
  };

  const handleExportExcel = async () => {
    try {
      setIsExporting(true);

      if (pegawaiData.length === 0) {
        toast.error("Tidak ada data untuk diexport");
        return;
      }

      // Transform data sesuai interface yang dibutuhkan untuk export
      const exportData = pegawaiData.map((item) => ({
        id: item.id,
        no: item.no,
        nama: item.nama,
        nip: item.nip,
        size_sepatu: item.size_sepatu,
        jenis_sepatu: item.jenis_sepatu,
        signed_url_sepatu: item.signed_url_shoes, // Perhatikan perbedaan nama field
      }));

      exportPegawaiShoesToExcel(exportData);
      toast.success("Data shoes berhasil diexport ke Excel");
    } catch (err) {
      toast.error("Gagal export data shoes ke Excel");
      console.error(err);
    } finally {
      setIsExporting(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="text-center">
          <div className="w-8 h-8 border-2 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-2"></div>
          <p className="text-sm text-gray-600">
            Memuat data pegawai safety shoes...
          </p>
        </div>
      </div>
    );
  }

  if (pegawaiData.length === 0) {
    return (
      <div className="space-y-4">
        <div>
          <h3 className="text-lg font-semibold text-gray-900">
            Data Serah Terima Safety Shoes
          </h3>
          <p className="text-sm text-gray-600 mb-4">
            Kelola dokumentasi serah terima safety shoes untuk setiap pegawai
          </p>
          <Button
            onClick={handleExportExcel}
            disabled={true}
            className="bg-green-600 hover:bg-green-700 text-white w-full opacity-50"
          >
            <FileDown className="mr-2 h-4 w-4" />
            Export Excel
          </Button>
        </div>
        <div className="flex items-center justify-center p-8">
          <div className="text-center text-gray-500">
            <p>Tidak ada data pegawai dengan informasi safety shoes</p>
            <p className="text-sm mt-1">
              Pastikan data pegawai sudah diinput dengan informasi sepatu
            </p>
          </div>
        </div>
        <div className="mt-3 text-xs text-gray-500 text-center">
          Total: 0 record
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div>
        <h3 className="text-lg font-semibold text-gray-900">
          Data Serah Terima Safety Shoes
        </h3>
        <p className="text-sm text-gray-600 mb-4">
          Kelola dokumentasi serah terima safety shoes untuk setiap pegawai
        </p>
        <Button
          onClick={handleExportExcel}
          disabled={isLoading || isExporting || pegawaiData.length === 0}
          className="bg-green-600 hover:bg-green-700 text-white w-full"
        >
          {isExporting ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Exporting...
            </>
          ) : (
            <>
              <FileDown className="mr-2 h-4 w-4" />
              Export Excel
            </>
          )}
        </Button>
      </div>

      <div className="w-full overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="min-w-[40px] text-center border text-xs p-2">
                NO
              </TableHead>
              <TableHead className="min-w-[120px] text-center border text-xs p-2">
                NAMA
              </TableHead>
              <TableHead className="min-w-[100px] text-center border text-xs p-2">
                NIP
              </TableHead>
              <TableHead className="min-w-[80px] text-center border text-xs p-2">
                SIZE SEPATU
              </TableHead>
              <TableHead className="min-w-[100px] text-center border text-xs p-2">
                JENIS SEPATU
              </TableHead>
              <TableHead className="min-w-[100px] text-center border text-xs p-2">
                DOKUMENTASI
              </TableHead>
              <TableHead className="min-w-[80px] text-center border text-xs p-2">
                AKSI
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {pegawaiData.map((pegawai: PegawaiShoesData) => (
              <TableRow key={pegawai.id}>
                <TableCell className="text-center border text-xs p-2 font-medium">
                  {pegawai.no}
                </TableCell>
                <TableCell className="text-left border text-xs p-2 font-medium">
                  {pegawai.nama || "-"}
                </TableCell>
                <TableCell className="text-center border text-xs p-2">
                  {pegawai.nip || "-"}
                </TableCell>
                <TableCell className="text-center border text-xs p-2">
                  {pegawai.size_sepatu || "-"}
                </TableCell>
                <TableCell className="text-center border text-xs p-2">
                  {pegawai.jenis_sepatu || "-"}
                </TableCell>
                <TableCell className="text-center border text-xs p-2">
                  <div className="flex justify-center items-center">
                    {pegawai.signed_url_shoes ? (
                      <ImagePreview
                        src={pegawai.signed_url_shoes}
                        alt={`Safety Shoes ${pegawai.nama}`}
                        onPreview={() =>
                          handlePreview(pegawai.signed_url_shoes as string)
                        }
                      />
                    ) : (
                      <span className="text-xs text-gray-500">-</span>
                    )}
                  </div>
                </TableCell>
                <TableCell className="text-center border text-xs p-2">
                  <div className="flex items-center justify-center space-x-1">
                    <Button
                      onClick={() => triggerFileInput(pegawai.id)}
                      disabled={isUpdating[pegawai.id]}
                      variant="ghost"
                      size="sm"
                      className="h-6 w-6 p-0"
                      title="Upload/Edit dokumentasi"
                    >
                      {isUpdating[pegawai.id] ? (
                        <div className="w-3 h-3 border border-gray-400 border-t-transparent rounded-full animate-spin" />
                      ) : pegawai.link_shoes ? (
                        <Edit className="w-3 h-3" />
                      ) : (
                        <Upload className="w-3 h-3" />
                      )}
                    </Button>

                    {pegawai.link_shoes && (
                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-6 w-6 p-0 text-red-600 hover:text-red-700"
                            disabled={isUpdating[pegawai.id]}
                            title="Hapus dokumentasi"
                          >
                            {isUpdating[pegawai.id] ? (
                              <div className="w-3 h-3 border border-red-600 border-t-transparent rounded-full animate-spin" />
                            ) : (
                              <Trash2 className="w-3 h-3" />
                            )}
                          </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                          <AlertDialogHeader>
                            <AlertDialogTitle>
                              Konfirmasi Hapus Dokumentasi
                            </AlertDialogTitle>
                            <AlertDialogDescription>
                              Apakah Anda yakin ingin menghapus dokumentasi
                              safety shoes untuk <strong>{pegawai.nama}</strong>
                              ? Tindakan ini tidak dapat dibatalkan.
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel>Batal</AlertDialogCancel>
                            <AlertDialogAction
                              onClick={() =>
                                deleteLinkShoes(pegawai.id, pegawai.link_shoes)
                              }
                              className="bg-red-600 hover:bg-red-700"
                            >
                              Hapus
                            </AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                    )}
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      {/* Total Records */}
      <div className="mt-3 text-xs text-gray-500 text-center">
        Total: {pegawaiData.length} record
      </div>

      {/* Hidden file input */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        onChange={(e) => editingId && handleFileInputChange(e, editingId)}
        className="hidden"
      />
    </div>
  );
}
