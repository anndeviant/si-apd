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
import { Edit, Upload, Trash2 } from "lucide-react";

import { usePegawaiShoes, PegawaiShoesData } from "@/hooks/use-pegawai-shoes";

export default function PegawaiShoesTable() {
  const {
    pegawaiData,
    isLoading,
    isUpdating,
    uploadShoesDocumentation,
    deleteLinkShoes,
  } = usePegawaiShoes();

  const [editingId, setEditingId] = useState<number | null>(null);
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
          <p className="text-sm text-gray-600">
            Kelola dokumentasi serah terima safety shoes untuk setiap pegawai
          </p>
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
        <p className="text-sm text-gray-600">
          Kelola dokumentasi serah terima safety shoes untuk setiap pegawai
        </p>
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
                  {pegawai.link_shoes ? (
                    <div className="flex items-center justify-center">
                      <div className="relative group">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img
                          src={pegawai.link_shoes}
                          alt={`Safety Shoes ${pegawai.nama}`}
                          className="w-10 h-10 object-cover rounded border border-gray-200 cursor-pointer hover:scale-110 transition-transform"
                          onClick={() =>
                            handlePreview(pegawai.link_shoes as string)
                          }
                          onError={(e) => {
                            const target = e.target as HTMLImageElement;
                            target.style.display = "none";
                            const parent = target.parentElement?.parentElement;
                            if (parent) {
                              parent.innerHTML =
                                '<span class="text-xs text-red-500">Gagal memuat gambar</span>';
                            }
                          }}
                        />
                        <div className="absolute -top-8 left-1/2 transform -translate-x-1/2 bg-black text-white text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap z-10">
                          Klik untuk memperbesar
                        </div>
                      </div>
                    </div>
                  ) : (
                    <span className="text-xs text-gray-500">-</span>
                  )}
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
