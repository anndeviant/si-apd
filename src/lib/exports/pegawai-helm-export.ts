import * as XLSX from "xlsx";

interface PegawaiHelmExportData {
    id: number;
    no: number;
    nama?: string;
    nip?: string;
    warna_helm?: string;
    signed_url_helm?: string;
}

/**
 * Export data pegawai helm ke Excel
 */
export function exportPegawaiHelmToExcel(data: PegawaiHelmExportData[]): void {
    try {
        // Buat workbook baru
        const wb = XLSX.utils.book_new();

        // Siapkan data untuk worksheet dengan header yang diminta
        const excelData: (string | number)[][] = [];

        // Header row
        const headers = ["NO", "NAMA", "NIP", "WARNA HELM", "DOKUMENTASI"];
        excelData.push(headers);

        // Data rows
        data.forEach((item) => {
            const row = [
                item.no, // NO
                item.nama || "-", // NAMA
                item.nip || "-", // NIP
                item.warna_helm || "-", // WARNA HELM
                item.signed_url_helm || "-", // DOKUMENTASI - langsung URL string
            ];
            excelData.push(row);
        });

        // Buat worksheet
        const ws = XLSX.utils.aoa_to_sheet(excelData);

        // Set column widths untuk readability
        ws["!cols"] = [
            { wch: 6 },   // NO
            { wch: 25 },  // NAMA
            { wch: 20 },  // NIP
            { wch: 15 },  // WARNA HELM
            { wch: 50 },  // DOKUMENTASI
        ];

        // Get worksheet range
        const range = XLSX.utils.decode_range(ws["!ref"] || "A1");

        // Define border style
        const borderStyle = {
            top: { style: "thin", color: { rgb: "000000" } },
            bottom: { style: "thin", color: { rgb: "000000" } },
            left: { style: "thin", color: { rgb: "000000" } },
            right: { style: "thin", color: { rgb: "000000" } },
        };

        // Apply styling to all cells
        for (let row = range.s.r; row <= range.e.r; row++) {
            for (let col = range.s.c; col <= range.e.c; col++) {
                const cellAddress = XLSX.utils.encode_cell({ r: row, c: col });

                // Initialize cell if it doesn't exist
                if (!ws[cellAddress]) {
                    ws[cellAddress] = { v: "", t: "s" };
                }

                // Base styling
                ws[cellAddress].s = {
                    border: borderStyle,
                    alignment: { vertical: "center" },
                };
            }
        }

        // Style header row (row 0)
        for (let col = range.s.c; col <= range.e.c; col++) {
            const cellAddress = XLSX.utils.encode_cell({ r: 0, c: col });

            // Initialize cell if it doesn't exist
            if (!ws[cellAddress]) {
                ws[cellAddress] = { t: "s", v: "" };
            }

            ws[cellAddress].s = {
                fill: { fgColor: { rgb: "E3F2FD" } }, // Light blue background
                font: { bold: true },
                alignment: { horizontal: "center", vertical: "center" },
                border: borderStyle,
            };
        }

        // Style data rows (starting from row 1)
        for (let row = 1; row <= range.e.r; row++) {
            for (let col = range.s.c; col <= range.e.c; col++) {
                const cellAddress = XLSX.utils.encode_cell({ r: row, c: col });

                // Initialize cell if it doesn't exist
                if (!ws[cellAddress]) {
                    ws[cellAddress] = { t: "s", v: "" };
                }

                // Determine alignment based on column
                let horizontalAlign: string;
                if (col === 0 || col === 2 || col === 3) {
                    // NO, NIP, WARNA HELM - center align
                    horizontalAlign = "center";
                } else if (col === 1) {
                    // NAMA - left align
                    horizontalAlign = "left";
                } else {
                    // DOKUMENTASI - left align untuk URL
                    horizontalAlign = "left";
                }

                ws[cellAddress].s = {
                    alignment: { horizontal: horizontalAlign, vertical: "center" },
                    border: borderStyle,
                };

                // Special styling for DOKUMENTASI column if it contains URL
                if (col === 4 && ws[cellAddress].v && ws[cellAddress].v !== "-") {
                    ws[cellAddress].s.font = { color: { rgb: "0066CC" } }; // Blue color for URLs
                }
            }
        }

        // Add worksheet to workbook
        XLSX.utils.book_append_sheet(wb, ws, "Data Pegawai Helm");

        // Generate filename dengan timestamp
        const now = new Date();
        const timestamp = now.toISOString().slice(0, 19).replace(/[:-]/g, "").replace("T", "_");
        const filename = `Data_Pegawai_Helm_${timestamp}.xlsx`;

        // Export file
        XLSX.writeFile(wb, filename);

    } catch (error) {
        console.error("Error exporting pegawai helm to Excel:", error);
        throw new Error("Gagal mengexport data pegawai helm ke Excel");
    }
}