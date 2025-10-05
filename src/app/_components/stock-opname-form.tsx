"use client";

import { useState, useEffect } from "react";
import { Edit, Loader2, Save, X, FileDown } from "lucide-react";
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
} from "@/components/ui/alert-dialog";
import { supabase } from "@/lib/supabase/client";
import { exportStockOpnameToExcel } from "@/lib/exports";

interface ApdItem {
  id: number;
  name: string;
  satuan: string | null;
  jumlah: number;
}

interface EditModalData {
  id: number;
  nama: string;
  jumlah: number;
  satuan: string | null;
}

export function StockOpnameForm() {
  const [apdItems, setApdItems] = useState<ApdItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isUpdating, setIsUpdating] = useState(false);
  const [isExporting, setIsExporting] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editData, setEditData] = useState<EditModalData | null>(null);
  const [error, setError] = useState<string>("");

  // Load APD items
  const loadApdItems = async () => {
    try {
      setIsLoading(true);
      const { data, error } = await supabase
        .from("apd_items")
        .select("id, name, satuan, jumlah")
        .order("name");

      if (error) throw error;
      setApdItems(data || []);
    } catch (err) {
      setError("Gagal memuat data APD");
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadApdItems();
  }, []);

  const handleEditClick = (item: ApdItem) => {
    setEditData({
      id: item.id,
      nama: item.name,
      jumlah: item.jumlah || 0,
      satuan: item.satuan,
    });
    setShowEditModal(true);
  };

  const handleSaveEdit = async () => {
    if (!editData) return;

    try {
      setIsUpdating(true);
      setError("");

      const { error } = await supabase
        .from("apd_items")
        .update({
          name: editData.nama,
          satuan: editData.satuan,
          jumlah: editData.jumlah,
        })
        .eq("id", editData.id);

      if (error) throw error;

      toast.success("Data APD berhasil diperbarui");
      setShowEditModal(false);
      setEditData(null);
      await loadApdItems(); // Reload data
    } catch (err) {
      setError("Gagal memperbarui stock awal");
      console.error(err);
    } finally {
      setIsUpdating(false);
    }
  };

  const handleExportExcel = async () => {
    try {
      setIsExporting(true);
      setError("");

      if (apdItems.length === 0) {
        toast.error("Tidak ada data untuk diexport");
        return;
      }

      // Transform data sesuai interface yang dibutuhkan
      const exportData = apdItems.map((item) => ({
        id: item.id,
        name: item.name,
        jumlah: item.jumlah,
        satuan: item.satuan,
      }));

      exportStockOpnameToExcel(exportData);
      toast.success("Data berhasil diexport ke Excel");
    } catch (err) {
      setError("Gagal export data ke Excel");
      toast.error("Gagal export data ke Excel");
      console.error(err);
    } finally {
      setIsExporting(false);
    }
  };

  const clearMessages = () => {
    setError("");
  };

  const formatNumber = (num: number | undefined | null): string => {
    return (num || 0).toLocaleString("id-ID");
  };

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex justify-between items-start">
        <div>
          <h3 className="text-lg font-semibold text-gray-900 mb-2">
            Stock Opname APD
          </h3>
          <p className="text-sm text-gray-600">
            Kelola stock awal APD yang akan digunakan sebagai dasar generate
            rekap bulanan
          </p>
        </div>
        <Button
          onClick={handleExportExcel}
          disabled={isLoading || isExporting || apdItems.length === 0}
          className="bg-green-600 hover:bg-green-700 text-white"
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

      {/* Data Table */}
      {isLoading ? (
        <div className="flex items-center justify-center py-8 text-sm text-gray-500">
          <Loader2 className="h-4 w-4 animate-spin mr-2" />
          Loading data...
        </div>
      ) : apdItems.length === 0 ? (
        <div className="text-center py-8 text-gray-500">
          <p className="text-sm">Tidak ada data APD</p>
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
                  NAMA APD
                </TableHead>
                <TableHead className="min-w-[80px] text-center border text-xs p-2">
                  STOCK AWAL
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
              {apdItems.map((item, index) => (
                <TableRow key={item.id}>
                  <TableCell className="text-center border text-xs p-2 font-medium">
                    {index + 1}
                  </TableCell>
                  <TableCell className="text-left border text-xs p-2 font-medium">
                    {item.name}
                  </TableCell>
                  <TableCell className="text-right border text-xs p-2 font-mono font-semibold">
                    {formatNumber(item.jumlah)}
                  </TableCell>
                  <TableCell className="text-center border text-xs p-2">
                    <Badge variant="outline" className="text-xs">
                      {item.satuan || "-"}
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

          {/* Footer Info */}
          <div className="mt-3 text-xs text-gray-500 text-center">
            Total: {apdItems.length} record
          </div>
        </div>
      )}

      {/* Edit Modal */}
      <AlertDialog open={showEditModal} onOpenChange={setShowEditModal}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Edit Data APD</AlertDialogTitle>
            <AlertDialogDescription>
              Update informasi APD: {editData?.nama}
            </AlertDialogDescription>
          </AlertDialogHeader>

          {editData && (
            <div className="space-y-4 py-2">
              <div className="space-y-2">
                <label className="text-sm font-medium">Nama APD</label>
                <Input
                  type="text"
                  value={editData.nama}
                  onChange={(e) =>
                    setEditData({
                      ...editData,
                      nama: e.target.value,
                    })
                  }
                  placeholder="Masukkan nama APD"
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">Satuan</label>
                <Input
                  type="text"
                  value={editData.satuan || ""}
                  onChange={(e) =>
                    setEditData({
                      ...editData,
                      satuan: e.target.value || null,
                    })
                  }
                  placeholder="Contoh: pcs, unit, pasang"
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">Jumlah Stock Awal</label>
                <Input
                  type="number"
                  value={editData.jumlah === 0 ? "" : editData.jumlah}
                  onChange={(e) =>
                    setEditData({
                      ...editData,
                      jumlah: parseInt(e.target.value) || 0,
                    })
                  }
                  min="0"
                  placeholder="0"
                />
                <p className="text-xs text-gray-500">
                  Jumlah stock awal akan digunakan untuk generate rekap bulanan
                </p>
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
