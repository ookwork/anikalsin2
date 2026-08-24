function escapeCsvField(value: string | number): string {
  const str = String(value);
  if (/[",\n\r]/.test(str)) {
    return `"${str.replace(/"/g, '""')}"`;
  }
  return str;
}

/** Kayıtları Excel uyumlu (UTF-8 BOM'lu, CRLF satır sonlu) bir CSV metnine çevirir. */
export function toCsv(rows: Record<string, string | number>[]): string {
  const BOM = "﻿";
  if (rows.length === 0) return BOM;

  const headers = Object.keys(rows[0]);
  const lines = [
    headers.map(escapeCsvField).join(","),
    ...rows.map((row) => headers.map((h) => escapeCsvField(row[h] ?? "")).join(",")),
  ];

  return BOM + lines.join("\r\n");
}
