/**
 * Created by Michal Vranec on 02.10.2016.
 */

import {_} from 'lodash';
import {columns} from  './columns.js';

/**
 * validates json object that represents spreadsheet table. spreadsheet has to be complete.
 * All columns have to be filled
 *
 * @param json valid json object
 * @param spreadsheatId id of spreadsheet in db
 * example:
 * {sheet: 1 [{name: test1 }, {name: test 2 }]}
 */
export function validateJsonFromExcel(json, spreadsheatId) {
    if (!_.isPlainObject(json) || _.isEmpty(json)) {
        return ([{
            name: 'excel2json-validation',
            sId: spreadsheatId
        }], 'output from excel2Json is invalid object');
    }
    //check if there is more than 1 sheet in file
    const jsonObjKeys = Object.keys(json);
    if (jsonObjKeys.length > 1) {
        return ([{
            name: 'excel-data',
            type: 'more-sheets',
            sId: spreadsheatId
        }], 'There are more than 1 sheets in file');
    }
    //check if spreadsheet is empty
    const array = json[jsonObjKeys[0]];
    if (_.isArray(array) && _.isEmpty(array)) {
        return ([{name: 'excel-data', type: 'empty', sId: spreadsheatId}], 'spreadsheet is empty');
    }

    //check if there are missing or invalid rows
    let missingRows = [];
    let invalidCols = [];
    array.forEach((elem, idx)=> {
        const curObjKeys = Object.keys(elem);
        const diffMissingRows = _.difference(columns, curObjKeys);
        const diffInvalidRows = _.difference(curObjKeys, columns);
        if (diffMissingRows.length > 0) {
            //spreadsheet begins with 1 and array begins with 0
            diffMissingRows.forEach(row => {
                missingRows.push({colName: row, rowIndex: idx + 1});
                const found = _.findLast(missingRows, ['colName', row]);
                if (found && found.rowIndex === array.length) {
                    _.remove(missingRows, ['colName', row]);
                    found.rowIndex = false;
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
    if (!_.isEmpty(invalidCols) || !isEmpty(missingRows)) {
        return ([{
            name: 'excel-data',
            sId: spreadsheatId,
            type: 'cols-error',
            cols: {invalidCols: invalidCols, missingRows: missingRows}
        }]);
    }
}

 
