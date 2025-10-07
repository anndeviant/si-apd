"use client";

import React, { useState } from "react";
import { Search, Trash2, Loader2, X, Download, Edit } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
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
import { exportPegawaiToExcel } from "@/lib/exports";
import type { PegawaiWithRelations } from "@/lib/types/database";

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
    handleUpdatePegawai,
  } = usePegawaiData();

  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [selectedPegawaiId, setSelectedPegawaiId] = useState<number | null>(
    null
  );
  const [selectedPegawaiName, setSelectedPegawaiName] = useState<string>("");
  const [isDeleting, setIsDeleting] = useState(false);

  // Edit modal states
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [selectedPegawai, setSelectedPegawai] =
    useState<PegawaiWithRelations | null>(null);
  const [isUpdating, setIsUpdating] = useState(false);
  const [editFormData, setEditFormData] = useState({
    size_sepatu: "",
    jenis_sepatu: "",
    warna_katelpack: "",
    size_katelpack: "",
    warna_helm: "",
  });

  // Handle delete button click
  const handleDeleteClick = (id: number, nama: string) => {
    setSelectedPegawaiId(id);
    setSelectedPegawaiName(nama);
    setDeleteDialogOpen(true);
  };

  // Handle edit button click
  const handleEditClick = (pegawai: PegawaiWithRelations) => {
    setSelectedPegawai(pegawai);
    setEditFormData({
      size_sepatu: pegawai.size_sepatu?.toString() || "",
      jenis_sepatu: pegawai.jenis_sepatu || "",
      warna_katelpack: pegawai.warna_katelpack || "",
      size_katelpack: pegawai.size_katelpack || "",
      warna_helm: pegawai.warna_helm || "",
    });
    setEditDialogOpen(true);
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

  // Update edit form field
  const updateEditField = (field: string, value: string) => {
    setEditFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  // Confirm edit
  const confirmEdit = async () => {
    if (!selectedPegawai) return;

    try {
      setIsUpdating(true);
      const updateData = {
        size_sepatu: editFormData.size_sepatu
          ? Number(editFormData.size_sepatu)
          : null,
        jenis_sepatu: editFormData.jenis_sepatu || null,
        warna_katelpack: editFormData.warna_katelpack || null,
        size_katelpack: editFormData.size_katelpack || null,
        warna_helm: editFormData.warna_helm || null,
      };

      const success = await handleUpdatePegawai(selectedPegawai.id, updateData);

      if (success) {
        toast.success(
          `Data pegawai "${selectedPegawai.nama}" berhasil diupdate`
        );
        setEditDialogOpen(false);
        setSelectedPegawai(null);
      } else {
        toast.error("Gagal mengupdate data pegawai");
      }
    } catch {
      toast.error("Terjadi kesalahan saat mengupdate data");
    } finally {
      setIsUpdating(false);
    }
  };

  const clearMessages = () => {
    setError(null);
  };

  // Handle export to Excel
  const handleExportExcel = () => {
    try {
      const filename = exportPegawaiToExcel(groupedPegawai, {
        filename: "Data_Pegawai_Mandatory_APD",
        sheetName: "Data Pegawai",
      });
      toast.success(`Data berhasil diexport ke file: ${filename}`);
    } catch (error) {
      console.error("Export error:", error);
      toast.error("Gagal export data ke Excel");
    }
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
            placeholder="Cari Pegawai..."
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

      {/* Export Buttons */}
      <div className="flex flex-col sm:flex-row gap-3 sm:justify-end">
        <Button
          onClick={handleExportExcel}
          disabled={isLoading || pegawaiList.length === 0}
          className="w-full sm:w-auto flex items-center space-x-2"
          variant="outline"
        >
          <Download className="h-4 w-4" />
          <span>Export Excel</span>
        </Button>
      </div>

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
                <TableHead className="min-w-[80px] text-center border text-xs p-2">
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
                  </TableRow>
                  {/* Data Pegawai dalam Divisi */}
                  {group.pegawai.map((pegawai, index) => (
                    <TableRow key={pegawai.id}>
                      <TableCell className="text-center border text-xs p-2">
                        {index + 1}
                      </TableCell>
                      <TableCell className="text-left border text-xs p-2">
                        {pegawai.nama?.trim() || "-"}
                      </TableCell>
                      <TableCell className="text-center border text-xs p-2">
                        {pegawai.posisi?.nama_posisi || "-"}
                      </TableCell>
                      <TableCell className="text-center border text-xs p-2">
                        {pegawai.size_sepatu || "-"}
                      </TableCell>
                      <TableCell className="text-left border text-xs p-2">
                        {pegawai.jenis_sepatu?.trim() || "-"}
                      </TableCell>
                      <TableCell className="text-center border text-xs p-2">
                        {pegawai.warna_katelpack?.trim() || "-"}
                      </TableCell>
                      <TableCell className="text-center border text-xs p-2">
                        {pegawai.size_katelpack?.trim() || "-"}
                      </TableCell>
                      <TableCell className="text-center border text-xs p-2">
                        {pegawai.warna_helm?.trim() || "-"}
                      </TableCell>
                      <TableCell className="text-center border text-xs p-2 font-mono">
                        {pegawai.nip?.trim() || "-"}
                      </TableCell>
                      <TableCell className="text-center border text-xs p-2">
                        <div className="flex items-center justify-center space-x-1">
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => handleEditClick(pegawai)}
                            className="h-6 w-6 p-0 text-blue-600 hover:text-blue-700 hover:bg-blue-50"
                          >
                            <Edit className="h-3 w-3" />
                          </Button>
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
                        </div>
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

      {/* Edit Dialog */}
      <AlertDialog open={editDialogOpen} onOpenChange={setEditDialogOpen}>
        <AlertDialogContent className="max-w-xs sm:max-w-md max-h-[95vh] overflow-y-auto my-2">
          <AlertDialogHeader className="text-center">
            <AlertDialogTitle>Edit Data APD Pegawai</AlertDialogTitle>
            <AlertDialogDescription className="text-center">
              &quot;{selectedPegawai?.nama}&quot;
            </AlertDialogDescription>
          </AlertDialogHeader>

          <div className="grid gap-3 py-3">
            {/* Size Sepatu */}
            <div className="grid gap-1">
              <Label htmlFor="edit-size-sepatu" className="text-xs font-medium">
                Size Sepatu
              </Label>
              <Input
                id="edit-size-sepatu"
                type="number"
                placeholder="Contoh: 42"
                value={editFormData.size_sepatu}
                onChange={(e) => updateEditField("size_sepatu", e.target.value)}
                className="h-7 text-sm"
              />
            </div>

            {/* Jenis Sepatu */}
            <div className="grid gap-1">
              <Label
                htmlFor="edit-jenis-sepatu"
                className="text-sm font-medium"
              >
                Jenis Sepatu
              </Label>
              <Input
                id="edit-jenis-sepatu"
                type="text"
                placeholder="Contoh: A"
                value={editFormData.jenis_sepatu}
                onChange={(e) =>
                  updateEditField("jenis_sepatu", e.target.value)
                }
                className="h-7 text-sm"
              />
            </div>

            {/* Warna Katelpack */}
            <div className="grid gap-1">
              <Label
                htmlFor="edit-warna-katelpack"
                className="text-xs font-medium"
              >
                Warna Katelpack
              </Label>
              <Input
                id="edit-warna-katelpack"
                type="text"
                placeholder="Contoh: Biru"
                value={editFormData.warna_katelpack}
                onChange={(e) =>
                  updateEditField("warna_katelpack", e.target.value)
                }
                className="h-7 text-sm"
              />
            </div>

            {/* Size Katelpack */}
            <div className="grid gap-1">
              <Label
                htmlFor="edit-size-katelpack"
                className="text-xs font-medium"
              >
                Size Katelpack
              </Label>
              <Input
                id="edit-size-katelpack"
                type="text"
                placeholder="Contoh: L"
                value={editFormData.size_katelpack}
                onChange={(e) =>
                  updateEditField("size_katelpack", e.target.value)
                }
                className="h-7 text-sm"
              />
            </div>

            {/* Warna Helm */}
            <div className="grid gap-1">
              <Label htmlFor="edit-warna-helm" className="text-xs font-medium">
                Warna Helm
              </Label>
              <Input
                id="edit-warna-helm"
                type="text"
                placeholder="Contoh: Putih"
                value={editFormData.warna_helm}
                onChange={(e) => updateEditField("warna_helm", e.target.value)}
                className="h-7 text-sm"
              />
            </div>
          </div>

          <AlertDialogFooter>
            <AlertDialogCancel disabled={isUpdating}>Batal</AlertDialogCancel>
            <AlertDialogAction
              onClick={confirmEdit}
              disabled={isUpdating}
              className="bg-blue-600 hover:bg-blue-700 focus:ring-blue-600"
            >
              {isUpdating ? (
                <>
                  <Loader2 className="mr-2 h-3 w-3 animate-spin" />
                  Menyimpan...
                </>
              ) : (
                <>
                  <Edit className="mr-2 h-3 w-3" />
                  Simpan
                </>
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Konfirmasi Hapus Data</AlertDialogTitle>
            <AlertDialogDescription>
              Apakah Anda yakin ingin menghapus data pegawai &quot;
              {selectedPegawaiName}&quot;?
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
