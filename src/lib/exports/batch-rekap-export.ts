import * as XLSX from 'xlsx';
import type { ApdMonthlyWithRelations } from '../types/database';

interface BatchRekapExportOptions {
    filename?: string;
    sheetName?: string;
    periode: string;
}

export function exportBatchRekapToExcel(
    data: ApdMonthlyWithRelations[],
    options: BatchRekapExportOptions
) {
    const {
        filename = 'Personal_Protection_Equipment_Balance_Report',
        sheetName = 'Balance Report',
        periode
    } = options;

    // Create workbook
    const wb = XLSX.utils.book_new();

    // Prepare data for Excel
    const excelData: (string | number)[][] = [];

    // Row 1: Main title (PERSONAL PROTECTION EQUIPMENT BALANCE REPORT)
    excelData.push(['PERSONAL PROTECTION EQUIPMENT BALANCE REPORT']);

    // Row 2: Department and Date (separate cells for proper merging)
    excelData.push(['GENERAL ENGINEERING 2025', '', '', `Recapitulation Date : ${periode}`, '', '', '']);

    // Row 3: Column headers
    const headers = ['No', 'PPE', 'Stock PPE', 'Realisasi', 'Distribusi', 'Saldo Akhir', 'Satuan'];
    excelData.push(headers);

    // Add data rows
    data.forEach((item, index) => {
        const row = [
            index + 1, // No
            item.apd_items?.name || '-', // PPE
            item.stock_awal || 0, // Stock PPE
            item.realisasi || 0, // Realisasi
            item.distribusi || 0, // Distribusi
            item.saldo_akhir || 0, // Saldo Akhir
            item.satuan || item.apd_items?.satuan || 'Pcs' // Satuan
        ];
        excelData.push(row);
    });

    // Create worksheet
    const ws = XLSX.utils.aoa_to_sheet(excelData);

    // Set column widths
    ws['!cols'] = [
        { wch: 6 },   // No
        { wch: 35 },  // PPE
        { wch: 12 },  // Stock PPE
        { wch: 12 },  // Realisasi
        { wch: 12 },  // Distribusi
        { wch: 12 },  // Saldo Akhir
        { wch: 10 }   // Satuan
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
                ws[cellAddress] = { v: '', t: 's' };
            }

            // Base styling
            ws[cellAddress].s = {
                border: borderStyle,
                alignment: { vertical: 'center' }
            };
        }
    }

    // Style main title (row 0) - merge across all columns
    if (!ws['!merges']) ws['!merges'] = [];
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
        font: { bold: true, size: 14 },
        alignment: { horizontal: 'center', vertical: 'center' },
        border: borderStyle
    };

    // Style row 2 (Department and Date) - split into 2 balanced sections
    ws['!merges'].push({
        s: { r: 1, c: 0 },
        e: { r: 1, c: 2 }
    });
    ws['!merges'].push({
        s: { r: 1, c: 3 },
        e: { r: 1, c: 6 }
    });

    // Style department cell
    const deptCell = XLSX.utils.encode_cell({ r: 1, c: 0 });

    // Initialize cell if it doesn't exist
    if (!ws[deptCell]) {
        ws[deptCell] = { t: 's', v: '' };
    }

    ws[deptCell].s = {
        font: { bold: true },
        alignment: { horizontal: 'center', vertical: 'center' },
        border: borderStyle
    };

    // Style date cell
    const dateCell = XLSX.utils.encode_cell({ r: 1, c: 3 });

    // Initialize cell if it doesn't exist
    if (!ws[dateCell]) {
        ws[dateCell] = { t: 's', v: '' };
    }

    ws[dateCell].s = {
        font: { bold: true },
        alignment: { horizontal: 'center', vertical: 'center' },
        border: borderStyle
    };

    // Style header row (row 2)
    for (let col = 0; col < headers.length; col++) {
        const headerCell = XLSX.utils.encode_cell({ r: 2, c: col });

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

    // Style data rows (starting from row 3)
    for (let row = 3; row <= range.e.r; row++) {
        for (let col = 0; col < headers.length; col++) {
            const dataCell = XLSX.utils.encode_cell({ r: row, c: col });
            const isNumberCol = col >= 2 && col <= 5; // Stock PPE, Realisasi, Distribusi, Saldo Akhir

            // Initialize cell if it doesn't exist
            if (!ws[dataCell]) {
                ws[dataCell] = { t: 's', v: '' };
            }

            ws[dataCell].s = {
                alignment: {
                    horizontal: isNumberCol ? 'right' : (col === 0 ? 'center' : 'left'),
                    vertical: 'center'
                },
                border: borderStyle
            };

            // Special styling for negative saldo akhir (column 5)
            if (col === 5 && ws[dataCell].v && Number(ws[dataCell].v) < 0) {
                ws[dataCell].s.font = { color: { rgb: 'FF0000' } }; // Red for negative
            }
        }
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