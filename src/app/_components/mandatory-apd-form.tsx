"use client";

import * as React from "react";
import { Loader2, AlertCircle } from "lucide-react";
import { toast } from "sonner";

import { useMandatoryApdForm } from "@/hooks/use-mandatory-apd-form";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { DivisiSelector } from "@/components/ui/divisi-selector";
import { PosisiSelector } from "@/components/ui/posisi-selector";

export default function MandatoryApdForm() {
  const { formData, updateField, resetForm, submitForm, isSubmitting, error } =
    useMandatoryApdForm();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const success = await submitForm();
    if (success) {
      toast.success("Data pegawai mandatory APD berhasil disimpan!");
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
          {/* Nama Pegawai */}
          <div className="grid gap-2">
            <Label htmlFor="nama">Nama Pegawai *</Label>
            <Input
              id="nama"
              placeholder="Nama Pegawai"
              value={formData.nama}
              onChange={(e) => updateField("nama", e.target.value)}
              disabled={isSubmitting}
              required
            />
          </div>

          {/* NIP */}
          <div className="grid gap-2">
            <Label htmlFor="nip">NIP (Nomor Induk Pegawai) *</Label>
            <Input
              id="nip"
              placeholder="Masukkan NIP pegawai"
              value={formData.nip}
              onChange={(e) => updateField("nip", e.target.value)}
              disabled={isSubmitting}
              required
            />
          </div>

          {/* Divisi */}
          <div className="grid gap-2">
            <Label htmlFor="divisi">Divisi *</Label>
            <DivisiSelector
              value={formData.divisi_id}
              onChange={(value) => updateField("divisi_id", value)}
              placeholder="Pilih divisi..."
              disabled={isSubmitting}
              className="w-full"
            />
          </div>

          {/* Posisi */}
          <div className="grid gap-2">
            <Label htmlFor="posisi">Posisi/Jabatan *</Label>
            <PosisiSelector
              value={formData.posisi_id}
              onChange={(value) => updateField("posisi_id", value)}
              placeholder="Pilih posisi/jabatan..."
              disabled={isSubmitting}
              className="w-full"
            />
          </div>

          {/* Size Sepatu */}
          <div className="grid gap-2">
            <Label htmlFor="size_sepatu">Size Sepatu</Label>
            <Input
              id="size_sepatu"
              type="number"
              step="0.5"
              min="1"
              max="100"
              placeholder="Masukkan size..."
              value={formData.size_sepatu || ""}
              onChange={(e) =>
                updateField(
                  "size_sepatu",
                  e.target.value ? parseFloat(e.target.value) : null
                )
              }
              disabled={isSubmitting}
            />
          </div>

          {/* Jenis Sepatu */}
          <div className="grid gap-2">
            <Label htmlFor="jenis_sepatu">Jenis Sepatu</Label>
            <Input
              id="jenis_sepatu"
              placeholder="Masukkan jenis..."
              value={formData.jenis_sepatu}
              onChange={(e) => updateField("jenis_sepatu", e.target.value)}
              disabled={isSubmitting}
            />
          </div>

          {/* Warna Katelpack */}
          <div className="grid gap-2">
            <Label htmlFor="warna_katelpack">Warna Katelpack</Label>
            <Input
              id="warna_katelpack"
              placeholder="Masukkan warna..."
              value={formData.warna_katelpack}
              onChange={(e) => updateField("warna_katelpack", e.target.value)}
              disabled={isSubmitting}
            />
          </div>

          {/* Size Katelpack */}
          <div className="grid gap-2">
            <Label htmlFor="size_katelpack">Size Katelpack</Label>
            <Input
              id="size_katelpack"
              placeholder="Masukkan size..."
              value={formData.size_katelpack}
              onChange={(e) => updateField("size_katelpack", e.target.value)}
              disabled={isSubmitting}
            />
          </div>

          {/* Warna Helm */}
          <div className="grid gap-2">
            <Label htmlFor="warna_helm">Warna Helm</Label>
            <Input
              id="warna_helm"
              placeholder="Masukkan warna..."
              value={formData.warna_helm}
              onChange={(e) => updateField("warna_helm", e.target.value)}
              disabled={isSubmitting}
            />
            <p className="text-sm text-gray-900">Note: *) wajib diisi</p>
          </div>
        </div>

        {/* Form Actions */}
        <div className="flex gap-3">
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
              "Simpan Data Pegawai"
            )}
          </Button>
        </div>
      </form>
    </div>
  );
}
