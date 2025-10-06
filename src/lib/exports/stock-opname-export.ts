import * as XLSX from "xlsx";

interface StockOpnameExportData {
    id: number;
    name: string;
    jumlah: number;
    satuan: string | null;
}

/**
 * Export data stock opname APD ke Excel
 */
export function exportStockOpnameToExcel(data: StockOpnameExportData[]): void {
    try {
        // Buat workbook baru
        const workbook = XLSX.utils.book_new();

        // Siapkan data untuk worksheet dengan header yang diminta
        const worksheetData = [
            // Header
            ["NO", "NAMA APD", "STOCK AWAL", "SATUAN"],
            // Data rows
            ...data.map((item, index) => [
                index + 1, // NO
                item.name, // NAMA APD
                item.jumlah || 0, // STOCK AWAL
                item.satuan || "-", // SATUAN
            ]),
        ];

        // Buat worksheet
        const worksheet = XLSX.utils.aoa_to_sheet(worksheetData);

        // Set column widths untuk readability
        worksheet["!cols"] = [
            { width: 5 }, // NO
            { width: 30 }, // NAMA APD
            { width: 15 }, // STOCK AWAL
            { width: 15 }, // SATUAN
        ];

        // Style header row (bold)
        const headerStyle = {
            font: { bold: true },
            alignment: { horizontal: "center", vertical: "center" },
            fill: { fgColor: { rgb: "E3F2FD" } },
        };

        // Apply header styling
        const range = XLSX.utils.decode_range(worksheet["!ref"] || "A1:D1");
        for (let col = range.s.c; col <= range.e.c; col++) {
            const cellAddress = XLSX.utils.encode_cell({ r: 0, c: col });
            if (!worksheet[cellAddress]) continue;
            worksheet[cellAddress].s = headerStyle;
        }

        // Center align untuk kolom NO dan SATUAN
        for (let row = 1; row <= data.length; row++) {
            // NO column (A)
            const noCellAddress = XLSX.utils.encode_cell({ r: row, c: 0 });
            if (worksheet[noCellAddress]) {
                worksheet[noCellAddress].s = {
                    alignment: { horizontal: "center", vertical: "center" },
                };
            }

            // SATUAN column (D)
            const satuanCellAddress = XLSX.utils.encode_cell({ r: row, c: 3 });
            if (worksheet[satuanCellAddress]) {
                worksheet[satuanCellAddress].s = {
                    alignment: { horizontal: "center", vertical: "center" },
                };
            }

            // STOCK AWAL column (C) - right align
            const stockCellAddress = XLSX.utils.encode_cell({ r: row, c: 2 });
            if (worksheet[stockCellAddress]) {
                worksheet[stockCellAddress].s = {
                    alignment: { horizontal: "right", vertical: "center" },
                    numFmt: "#,##0", // Format number with thousand separator
                };
            }
        }

        // Add worksheet to workbook
        XLSX.utils.book_append_sheet(workbook, worksheet, "Stock Opname APD");

        // Generate filename dengan timestamp
        const now = new Date();
        const dateStr = now.toISOString().split("T")[0]; // YYYY-MM-DD
        const timeStr = now.toTimeString().split(" ")[0].replace(/:/g, "-"); // HH-MM-SS
        const filename = `Stock_Opname_APD_${dateStr}_${timeStr}.xlsx`;

        // Export file
        XLSX.writeFile(workbook, filename);

    } catch (error) {
        console.error("Error exporting stock opname to Excel:", error);
        throw new Error("Gagal mengexport data ke Excel");
    }
}