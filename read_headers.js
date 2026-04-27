const XLSX = require('xlsx');
const workbook = XLSX.readFile('baza_wynajem_ulepszona.xlsx');
console.log('Sheet Names:', workbook.SheetNames);
