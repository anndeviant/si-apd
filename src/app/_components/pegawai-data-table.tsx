"use client";

import React, { useState } from "react";
import { Search, Trash2, Loader2, X } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { usePegawaiData } from "@/hooks/use-pegawai-data";

export default function PegawaiDataTable() {
  const {
    pegawaiList,
    groupedPegawai,
    isLoading,
    searchTerm,
    setSearchTerm,
    error,
    setError,
    handleDeletePegawai,
  } = usePegawaiData();

  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [selectedPegawaiId, setSelectedPegawaiId] = useState<number | null>(
    null
  );
  const [selectedPegawaiName, setSelectedPegawaiName] = useState<string>("");
  const [isDeleting, setIsDeleting] = useState(false);

  // Handle delete button click
  const handleDeleteClick = (id: number, nama: string) => {
    setSelectedPegawaiId(id);
    setSelectedPegawaiName(nama);
    setDeleteDialogOpen(true);
  };

  // Confirm delete
  const confirmDelete = async () => {
    if (!selectedPegawaiId) return;

    try {
      setIsDeleting(true);
      const success = await handleDeletePegawai(selectedPegawaiId);

      if (success) {
        toast.success(`Data pegawai "${selectedPegawaiName}" berhasil dihapus`);
        setDeleteDialogOpen(false);
        setSelectedPegawaiId(null);
        setSelectedPegawaiName("");
      } else {
        toast.error("Gagal menghapus data pegawai");
      }
    } catch {
      toast.error("Terjadi kesalahan saat menghapus data");
    } finally {
      setIsDeleting(false);
    }
  };

  const clearMessages = () => {
    setError(null);
  };

  return (
    <div className="space-y-4">
      {/* Header dengan Search */}
      <div className="flex flex-col space-y-4 sm:flex-row sm:items-center sm:justify-between sm:space-y-0">
        <div>
          <h3 className="text-lg font-semibold text-gray-900">
            Data Pegawai Mandatory APD
          </h3>
          <p className="text-sm text-gray-600">
            Kelola data pegawai dan APD wajib yang harus digunakan
          </p>
        </div>

        {/* Search Input */}
        <div className="relative w-full sm:w-80">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
          <Input
            type="text"
            placeholder="Cari berdasarkan nama, NIP, divisi, atau posisi..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10 pr-10"
          />
          {searchTerm && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setSearchTerm("")}
              className="absolute right-1 top-1/2 transform -translate-y-1/2 h-6 w-6 p-0 text-gray-400 hover:text-gray-600"
            >
              <X className="h-3 w-3" />
            </Button>
          )}
        </div>
      </div>

      {/* Search Results Info */}
      {searchTerm && !isLoading && (
        <div className="text-sm text-gray-600">
          Menampilkan {pegawaiList.length} hasil pencarian untuk &quot;
          {searchTerm}&quot;
        </div>
      )}

      {/* Error Message */}
      {error && (
        <div className="p-3 bg-red-50 border border-red-200 rounded text-sm">
          <div className="flex items-start justify-between">
            <p className="text-red-600 flex-1">{error}</p>
            <Button
              variant="ghost"
              size="sm"
              onClick={clearMessages}
              className="h-6 w-6 p-0 text-red-600 hover:text-red-700 shrink-0"
            >
              <X className="h-3 w-3" />
            </Button>
          </div>
        </div>
      )}

      {/* Data Table */}
      {isLoading ? (
        <div className="flex items-center justify-center py-8 text-sm text-gray-500">
          <Loader2 className="h-4 w-4 animate-spin mr-2" />
          Loading data pegawai...
        </div>
      ) : pegawaiList.length === 0 ? (
        <div className="text-center py-8 text-gray-500">
          <p className="text-sm">
            {searchTerm
              ? `Tidak ada data pegawai yang sesuai dengan pencarian "${searchTerm}"`
              : "Tidak ada data pegawai"}
          </p>
        </div>
      ) : (
        <div className="w-full overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow className="bg-red-100 hover:bg-red-100">
                <TableHead className="min-w-[40px] text-center border text-xs p-2">
                  NO
                </TableHead>
                <TableHead className="min-w-[150px] text-center border text-xs p-2">
                  NAMA
                </TableHead>
                <TableHead className="min-w-[120px] text-center border text-xs p-2">
                  POSISI
                </TableHead>
                <TableHead className="min-w-[80px] text-center border text-xs p-2">
                  <div className="flex flex-col">
                    <span>SIZE</span>
                    <span>(Sepatu)</span>
                  </div>
                </TableHead>
                <TableHead className="min-w-[100px] text-center border text-xs p-2">
                  <div className="flex flex-col">
                    <span>JENIS</span>
                    <span>SEPATU</span>
                  </div>
                </TableHead>
                <TableHead className="min-w-[120px] text-center border text-xs p-2">
                  <div className="flex flex-col">
                    <span>Warna</span>
                    <span>katelpack</span>
                  </div>
                </TableHead>
                <TableHead className="min-w-[100px] text-center border text-xs p-2">
                  <div className="flex flex-col">
                    <span>SIZE</span>
                    <span>(katelpack)</span>
                  </div>
                </TableHead>
                <TableHead className="min-w-[100px] text-center border text-xs p-2">
                  <div className="flex flex-col">
                    <span>WARNA</span>
                    <span>HELM</span>
                  </div>
                </TableHead>
                <TableHead className="min-w-[120px] text-center border text-xs p-2">
                  NIP
                </TableHead>
                <TableHead className="min-w-[60px] text-center border text-xs p-2">
                  AKSI
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {groupedPegawai.map((group, groupIndex) => (
                <React.Fragment key={`group-${groupIndex}`}>
                  {/* Separator Row untuk Divisi */}
                  <TableRow>
                    <TableCell
                      colSpan={10}
                      className="bg-blue-100 border text-xs p-2 font-semibold text-center uppercase"
                    >
                      {group.divisi}
                    </TableCell>
                  </TableRow>{" "}
                  {/* Data Pegawai dalam Divisi */}
                  {group.pegawai.map((pegawai, index) => (
                    <TableRow key={pegawai.id}>
                      <TableCell className="text-center border text-xs p-2">
                        {index + 1}
                      </TableCell>
                      <TableCell className="text-left border text-xs p-2">
                        {pegawai.nama || "-"}
                      </TableCell>
                      <TableCell className="text-center border text-xs p-2">
                        {pegawai.posisi?.nama_posisi || "-"}
                      </TableCell>
                      <TableCell className="text-center border text-xs p-2">
                        {pegawai.size_sepatu || "-"}
                      </TableCell>
                      <TableCell className="text-left border text-xs p-2">
                        {pegawai.jenis_sepatu || "-"}
                      </TableCell>
                      <TableCell className="text-center border text-xs p-2">
                        {pegawai.warna_katelpack || "-"}
                      </TableCell>
                      <TableCell className="text-center border text-xs p-2">
                        {pegawai.size_katelpack || "-"}
                      </TableCell>
                      <TableCell className="text-center border text-xs p-2">
                        {pegawai.warna_helm || "-"}
                      </TableCell>
                      <TableCell className="text-center border text-xs p-2 font-mono">
                        {pegawai.nip || "-"}
                      </TableCell>
                      <TableCell className="text-center border text-xs p-2">
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() =>
                            handleDeleteClick(
                              pegawai.id,
                              pegawai.nama || "Tidak diketahui"
                            )
                          }
                          className="h-6 w-6 p-0 text-red-600 hover:text-red-700 hover:bg-red-50"
                        >
                          <Trash2 className="h-3 w-3" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </React.Fragment>
              ))}
            </TableBody>
          </Table>

          {/* Footer Info */}
          <div className="mt-3 text-xs text-gray-500 text-center">
            Total: {pegawaiList.length} pegawai
            {searchTerm && ` (dari ${pegawaiList.length} hasil pencarian)`}
          </div>
        </div>
      )}

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Konfirmasi Hapus Data</AlertDialogTitle>
            <AlertDialogDescription>
              Apakah Anda yakin ingin menghapus data pegawai &quot;
              {selectedPegawaiName}&quot;?
              <br />
              <span className="text-red-600 font-medium">
                Tindakan ini tidak dapat dibatalkan.
              </span>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isDeleting}>Batal</AlertDialogCancel>
            <AlertDialogAction
              onClick={confirmDelete}
              disabled={isDeleting}
              className="bg-red-600 hover:bg-red-700 focus:ring-red-600"
            >
              {isDeleting ? (
                <>
                  <Loader2 className="mr-2 h-3 w-3 animate-spin" />
                  Menghapus...
                </>
              ) : (
                <>
                  <Trash2 className="mr-2 h-3 w-3" />
                  Hapus
                </>
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
