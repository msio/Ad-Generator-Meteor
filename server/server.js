var simpleReplace = require('simple-replace');
var excel2Json = require('node-excel-to-json');
import {validateSpreadsheet} from  '../both/validations.js';
import writeFile from 'write';

Meteor.methods({
    replacePlaceholders: function (doc) {
        //TODO check if template file was found if not tell user
        const template = AdTemplates.collection.findOne(doc.adTemplateId);
        //TODO check if excel file was found if not tell user
        const data = Data.collection.findOne(doc.spreadsheetId);
        var fs = Npm.require('fs');
        var htmlFile = fs.readFileSync(template.path, 'utf8');
        const res = validateSpreadsheet(data.path);
        if (res.name !== 'ok') {
            throw new Meteor.Error('spreadsheet validation', res);
        }
        const array = res.data;
        const regex = /{(publisher|campaign|keyword\d+|keyword_no_spaces\d+|domain\d+|ad_name|other_info|title)}/g
        const matches = htmlFile.match(regex);
        console.log(array);
        matches.forEach(match => {
            const matchedPos = match.search(/(\d+)/i);
            if (matchedPos >= 0) {
                const headerName = match.substring(1, matchedPos);
                const num = match.split('')[matchedPos];
                htmlFile = htmlFile.replace(new RegExp(match, 'g'), array[num -1][headerName]);
            } else {
                // console.log(match, array[0][match.substring(1, match.length - 1)]);
                htmlFile = htmlFile.replace(match, array[0][match.substring(1, match.length - 1)]);
            }
        });

        // ResultAds.

        const writelFileSync = Meteor.async(writeFile);
        // write


        writeFile('/Users/Msio/adTemplating/results/test.html',htmlFile,function (err) {

        });

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

 
