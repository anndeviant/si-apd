"use client";

import * as React from "react";
import { Plus, Loader2, Search } from "lucide-react";

import { cn } from "@/lib/utils";
import { useDivisi } from "@/contexts/divisi-context";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
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

interface DivisiSelectorProps {
  value?: number | null;
  onChange?: (value: number | null) => void;
  placeholder?: string;
  disabled?: boolean;
  className?: string;
}

export function DivisiSelector({
  value,
  onChange,
  placeholder = "Pilih divisi...",
  disabled = false,
  className,
}: DivisiSelectorProps) {
  const { items, loading, error, addItem, refreshItems } = useDivisi();
  const [showAddDialog, setShowAddDialog] = React.useState(false);
  const [isAddingItem, setIsAddingItem] = React.useState(false);
  const [newItemName, setNewItemName] = React.useState("");
  const [addItemError, setAddItemError] = React.useState<string | null>(null);
  const [searchTerm, setSearchTerm] = React.useState("");

  // Filter items based on search term
  const filteredItems = React.useMemo(() => {
    if (!searchTerm.trim()) return items;

    return items.filter((item) =>
      item.nama_divisi.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [items, searchTerm]);

  const handleAddNewItem = async () => {
    if (!newItemName.trim()) {
      setAddItemError("Nama divisi harus diisi");
      return;
    }

    try {
      setIsAddingItem(true);
      setAddItemError(null);

      const newItem = await addItem({
        nama_divisi: newItemName.trim(),
      });

      // Select the newly added item
      onChange?.(newItem.id);

      // Reset form and close dialog
      setNewItemName("");
      setShowAddDialog(false);
    } catch (error) {
      setAddItemError(
        error instanceof Error ? error.message : "Gagal menambah divisi"
      );
    } finally {
      setIsAddingItem(false);
    }
  };

  const handleCancelAdd = () => {
    setNewItemName("");
    setAddItemError(null);
    setShowAddDialog(false);
  };

  const handleSelectChange = (selectedValue: string) => {
    if (selectedValue === "add-new") {
      setShowAddDialog(true);
    } else {
      const itemId = parseInt(selectedValue);
      onChange?.(itemId);
    }
  };

  if (error) {
    return (
      <div className={cn("space-y-2", className)}>
        <div className="text-sm text-destructive">Error: {error}</div>
        <Button
          variant="outline"
          size="sm"
          onClick={refreshItems}
          disabled={loading}
        >
          Coba Lagi
        </Button>
      </div>
    );
  }

  return (
    <>
      <Select
        value={value ? value.toString() : ""}
        onValueChange={handleSelectChange}
        disabled={disabled || loading}
      >
        <SelectTrigger className={cn(className)}>
          <SelectValue placeholder={loading ? "Memuat..." : placeholder} />
        </SelectTrigger>
        <SelectContent>
          {loading ? (
            <SelectItem value="loading" disabled>
              <div className="flex items-center space-x-2">
                <Loader2 className="h-4 w-4 animate-spin" />
                <span>Memuat divisi...</span>
              </div>
            </SelectItem>
          ) : (
            <>
              {/* Search Field */}
              <div className="p-2 border-b">
                <div className="relative">
                  <Search className="absolute left-2 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                  <Input
                    placeholder="Cari divisi..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-8 h-8"
                    onClick={(e) => e.stopPropagation()}
                    onKeyDown={(e) => e.stopPropagation()}
                  />
                </div>
              </div>

              {/* Add New Button */}
              <div className="p-2 border-b">
                <SelectItem value="add-new">
                  <div className="flex items-center space-x-2 text-blue-600">
                    <Plus className="h-4 w-4" />
                    <span>Tambah Divisi</span>
                  </div>
                </SelectItem>
              </div>

              {/* Items List */}
              <div className="max-h-60 overflow-y-auto">
                {filteredItems.length === 0 && searchTerm.trim() ? (
                  <div className="px-2 py-4 text-center text-sm text-muted-foreground">
                    Tidak ditemukan divisi yang sesuai
                  </div>
                ) : (
                  filteredItems.map((item) => (
                    <SelectItem key={item.id} value={item.id.toString()}>
                      {item.nama_divisi}
                    </SelectItem>
                  ))
                )}
              </div>
            </>
          )}
        </SelectContent>
      </Select>

      <AlertDialog open={showAddDialog} onOpenChange={setShowAddDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Tambah Divisi Baru</AlertDialogTitle>
            <AlertDialogDescription>
              Tambahkan divisi baru ke dalam database.
            </AlertDialogDescription>
          </AlertDialogHeader>

          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="divisi-name">Nama Divisi *</Label>
              <Input
                id="divisi-name"
                placeholder="Contoh: Produksi, Marketing, HR"
                value={newItemName}
                onChange={(e) => {
                  setNewItemName(e.target.value);
                  if (addItemError) setAddItemError(null);
                }}
                disabled={isAddingItem}
              />
            </div>
            {addItemError && (
              <div className="text-sm text-destructive">{addItemError}</div>
            )}
          </div>

          <AlertDialogFooter>
            <AlertDialogCancel
              onClick={handleCancelAdd}
              disabled={isAddingItem}
            >
              Batal
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={handleAddNewItem}
              disabled={isAddingItem || !newItemName.trim()}
            >
              {isAddingItem ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Menyimpan...
                </>
              ) : (
                "Simpan"
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
