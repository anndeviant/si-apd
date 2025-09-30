"use client";

import * as React from "react";
import { Plus, Loader2 } from "lucide-react";

import { cn } from "@/lib/utils";
import { useBengkel } from "@/contexts/bengkel-context";
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

interface BengkelSelectorProps {
  value?: number | null;
  onChange?: (value: number | null) => void;
  placeholder?: string;
  disabled?: boolean;
  className?: string;
}

export function BengkelSelector({
  value,
  onChange,
  placeholder = "Pilih bengkel/unit...",
  disabled = false,
  className,
}: BengkelSelectorProps) {
  const { items, loading, error, addItem, refreshItems } = useBengkel();
  const [showAddDialog, setShowAddDialog] = React.useState(false);
  const [isAddingItem, setIsAddingItem] = React.useState(false);
  const [newItemName, setNewItemName] = React.useState("");
  const [addItemError, setAddItemError] = React.useState<string | null>(null);

  const handleAddNewItem = async () => {
    if (!newItemName.trim()) {
      setAddItemError("Nama bengkel harus diisi");
      return;
    }

    try {
      setIsAddingItem(true);
      setAddItemError(null);

      const newItem = await addItem({
        name: newItemName.trim(),
      });

      // Select the newly added item
      onChange?.(newItem.id);

      // Reset form and close dialog
      setNewItemName("");
      setShowAddDialog(false);
    } catch (error) {
      setAddItemError(
        error instanceof Error ? error.message : "Gagal menambah bengkel"
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
                <span>Memuat bengkel...</span>
              </div>
            </SelectItem>
          ) : (
            <>
              {items.map((item) => (
                <SelectItem key={item.id} value={item.id.toString()}>
                  {item.name}
                </SelectItem>
              ))}
              <SelectItem value="add-new">
                <div className="flex items-center space-x-2 text-blue-600">
                  <Plus className="h-4 w-4" />
                  <span>Tambah Bengkel</span>
                </div>
              </SelectItem>
            </>
          )}
        </SelectContent>
      </Select>

      <AlertDialog open={showAddDialog} onOpenChange={setShowAddDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Tambah Bengkel Baru</AlertDialogTitle>
            <AlertDialogDescription>
              Tambahkan bengkel/unit baru ke dalam database.
            </AlertDialogDescription>
          </AlertDialogHeader>

          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="bengkel-name">Nama Bengkel/Unit *</Label>
              <Input
                id="bengkel-name"
                placeholder="Contoh: CNC, KPI, ASSY"
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
