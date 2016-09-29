var simpleReplace = require('simple-replace');
var excel2Json = require('node-excel-to-json');
import {_} from 'lodash';

const columns = ['publisher', 'camapign', 'keyword', 'keyword_no_space', 'domain', 'ad_name', 'other_Info', 'title'];

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

    //check if there are missing cols
    const defeinedObjKeys = Object.keys(array[0]);
    let colsError = [];
    let colsErrorType;
    array.forEach((elem, idx)=> {
        const curObjKeys = Object.keys(elem);
        //spreadsheet begins with 1
        if (curObjKeys.length < columns.length) {
            colsErrorType = 'missing-cols';
        } else if (curObjKeys.length > columns.length) {
            colsErrorType = 'invalid-cols';
        }
        if (curObjKeys.length != columns.length) {
            colsError.push({cols: difference(columns, curObjKeys), rowIndex: idx++});
        }
    });

    if (!_.isEmpty(colsError)) {
        throw new ValidationError([{name: 'excel-data', sId: spreadsheatId, type: 'missing-columns'}])
    }
}


Meteor.methods({
    replacePlaceholders: function (doc) {
        const template = Templates.collection.findOne(doc.templateId);
        const data = Data.collection.findOne(doc.spreadsheetId);
        var fs = Npm.require('fs');
        var htmlFile = fs.readFileSync(template.path, 'utf8');

        /*
         let tempMatch = regex.exec(htmlFile);
         let matches = []
         while (tempMatch != null) {
         matches.push(tempMatch[1]);
         tempMatch = regex.exec(htmlFile);
         }*/
        let output;
        const excel2JsonSync = Meteor.wrapAsync(excel2Json);
        try {
            output = excel2JsonSync(data.path);
            validateJsonFromExcel(output, doc.spreadsheetId);
        } catch (e) {
            Data.remove({_id: doc.spreadsheetId});
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

        // console.log(htmlFile);

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


        /*Images.write(simpleReplace(htmlFile, data), {
         fileName: 'replaced.html',
         type: 'text/html'
         }, function (error, fileRef) {
         if (error) {
         throw error;
         } else {
         return fileRef
         }
         })*/
    }
});
 
