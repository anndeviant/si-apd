"use client";

import { useState, useMemo } from "react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
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
import { Trash2, Download, Search } from "lucide-react";
import { useApdItems } from "@/hooks/use-apd-items";
import {
  usePengeluaranPekerja,
  formatPeriodeDisplay,
  formatTanggal,
} from "@/hooks/use-pengeluaran-pekerja";
import { exportPengeluaranPekerjaToExcel } from "@/lib/exports";
import { toast } from "sonner";

export default function PengeluaranPekerjaForm() {
  const [selectedPeriode, setSelectedPeriode] = useState<string>("");
  const [selectedApdId, setSelectedApdId] = useState<number | undefined>();
  const [deletingId, setDeletingId] = useState<number | null>(null);
  const [isExporting, setIsExporting] = useState<boolean>(false);
  const [apdSearchTerm, setApdSearchTerm] = useState<string>("");

  // Hooks untuk data
  const { items: apdItems = [] } = useApdItems();

  // Filter APD items based on search term
  const filteredApdItems = useMemo(() => {
    if (!apdSearchTerm.trim()) return apdItems;

    return apdItems.filter((item) =>
      item.name.toLowerCase().includes(apdSearchTerm.toLowerCase())
    );
  }, [apdItems, apdSearchTerm]);
  const {
    data: pengeluaranData = [],
    availablePeriods = [],
    loading: loadingPengeluaran = false,
    error: errorPengeluaran = null,
    deleteData,
  } = usePengeluaranPekerja({
    periode: selectedPeriode,
    apd_id: selectedApdId,
    autoFetch: !!selectedPeriode,
  });

  const handleDelete = async (id: number) => {
    setDeletingId(id);
    const success = await deleteData(id);
    setDeletingId(null);

    if (success) {
      // Data will be automatically refreshed by the hook
    }
  };

  const handleExportExcel = async () => {
    if (!selectedPeriode || pengeluaranData.length === 0) {
      toast.error("Tidak ada data untuk diekspor");
      return;
    }

    setIsExporting(true);

    try {
      // Get APD name for the export
      const apdName = selectedApdId
        ? apdItems.find((item) => item.id === selectedApdId)?.name ||
          "Semua APD"
        : "Semua APD";

      const filename = await exportPengeluaranPekerjaToExcel(pengeluaranData, {
        periode: formatPeriodeDisplay(selectedPeriode),
        apdName: apdName,
        filename: `Laporan_Pengeluaran_APD_${selectedPeriode.replace(
          /\//g,
          "_"
        )}`,
        sheetName: "Pengeluaran APD",
      });

      toast.success(`File Excel berhasil dibuat: ${filename}`);
    } catch (error) {
      console.error("Error exporting Excel:", error);
      toast.error("Gagal membuat file Excel");
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <>
      {/* Filter Controls */}
      <div className="mb-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {/* Periode Selector */}
          <div className="w-full">
            <label className="block text-xs font-medium text-gray-700 mb-1">
              Pilih Periode
            </label>
            <Select value={selectedPeriode} onValueChange={setSelectedPeriode}>
              <SelectTrigger className="w-full h-9 text-sm">
                <SelectValue placeholder="Pilih periode" />
              </SelectTrigger>
              <SelectContent>
                {availablePeriods && availablePeriods.length > 0 ? (
                  availablePeriods
                    .filter((periode) => periode && typeof periode === "string")
                    .map((periode) => (
                      <SelectItem key={periode} value={periode}>
                        {formatPeriodeDisplay(periode)}
                      </SelectItem>
                    ))
                ) : (
                  <SelectItem value="no-data" disabled>
                    Tidak ada periode tersedia
                  </SelectItem>
                )}
              </SelectContent>
            </Select>
          </div>

          {/* APD Selector */}
          <div className="w-full">
            <label className="block text-xs font-medium text-gray-700 mb-1">
              Pilih APD
            </label>
            <Select
              value={selectedApdId?.toString() || "all"}
              onValueChange={(value) => {
                setSelectedApdId(value === "all" ? undefined : parseInt(value));
                setApdSearchTerm(""); // Clear search when selection is made
              }}
              onOpenChange={(open) => {
                if (!open) {
                  setApdSearchTerm(""); // Clear search when dropdown is closed
                }
              }}
            >
              <SelectTrigger className="w-full h-9 text-sm">
                <SelectValue placeholder="Semua APD" />
              </SelectTrigger>
              <SelectContent>
                {/* Search Field */}
                <div className="p-2 border-b">
                  <div className="relative">
                    <Search className="absolute left-2 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                    <Input
                      placeholder="Cari APD..."
                      value={apdSearchTerm}
                      onChange={(e) => setApdSearchTerm(e.target.value)}
                      className="pl-8 h-8"
                      onClick={(e) => e.stopPropagation()}
                      onKeyDown={(e) => e.stopPropagation()}
                    />
                  </div>
                </div>

                {/* Items List */}
                <div className="max-h-60 overflow-y-auto">
                  <SelectItem value="all">Semua APD</SelectItem>
                  {apdItems && apdItems.length > 0 ? (
                    filteredApdItems.length === 0 && apdSearchTerm.trim() ? (
                      <div className="px-2 py-4 text-center text-sm text-muted-foreground">
                        Tidak ditemukan APD yang sesuai
                      </div>
                    ) : (
                      filteredApdItems
                        .filter((apd) => apd && apd.id && apd.name)
                        .map((apd) => (
                          <SelectItem key={apd.id} value={apd.id.toString()}>
                            {apd.name}
                          </SelectItem>
                        ))
                    )
                  ) : (
                    <SelectItem value="loading" disabled>
                      Memuat APD...
                    </SelectItem>
                  )}
                </div>
              </SelectContent>
            </Select>
          </div>
        </div>
      </div>

      {/* Header Info */}
      {/* {selectedPeriode && (
        <div className="mb-3 p-3 bg-blue-50 rounded-lg">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
            <div className="text-sm">
              <span className="text-gray-600">Periode: </span>
              <span className="font-semibold text-blue-900">
                {formatPeriodeDisplay(selectedPeriode)}
              </span>
            </div>
            {selectedApdId && (
              <div className="text-sm">
                <span className="text-gray-600">APD: </span>
                <span className="font-semibold text-blue-900">
                  {apdItems.find((item) => item.id === selectedApdId)?.name ||
                    "APD Terpilih"}
                </span>
              </div>
            )}
          </div>
        </div>
      )} */}

      {/* Loading State */}
      {/* {loadingPengeluaran && (
        <div className="flex items-center justify-center py-6">
          <div className="text-gray-500 text-sm">Memuat data...</div>
        </div>
      )} */}

      {/* Error State */}
      {errorPengeluaran && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-3 mb-3">
          <div className="text-red-800 text-sm">Error: {errorPengeluaran}</div>
        </div>
      )}

      {/* Data State */}
      {!selectedPeriode ? (
        <div className="text-center py-6 text-gray-500 text-sm">
          Pilih periode untuk menampilkan data
        </div>
      ) : !loadingPengeluaran && pengeluaranData.length === 0 ? (
        <div className="text-center py-6 text-gray-500 text-sm">
          Tidak ada data untuk periode yang dipilih
        </div>
      ) : (
        selectedPeriode &&
        pengeluaranData.length > 0 && (
          <>
            {/* Label Laporan dan Tombol Export */}
            <div className="mb-3 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
              <h3 className="text-sm font-semibold text-gray-800">
                Laporan Pengeluaran APD
              </h3>
              <Button
                onClick={handleExportExcel}
                disabled={isExporting || pengeluaranData.length === 0}
                className="h-8 px-3 text-xs bg-green-600 hover:bg-green-700 text-white"
                size="sm"
              >
                <Download className="h-3 w-3 mr-1" />
                {isExporting ? "Membuat Excel..." : "Export Excel"}
              </Button>
            </div>

            {/* Tabel dengan horizontal scroll */}
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
                    <TableHead className="min-w-[80px] text-center border text-xs p-2">
                      Tanggal
                    </TableHead>
                    <TableHead className="min-w-[100px] text-center border text-xs p-2">
                      Bengkel
                    </TableHead>
                    {selectedApdId === undefined && (
                      <TableHead className="min-w-[100px] text-center border text-xs p-2">
                        Jenis APD
                      </TableHead>
                    )}
                    <TableHead className="min-w-[60px] text-center border text-xs p-2">
                      Qty
                    </TableHead>
                    <TableHead className="min-w-[80px] text-center border text-xs p-2">
                      Aksi
                    </TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {pengeluaranData.map((item, index) => (
                    <TableRow key={item.id}>
                      <TableCell className="text-center border text-xs p-2">
                        {index + 1}
                      </TableCell>
                      <TableCell className="border text-xs p-2">
                        {item.nama}
                      </TableCell>
                      <TableCell className="text-center border text-xs p-2">
                        {formatTanggal(item.tanggal)}
                      </TableCell>
                      <TableCell className="text-center border text-xs p-2">
                        {item.bengkel_name}
                      </TableCell>
                      {selectedApdId === undefined && (
                        <TableCell className="text-center border text-xs p-2">
                          {item.apd_name || "-"}
                        </TableCell>
                      )}
                      <TableCell className="text-center border text-xs p-2">
                        {item.qty} {item.satuan}
                      </TableCell>
                      <TableCell className="text-center border text-xs p-2">
                        <AlertDialog>
                          <AlertDialogTrigger asChild>
                            <Button
                              variant="ghost"
                              size="sm"
                              className="h-6 w-6 p-0 hover:bg-red-50"
                              disabled={deletingId === item.id}
                            >
                              <Trash2 className="h-3 w-3 text-red-600" />
                            </Button>
                          </AlertDialogTrigger>
                          <AlertDialogContent>
                            <AlertDialogHeader>
                              <AlertDialogTitle>
                                Konfirmasi Hapus
                              </AlertDialogTitle>
                              <AlertDialogDescription>
                                Apakah Anda yakin ingin menghapus data
                                pengeluaran untuk {item.nama}?
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel>Batal</AlertDialogCancel>
                              <AlertDialogAction
                                onClick={() => handleDelete(item.id)}
                                className="bg-red-600 hover:bg-red-700"
                              >
                                Hapus
                              </AlertDialogAction>
                            </AlertDialogFooter>
                          </AlertDialogContent>
                        </AlertDialog>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>

            {/* Footer Info */}
            <div className="mt-3 text-xs text-gray-500 text-center">
              Total: {pengeluaranData.length} record
            </div>
          </>
        )
      )}
    </>
  );
}
