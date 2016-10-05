var simpleReplace = require('simple-replace');
var excel2Json = require('node-excel-to-json');
import {validateSpreadsheet} from  '../both/validations.js';
import writeFile from 'write';

Meteor.methods({
    replacePlaceholders: function (doc) {

        const generatedAd = GeneratedAds.find({meta: {}});

        //TODO check if template file was found if not tell user
        const adTemplate = AdTemplates.collection.findOne(doc.adTemplateId);
        //TODO check if excel file was found if not tell user
        const adData = AdData.collection.findOne(doc.spreadsheetId);
        var fs = Npm.require('fs');
        var htmlFile = fs.readFileSync(adTemplate.path, 'utf8');
        const res = validateSpreadsheet(adData.path);
        if (res.name !== 'ok') {
            throw new Meteor.Error('spreadsheet validation', res);
        }
        const array = res.data;
        const regex = /{(publisher|campaign|keyword\d+|keyword_no_spaces\d+|domain\d+|ad_name|other_info|title)}/g
        const matches = htmlFile.match(regex);
        matches.forEach(match => {
            const matchedPos = match.search(/(\d+)/i);
            if (matchedPos >= 0) {
                const headerName = match.substring(1, matchedPos);
                const num = match.split('')[matchedPos];
                htmlFile = htmlFile.replace(new RegExp(match, 'g'), array[num - 1][headerName]);
            } else {
                htmlFile = htmlFile.replace(match, array[0][match.substring(1, match.length - 1)]);
            }
        });

        //TODO valid just for hardcoded placehoders {ad_name}-{campaign}-size.html
        const fileName = array[0]['ad_name'] + '-' + array[0]['campaign'] + '-' + adTemplate.resolution + '.html';
        const savingPath = Meteor.settings.private.generatedAdsPath + fileName;
        //write result into FS
        writeFile.sync(savingPath, htmlFile);
        //add file reference into db
        GeneratedAds.addFile(savingPath, {
            fileName: fileName,
            type: 'text/html',
            meta: {
                created: new Date(),
                adTemplateId: adTemplate._id,
                dataId: adData._id
            }
        }, (err)=> {
            if (err) {
                throw new Meteor.Error('Generated Add could not be added to FilesCollection \'GeneratedAds\'');
            }
        });
    }
});

 
