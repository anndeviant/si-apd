"use client";

import { useState, useMemo } from "react";
import {
  Plus,
  Edit,
  Loader2,
  Save,
  FileDown,
  Trash2,
  ChevronUp,
} from "lucide-react";
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

type SortField =
  | "nama_peminjam"
  | "divisi"
  | "nama_apd"
  | "tanggal_pinjam"
  | "tanggal_kembali";

export function PeminjamanApd() {
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editId, setEditId] = useState<number | null>(null);
  const [isExporting, setIsExporting] = useState(false);

  // Sorting state
  const [sortField, setSortField] = useState<SortField>("nama_peminjam");

  // Delete dialog states
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [deleteId, setDeleteId] = useState<number | null>(null);
  const [deleteName, setDeleteName] = useState<string>("");
  const [isDeleting, setIsDeleting] = useState(false);

  // Use custom hooks
  const {
    peminjamanItems,
    isLoading,
    isSubmitting,
    createPeminjaman,
    updatePeminjaman,
    deletePeminjaman,
  } = useApdPeminjaman();

  const { formData, updateField, resetForm, setFormDataComplete } =
    usePeminjamanForm();

  // Sorting functionality
  const handleSort = (field: SortField) => {
    setSortField(field);
  };

  // Memoized sorted data
  const sortedPeminjamanItems = useMemo(() => {
    return [...peminjamanItems].sort((a, b) => {
      let valueA: string | Date;
      let valueB: string | Date;

      switch (sortField) {
        case "tanggal_pinjam":
        case "tanggal_kembali":
          valueA = new Date(a[sortField] || "");
          valueB = new Date(b[sortField] || "");
          break;
        default:
          valueA = a[sortField] || "";
          valueB = b[sortField] || "";
      }

      if (valueA < valueB) return -1;
      if (valueA > valueB) return 1;
      return 0;
    });
  }, [peminjamanItems, sortField]);

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

  const handleDeleteClick = (item: ApdPeminjaman) => {
    setDeleteId(item.id);
    setDeleteName(item.nama_peminjam);
    setShowDeleteDialog(true);
  };

  const confirmDelete = async () => {
    if (!deleteId) return;

    try {
      setIsDeleting(true);
      const success = await deletePeminjaman(deleteId);

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

      if (sortedPeminjamanItems.length === 0) {
        toast.error("Tidak ada data untuk diexport");
        return;
      }

      // Transform data sesuai interface yang dibutuhkan
      const exportData = sortedPeminjamanItems.map((item) => ({
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
            disabled={
              isLoading || isExporting || sortedPeminjamanItems.length === 0
            }
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
      ) : sortedPeminjamanItems.length === 0 ? (
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
                <TableHead className="min-w-[150px] border text-xs p-2">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleSort("nama_peminjam")}
                    className="h-auto p-1 font-medium text-xs w-full justify-center hover:bg-gray-50"
                  >
                    NAMA PEMINJAM
                    {sortField === "nama_peminjam" && (
                      <ChevronUp className="ml-1 h-3 w-3" />
                    )}
                  </Button>
                </TableHead>
                <TableHead className="min-w-[100px] border text-xs p-2">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleSort("divisi")}
                    className="h-auto p-1 font-medium text-xs w-full justify-center hover:bg-gray-50"
                  >
                    DIVISI
                    {sortField === "divisi" && (
                      <ChevronUp className="ml-1 h-3 w-3" />
                    )}
                  </Button>
                </TableHead>
                <TableHead className="min-w-[150px] border text-xs p-2">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleSort("nama_apd")}
                    className="h-auto p-1 font-medium text-xs w-full justify-center hover:bg-gray-50"
                  >
                    NAMA APD
                    {sortField === "nama_apd" && (
                      <ChevronUp className="ml-1 h-3 w-3" />
                    )}
                  </Button>
                </TableHead>
                <TableHead className="min-w-[100px] border text-xs p-2">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleSort("tanggal_pinjam")}
                    className="h-auto p-1 font-medium text-xs w-full justify-center hover:bg-gray-50"
                  >
                    TGL PINJAM
                    {sortField === "tanggal_pinjam" && (
                      <ChevronUp className="ml-1 h-3 w-3" />
                    )}
                  </Button>
                </TableHead>
                <TableHead className="min-w-[100px] border text-xs p-2">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleSort("tanggal_kembali")}
                    className="h-auto p-1 font-medium text-xs w-full justify-center hover:bg-gray-50"
                  >
                    TGL KEMBALI
                    {sortField === "tanggal_kembali" && (
                      <ChevronUp className="ml-1 h-3 w-3" />
                    )}
                  </Button>
                </TableHead>
                <TableHead className="min-w-[80px] text-center border text-xs p-2">
                  AKSI
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {sortedPeminjamanItems.map((item, index) => (
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
                    <div className="flex items-center justify-center space-x-1">
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => handleEditClick(item)}
                        className="h-6 w-6 p-0 text-blue-600 hover:text-blue-700 hover:bg-blue-50"
                      >
                        <Edit className="h-3 w-3" />
                      </Button>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => handleDeleteClick(item)}
                        className="h-6 w-6 p-0 text-red-600 hover:text-red-700 hover:bg-red-50"
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
            Total: {sortedPeminjamanItems.length} record
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

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Konfirmasi Hapus Data</AlertDialogTitle>
            <AlertDialogDescription>
              Apakah Anda yakin ingin menghapus data peminjaman oleh &quot;
              {deleteName}&quot;? Tindakan ini tidak dapat dibatalkan.
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
