var simpleReplace = require('simple-replace');
var excel2Json = require('node-excel-to-json');
import {_} from 'lodash';

const columns = ['publisher', 'campaign', 'keyword', 'keyword_no_spaces', 'domain', 'ad_name', 'other_info', 'title'];
/**
 * validates json object that represents spreadsheet table. spreadsheet has to be complete.
 * All columns have to be filled
 *
 * @param json valid json object
 * @param spreadsheatId id of spreadsheet in db
 * example:
 * {sheet: 1 [{name: test1 }, {name: test 2 }]}
 */
function validateJsonFromExcel(json, spreadsheatId) {
    if (!_.isPlainObject(json) || _.isEmpty(json)) {
        throw new ValidationError([{
            name: 'excel2json-validation',
            sId: spreadsheatId
        }], 'output from excel2Json is invalid object');
    }
    //check if there is more than 1 sheet in file
    const jsonObjKeys = Object.keys(json);
    if (jsonObjKeys.length > 1) {
        throw new ValidationError([{
            name: 'excel-data',
            type: 'more-sheets',
            sId: spreadsheatId
        }], 'There are more than 1 sheets in file');
    }
    //check if spreadsheet is empty
    const array = json[jsonObjKeys[0]];
    if (_.isArray(array) && _.isEmpty(array)) {
        throw new ValidationError([{name: 'excel-data', type: 'empty', sId: spreadsheatId}], 'spreadsheet is empty');
    }

    //check if there are missing or invalid rows
    let missingRows = [];
    let invalidRows = [];
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
                    found.rowIndex = -1;
                    missingRows.push(found);
                }
            });
        }

        if (diffInvalidRows.length > 0) {
            diffInvalidRows.forEach(row => {
                const found = _.find(invalidRows, ['colName', row]);
                if (!found) {
                    invalidRows.push({colName: row});
                }
            });
        }

    });
    let errorCols = [];


    //TODO if invalid or missing rows === number of rows in spreadsheet, reduce to one element with name with missing
    // or invalid column
    // console.log(missingRows);
    console.log(invalidRows);


    if (!_.isEmpty(diffRows)) {
        throw new ValidationError([{name: 'excel-data', sId: spreadsheatId, type: 'cols-error', colsError: diffRows}])
    }
}


Meteor.methods({
    replacePlaceholders: function (doc) {
        //TODO check if template file was found if not tell user
        const template = AdTemplates.collection.findOne(doc.adTemplateId);
        //TODO check if excel file was found if not tell user
        const data = Data.collection.findOne(doc.spreadsheetId);
        var fs = Npm.require('fs');
        var htmlFile = fs.readFileSync(template.path, 'utf8');

        let output;
        const excel2JsonSync = Meteor.wrapAsync(excel2Json);
        try {
            output = excel2JsonSync(data.path);
            validateJsonFromExcel(output, doc.spreadsheetId);
        } catch (e) {
            //Data.remove({_id: doc.spreadsheetId});
            throw e;
        }

        const array = output[Object.keys(output)[0]];
        const regex = /{(publisher|campaign|keyword\d+|keyword_no_spaces\d+|domain\d+|ad_name|other_info|title)}/g
        const matches = htmlFile.match(regex);
        // console.log(matches);
        matches.forEach(match => {
            const matchedPos = match.search(/(\d+)/i);
            if (matchedPos >= 0) {
                const headerName = match.substring(1, matchedPos);
                const num = match.split('')[matchedPos];
                // console.log(match, array[num][headerName]);
                // console.log(match,match.length);
                htmlFile = htmlFile.replace(new RegExp(match, 'g'), array[num][headerName]);
            } else {
                // console.log(match, array[0][match.substring(1, match.length - 1)]);
                htmlFile = htmlFile.replace(match, array[0][match.substring(1, match.length - 1)]);
            }
        });

        console.log(htmlFile);

        /**
         *
         * if(publisher == global){
         *     if(publisher is without number){
         *         take value from object a replace
         *     }
         *
         * }
         * ....
         *
         *
         *
         *
         *
         */

    }
});
 
