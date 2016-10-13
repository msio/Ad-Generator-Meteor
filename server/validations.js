import {_} from 'lodash';
import {columns} from  '../both/columns.js';
import XLSX from 'xlsx';

export function validateSpreadsheet(filePath) {
    const workbook = XLSX.readFile(filePath);
    var sheets = workbook.SheetNames;
    if (sheets.length > 1) {
        return {
            name: 'excel-data',
            type: 'more-sheets',
            msg: 'There are more than 1 sheet in file'
        };
    }
    const firstSheet = workbook.SheetNames[0];
    const worksheet = workbook.Sheets[firstSheet];
    const array = XLSX.utils.sheet_to_json(worksheet);
    if (array.length === 0) {
        return {name: 'excel-data', type: 'empty', msg: 'Spreadsheet is empty'};
    }

    let missingRows = [];
    let invalidCols = [];
    const columnNames = _.map(columns, 'name');
    array.forEach((elem, idx)=> {
        const curObjKeys = Object.keys(elem);
        const diffMissingRows = _.difference(columnNames, curObjKeys);
        const diffInvalidRows = _.difference(curObjKeys, columnNames);
        if (diffMissingRows.length > 0) {
            //spreadsheet begins with 1 and array begins with 0
            diffMissingRows.forEach(row => {
                missingRows.push({colName: row, rowIndex: idx + 1});
                const found = _.findLast(missingRows, ['colName', row]);
                if (found && found.rowIndex === array.length) {
                    _.remove(missingRows, ['colName', row]);
                    found.rowIndex = -1;
                    missingRows.push(found);
                }
            });
        }
        if (diffInvalidRows.length > 0) {
            diffInvalidRows.forEach(row => {
                const found = _.find(invalidCols, ['colName', row]);
                if (!found) {
                    invalidCols.push({colName: row});
                }
            });
        }

    });

    if (!_.isEmpty(invalidCols) || !_.isEmpty(missingRows)) {
        return {
            name: 'excel-data',
            type: 'cols-error',
            cols: {invalidCols: invalidCols, missingRows: missingRows}
        };
    }
    return {name: 'ok', type: 'data', data: array};
}
 
