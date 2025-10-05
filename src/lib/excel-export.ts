import * as XLSX from 'xlsx';
import type { PegawaiWithRelations } from './types/database';

interface ExcelExportOptions {
    filename?: string;
    sheetName?: string;
}

export function exportPegawaiToExcel(
    groupedData: { divisi: string; pegawai: PegawaiWithRelations[] }[],
    options: ExcelExportOptions = {}
) {
    const { filename = 'Data_Pegawai_Mandatory_APD', sheetName = 'Data Pegawai' } = options;

    // Create workbook
    const wb = XLSX.utils.book_new();

    // Prepare data for Excel - exactly like web table
    const excelData: (string | number)[][] = [];

    // Track rows for styling (header + all data rows)
    const divisiRows: number[] = []; // Track which rows are divisi separators
    let rowIndex = 0;

    // Add header row (exactly like web)
    const headers = [
        'NO',
        'NAMA',
        'POSISI',
        'SIZE (Sepatu)',
        'JENIS SEPATU',
        'Warna katelpack',
        'SIZE (katelpack)',
        'WARNA HELM',
        'NIP'
    ];
    excelData.push(headers);
    rowIndex++;

    // Add data rows grouped by divisi (exactly like web ordering)
    groupedData.forEach((group) => {
        // Add divisi separator row
        divisiRows.push(rowIndex);
        const divisiRow: (string | number)[] = new Array(headers.length).fill('');
        divisiRow[0] = group.divisi;
        excelData.push(divisiRow);
        rowIndex++;

        // Add pegawai data for this divisi (ordered same as web)
        group.pegawai.forEach((pegawai, index) => {
            const row = [
                index + 1, // NO (starts from 1 for each divisi)
                pegawai.nama || '-',
                pegawai.posisi?.nama_posisi || '-',
                pegawai.size_sepatu?.toString() || '-',
                pegawai.jenis_sepatu || '-',
                pegawai.warna_katelpack || '-',
                pegawai.size_katelpack || '-',
                pegawai.warna_helm || '-',
                pegawai.nip || '-'
            ];
            excelData.push(row);
            rowIndex++;
        });
    });

    // Create worksheet
    const ws = XLSX.utils.aoa_to_sheet(excelData);

    // Set column widths (optimized for readability)
    ws['!cols'] = [
        { wch: 6 },   // NO
        { wch: 25 },  // NAMA
        { wch: 18 },  // POSISI
        { wch: 14 },  // SIZE (Sepatu)
        { wch: 16 },  // JENIS SEPATU
        { wch: 16 },  // Warna katelpack
        { wch: 14 },  // SIZE (katelpack)
        { wch: 14 },  // WARNA HELM
        { wch: 16 }   // NIP
    ];

    // Get worksheet range
    const range = XLSX.utils.decode_range(ws['!ref'] || 'A1');

    // Define consistent border style for all data cells
    const borderStyle = {
        top: { style: 'thin', color: { rgb: '000000' } },
        bottom: { style: 'thin', color: { rgb: '000000' } },
        left: { style: 'thin', color: { rgb: '000000' } },
        right: { style: 'thin', color: { rgb: '000000' } }
    };

    // Apply borders to ALL cells that contain data (no empty cells)
    for (let row = range.s.r; row <= range.e.r; row++) {
        for (let col = range.s.c; col <= range.e.c; col++) {
            const cellAddress = XLSX.utils.encode_cell({ r: row, c: col });

            // Initialize cell if it doesn't exist
            if (!ws[cellAddress]) {
                ws[cellAddress] = { v: '', t: 's' };
            }

            // Apply consistent border to all data cells
            ws[cellAddress].s = {
                border: borderStyle,
                alignment: { vertical: 'center' }
            };
        }
    }

    // Style header row (row 0) - Red background like web
    for (let col = range.s.c; col <= range.e.c; col++) {
        const cellAddress = XLSX.utils.encode_cell({ r: 0, c: col });
        ws[cellAddress].s = {
            ...ws[cellAddress].s, // Preserve existing styling
            fill: { fgColor: { rgb: 'FEE2E2' } }, // red-100
            font: { bold: true },
            alignment: { horizontal: 'center', vertical: 'center' },
            border: borderStyle // Use consistent border
        };
    }

    // Style divisi separator rows - Blue background like web
    divisiRows.forEach((rowNum) => {
        for (let col = range.s.c; col <= range.e.c; col++) {
            const cellAddress = XLSX.utils.encode_cell({ r: rowNum, c: col });
            ws[cellAddress].s = {
                ...ws[cellAddress].s, // Preserve existing styling
                fill: { fgColor: { rgb: 'DBEAFE' } }, // blue-100
                font: { bold: true },
                alignment: { horizontal: 'left', vertical: 'center' }, // Left aligned like web
                border: borderStyle // Use consistent border
            };
        }

        // Merge cells for divisi row (span across all columns)
        if (!ws['!merges']) ws['!merges'] = [];
        ws['!merges'].push({
            s: { r: rowNum, c: 0 },
            e: { r: rowNum, c: headers.length - 1 }
        });
    });

    // Style data rows (white background, proper alignment like web)
    for (let row = 1; row <= range.e.r; row++) {
        // Skip divisi separator rows
        if (divisiRows.includes(row)) continue;

        for (let col = range.s.c; col <= range.e.c; col++) {
            const cellAddress = XLSX.utils.encode_cell({ r: row, c: col });
            ws[cellAddress].s = {
                ...ws[cellAddress].s, // Preserve existing styling including borders
                alignment: {
                    horizontal: col === 1 ? 'left' : 'center', // NAMA left, others center like web
                    vertical: 'center'
                },
                border: borderStyle, // Ensure consistent border
                fill: { fgColor: { rgb: 'FFFFFF' } } // Explicit white background for data rows
            };
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