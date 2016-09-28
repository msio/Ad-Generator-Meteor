var simpleReplace = require('simple-replace');
var excel2Json = require('node-excel-to-json');
import {_} from 'lodash';
import stringSearcher from 'string-search';

/**
 * validates json object that represents spreadsheet table. spreadsheet has to be complete.
 * All columns have to be filled
 *
 * @param json valid json object
 * example:
 * {sheet: 1 [{name: test1 }, {name: test 2 }]}
 */
function validateJsonFromExcel(json) {
    if (!_.isPlainObject(json) || _.isEmpty(json)) {
        throw new Meteor.Error('excel-json-validation', 'output from excel2Json is invalid object');
    }
    //check if there is more than 1 sheet in file
    const jsonObjKeys = Object.keys(json);
    if (jsonObjKeys.length > 1) {
        throw new Meteor.Error('excel-data', 'There are more than 1 sheets in file');
    }
    //check if spreadsheet is empty
    const array = json[jsonObjKeys[0]];
    if (_.isArray(array) && _.isEmpty(array)) {
        throw new Meteor.Error('excel-data', 'spreadsheet is empty');
    }
    //check if any col header is not empty => property name == undefined
    let i = 1;
    //TODO check if header names are same
    _.forEach(array[0], (value, key)=> {
        if (key === 'undefined') {
            throw new Meteor.Error('excel-data', 'column ' + i + ' has no header name');
        }
        i++;
    });

    //valid number of rows in columns => number of properties in biggest object
    let biggestObj = {};
    array.forEach(elem => {
        const curObjLen = Object.keys(elem).length;
        const biggestObjLen = Object.keys(biggestObj).length;
        biggestObj = curObjLen > biggestObjLen ? elem : biggestObj;
    });

    //check if there are missing cols
    const biggestObjKeys = Object.keys(biggestObj);
    let invalidCols = [];
    array.forEach((elem, idx)=> {
        const curObjKeys = Object.keys(elem);
        if (curObjKeys.length < biggestObjKeys.length) {
            //spreadsheet begins with 1
            idx++;
            invalidCols.push(idx + ' - ' + _.difference(biggestObjKeys, curObjKeys));
        }
    });

    if (!_.isEmpty(invalidCols)) {
        throw new Meteor.Error('excel-data', 'There are missing data: ' + invalidCols);
    }
}


Meteor.methods({
    replacePlaceholders: function (doc) {
        var template = Templates.collection.findOne(doc.template);
        var data = Data.collection.findOne(doc.data);
        var fs = Npm.require('fs');
        // file originally saved as public/data/taxa.csv
        var htmlFile = fs.readFileSync(template.path, 'utf8');
        //var data = fs.readFileSync(data.path, 'utf8');
        const placeholderRegex = /(?:\$\{([^}]+)+\})+?/g;
        let tempMatch = placeholderRegex.exec(htmlFile);
        let matches = []
        while (tempMatch != null) {
            matches.push(match[1]);
            tempMatch = placeholderRegex.exec(htmlFile);
        }
        excel2Json(data.path, function (err, output) {
            if (err) {
                console.log('RRRRRRReplace', err);
                throw Meteor.Error('excel2Json', err);
            }
            console.log(output);
            validateJsonFromExcel(output);


        });

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
 
