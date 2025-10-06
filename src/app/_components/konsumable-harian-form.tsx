"use client";

import * as React from "react";
import { Loader2, AlertCircle } from "lucide-react";
import { toast } from "sonner";

import { useKonsumableHarianForm } from "@/hooks/use-konsumable-harian-form";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { DatePickerWithInput } from "@/components/ui/date-picker";
import { ApdSelector } from "@/components/ui/apd-selector";
import { BengkelSelector } from "@/components/ui/bengkel-selector";

export default function KonsumableHarianForm() {
  const { formData, updateField, resetForm, submitForm, isSubmitting, error } =
    useKonsumableHarianForm();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const success = await submitForm();
    if (success) {
      toast.success("Data konsumable harian berhasil disimpan!");
    }
  };

  const handleReset = () => {
    resetForm();
  };

  return (
    <div className="max-w-2xl mx-auto">
      {/* Error Message */}
      {error && (
        <div className="mb-6 flex items-start space-x-2 rounded-md bg-red-50 border border-red-200 p-3 text-red-700">
          <AlertCircle className="h-5 w-5 mt-0.5 flex-shrink-0" />
          <div className="text-sm">{error}</div>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="grid gap-6">
          {/* Pilih Barang APD */}
          <div className="grid gap-2">
            <Label htmlFor="apd">Pilih Barang (APD) *</Label>
            <ApdSelector
              value={formData.apd_id}
              onChange={(value) => updateField("apd_id", value)}
              placeholder="Pilih barang APD..."
              disabled={isSubmitting}
              className="w-full"
            />
          </div>

          {/* Nama Penerima */}
          <div className="grid gap-2">
            <Label htmlFor="nama">Nama Penerima *</Label>
            <Input
              id="nama"
              placeholder="Masukkan nama penerima"
              value={formData.nama}
              onChange={(e) => updateField("nama", e.target.value)}
              disabled={isSubmitting}
              required
            />
          </div>

          {/* Tanggal */}
          <div className="grid gap-2">
            <Label htmlFor="tanggal">Tanggal *</Label>
            <DatePickerWithInput
              value={formData.tanggal}
              onChange={(date) => updateField("tanggal", date || new Date())}
              placeholder="Pilih tanggal..."
              disabled={isSubmitting}
            />
          </div>

          {/* Bengkel/Unit */}
          <div className="grid gap-2">
            <Label htmlFor="bengkel">Bengkel / Unit *</Label>
            <BengkelSelector
              value={formData.bengkel_id}
              onChange={(value) => updateField("bengkel_id", value)}
              placeholder="Pilih bengkel/unit..."
              disabled={isSubmitting}
              className="w-full"
            />
          </div>

          {/* Jumlah */}
          <div className="grid gap-2">
            <Label htmlFor="jumlah">Jumlah *</Label>
            <Input
              id="jumlah"
              type="number"
              value={formData.qty || ""}
              onChange={(e) => {
                const value = parseInt(e.target.value) || 0;
                updateField("qty", value);
              }}
              placeholder="Masukkan jumlah"
              disabled={isSubmitting}
              required
            />
          </div>
        </div>

        {/* Form Actions */}
        <div className="flex gap-3 pt-4">
          <Button
            type="button"
            variant="outline"
            onClick={handleReset}
            disabled={isSubmitting}
          >
            Reset
          </Button>
          <Button type="submit" className="flex-1" disabled={isSubmitting}>
            {isSubmitting ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Menyimpan...
              </>
            ) : (
              "Simpan"
            )}
          </Button>
        </div>
      </form>
    </div>
  );
}
