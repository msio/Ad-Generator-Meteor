var simpleReplace = require('simple-replace');
var excel2Json = require('node-excel-to-json');
import {validateJsonFromExcel} from  '../both/validations.js';


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

Meteor.methods({
    validateExcel: function (doc) {
        let output;
        const excel2JsonSync = Meteor.wrapAsync(excel2Json);
        try {
            output = excel2JsonSync(doc.path);
            validateJsonFromExcel(output);
        } catch (e) {
            //Data.remove({_id: doc.spreadsheetId});
            throw e;
        }
    }
})
 
