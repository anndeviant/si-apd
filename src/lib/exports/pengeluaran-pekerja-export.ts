import * as XLSX from 'xlsx';
import type { PengeluaranPekerjaData } from '../types/database';

interface PengeluaranPekerjaExportOptions {
    filename?: string;
    sheetName?: string;
    periode: string;
    apdName: string;
}

// Helper function untuk format tanggal di Excel
function formatTanggalForExcel(tanggal: string): string {
    try {
        if (!tanggal || typeof tanggal !== 'string') {
            return 'Tanggal tidak valid';
        }

        const date = new Date(tanggal);

        // Check if date is valid
        if (isNaN(date.getTime())) {
            return tanggal; // Return original if can't parse
        }

        return `${date.getDate()}-${date.getMonth() + 1}-${date.getFullYear()}`;
    } catch (error) {
        console.error('Error formatting tanggal for Excel:', error);
        return tanggal; // Return original string if error occurs
    }
}

export function exportPengeluaranPekerjaToExcel(
    data: PengeluaranPekerjaData[],
    options: PengeluaranPekerjaExportOptions
) {
    const {
        filename = 'Laporan_Pengeluaran_APD',
        sheetName = 'Pengeluaran APD',
        periode,
        apdName
    } = options;

    // Create workbook
    const wb = XLSX.utils.book_new();

    // Prepare data for Excel
    const excelData: (string | number)[][] = [];

    // Row 1: Header utama
    excelData.push(['Laporan Pengeluaran Alat Pelindung Diri (APD)']);

    // Row 2: APD Name and Periode (separate cells for proper merging)
    excelData.push([`Nama APD yang di minta : ${apdName}`, '', '', `Periode : ${periode}`, '', '']);

    // Row 5: Kosong untuk spasi
    excelData.push(['']);

    // Row 6: Header tabel
    const headers = ['NO', 'NAMA', 'Tanggal', 'Bengkel/Biro/Jabatan', 'Qty', 'TANDA TANGAN'];
    excelData.push(headers);

    // Add data rows
    data.forEach((item, index) => {
        const row = [
            index + 1, // NO
            item.nama || '-', // NAMA
            formatTanggalForExcel(item.tanggal), // Tanggal
            item.bengkel_name || '-', // Bengkel/Biro/Jabatan
            `${item.qty} ${item.satuan}`, // Qty
            '' // TANDA TANGAN (kosong)
        ];
        excelData.push(row);
    });

    // Footer - 3 baris
    // Row Footer 1: "Mengetahui"
    excelData.push(['']);
    excelData.push(['Mengetahui']);

    // Row Footer 2: Jabatan (3 kolom with proper spacing for merging)
    excelData.push(['Inspektor Safety', '', 'Inspektor Safety', '', 'Ka. Biro K3LH', '']);

    // Row Footer 3: Template tanda tangan (3 kolom with proper spacing for merging)
    excelData.push(['', '', '', '', '', '']);

    // Create worksheet
    const ws = XLSX.utils.aoa_to_sheet(excelData);

    // Set column widths
    ws['!cols'] = [
        { wch: 6 },   // NO
        { wch: 25 },  // NAMA
        { wch: 12 },  // Tanggal
        { wch: 20 },  // Bengkel/Biro/Jabatan
        { wch: 12 },  // Qty
        { wch: 18 }   // TANDA TANGAN
    ];

    // Get worksheet range
    const range = XLSX.utils.decode_range(ws['!ref'] || 'A1');

    // Define border style
    const borderStyle = {
        top: { style: 'thin', color: { rgb: '000000' } },
        bottom: { style: 'thin', color: { rgb: '000000' } },
        left: { style: 'thin', color: { rgb: '000000' } },
        right: { style: 'thin', color: { rgb: '000000' } }
    };

    // Apply styling to all cells
    for (let row = range.s.r; row <= range.e.r; row++) {
        for (let col = range.s.c; col <= range.e.c; col++) {
            const cellAddress = XLSX.utils.encode_cell({ r: row, c: col });

            // Initialize cell if it doesn't exist
            if (!ws[cellAddress]) {
                ws[cellAddress] = { t: 's', v: '' };
            }

            // Base styling
            ws[cellAddress].s = {
                alignment: { vertical: 'center', wrapText: true }
            };
        }
    }

    // Merge and style header rows
    if (!ws['!merges']) ws['!merges'] = [];

    // Row 1: Merge untuk judul utama
    ws['!merges'].push({
        s: { r: 0, c: 0 },
        e: { r: 0, c: headers.length - 1 }
    });

    const titleCell = XLSX.utils.encode_cell({ r: 0, c: 0 });

    // Initialize cell if it doesn't exist
    if (!ws[titleCell]) {
        ws[titleCell] = { t: 's', v: '' };
    }

    ws[titleCell].s = {
        font: { bold: true, size: 16 },
        alignment: { horizontal: 'center', vertical: 'center', wrapText: true },
        border: borderStyle
    };

    // Row 2: APD Name and Periode - split into 2 balanced sections
    ws['!merges'].push({
        s: { r: 1, c: 0 },
        e: { r: 1, c: 2 }
    });
    ws['!merges'].push({
        s: { r: 1, c: 3 },
        e: { r: 1, c: 5 }
    });

    // Style APD name cell
    const apdCell = XLSX.utils.encode_cell({ r: 1, c: 0 });

    // Initialize cell if it doesn't exist
    if (!ws[apdCell]) {
        ws[apdCell] = { t: 's', v: '' };
    }

    ws[apdCell].s = {
        font: { bold: true, size: 11 },
        alignment: { horizontal: 'left', vertical: 'center', wrapText: true },
        border: borderStyle
    };

    // Style periode cell
    const periodeCell = XLSX.utils.encode_cell({ r: 1, c: 3 });

    // Initialize cell if it doesn't exist
    if (!ws[periodeCell]) {
        ws[periodeCell] = { t: 's', v: '' };
    }

    ws[periodeCell].s = {
        font: { bold: true, size: 11 },
        alignment: { horizontal: 'right', vertical: 'center', wrapText: true },
        border: borderStyle
    };



    // Header tabel (row 4 dalam array, index 3)
    const headerRowIndex = 3;
    for (let col = 0; col < headers.length; col++) {
        const headerCell = XLSX.utils.encode_cell({ r: headerRowIndex, c: col });

        // Initialize cell if it doesn't exist
        if (!ws[headerCell]) {
            ws[headerCell] = { t: 's', v: '' };
        }

        ws[headerCell].s = {
            fill: { fgColor: { rgb: '000000' } }, // Black background
            font: { bold: true, color: { rgb: 'FFFFFF' } }, // White text
            alignment: { horizontal: 'center', vertical: 'center' },
            border: borderStyle
        };
    }

    // Data rows - add borders
    const dataStartRow = headerRowIndex + 1;
    const dataEndRow = dataStartRow + data.length - 1;

    for (let row = dataStartRow; row <= dataEndRow; row++) {
        for (let col = 0; col < headers.length; col++) {
            const dataCell = XLSX.utils.encode_cell({ r: row, c: col });

            // Initialize cell if it doesn't exist
            if (!ws[dataCell]) {
                ws[dataCell] = { t: 's', v: '' };
            }

            ws[dataCell].s = {
                alignment: {
                    horizontal: col === 1 ? 'left' : 'center', // Nama rata kiri, lainnya tengah
                    vertical: 'center'
                },
                border: borderStyle
            };
        }
    }

    // Footer styling
    const footerStartRow = dataEndRow + 2; // Skip 1 empty row

    // "Mengetahui" row
    ws['!merges'].push({
        s: { r: footerStartRow, c: 0 },
        e: { r: footerStartRow, c: headers.length - 1 }
    });

    const mengetahuiCell = XLSX.utils.encode_cell({ r: footerStartRow, c: 0 });

    // Initialize cell if it doesn't exist
    if (!ws[mengetahuiCell]) {
        ws[mengetahuiCell] = { t: 's', v: '' };
    }

    ws[mengetahuiCell].s = {
        font: { bold: true, size: 12 },
        alignment: { horizontal: 'center', vertical: 'center' }
    };

    // Jabatan row (3 kolom)
    const jabatanRowIndex = footerStartRow + 1;
    for (let col = 0; col < 3; col++) {
        const jabatanCell = XLSX.utils.encode_cell({ r: jabatanRowIndex, c: col * 2 });

        // Initialize cell if it doesn't exist
        if (!ws[jabatanCell]) {
            ws[jabatanCell] = { t: 's', v: '' };
        }

        ws[jabatanCell].s = {
            font: { bold: true, size: 11 },
            alignment: { horizontal: 'center', vertical: 'center' }
        };

        // Merge setiap jabatan dengan kolom sebelahnya
        ws['!merges'].push({
            s: { r: jabatanRowIndex, c: col * 2 },
            e: { r: jabatanRowIndex, c: (col * 2) + 1 }
        });
    }

    // Template tanda tangan row (3 kolom)
    const ttdRowIndex = jabatanRowIndex + 2; // Skip 1 row for signature space
    for (let col = 0; col < 3; col++) {
        const ttdCell = XLSX.utils.encode_cell({ r: ttdRowIndex, c: col * 2 });

        // Initialize cell if it doesn't exist
        if (!ws[ttdCell]) {
            ws[ttdCell] = { t: 's', v: '' };
        }

        ws[ttdCell].s = {
            font: { size: 11 },
            alignment: { horizontal: 'center', vertical: 'center' }
        };

        // Merge setiap template dengan kolom sebelahnya
        ws['!merges'].push({
            s: { r: ttdRowIndex, c: col * 2 },
            e: { r: ttdRowIndex, c: (col * 2) + 1 }
        });
    }

    // Add worksheet to workbook
    XLSX.utils.book_append_sheet(wb, ws, sheetName);

    // Generate filename with timestamp
    const now = new Date();
    const timestamp = now.toISOString().slice(0, 19).replace(/[:-]/g, '').replace('T', '_');
    const finalFilename = `${filename}_${timestamp}.xlsx`;

    // Save file
    XLSX.writeFile(wb, finalFilename);

    return finalFilename;
}