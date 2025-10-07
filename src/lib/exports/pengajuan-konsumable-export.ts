import * as XLSX from "xlsx";

interface PengajuanKonsumableExportData {
    id: number;
    file_url: string;
    nama_file: string;
    created_at: string;
    user_id?: string;
}

/**
 * Export data file pengajuan konsumable ke Excel
 */
export function exportPengajuanKonsumableToExcel(data: PengajuanKonsumableExportData[]): void {
    try {
        // Buat workbook baru
        const workbook = XLSX.utils.book_new();

        // Helper function untuk format tanggal
        const formatDate = (dateString: string): string => {
            try {
                const date = new Date(dateString);
                return date.toLocaleString("id-ID", {
                    year: "numeric",
                    month: "short",
                    day: "2-digit",
                    hour: "2-digit",
                    minute: "2-digit",
                });
            } catch {
                return "-";
            }
        };

        // Helper function untuk format ukuran file
        const formatFileSize = (): string => {
            // This is a placeholder - in real implementation, you might want to 
            // fetch file size from storage or store it in database
            return "N/A";
        };

        // Siapkan data untuk worksheet dengan header
        const worksheetData = [
            // Header
            [
                "NO",
                "NAMA FILE",
                "TANGGAL UPLOAD",
                "USER ID",
                "STATUS",
                "UKURAN",
                "LINK FILE"
            ],
            // Data rows
            ...data.map((item, index) => [
                index + 1, // NO
                item.nama_file, // NAMA FILE
                formatDate(item.created_at), // TANGGAL UPLOAD
                item.user_id || "-", // USER ID
                "Active", // STATUS
                formatFileSize(), // UKURAN
                item.file_url, // LINK FILE
            ]),
        ];

        // Buat worksheet
        const worksheet = XLSX.utils.aoa_to_sheet(worksheetData);

        // Set column widths untuk readability
        worksheet["!cols"] = [
            { width: 5 }, // NO
            { width: 30 }, // NAMA FILE
            { width: 20 }, // TANGGAL UPLOAD
            { width: 15 }, // USER ID
            { width: 10 }, // STATUS
            { width: 12 }, // UKURAN
            { width: 50 }, // LINK FILE
        ];

        // Style header row (bold)
        const headerStyle = {
            font: { bold: true },
            alignment: { horizontal: "center", vertical: "center" },
            fill: { fgColor: { rgb: "E3F2FD" } },
        };

        // Apply header styling
        const range = XLSX.utils.decode_range(worksheet["!ref"] || "A1:G1");
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

            // NAMA FILE column (B) - left align
            const namaFileCellAddress = XLSX.utils.encode_cell({ r: row, c: 1 });
            if (worksheet[namaFileCellAddress]) {
                worksheet[namaFileCellAddress].s = {
                    alignment: { horizontal: "left", vertical: "center" },
                };
            }

            // TANGGAL UPLOAD column (C) - center align
            const tanggalCellAddress = XLSX.utils.encode_cell({ r: row, c: 2 });
            if (worksheet[tanggalCellAddress]) {
                worksheet[tanggalCellAddress].s = {
                    alignment: { horizontal: "center", vertical: "center" },
                };
            }

            // USER ID column (D) - center align
            const userIdCellAddress = XLSX.utils.encode_cell({ r: row, c: 3 });
            if (worksheet[userIdCellAddress]) {
                worksheet[userIdCellAddress].s = {
                    alignment: { horizontal: "center", vertical: "center" },
                };
            }

            // STATUS column (E) - center align
            const statusCellAddress = XLSX.utils.encode_cell({ r: row, c: 4 });
            if (worksheet[statusCellAddress]) {
                worksheet[statusCellAddress].s = {
                    alignment: { horizontal: "center", vertical: "center" },
                };
            }

            // UKURAN column (F) - center align
            const ukuranCellAddress = XLSX.utils.encode_cell({ r: row, c: 5 });
            if (worksheet[ukuranCellAddress]) {
                worksheet[ukuranCellAddress].s = {
                    alignment: { horizontal: "center", vertical: "center" },
                };
            }

            // LINK FILE column (G) - left align
            const linkCellAddress = XLSX.utils.encode_cell({ r: row, c: 6 });
            if (worksheet[linkCellAddress]) {
                worksheet[linkCellAddress].s = {
                    alignment: { horizontal: "left", vertical: "center" },
                };
            }
        }

        // Add worksheet to workbook
        XLSX.utils.book_append_sheet(workbook, worksheet, "Pengajuan Konsumable");

        // Generate filename dengan timestamp
        const now = new Date();
        const dateStr = now.toISOString().split("T")[0]; // YYYY-MM-DD
        const timeStr = now.toTimeString().split(" ")[0].replace(/:/g, "-"); // HH-MM-SS
        const filename = `Pengajuan_Konsumable_Files_${dateStr}_${timeStr}.xlsx`;

        // Export file
        XLSX.writeFile(workbook, filename);

    } catch (error) {
        console.error("Error exporting pengajuan konsumable files to Excel:", error);
        throw new Error("Gagal mengexport data file konsumable ke Excel");
    }
}

/**
 * Export summary data pengajuan konsumable ke Excel
 */
export function exportPengajuanKonsumableSummaryToExcel(data: PengajuanKonsumableExportData[]): void {
    try {
        // Buat workbook baru
        const workbook = XLSX.utils.book_new();

        // Helper function untuk format tanggal
        const formatDate = (dateString: string): string => {
            try {
                const date = new Date(dateString);
                return date.toLocaleDateString("id-ID");
            } catch {
                return "-";
            }
        };

        // Group data by user_id
        const groupedData = data.reduce((acc, item) => {
            const userId = item.user_id || "Unknown";
            if (!acc[userId]) {
                acc[userId] = [];
            }
            acc[userId].push(item);
            return acc;
        }, {} as Record<string, PengajuanKonsumableExportData[]>);

        // Siapkan data untuk worksheet summary
        const worksheetData = [
            // Header
            [
                "NO",
                "USER ID",
                "TOTAL FILES",
                "LATEST UPLOAD",
                "FIRST UPLOAD",
                "STATUS"
            ],
            // Data rows
            ...Object.entries(groupedData).map(([userId, files], index) => {
                const sortedFiles = files.sort((a, b) =>
                    new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
                );
                const latestUpload = sortedFiles[0];
                const firstUpload = sortedFiles[sortedFiles.length - 1];

                return [
                    index + 1, // NO
                    userId, // USER ID
                    files.length, // TOTAL FILES
                    formatDate(latestUpload.created_at), // LATEST UPLOAD
                    formatDate(firstUpload.created_at), // FIRST UPLOAD
                    files.length > 0 ? "Active" : "Inactive", // STATUS
                ];
            }),
        ];

        // Buat worksheet
        const worksheet = XLSX.utils.aoa_to_sheet(worksheetData);

        // Set column widths untuk readability
        worksheet["!cols"] = [
            { width: 5 }, // NO
            { width: 15 }, // USER ID
            { width: 12 }, // TOTAL FILES
            { width: 15 }, // LATEST UPLOAD
            { width: 15 }, // FIRST UPLOAD
            { width: 10 }, // STATUS
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
        const dataRows = Object.keys(groupedData).length;
        for (let row = 1; row <= dataRows; row++) {
            // Apply center align untuk semua kolom
            for (let col = 0; col < 6; col++) {
                const cellAddress = XLSX.utils.encode_cell({ r: row, c: col });
                if (worksheet[cellAddress]) {
                    worksheet[cellAddress].s = {
                        alignment: { horizontal: "center", vertical: "center" },
                    };
                }
            }
        }

        // Add worksheet to workbook
        XLSX.utils.book_append_sheet(workbook, worksheet, "Summary Konsumable");

        // Generate filename dengan timestamp
        const now = new Date();
        const dateStr = now.toISOString().split("T")[0]; // YYYY-MM-DD
        const timeStr = now.toTimeString().split(" ")[0].replace(/:/g, "-"); // HH-MM-SS
        const filename = `Summary_Pengajuan_Konsumable_${dateStr}_${timeStr}.xlsx`;

        // Export file
        XLSX.writeFile(workbook, filename);

    } catch (error) {
        console.error("Error exporting pengajuan konsumable summary to Excel:", error);
        throw new Error("Gagal mengexport summary data konsumable ke Excel");
    }
}