import * as XLSX from "xlsx";

interface PeminjamanApdExportData {
    id: number;
    nama_peminjam: string;
    divisi: string;
    nama_apd: string;
    tanggal_pinjam: string;
    tanggal_kembali?: string;
}

/**
 * Export data peminjaman APD ke Excel
 */
export function exportPeminjamanApdToExcel(data: PeminjamanApdExportData[]): void {
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

        // Siapkan data untuk worksheet dengan header yang diminta
        const worksheetData = [
            // Header
            ["NO", "NAMA PEMINJAM", "DIVISI", "NAMA APD", "TGL PINJAM", "TGL KEMBALI"],
            // Data rows
            ...data.map((item, index) => [
                index + 1, // NO
                item.nama_peminjam, // NAMA PEMINJAM
                item.divisi, // DIVISI
                item.nama_apd, // NAMA APD
                formatDate(item.tanggal_pinjam), // TGL PINJAM
                formatDate(item.tanggal_kembali), // TGL KEMBALI
            ]),
        ];

        // Buat worksheet
        const worksheet = XLSX.utils.aoa_to_sheet(worksheetData);

        // Set column widths untuk readability
        worksheet["!cols"] = [
            { width: 5 }, // NO
            { width: 25 }, // NAMA PEMINJAM
            { width: 15 }, // DIVISI
            { width: 25 }, // NAMA APD
            { width: 12 }, // TGL PINJAM
            { width: 12 }, // TGL KEMBALI
        ];

        // Style header row (bold)
        const headerStyle = {
            font: { bold: true },
            alignment: { horizontal: "center", vertical: "center" },
            fill: { fgColor: { rgb: "E3F2FD" } },
        };

        // Apply header styling
        const range = XLSX.utils.decode_range(worksheet["!ref"] || "A1:F1");
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

            // NAMA PEMINJAM column (B) - left align
            const namaCellAddress = XLSX.utils.encode_cell({ r: row, c: 1 });
            if (worksheet[namaCellAddress]) {
                worksheet[namaCellAddress].s = {
                    alignment: { horizontal: "left", vertical: "center" },
                };
            }

            // DIVISI column (C) - left align
            const divisiCellAddress = XLSX.utils.encode_cell({ r: row, c: 2 });
            if (worksheet[divisiCellAddress]) {
                worksheet[divisiCellAddress].s = {
                    alignment: { horizontal: "left", vertical: "center" },
                };
            }

            // NAMA APD column (D) - left align
            const apdCellAddress = XLSX.utils.encode_cell({ r: row, c: 3 });
            if (worksheet[apdCellAddress]) {
                worksheet[apdCellAddress].s = {
                    alignment: { horizontal: "left", vertical: "center" },
                };
            }

            // TGL PINJAM column (E) - center align
            const tglPinjamCellAddress = XLSX.utils.encode_cell({ r: row, c: 4 });
            if (worksheet[tglPinjamCellAddress]) {
                worksheet[tglPinjamCellAddress].s = {
                    alignment: { horizontal: "center", vertical: "center" },
                };
            }

            // TGL KEMBALI column (F) - center align
            const tglKembaliCellAddress = XLSX.utils.encode_cell({ r: row, c: 5 });
            if (worksheet[tglKembaliCellAddress]) {
                worksheet[tglKembaliCellAddress].s = {
                    alignment: { horizontal: "center", vertical: "center" },
                };
            }
        }

        // Add worksheet to workbook
        XLSX.utils.book_append_sheet(workbook, worksheet, "Peminjaman APD");

        // Generate filename dengan timestamp
        const now = new Date();
        const dateStr = now.toISOString().split("T")[0]; // YYYY-MM-DD
        const timeStr = now.toTimeString().split(" ")[0].replace(/:/g, "-"); // HH-MM-SS
        const filename = `Peminjaman_APD_${dateStr}_${timeStr}.xlsx`;

        // Export file
        XLSX.writeFile(workbook, filename);

    } catch (error) {
        console.error("Error exporting peminjaman APD to Excel:", error);
        throw new Error("Gagal mengexport data ke Excel");
    }
}