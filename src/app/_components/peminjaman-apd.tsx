"use client";

import { useState } from "react";
import { Plus, Edit, Loader2, Save, FileDown } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { DatePickerWithInput } from "@/components/ui/date-picker";
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
import {
  useApdPeminjaman,
  usePeminjamanForm,
} from "@/hooks/use-apd-peminjaman";
import type { ApdPeminjaman } from "@/lib/types/database";
import { exportPeminjamanApdToExcel } from "@/lib/exports";
import { createLocalDate } from "@/lib/utils";

export function PeminjamanApd() {
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editId, setEditId] = useState<number | null>(null);
  const [isExporting, setIsExporting] = useState(false);

  // Use custom hooks
  const {
    peminjamanItems,
    isLoading,
    isSubmitting,
    createPeminjaman,
    updatePeminjaman,
  } = useApdPeminjaman();

  const { formData, updateField, resetForm, setFormDataComplete } =
    usePeminjamanForm();

  const handleAddClick = () => {
    resetForm();
    setEditId(null);
    setShowAddModal(true);
  };

  const handleEditClick = (item: ApdPeminjaman) => {
    setFormDataComplete({
      nama_peminjam: item.nama_peminjam,
      divisi: item.divisi,
      nama_apd: item.nama_apd,
      tanggal_pinjam: createLocalDate(item.tanggal_pinjam),
      tanggal_kembali: item.tanggal_kembali
        ? createLocalDate(item.tanggal_kembali)
        : null,
    });
    setEditId(item.id);
    setShowEditModal(true);
  };

  const handleSubmit = async () => {
    let success = false;

    if (editId) {
      success = await updatePeminjaman(editId, formData);
      if (success) {
        setShowEditModal(false);
      }
    } else {
      success = await createPeminjaman(formData);
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

  const handleExportExcel = async () => {
    try {
      setIsExporting(true);

      if (peminjamanItems.length === 0) {
        toast.error("Tidak ada data untuk diexport");
        return;
      }

      // Transform data sesuai interface yang dibutuhkan
      const exportData = peminjamanItems.map((item) => ({
        id: item.id,
        nama_peminjam: item.nama_peminjam,
        divisi: item.divisi,
        nama_apd: item.nama_apd,
        tanggal_pinjam: item.tanggal_pinjam,
        tanggal_kembali: item.tanggal_kembali,
      }));

      exportPeminjamanApdToExcel(exportData);
      toast.success("Data berhasil diexport ke Excel");
    } catch (err) {
      toast.error("Gagal export data ke Excel");
      console.error(err);
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <div className="space-y-4">
      {/* Header with Add Button */}
      <div className="flex flex-col gap-4 sm:flex-row sm:justify-between sm:items-start">
        <div>
          <h3 className="text-lg font-semibold text-gray-900 mb-2">
            Peminjaman APD
          </h3>
          <p className="text-sm text-gray-600">
            Kelola data peminjaman APD oleh pekerja
          </p>
        </div>
        <div className="flex flex-col gap-2 sm:flex-row sm:gap-3">
          <Button
            onClick={handleExportExcel}
            disabled={isLoading || isExporting || peminjamanItems.length === 0}
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
            Tambah Peminjaman
          </Button>
        </div>
      </div>

      {/* Data Table */}
      {isLoading ? (
        <div className="flex items-center justify-center py-8 text-sm text-gray-500">
          <Loader2 className="h-4 w-4 animate-spin mr-2" />
          Loading data...
        </div>
      ) : peminjamanItems.length === 0 ? (
        <div className="text-center py-8 text-gray-500">
          <p className="text-sm">Belum ada data peminjaman</p>
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
                  NAMA PEMINJAM
                </TableHead>
                <TableHead className="min-w-[100px] text-center border text-xs p-2">
                  DIVISI
                </TableHead>
                <TableHead className="min-w-[150px] text-center border text-xs p-2">
                  NAMA APD
                </TableHead>
                <TableHead className="min-w-[100px] text-center border text-xs p-2">
                  TGL PINJAM
                </TableHead>
                <TableHead className="min-w-[100px] text-center border text-xs p-2">
                  TGL KEMBALI
                </TableHead>
                <TableHead className="min-w-[60px] text-center border text-xs p-2">
                  AKSI
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {peminjamanItems.map((item, index) => (
                <TableRow key={item.id}>
                  <TableCell className="text-center border text-xs p-2 font-medium">
                    {index + 1}
                  </TableCell>
                  <TableCell className="text-left border text-xs p-2 font-medium">
                    {item.nama_peminjam}
                  </TableCell>
                  <TableCell className="text-left border text-xs p-2">
                    {item.divisi}
                  </TableCell>
                  <TableCell className="text-left border text-xs p-2">
                    {item.nama_apd}
                  </TableCell>
                  <TableCell className="text-center border text-xs p-2">
                    {formatDate(item.tanggal_pinjam)}
                  </TableCell>
                  <TableCell className="text-center border text-xs p-2">
                    {formatDate(item.tanggal_kembali)}
                  </TableCell>
                  <TableCell className="text-center border text-xs p-2">
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => handleEditClick(item)}
                      className="h-6 w-6 p-0"
                    >
                      <Edit className="h-3 w-3" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>

          {/* Footer Info */}
          <div className="mt-3 text-xs text-gray-500 text-center">
            Total: {peminjamanItems.length} record
          </div>
        </div>
      )}

      {/* Add Modal */}
      <AlertDialog open={showAddModal} onOpenChange={setShowAddModal}>
        <AlertDialogContent className="max-w-sm w-[calc(100vw-2rem)]">
          <AlertDialogHeader>
            <AlertDialogTitle>Tambah Data Peminjaman</AlertDialogTitle>
            <AlertDialogDescription>
              Tambahkan data peminjaman APD baru
            </AlertDialogDescription>
          </AlertDialogHeader>

          <div className="space-y-4 py-2">
            <div className="grid gap-2">
              <Label htmlFor="nama_peminjam">Nama Peminjam *</Label>
              <Input
                id="nama_peminjam"
                value={formData.nama_peminjam}
                onChange={(e) => updateField("nama_peminjam", e.target.value)}
                placeholder="Masukkan nama peminjam"
                disabled={isSubmitting}
              />
            </div>

            <div className="grid gap-2">
              <Label htmlFor="divisi">Divisi *</Label>
              <Input
                id="divisi"
                value={formData.divisi}
                onChange={(e) => updateField("divisi", e.target.value)}
                placeholder="Masukkan nama divisi"
                disabled={isSubmitting}
              />
            </div>

            <div className="grid gap-2">
              <Label htmlFor="nama_apd">Nama APD *</Label>
              <Input
                id="nama_apd"
                value={formData.nama_apd}
                onChange={(e) => updateField("nama_apd", e.target.value)}
                placeholder="Masukkan nama APD yang dipinjam"
                disabled={isSubmitting}
              />
            </div>

            {/* Tanggal Pinjam & Kembali - Side by side di mobile */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="tanggal_pinjam">Tanggal Pinjam *</Label>
                <DatePickerWithInput
                  value={formData.tanggal_pinjam}
                  onChange={(date) =>
                    updateField("tanggal_pinjam", date || new Date())
                  }
                  placeholder="Pilih tanggal pinjam"
                  disabled={isSubmitting}
                />
              </div>

              <div className="grid gap-2">
                <Label htmlFor="tanggal_kembali">Tanggal Kembali</Label>
                <DatePickerWithInput
                  value={formData.tanggal_kembali || undefined}
                  onChange={(date) =>
                    updateField("tanggal_kembali", date || null)
                  }
                  placeholder="Pilih tanggal kembali (opsional)"
                  disabled={isSubmitting}
                />
              </div>
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
                  <Loader2 className="mr-2 h-3 w-3 animate-spin" />
                  Menyimpan...
                </>
              ) : (
                <>
                  <Save className="mr-2 h-3 w-3" />
                  Simpan
                </>
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Edit Modal */}
      <AlertDialog open={showEditModal} onOpenChange={setShowEditModal}>
        <AlertDialogContent className="max-w-sm w-[calc(100vw-2rem)]">
          <AlertDialogHeader>
            <AlertDialogTitle>Edit Data Peminjaman</AlertDialogTitle>
            <AlertDialogDescription>
              Perbarui data peminjaman APD
            </AlertDialogDescription>
          </AlertDialogHeader>

          <div className="space-y-4 py-2">
            <div className="grid gap-2">
              <Label htmlFor="edit_nama_peminjam">Nama Peminjam *</Label>
              <Input
                id="edit_nama_peminjam"
                value={formData.nama_peminjam}
                onChange={(e) => updateField("nama_peminjam", e.target.value)}
                placeholder="Masukkan nama peminjam"
                disabled={isSubmitting}
              />
            </div>

            <div className="grid gap-2">
              <Label htmlFor="edit_divisi">Divisi *</Label>
              <Input
                id="edit_divisi"
                value={formData.divisi}
                onChange={(e) => updateField("divisi", e.target.value)}
                placeholder="Masukkan nama divisi"
                disabled={isSubmitting}
              />
            </div>

            <div className="grid gap-2">
              <Label htmlFor="edit_nama_apd">Nama APD *</Label>
              <Input
                id="edit_nama_apd"
                value={formData.nama_apd}
                onChange={(e) => updateField("nama_apd", e.target.value)}
                placeholder="Masukkan nama APD yang dipinjam"
                disabled={isSubmitting}
              />
            </div>

            {/* Tanggal Pinjam & Kembali - Side by side di mobile */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="edit_tanggal_pinjam">Tanggal Pinjam *</Label>
                <DatePickerWithInput
                  value={formData.tanggal_pinjam}
                  onChange={(date) =>
                    updateField("tanggal_pinjam", date || new Date())
                  }
                  placeholder="Pilih tanggal pinjam"
                  disabled={isSubmitting}
                />
              </div>

              <div className="grid gap-2">
                <Label htmlFor="edit_tanggal_kembali">Tanggal Kembali</Label>
                <DatePickerWithInput
                  value={formData.tanggal_kembali || undefined}
                  onChange={(date) =>
                    updateField("tanggal_kembali", date || null)
                  }
                  placeholder="Pilih tanggal kembali (opsional)"
                  disabled={isSubmitting}
                />
              </div>
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
                  <Loader2 className="mr-2 h-3 w-3 animate-spin" />
                  Memperbarui...
                </>
              ) : (
                <>
                  <Save className="mr-2 h-3 w-3" />
                  Perbarui
                </>
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
