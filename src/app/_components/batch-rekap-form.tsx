"use client";

import { useState } from "react";
import {
  Calendar,
  Edit,
  X,
  Loader2,
  Download,
  Save,
  AlertTriangle,
} from "lucide-react";
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
import { DatePickerWithInput } from "@/components/ui/date-picker";
import { Badge } from "@/components/ui/badge";
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
import { useBatchRekap } from "@/hooks/use-batch-rekap";
import type { ApdMonthlyWithRelations } from "@/lib/types/database";

interface EditModalData {
  id: number;
  nama: string;
  realisasi: number;
  stockAwal: number;
  distribusi: number;
}

export function BatchRekapForm() {
  const {
    formData,
    updatePeriode,
    monthlyData,
    formatPeriodeName,
    isGenerating,
    isLoading,
    isUpdating,
    generateRekap,
    updateEditFormData,
    saveEditWithData,
    startEdit,
    error,
    clearMessages,
  } = useBatchRekap();

  const [showConfirmDialog, setShowConfirmDialog] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editData, setEditData] = useState<EditModalData | null>(null);

  const handleGenerateRekap = async () => {
    const success = await generateRekap();
    if (success) {
      setShowConfirmDialog(false);
    }
  };

  const handleEditClick = (item: ApdMonthlyWithRelations) => {
    // Set data for local modal state - stock awal dari apd_items.jumlah (real-time)
    setEditData({
      id: item.id,
      nama: item.apd_items?.name || "-",
      realisasi: item.realisasi || 0,
      stockAwal: item.apd_items?.jumlah || 0, // Real-time dari apd_items
      distribusi: item.distribusi || 0, // Distribusi dari Pengeluaran APD
    });

    // Set data for hook state (needed for save)
    startEdit(item);
    setShowEditModal(true);
  };

  const handleSaveEdit = async () => {
    if (!editData) return;

    console.log("Saving edit data (realisasi only):", editData);

    // Update hook state first (hanya realisasi)
    updateEditFormData("realisasi", editData.realisasi);

    // Call save directly dengan hanya realisasi (stock_awal tetap dari database)
    const success = await saveEditWithData(editData.id, {
      realisasi: editData.realisasi,
    });

    if (success) {
      setShowEditModal(false);
      setEditData(null);
    }
  };

  const formatNumber = (num: number | undefined | null): string => {
    return (num || 0).toLocaleString("id-ID");
  };

  const getSaldoColor = (saldo: number | undefined | null): string => {
    const value = saldo || 0;
    if (value < 0) return "text-red-600";
    if (value === 0) return "text-gray-500";
    return "text-green-600";
  };

  return (
    <div className="space-y-4">
      {/* Header dengan Generate Button */}
      <div className="space-y-4">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <h2 className="text-lg font-semibold text-gray-900">
              Batch Rekap Neraca Bulanan
            </h2>
          </div>
          <p className="text-sm text-gray-600">
            Generate laporan neraca APD bulanan untuk semua item APD (termasuk
            yang belum ada distribusi)
          </p>
        </div>

        {/* Form Controls */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div className="space-y-1">
            <label className="text-xs font-medium text-gray-700">
              Pilih Periode
            </label>
            <DatePickerWithInput
              value={formData.periode}
              onChange={(date: Date | undefined) => date && updatePeriode(date)}
              placeholder="Pilih bulan..."
              className="w-full h-9"
            />
          </div>
          <div className="flex flex-col justify-end">
            <AlertDialog
              open={showConfirmDialog}
              onOpenChange={setShowConfirmDialog}
            >
              <AlertDialogTrigger asChild>
                <Button
                  disabled={isGenerating || isLoading}
                  className="w-full h-9 text-sm"
                  size="sm"
                >
                  {isGenerating ? (
                    <>
                      <Loader2 className="mr-2 h-3 w-3 animate-spin" />
                      Generating...
                    </>
                  ) : (
                    <>
                      <Download className="mr-2 h-3 w-3" />
                      Generate Rekap
                    </>
                  )}
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Konfirmasi Generate Rekap</AlertDialogTitle>
                  <AlertDialogDescription>
                    Apakah Anda yakin ingin generate rekap untuk periode{" "}
                    <strong>
                      {formatPeriodeName(formData.periode.toISOString())}
                    </strong>
                    ?
                  </AlertDialogDescription>
                  {monthlyData.length > 0 && (
                    <div className="mt-2 p-2 bg-yellow-50 border border-yellow-200 rounded text-sm flex items-center space-x-2">
                      <AlertTriangle className="h-4 w-4 text-yellow-600 flex-shrink-0" />
                      <span className="text-yellow-800">
                        Data untuk periode ini sudah ada dan akan diupdate.
                      </span>
                    </div>
                  )}
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Batal</AlertDialogCancel>
                  <AlertDialogAction
                    onClick={handleGenerateRekap}
                    disabled={isGenerating}
                  >
                    {isGenerating ? "Processing..." : "Ya, Generate"}
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </div>
        </div>

        {/* Separator */}
        <div className="border-t border-gray-200"></div>

        {/* Messages */}
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
      </div>

      {/* Data Table */}
      <div className="space-y-3">
        <div className="flex items-center gap-2">
          <h3 className="text-sm font-semibold text-gray-800">
            Laporan Neraca - {formatPeriodeName(formData.periode.toISOString())}
          </h3>
        </div>

        {isLoading ? (
          <div className="flex items-center justify-center py-8 text-sm text-gray-500">
            <Loader2 className="h-4 w-4 animate-spin mr-2" />
            Loading data...
          </div>
        ) : monthlyData.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            <Calendar className="h-8 w-8 mx-auto mb-2 text-gray-300" />
            <p className="text-sm">Belum ada data untuk periode ini</p>
            <p className="text-xs text-gray-400">
              Klik Generate Rekap untuk membuat laporan (semua APD akan
              diproses)
            </p>
          </div>
        ) : (
          <>
            {/* Tabel dengan horizontal scroll */}
            <div className="w-full overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="min-w-[40px] text-center border text-xs p-2">
                      NO
                    </TableHead>
                    <TableHead className="min-w-[120px] text-center border text-xs p-2">
                      NAMA APD
                    </TableHead>
                    <TableHead className="min-w-[80px] text-center border text-xs p-2">
                      STOCK AWAL
                    </TableHead>
                    <TableHead className="min-w-[80px] text-center border text-xs p-2">
                      REALISASI
                    </TableHead>
                    <TableHead className="min-w-[80px] text-center border text-xs p-2">
                      DISTRIBUSI
                    </TableHead>
                    <TableHead className="min-w-[80px] text-center border text-xs p-2">
                      SALDO AKHIR
                    </TableHead>
                    <TableHead className="min-w-[60px] text-center border text-xs p-2">
                      SATUAN
                    </TableHead>
                    <TableHead className="min-w-[60px] text-center border text-xs p-2">
                      AKSI
                    </TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {monthlyData.map((item, index) => (
                    <TableRow key={item.id}>
                      <TableCell className="text-center border text-xs p-2 font-medium">
                        {index + 1}
                      </TableCell>
                      <TableCell className="text-left border text-xs p-2 font-medium">
                        {item.apd_items?.name || "-"}
                      </TableCell>
                      <TableCell className="text-right border text-xs p-2 font-mono">
                        {formatNumber(item.stock_awal)}
                      </TableCell>
                      <TableCell className="text-right border text-xs p-2 font-mono">
                        {formatNumber(item.realisasi)}
                      </TableCell>
                      <TableCell className="text-right border text-xs p-2 font-mono">
                        {formatNumber(item.distribusi)}
                      </TableCell>
                      <TableCell
                        className={`text-right border text-xs p-2 font-mono font-semibold ${getSaldoColor(
                          item.saldo_akhir
                        )}`}
                      >
                        {formatNumber(item.saldo_akhir)}
                      </TableCell>
                      <TableCell className="text-center border text-xs p-2">
                        <Badge variant="outline" className="text-xs">
                          {item.satuan || item.apd_items?.satuan || "-"}
                        </Badge>
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
            </div>

            {/* Footer Info */}
            <div className="mt-3 text-xs text-gray-500 text-center">
              Total: {monthlyData.length} record
            </div>
          </>
        )}
      </div>

      {/* Edit Modal */}
      <AlertDialog open={showEditModal} onOpenChange={setShowEditModal}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Edit Data Neraca</AlertDialogTitle>
            <AlertDialogDescription>
              Edit realisasi untuk {editData?.nama}
            </AlertDialogDescription>
          </AlertDialogHeader>

          {editData && (
            <div className="space-y-4 py-2">
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-500">
                  Stock Awal (dari Stock Opname)
                </label>
                <Input
                  type="number"
                  value={editData.stockAwal}
                  readOnly
                  className="bg-gray-50 text-gray-500"
                  min="0"
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">Realisasi</label>
                <Input
                  type="number"
                  value={editData.realisasi}
                  onChange={(e) =>
                    setEditData({
                      ...editData,
                      realisasi: parseInt(e.target.value) || 0,
                    })
                  }
                  min="0"
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-500">
                  Distribusi (dari Pengeluaran APD)
                </label>
                <Input
                  type="number"
                  value={editData.distribusi}
                  readOnly
                  className="bg-gray-50 text-gray-500"
                  min="0"
                />
              </div>
            </div>
          )}

          <AlertDialogFooter>
            <AlertDialogCancel>Batal</AlertDialogCancel>
            <AlertDialogAction onClick={handleSaveEdit} disabled={isUpdating}>
              {isUpdating ? (
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
    </div>
  );
}
