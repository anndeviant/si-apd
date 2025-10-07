import * as XLSX from "xlsx";

interface PengajuanApdExportData {
    id: number;
    nama_project: string;
    nomor_project: string;
    kepala_project: string;
    progres: string;
    keterangan?: string;
    tanggal: string;
    apd_nama: string;
    jumlah: number;
    unit: string;
    harga: number;
    total: number;
}

/**
 * Export data pengajuan APD ke Excel
 */
export function exportPengajuanApdToExcel(data: PengajuanApdExportData[]): void {
    try {
        // Buat workbook baru
        const workbook = XLSX.utils.book_new();

        // Helper function untuk format tanggal
        const formatDate = (dateString: string | undefined | null): string => {
            if (!dateString) return "-";
            try {
                const date = new Date(dateString);
                return date.toLocaleDateString("id-ID");
            } catch {
                return "-";
            }
        };

        // Helper function untuk format currency
        const formatCurrency = (amount: number): string => {
            return new Intl.NumberFormat("id-ID", {
                style: "currency",
                currency: "IDR",
                minimumFractionDigits: 0,
            }).format(amount);
        };

        // Siapkan data untuk worksheet dengan header yang diminta
        const worksheetData = [
            // Header
            [
                "NO",
                "NAMA PROJECT",
                "NOMOR PROJECT",
                "KEPALA PROJECT",
                "PROGRES",
                "TANGGAL",
                "NAMA APD",
                "JUMLAH",
                "UNIT",
                "HARGA",
                "TOTAL",
                "KETERANGAN"
            ],
            // Data rows
            ...data.map((item, index) => [
                index + 1, // NO
                item.nama_project, // NAMA PROJECT
                item.nomor_project, // NOMOR PROJECT
                item.kepala_project, // KEPALA PROJECT
                item.progres, // PROGRES
                formatDate(item.tanggal), // TANGGAL
                item.apd_nama, // NAMA APD
                item.jumlah, // JUMLAH
                item.unit, // UNIT
                formatCurrency(item.harga), // HARGA
                formatCurrency(item.total), // TOTAL
                item.keterangan || "-", // KETERANGAN
            ]),
        ];

        // Buat worksheet
        const worksheet = XLSX.utils.aoa_to_sheet(worksheetData);

        // Set column widths untuk readability
        worksheet["!cols"] = [
            { width: 5 }, // NO
            { width: 20 }, // NAMA PROJECT
            { width: 15 }, // NOMOR PROJECT
            { width: 20 }, // KEPALA PROJECT
            { width: 12 }, // PROGRES
            { width: 12 }, // TANGGAL
            { width: 20 }, // NAMA APD
            { width: 10 }, // JUMLAH
            { width: 8 }, // UNIT
            { width: 15 }, // HARGA
            { width: 15 }, // TOTAL
            { width: 25 }, // KETERANGAN
        ];

        // Style header row (bold)
        const headerStyle = {
            font: { bold: true },
            alignment: { horizontal: "center", vertical: "center" },
            fill: { fgColor: { rgb: "E3F2FD" } },
        };

        // Apply header styling
        const range = XLSX.utils.decode_range(worksheet["!ref"] || "A1:L1");
        for (let col = range.s.c; col <= range.e.c; col++) {
            const cellAddress = XLSX.utils.encode_cell({ r: 0, c: col });
            if (!worksheet[cellAddress]) continue;
            worksheet[cellAddress].s = headerStyle;
        }

        // Apply styling untuk data rows
        for (let row = 1; row <= data.length; row++) {
            // NO column (A) - center align
            const noCellAddress = XLSX.utils.encode_cell({ r: row, c: 0 });
            if (worksheet[noCellAddress]) {
                worksheet[noCellAddress].s = {
                    alignment: { horizontal: "center", vertical: "center" },
                };
            }

            // NAMA PROJECT column (B) - left align
            const namaProjectCellAddress = XLSX.utils.encode_cell({ r: row, c: 1 });
            if (worksheet[namaProjectCellAddress]) {
                worksheet[namaProjectCellAddress].s = {
                    alignment: { horizontal: "left", vertical: "center" },
                };
            }

            // NOMOR PROJECT column (C) - center align
            const nomorProjectCellAddress = XLSX.utils.encode_cell({ r: row, c: 2 });
            if (worksheet[nomorProjectCellAddress]) {
                worksheet[nomorProjectCellAddress].s = {
                    alignment: { horizontal: "center", vertical: "center" },
                };
            }

            // KEPALA PROJECT column (D) - left align
            const kepalaProjectCellAddress = XLSX.utils.encode_cell({ r: row, c: 3 });
            if (worksheet[kepalaProjectCellAddress]) {
                worksheet[kepalaProjectCellAddress].s = {
                    alignment: { horizontal: "left", vertical: "center" },
                };
            }

            // PROGRES column (E) - center align
            const progresCellAddress = XLSX.utils.encode_cell({ r: row, c: 4 });
            if (worksheet[progresCellAddress]) {
                worksheet[progresCellAddress].s = {
                    alignment: { horizontal: "center", vertical: "center" },
                };
            }

            // TANGGAL column (F) - center align
            const tanggalCellAddress = XLSX.utils.encode_cell({ r: row, c: 5 });
            if (worksheet[tanggalCellAddress]) {
                worksheet[tanggalCellAddress].s = {
                    alignment: { horizontal: "center", vertical: "center" },
                };
            }

            // NAMA APD column (G) - left align
            const namaApdCellAddress = XLSX.utils.encode_cell({ r: row, c: 6 });
            if (worksheet[namaApdCellAddress]) {
                worksheet[namaApdCellAddress].s = {
                    alignment: { horizontal: "left", vertical: "center" },
                };
            }

            // JUMLAH column (H) - center align
            const jumlahCellAddress = XLSX.utils.encode_cell({ r: row, c: 7 });
            if (worksheet[jumlahCellAddress]) {
                worksheet[jumlahCellAddress].s = {
                    alignment: { horizontal: "center", vertical: "center" },
                };
            }

            // UNIT column (I) - center align
            const unitCellAddress = XLSX.utils.encode_cell({ r: row, c: 8 });
            if (worksheet[unitCellAddress]) {
                worksheet[unitCellAddress].s = {
                    alignment: { horizontal: "center", vertical: "center" },
                };
            }

            // HARGA column (J) - right align
            const hargaCellAddress = XLSX.utils.encode_cell({ r: row, c: 9 });
            if (worksheet[hargaCellAddress]) {
                worksheet[hargaCellAddress].s = {
                    alignment: { horizontal: "right", vertical: "center" },
                };
            }

            // TOTAL column (K) - right align
            const totalCellAddress = XLSX.utils.encode_cell({ r: row, c: 10 });
            if (worksheet[totalCellAddress]) {
                worksheet[totalCellAddress].s = {
                    alignment: { horizontal: "right", vertical: "center" },
                };
            }

            // KETERANGAN column (L) - left align
            const keteranganCellAddress = XLSX.utils.encode_cell({ r: row, c: 11 });
            if (worksheet[keteranganCellAddress]) {
                worksheet[keteranganCellAddress].s = {
                    alignment: { horizontal: "left", vertical: "center" },
                };
            }
        }

        // Add worksheet to workbook
        XLSX.utils.book_append_sheet(workbook, worksheet, "Pengajuan APD");

        // Generate filename dengan timestamp
        const now = new Date();
        const dateStr = now.toISOString().split("T")[0]; // YYYY-MM-DD
        const timeStr = now.toTimeString().split(" ")[0].replace(/:/g, "-"); // HH-MM-SS
        const filename = `Pengajuan_APD_${dateStr}_${timeStr}.xlsx`;

        // Export file
        XLSX.writeFile(workbook, filename);

    } catch (error) {
        console.error("Error exporting pengajuan APD to Excel:", error);
        throw new Error("Gagal mengexport data ke Excel");
    }
}