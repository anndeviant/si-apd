"use client";

import React, { useState } from "react";
import { Plus, FileDown, Loader2, Edit, Trash2 } from "lucide-react";
import {
  Table,
  TableBody,
  TableHead,
  TableHeader,
  TableRow,
  TableCell,
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
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { DatePickerWithInput } from "@/components/ui/date-picker";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
// import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { usePengajuanApd, usePengajuanForm } from "@/hooks/use-pengajuan-apd";
import { exportPengajuanApdToExcel } from "@/lib/exports";
import { createLocalDate } from "@/lib/database/pengajuan-apd";
import type { PengajuanApd } from "@/lib/types/database";

export default function PengajuanKpi() {
  // Previously used userId for file upload, now using CRUD operations with database
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editId, setEditId] = useState<number | null>(null);
  const [isExporting, setIsExporting] = useState(false);

  // Delete dialog states
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [deleteId, setDeleteId] = useState<number | null>(null);
  const [deleteName, setDeleteName] = useState<string>("");
  const [isDeleting, setIsDeleting] = useState(false);

  // Use custom hooks
  const {
    pengajuanItems,
    isLoading,
    isSubmitting,
    createPengajuan,
    updatePengajuan,
    deletePengajuan,
  } = usePengajuanApd();

  const {
    formData,
    updateField,
    resetForm,
    setFormDataComplete,
    calculateTotal,
  } = usePengajuanForm();

  const handleAddClick = () => {
    resetForm();
    setEditId(null);
    setShowAddModal(true);
  };

  const handleEditClick = (item: PengajuanApd) => {
    setFormDataComplete({
      nama_project: item.nama_project,
      nomor_project: item.nomor_project,
      kepala_project: item.kepala_project,
      progres: item.progres,
      keterangan: item.keterangan || "",
      tanggal: createLocalDate(item.tanggal),
      apd_nama: item.apd_nama,
      jumlah: item.jumlah,
      unit: item.unit,
      harga: item.harga,
    });
    setEditId(item.id);
    setShowEditModal(true);
  };

  const handleDeleteClick = (item: PengajuanApd) => {
    setDeleteId(item.id);
    setDeleteName(item.nama_project);
    setShowDeleteDialog(true);
  };

  const confirmDelete = async () => {
    if (!deleteId) return;

    try {
      setIsDeleting(true);
      const success = await deletePengajuan(deleteId);

      if (success) {
        setShowDeleteDialog(false);
        setDeleteId(null);
        setDeleteName("");
      }
    } catch {
      toast.error("Terjadi kesalahan saat menghapus data");
    } finally {
      setIsDeleting(false);
    }
  };

  const handleSubmit = async () => {
    let success = false;

    if (editId) {
      success = await updatePengajuan(editId, formData);
      if (success) {
        setShowEditModal(false);
      }
    } else {
      success = await createPengajuan(formData);
      if (success) {
        setShowAddModal(false);
      }
    }

    if (success) {
      resetForm();
      setEditId(null);
    }
  };

  const formatDate = (dateString: string | null | undefined): string => {
    if (!dateString) return "-";
    return new Date(dateString).toLocaleDateString("id-ID");
  };

  const formatCurrency = (amount: number): string => {
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      minimumFractionDigits: 0,
    }).format(amount);
  };

  const handleExportExcel = async () => {
    try {
      setIsExporting(true);

      if (pengajuanItems.length === 0) {
        toast.error("Tidak ada data untuk diexport");
        return;
      }

      // Transform data sesuai interface yang dibutuhkan
      const exportData = pengajuanItems.map((item) => ({
        id: item.id,
        nama_project: item.nama_project,
        nomor_project: item.nomor_project,
        kepala_project: item.kepala_project,
        progres: item.progres,
        keterangan: item.keterangan,
        tanggal: item.tanggal,
        apd_nama: item.apd_nama,
        jumlah: item.jumlah,
        unit: item.unit,
        harga: item.harga,
        total: item.total,
      }));

      exportPengajuanApdToExcel(exportData);
      toast.success("Data berhasil diexport ke Excel");
    } catch (err) {
      toast.error("Gagal export data ke Excel");
      console.error(err);
    } finally {
      setIsExporting(false);
    }
  };

  const progresOptions = [
    "Draft",
    "Review",
    "Approved",
    "Rejected",
    "Complete",
  ];

  return (
    <div className="space-y-4">
      {/* Header with Add Button */}
      <div className="flex flex-col gap-4 sm:flex-row sm:justify-between sm:items-start">
        <div>
          <h3 className="text-lg font-semibold text-gray-900 mb-2">
            Pengajuan APD
          </h3>
          <p className="text-sm text-gray-600">
            Kelola data pengajuan pembelian APD untuk project
          </p>
        </div>
        <div className="flex flex-col gap-2 sm:flex-row sm:gap-3">
          <Button
            onClick={handleExportExcel}
            disabled={isLoading || isExporting || pengajuanItems.length === 0}
            className="bg-green-600 hover:bg-green-700 text-white flex items-center gap-2 w-full sm:w-fit"
          >
            {isExporting ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                Exporting...
              </>
            ) : (
              <>
                <FileDown className="h-4 w-4" />
                Export Excel
              </>
            )}
          </Button>
          <Button
            onClick={handleAddClick}
            className="flex items-center gap-2 w-full sm:w-fit"
          >
            <Plus className="h-4 w-4" />
            Tambah Pengajuan
          </Button>
        </div>
      </div>

      {/* Data Table */}
      {isLoading ? (
        <div className="flex items-center justify-center py-8 text-sm text-gray-500">
          <Loader2 className="h-4 w-4 animate-spin mr-2" />
          Loading data...
        </div>
      ) : pengajuanItems.length === 0 ? (
        <div className="text-center py-8 text-gray-500">
          <p className="text-sm">Belum ada data pengajuan</p>
        </div>
      ) : (
        <div className="w-full overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="min-w-[40px] text-center border text-xs p-2">
                  NO
                </TableHead>
                <TableHead className="min-w-[150px] text-center border text-xs p-2">
                  NAMA PROJECT
                </TableHead>
                <TableHead className="min-w-[100px] text-center border text-xs p-2">
                  NOMOR PROJECT
                </TableHead>
                <TableHead className="min-w-[150px] text-center border text-xs p-2">
                  KEPALA PROJECT
                </TableHead>
                <TableHead className="min-w-[80px] text-center border text-xs p-2">
                  PROGRES
                </TableHead>
                <TableHead className="min-w-[100px] text-center border text-xs p-2">
                  TANGGAL
                </TableHead>
                <TableHead className="min-w-[150px] text-center border text-xs p-2">
                  NAMA APD
                </TableHead>
                <TableHead className="min-w-[60px] text-center border text-xs p-2">
                  QTY
                </TableHead>
                <TableHead className="min-w-[80px] text-center border text-xs p-2">
                  UNIT
                </TableHead>
                <TableHead className="min-w-[100px] text-center border text-xs p-2">
                  HARGA
                </TableHead>
                <TableHead className="min-w-[100px] text-center border text-xs p-2">
                  TOTAL
                </TableHead>
                <TableHead className="min-w-[80px] text-center border text-xs p-2">
                  AKSI
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {pengajuanItems.map((item, index) => (
                <TableRow key={item.id}>
                  <TableCell className="border text-center text-xs p-2">
                    {index + 1}
                  </TableCell>
                  <TableCell className="border text-xs p-2">
                    {item.nama_project}
                  </TableCell>
                  <TableCell className="border text-center text-xs p-2">
                    {item.nomor_project}
                  </TableCell>
                  <TableCell className="border text-xs p-2">
                    {item.kepala_project}
                  </TableCell>
                  <TableCell className="border text-center text-xs p-2">
                    <span
                      className={`px-2 py-1 rounded text-xs ${
                        item.progres === "Draft"
                          ? "bg-gray-100 text-gray-600"
                          : item.progres === "Review"
                          ? "bg-yellow-100 text-yellow-600"
                          : item.progres === "Approved"
                          ? "bg-green-100 text-green-600"
                          : item.progres === "Rejected"
                          ? "bg-red-100 text-red-600"
                          : item.progres === "Complete"
                          ? "bg-blue-100 text-blue-600"
                          : "bg-gray-100 text-gray-600"
                      }`}
                    >
                      {item.progres}
                    </span>
                  </TableCell>
                  <TableCell className="border text-center text-xs p-2">
                    {formatDate(item.tanggal)}
                  </TableCell>
                  <TableCell className="border text-xs p-2">
                    {item.apd_nama}
                  </TableCell>
                  <TableCell className="border text-center text-xs p-2">
                    {item.jumlah}
                  </TableCell>
                  <TableCell className="border text-center text-xs p-2">
                    {item.unit}
                  </TableCell>
                  <TableCell className="border text-right text-xs p-2">
                    {formatCurrency(item.harga)}
                  </TableCell>
                  <TableCell className="border text-right text-xs p-2 font-medium">
                    {formatCurrency(item.total)}
                  </TableCell>
                  <TableCell className="border text-center text-xs p-2">
                    <div className="flex items-center justify-center gap-1">
                      <Button
                        onClick={() => handleEditClick(item)}
                        variant="outline"
                        size="sm"
                        className="h-7 w-7 p-0"
                      >
                        <Edit className="h-3 w-3" />
                      </Button>
                      <Button
                        onClick={() => handleDeleteClick(item)}
                        variant="destructive"
                        size="sm"
                        className="h-7 w-7 p-0"
                      >
                        <Trash2 className="h-3 w-3" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>

          {/* Footer Info */}
          <div className="mt-3 text-xs text-gray-500 text-center">
            Total: {pengajuanItems.length} record
          </div>
        </div>
      )}

      {/* Add Modal */}
      <AlertDialog open={showAddModal} onOpenChange={setShowAddModal}>
        <AlertDialogContent className="max-w-2xl w-[calc(100vw-2rem)]">
          <AlertDialogHeader>
            <AlertDialogTitle>Tambah Data Pengajuan</AlertDialogTitle>
            <AlertDialogDescription>
              Tambahkan data pengajuan APD baru
            </AlertDialogDescription>
          </AlertDialogHeader>

          <div className="space-y-4 py-2 max-h-[60vh] overflow-y-auto">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="nama_project">Nama Project *</Label>
                <Input
                  id="nama_project"
                  value={formData.nama_project}
                  onChange={(e) => updateField("nama_project", e.target.value)}
                  placeholder="Masukkan nama project"
                  disabled={isSubmitting}
                />
              </div>

              <div className="grid gap-2">
                <Label htmlFor="nomor_project">Nomor Project *</Label>
                <Input
                  id="nomor_project"
                  value={formData.nomor_project}
                  onChange={(e) => updateField("nomor_project", e.target.value)}
                  placeholder="Masukkan nomor project"
                  disabled={isSubmitting}
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="kepala_project">Kepala Project *</Label>
                <Input
                  id="kepala_project"
                  value={formData.kepala_project}
                  onChange={(e) =>
                    updateField("kepala_project", e.target.value)
                  }
                  placeholder="Masukkan kepala project"
                  disabled={isSubmitting}
                />
              </div>

              <div className="grid gap-2">
                <Label htmlFor="progres">Progres *</Label>
                <Select
                  value={formData.progres}
                  onValueChange={(value) => updateField("progres", value)}
                  disabled={isSubmitting}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Pilih progres" />
                  </SelectTrigger>
                  <SelectContent>
                    {progresOptions.map((option) => (
                      <SelectItem key={option} value={option}>
                        {option}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid gap-2">
              <Label htmlFor="tanggal">Tanggal *</Label>
              <DatePickerWithInput
                value={formData.tanggal}
                onChange={(date) => updateField("tanggal", date || new Date())}
                placeholder="Pilih tanggal"
                disabled={isSubmitting}
              />
            </div>

            <div className="grid gap-2">
              <Label htmlFor="apd_nama">Nama APD *</Label>
              <Input
                id="apd_nama"
                value={formData.apd_nama}
                onChange={(e) => updateField("apd_nama", e.target.value)}
                placeholder="Masukkan nama APD"
                disabled={isSubmitting}
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="jumlah">Jumlah *</Label>
                <Input
                  id="jumlah"
                  type="number"
                  min="1"
                  value={formData.jumlah}
                  onChange={(e) =>
                    updateField("jumlah", parseInt(e.target.value) || 1)
                  }
                  placeholder="Jumlah"
                  disabled={isSubmitting}
                />
              </div>

              <div className="grid gap-2">
                <Label htmlFor="unit">Unit *</Label>
                <Input
                  id="unit"
                  value={formData.unit}
                  onChange={(e) => updateField("unit", e.target.value)}
                  placeholder="pcs"
                  disabled={isSubmitting}
                />
              </div>

              <div className="grid gap-2">
                <Label htmlFor="harga">Harga *</Label>
                <Input
                  id="harga"
                  type="number"
                  min="0"
                  value={formData.harga}
                  onChange={(e) =>
                    updateField("harga", parseFloat(e.target.value) || 0)
                  }
                  placeholder="0"
                  disabled={isSubmitting}
                />
              </div>
            </div>

            <div className="grid gap-2">
              <Label>Total</Label>
              <div className="text-lg font-semibold text-green-600">
                {formatCurrency(calculateTotal())}
              </div>
            </div>

            <div className="grid gap-2">
              <Label htmlFor="keterangan">Keterangan</Label>
              <Input
                id="keterangan"
                value={formData.keterangan}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                  updateField("keterangan", e.target.value)
                }
                placeholder="Masukkan keterangan (opsional)"
                disabled={isSubmitting}
              />
            </div>
          </div>

          <AlertDialogFooter className="grid grid-cols-2 gap-3">
            <AlertDialogCancel disabled={isSubmitting} className="w-full">
              Batal
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={handleSubmit}
              disabled={isSubmitting}
              className="w-full"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Menyimpan...
                </>
              ) : (
                <>
                  <Plus className="w-4 h-4 mr-2" />
                  Tambah Data
                </>
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Edit Modal */}
      <AlertDialog open={showEditModal} onOpenChange={setShowEditModal}>
        <AlertDialogContent className="max-w-2xl w-[calc(100vw-2rem)]">
          <AlertDialogHeader>
            <AlertDialogTitle>Edit Data Pengajuan</AlertDialogTitle>
            <AlertDialogDescription>
              Perbarui data pengajuan APD
            </AlertDialogDescription>
          </AlertDialogHeader>

          <div className="space-y-4 py-2 max-h-[60vh] overflow-y-auto">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="edit_nama_project">Nama Project *</Label>
                <Input
                  id="edit_nama_project"
                  value={formData.nama_project}
                  onChange={(e) => updateField("nama_project", e.target.value)}
                  placeholder="Masukkan nama project"
                  disabled={isSubmitting}
                />
              </div>

              <div className="grid gap-2">
                <Label htmlFor="edit_nomor_project">Nomor Project *</Label>
                <Input
                  id="edit_nomor_project"
                  value={formData.nomor_project}
                  onChange={(e) => updateField("nomor_project", e.target.value)}
                  placeholder="Masukkan nomor project"
                  disabled={isSubmitting}
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="edit_kepala_project">Kepala Project *</Label>
                <Input
                  id="edit_kepala_project"
                  value={formData.kepala_project}
                  onChange={(e) =>
                    updateField("kepala_project", e.target.value)
                  }
                  placeholder="Masukkan kepala project"
                  disabled={isSubmitting}
                />
              </div>

              <div className="grid gap-2">
                <Label htmlFor="edit_progres">Progres *</Label>
                <Select
                  value={formData.progres}
                  onValueChange={(value) => updateField("progres", value)}
                  disabled={isSubmitting}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Pilih progres" />
                  </SelectTrigger>
                  <SelectContent>
                    {progresOptions.map((option) => (
                      <SelectItem key={option} value={option}>
                        {option}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid gap-2">
              <Label htmlFor="edit_tanggal">Tanggal *</Label>
              <DatePickerWithInput
                value={formData.tanggal}
                onChange={(date) => updateField("tanggal", date || new Date())}
                placeholder="Pilih tanggal"
                disabled={isSubmitting}
              />
            </div>

            <div className="grid gap-2">
              <Label htmlFor="edit_apd_nama">Nama APD *</Label>
              <Input
                id="edit_apd_nama"
                value={formData.apd_nama}
                onChange={(e) => updateField("apd_nama", e.target.value)}
                placeholder="Masukkan nama APD"
                disabled={isSubmitting}
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="edit_jumlah">Jumlah *</Label>
                <Input
                  id="edit_jumlah"
                  type="number"
                  min="1"
                  value={formData.jumlah}
                  onChange={(e) =>
                    updateField("jumlah", parseInt(e.target.value) || 1)
                  }
                  placeholder="Jumlah"
                  disabled={isSubmitting}
                />
              </div>

              <div className="grid gap-2">
                <Label htmlFor="edit_unit">Unit *</Label>
                <Input
                  id="edit_unit"
                  value={formData.unit}
                  onChange={(e) => updateField("unit", e.target.value)}
                  placeholder="pcs"
                  disabled={isSubmitting}
                />
              </div>

              <div className="grid gap-2">
                <Label htmlFor="edit_harga">Harga *</Label>
                <Input
                  id="edit_harga"
                  type="number"
                  min="0"
                  value={formData.harga}
                  onChange={(e) =>
                    updateField("harga", parseFloat(e.target.value) || 0)
                  }
                  placeholder="0"
                  disabled={isSubmitting}
                />
              </div>
            </div>

            <div className="grid gap-2">
              <Label>Total</Label>
              <div className="text-lg font-semibold text-green-600">
                {formatCurrency(calculateTotal())}
              </div>
            </div>

            <div className="grid gap-2">
              <Label htmlFor="edit_keterangan">Keterangan</Label>
              <Input
                id="edit_keterangan"
                value={formData.keterangan}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                  updateField("keterangan", e.target.value)
                }
                placeholder="Masukkan keterangan (opsional)"
                disabled={isSubmitting}
              />
            </div>
          </div>

          <AlertDialogFooter className="grid grid-cols-2 gap-3">
            <AlertDialogCancel disabled={isSubmitting} className="w-full">
              Batal
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={handleSubmit}
              disabled={isSubmitting}
              className="w-full"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Menyimpan...
                </>
              ) : (
                <>
                  <Edit className="w-4 h-4 mr-2" />
                  Update Data
                </>
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Konfirmasi Hapus Data</AlertDialogTitle>
            <AlertDialogDescription>
              Apakah Anda yakin ingin menghapus pengajuan &quot;{deleteName}
              &quot;? Tindakan ini tidak dapat dibatalkan.
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
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Menghapus...
                </>
              ) : (
                <>
                  <Trash2 className="w-4 h-4 mr-2" />
                  Hapus Data
                </>
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
